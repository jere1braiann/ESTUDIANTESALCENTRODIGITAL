import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { db } from '../db/store.js';
import { Role, SchoolStatus, NewsStatus, NewsPost, User } from '../types.js';

export const superadminController = {
  // Get overview metrics
  getDashboardStats: (req: AuthenticatedRequest, res: Response) => {
    const totalSchools = db.schools.length;
    const approvedSchools = db.schools.filter(s => s.status === SchoolStatus.APPROVED).length;
    const pendingSchools = db.schools.filter(s => s.status === SchoolStatus.PENDING).length;
    const pendingNews = db.news.filter(n => n.status === NewsStatus.PENDING).length;
    const activeElections = db.elections.filter(e => e.status === 'VOTING_OPEN').length;
    const totalVotesInProvince = db.anonymousVotes.length;

    res.json({
      success: true,
      data: {
        totalSchools,
        approvedSchools,
        pendingSchools,
        pendingNews,
        activeElections,
        totalVotesInProvince,
      },
    });
  },

  // School approvals / rejections
  getSchools: (req: AuthenticatedRequest, res: Response) => {
    const schoolsWithCredentials = db.schools.map(school => {
      const users = db.users.filter(u => u.schoolId === school.id);
      const election = db.elections.find(e => e.schoolId === school.id);
      return {
        ...school,
        users,
        election,
      };
    });
    res.json({ success: true, schools: schoolsWithCredentials, data: schoolsWithCredentials });
  },

  updateSchoolStatus: (req: AuthenticatedRequest, res: Response) => {
    const { schoolId } = req.params;
    const { status, generateCredentials } = req.body;

    const school = db.schools.find(s => s.id === schoolId);
    if (!school) {
      res.status(404).json({ error: 'Colegio no encontrado' });
      return;
    }

    school.status = status as SchoolStatus;

    let createdUsers: User[] = [];

    // Automatically create initial CD credentials if approved
    if (status === SchoolStatus.APPROVED && generateCredentials) {
      const existingUser = db.users.find(u => u.schoolId === schoolId && u.role === Role.ADMIN_CD);
      if (!existingUser) {
        const cleanName = school.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
        const cdUser: User = {
          id: `usr-cd-${Date.now()}`,
          schoolId: school.id,
          username: `cd.${cleanName}`,
          fullName: `Centro de Estudiantes ${school.name}`,
          email: `cd.${cleanName}@cba.centros.gob.ar`,
          role: Role.ADMIN_CD,
          isActive: true,
          expiresAt: null,
          createdAt: new Date().toISOString(),
        };
        db.users.push(cdUser);
        createdUsers.push(cdUser);
      }
    }

    res.json({
      success: true,
      message: `Colegio ${school.name} actualizado a estado ${status}`,
      school,
      createdUsers,
    });
  },

  // News moderation
  getNewsQueue: (req: AuthenticatedRequest, res: Response) => {
    const news = [...db.news].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, news, data: news });
  },

  moderateNews: (req: AuthenticatedRequest, res: Response) => {
    const { newsId } = req.params;
    const { status, isPinned, isProvincialNotice } = req.body;

    const post = db.news.find(n => n.id === newsId);
    if (!post) {
      res.status(404).json({ error: 'Noticia no encontrada' });
      return;
    }

    if (status) post.status = status as NewsStatus;
    if (typeof isPinned === 'boolean') post.isPinned = isPinned;
    if (typeof isProvincialNotice === 'boolean') post.isProvincialNotice = isProvincialNotice;

    post.reviewedBy = req.user?.fullName || 'SuperAdmin Provincial';
    post.reviewedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Noticia '${post.title}' actualizada exitosamente.`,
      data: post,
    });
  },

  // Create global provincial announcement
  createProvincialNotice: (req: AuthenticatedRequest, res: Response) => {
    const { title, summary, content, category, isPinned } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Título y contenido requeridos' });
      return;
    }

    const post: NewsPost = {
      id: `nws-prov-${Date.now()}`,
      schoolId: null,
      schoolName: 'Agencia Córdoba Joven / Ministerio de Educación',
      authorName: req.user?.fullName || 'Coordinación Provincial de Centros de Estudiantes',
      title,
      summary: summary || title,
      content,
      category: category || 'Normativa',
      status: NewsStatus.APPROVED,
      isPinned: isPinned ?? true,
      isProvincialNotice: true,
      createdAt: new Date().toISOString(),
      reviewedBy: req.user?.fullName || 'SuperAdmin Provincial',
      reviewedAt: new Date().toISOString(),
    };

    db.news.unshift(post);

    res.status(201).json({
      success: true,
      message: 'Comunicado institucional oficial publicado y fijado.',
      data: post,
    });
  },

  // Credentials management
  createCredential: (req: AuthenticatedRequest, res: Response) => {
    const { schoolId, role, username, fullName, email } = req.body;

    if (!schoolId || !role || !username || !fullName || !email) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      schoolId,
      username,
      fullName,
      email,
      role: role as Role,
      isActive: true,
      expiresAt: null,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    res.status(201).json({
      success: true,
      message: `Credencial generada para ${fullName} con rol ${role}`,
      data: newUser,
    });
  },
};
