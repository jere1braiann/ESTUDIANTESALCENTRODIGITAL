/**
 * Core Domain Types & DTOs for "Estudiantes al Centro"
 * Strictly aligned with Córdoba Province Education Ministry Resolution Nº 124/2010
 */

export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN_CD = 'ADMIN_CD',
  ADMIN_JUNTA = 'ADMIN_JUNTA',
}

export enum SchoolStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum NewsStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ElectionStatus {
  DRAFT = 'DRAFT',
  ENROLLMENT_OPEN = 'ENROLLMENT_OPEN', // Padron cargado y avales
  LISTS_OFFICIALIZED = 'LISTS_OFFICIALIZED', // Listas aprobadas con >= 10% avales
  VOTING_OPEN = 'VOTING_OPEN', // Comicios en curso (biombos habilitados)
  VOTING_CLOSED = 'VOTING_CLOSED', // Cierre de urnas
  SCRUTINY_COMPLETED = 'SCRUTINY_COMPLETED', // Escrutinio y minorías calculado
  PROCLAIMED = 'PROCLAIMED', // Proclamación efectuada (Junta disuelta - Art. 35)
}

export enum SecretaryType {
  ACTAS = 'Secretaría de Actas',
  FINANZAS = 'Secretaría de Finanzas',
  PRENSA_DIFUSION = 'Secretaría de Prensa y Difusión',
  CULTURA = 'Secretaría de Cultura',
  DEPORTES_RECREACION = 'Secretaría de Recreación y Deportes',
  DDHH_CONVIVENCIA = 'Secretaría de DDHH y Convivencia',
  MEDIO_AMBIENTE = 'Secretaría de Asuntos Estudiantiles y Ambiente',
}

export interface School {
  id: string;
  name: string;
  cue: string; // Código Único de Establecimiento
  department: string;
  city: string;
  status: SchoolStatus;
  advisorTeacherName?: string;
  advisorTeacherEmail?: string;
  createdAt: string;
}

export interface User {
  id: string;
  schoolId: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  password?: string;
  expiresAt?: string | null; // For ADMIN_JUNTA auto-expiration (Res. 124 Art. 35)
  isActive: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  dni: string;
  fullName: string;
  yearOfStudy: number; // 1 to 6/7
  division: string; // 'A', 'B', 'C'
  shift: 'Mañana' | 'Tarde' | 'Noche';
  isRegular: boolean;
  hasVoted: boolean;
  votedAt?: string | null;
  token?: string; // VotingToken
  tokenUsed: boolean;
}

export interface JuntaMember {
  id: string;
  schoolId: string;
  fullName: string;
  dni: string;
  yearOfStudy: number; // Must be last two years (Art. 25)
  division: string;
  roleInJunta: 'Presidente de Junta' | 'Secretario de Junta' | 'Vocal 1' | 'Vocal 2' | 'Vocal 3';
}

export interface Candidate {
  id: string;
  listId: string;
  fullName: string;
  dni: string;
  yearOfStudy: number;
  division: string;
  position: string; // 'Presidente', 'Vicepresidente', etc.
  isSubstitute: boolean; // Titular vs Suplente (Art. 6)
}

export interface ElectoralList {
  id: string;
  schoolId: string;
  electionId: string;
  listNumber: number;
  listName: string;
  colorHex: string;
  motto: string;
  presidentName: string;
  presidentYear: number;
  vicePresidentName: string;
  vicePresidentYear: number;
  endorserCount: number; // Number of endorsements collected
  requiredEndorsements: number; // 10% of Padron (Art. 28)
  isOfficialized: boolean;
  officializedAt?: string;
  candidates: Candidate[];
  proposalSummary?: string;
}

export interface AnonymousVote {
  id: string;
  schoolId: string;
  electionId: string;
  listId: string | null; // null represents "Voto en Blanco"
  receiptHash: string; // Public cryptographic confirmation for the student
  createdAt: string;
}

export interface MinuteActa {
  id: string;
  schoolId: string;
  actNumber: number;
  title: string;
  type: 'Ordinaria' | 'Extraordinaria' | 'Asamblea General' | 'Comisión Directiva' | 'Junta Electoral';
  date: string;
  location: string;
  attendeesCount: number;
  quorumReached: boolean;
  agendaTopics: string;
  content: string;
  resolutions: string;
  signedByPresident: boolean;
  signedByActasSecretary: boolean;
  signedByAdvisorTeacher: boolean;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  schoolId: string;
  type: 'INGRESO' | 'EGRESO';
  category: 'Kiosco / Buffet' | 'Venta de Rifas' | 'Donación' | 'Materiales / Evento' | 'Fotocopias' | 'Equipamiento' | 'Otro';
  amount: number;
  description: string;
  date: string;
  receiptNumber?: string;
  registeredBy: string; // Secretary of Finance
  advisorApproved: boolean; // Visto bueno del Profesor Asesor (Art. 20 & 41)
  advisorApprovedAt?: string;
  createdAt: string;
}

export interface NewsPost {
  id: string;
  schoolId?: string | null; // null for SuperAdmin global posts
  schoolName?: string;
  authorName: string;
  title: string;
  summary: string;
  content: string;
  category: 'Institucional' | 'Cultura y Deportes' | 'Solidaridad' | 'Normativa' | 'Elecciones';
  status: NewsStatus;
  isPinned: boolean;
  isProvincialNotice: boolean;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ElectionProcess {
  id: string;
  schoolId: string;
  year: number;
  title: string;
  status: ElectionStatus;
  padronCount: number;
  votesCount: number;
  electionDate: string;
  votingStartTime: string;
  votingEndTime: string;
  juntaDisolved: boolean;
  disolvedAt?: string;
  results?: ScrutinyResult;
}

export interface ScrutinyResult {
  totalVoters: number;
  totalVotesCast: number;
  turnoutPercentage: number;
  validVotes: number;
  blankVotes: number;
  listResults: {
    listId: string;
    listNumber: number;
    listName: string;
    colorHex: string;
    votes: number;
    percentageOfValidVotes: number;
    surpassed20PercentThreshold: boolean; // Art. 30
    awardedSecretariesCount: number; // Representation calculation
    awardedSecretaries: string[];
    isWinner: boolean;
  }[];
  proclaimedAt?: string;
}

export interface AuditLog {
  id: string;
  schoolId?: string;
  userId?: string;
  userRole?: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}
