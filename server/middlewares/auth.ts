import { Request, Response, NextFunction } from 'express';
import { Role, User, ElectionStatus } from '../types.js';
import { db } from '../db/store.js';

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Middleware: Verify Bearer Token or Simulated Session Header
 */
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const usernameHeader = req.headers['x-user-role'] || req.headers['x-username'];

  let foundUser: User | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // In our robust architecture, token contains the user ID or username
    foundUser = db.users.find(u => u.id === token || u.username === token);
  } else if (usernameHeader) {
    foundUser = db.users.find(u => u.username === usernameHeader || u.role === usernameHeader);
  }

  // Default fallback for development/demo: if no header, check query param or let public through
  if (!foundUser && req.query.mockUser) {
    foundUser = db.users.find(u => u.username === req.query.mockUser);
  }

  if (!foundUser) {
    res.status(401).json({
      error: 'No autorizado',
      message: 'Token de sesión no provisto o inválido.',
    });
    return;
  }

  if (!foundUser.isActive) {
    res.status(403).json({
      error: 'Acceso Denegado',
      message: 'El usuario se encuentra inactivo.',
    });
    return;
  }

  req.user = foundUser;
  next();
}

/**
 * Middleware: Role-Based Access Control (RBAC)
 */
export function requireRoles(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Permisos insuficientes',
        message: `El rol ${req.user.role} no tiene autorización para este recurso. Requerido: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware: Statutory Expiration Check for Junta Electoral (Res. 124 Art. 35)
 * "Cumplido su cometido y asegurada la documentación respectiva, la Junta Electoral se disolverá."
 */
export function checkJuntaValidity(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  // Only applies to ADMIN_JUNTA
  if (req.user.role === Role.ADMIN_JUNTA) {
    const schoolId = req.user.schoolId;
    const election = db.elections.find(e => e.schoolId === schoolId);

    // Check if the election has already been proclaimed or dissolved
    if (election && (election.status === ElectionStatus.PROCLAIMED || election.juntaDisolved)) {
      res.status(403).json({
        error: 'Credenciales de Junta Electoral Caducadas',
        message: 'La Junta Electoral ha finalizado sus funciones estatutarias y se encuentra automáticamente DISUELTA conforme al Art. 35 de la Resolución Nº 124. Las credenciales de acceso han sido revocadas.',
        isExpired: true,
        disolvedAt: election.disolvedAt,
      });
      return;
    }

    // Check optional expiresAt timestamp
    if (req.user.expiresAt && new Date(req.user.expiresAt) <= new Date()) {
      res.status(403).json({
        error: 'Credenciales de Junta Electoral Vencidas',
        message: 'El plazo temporal asignado a las credenciales de la Junta Electoral ha expirado.',
        isExpired: true,
      });
      return;
    }
  }

  next();
}

/**
 * Middleware: Automatic Audit Logging
 */
export function logAuditAction(actionName: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const originalSend = res.json;
    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        db.auditLogs.unshift({
          id: `log-${Date.now()}`,
          schoolId: req.user?.schoolId,
          userId: req.user?.id,
          userRole: req.user?.role,
          action: actionName,
          details: typeof data === 'object' ? JSON.stringify(data).slice(0, 200) : String(data),
          ipAddress: req.ip || '127.0.0.1',
          timestamp: new Date().toISOString(),
        });
      }
      return originalSend.call(this, data);
    };
    next();
  };
}
