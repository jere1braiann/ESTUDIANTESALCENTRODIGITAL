import React, { useState } from 'react';
import { School, NewsPost, MinuteActa, FinanceEntry, ElectionProcess, ElectoralList } from '../types';
import { BookOpen, FileText, DollarSign, Vote, Eye, ArrowRight, UserCheck, Search, Shield } from 'lucide-react';

interface GuestPortalProps {
  school: School;
  newsList: NewsPost[];
  actasList: MinuteActa[];
  financesList: FinanceEntry[];
  election: ElectionProcess | null;
  lists: ElectoralList[];
}

export const GuestPortal: React.FC<GuestPortalProps> = ({
  school,
  newsList,
  actasList,
  financesList,
  election,
  lists,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transparency' | 'election'>('overview');

  const schoolNews = (newsList || []).filter(n => n.schoolId === school?.id);
  const totalBalance = (financesList || []).reduce((acc, curr) => 
    curr.type === 'INGRESO' ? acc + curr.amount : acc - curr.amount, 0
  );

  return (
    <div className="flex min-h-[85vh] bg-slate-50">
      {/* Sidebar - Simplified for Guests */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-center font-black text-slate-800 text-lg leading-tight">Portal del Estudiante</h2>
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-1">Acceso Público / Lectura</p>
          <div className="mt-4 bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Institución</div>
            <div className="font-bold text-slate-700 text-xs truncate">{school?.name || 'Cargando...'}</div>
          </div>
        </div>

        <div className="p-4 flex-1 space-y-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Novedades
          </button>
          
          <button
            onClick={() => setActiveTab('transparency')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'transparency'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            Transparencia
          </button>

          <button
            onClick={() => setActiveTab('election')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'election'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Vote className="w-4 h-4" />
            Junta Electoral
          </button>
        </div>
        <div className="p-4 border-t border-slate-100">
           <p className="text-[10px] text-slate-400 text-center">Para gestionar el Centro, iniciá sesión desde el menú superior.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex space-x-2 overflow-x-auto mb-6 pb-2">
          {['overview', 'transparency', 'election'].map((t) => (
             <button
               key={t}
               onClick={() => setActiveTab(t as any)}
               className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
                 activeTab === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'
               }`}
             >
               {t === 'overview' ? 'Novedades' : t === 'transparency' ? 'Transparencia' : 'Junta Electoral'}
             </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-800">Novedades del Centro</h1>
                <p className="text-slate-500 text-sm mt-1">Últimas comunicaciones oficiales publicadas para los estudiantes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schoolNews.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                  <p className="text-slate-400 text-sm">No hay novedades publicadas por el momento.</p>
                </div>
              ) : (
                schoolNews.map(n => (
                  <div key={n.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                        {n.category}
                      </span>
                      <span className="text-xs text-slate-400">{n.createdAt.split('T')[0]}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2 leading-tight">{n.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{n.summary}</p>
                    <div className="flex items-center text-xs text-slate-500 border-t border-slate-100 pt-3 mt-auto">
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      <span>{n.authorName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'transparency' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Portal de Transparencia</h1>
              <p className="text-slate-500 text-sm mt-1">Acceso público de consulta a los libros contables y de actas (Art. 20 y 41 del Estatuto).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Finances */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Libro de Finanzas</h3>
                      <p className="text-[10px] text-slate-500 uppercase">Estado Contable</p>
                    </div>
                  </div>
                  <div className={`text-lg font-black ${totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${totalBalance.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                  {financesList.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-8">No hay registros financieros.</p>
                  ) : (
                    <div className="space-y-3">
                      {financesList.map(f => (
                        <div key={f.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                          <div>
                            <p className="font-bold text-slate-700 text-xs">{f.description}</p>
                            <p className="text-[10px] text-slate-400">{f.date} &bull; {f.secretaryAssigned}</p>
                          </div>
                          <div className={`font-mono text-sm font-bold ${f.type === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {f.type === 'INGRESO' ? '+' : '-'}${f.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actas */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Libro de Actas</h3>
                    <p className="text-[10px] text-slate-500 uppercase">Resoluciones y Reuniones</p>
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                  {actasList.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-8">No hay actas registradas.</p>
                  ) : (
                    <div className="space-y-3">
                      {actasList.map(a => (
                        <div key={a.id} className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-700 text-xs">Acta Nº {a.actaNumber}</span>
                            <span className="text-[10px] text-slate-400">{a.date}</span>
                          </div>
                          <p className="text-slate-600 text-xs line-clamp-2">{a.content}</p>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-400">
                             <span>Firma Pres.: {a.signedByPresident ? 'OK' : 'PDTE'}</span>
                             <span>Firma Asesor: {a.signedByAdvisor ? 'OK' : 'PDTE'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'election' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Estado Electoral</h1>
              <p className="text-slate-500 text-sm mt-1">Información pública provista por la Junta Electoral.</p>
            </div>

            {election ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{election.title}</h2>
                    <p className="text-xs text-slate-500 mt-1">Fecha: {election.electionDate}</p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-lg uppercase border border-indigo-200">
                    {election.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-700 text-sm mb-4">Listas Oficializadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lists.filter(l => l.isOfficialized).length === 0 ? (
                    <p className="text-slate-400 text-xs py-4 col-span-full text-center border border-dashed border-slate-200 rounded-xl">No hay listas oficializadas aún.</p>
                  ) : (
                    lists.filter(l => l.isOfficialized).map(l => (
                      <div key={l.id} className="border border-slate-200 rounded-xl p-4 flex gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: l.colorHex }}>
                          {l.listNumber}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{l.listName}</h4>
                          <p className="text-[10px] text-slate-500 uppercase mt-0.5">{l.motto}</p>
                          <div className="mt-2 space-y-1">
                             <div className="text-xs text-slate-600"><span className="font-semibold text-slate-800">Pte:</span> {l.presidentName}</div>
                             <div className="text-xs text-slate-600"><span className="font-semibold text-slate-800">Vice:</span> {l.vicePresidentName}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
                <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">Sin proceso electoral activo</h3>
                <p className="text-slate-500 text-sm mt-1">Actualmente no hay elecciones convocadas en la institución.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
