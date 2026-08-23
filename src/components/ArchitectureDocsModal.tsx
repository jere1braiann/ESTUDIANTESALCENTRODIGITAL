import React, { useState } from 'react';
import { Layers, Database, Shield, Server, FileText, Code2, CheckCircle2, Copy } from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'security' | 'statute'>('architecture');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-red-600 to-amber-500 rounded-xl">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Arquitectura de Software & Base de Datos Relacional
              </h3>
              <p className="text-xs text-slate-400">
                Especificación técnica de "Estudiantes al Centro" &bull; Resolución Nº 124 Córdoba
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-lg transition"
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 pt-3 flex flex-wrap gap-2 border-b border-slate-200 text-xs font-bold">
          {[
            { id: 'architecture', label: '1. Arquitectura Modular & Backend', icon: <Server className="w-3.5 h-3.5" /> },
            { id: 'schema', label: '2. Esquema Relacional (SQL / Prisma)', icon: <Database className="w-3.5 h-3.5" /> },
            { id: 'security', label: '3. Seguridad, RBAC & Urna Anónima', icon: <Shield className="w-3.5 h-3.5" /> },
            { id: 'statute', label: '4. Mapeo Resolución Nº 124/10', icon: <FileText className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl transition ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 border-t-2 border-x border-slate-200 border-t-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">
          {/* TAB 1: ARQUITECTURA */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                <h4 className="font-extrabold text-blue-900 text-sm mb-1">
                  Arquitectura en Capas (Layered / Clean Architecture)
                </h4>
                <p className="text-blue-800 leading-relaxed">
                  El sistema desacopla estrictamente el ruteo HTTP, la autenticación/autorización RBAC con caducidad temporal, los controladores de dominio y el motor de persistencia relacional.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1 text-sky-700">
                    <Server className="w-4 h-4" /> 1. API Gateway
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Express.js montado en <code>/api</code>. Valida payloads, rate limits y cabeceras de sesión.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1 text-indigo-700">
                    <Shield className="w-4 h-4" /> 2. Middlewares RBAC
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Verificación de rol (<code>SUPERADMIN</code>, <code>ADMIN_CD</code>, <code>ADMIN_JUNTA</code>) e invalidación de token según Art. 35.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1 text-emerald-700">
                    <Code2 className="w-4 h-4" /> 3. Domain Controllers
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Lógica de negocio: escrutinio definitivo, cálculo de piso 20%, verificación antiacefalía y control contable con Profesor Asesor.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1 text-amber-700">
                    <Database className="w-4 h-4" /> 4. Persistencia
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    PostgreSQL con Prisma ORM / SQL relacional con transacciones atómicas para la urna y libros foliados.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto space-y-1">
                <div className="text-slate-400 font-bold">// Estructura de Módulos del Backend</div>
                <div>/server</div>
                <div>&nbsp;&nbsp;├── types.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Tipos y modelos de dominio</div>
                <div>&nbsp;&nbsp;├── db/</div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── schema.sql &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// DDL Relacional PostgreSQL</div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── prisma.schema &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Esquema Prisma ORM</div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── store.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Store en memoria & lógica de escrutinio</div>
                <div>&nbsp;&nbsp;├── middlewares/auth.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// RBAC y caducidad de Junta (Art. 35)</div>
                <div>&nbsp;&nbsp;├── controllers/</div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── publicController.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Portal público y foro</div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── superadminController.ts &nbsp;&nbsp;&nbsp;// Moderación y gestión de colegios</div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── adminCDController.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Actas, finanzas y validador de fórmula</div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── adminJuntaController.ts &nbsp;&nbsp;&nbsp;// Padrón, listas, escrutinio y proclamación</div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── votingController.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Votación y urna anónima</div>
                <div>&nbsp;&nbsp;└── routes/apiRouter.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Ruteador central Express</div>
              </div>
            </div>
          )}

          {/* TAB 2: ESQUEMA RELACIONAL */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">
                  Tablas Principales y Relaciones de Integridad Referencial
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] mt-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-blue-700">1. School (Colegio CUE)</strong>
                    <p className="text-slate-500">
                      Entidad raíz. CUE único, departamento, ciudad, estado de adhesión y profesor asesor asignado.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-indigo-700">2. StudentPadron & Token</strong>
                    <p className="text-slate-500">
                      DNI, nombre, curso, regularidad y token efímero de votación (hasVoted = true).
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-emerald-700">3. AnonymousVote (Urna Desacoplada)</strong>
                    <p className="text-slate-500">
                      electionId, listId (nullable para voto en blanco) y receiptHash. <strong>Sin FK a StudentPadron</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-amber-700">4. MinuteActa & FinanceEntry</strong>
                    <p className="text-slate-500">
                      Libro de actas foliado digital y asientos contables con doble firma (Secretario + Profesor Asesor).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-72">
                <div className="text-emerald-400 font-bold">// DDL Relacional PostgreSQL (Extracto)</div>
                <pre>{`CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cue VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  advisor_teacher_name VARCHAR(150),
  advisor_teacher_email VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anonymous_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  list_id UUID REFERENCES electoral_lists(id), -- NULL = Voto en Blanco
  receipt_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  -- NO EXISTE FK A STUDENT PARA GARANTIZAR EL SECRETO DEL VOTO
);`}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: SEGURIDAD & URNA ANÓNIMA */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="font-bold text-emerald-900 mb-1">Desacoplamiento Criptográfico</div>
                  <p className="text-emerald-800 text-[11px]">
                    El padrón electoral registra que el DNI sufragó (<code>hasVoted: true</code>), pero la papeleta digital se deposita en una tabla independiente sin ningún puntero al alumno.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <div className="font-bold text-blue-900 mb-1">Tokens de Un Solo Uso</div>
                  <p className="text-blue-800 text-[11px]">
                    Los tokens se generan aleatoriamente, se entregan en mano en la mesa de autoridades y se queman inmediatamente tras el depósito en la urna.
                  </p>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                  <div className="font-bold text-rose-900 mb-1">Disolución de Sesión (Art. 35)</div>
                  <p className="text-rose-800 text-[11px]">
                    Al completar la proclamación, el middleware de autenticación bloquea cualquier acceso posterior con las credenciales de la Junta Electoral.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESOLUCIÓN 124/2010 */}
          {activeTab === 'statute' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">Art. 6 (Estructura de la CD):</strong>
                  <p className="text-slate-500 text-[11px]">Tope de 7 secretarías, Actas y Finanzas obligatorias, titular y suplente.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">100% CUMPLIDO</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">Art. 17 (Prevención de Acefalía):</strong>
                  <p className="text-slate-500 text-[11px]">Al menos uno de los integrantes de la fórmula (Pres. o Vice) no debe pertenecer al último año.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">100% CUMPLIDO</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">Art. 25 (Junta Electoral):</strong>
                  <p className="text-slate-500 text-[11px]">5 estudiantes de los dos últimos años del plan de estudios.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">100% CUMPLIDO</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">Art. 28 (Avales del Padrón):</strong>
                  <p className="text-slate-500 text-[11px]">Mínimo del 10% del padrón electoral para oficializar listas.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">100% CUMPLIDO</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">Art. 30 (Representación de Minorías):</strong>
                  <p className="text-slate-500 text-[11px]">Piso del 20% de votos válidos para adjudicar 1/3 de las Secretarías.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">100% CUMPLIDO</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">Art. 35 (Disolución de la Junta):</strong>
                  <p className="text-slate-500 text-[11px]">Caducidad automática de credenciales tras la emisión del Acta de Proclamación.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">100% CUMPLIDO</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">Art. 41 (Profesor Asesor):</strong>
                  <p className="text-slate-500 text-[11px]">Doble firma y control contable de todos los ingresos y gastos del Centro.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">100% CUMPLIDO</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Estudiantes al Centro &bull; Arquitectura Full-Stack Node.js & React
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition"
          >
            Cerrar Especificación
          </button>
        </div>
      </div>
    </div>
  );
};
