import {
  School,
  SchoolStatus,
  User,
  Role,
  ElectionProcess,
  ElectionStatus,
  Student,
  JuntaMember,
  ElectoralList,
  Candidate,
  AnonymousVote,
  MinuteActa,
  FinanceEntry,
  NewsPost,
  NewsStatus,
  AuditLog,
  ScrutinyResult,
} from '../types.js';

// Seed data based on Córdoba Educational Institutions
class DatabaseStore {
  schools: School[] = [
    {
      id: 'sch-dean-funes',
      cue: '0401824-00',
      name: 'IPEM Nº 268 "Deán Funes"',
      department: 'Capital',
      city: 'Córdoba Capital',
      status: SchoolStatus.APPROVED,
      advisorTeacherName: 'Prof. Marcelo Altamirano',
      advisorTeacherEmail: 'm.altamirano@educacion.cba.gov.ar',
      createdAt: '2026-03-01T08:00:00.000Z',
    },
    {
      id: 'sch-cassaffousth',
      cue: '0401955-00',
      name: 'IPET Nº 247 "Ing. Carlos Cassaffousth"',
      department: 'Capital',
      city: 'Córdoba Capital',
      status: SchoolStatus.APPROVED,
      advisorTeacherName: 'Prof. Silvina Morales',
      advisorTeacherEmail: 's.morales@educacion.cba.gov.ar',
      createdAt: '2026-03-05T09:30:00.000Z',
    },
    {
      id: 'sch-simon-bolivar',
      cue: '0402110-00',
      name: 'IPEM Nº 153 "Simón Bolívar"',
      department: 'Río Cuarto',
      city: 'Río Cuarto',
      status: SchoolStatus.APPROVED,
      advisorTeacherName: 'Prof. Roberto Gómez',
      advisorTeacherEmail: 'r.gomez@educacion.cba.gov.ar',
      createdAt: '2026-03-10T10:00:00.000Z',
    },
    {
      id: 'sch-carlos-paz',
      cue: '0403442-00',
      name: 'IPEM Nº 316 "Dr. Bernardo Houssay"',
      department: 'Punilla',
      city: 'Villa Carlos Paz',
      status: SchoolStatus.PENDING,
      advisorTeacherName: 'Prof. Laura Quiroga',
      advisorTeacherEmail: 'l.quiroga@educacion.cba.gov.ar',
      createdAt: '2026-08-20T14:15:00.000Z',
    },
  ];

  users: User[] = [
    {
      id: 'usr-superadmin',
      schoolId: '',
      username: 'superadmin',
      fullName: 'Lic. Mariana Valdez (Agencia Córdoba Joven)',
      email: 'mariana.valdez@cba.gov.ar',
      role: Role.SUPERADMIN,
      isActive: true,
      expiresAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'usr-cd-deanfunes',
      schoolId: 'sch-dean-funes',
      username: 'cd.deanfunes',
      fullName: 'Comisión Directiva IPEM 268',
      email: 'centro.deanfunes@gmail.com',
      role: Role.ADMIN_CD,
      isActive: true,
      expiresAt: null,
      createdAt: '2026-03-02T10:00:00.000Z',
    },
    {
      id: 'usr-junta-deanfunes',
      schoolId: 'sch-dean-funes',
      username: 'junta.deanfunes',
      fullName: 'Junta Electoral IPEM 268 (Temporal)',
      email: 'junta.electoral.268@gmail.com',
      role: Role.ADMIN_JUNTA,
      isActive: true,
      expiresAt: null, // Active until proclamation
      createdAt: '2026-08-01T09:00:00.000Z',
    },
    {
      id: 'usr-cd-cassaffousth',
      schoolId: 'sch-cassaffousth',
      username: 'cd.cassaffousth',
      fullName: 'Comisión Directiva IPET 247',
      email: 'centro.cassaffousth@gmail.com',
      role: Role.ADMIN_CD,
      isActive: true,
      expiresAt: null,
      createdAt: '2026-03-06T11:00:00.000Z',
    },
  ];

  elections: ElectionProcess[] = [
    {
      id: 'elec-deanfunes-2026',
      schoolId: 'sch-dean-funes',
      year: 2026,
      title: 'Elecciones Generales Centro de Estudiantes 2026 - IPEM 268',
      status: ElectionStatus.VOTING_OPEN,
      padronCount: 24,
      votesCount: 14,
      electionDate: '2026-08-25',
      votingStartTime: '08:00',
      votingEndTime: '16:30',
      juntaDisolved: false,
    },
    {
      id: 'elec-cassaffousth-2026',
      schoolId: 'sch-cassaffousth',
      year: 2026,
      title: 'Comicios Centro de Estudiantes IPET 247 Cassaffousth',
      status: ElectionStatus.LISTS_OFFICIALIZED,
      padronCount: 18,
      votesCount: 0,
      electionDate: '2026-08-28',
      votingStartTime: '08:30',
      votingEndTime: '17:00',
      juntaDisolved: false,
    },
  ];

  juntaMembers: JuntaMember[] = [
    {
      id: 'jm-1',
      schoolId: 'sch-dean-funes',
      fullName: 'Agustín Pereyra',
      dni: '46890123',
      yearOfStudy: 6, // Last year
      division: 'A',
      roleInJunta: 'Presidente de Junta',
    },
    {
      id: 'jm-2',
      schoolId: 'sch-dean-funes',
      fullName: 'Camila Benítez',
      dni: '47120344',
      yearOfStudy: 5, // Penultimate year
      division: 'B',
      roleInJunta: 'Secretario de Junta',
    },
    {
      id: 'jm-3',
      schoolId: 'sch-dean-funes',
      fullName: 'Mateo Rossi',
      dni: '46981245',
      yearOfStudy: 6,
      division: 'B',
      roleInJunta: 'Vocal 1',
    },
    {
      id: 'jm-4',
      schoolId: 'sch-dean-funes',
      fullName: 'Sofía Carrizo',
      dni: '47334901',
      yearOfStudy: 5,
      division: 'A',
      roleInJunta: 'Vocal 2',
    },
    {
      id: 'jm-5',
      schoolId: 'sch-dean-funes',
      fullName: 'Facundo Morales',
      dni: '47002198',
      yearOfStudy: 5,
      division: 'C',
      roleInJunta: 'Vocal 3',
    },
  ];

  students: Student[] = [
    // IPEM 268 Padron
    { id: 'st-01', schoolId: 'sch-dean-funes', dni: '47111001', fullName: 'Lucía Giménez', yearOfStudy: 4, division: 'A', shift: 'Mañana', isRegular: true, hasVoted: true, votedAt: '2026-08-23T09:12:00.000Z', token: 'TKN-8472', tokenUsed: true },
    { id: 'st-02', schoolId: 'sch-dean-funes', dni: '47111002', fullName: 'Joaquín Navarro', yearOfStudy: 4, division: 'A', shift: 'Mañana', isRegular: true, hasVoted: true, votedAt: '2026-08-23T09:20:00.000Z', token: 'TKN-3195', tokenUsed: true },
    { id: 'st-03', schoolId: 'sch-dean-funes', dni: '47111003', fullName: 'Valentina Romero', yearOfStudy: 5, division: 'B', shift: 'Mañana', isRegular: true, hasVoted: true, votedAt: '2026-08-23T09:35:00.000Z', token: 'TKN-9941', tokenUsed: true },
    { id: 'st-04', schoolId: 'sch-dean-funes', dni: '47111004', fullName: 'Tomás Herrera', yearOfStudy: 5, division: 'B', shift: 'Mañana', isRegular: true, hasVoted: true, votedAt: '2026-08-23T09:44:00.000Z', token: 'TKN-6218', tokenUsed: true },
    { id: 'st-05', schoolId: 'sch-dean-funes', dni: '47111005', fullName: 'Martina Sosa', yearOfStudy: 6, division: 'A', shift: 'Mañana', isRegular: true, hasVoted: true, votedAt: '2026-08-23T10:02:00.000Z', token: 'TKN-7734', tokenUsed: true },
    { id: 'st-06', schoolId: 'sch-dean-funes', dni: '47111006', fullName: 'Santiago Ferreyra', yearOfStudy: 6, division: 'A', shift: 'Mañana', isRegular: true, hasVoted: true, votedAt: '2026-08-23T10:15:00.000Z', token: 'TKN-4129', tokenUsed: true },
    { id: 'st-07', schoolId: 'sch-dean-funes', dni: '47111007', fullName: 'Candela Bustos', yearOfStudy: 3, division: 'B', shift: 'Tarde', isRegular: true, hasVoted: true, votedAt: '2026-08-23T10:28:00.000Z', token: 'TKN-5582', tokenUsed: true },
    { id: 'st-08', schoolId: 'sch-dean-funes', dni: '47111008', fullName: 'Emiliano Castro', yearOfStudy: 3, division: 'B', shift: 'Tarde', isRegular: true, hasVoted: true, votedAt: '2026-08-23T10:41:00.000Z', token: 'TKN-1804', tokenUsed: true },
    { id: 'st-09', schoolId: 'sch-dean-funes', dni: '47111009', fullName: 'Julieta Medina', yearOfStudy: 2, division: 'A', shift: 'Tarde', isRegular: true, hasVoted: true, votedAt: '2026-08-23T11:00:00.000Z', token: 'TKN-6693', tokenUsed: true },
    { id: 'st-10', schoolId: 'sch-dean-funes', dni: '47111010', fullName: 'Nicolás Cabrera', yearOfStudy: 2, division: 'A', shift: 'Tarde', isRegular: true, hasVoted: true, votedAt: '2026-08-23T11:14:00.000Z', token: 'TKN-2381', tokenUsed: true },
    { id: 'st-11', schoolId: 'sch-dean-funes', dni: '47111011', fullName: 'Micaela Paez', yearOfStudy: 1, division: 'C', shift: 'Tarde', isRegular: true, hasVoted: true, votedAt: '2026-08-23T11:25:00.000Z', token: 'TKN-9027', tokenUsed: true },
    { id: 'st-12', schoolId: 'sch-dean-funes', dni: '47111012', fullName: 'Lautaro Vega', yearOfStudy: 1, division: 'C', shift: 'Tarde', isRegular: true, hasVoted: true, votedAt: '2026-08-23T11:32:00.000Z', token: 'TKN-3846', tokenUsed: true },
    { id: 'st-13', schoolId: 'sch-dean-funes', dni: '47111013', fullName: 'Pilar Godoy', yearOfStudy: 5, division: 'A', shift: 'Mañana', isRegular: true, hasVoted: true, votedAt: '2026-08-23T11:45:00.000Z', token: 'TKN-7150', tokenUsed: true },
    { id: 'st-14', schoolId: 'sch-dean-funes', dni: '47111014', fullName: 'Bruno Villalba', yearOfStudy: 4, division: 'B', shift: 'Mañana', isRegular: true, hasVoted: true, votedAt: '2026-08-23T11:52:00.000Z', token: 'TKN-5289', tokenUsed: true },
    // Voter demo accounts ready to cast vote in Biombo
    { id: 'st-15', schoolId: 'sch-dean-funes', dni: '47111015', fullName: 'Zoe Santillán (DEMO LISTO PARA VOTAR)', yearOfStudy: 5, division: 'A', shift: 'Mañana', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-9142', tokenUsed: false },
    { id: 'st-16', schoolId: 'sch-dean-funes', dni: '47111016', fullName: 'Franco Peralta', yearOfStudy: 4, division: 'A', shift: 'Mañana', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-4820', tokenUsed: false },
    { id: 'st-17', schoolId: 'sch-dean-funes', dni: '47111017', fullName: 'Abril Toledo', yearOfStudy: 6, division: 'B', shift: 'Mañana', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-6371', tokenUsed: false },
    { id: 'st-18', schoolId: 'sch-dean-funes', dni: '47111018', fullName: 'Ignacio Juárez', yearOfStudy: 3, division: 'A', shift: 'Tarde', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-1594', tokenUsed: false },
    { id: 'st-19', schoolId: 'sch-dean-funes', dni: '47111019', fullName: 'Alma Domínguez', yearOfStudy: 2, division: 'B', shift: 'Tarde', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-8205', tokenUsed: false },
    { id: 'st-20', schoolId: 'sch-dean-funes', dni: '47111020', fullName: 'Ramiro Lucero', yearOfStudy: 1, division: 'A', shift: 'Tarde', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-3769', tokenUsed: false },
    { id: 'st-21', schoolId: 'sch-dean-funes', dni: '47111021', fullName: 'Milagros Roldán', yearOfStudy: 5, division: 'B', shift: 'Mañana', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-6411', tokenUsed: false },
    { id: 'st-22', schoolId: 'sch-dean-funes', dni: '47111022', fullName: 'Benjamín Silva', yearOfStudy: 6, division: 'A', shift: 'Mañana', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-2953', tokenUsed: false },
    { id: 'st-23', schoolId: 'sch-dean-funes', dni: '47111023', fullName: 'Florencia Arce', yearOfStudy: 4, division: 'B', shift: 'Mañana', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-7084', tokenUsed: false },
    { id: 'st-24', schoolId: 'sch-dean-funes', dni: '47111024', fullName: 'Thiago Benavídez', yearOfStudy: 3, division: 'A', shift: 'Tarde', isRegular: true, hasVoted: false, votedAt: null, token: 'TKN-5321', tokenUsed: false },
  ];

  lists: ElectoralList[] = [
    {
      id: 'lst-10-union',
      schoolId: 'sch-dean-funes',
      electionId: 'elec-deanfunes-2026',
      listNumber: 10,
      listName: 'Unión Estudiantil Deán Funes',
      colorHex: '#2563EB', // Blue
      motto: 'Participación real, inclusión de todos los cursos y mejoras en talleres.',
      presidentName: 'Martina Rodríguez',
      presidentYear: 5, // Art. 17: 5to año (no es último año, cumple prevención de acefalía)
      vicePresidentName: 'Gonzalo Moyano',
      vicePresidentYear: 6, // 6to año
      endorserCount: 6, // 6 > 2.4 (10% de 24)
      requiredEndorsements: 3,
      isOfficialized: true,
      officializedAt: '2026-08-15T10:00:00.000Z',
      proposalSummary: 'Modernización de la sala de informática, torneos intercolegiales y kiosco saludable.',
      candidates: [
        { id: 'c-1', listId: 'lst-10-union', fullName: 'Martina Rodríguez', dni: '47881021', yearOfStudy: 5, division: 'A', position: 'Presidente', isSubstitute: false },
        { id: 'c-2', listId: 'lst-10-union', fullName: 'Gonzalo Moyano', dni: '46991044', yearOfStudy: 6, division: 'B', position: 'Vicepresidente', isSubstitute: false },
        { id: 'c-3', listId: 'lst-10-union', fullName: 'Clara Del Valle', dni: '47551099', yearOfStudy: 5, division: 'B', position: 'Secretaría de Actas (Titular)', isSubstitute: false },
        { id: 'c-4', listId: 'lst-10-union', fullName: 'Ignacio Peña', dni: '48110033', yearOfStudy: 4, division: 'A', position: 'Secretaría de Actas (Suplente)', isSubstitute: true },
        { id: 'c-5', listId: 'lst-10-union', fullName: 'Valentin Osorio', dni: '47220088', yearOfStudy: 5, division: 'A', position: 'Secretaría de Finanzas (Titular)', isSubstitute: false },
        { id: 'c-6', listId: 'lst-10-union', fullName: 'Luciana Paz', dni: '48330012', yearOfStudy: 4, division: 'B', position: 'Secretaría de Finanzas (Suplente)', isSubstitute: true },
        { id: 'c-7', listId: 'lst-10-union', fullName: 'Federico Bazán', dni: '47990022', yearOfStudy: 5, division: 'C', position: 'Secretaría de Prensa y Difusión (Titular)', isSubstitute: false },
        { id: 'c-8', listId: 'lst-10-union', fullName: 'Milena Suárez', dni: '48440077', yearOfStudy: 3, division: 'A', position: 'Secretaría de Cultura (Titular)', isSubstitute: false },
        { id: 'c-9', listId: 'lst-10-union', fullName: 'Lucas Montenegro', dni: '47660055', yearOfStudy: 5, division: 'B', position: 'Secretaría de Recreación y Deportes (Titular)', isSubstitute: false },
      ],
    },
    {
      id: 'lst-3-construir',
      schoolId: 'sch-dean-funes',
      electionId: 'elec-deanfunes-2026',
      listNumber: 3,
      listName: 'Construir Futuro',
      colorHex: '#DC2626', // Red
      motto: 'Defensa de los derechos estudiantiles, talleres extracurriculares y ESI.',
      presidentName: 'Lucas Heredia',
      presidentYear: 6,
      vicePresidentName: 'Florencia Tissera',
      vicePresidentYear: 4, // Art. 17: Vice en 4to año -> Cumple prevención de acefalía
      endorserCount: 5,
      requiredEndorsements: 3,
      isOfficialized: true,
      officializedAt: '2026-08-15T11:30:00.000Z',
      proposalSummary: 'Biblioteca comunitaria abierta, talleres de robótica y jornadas de convivencia.',
      candidates: [
        { id: 'c-10', listId: 'lst-3-construir', fullName: 'Lucas Heredia', dni: '46882201', yearOfStudy: 6, division: 'A', position: 'Presidente', isSubstitute: false },
        { id: 'c-11', listId: 'lst-3-construir', fullName: 'Florencia Tissera', dni: '48119933', yearOfStudy: 4, division: 'B', position: 'Vicepresidente', isSubstitute: false },
        { id: 'c-12', listId: 'lst-3-construir', fullName: 'Manuel Carballo', dni: '47338822', yearOfStudy: 5, division: 'A', position: 'Secretaría de Actas (Titular)', isSubstitute: false },
        { id: 'c-13', listId: 'lst-3-construir', fullName: 'Brenda Salgado', dni: '47997711', yearOfStudy: 5, division: 'B', position: 'Secretaría de Finanzas (Titular)', isSubstitute: false },
        { id: 'c-14', listId: 'lst-3-construir', fullName: 'Nahuel Quiroga', dni: '48556600', yearOfStudy: 3, division: 'A', position: 'Secretaría de Prensa y Difusión (Titular)', isSubstitute: false },
        { id: 'c-15', listId: 'lst-3-construir', fullName: 'Malena Farías', dni: '48003322', yearOfStudy: 4, division: 'A', position: 'Secretaría de Cultura (Titular)', isSubstitute: false },
        { id: 'c-16', listId: 'lst-3-construir', fullName: 'Joaquín Mansilla', dni: '47441199', yearOfStudy: 5, division: 'C', position: 'Secretaría de Recreación y Deportes (Titular)', isSubstitute: false },
      ],
    },
    {
      id: 'lst-7-frente',
      schoolId: 'sch-dean-funes',
      electionId: 'elec-deanfunes-2026',
      listNumber: 7,
      listName: 'Frente Verde de Acción Secundaria',
      colorHex: '#059669', // Emerald
      motto: 'Ecología en la escuela, reciclaje, huerta comunitaria y deporte inclusivo.',
      presidentName: 'Esteban Ceballos',
      presidentYear: 5,
      vicePresidentName: 'Solana Aguirre',
      vicePresidentYear: 5,
      endorserCount: 4,
      requiredEndorsements: 3,
      isOfficialized: true,
      officializedAt: '2026-08-16T14:00:00.000Z',
      proposalSummary: 'Puntos verdes en cada aula, torneos mixtos de vóley y cine-debate mensual.',
      candidates: [
        { id: 'c-17', listId: 'lst-7-frente', fullName: 'Esteban Ceballos', dni: '47225566', yearOfStudy: 5, division: 'B', position: 'Presidente', isSubstitute: false },
        { id: 'c-18', listId: 'lst-7-frente', fullName: 'Solana Aguirre', dni: '47334455', yearOfStudy: 5, division: 'A', position: 'Vicepresidente', isSubstitute: false },
        { id: 'c-19', listId: 'lst-7-frente', fullName: 'Ramiro Leiva', dni: '48112233', yearOfStudy: 4, division: 'C', position: 'Secretaría de Actas (Titular)', isSubstitute: false },
        { id: 'c-20', listId: 'lst-7-frente', fullName: 'Camila Zárate', dni: '47889900', yearOfStudy: 5, division: 'A', position: 'Secretaría de Finanzas (Titular)', isSubstitute: false },
      ],
    },
  ];

  // Anonymous urn for IPEM 268 (14 votes cast so far)
  // Absolutely decoupled from student DNI/ID
  anonymousVotes: AnonymousVote[] = [
    { id: 'v-1', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-10-union', receiptHash: 'VOT-DF-8A9F1B', createdAt: '2026-08-23T09:12:00.000Z' },
    { id: 'v-2', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-10-union', receiptHash: 'VOT-DF-3C2E4A', createdAt: '2026-08-23T09:20:00.000Z' },
    { id: 'v-3', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-3-construir', receiptHash: 'VOT-DF-7D1A9C', createdAt: '2026-08-23T09:35:00.000Z' },
    { id: 'v-4', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-10-union', receiptHash: 'VOT-DF-5F8B2E', createdAt: '2026-08-23T09:44:00.000Z' },
    { id: 'v-5', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-3-construir', receiptHash: 'VOT-DF-9E4C1D', createdAt: '2026-08-23T10:02:00.000Z' },
    { id: 'v-6', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-7-frente', receiptHash: 'VOT-DF-2B7A8E', createdAt: '2026-08-23T10:15:00.000Z' },
    { id: 'v-7', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-10-union', receiptHash: 'VOT-DF-4A1C3F', createdAt: '2026-08-23T10:28:00.000Z' },
    { id: 'v-8', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-3-construir', receiptHash: 'VOT-DF-6C9E2B', createdAt: '2026-08-23T10:41:00.000Z' },
    { id: 'v-9', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-10-union', receiptHash: 'VOT-DF-1E8D7A', createdAt: '2026-08-23T11:00:00.000Z' },
    { id: 'v-10', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-7-frente', receiptHash: 'VOT-DF-8D3B5C', createdAt: '2026-08-23T11:14:00.000Z' },
    { id: 'v-11', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: null, receiptHash: 'VOT-DF-0F0F0F', createdAt: '2026-08-23T11:25:00.000Z' }, // Voto en Blanco
    { id: 'v-12', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-10-union', receiptHash: 'VOT-DF-7B2C9D', createdAt: '2026-08-23T11:32:00.000Z' },
    { id: 'v-13', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-3-construir', receiptHash: 'VOT-DF-3E1F5A', createdAt: '2026-08-23T11:45:00.000Z' },
    { id: 'v-14', schoolId: 'sch-dean-funes', electionId: 'elec-deanfunes-2026', listId: 'lst-10-union', receiptHash: 'VOT-DF-5A9D2C', createdAt: '2026-08-23T11:52:00.000Z' },
  ];

  minutes: MinuteActa[] = [
    {
      id: 'acta-01',
      schoolId: 'sch-dean-funes',
      actNumber: 1,
      title: 'Acta de Apertura del Período Ordinario 2026',
      type: 'Comisión Directiva',
      date: '2026-03-15',
      location: 'Aula Magna IPEM 268',
      attendeesCount: 14,
      quorumReached: true,
      agendaTopics: '1. Plan Anual de Actividades (Art. 18 inc d). 2. Presupuesto estimado. 3. Convocatoria a delegados de curso.',
      content: 'En la ciudad de Córdoba, siendo las 14:00 horas del día 15 de marzo de 2026, se reúne la Comisión Directiva del Centro de Estudiantes para dar inicio al período lectivo y coordinar las actividades de integración con los ingresantes.',
      resolutions: 'Se aprueba por unanimidad el proyecto de torneos de bienvenida y la campaña de reciclaje de cuadernillos.',
      signedByPresident: true,
      signedByActasSecretary: true,
      signedByAdvisorTeacher: true,
      createdAt: '2026-03-15T15:30:00.000Z',
    },
    {
      id: 'acta-02',
      schoolId: 'sch-dean-funes',
      actNumber: 2,
      title: 'Acta de Convocatoria a Elecciones y Designación de Junta Electoral',
      type: 'Asamblea General',
      date: '2026-07-28',
      location: 'SUM IPEM 268',
      attendeesCount: 42,
      quorumReached: true,
      agendaTopics: 'Convocatoria a elecciones conforme al Art. 18 inc f y designación de los 5 miembros de Junta Electoral (Art. 25).',
      content: 'Con la presencia del Cuerpo de Delegados y estudiantes regulares, se procede a formalizar el llamado a elecciones para la renovación de autoridades del Centro de Estudiantes y la proclamación de la Junta Electoral de 5 miembros.',
      resolutions: 'Fijar fecha de comicios para el mes de agosto y designar como Presidente de Junta a Agustín Pereyra (6to A).',
      signedByPresident: true,
      signedByActasSecretary: true,
      signedByAdvisorTeacher: true,
      createdAt: '2026-07-28T16:00:00.000Z',
    },
  ];

  finances: FinanceEntry[] = [
    {
      id: 'fin-01',
      schoolId: 'sch-dean-funes',
      type: 'INGRESO',
      category: 'Kiosco / Buffet',
      amount: 45000,
      description: 'Recaudación del buffet en la jornada deportiva intercolegial de mayo.',
      date: '2026-05-20',
      receiptNumber: 'REC-0012',
      registeredBy: 'Secretaría de Finanzas (Valentin Osorio)',
      advisorApproved: true,
      advisorApprovedAt: '2026-05-21T09:00:00.000Z',
      createdAt: '2026-05-20T17:00:00.000Z',
    },
    {
      id: 'fin-02',
      schoolId: 'sch-dean-funes',
      type: 'EGRESO',
      category: 'Materiales / Evento',
      amount: 18500,
      description: 'Compra de pelotas de vóley, red y pintura para demarcación del patio escolar.',
      date: '2026-06-02',
      receiptNumber: 'FACT-B-8910',
      registeredBy: 'Secretaría de Finanzas (Valentin Osorio)',
      advisorApproved: true,
      advisorApprovedAt: '2026-06-03T11:30:00.000Z',
      createdAt: '2026-06-02T14:20:00.000Z',
    },
    {
      id: 'fin-03',
      schoolId: 'sch-dean-funes',
      type: 'INGRESO',
      category: 'Venta de Rifas',
      amount: 62000,
      description: 'Venta de bonos contribución para fondo de fotocopias solidarias.',
      date: '2026-07-10',
      receiptNumber: 'REC-0018',
      registeredBy: 'Secretaría de Finanzas (Valentin Osorio)',
      advisorApproved: true,
      advisorApprovedAt: '2026-07-11T10:15:00.000Z',
      createdAt: '2026-07-10T18:00:00.000Z',
    },
    {
      id: 'fin-04',
      schoolId: 'sch-dean-funes',
      type: 'EGRESO',
      category: 'Equipamiento',
      amount: 25000,
      description: 'Adquisición de micrófono y parlante portátil para asambleas estudiantiles.',
      date: '2026-08-10',
      receiptNumber: 'FACT-A-4102',
      registeredBy: 'Secretaría de Finanzas (Valentin Osorio)',
      advisorApproved: false, // Pendiente de Visto Bueno del Asesor
      createdAt: '2026-08-10T16:40:00.000Z',
    },
  ];

  news: NewsPost[] = [
    {
      id: 'nws-01',
      schoolId: null,
      schoolName: 'Agencia Córdoba Joven / Ministerio de Educación',
      authorName: 'Coordinación Provincial de Participación Estudiantil',
      title: 'Resolución Nº 124: Pautas para los Comicios y Funcionamiento de Centros 2026',
      summary: 'Recordatorio oficial sobre la vigencia del Estatuto Modelo, prevención de acefalía (Art. 17), aval del 10% del padrón (Art. 28) y representación de minorías (Art. 30).',
      content: 'El Ministerio de Educación de la Provincia de Córdoba y la Agencia Córdoba Joven ponen a disposición de todas las comunidades educativas de nivel secundario la plataforma provincial "Estudiantes al Centro" para garantizar la transparencia democrática, el voto universal y secreto en biombos, y la digitalización institucional.',
      category: 'Normativa',
      status: NewsStatus.APPROVED,
      isPinned: true,
      isProvincialNotice: true,
      createdAt: '2026-03-01T08:00:00.000Z',
      reviewedBy: 'SuperAdmin Provincial',
      reviewedAt: '2026-03-01T08:00:00.000Z',
    },
    {
      id: 'nws-02',
      schoolId: 'sch-dean-funes',
      schoolName: 'IPEM Nº 268 "Deán Funes"',
      authorName: 'Centro de Estudiantes IPEM 268',
      title: 'Exitosa Jornada de Convivencia y Torneo de Vóley Mixto',
      summary: 'Más de 180 estudiantes participaron del encuentro recreativo organizado por la Secretaría de Deportes y Cultura.',
      content: 'Con el objetivo de fortalecer los lazos de convivencia y compañerismo en el establecimiento, el Centro de Estudiantes coordinó una jornada deportiva con música, stands informativos y buffet solidario.',
      category: 'Cultura y Deportes',
      status: NewsStatus.APPROVED,
      isPinned: false,
      isProvincialNotice: false,
      createdAt: '2026-06-15T12:00:00.000Z',
      reviewedBy: 'Lic. Mariana Valdez',
      reviewedAt: '2026-06-16T09:00:00.000Z',
    },
    {
      id: 'nws-03',
      schoolId: 'sch-cassaffousth',
      schoolName: 'IPET Nº 247 "Ing. Carlos Cassaffousth"',
      authorName: 'Centro de Estudiantes Cassaffousth',
      title: 'Taller de Robótica e Impresión 3D abierto a la comunidad',
      summary: 'Iniciativa conjunta de los estudiantes técnicos para capacitar a compañeros de ciclos básicos.',
      content: 'La Secretaría de Asuntos Estudiantiles y Capacitación Técnica impulsó un ciclo de talleres de impresión 3D para fabricación de piezas didácticas y tableros para las aulas.',
      category: 'Institucional',
      status: NewsStatus.APPROVED,
      isPinned: false,
      isProvincialNotice: false,
      createdAt: '2026-07-04T15:30:00.000Z',
      reviewedBy: 'Lic. Mariana Valdez',
      reviewedAt: '2026-07-05T10:00:00.000Z',
    },
    {
      id: 'nws-04',
      schoolId: 'sch-simon-bolivar',
      schoolName: 'IPEM Nº 153 "Simón Bolívar"',
      authorName: 'Centro de Estudiantes Bolívar',
      title: 'Campaña de Colecta de Abrigo y Cuadernos para el Comedor Barrial',
      summary: 'Propuesta solidaria estudiantil de Río Cuarto en conjunto con el equipo de preceptores.',
      content: 'Invitamos a todas las divisiones a sumarse a la colecta solidaria de invierno. Los puntos de recepción estarán en el hall central durante los recreos.',
      category: 'Solidaridad',
      status: NewsStatus.PENDING, // Pending SuperAdmin moderation
      isPinned: false,
      isProvincialNotice: false,
      createdAt: '2026-08-22T11:00:00.000Z',
    },
  ];

  auditLogs: AuditLog[] = [
    {
      id: 'log-01',
      schoolId: 'sch-dean-funes',
      userId: 'usr-junta-deanfunes',
      userRole: 'ADMIN_JUNTA',
      action: 'OFICIALIZACION_LISTAS',
      details: 'Oficialización de Listas Nº 10, Nº 3 y Nº 7 tras verificar avales >= 10% del padrón electoral (Art. 28).',
      ipAddress: '190.220.14.8',
      timestamp: '2026-08-16T14:05:00.000Z',
    },
    {
      id: 'log-02',
      schoolId: 'sch-dean-funes',
      userId: 'usr-junta-deanfunes',
      userRole: 'ADMIN_JUNTA',
      action: 'GENERACION_TOKENS_PADRON',
      details: 'Generados 24 códigos de votación únicos de un solo uso asociados al DNI de los alumnos regulares.',
      ipAddress: '190.220.14.8',
      timestamp: '2026-08-20T08:00:00.000Z',
    },
  ];

  // Helper calculation for Minority Representation (Art. 30 Res. 124)
  calculateScrutinyResults(schoolId: string, electionId: string): ScrutinyResult {
    const election = this.elections.find(e => e.id === electionId && e.schoolId === schoolId);
    const votes = this.anonymousVotes.filter(v => v.electionId === electionId);
    const lists = this.lists.filter(l => l.electionId === electionId && l.isOfficialized);
    const padron = this.students.filter(s => s.schoolId === schoolId);

    const totalVoters = padron.length;
    const totalVotesCast = votes.length;
    const blankVotes = votes.filter(v => v.listId === null).length;
    const validVotes = totalVotesCast - blankVotes;
    const turnoutPercentage = totalVoters > 0 ? Number(((totalVotesCast / totalVoters) * 100).toFixed(1)) : 0;

    // Count votes per list
    const tallies: { [listId: string]: number } = {};
    lists.forEach(l => { tallies[l.id] = 0; });
    votes.forEach(v => {
      if (v.listId && tallies[v.listId] !== undefined) {
        tallies[v.listId]++;
      }
    });

    // Sort lists by vote count descending
    const sortedLists = [...lists].sort((a, b) => (tallies[b.id] || 0) - (tallies[a.id] || 0));

    // Secretarías a repartir según el Estatuto (Total de secretarías ejecutivas = 5 u obligatorias)
    // Secretarías estándar de la Comisión Directiva (Art. 6):
    const allSecretaries = [
      'Secretaría de Actas',
      'Secretaría de Finanzas',
      'Secretaría de Prensa y Difusión',
      'Secretaría de Cultura',
      'Secretaría de Recreación y Deportes',
      'Secretaría de DDHH y Convivencia',
    ];

    // Majority list gets President, Vicepresident, and 2/3 of secretarías (or all if no minority >= 20%)
    const winner = sortedLists[0];

    const listResults = sortedLists.map((list, index) => {
      const voteCount = tallies[list.id] || 0;
      const percentage = validVotes > 0 ? Number(((voteCount / validVotes) * 100).toFixed(1)) : 0;
      const isWinner = index === 0;
      const surpassed20 = percentage >= 20.0 && !isWinner;

      return {
        listId: list.id,
        listNumber: list.listNumber,
        listName: list.listName,
        colorHex: list.colorHex,
        votes: voteCount,
        percentageOfValidVotes: percentage,
        surpassed20PercentThreshold: surpassed20,
        awardedSecretariesCount: 0,
        awardedSecretaries: [] as string[],
        isWinner,
      };
    });

    // Calculate Art. 30: If any minority surpasses 20% of valid votes:
    // It gets 1/3 of secretarías (2 of 6). The majority gets 2/3 (4 of 6) + Presidente + Vicepresidente.
    const minorityQualifiers = listResults.filter(r => r.surpassed20PercentThreshold);

    if (minorityQualifiers.length > 0 && listResults.length > 0) {
      // 1/3 to the first minority
      const firstMinority = minorityQualifiers[0];
      firstMinority.awardedSecretariesCount = 2;
      firstMinority.awardedSecretaries = [allSecretaries[4], allSecretaries[5]]; // Deportes/DDHH a la minoría

      if (listResults[0]) {
        listResults[0].awardedSecretariesCount = 4;
        listResults[0].awardedSecretaries = [allSecretaries[0], allSecretaries[1], allSecretaries[2], allSecretaries[3]];
      }
    } else if (listResults.length > 0) {
      // No minority surpassed 20%: majority takes all secretarías
      listResults[0].awardedSecretariesCount = allSecretaries.length;
      listResults[0].awardedSecretaries = [...allSecretaries];
    }

    return {
      totalVoters,
      totalVotesCast,
      turnoutPercentage,
      validVotes,
      blankVotes,
      listResults,
      proclaimedAt: election?.disolvedAt,
    };
  }
}

export const db = new DatabaseStore();
