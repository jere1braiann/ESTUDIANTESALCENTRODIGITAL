import { Router } from 'express';
import { Role } from '../types.js';
import { db } from '../db/store.js';
import { publicController } from '../controllers/publicController.js';
import { superadminController } from '../controllers/superadminController.js';
import { adminCDController } from '../controllers/adminCDController.js';
import { adminJuntaController } from '../controllers/adminJuntaController.js';
import { votingController } from '../controllers/votingController.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================
apiRouter.post('/auth/login', (req, res) => {
  const { username, role } = req.body;
  let user = db.users.find(u => u.username === username);

  if (!user && role) {
    user = db.users.find(u => u.role === role);
  }

  if (!user) {
    user = db.users[0];
  }

  const school = db.schools.find(s => s.id === user?.schoolId);
  const election = db.elections.find(e => e.schoolId === user?.schoolId);

  res.json({
    success: true,
    token: user.id,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: school?.name,
      isActive: user.isActive,
      expiresAt: user.expiresAt,
      isJuntaDisolved: user.role === Role.ADMIN_JUNTA && election ? election.juntaDisolved : false,
    },
  });
});

apiRouter.get(['/auth/users', '/superadmin/users'], (req, res) => {
  const usersWithSchools = db.users.map(u => {
    const s = db.schools.find(school => school.id === u.schoolId);
    const election = db.elections.find(e => e.schoolId === u.schoolId);
    return {
      ...u,
      schoolName: s?.name || 'Gobierno de la Provincia de Córdoba',
      isJuntaDisolved: u.role === Role.ADMIN_JUNTA && election ? election.juntaDisolved : false,
    };
  });
  res.json({ success: true, users: usersWithSchools, data: usersWithSchools });
});

// ==========================================
// 2. PUBLIC PORTAL & NEWS FORUM
// ==========================================
apiRouter.get('/public/news', publicController.getNews);
apiRouter.get('/public/news/:id', publicController.getNewsById);
apiRouter.post(['/public/news', '/public/news/submit'], publicController.submitNews);
apiRouter.get('/public/schools', publicController.getSchools);
apiRouter.post(['/public/schools/request', '/public/schools/enroll'], publicController.requestSchoolEnrollment);

// ==========================================
// 3. SUPERADMIN (SOPORTE PROVINCIAL)
// ==========================================
apiRouter.get('/superadmin/stats', superadminController.getDashboardStats);
apiRouter.get('/superadmin/schools', superadminController.getSchools);
apiRouter.patch('/superadmin/schools/:schoolId/status', superadminController.updateSchoolStatus);
apiRouter.get('/superadmin/news-queue', superadminController.getNewsQueue);
apiRouter.patch(['/superadmin/news/:newsId', '/superadmin/news/:newsId/status'], superadminController.moderateNews);
apiRouter.post(['/superadmin/notices', '/superadmin/provincial-notice'], superadminController.createProvincialNotice);
apiRouter.post('/superadmin/credentials', superadminController.createCredential);

// ==========================================
// 4. ADMIN CD (CENTRO DE ESTUDIANTES)
// ==========================================
apiRouter.get('/cd/overview', adminCDController.getCDOverview);
apiRouter.post(['/cd/validate-formula', '/cd/formula-validate'], (req, res) => adminCDController.validateComisionDirectiva(req, res));
apiRouter.get('/cd/actas', (req, res) => {
  const actas = db.minutes.sort((a, b) => b.actNumber - a.actNumber);
  res.json({ success: true, actas, data: actas });
});
apiRouter.post('/cd/actas', (req, res) => {
  const { title, type, date, location, attendeesCount, quorumReached, agendaTopics, content, resolutions, signedByAdvisorTeacher } = req.body;
  const nextActNumber = db.minutes.length + 1;
  const newActa = {
    id: `acta-${Date.now()}`,
    schoolId: 'sch-dean-funes',
    actNumber: nextActNumber,
    title: title || `Acta de Sesión Nº ${nextActNumber}`,
    type: (type || 'Comisión Directiva') as 'Ordinaria' | 'Extraordinaria' | 'Asamblea General' | 'Comisión Directiva' | 'Junta Electoral',
    date: date || new Date().toISOString().split('T')[0],
    location: location || 'Sala de Reuniones',
    attendeesCount: Number(attendeesCount) || 12,
    quorumReached: quorumReached ?? true,
    agendaTopics: agendaTopics || 'Orden del día',
    content: content || 'Desarrollo de la sesión...',
    resolutions: resolutions || 'Se da por aprobada la moción.',
    signedByPresident: true,
    signedByActasSecretary: true,
    signedByAdvisorTeacher: signedByAdvisorTeacher ?? true,
    createdAt: new Date().toISOString(),
  };
  db.minutes.unshift(newActa);
  res.status(201).json({ success: true, acta: newActa, data: newActa });
});
apiRouter.patch('/cd/actas/:actaId/sign-advisor', (req, res) => {
  const acta = db.minutes.find(m => m.id === req.params.actaId);
  if (acta) {
    acta.signedByAdvisorTeacher = true;
    res.json({ success: true, acta, data: acta });
  } else {
    res.status(404).json({ success: false, message: 'Acta no encontrada' });
  }
});

apiRouter.get('/cd/finances', (req, res) => {
  const finances = db.finances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json({ success: true, finances, data: finances });
});
apiRouter.post('/cd/finances', (req, res) => {
  const { type, category, amount, description, date, receiptNumber } = req.body;
  const newEntry = {
    id: `fin-${Date.now()}`,
    schoolId: 'sch-dean-funes',
    type: (type || 'INGRESO') as 'INGRESO' | 'EGRESO',
    category: category || 'General',
    amount: Number(amount) || 1000,
    description: description || 'Asiento contable',
    date: date || new Date().toISOString().split('T')[0],
    receiptNumber: receiptNumber || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
    registeredBy: 'Secretaría de Finanzas (CD)',
    advisorApproved: false,
    createdAt: new Date().toISOString(),
  };
  db.finances.unshift(newEntry);
  res.status(201).json({ success: true, finance: newEntry, data: newEntry });
});
apiRouter.patch('/cd/finances/:financeId/approve-advisor', (req, res) => {
  const entry = db.finances.find(f => f.id === req.params.financeId);
  if (entry) {
    entry.advisorApproved = true;
    entry.advisorApprovedAt = new Date().toISOString();
    res.json({ success: true, finance: entry, data: entry });
  } else {
    res.status(404).json({ success: false, message: 'Registro no encontrado' });
  }
});
apiRouter.post(['/cd/news-draft', '/cd/news/draft'], adminCDController.submitNewsDraft);

// ==========================================
// 5. ADMIN JUNTA ELECTORAL (TEMPORAL)
// ==========================================
apiRouter.get('/junta/election', (req, res) => {
  const election = db.elections[0];
  res.json({ success: true, election });
});
apiRouter.get('/junta/members', (req, res) => {
  res.json({ success: true, members: db.juntaMembers });
});
apiRouter.get('/junta/padron', (req, res) => {
  res.json({ success: true, padron: db.students });
});
apiRouter.post('/junta/padron', (req, res) => {
  const { dni, fullName, yearOfStudy, division, shift } = req.body;
  const newStudent = {
    id: `std-${Date.now()}`,
    schoolId: 'sch-dean-funes',
    dni,
    fullName,
    yearOfStudy: Number(yearOfStudy),
    division: division || 'A',
    shift: shift || 'Mañana',
    isRegular: true,
    hasVoted: false,
    votedAt: null,
    token: `TK${Math.floor(1000 + Math.random() * 9000)}`,
    tokenUsed: false,
  };
  db.students.push(newStudent);
  res.status(201).json({ success: true, student: newStudent });
});
apiRouter.post(['/junta/generate-tokens', '/junta/padron/generate-tokens'], (req, res) => {
  let count = 0;
  db.students.forEach(st => {
    if (!st.token) {
      st.token = `TK${Math.floor(1000 + Math.random() * 9000)}`;
      count++;
    }
  });
  res.json({ success: true, tokensGenerated: count || db.students.length });
});
apiRouter.get('/junta/lists', (req, res) => {
  res.json({ success: true, lists: db.lists });
});
apiRouter.post('/junta/lists', (req, res) => {
  const { listNumber, listName, colorHex, motto, presidentName, presidentYear, vicePresidentName, vicePresidentYear, endorserCount, proposalSummary } = req.body;
  const newList = {
    id: `list-${Date.now()}`,
    schoolId: 'sch-dean-funes',
    electionId: 'elec-deanfunes-2026',
    listNumber: Number(listNumber) || db.lists.length + 1,
    listName,
    colorHex: colorHex || '#3b82f6',
    motto: motto || 'Por una escuela participativa',
    presidentName,
    presidentYear: Number(presidentYear),
    vicePresidentName,
    vicePresidentYear: Number(vicePresidentYear),
    endorserCount: Number(endorserCount) || 0,
    requiredEndorsements: Math.ceil(db.students.length * 0.1),
    isOfficialized: false,
    candidates: [],
    proposalSummary,
  };
  db.lists.push(newList);
  res.status(201).json({ success: true, list: newList });
});
apiRouter.patch('/junta/lists/:listId/officialize', (req, res) => {
  const list = db.lists.find(l => l.id === req.params.listId);
  if (!list) {
    res.status(404).json({ success: false, message: 'Lista no encontrada' });
    return;
  }
  const minEndorsements = Math.ceil(db.students.length * 0.1);
  if (list.endorserCount < minEndorsements) {
    res.status(400).json({ success: false, message: `No alcanza el 10% obligatorio de avales (${list.endorserCount}/${minEndorsements})` });
    return;
  }
  list.isOfficialized = true;
  list.officializedAt = new Date().toISOString();
  res.json({ success: true, list });
});
apiRouter.post('/junta/lists/:listId/officialize', (req, res) => {
  const list = db.lists.find(l => l.id === req.params.listId);
  if (list) {
    list.isOfficialized = true;
    list.officializedAt = new Date().toISOString();
    res.json({ success: true, list });
  } else {
    res.status(404).json({ success: false, message: 'Lista no encontrada' });
  }
});
apiRouter.get('/junta/scrutiny', adminJuntaController.getScrutinyAndMinorities);
apiRouter.post('/junta/compute-scrutiny', (req, res) => {
  const election = db.elections[0];
  const scrutiny = db.calculateScrutinyResults(election.schoolId, election.id);
  res.json({ success: true, scrutiny });
});
apiRouter.post('/junta/proclaim', (req, res) => {
  const election = db.elections[0];
  election.juntaDisolved = true;
  election.disolvedAt = new Date().toISOString();

  // Create Acta de Proclamación in Libro de Actas
  const actaProclamacion = {
    id: `acta-proclamacion-${Date.now()}`,
    schoolId: election.schoolId,
    actNumber: db.minutes.length + 1,
    title: 'Acta de Proclamación de Autoridades y Disolución de Junta Electoral (Art. 34 y 35)',
    type: 'Junta Electoral' as const,
    date: new Date().toISOString().split('T')[0],
    location: 'Establecimiento Escolar - Mesa de Escrutinio',
    attendeesCount: 5,
    quorumReached: true,
    agendaTopics: 'Escrutinio Definitivo, Adjudicación de Secretarías a Minorías (Art. 30) y Proclamación',
    content: 'En la ciudad de Córdoba, la Junta Electoral labra el acta de proclamación de las nuevas autoridades electas. Concluido este acto, la Junta Electoral se disuelve de pleno derecho conforme al Art. 35 de la Res. 124.',
    resolutions: 'Se proclama la Comisión Directiva electa y cesan las funciones de la Junta Electoral.',
    signedByPresident: true,
    signedByActasSecretary: true,
    signedByAdvisorTeacher: true,
    createdAt: new Date().toISOString(),
  };
  db.minutes.unshift(actaProclamacion);

  res.json({ success: true, message: 'Autoridades proclamadas y Junta Electoral disuelta.', election });
});

// ==========================================
// 6. PRESENTIAL VOTING (NETBOOKS / BIOMBOS)
// ==========================================
apiRouter.get('/voting/ballot/:schoolId', votingController.getBallotInfo);
apiRouter.post('/voting/validate-token', votingController.validateVoterToken);
apiRouter.post(['/voting/cast', '/voting/cast-vote'], (req, res) => {
  const { dni, token, candidateListId } = req.body;

  if (!dni || !token) {
    res.status(400).json({ success: false, message: 'DNI y Token de votación son obligatorios' });
    return;
  }

  const student = db.students.find(s => s.dni === dni.trim());
  if (!student) {
    res.status(404).json({ success: false, message: 'El DNI no figura en el padrón electoral escolar.' });
    return;
  }

  if (student.hasVoted) {
    res.status(400).json({ success: false, message: 'El estudiante ya emitió su sufragio.' });
    return;
  }

  if (student.token?.toUpperCase() !== token.trim().toUpperCase()) {
    res.status(400).json({ success: false, message: 'Token de votación incorrecto o inválido.' });
    return;
  }

  // Mark padron as voted
  student.hasVoted = true;
  student.votedAt = new Date().toISOString();
  student.tokenUsed = true;

  // Deposit in anonymous urn
  const receiptHash = `VOT-DF-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  db.anonymousVotes.push({
    id: `vote-${Date.now()}`,
    schoolId: 'sch-dean-funes',
    electionId: 'elec-deanfunes-2026',
    listId: candidateListId || null,
    receiptHash,
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Sufragio registrado y depositado anónimamente en la urna.',
    receiptHash,
  });
});

// ==========================================
// 7. ARCHITECTURE SPECIFICATION
// ==========================================
apiRouter.get('/architecture/spec', (req, res) => {
  res.json({
    success: true,
    systemName: 'Estudiantes al Centro',
    frameworkLegal: 'Resolución Ministerial Nº 124 / 2010 - Ministerio de Educación de la Provincia de Córdoba',
  });
});
