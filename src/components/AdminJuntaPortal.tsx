import React, { useState } from 'react';
import { School, Student, ElectoralList, JuntaMember, ElectionProcess, ScrutinyResult } from '../types';
import {
  UserCheck,
  Vote,
  Users,
  Award,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  KeyRound,
  Printer,
  RefreshCw,
  Clock,
  Sparkles,
  Search,
  Plus,
  Lock,
  PieChart as PieIcon,
  BarChart3,
  FileCheck,
  Sliders
} from 'lucide-react';

interface AdminJuntaPortalProps {
  school: School;
  election: ElectionProcess;
  padronList: Student[];
  lists: ElectoralList[];
  juntaMembers: JuntaMember[];
  isDisolved: boolean;
  onGenerateTokens: () => Promise<boolean>;
  onOfficializeList: (listId: string) => Promise<boolean>;
  onRegisterList: (listData: any) => Promise<boolean>;
  onComputeScrutiny: () => Promise<ScrutinyResult | null>;
  onProclaimElection: () => Promise<boolean>;
  onAddStudent: (studentData: any) => Promise<boolean>;
}

export const AdminJuntaPortal: React.FC<AdminJuntaPortalProps> = ({
  school,
  election,
  padronList = [],
  lists = [],
  juntaMembers = [],
  isDisolved = false,
  onGenerateTokens,
  onOfficializeList,
  onRegisterList,
  onComputeScrutiny,
  onProclaimElection,
  onAddStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'padron' | 'lists' | 'scrutiny' | 'junta'>('padron');
  const [padronSearch, setPadronSearch] = useState('');
  const [padronYearFilter, setPadronYearFilter] = useState('ALL');
  const [showPrintableTokens, setShowPrintableTokens] = useState(false);
  const [generatingTokens, setGeneratingTokens] = useState(false);
  const [scrutinyLoading, setScrutinyLoading] = useState(false);
  const [proclaimingLoading, setProclaimingLoading] = useState(false);
  const [scrutinyData, setScrutinyData] = useState<ScrutinyResult | null>(election?.results || null);

  // New list form
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListForm, setNewListForm] = useState({
    listNumber: (lists?.length || 0) + 1,
    listName: '',
    colorHex: '#3b82f6',
    motto: '',
    presidentName: '',
    presidentYear: 5,
    vicePresidentName: '',
    vicePresidentYear: 6,
    endorserCount: 0,
    proposalSummary: '',
  });

  // Add student form
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({
    dni: '',
    fullName: '',
    yearOfStudy: 1,
    division: 'A',
    shift: 'Mañana' as const,
  });

  // Filters & Calculations
  const totalStudents = padronList.length;
  const votedStudents = padronList.filter(s => s.hasVoted).length;
  const tokensGeneratedCount = padronList.filter(s => s.token).length;
  const required10PercentEndorsements = Math.ceil(totalStudents * 0.1);

  const filteredPadron = padronList.filter(st => {
    if (padronYearFilter !== 'ALL' && st.yearOfStudy.toString() !== padronYearFilter) {
      return false;
    }
    if (padronSearch) {
      const q = padronSearch.toLowerCase();
      return st.fullName.toLowerCase().includes(q) || st.dni.includes(q);
    }
    return true;
  });

  const handleRunScrutiny = async () => {
    setScrutinyLoading(true);
    const result = await onComputeScrutiny();
    if (result) {
      setScrutinyData(result);
    }
    setScrutinyLoading(false);
  };

  const handleProclaim = async () => {
    if (!confirm('¿Confirma la proclamación de las autoridades electas? Conforme al Art. 35 de la Res. 124, una vez proclamadas las autoridades, la Junta Electoral se DISOLVERÁ automáticamente y estas credenciales caducarán.')) {
      return;
    }
    setProclaimingLoading(true);
    await onProclaimElection();
    setProclaimingLoading(false);
  };

  const handleGenerateTokensClick = async () => {
    setGeneratingTokens(true);
    await onGenerateTokens();
    setGeneratingTokens(false);
  };

  const handleCreateListSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onRegisterList(newListForm);
    if (ok) {
      setShowNewListModal(false);
      setNewListForm({
        listNumber: lists.length + 2,
        listName: '',
        colorHex: '#10b981',
        motto: '',
        presidentName: '',
        presidentYear: 5,
        vicePresidentName: '',
        vicePresidentYear: 6,
        endorserCount: 0,
        proposalSummary: '',
      });
    }
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddStudent(studentForm);
    if (ok) {
      setShowAddStudentModal(false);
      setStudentForm({
        dni: '',
        fullName: '',
        yearOfStudy: 1,
        division: 'A',
        shift: 'Mañana',
      });
    }
  };

  // If Junta is disolved, display statutory notice
  if (isDisolved || election.juntaDisolved) {
    return (
      <div className="max-w-3xl mx-auto my-12 bg-white rounded-3xl p-8 border-2 border-slate-300 shadow-xl text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-500 border border-slate-300">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="bg-red-100 text-red-800 text-xs font-black uppercase px-3 py-1 rounded-full">
            Mandato Cumplido &bull; Acceso Caducado
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            Junta Electoral Disuelta Conforme a Estatuto
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            De acuerdo al <strong>Artículo 35º de la Resolución Nº 124/2010</strong>, una vez proclamadas las nuevas autoridades del Centro de Estudiantes y remitida el Acta correspondiente al Libro Foliado, <em>la Junta Electoral cesa en sus funciones de pleno derecho</em>.
          </p>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left max-w-lg mx-auto space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-800">
            <CheckCircle className="w-4 h-4" /> Proclamación Finalizada
          </div>
          <div>El Acta de Proclamación se encuentra foliada en el Libro de Actas de la institución escolar.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Junta Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Junta Electoral (Art. 25)
            </span>
            <span className="text-emerald-300 text-xs font-mono">CUE: {school.cue}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Comicios Electorales &bull; {school.name}
          </h2>
          <p className="text-emerald-200 text-xs sm:text-sm mt-1">
            Órgano electoral independiente constituido por 5 estudiantes de los dos últimos años lectivos.
          </p>
        </div>

        {/* Turnout Pill */}
        <div className="flex items-center gap-3 bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800/80">
          <div className="text-center px-3 border-r border-emerald-800">
            <div className="text-xl font-black text-amber-300">
              {votedStudents} / {totalStudents}
            </div>
            <div className="text-[10px] text-emerald-300 font-medium uppercase">Votaron</div>
          </div>
          <div className="text-center px-3">
            <div className="text-xl font-black text-sky-300">
              {totalStudents > 0 ? ((votedStudents / totalStudents) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-[10px] text-emerald-300 font-medium uppercase">Participación</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('padron')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'padron'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Padrón Electoral & Tokens ({padronList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'lists'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Listas & Avales 10% ({lists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scrutiny')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'scrutiny'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Escrutinio & Minorías (Art. 30)</span>
        </button>

        <button
          onClick={() => setActiveTab('junta')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'junta'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Integrantes de la Junta (Art. 25)</span>
        </button>
      </div>

      {/* TAB 1: PADRÓN ELECTORAL Y TOKENS */}
      {activeTab === 'padron' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar estudiante por DNI o apellido..."
                  value={padronSearch}
                  onChange={e => setPadronSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={padronYearFilter}
                onChange={e => setPadronYearFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700"
              >
                <option value="ALL">Todos los Años</option>
                {[1, 2, 3, 4, 5, 6, 7].map(y => (
                  <option key={y} value={y.toString()}>
                    {y}º Año
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Alumno</span>
              </button>

              <button
                onClick={handleGenerateTokensClick}
                disabled={generatingTokens}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition"
              >
                {generatingTokens ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                <span>Generar Tokens Únicos ({tokensGeneratedCount}/{totalStudents})</span>
              </button>

              <button
                onClick={() => setShowPrintableTokens(!showPrintableTokens)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{showPrintableTokens ? 'Ocultar Planilla' : 'Planilla de Mesa'}</span>
              </button>
            </div>
          </div>

          {/* Printable Tokens Strip */}
          {showPrintableTokens && (
            <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-amber-900 text-sm">
                    Planilla de Tokens de Votación para Autoridades de Mesa
                  </h4>
                  <p className="text-xs text-amber-800">
                    Entregar cada código al estudiante correspondiente en la mesa de votación antes de ingresar al biombo con la Netbook.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Troqueles
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {padronList.map(st => (
                  <div
                    key={st.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      st.hasVoted
                        ? 'bg-slate-200 border-slate-300 opacity-60'
                        : 'bg-white border-amber-200 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-800 truncate max-w-[120px]">{st.fullName}</div>
                      <div className="text-[10px] text-slate-500">DNI: {st.dni} ({st.yearOfStudy}º {st.division})</div>
                    </div>
                    <div className="font-mono font-black text-sm text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      {st.token || '---'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">DNI</th>
                    <th className="p-3.5">Nombre Completo</th>
                    <th className="p-3.5">Curso y División</th>
                    <th className="p-3.5">Condición</th>
                    <th className="p-3.5 text-center">Token Asignado</th>
                    <th className="p-3.5 text-center">Estado del Voto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPadron.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{st.dni}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{st.fullName}</td>
                      <td className="p-3.5 font-medium">
                        {st.yearOfStudy}º Año "{st.division}" ({st.shift})
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">
                          Regular
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                        {st.token ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{st.token}</span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No generado</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {st.hasVoted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> SUFRAGÓ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> PENDIENTE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LISTAS Y AVALES DEL 10% */}
      {activeTab === 'lists' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Listas Electorales Presentadas (Art. 28)
              </h3>
              <p className="text-xs text-slate-500">
                Padrón Total: <strong>{totalStudents}</strong> estudiantes &bull; Aval mínimo obligatorio (10%):{' '}
                <strong className="text-emerald-700">{required10PercentEndorsements} firmas</strong>
              </p>
            </div>

            <button
              onClick={() => setShowNewListModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nueva Lista</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lists.map(list => {
              const hasEndorsements = list.endorserCount >= required10PercentEndorsements;
              const acefaliaOk = list.presidentYear < 6 || list.vicePresidentYear < 6;

              return (
                <div
                  key={list.id}
                  className="bg-white rounded-3xl border-2 p-6 shadow-sm flex flex-col justify-between space-y-4 transition"
                  style={{ borderColor: list.colorHex }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full shadow-xs"
                          style={{ backgroundColor: list.colorHex }}
                        ></span>
                        <span className="font-black text-slate-900 text-lg">
                          Lista {list.listNumber}: {list.listName}
                        </span>
                      </div>

                      {list.isOfficialized ? (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Oficializada
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          En Trámite
                        </span>
                      )}
                    </div>

                    <p className="text-xs italic text-slate-500 font-medium">"{list.motto}"</p>

                    {/* Formula candidates */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Presidente:</span>
                        <span className="font-semibold text-slate-900">
                          {list.presidentName} ({list.presidentYear}º Año)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Vicepresidente:</span>
                        <span className="font-semibold text-slate-900">
                          {list.vicePresidentName} ({list.vicePresidentYear}º Año)
                        </span>
                      </div>
                    </div>

                    {/* Statutory compliance meters */}
                    <div className="space-y-2 text-xs">
                      {/* 10% Endorsements requirement */}
                      <div className="p-3 rounded-xl border bg-slate-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-700">
                            Avales del Padrón (Art. 28 - Mín. 10%):
                          </span>
                          <span
                            className={`font-black ${
                              hasEndorsements ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {list.endorserCount} / {required10PercentEndorsements}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              hasEndorsements ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (list.endorserCount / required10PercentEndorsements) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Art 17 Acefalía */}
                      <div
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          acefaliaOk
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                      >
                        {acefaliaOk ? (
                          <>
                            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>Cumple regla antiacefalía Art. 17</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                            <span>Infringe Art. 17 (ambos candidatos son del último año)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!list.isOfficialized && (
                    <button
                      onClick={() => onOfficializeList(list.id)}
                      disabled={!hasEndorsements || !acefaliaOk}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs ${
                        hasEndorsements && acefaliaOk
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>
                        {hasEndorsements && acefaliaOk
                          ? 'Oficializar Lista (Aprobada por Junta)'
                          : 'Requisitos Estatutarios Insuficientes'}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ESCRUTINIO Y REPRESENTACIÓN DE MINORÍAS (ART. 30) */}
      {activeTab === 'scrutiny' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Escrutinio Definitivo y Asignación de Secretarías
                </h3>
                <p className="text-xs text-slate-500">
                  Cálculo automático de votos válidos, votos en blanco y adjudicación de un tercio (1/3) de las secretarías a minorías con &ge; 20% (Art. 30).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunScrutiny}
                  disabled={scrutinyLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
                >
                  {scrutinyLoading ? <Clock className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>Actualizar Cómputos Electorales</span>
                </button>

                <button
                  onClick={handleProclaim}
                  disabled={proclaimingLoading || !scrutinyData}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
                >
                  {proclaimingLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4 text-amber-400" />}
                  <span>Proclamar Autoridades & Disolver Junta (Art. 35)</span>
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {scrutinyData ? (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="font-bold text-slate-400 uppercase">Padrón Total</div>
                    <div className="text-2xl font-black text-slate-900">{scrutinyData.totalVoters}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="font-bold text-slate-400 uppercase">Votos Emitidos</div>
                    <div className="text-2xl font-black text-emerald-600">{scrutinyData.totalVotesCast}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="font-bold text-slate-400 uppercase">Votos Válidos</div>
                    <div className="text-2xl font-black text-blue-600">{scrutinyData.validVotes}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="font-bold text-slate-400 uppercase">Votos en Blanco</div>
                    <div className="text-2xl font-black text-slate-500">{scrutinyData.blankVotes}</div>
                  </div>
                </div>

                {/* List outcome cards with 20% threshold */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Resultado por Lista y Distribución de Cargos
                  </h4>

                  <div className="space-y-3">
                    {scrutinyData.listResults.map(lr => (
                      <div
                        key={lr.listId}
                        className={`p-5 rounded-2xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          lr.isWinner
                            ? 'bg-emerald-50/50 border-emerald-400'
                            : lr.surpassed20PercentThreshold
                            ? 'bg-blue-50/40 border-blue-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: lr.colorHex }}
                            ></span>
                            <span className="font-black text-slate-900 text-base">
                              Lista {lr.listNumber}: {lr.listName}
                            </span>
                            {lr.isWinner && (
                              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                <Award className="w-3 h-3" /> Mayoría Ganadora (2/3)
                              </span>
                            )}
                            {lr.surpassed20PercentThreshold && !lr.isWinner && (
                              <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                                Minoría Calificada (&ge;20% &bull; 1/3)
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 flex items-center gap-3">
                            <span>Votos: <strong>{lr.votes}</strong></span>
                            <span>&bull;</span>
                            <span>
                              Porcentaje sobre Votos Válidos:{' '}
                              <strong className="text-slate-900 text-sm">
                                {lr.percentageOfValidVotes.toFixed(1)}%
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Secretarías awarded */}
                        <div className="text-xs bg-white p-3 rounded-xl border border-slate-200/80 min-w-[280px]">
                          <div className="font-bold text-slate-800 mb-1">
                            Secretarías Adjudicadas: {lr.awardedSecretariesCount}
                          </div>
                          <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
                            {lr.awardedSecretaries.map((sec, i) => (
                              <li key={i}>{sec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No se han computado los resultados del escrutinio</p>
                <p className="text-xs text-slate-400 mt-1">Hacé clic en "Actualizar Cómputos Electorales" para procesar los sufragios de la urna.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: INTEGRANTES DE LA JUNTA ELECTORAL (ART. 25) */}
      {activeTab === 'junta' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">
                Constitución de la Junta Electoral
              </h3>
              <p className="text-xs text-slate-500">
                Conforme al <strong>Artículo 25º de la Res. 124</strong>, la Junta se integra obligatoriamente por 5 alumnos de los dos últimos cursos lectivos.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs pt-2">
            {juntaMembers.map(m => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">{m.fullName}</div>
                  <div className="text-slate-500 text-[11px]">
                    DNI: {m.dni} &bull; {m.yearOfStudy}º Año "{m.division}"
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                    {m.roleInJunta}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">Penúltimo / Último año OK</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NUEVA LISTA */}
      {showNewListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Inscribir Lista Electoral (Art. 28)</h3>
              <button onClick={() => setShowNewListModal(false)} className="text-white/80 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateListSubmit} className="p-5 space-y-3 overflow-y-auto text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nº de Lista *</label>
                  <input
                    type="number"
                    value={newListForm.listNumber}
                    onChange={e => setNewListForm({ ...newListForm, listNumber: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nombre / Lema de la Lista *</label>
                  <input
                    type="text"
                    placeholder="Ej: Compromiso y Futuro Estudiantil"
                    value={newListForm.listName}
                    onChange={e => setNewListForm({ ...newListForm, listName: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Color Identificatorio *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newListForm.colorHex}
                      onChange={e => setNewListForm({ ...newListForm, colorHex: e.target.value })}
                      className="w-10 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                    />
                    <span className="font-mono text-slate-600 text-[11px]">{newListForm.colorHex}</span>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Avales Iniciales Cargados *</label>
                  <input
                    type="number"
                    min={0}
                    value={newListForm.endorserCount}
                    onChange={e => setNewListForm({ ...newListForm, endorserCount: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="font-bold text-slate-800 text-xs">Fórmula Presidencial (Art. 17 Acefalía)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Candidato a Presidente</label>
                    <input
                      type="text"
                      placeholder="Nombre del alumno"
                      value={newListForm.presidentName}
                      onChange={e => setNewListForm({ ...newListForm, presidentName: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <select
                      value={newListForm.presidentYear}
                      onChange={e => setNewListForm({ ...newListForm, presidentYear: Number(e.target.value) })}
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded p-1 text-[11px]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(y => (
                        <option key={y} value={y}>{y}º Año</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Candidato a Vicepresidente</label>
                    <input
                      type="text"
                      placeholder="Nombre del alumno"
                      value={newListForm.vicePresidentName}
                      onChange={e => setNewListForm({ ...newListForm, vicePresidentName: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <select
                      value={newListForm.vicePresidentYear}
                      onChange={e => setNewListForm({ ...newListForm, vicePresidentYear: Number(e.target.value) })}
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded p-1 text-[11px]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(y => (
                        <option key={y} value={y}>{y}º Año</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Eslogan o Propuestas Principales</label>
                <textarea
                  rows={2}
                  placeholder="Síntesis de propuestas..."
                  value={newListForm.motto}
                  onChange={e => setNewListForm({ ...newListForm, motto: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewListModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Inscribir Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR ESTUDIANTE */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Incorporar al Padrón</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-white/80 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">DNI del Alumno *</label>
                <input
                  type="text"
                  placeholder="Ej: 46219800"
                  value={studentForm.dni}
                  onChange={e => setStudentForm({ ...studentForm, dni: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Ej: Valentina Gómez"
                  value={studentForm.fullName}
                  onChange={e => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Año *</label>
                  <select
                    value={studentForm.yearOfStudy}
                    onChange={e => setStudentForm({ ...studentForm, yearOfStudy: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(y => (
                      <option key={y} value={y}>{y}º Año</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">División *</label>
                  <input
                    type="text"
                    value={studentForm.division}
                    onChange={e => setStudentForm({ ...studentForm, division: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Guardar en Padrón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
