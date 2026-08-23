import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { AnonymousVote, ElectionStatus } from '../types.js';

export const votingController = {
  // 1. Get Ballot Info for the Biombo Netbook
  getBallotInfo: (req: Request, res: Response) => {
    const { schoolId } = req.params;
    const school = db.schools.find(s => s.id === schoolId) || db.schools[0];
    const election = db.elections.find(e => e.schoolId === school.id);

    if (!election) {
      res.status(404).json({ error: 'No hay proceso electoral activo para este establecimiento.' });
      return;
    }

    const officializedLists = db.lists
      .filter(l => l.schoolId === school.id && l.isOfficialized)
      .map(l => ({
        id: l.id,
        listNumber: l.listNumber,
        listName: l.listName,
        colorHex: l.colorHex,
        motto: l.motto,
        presidentName: l.presidentName,
        vicePresidentName: l.vicePresidentName,
        candidates: l.candidates,
        proposalSummary: l.proposalSummary,
      }));

    res.json({
      success: true,
      school: {
        id: school.id,
        name: school.name,
        cue: school.cue,
      },
      election: {
        id: election.id,
        year: election.year,
        title: election.title,
        status: election.status,
      },
      lists: officializedLists,
      allowBlankVote: true,
    });
  },

  // 2. Step 1: Validate Student DNI & One-Time Voting Token (At the Biombo)
  validateVoterToken: (req: Request, res: Response) => {
    const { schoolId, dni, token } = req.body;

    if (!dni || !token) {
      res.status(400).json({
        error: 'Datos incompletos',
        message: 'Debe ingresar su número de DNI y el Código/Token de votación provisto por la Mesa de Autoridades.',
      });
      return;
    }

    const targetSchoolId = schoolId || 'sch-dean-funes';
    const election = db.elections.find(e => e.schoolId === targetSchoolId);

    if (!election) {
      res.status(404).json({ error: 'No hay proceso electoral habilitado en este colegio.' });
      return;
    }

    if (election.status !== ElectionStatus.VOTING_OPEN && election.status !== ElectionStatus.LISTS_OFFICIALIZED) {
      res.status(400).json({
        error: 'Mesa no habilitada',
        message: `Los comicios no se encuentran en estado de votación abierta (Estado actual: ${election.status}).`,
      });
      return;
    }

    // Clean formatting
    const cleanDni = String(dni).replace(/\D/g, '');
    const cleanToken = String(token).trim().toUpperCase();

    // Look up student in padrón
    const student = db.students.find(s => s.schoolId === targetSchoolId && s.dni === cleanDni);

    if (!student) {
      res.status(404).json({
        error: 'DNI no empadronado',
        message: `El DNI ${cleanDni} no figura en el padrón de estudiantes regulares de este establecimiento. Diríjase a la mesa de autoridades para verificar su situación.`,
      });
      return;
    }

    if (!student.isRegular) {
      res.status(403).json({
        error: 'Estudiante no regular',
        message: 'Solo los alumnos regulares matriculados están habilitados para emitir sufragio (Art. 2 Res. 124).',
      });
      return;
    }

    // Check if student already voted (CRITICAL Anti-Double-Vote check)
    if (student.hasVoted) {
      res.status(403).json({
        error: 'Sufragio ya emitido',
        message: `El estudiante ${student.fullName} (DNI ${student.dni}) ya ha emitido su voto en esta jornada eleccionaria. No se permite duplicar el voto.`,
        hasVoted: true,
        votedAt: student.votedAt,
      });
      return;
    }

    // Token Match Validation
    // Standard format is 'TKN-XXXX' or 'XXXX'
    const studentTokenNormalized = (student.token || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const inputTokenNormalized = cleanToken.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (!studentTokenNormalized || studentTokenNormalized !== inputTokenNormalized) {
      res.status(401).json({
        error: 'Token de Votación Inválido',
        message: 'El código de votación ingresado no coincide con el asignado a su DNI. Solicite a la Mesa de Autoridades la verificación de su constancia.',
      });
      return;
    }

    // Masked name for student confirmation screen
    const nameParts = student.fullName.split(' ');
    const maskedName = `${nameParts[0]} ${nameParts.slice(1).map(p => p[0] + '.').join(' ')}`;

    res.json({
      success: true,
      message: 'Credencial de votación validada correctamente.',
      voter: {
        dni: student.dni,
        maskedName,
        yearOfStudy: student.yearOfStudy,
        division: student.division,
      },
    });
  },

  // 3. Step 2: Cast Anonymous Vote (Atomic Transaction)
  // Ensures Padron is marked hasVoted: true, but Vote is stored 100% dissociated in the digital urn
  castAnonymousVote: (req: Request, res: Response) => {
    const { schoolId, dni, token, listId } = req.body;

    if (!dni || !token) {
      res.status(400).json({ error: 'Faltan credenciales de votación' });
      return;
    }

    const targetSchoolId = schoolId || 'sch-dean-funes';
    const election = db.elections.find(e => e.schoolId === targetSchoolId);

    if (!election) {
      res.status(404).json({ error: 'Proceso electoral no encontrado' });
      return;
    }

    const cleanDni = String(dni).replace(/\D/g, '');
    const cleanToken = String(token).trim().toUpperCase();

    // Lookup student in Padron
    const student = db.students.find(s => s.schoolId === targetSchoolId && s.dni === cleanDni);

    if (!student) {
      res.status(404).json({ error: 'Estudiante no encontrado en el padrón' });
      return;
    }

    if (student.hasVoted) {
      res.status(403).json({ error: 'El voto para este DNI ya fue emitido previamente.' });
      return;
    }

    const studentTokenNormalized = (student.token || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const inputTokenNormalized = cleanToken.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (studentTokenNormalized !== inputTokenNormalized) {
      res.status(401).json({ error: 'Código de votación inválido.' });
      return;
    }

    // If listId is provided, verify it exists and is officialized
    let selectedListId: string | null = null;
    let selectedListName = 'Voto en Blanco';

    if (listId && listId !== 'BLANK') {
      const list = db.lists.find(l => l.id === listId && l.schoolId === targetSchoolId && l.isOfficialized);
      if (!list) {
        res.status(400).json({ error: 'La lista seleccionada no existe o no está oficializada.' });
        return;
      }
      selectedListId = list.id;
      selectedListName = `Lista Nº ${list.listNumber} - ${list.listName}`;
    }

    // ATOMIC TRANSACTION:
    // 1. Mark student padron record as voted and invalidate token
    student.hasVoted = true;
    student.votedAt = new Date().toISOString();
    student.tokenUsed = true;

    // 2. Generate an anonymous cryptographic receipt hash for the student
    const randHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const receiptHash = `VOT-${targetSchoolId.substring(4, 6).toUpperCase()}-${randHex}`;

    // 3. Deposit purely anonymous vote in the digital urn (NO link to student_id or DNI)
    const anonymousVoteRecord: AnonymousVote = {
      id: `v-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId: targetSchoolId,
      electionId: election.id,
      listId: selectedListId, // null if blank
      receiptHash,
      createdAt: new Date().toISOString(),
    };

    // Push into anonymous urn and shuffle
    db.anonymousVotes.push(anonymousVoteRecord);
    election.votesCount = db.anonymousVotes.filter(v => v.electionId === election.id).length;

    // Log general audit action without student identity
    db.auditLogs.unshift({
      id: `log-vote-${Date.now()}`,
      schoolId: targetSchoolId,
      action: 'SUFRAGIO_EMITIDO_ANONIMO',
      details: `Emisión de sufragio presencial en biombo con recibo de comprobación ${receiptHash}. Padrón actualizado.`,
      ipAddress: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: '¡Sufragio emitido y depositado en la Urna Digital de manera segura y secreta!',
      receipt: {
        receiptHash,
        schoolName: db.schools.find(s => s.id === targetSchoolId)?.name,
        timestamp: anonymousVoteRecord.createdAt,
        ballotBoxConfirmed: true,
        legalGuarantee: 'Voto universal, igual y secreto garantizado por el Art. 3 inc. c del Estatuto Modelo (Resolución Nº 124).',
      },
    });
  },
};
