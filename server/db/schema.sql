-- ==============================================================================
-- PLATAFORMA "ESTUDIANTES AL CENTRO" (PROVINCIA DE CÓRDOBA)
-- ESQUEMA RELACIONAL POSTGRESQL - ESTATUTO MODELO RESOLUCIÓN Nº 124/2010
-- ==============================================================================

-- Habilitar extensión para UUIDs criptográficos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TIPOS ENUMERADOS
CREATE TYPE role_type AS ENUM ('SUPERADMIN', 'ADMIN_CD', 'ADMIN_JUNTA');
CREATE TYPE school_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE news_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE election_status AS ENUM ('DRAFT', 'ENROLLMENT_OPEN', 'LISTS_OFFICIALIZED', 'VOTING_OPEN', 'VOTING_CLOSED', 'SCRUTINY_COMPLETED', 'PROCLAIMED');
CREATE TYPE finance_type AS ENUM ('INGRESO', 'EGRESO');
CREATE TYPE acta_type AS ENUM ('Ordinaria', 'Extraordinaria', 'Asamblea General', 'Comisión Directiva', 'Junta Electoral');

-- 2. TABLA DE COLEGIOS / INSTITUCIONES EDUCATIVAS
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cue VARCHAR(15) NOT NULL UNIQUE, -- Código Único de Establecimiento
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL, -- Departamento provincial (Capital, Colón, Río Cuarto, etc.)
    city VARCHAR(100) NOT NULL,
    status school_status NOT NULL DEFAULT 'PENDING',
    advisor_teacher_name VARCHAR(150),
    advisor_teacher_email VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE USUARIOS Y ROLES (RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role role_type NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL, -- Para AdminJunta: vencimiento automático post-proclamación (Art. 35)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROCESO ELECTORAL POR COLEGIO
CREATE TABLE election_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    year INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    status election_status NOT NULL DEFAULT 'DRAFT',
    election_date DATE NOT NULL,
    voting_start_time TIME NOT NULL DEFAULT '08:00:00',
    voting_end_time TIME NOT NULL DEFAULT '16:00:00',
    junta_disolved BOOLEAN NOT NULL DEFAULT FALSE,
    disolved_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_school_year_election UNIQUE (school_id, year)
);

-- 5. JUNTA ELECTORAL (Art. 25: 5 Estudiantes de los dos últimos años)
CREATE TABLE junta_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES election_processes(id) ON DELETE CASCADE,
    dni VARCHAR(15) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    year_of_study INT NOT NULL CHECK (year_of_study >= 5), -- Últimos 2 años según secundario común/técnico
    division VARCHAR(10) NOT NULL,
    role_in_junta VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PADRÓN ESTUDIANTIL (Art. 6 & 11: Todos los estudiantes regulares)
CREATE TABLE students_padron (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    election_id UUID NOT NULL REFERENCES election_processes(id) ON DELETE CASCADE,
    dni VARCHAR(15) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    year_of_study INT NOT NULL CHECK (year_of_study BETWEEN 1 AND 7),
    division VARCHAR(10) NOT NULL,
    shift VARCHAR(20) NOT NULL DEFAULT 'Mañana',
    is_regular BOOLEAN NOT NULL DEFAULT TRUE,
    has_voted BOOLEAN NOT NULL DEFAULT FALSE, -- Control anti-doble voto
    voted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_election UNIQUE (election_id, dni)
);

-- 7. TOKENS DE VOTACIÓN ÚNICOS (Mesa de autoridades y Netbooks en biombos)
CREATE TABLE voting_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL UNIQUE REFERENCES students_padron(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL, -- Token hasheado en reposo
    token_raw_masked VARCHAR(10) NOT NULL, -- Prefijo para verificación de mesa
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. LISTAS ELECTORALES Y AVALES (Art. 28: Mínimo 10% de avales del padrón)
CREATE TABLE electoral_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES election_processes(id) ON DELETE CASCADE,
    list_number INT NOT NULL,
    list_name VARCHAR(150) NOT NULL,
    color_hex VARCHAR(10) NOT NULL DEFAULT '#1E40AF',
    motto TEXT,
    president_name VARCHAR(150) NOT NULL,
    president_year INT NOT NULL,
    vice_president_name VARCHAR(150) NOT NULL,
    vice_president_year INT NOT NULL,
    endorser_count INT NOT NULL DEFAULT 0,
    is_officialized BOOLEAN NOT NULL DEFAULT FALSE,
    officialized_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Validación obligatoria de Art. 17 (Prevención de Acefalía): Al menos uno no debe pertenecer al último año
    CONSTRAINT check_acefalia_rule CHECK (president_year < 6 OR vice_president_year < 6),
    CONSTRAINT unique_list_number_per_election UNIQUE (election_id, list_number)
);

-- 9. CANDIDATOS POR LISTA (Art. 6: Titulares y Suplentes en cada Secretaría)
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES electoral_lists(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    dni VARCHAR(15) NOT NULL,
    year_of_study INT NOT NULL,
    division VARCHAR(10) NOT NULL,
    position VARCHAR(80) NOT NULL,
    is_substitute BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. URNA DIGITAL ANÓNIMA (Art. 3 inc c: Voto Universal y Secreto)
-- Nota de arquitectura: La tabla no almacena student_id ni DNI para garantizar anonimato estricto.
CREATE TABLE votes_ballot_box (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES election_processes(id) ON DELETE CASCADE,
    list_id UUID REFERENCES electoral_lists(id) ON DELETE SET NULL, -- NULL = Voto en Blanco
    receipt_hash VARCHAR(64) NOT NULL UNIQUE, -- Comprobante criptográfico anónimo para el alumno
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. LIBRO DE ACTAS DIGITALIZADO
CREATE TABLE minutes_actas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    act_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    type acta_type NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(150) NOT NULL DEFAULT 'Establecimiento Educativo',
    attendees_count INT NOT NULL,
    quorum_reached BOOLEAN NOT NULL DEFAULT TRUE,
    agenda_topics TEXT NOT NULL,
    content TEXT NOT NULL,
    resolutions TEXT NOT NULL,
    signed_by_president BOOLEAN NOT NULL DEFAULT TRUE,
    signed_by_actas_secretary BOOLEAN NOT NULL DEFAULT TRUE,
    signed_by_advisor_teacher BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_act_number_per_school UNIQUE (school_id, act_number)
);

-- 12. GESTIÓN FINANCIERA Y CONTABLE (Art. 20 y 41: Visto bueno del Profesor Asesor)
CREATE TABLE finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    type finance_type NOT NULL,
    category VARCHAR(80) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    receipt_number VARCHAR(50),
    registered_by VARCHAR(150) NOT NULL,
    advisor_approved BOOLEAN NOT NULL DEFAULT FALSE,
    advisor_approved_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. NOTICIAS Y FORO PÚBLICO PROVINCIAL
CREATE TABLE news_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL, -- NULL para anuncios del SuperAdmin provincial
    author_name VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    status news_status NOT NULL DEFAULT 'PENDING',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_provincial_notice BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_by VARCHAR(150),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. LOGS DE AUDITORÍA
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES ESTRATÉGICOS PARA MÁXIMA PERFORMANCE
CREATE INDEX idx_students_dni ON students_padron(dni);
CREATE INDEX idx_students_has_voted ON students_padron(election_id, has_voted);
CREATE INDEX idx_votes_election ON votes_ballot_box(election_id);
CREATE INDEX idx_votes_list ON votes_ballot_box(list_id);
CREATE INDEX idx_news_status ON news_posts(status, is_pinned DESC);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at DESC);
