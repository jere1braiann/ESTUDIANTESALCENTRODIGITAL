import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { db } from '../db/store.js';
import { ElectionStatus, Student, ElectoralList, Candidate, Role } from '../types.js';

export const adminJuntaController = {
  // Get Junta Overview
  getJuntaOverview: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId || 'sch-dean-funes';
    const election = db.elections.find(e => e.schoolId === schoolId);
    const juntaMembers = db.juntaMembers.filter(jm => jm.schoolId === schoolId);
    const padron = db.students.filter(s => s.schoolId === schoolId);
    const lists = db.lists.filter(l => l.schoolId === schoolId);
    const votes = election ? db.anonymousVotes.filter(v => v.electionId === election.id) : [];

    const votedCount = padron.filter(s => s.hasVoted).length;
    const tokensGenerated = padron.filter(s => s.token).length;

    res.json({
      success: true,
      data: {
        election,
        juntaMembers,
        padronCount: padron.length,
        votedCount,
        tokensGenerated,
        listsCount: lists.length,
        officializedListsCount: lists.filter(l => l.isOfficialized).length,
        votesCount: votes.length,
        isDisolved: election?.juntaDisolved ?? false,
      },
    });
  },

  // Junta 5 Members Validation (Art. 25 Res. 124)
  getJuntaMembers: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId || 'sch-dean-funes';
    const members = db.juntaMembers.filter(jm => jm.schoolId === schoolId);

    // Validate Art. 25: 5 students from the last two years
    const has5Members = members.length === 5;
    const allFromLastTwoYears = members.every(m => m.yearOfStudy >= 5);

    res.json({
      success: true,
      data: members,
      validation: {
        isValidCount: has5Members,
        isValidYears: allFromLastTwoYears,
        compliantWithArt25: has5Members && allFromLastTwoYears,
        statuteNote: 'Art. 25: La Junta Electoral se integrará con 5 estudiantes pertenecientes a los 2 últimos años del Plan de Estudios.',
      },
    });
  },

  // Padron Management
  getPadron: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId || 'sch-dean-funes';
    const { year, division, search, status } = req.query;

    let list = db.students.filter(s => s.schoolId === schoolId);

    if (year && Number(year) > 0) {
      list = list.filter(s => s.yearOfStudy === Number(year));
    }
    if (division && typeof division === 'string' && division !== 'ALL') {
      list = list.filter(s => s.division === division);
    }
    if (status === 'VOTED') {
      list = list.filter(s => s.hasVoted);
    } else if (status === 'PENDING') {
      list = list.filter(s => !s.hasVoted);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(s => s.dni.includes(q) || s.fullName.toLowerCase().includes(q));
    }

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  },

  addStudentToPadron: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId || 'sch-dean-funes';
    const { dni, fullName, yearOfStudy, division, shift } = req.body;

    if (!dni || !fullName || !yearOfStudy || !division) {
      res.status(400).json({ error: 'Todos los datos del alumno son requeridos' });
      return;
    }

    const existing = db.students.find(s => s.schoolId === schoolId && s.dni === dni);
    if (existing) {
      res.status(400).json({ error: `El estudiante con DNI ${dni} ya figura en el padrón electoral.` });
      return;
    }

    // Generate random 4-digit token
    const tokenRandom = Math.floor(1000 + Math.random() * 9000);
    const newStudent: Student = {
      id: `st-${Date.now()}`,
      schoolId,
      dni,
      fullName,
      yearOfStudy: Number(yearOfStudy),
      division,
      shift: shift || 'Mañana',
      isRegular: true,
      hasVoted: false,
      votedAt: null,
      token: `TKN-${tokenRandom}`,
      tokenUsed: false,
    };

    db.students.push(newStudent);

    // Update election padron count
    const election = db.elections.find(e => e.schoolId === schoolId);
    if (election) {
      election.padronCount = db.students.filter(s => s.schoolId === schoolId).length;
    }

    res.status(201).json({
      success: true,
      message: `Estudiante ${fullName} incorporado al padrón. Token generado: ${newStudent.token}`,
      data: newStudent,
    });
  },

  // Bulk Generate Tokens for entire Padron
  generateAllVotingTokens: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId || 'sch-dean-funes';
    const students = db.students.filter(s => s.schoolId === schoolId);

    let generatedCount = 0;
    students.forEach(st => {
      if (!st.token) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        st.token = `TKN-${rand}`;
        generatedCount++;
      }
    });

    res.json({
      success: true,
      message: `Se han generado y asegurado ${students.length} tokens de votación de un solo uso para la Mesa de Autoridades.`,
      generatedCount,
      totalPadron: students.length,
    });
  },

  // Lists & Candidates Management (Art. 28)
  getLists: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId || 'sch-dean-funes';
    const lists = db.lists.filter(l => l.schoolId === schoolId);
    const padronTotal = db.students.filter(s => s.schoolId === schoolId).length;
    const requiredEndorsements = Math.ceil(padronTotal * 0.1); // 10% Art. 28

    const enrichedLists = lists.map(l => ({
      ...l,
      requiredEndorsements,
      hasRequiredEndorsements: l.endorserCount >= requiredEndorsements,
      // Prevención de acefalía check
      acefaliaCompliant: l.presidentYear < 6 || l.vicePresidentYear < 6,
    }));

    res.json({
      success: true,
      padronTotal,
      requiredEndorsements10Percent: requiredEndorsements,
      data: enrichedLists,
    });
  },

  createList: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId || 'sch-dean-funes';
    const election = db.elections.find(e => e.schoolId === schoolId);
    const { listNumber, listName, colorHex, motto, presidentName, presidentYear, vicePresidentName, vicePresidentYear, endorserCount, proposalSummary } = req.body;

    if (!listNumber || !listName || !presidentName || !vicePresidentName) {
      res.status(400).json({ error: 'Faltan datos obligatorios de la lista' });
      return;
    }

    const padronTotal = db.students.filter(s => s.schoolId === schoolId).length;
    const requiredEndorsements = Math.max(1, Math.ceil(padronTotal * 0.1));

    const newList: ElectoralList = {
      id: `lst-${Date.now()}`,
      schoolId,
      electionId: election ? election.id : 'elec-deanfunes-2026',
      listNumber: Number(listNumber),
      listName,
      colorHex: colorHex || '#2563EB',
      motto: motto || '',
      presidentName,
      presidentYear: Number(presidentYear),
      vicePresidentName,
      vicePresidentYear: Number(vicePresidentYear),
      endorserCount: Number(endorserCount) || 0,
      requiredEndorsements,
      isOfficialized: false,
      proposalSummary: proposalSummary || '',
      candidates: [
        { id: `c-${Date.now()}-1`, listId: `lst-${Date.now()}`, fullName: presidentName, dni: '47000000', yearOfStudy: Number(presidentYear), division: 'A', position: 'Presidente', isSubstitute: false },
        { id: `c-${Date.now()}-2`, listId: `lst-${Date.now()}`, fullName: vicePresidentName, dni: '47000001', yearOfStudy: Number(vicePresidentYear), division: 'B', position: 'Vicepresidente', isSubstitute: false },
      ],
    };

    db.lists.push(newList);

    res.status(201).json({
      success: true,
      message: `Lista Nº ${listNumber} "${listName}" inscripta. Requiere al menos ${requiredEndorsements} avales para su oficialización (Art. 28).`,
      data: newList,
    });
  },

  officializeList: (req: AuthenticatedRequest, res: Response) => {
    const { listId } = req.params;
    const list = db.lists.find(l => l.id === listId);

    if (!list) {
      res.status(404).json({ error: 'Lista no encontrada' });
      return;
    }

    const padronTotal = db.students.filter(s => s.schoolId === list.schoolId).length;
    const requiredEndorsements = Math.ceil(padronTotal * 0.1);

    // Validation Art. 28: 10% endorsement
    if (list.endorserCount < requiredEndorsements) {
      res.status(400).json({
        error: 'Avales insuficientes para oficialización',
        message: `La lista cuenta con ${list.endorserCount} avales de los ${requiredEndorsements} requeridos por el Art. 28 inc. d del Estatuto (10% del padrón de ${padronTotal} estudiantes).`,
      });
      return;
    }

    // Validation Art. 17: Acefalía
    if (list.presidentYear >= 6 && list.vicePresidentYear >= 6) {
      res.status(400).json({
        error: 'Incumplimiento de Prevención de Acefalía',
        message: 'Art. 17: Al menos uno de los integrantes de la fórmula principal (Presidente o Vicepresidente) no debe pertenecer al último año lectivo.',
      });
      return;
    }

    list.isOfficialized = true;
    list.officializedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Lista Nº ${list.listNumber} "${list.listName}" OFICIALIZADA por la Junta Electoral para integrar las boletas del sufragio (Art. 26 inc. a).`,
      data: list,
    });
  },

  // Escrutinio & Reparto Proporcional de Minorías (Art. 30)
  getScrutinyAndMinorities: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId || 'sch-dean-funes';
    const election = db.elections.find(e => e.schoolId === schoolId);

    if (!election) {
      res.status(404).json({ error: 'No hay proceso electoral para este colegio' });
      return;
    }

    const results = db.calculateScrutinyResults(schoolId, election.id);

    res.json({
      success: true,
      electionStatus: election.status,
      isDisolved: election.juntaDisolved,
      data: results,
      statutoryReference: {
        article: 'Art. 30 - Sistema de Representación Proporcional de Minorías',
        text: 'En cada elección se utilizará un sistema de representación proporcional que garantice la participación de las minorías, cuando estas superen un piso del 20% de los votos válidos emitidos. En este último caso, se les adjudicará un tercio de las Secretarías de la Comisión Directiva.',
      },
    });
  },

  // Official Proclamation of Authorities & Auto-Dissolution of Junta (Art. 34 & 35)
  proclaimElectionAndDissolve: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId || 'sch-dean-funes';
    const election = db.elections.find(e => e.schoolId === schoolId);

    if (!election) {
      res.status(404).json({ error: 'Proceso electoral no encontrado' });
      return;
    }

    const results = db.calculateScrutinyResults(schoolId, election.id);
    const now = new Date().toISOString();

    election.status = ElectionStatus.PROCLAIMED;
    election.juntaDisolved = true;
    election.disolvedAt = now;
    election.results = results;

    // Automatically expire/dissolve credentials of ADMIN_JUNTA for this school (Art. 35)
    const juntaUsers = db.users.filter(u => u.schoolId === schoolId && u.role === Role.ADMIN_JUNTA);
    juntaUsers.forEach(u => {
      u.expiresAt = now; // Expired immediately
      u.isActive = false; // Revoked
    });

    // Create an official Proclamation Acta in Libro de Actas
    const schoolActas = db.minutes.filter(m => m.schoolId === schoolId);
    const winner = results.listResults[0];

    const proclamationActa = {
      id: `acta-proclamacion-${Date.now()}`,
      schoolId,
      actNumber: schoolActas.length + 1,
      title: `Acta de Proclamación Definitiva de Autoridades - Comicios ${election.year}`,
      type: 'Junta Electoral' as const,
      date: new Date().toISOString().split('T')[0],
      location: 'Establecimiento Educativo - Dirección',
      attendeesCount: results.totalVotesCast,
      quorumReached: true,
      agendaTopics: `Escrutinio Definitivo, Aplicación del Sistema de Minorías (Art. 30), Proclamación de Autoridades (Art. 34) y Disolución Estatutaria de la Junta Electoral (Art. 35).`,
      content: `En la sede del establecimiento, finalizado el escrutinio sobre un total de ${results.totalVotesCast} votos emitidos (${results.validVotes} votos válidos y ${results.blankVotes} en blanco), habiendo participado el ${results.turnoutPercentage}% del padrón, se proclama ganadora a la Lista Nº ${winner?.listNumber} "${winner?.listName}". Habiendo cumplido estrictamente con el cometido encomendado y rubricadas las constancias para Dirección, se declara formalmente DISUELTA la presente Junta Electoral.`,
      resolutions: `1. Proclamar a ${winner?.listName} en la conducción del Centro de Estudiantes. 2. Distribuir las Secretarías conforme al cómputo de minorías (Art. 30). 3. Proceder a la disolución de pleno derecho de la Junta Electoral (Art. 35).`,
      signedByPresident: true,
      signedByActasSecretary: true,
      signedByAdvisorTeacher: true,
      createdAt: now,
    };

    db.minutes.unshift(proclamationActa);

    res.json({
      success: true,
      message: '¡Autoridades proclamadas exitosamente! Se labró el Acta Definitiva en el Libro de Actas y la Junta Electoral queda legalmente DISUELTA conforme al Art. 35 del Estatuto. Sus credenciales han caducado de pleno derecho.',
      proclamationActa,
      results,
      juntaDisolved: true,
    });
  },
};
