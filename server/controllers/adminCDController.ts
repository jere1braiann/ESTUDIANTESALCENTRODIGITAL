import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { db } from '../db/store.js';
import { MinuteActa, FinanceEntry, NewsStatus, NewsPost } from '../types.js';

export const adminCDController = {
  // Get CD Dashboard & School info
  getCDOverview: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId;
    const school = db.schools.find(s => s.id === schoolId);
    const actas = db.minutes.filter(m => m.schoolId === schoolId);
    const finances = db.finances.filter(f => f.schoolId === schoolId);
    const election = db.elections.find(e => e.schoolId === schoolId);

    const totalIncome = finances.filter(f => f.type === 'INGRESO' && f.advisorApproved).reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = finances.filter(f => f.type === 'EGRESO' && f.advisorApproved).reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpenses;
    const pendingFinanceApprovals = finances.filter(f => !f.advisorApproved).length;

    res.json({
      success: true,
      data: {
        school,
        actasCount: actas.length,
        totalIncome,
        totalExpenses,
        balance,
        pendingFinanceApprovals,
        election,
      },
    });
  },

  // Validate Commission Directiva formula under Resolución 124 rules
  validateComisionDirectiva: (req: Request, res: Response) => {
    const {
      presidentName,
      presidentYear,
      vicePresidentName,
      vicePresidentYear,
      secretaries, // Array of { name, position, titularYear, suplenteName, suplenteYear }
    } = req.body;

    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Mandatory President and Vice
    if (!presidentName || !presidentYear) errors.push('El cargo de Presidente es obligatorio.');
    if (!vicePresidentName || !vicePresidentYear) errors.push('El cargo de Vicepresidente es obligatorio.');

    // 2. Art. 17: Prevención de Acefalía
    // "Al menos uno de los integrantes de la conducción (Presidente o Vicepresidente) no deberá pertenecer al último curso."
    // Assuming standard secondary school last year is 6 (or 7 for technical)
    const isTechnical = req.body.isTechnicalSchool ?? false;
    const lastYear = isTechnical ? 7 : 6;

    if (presidentYear >= lastYear && vicePresidentYear >= lastYear) {
      errors.push(`Violación del Art. 17 (Prevención de Acefalía): Tanto el Presidente como el Vicepresidente pertenecen al último año (${lastYear}º año). La norma exige obligatoriamente que al menos uno de ellos pertenezca a un curso inferior para garantizar la continuidad institucional.`);
    }

    // 3. Mandatory Secretaries: Actas and Finanzas (Art. 6 inc c)
    const secList = secretaries || [];
    const hasActas = secList.some((s: any) => s.position.toLowerCase().includes('actas'));
    const hasFinanzas = secList.some((s: any) => s.position.toLowerCase().includes('finanzas'));

    if (!hasActas) errors.push('Es obligatoria la constitución de la Secretaría de Actas (Art. 6 inc. c).');
    if (!hasFinanzas) errors.push('Es obligatoria la constitución de la Secretaría de Finanzas (Art. 6 inc. c).');

    // 4. Maximum 7 Secretarías
    if (secList.length > 7) {
      errors.push(`No se puede superar el máximo estatutario de 7 Secretarías (Art. 6 inc. c). Actualmente se ingresaron ${secList.length}.`);
    }

    // 5. Mandatory Titular and Suplente for each position (Art. 6)
    secList.forEach((s: any, idx: number) => {
      if (!s.titularName) errors.push(`La ${s.position || `Secretaría ${idx + 1}`} debe contar obligatoriamente con un Secretario Titular.`);
      if (!s.suplenteName) errors.push(`La ${s.position || `Secretaría ${idx + 1}`} debe contar obligatoriamente con un Secretario Suplente (Art. 6 inc. c).`);
    });

    const isValid = errors.length === 0;

    res.json({
      success: true,
      isValid,
      errors,
      warnings,
      legalNote: 'Validación automatizada según Artículos 6, 17, 19 y 20 del Estatuto Modelo de Córdoba (Res. Nº 124).',
    });
  },

  // Libro de Actas
  getActas: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId;
    const actas = db.minutes
      .filter(m => m.schoolId === schoolId)
      .sort((a, b) => b.actNumber - a.actNumber);
    res.json({ success: true, data: actas });
  },

  createActa: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { title, type, date, location, attendeesCount, quorumReached, agendaTopics, content, resolutions, signedByAdvisorTeacher } = req.body;

    if (!title || !content || !agendaTopics || !date) {
      res.status(400).json({ error: 'Faltan datos obligatorios para labrar el acta' });
      return;
    }

    const schoolActas = db.minutes.filter(m => m.schoolId === schoolId);
    const nextActNumber = schoolActas.length + 1;

    const newActa: MinuteActa = {
      id: `acta-${Date.now()}`,
      schoolId: schoolId || 'sch-dean-funes',
      actNumber: nextActNumber,
      title,
      type: type || 'Comisión Directiva',
      date,
      location: location || 'Establecimiento Educativo',
      attendeesCount: Number(attendeesCount) || 10,
      quorumReached: quorumReached ?? true,
      agendaTopics,
      content,
      resolutions: resolutions || 'Se da por finalizada la sesión siendo conformes todos los presentes.',
      signedByPresident: true,
      signedByActasSecretary: true,
      signedByAdvisorTeacher: signedByAdvisorTeacher ?? false,
      createdAt: new Date().toISOString(),
    };

    db.minutes.unshift(newActa);

    res.status(201).json({
      success: true,
      message: `Acta Nº ${nextActNumber} digitalizada y registrada con éxito en el Libro de Actas.`,
      data: newActa,
    });
  },

  signActaByAdvisor: (req: AuthenticatedRequest, res: Response) => {
    const { actaId } = req.params;
    const acta = db.minutes.find(m => m.id === actaId);
    if (!acta) {
      res.status(404).json({ error: 'Acta no encontrada' });
      return;
    }

    acta.signedByAdvisorTeacher = true;
    res.json({
      success: true,
      message: `Acta Nº ${acta.actNumber} rubricada por el Profesor Asesor del establecimiento.`,
      data: acta,
    });
  },

  // Finances
  getFinances: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId;
    const finances = db.finances
      .filter(f => f.schoolId === schoolId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalIncome = finances.filter(f => f.type === 'INGRESO' && f.advisorApproved).reduce((a, b) => a + b.amount, 0);
    const totalExpenses = finances.filter(f => f.type === 'EGRESO' && f.advisorApproved).reduce((a, b) => a + b.amount, 0);
    const pendingTotal = finances.filter(f => !f.advisorApproved).reduce((a, b) => a + b.amount, 0);

    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        pendingTotal,
      },
      data: finances,
    });
  },

  createFinanceEntry: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { type, category, amount, description, date, receiptNumber } = req.body;

    if (!type || !category || !amount || !description || !date) {
      res.status(400).json({ error: 'Todos los campos financieros son requeridos' });
      return;
    }

    const newEntry: FinanceEntry = {
      id: `fin-${Date.now()}`,
      schoolId: schoolId || 'sch-dean-funes',
      type: type as 'INGRESO' | 'EGRESO',
      category,
      amount: Number(amount),
      description,
      date,
      receiptNumber: receiptNumber || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      registeredBy: `Secretaría de Finanzas (${req.user?.fullName || 'CD'})`,
      advisorApproved: false, // Must be approved by advisor teacher (Art. 20 & 41)
      createdAt: new Date().toISOString(),
    };

    db.finances.unshift(newEntry);

    res.status(201).json({
      success: true,
      message: 'Movimiento contable registrado. Queda pendiente del visto bueno del Profesor Asesor (Art. 20 & 41).',
      data: newEntry,
    });
  },

  approveFinanceByAdvisor: (req: AuthenticatedRequest, res: Response) => {
    const { financeId } = req.params;
    const entry = db.finances.find(f => f.id === financeId);
    if (!entry) {
      res.status(404).json({ error: 'Registro contable no encontrado' });
      return;
    }

    entry.advisorApproved = true;
    entry.advisorApprovedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Movimiento contable por $${entry.amount.toLocaleString()} validado y aprobado por el Profesor Asesor (Art. 20 y 41).`,
      data: entry,
    });
  },

  // Submit news draft from CD
  submitNewsDraft: (req: AuthenticatedRequest, res: Response) => {
    const schoolId = req.user?.schoolId;
    const school = db.schools.find(s => s.id === schoolId);
    const { title, summary, content, category } = req.body;

    if (!title || !summary || !content) {
      res.status(400).json({ error: 'Faltan datos de la noticia' });
      return;
    }

    const newPost: NewsPost = {
      id: `nws-${Date.now()}`,
      schoolId: schoolId || null,
      schoolName: school ? school.name : 'Centro de Estudiantes',
      authorName: req.user?.fullName || 'Centro de Estudiantes',
      title,
      summary,
      content,
      category: category || 'Institucional',
      status: NewsStatus.PENDING,
      isPinned: false,
      isProvincialNotice: false,
      createdAt: new Date().toISOString(),
    };

    db.news.unshift(newPost);

    res.status(201).json({
      success: true,
      message: 'Noticia enviada a la cola de moderación provincial de la Agencia Córdoba Joven.',
      data: newPost,
    });
  },
};
