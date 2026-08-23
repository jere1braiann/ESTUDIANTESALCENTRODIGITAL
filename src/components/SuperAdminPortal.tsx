import React, { useState } from 'react';
import { School, NewsPost, User, Role, SchoolStatus, NewsStatus } from '../types';
import {
  Shield,
  Building2,
  CheckCircle,
  XCircle,
  Pin,
  Megaphone,
  KeyRound,
  Users,
  Vote,
  Clock,
  Send,
  Search,
  Filter,
  Layers,
  Sparkles,
  Plus
} from 'lucide-react';

interface SuperAdminPortalProps {
  schoolsList: School[];
  newsList: NewsPost[];
  usersList: User[];
  onUpdateSchoolStatus: (schoolId: string, status: SchoolStatus, generateCredentials?: boolean) => Promise<boolean>;
  onModerateNews: (newsId: string, status: NewsStatus, isPinned?: boolean) => Promise<boolean>;
  onCreateProvincialNotice: (noticeData: any) => Promise<boolean>;
  onCreateCredential: (credData: any) => Promise<boolean>;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  schoolsList = [],
  newsList = [],
  usersList = [],
  onUpdateSchoolStatus,
  onModerateNews,
  onCreateProvincialNotice,
  onCreateCredential,
}) => {
  const [activeTab, setActiveTab] = useState<'schools' | 'news' | 'notices' | 'credentials'>('schools');
  const [newsFilter, setNewsFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('PENDING');
  const [schoolSearch, setSchoolSearch] = useState('');

  // Provincial notice form
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Normativa',
    isPinned: true,
  });
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  // Credential creator form
  const [credForm, setCredForm] = useState({
    schoolId: schoolsList?.[0]?.id || '',
    role: Role.ADMIN_CD,
    username: '',
    fullName: '',
    email: '',
  });
  const [credLoading, setCredLoading] = useState(false);
  const [credSuccess, setCredSuccess] = useState(false);

  // Filtered lists
  const pendingSchools = (schoolsList || []).filter(s => s.status === SchoolStatus.PENDING);
  const approvedSchools = (schoolsList || []).filter(s => s.status === SchoolStatus.APPROVED);

  const filteredSchools = (schoolsList || []).filter(s => {
    if (!schoolSearch) return true;
    const q = schoolSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.cue.includes(q) || s.city.toLowerCase().includes(q);
  });

  const filteredNews = (newsList || []).filter(n => {
    if (newsFilter === 'ALL') return true;
    return n.status === newsFilter;
  });

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeLoading(true);
    const ok = await onCreateProvincialNotice(noticeForm);
    setNoticeLoading(false);
    if (ok) {
      setNoticeSuccess(true);
      setTimeout(() => {
        setNoticeSuccess(false);
        setNoticeForm({ title: '', summary: '', content: '', category: 'Normativa', isPinned: true });
      }, 2000);
    }
  };

  const handleCreateCred = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredLoading(true);
    const ok = await onCreateCredential(credForm);
    setCredLoading(false);
    if (ok) {
      setCredSuccess(true);
      setTimeout(() => {
        setCredSuccess(false);
        setCredForm({
          schoolId: schoolsList[0]?.id || '',
          role: Role.ADMIN_CD,
          username: '',
          fullName: '',
          email: '',
        });
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* SuperAdmin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" /> Soporte Provincial
            </span>
            <span className="text-slate-400 text-xs">Agencia Córdoba Joven &bull; Min. Educación</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Panel de Control y Supervisión Provincial
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Gestión centralizada de adhesiones de colegios, moderación del foro provincial y emisión de credenciales (Res. 124).
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
          <div className="text-center px-3 border-r border-slate-700">
            <div className="text-xl font-black text-sky-400">{schoolsList.length}</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Colegios</div>
          </div>
          <div className="text-center px-3 border-r border-slate-700">
            <div className="text-xl font-black text-amber-400">
              {newsList.filter(n => n.status === NewsStatus.PENDING).length}
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Por Moderar</div>
          </div>
          <div className="text-center px-3">
            <div className="text-xl font-black text-emerald-400">{pendingSchools.length}</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Pendientes</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('schools')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'schools'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Colegios y Adhesiones ({schoolsList.length})</span>
          {pendingSchools.length > 0 && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingSchools.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'news'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Moderación de Noticias</span>
          {newsList.filter(n => n.status === NewsStatus.PENDING).length > 0 && (
            <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {newsList.filter(n => n.status === NewsStatus.PENDING).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'notices'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Pin className="w-4 h-4" />
          <span>Publicar Comunicado Oficial</span>
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'credentials'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Emisión de Credenciales</span>
        </button>
      </div>

      {/* TAB 1: Colegios y Solicitudes de Adhesión */}
      {activeTab === 'schools' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar colegio por nombre, CUE o ciudad..."
                value={schoolSearch}
                onChange={e => setSchoolSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total Colegios Registrados: <strong className="text-slate-800">{filteredSchools.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredSchools.map(school => {
              const isPending = school.status === SchoolStatus.PENDING;
              const isApproved = school.status === SchoolStatus.APPROVED;

              return (
                <div
                  key={school.id}
                  className={`bg-white p-5 rounded-2xl border transition ${
                    isPending
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          CUE: {school.cue}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {school.status}
                        </span>
                        <span className="text-slate-400 text-xs font-medium">
                          {school.department} &bull; {school.city}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base">
                        {school.name}
                      </h3>

                      {school.advisorTeacherName && (
                        <p className="text-xs text-slate-600">
                          <strong>Profesor Asesor:</strong> {school.advisorTeacherName} ({school.advisorTeacherEmail || 'Email no cargado'})
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => onUpdateSchoolStatus(school.id, SchoolStatus.APPROVED, true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Aprobar y Generar Credenciales</span>
                          </button>
                          <button
                            onClick={() => onUpdateSchoolStatus(school.id, SchoolStatus.REJECTED)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rechazar</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Adhesión Aprobada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Moderación de Noticias */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filtrar por estado:</span>
              {(['PENDING', 'APPROVED', 'ALL'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setNewsFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    newsFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'PENDING' ? 'Pendientes de Moderación' : st === 'APPROVED' ? 'Aprobadas' : 'Todas'}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Noticias en cola: <strong>{filteredNews.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredNews.length > 0 ? (
              filteredNews.map(post => {
                const isPending = post.status === NewsStatus.PENDING;

                return (
                  <div
                    key={post.id}
                    className={`bg-white p-5 rounded-2xl border transition ${
                      isPending ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isPending
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {post.status}
                          </span>
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {post.category}
                          </span>
                          {post.isPinned && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5 fill-white" /> Fijado
                            </span>
                          )}
                          <span className="text-slate-400 text-xs">
                            {new Date(post.createdAt).toLocaleDateString('es-AR')}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-600 font-medium">
                          {post.summary}
                        </p>

                        <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                          {post.content}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span className="font-semibold text-blue-700">{post.schoolName}</span>
                          <span>&bull;</span>
                          <span>Autor: {post.authorName}</span>
                        </div>
                      </div>

                      {/* Moderation Controls */}
                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => onModerateNews(post.id, NewsStatus.APPROVED, false)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Aprobar y Publicar</span>
                            </button>
                            <button
                              onClick={() => onModerateNews(post.id, NewsStatus.APPROVED, true)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition"
                            >
                              <Pin className="w-3.5 h-3.5" />
                              <span>Aprobar y Fijar</span>
                            </button>
                            <button
                              onClick={() => onModerateNews(post.id, NewsStatus.REJECTED)}
                              className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </>
                        ) : (
                          <div className="space-y-1.5 w-full">
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-semibold w-full justify-center">
                              <CheckCircle className="w-3.5 h-3.5" /> Publicada
                            </span>
                            <button
                              onClick={() => onModerateNews(post.id, NewsStatus.APPROVED, !post.isPinned)}
                              className="w-full text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg py-1 hover:bg-slate-50 transition"
                            >
                              {post.isPinned ? 'Desfijar' : 'Fijar al Inicio'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No hay noticias pendientes en la cola de moderación</p>
                <p className="text-xs text-slate-400 mt-1">Todas las publicaciones remitidas han sido procesadas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Publicar Comunicado Provincial */}
      {activeTab === 'notices' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Pin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Redactar Comunicado Institucional Oficial
              </h3>
              <p className="text-xs text-slate-500">
                Se publicará de forma destacada en el inicio de toda la red provincial de colegios.
              </p>
            </div>
          </div>

          <form onSubmit={handlePostNotice} className="space-y-4 text-xs">
            {noticeSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Comunicado oficial publicado y fijado en el portal público!</span>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Título del Comunicado *</label>
              <input
                type="text"
                placeholder="Ej: Convocatoria al Encuentro Provincial de Centros de Estudiantes 2026"
                value={noticeForm.title}
                onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                <select
                  value={noticeForm.category}
                  onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="Normativa">Normativa</option>
                  <option value="Institucional">Institucional</option>
                  <option value="Elecciones">Elecciones</option>
                  <option value="Cultura y Deportes">Cultura y Deportes</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={noticeForm.isPinned}
                  onChange={e => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="pinCheck" className="font-bold text-slate-700 cursor-pointer">
                  Fijar en el encabezado provincial
                </label>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Bajada / Resumen *</label>
              <textarea
                rows={2}
                placeholder="Síntesis del anuncio para la vista previa..."
                value={noticeForm.summary}
                onChange={e => setNoticeForm({ ...noticeForm, summary: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contenido Oficial Completo *</label>
              <textarea
                rows={5}
                placeholder="Texto legal, artículos, plazos o indicaciones para los centros..."
                value={noticeForm.content}
                onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={noticeLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
            >
              {noticeLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Emitir Comunicado Provincial</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Generador de Credenciales */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creator Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Generar Credenciales Institucionales
                </h3>
                <p className="text-xs text-slate-500">
                  Alta de usuarios para Centros de Estudiantes o Juntas Electorales.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCred} className="space-y-3 text-xs">
              {credSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Credencial generada y activada exitosamente!</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Colegio Asignado *</label>
                <select
                  value={credForm.schoolId}
                  onChange={e => setCredForm({ ...credForm, schoolId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                >
                  {schoolsList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rol a Asignar *</label>
                <select
                  value={credForm.role}
                  onChange={e => setCredForm({ ...credForm, role: e.target.value as Role })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value={Role.ADMIN_CD}>Admin CD (Centro de Estudiantes Activo)</option>
                  <option value={Role.ADMIN_JUNTA}>Admin Junta (Junta Electoral Temporal)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo / Denominación *</label>
                <input
                  type="text"
                  placeholder="Ej: Comisión Directiva IPEM 268"
                  value={credForm.fullName}
                  onChange={e => setCredForm({ ...credForm, fullName: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de Usuario (Login) *</label>
                <input
                  type="text"
                  placeholder="Ej: cd.deanfunes"
                  value={credForm.username}
                  onChange={e => setCredForm({ ...credForm, username: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Institucional *</label>
                <input
                  type="email"
                  placeholder="centro@escuela.edu.ar"
                  value={credForm.email}
                  onChange={e => setCredForm({ ...credForm, email: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={credLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              >
                {credLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Emitir Credencial</span>
              </button>
            </form>
          </div>

          {/* Active Credentials List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">
                Credenciales Emitidas en el Sistema
              </h3>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {usersList.length} usuarios
              </span>
            </div>

            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {usersList.map(u => {
                const school = schoolsList.find(s => s.id === u.schoolId);

                return (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{u.username}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                            u.role === Role.SUPERADMIN
                              ? 'bg-indigo-100 text-indigo-800'
                              : u.role === Role.ADMIN_CD
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                        {u.isJuntaDisolved && (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                            CADUCADA (Art. 35)
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600 text-[11px]">{u.fullName}</div>
                      <div className="text-slate-400 text-[10px]">{school?.name || 'Soporte Provincial'}</div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        u.isActive && !u.isJuntaDisolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.isActive && !u.isJuntaDisolved ? 'Activa' : 'Revocada'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
