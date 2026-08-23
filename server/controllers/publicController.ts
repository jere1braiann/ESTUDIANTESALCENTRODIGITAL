import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { NewsStatus, NewsPost, SchoolStatus, School } from '../types.js';

export const publicController = {
  // Get all approved news posts with pinned ones first
  getNews: (req: Request, res: Response) => {
    const { category, schoolId, search } = req.query;

    let posts = db.news.filter(n => n.status === NewsStatus.APPROVED);

    if (category && typeof category === 'string' && category !== 'ALL') {
      posts = posts.filter(n => n.category.toLowerCase() === category.toLowerCase());
    }

    if (schoolId && typeof schoolId === 'string') {
      posts = posts.filter(n => n.schoolId === schoolId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      posts = posts.filter(n => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }

    // Sort: pinned first, then newest
    posts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({
      success: true,
      count: posts.length,
      news: posts,
      data: posts,
    });
  },

  // Get single news post
  getNewsById: (req: Request, res: Response) => {
    const post = db.news.find(n => n.id === req.params.id && n.status === NewsStatus.APPROVED);
    if (!post) {
      res.status(404).json({ error: 'Noticia no encontrada o pendiente de aprobación' });
      return;
    }
    res.json({ success: true, data: post });
  },

  // Submit school news from public or unauthenticated form (Enters as PENDING)
  submitNews: (req: Request, res: Response) => {
    const { schoolId, authorName, title, summary, content, category } = req.body;

    if (!title || !summary || !content || !authorName) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    const school = db.schools.find(s => s.id === schoolId);

    const newPost: NewsPost = {
      id: `nws-${Date.now()}`,
      schoolId: schoolId || null,
      schoolName: school ? school.name : 'Centro de Estudiantes',
      authorName,
      title,
      summary,
      content,
      category: category || 'Institucional',
      status: NewsStatus.PENDING, // Strictly PENDING until SuperAdmin approves
      isPinned: false,
      isProvincialNotice: false,
      createdAt: new Date().toISOString(),
    };

    db.news.unshift(newPost);

    res.status(201).json({
      success: true,
      message: 'Noticia enviada con éxito. Quedó registrada en estado PENDIENTE y será publicada tras la revisión del equipo de moderación provincial (Agencia Córdoba Joven / Min. Educación).',
      data: newPost,
    });
  },

  // Get active schools list
  getSchools: (req: Request, res: Response) => {
    const approvedSchools = db.schools.map(s => {
      const election = db.elections.find(e => e.schoolId === s.id);
      return {
        ...s,
        hasActiveElection: election ? election.status === 'VOTING_OPEN' : false,
        electionStatus: election?.status || null,
      };
    });
    res.json({ success: true, schools: approvedSchools, data: approvedSchools });
  },

  // Request new school joining
  requestSchoolEnrollment: (req: Request, res: Response) => {
    const { name, cue, department, city, advisorTeacherName, advisorTeacherEmail } = req.body;

    if (!name || !cue || !department || !city) {
      res.status(400).json({ error: 'Faltan datos obligatorios del establecimiento' });
      return;
    }

    const existing = db.schools.find(s => s.cue === cue);
    if (existing) {
      res.status(400).json({ error: `Ya existe una solicitud o colegio registrado con el CUE ${cue}` });
      return;
    }

    const newSchool: School = {
      id: `sch-${Date.now()}`,
      cue,
      name,
      department,
      city,
      status: SchoolStatus.PENDING,
      advisorTeacherName,
      advisorTeacherEmail,
      createdAt: new Date().toISOString(),
    };

    db.schools.push(newSchool);

    res.status(201).json({
      success: true,
      message: 'Solicitud de adhesión provincial registrada exitosamente. El equipo de Soporte Provincial revisará la documentación del CUE.',
      data: newSchool,
    });
  },
};
