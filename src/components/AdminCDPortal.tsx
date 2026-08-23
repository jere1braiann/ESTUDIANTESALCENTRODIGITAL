import React, { useState } from 'react';
import { School, MinuteActa, FinanceEntry, User } from '../types';
import {
  BookOpen,
  FileText,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Plus,
  Clock,
  Send,
  Printer,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Award,
  Signature
} from 'lucide-react';

interface AdminCDPortalProps {
  school: School;
  actasList: MinuteActa[];
  financesList: FinanceEntry[];
  currentUser: User;
  onValidateFormula: (formulaData: any) => Promise<any>;
  onCreateActa: (actaData: any) => Promise<boolean>;
  onSignActaByAdvisor: (actaId: string) => Promise<boolean>;
  onCreateFinance: (financeData: any) => Promise<boolean>;
  onApproveFinanceByAdvisor: (financeId: string) => Promise<boolean>;
  onSubmitNewsDraft: (newsData: any) => Promise<boolean>;
}

export const AdminCDPortal: React.FC<AdminCDPortalProps> = ({
  school,
  actasList = [],
  financesList = [],
  currentUser,
  onValidateFormula,
  onCreateActa,
  onSignActaByAdvisor,
  onCreateFinance,
  onApproveFinanceByAdvisor,
  onSubmitNewsDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'actas' | 'finances' | 'validator' | 'news'>('actas');
  const [selectedActa, setSelectedActa] = useState<MinuteActa | null>(actasList?.[0] || null);

  React.useEffect(() => {
    if (!selectedActa && actasList && actasList.length > 0) {
      setSelectedActa(actasList[0]);
    }
  }, [actasList, selectedActa]);

  // New Acta form
  const [showNewActaModal, setShowNewActaModal] = useState(false);
  const [actaForm, setActaForm] = useState({
    title: '',
    type: 'Comisión Directiva',
    date: new Date().toISOString().split('T')[0],
    location: `${school.name} - Sala de Reuniones`,
    attendeesCount: 12,
    quorumReached: true,
    agendaTopics: '',
    content: '',
    resolutions: '',
    signedByAdvisorTeacher: true,
  });
  const [actaLoading, setActaLoading] = useState(false);

  // New Finance form
  const [showNewFinanceModal, setShowNewFinanceModal] = useState(false);
  const [financeForm, setFinanceForm] = useState({
    type: 'INGRESO' as 'INGRESO' | 'EGRESO',
    category: 'Kiosco / Buffet',
    amount: 10000,
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: '',
  });
  const [financeLoading, setFinanceLoading] = useState(false);

  // CD Formula Validator state
  const [formulaState, setFormulaState] = useState({
    presidentName: 'Martina Rodríguez',
    presidentYear: 5, // 5th year -> OK
    vicePresidentName: 'Gonzalo Moyano',
    vicePresidentYear: 6, // 6th year -> OK (because Martina is in 5th)
    isTechnicalSchool: false,
    secretaries: [
      { position: 'Secretaría de Actas', titularName: 'Clara Del Valle', suplenteName: 'Ignacio Peña' },
      { position: 'Secretaría de Finanzas', titularName: 'Valentin Osorio', suplenteName: 'Luciana Paz' },
      { position: 'Secretaría de Prensa y Difusión', titularName: 'Federico Bazán', suplenteName: 'Matías Luján' },
      { position: 'Secretaría de Cultura', titularName: 'Milena Suárez', suplenteName: 'Zoe Rivas' },
      { position: 'Secretaría de Recreación y Deportes', titularName: 'Lucas Montenegro', suplenteName: 'Tomás Albornoz' },
    ],
  });
  const [formulaResult, setFormulaResult] = useState<any>(null);
  const [validatingFormula, setValidatingFormula] = useState(false);

  // News draft state
  const [draftForm, setDraftForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Institucional',
  });
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftSuccess, setDraftSuccess] = useState(false);

  // Financial summary
  const totalIncome = financesList.filter(f => f.type === 'INGRESO' && f.advisorApproved).reduce((a, b) => a + b.amount, 0);
  const totalExpenses = financesList.filter(f => f.type === 'EGRESO' && f.advisorApproved).reduce((a, b) => a + b.amount, 0);
  const currentBalance = totalIncome - totalExpenses;
  const pendingApprovals = financesList.filter(f => !f.advisorApproved).length;

  const handleTestFormula = async () => {
    setValidatingFormula(true);
    const res = await onValidateFormula(formulaState);
    setFormulaResult(res);
    setValidatingFormula(false);
  };

  const handleCreateActaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActaLoading(true);
    const ok = await onCreateActa(actaForm);
    setActaLoading(false);
    if (ok) {
      setShowNewActaModal(false);
      setActaForm({
        title: '',
        type: 'Comisión Directiva',
        date: new Date().toISOString().split('T')[0],
        location: `${school.name} - Sala de Reuniones`,
        attendeesCount: 12,
        quorumReached: true,
        agendaTopics: '',
        content: '',
        resolutions: '',
        signedByAdvisorTeacher: true,
      });
    }
  };

  const handleCreateFinanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFinanceLoading(true);
    const ok = await onCreateFinance(financeForm);
    setFinanceLoading(false);
    if (ok) {
      setShowNewFinanceModal(false);
      setFinanceForm({
        type: 'INGRESO',
        category: 'Kiosco / Buffet',
        amount: 10000,
        description: '',
        date: new Date().toISOString().split('T')[0],
        receiptNumber: '',
      });
    }
  };

  const handleDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDraftLoading(true);
    const ok = await onSubmitNewsDraft(draftForm);
    setDraftLoading(false);
    if (ok) {
      setDraftSuccess(true);
      setTimeout(() => {
        setDraftSuccess(false);
        setDraftForm({ title: '', summary: '', content: '', category: 'Institucional' });
      }, 2500);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* CD Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Centro de Estudiantes Activo
            </span>
            <span className="text-blue-200 text-xs font-mono">CUE: {school.cue}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {school.name}
          </h2>
          <p className="text-blue-200 text-xs sm:text-sm mt-1">
            <strong>Profesor Asesor:</strong> {school.advisorTeacherName || 'Prof. Marcelo Altamirano'} &bull; Control y supervisión contable conforme al Art. 41 de la Res. 124.
          </p>
        </div>

        {/* Quick Finance & Actas Snapshot */}
        <div className="flex items-center gap-3 bg-blue-950/80 p-3 rounded-2xl border border-blue-800/80">
          <div className="text-center px-3 border-r border-blue-800">
            <div className="text-xl font-black text-emerald-400">
              ${currentBalance.toLocaleString('es-AR')}
            </div>
            <div className="text-[10px] text-blue-300 font-medium uppercase">Saldo Contable</div>
          </div>
          <div className="text-center px-3">
            <div className="text-xl font-black text-sky-300">{actasList.length}</div>
            <div className="text-[10px] text-blue-300 font-medium uppercase">Actas Labradas</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('actas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'actas'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Libro de Actas Digital ({actasList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'finances'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Finanzas & Profesor Asesor</span>
          {pendingApprovals > 0 && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingApprovals}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('validator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'validator'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Validador Normativo (Res. 124)</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'news'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Redactar para Foro Provincial</span>
        </button>
      </div>

      {/* TAB 1: LIBRO DE ACTAS DIGITALIZADO */}
      {activeTab === 'actas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Actas */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Actas Registradas</h3>
                <p className="text-slate-500 text-xs">Libro foliado digital</p>
              </div>
              <button
                onClick={() => setShowNewActaModal(true)}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
                title="Labrar nueva acta"
              >
                <Plus className="w-4 h-4" />
                <span>Labrar</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {actasList.map(acta => {
                const isSelected = selectedActa?.id === acta.id;

                return (
                  <button
                    key={acta.id}
                    onClick={() => setSelectedActa(acta)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition text-xs ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Acta Nº {acta.actNumber}
                      </span>
                      <span className="text-slate-400 text-[11px]">{acta.date}</span>
                    </div>

                    <div className="font-bold text-slate-900 line-clamp-1 mb-1">{acta.title}</div>
                    <div className="text-slate-500 text-[11px] flex items-center justify-between">
                      <span>Tipo: {acta.type}</span>
                      {acta.signedByAdvisorTeacher ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                          <CheckCircle className="w-3 h-3" /> Rubricada
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold text-[10px]">Sin VºBº Asesor</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Acta Preview (Print-Ready) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
            {selectedActa ? (
              <div>
                {/* Formal Header */}
                <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Gobierno de la Provincia de Córdoba &bull; Res. 124/10
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      LIBRO DE ACTAS &bull; ACTA Nº {selectedActa.actNumber}
                    </h3>
                    <p className="text-xs text-blue-700 font-bold">{school.name}</p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir / Exportar</span>
                  </button>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha:</span>
                    <span className="font-bold text-slate-800">{selectedActa.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tipo de Sesión:</span>
                    <span className="font-bold text-slate-800">{selectedActa.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Lugar:</span>
                    <span className="font-bold text-slate-800 truncate block">{selectedActa.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Asistentes:</span>
                    <span className="font-bold text-slate-800">{selectedActa.attendeesCount} estudiantes (Quórum OK)</span>
                  </div>
                </div>

                {/* Title and Topics */}
                <div className="py-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orden del Día:</h4>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedActa.agendaTopics}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Desarrollo de la Sesión:</h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {selectedActa.content}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resoluciones Aprobadas:</h4>
                    <div className="text-xs font-semibold text-slate-900 mt-1 bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                      {selectedActa.resolutions}
                    </div>
                  </div>
                </div>

                {/* Signatures block */}
                <div className="mt-6 pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <div className="font-bold text-slate-800">Presidente del Centro</div>
                    <div className="text-[10px] text-slate-500">Firmado digitalmente</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <div className="font-bold text-slate-800">Secretaría de Actas</div>
                    <div className="text-[10px] text-slate-500">Firmado digitalmente</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {selectedActa.signedByAdvisorTeacher ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                        <div className="font-bold text-slate-800">Profesor Asesor</div>
                        <div className="text-[10px] text-emerald-600 font-bold">Rubricada (Art. 41)</div>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <div className="font-bold text-slate-800">Profesor Asesor</div>
                        <button
                          onClick={() => onSignActaByAdvisor(selectedActa.id)}
                          className="mt-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold"
                        >
                          Dar VºBº Asesor
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Seleccioná un acta del libro para ver el documento completo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FINANZAS Y PROFESOR ASESOR */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Ingresos Aprobados
              </div>
              <div className="text-2xl font-black text-emerald-600">
                ${totalIncome.toLocaleString('es-AR')}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-4 h-4 text-rose-500" /> Egresos Aprobados
              </div>
              <div className="text-2xl font-black text-rose-600">
                ${totalExpenses.toLocaleString('es-AR')}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                <DollarSign className="w-4 h-4 text-blue-500" /> Saldo Real en Caja
              </div>
              <div className="text-2xl font-black text-slate-900">
                ${currentBalance.toLocaleString('es-AR')}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-700 uppercase">VºBº Pendiente</div>
                <div className="text-2xl font-black text-amber-600">{pendingApprovals} asientos</div>
              </div>
              <button
                onClick={() => setShowNewFinanceModal(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Movimiento</span>
              </button>
            </div>
          </div>

          {/* Legal Notice Art 20 & 41 */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong>Supervisión Normativa (Res. Nº 124, Art. 20 inc. b y Art. 41):</strong> Todo gasto o inversión requiere la autorización solidaria del Presidente, el Secretario de Finanzas y el <strong>Profesor Asesor</strong>. Los movimientos permanecen en estado <em>Pendiente</em> hasta contar con el VºBº del docente asesor.
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">
                Libro Mayor de Entradas y Salidas
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {financesList.length} movimientos registrados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Descripción y Comprobante</th>
                    <th className="p-3.5 text-right">Monto</th>
                    <th className="p-3.5 text-center">VºBº Profesor Asesor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {financesList.map(entry => {
                    const isIncome = entry.type === 'INGRESO';

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-mono text-slate-500">{entry.date}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                              isIncome
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">{entry.category}</td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800">{entry.description}</div>
                          {entry.receiptNumber && (
                            <div className="text-[10px] font-mono text-slate-400">
                              Comp: {entry.receiptNumber} &bull; Reg: {entry.registeredBy}
                            </div>
                          )}
                        </td>
                        <td
                          className={`p-3.5 text-right font-bold text-sm ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome ? '+' : '-'}${entry.amount.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3.5 text-center">
                          {entry.advisorApproved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5" /> Aprobado
                            </span>
                          ) : (
                            <button
                              onClick={() => onApproveFinanceByAdvisor(entry.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition"
                            >
                              <Signature className="w-3.5 h-3.5" />
                              <span>Firmar VºBº Asesor</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VALIDADOR NORMATIVO RES. 124 */}
      {activeTab === 'validator' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  Auditor Normativo de Fórmulas y Comisión Directiva
                </h3>
                <p className="text-xs text-slate-500">
                  Verifica en tiempo real los requisitos del <strong>Art. 6 (Estructura y 7 Secretarías)</strong> y del <strong>Art. 17 (Prevención de Acefalía)</strong>.
                </p>
              </div>
            </div>

            {/* Test Controls */}
            <div className="space-y-4 pt-2 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Fórmula Ejecutiva Principal (Presidencia y Vicepresidencia)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre Presidente *</label>
                    <input
                      type="text"
                      value={formulaState.presidentName}
                      onChange={e => setFormulaState({ ...formulaState, presidentName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-slate-500">Año de Cursado:</span>
                      <select
                        value={formulaState.presidentYear}
                        onChange={e => setFormulaState({ ...formulaState, presidentYear: Number(e.target.value) })}
                        className="bg-white border border-slate-300 rounded p-1 text-xs font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(y => (
                          <option key={y} value={y}>
                            {y}º Año {y === 6 ? '(Último año secundario común)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre Vicepresidente *</label>
                    <input
                      type="text"
                      value={formulaState.vicePresidentName}
                      onChange={e => setFormulaState({ ...formulaState, vicePresidentName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-slate-500">Año de Cursado:</span>
                      <select
                        value={formulaState.vicePresidentYear}
                        onChange={e => setFormulaState({ ...formulaState, vicePresidentYear: Number(e.target.value) })}
                        className="bg-white border border-slate-300 rounded p-1 text-xs font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(y => (
                          <option key={y} value={y}>
                            {y}º Año {y === 6 ? '(Último año secundario común)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secretarías List */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">
                    Secretarías Constituidas ({formulaState.secretaries.length} de máx 7)
                  </h4>
                  <span className="text-[11px] text-blue-700 font-bold">
                    Obligatorias: Actas y Finanzas (Art. 6)
                  </span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {formulaState.secretaries.map((sec, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <div className="font-bold text-slate-800">{sec.position}</div>
                      <div className="text-slate-500 text-[11px]">
                        Titular: <strong>{sec.titularName}</strong> &bull; Suplente: <strong>{sec.suplenteName}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleTestFormula}
                disabled={validatingFormula}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                {validatingFormula ? <Clock className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                <span>Ejecutar Validación Normativa Res. 124</span>
              </button>

              {/* Result display */}
              {formulaResult && (
                <div
                  className={`p-5 rounded-2xl border ${
                    formulaResult.isValid
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm mb-2">
                    {formulaResult.isValid ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span>FÓRMULA Y COMISIÓN DIRECTIVA VÁLIDAS Y CONFORMES A DERECHO</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span>LA ESTRUCTURA PRESENTA INCUMPLIMIENTOS ESTATUTARIOS</span>
                      </>
                    )}
                  </div>

                  {formulaResult.errors && formulaResult.errors.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      {formulaResult.errors.map((err: string, i: number) => (
                        <li key={i} className="font-semibold text-red-800">
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}

                  {formulaResult.isValid && (
                    <p className="text-xs text-emerald-800">
                      Cumple con la <strong>Prevención de Acefalía (Art. 17)</strong>, incluye las Secretarías obligatorias de Actas y Finanzas, respeta el tope de 7 secretarías y designa titulares y suplentes (Art. 6).
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REDACTAR NOTICIA DESDE CD */}
      {activeTab === 'news' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Enviar Noticia del Centro al Foro Provincial
              </h3>
              <p className="text-xs text-slate-500">
                La noticia quedará en estado <em>Pendiente</em> para la aprobación de la Agencia Córdoba Joven.
              </p>
            </div>
          </div>

          <form onSubmit={handleDraftSubmit} className="space-y-4 text-xs">
            {draftSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Noticia remitida con éxito al equipo de moderación provincial!</span>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Título de la Actividad *</label>
              <input
                type="text"
                placeholder="Ej: Gran jornada de reacondicionamiento de bancos y pintura del aula de 5to"
                value={draftForm.title}
                onChange={e => setDraftForm({ ...draftForm, title: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Categoría</label>
              <select
                value={draftForm.category}
                onChange={e => setDraftForm({ ...draftForm, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              >
                <option value="Institucional">Institucional</option>
                <option value="Cultura y Deportes">Cultura y Deportes</option>
                <option value="Solidaridad">Solidaridad</option>
                <option value="Elecciones">Elecciones</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Resumen Breve *</label>
              <textarea
                rows={2}
                placeholder="Breve párrafo para el listado público..."
                value={draftForm.summary}
                onChange={e => setDraftForm({ ...draftForm, summary: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contenido de la Noticia *</label>
              <textarea
                rows={4}
                placeholder="Detalle completo..."
                value={draftForm.content}
                onChange={e => setDraftForm({ ...draftForm, content: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={draftLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
            >
              {draftLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Remitir a Moderación Provincial</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL: LABRAR NUEVA ACTA */}
      {showNewActaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Labrar Nueva Acta en Libro Oficial</h3>
              <button onClick={() => setShowNewActaModal(false)} className="text-white/80 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateActaSubmit} className="p-5 space-y-3 overflow-y-auto text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título de la Sesión *</label>
                <input
                  type="text"
                  placeholder="Ej: Reunión Ordinaria para Planificación del Día del Estudiante"
                  value={actaForm.title}
                  onChange={e => setActaForm({ ...actaForm, title: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Asamblea *</label>
                  <select
                    value={actaForm.type}
                    onChange={e => setActaForm({ ...actaForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="Comisión Directiva">Comisión Directiva</option>
                    <option value="Asamblea General">Asamblea General</option>
                    <option value="Ordinaria">Ordinaria</option>
                    <option value="Extraordinaria">Extraordinaria</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={actaForm.date}
                    onChange={e => setActaForm({ ...actaForm, date: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Orden del Día *</label>
                <textarea
                  rows={2}
                  placeholder="Temas a tratar numerados..."
                  value={actaForm.agendaTopics}
                  onChange={e => setActaForm({ ...actaForm, agendaTopics: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Texto del Acta / Consideraciones *</label>
                <textarea
                  rows={4}
                  placeholder="En la ciudad de Córdoba, siendo las... se reúnen..."
                  value={actaForm.content}
                  onChange={e => setActaForm({ ...actaForm, content: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Resoluciones Tomadas</label>
                <textarea
                  rows={2}
                  placeholder="Se resuelve aprobar el presupuesto para..."
                  value={actaForm.resolutions}
                  onChange={e => setActaForm({ ...actaForm, resolutions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewActaModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actaLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1"
                >
                  {actaLoading ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Foliar y Guardar Acta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO MOVIMIENTO FINANCIERO */}
      {showNewFinanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Registrar Movimiento de Caja</h3>
              <button onClick={() => setShowNewFinanceModal(false)} className="text-white/80 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateFinanceSubmit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo *</label>
                  <select
                    value={financeForm.type}
                    onChange={e => setFinanceForm({ ...financeForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  >
                    <option value="INGRESO">INGRESO (+)</option>
                    <option value="EGRESO">EGRESO (-)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monto ($ ARS) *</label>
                  <input
                    type="number"
                    min={1}
                    value={financeForm.amount}
                    onChange={e => setFinanceForm({ ...financeForm, amount: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rubro / Categoría *</label>
                <select
                  value={financeForm.category}
                  onChange={e => setFinanceForm({ ...financeForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="Kiosco / Buffet">Kiosco / Buffet</option>
                  <option value="Venta de Rifas">Venta de Rifas</option>
                  <option value="Donación">Donación</option>
                  <option value="Materiales / Evento">Materiales / Evento</option>
                  <option value="Fotocopias">Fotocopias</option>
                  <option value="Equipamiento">Equipamiento</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Concepto / Detalle *</label>
                <input
                  type="text"
                  placeholder="Ej: Compra de pintura y pinceles para mural institucional"
                  value={financeForm.description}
                  onChange={e => setFinanceForm({ ...financeForm, description: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={financeForm.date}
                    onChange={e => setFinanceForm({ ...financeForm, date: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nº Comprobante / Factura</label>
                  <input
                    type="text"
                    placeholder="FAC-0091"
                    value={financeForm.receiptNumber}
                    onChange={e => setFinanceForm({ ...financeForm, receiptNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFinanceModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={financeLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1"
                >
                  {financeLoading ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Asentar en Libro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
