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
  ENROLLMENT_OPEN = 'ENROLLMENT_OPEN',
  LISTS_OFFICIALIZED = 'LISTS_OFFICIALIZED',
  VOTING_OPEN = 'VOTING_OPEN',
  VOTING_CLOSED = 'VOTING_CLOSED',
  SCRUTINY_COMPLETED = 'SCRUTINY_COMPLETED',
  PROCLAIMED = 'PROCLAIMED',
}

export interface School {
  id: string;
  name: string;
  cue: string;
  department: string;
  city: string;
  status: SchoolStatus;
  advisorTeacherName?: string;
  advisorTeacherEmail?: string;
  hasActiveElection?: boolean;
  electionStatus?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  schoolId: string;
  schoolName?: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  expiresAt?: string | null;
  isActive: boolean;
  isJuntaDisolved?: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  dni: string;
  fullName: string;
  yearOfStudy: number;
  division: string;
  shift: 'Mañana' | 'Tarde' | 'Noche';
  isRegular: boolean;
  hasVoted: boolean;
  votedAt?: string | null;
  token?: string;
  tokenUsed: boolean;
}

export interface JuntaMember {
  id: string;
  schoolId: string;
  fullName: string;
  dni: string;
  yearOfStudy: number;
  division: string;
  roleInJunta: string;
}

export interface Candidate {
  id: string;
  listId: string;
  fullName: string;
  dni: string;
  yearOfStudy: number;
  division: string;
  position: string;
  isSubstitute: boolean;
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
  endorserCount: number;
  requiredEndorsements: number;
  hasRequiredEndorsements?: boolean;
  acefaliaCompliant?: boolean;
  isOfficialized: boolean;
  officializedAt?: string;
  candidates: Candidate[];
  proposalSummary?: string;
}

export interface MinuteActa {
  id: string;
  schoolId: string;
  actNumber: number;
  title: string;
  type: string;
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
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptNumber?: string;
  registeredBy: string;
  advisorApproved: boolean;
  advisorApprovedAt?: string;
  createdAt: string;
}

export interface NewsPost {
  id: string;
  schoolId?: string | null;
  schoolName?: string;
  authorName: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  status: NewsStatus;
  isPinned: boolean;
  isProvincialNotice: boolean;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
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
    surpassed20PercentThreshold: boolean;
    awardedSecretariesCount: number;
    awardedSecretaries: string[];
    isWinner: boolean;
  }[];
  proclaimedAt?: string;
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
