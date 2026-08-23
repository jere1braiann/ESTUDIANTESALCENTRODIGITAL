import React, { useState } from 'react';
import { NewsPost, School } from '../types';
import {
  Vote,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Megaphone,
  BookOpen,
  Pin,
  Building2,
  Sparkles,
  Users,
  ShieldCheck,
  ChevronRight,
  School as SchoolIcon,
  HelpCircle,
  Award
} from 'lucide-react';

interface PublicLandingProps {
  newsList: NewsPost[];
  schoolsList: School[];
  onOpenVoting: () => void;
  onSubmitNews: (newsData: any) => Promise<boolean>;
  onRequestSchool: (schoolData: any) => Promise<boolean>;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  newsList = [],
  schoolsList = [],
  onOpenVoting,
  onSubmitNews,
  onRequestSchool,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('ALL');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [activeStatuteTab, setActiveStatuteTab] = useState<number>(1);

  // Submit news form state
  const [newsForm, setNewsForm] = useState({
    schoolId: schoolsList?.[0]?.id || '',
    authorName: '',
    title: '',
    summary: '',
    content: '',
    category: 'Institucional',
  });
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState(false);

  // Enroll school form state
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    cue: '',
    department: 'Capital',
    city: 'Córdoba Capital',
    advisorTeacherName: '',
    advisorTeacherEmail: '',
  });
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  // Filtered news
  const filteredNews = (newsList || []).filter(post => {
    if (activeCategory !== 'ALL' && post.category.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    if (selectedSchoolFilter !== 'ALL' && post.schoolId !== selectedSchoolFilter) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchSummary = post.summary.toLowerCase().includes(q);
      const matchContent = post.content.toLowerCase().includes(q);
      const matchSchool = (post.schoolName || '').toLowerCase().includes(q);
      return matchTitle || matchSummary || matchContent || matchSchool;
    }
    return true;
  });

  const pinnedNews = filteredNews.filter(n => n.isPinned);
  const regularNews = filteredNews.filter(n => !n.isPinned);

  const handleSubmitNewsForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsSubmitting(true);
    const ok = await onSubmitNews(newsForm);
    setNewsSubmitting(false);
    if (ok) {
      setNewsSuccess(true);
      setTimeout(() => {
        setNewsSuccess(false);
        setShowSubmitModal(false);
        setNewsForm({
          schoolId: schoolsList?.[0]?.id || '',
          authorName: '',
          title: '',
          summary: '',
          content: '',
          category: 'Institucional',
        });
      }, 2500);
    }
  };

  const handleEnrollSchoolForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollSubmitting(true);
    const ok = await onRequestSchool(enrollForm);
    setEnrollSubmitting(false);
    if (ok) {
      setEnrollSuccess(true);
      setTimeout(() => {
        setEnrollSuccess(false);
        setShowEnrollModal(false);
        setEnrollForm({
          name: '',
          cue: '',
          department: 'Capital',
          city: 'Córdoba Capital',
          advisorTeacherName: '',
          advisorTeacherEmail: '',
        });
      }, 2500);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner with Official Córdoba Identity */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Red Provincial de Centros de Estudiantes
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Democracia, participación y gestión en cada colegio de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-sky-300">Córdoba</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Plataforma institucional oficial regulada bajo la <strong>Resolución Ministerial Nº 124/2010</strong>. 
            Garantiza la digitalización del <strong>Libro de Actas</strong>, control financiero con el <strong>Profesor Asesor</strong>, 
            y la transparencia electoral con <strong>urnas digitales anónimas y biombos presenciales</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-open-voting-btn"
              onClick={onOpenVoting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
            >
              <Vote className="w-5 h-5" />
              <span>Ingresar al Biombo de Votación</span>
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 backdrop-blur-xs transition"
            >
              <Megaphone className="w-4 h-4 text-amber-300" />
              <span>Enviar Noticia de mi Centro</span>
            </button>

            <button
              onClick={() => setShowEnrollModal(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Adherir mi Escuela (CUE)</span>
            </button>
          </div>
        </div>

        {/* Quick Statute Pillars */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="font-bold text-sky-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4" /> Art. 17: Prevención Acefalía
            </div>
            <p className="text-slate-300 text-[11px]">
              Fórmula con al menos un integrante que no sea del último año lectivo.
            </p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4" /> Art. 28: 10% de Avales
            </div>
            <p className="text-slate-300 text-[11px]">
              Exigencia estricta del 10% del padrón electoral para oficializar listas.
            </p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4" /> Art. 30: Minorías (&ge; 20%)
            </div>
            <p className="text-slate-300 text-[11px]">
              Adjudicación automática de un tercio (1/3) de las secretarías.
            </p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-4 h-4" /> Art. 35: Disolución Junta
            </div>
            <p className="text-slate-300 text-[11px]">
              Caducidad inmediata de credenciales electorales tras la proclamación.
            </p>
          </div>
        </div>
      </section>

      {/* Main Forum & Interactive Feed Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-red-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Foro Compartido de Noticias y Comunicados
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Espacio de difusión para las actividades de los colegios de Córdoba, moderado por la Agencia Córdoba Joven.
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start md:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publicar Noticia de mi Centro</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Institucional', 'Normativa', 'Cultura y Deportes', 'Solidaridad', 'Elecciones'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'Todas' : cat}
              </button>
            ))}
          </div>

          {/* Search & School Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar noticia..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedSchoolFilter}
              onChange={e => setSelectedSchoolFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos los Colegios</option>
              {schoolsList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pinned / Featured Announcements from SuperAdmin */}
        {pinnedNews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span>Comunicados Oficiales Fijados</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {pinnedNews.map(post => (
                <article
                  key={post.id}
                  className="bg-gradient-to-r from-amber-50 via-white to-blue-50/40 p-5 rounded-2xl border-2 border-amber-200/80 shadow-xs relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5 fill-white" /> Fijado
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {post.category}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                    {post.summary}
                  </p>

                  <div className="text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-amber-100/60 leading-relaxed">
                    {post.content}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-amber-100 pt-2">
                    <span className="font-semibold text-slate-700">Emisor: {post.authorName}</span>
                    <span className="text-slate-400">{post.schoolName || 'Ministerio de Educación / Agencia Córdoba Joven'}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Regular News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regularNews.length > 0 ? (
            regularNews.map(post => (
              <article
                key={post.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {post.category}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-blue-700 truncate max-w-[200px]">
                    {post.schoolName}
                  </span>
                  <span className="text-slate-400">Por: {post.authorName}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">No se encontraron noticias con los filtros seleccionados</p>
              <p className="text-xs text-slate-400 mt-1">Probá cambiando la categoría o el término de búsqueda.</p>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Estatuto Explorer (Res. 124) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                Resolución Nº 124
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Estatuto Modelo de Centros de Estudiantes de Córdoba
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Marco normativo provincial obligatorio para escuelas secundarias y técnicas de Córdoba.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 1, label: 'Estructura CD (Art. 6)' },
            { id: 2, label: 'Prevención Acefalía (Art. 17)' },
            { id: 3, label: 'Junta Electoral (Art. 25)' },
            { id: 4, label: 'Avales 10% (Art. 28)' },
            { id: 5, label: 'Minorías 20% (Art. 30)' },
            { id: 6, label: 'Profesor Asesor (Art. 41)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStatuteTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeStatuteTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents with exact statutory quotations */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs leading-relaxed text-slate-700 space-y-3">
          {activeStatuteTab === 1 && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 text-blue-700">
                Artículo 6º - Composición de la Comisión Directiva
              </h4>
              <blockquote className="border-l-4 border-blue-500 pl-3 italic text-slate-600 bg-white p-3 rounded-r-lg">
                "La Comisión Directiva estará integrada por un Presidente, un Vicepresidente y las Secretarías de Actas, Finanzas, Prensa y Difusión, Cultura, Recreación y Deportes. No se deberá superar el máximo de siete (7) Secretarías. Es, en todos los casos, obligatoria la constitución de la Secretaría de Finanzas y la Secretaría de Actas. Cada cargo ejecutivo exigirá titular y suplente."
              </blockquote>
              <p className="mt-2 text-slate-600">
                <strong>Implementación en la plataforma:</strong> El panel de CD bloquea el alta si faltan las secretarías obligatorias, si se superan las 7 secretarías, o si no se especifican los cargos de titular y suplente.
              </p>
            </div>
          )}

          {activeStatuteTab === 2 && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 text-red-600">
                Artículo 17º - Regla Antiacafalía de la Fórmula Ejecutiva
              </h4>
              <blockquote className="border-l-4 border-red-500 pl-3 italic text-slate-600 bg-white p-3 rounded-r-lg">
                "Con el objetivo de evitar una situación de acefalía en la Dirección del Centro de Estudiantes con la finalización del ciclo lectivo; al menos uno de los integrantes de la conducción (Presidente o Vicepresidente) no deberá pertenecer al último curso."
              </blockquote>
              <p className="mt-2 text-slate-600">
                <strong>Validación algorítmica:</strong> La plataforma evalúa el año lectivo de ambos postulantes. Si Presidente = 6to y Vice = 6to (en secundario común), el sistema rechaza automáticamente la lista con una advertencia normativa explícita.
              </p>
            </div>
          )}

          {activeStatuteTab === 3 && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 text-emerald-700">
                Artículo 25º y 35º - Junta Electoral y Disolución Automática
              </h4>
              <blockquote className="border-l-4 border-emerald-500 pl-3 italic text-slate-600 bg-white p-3 rounded-r-lg">
                "Art. 25: La Junta Electoral se integrará con cinco (5) Estudiantes pertenecientes a los dos últimos años del Plan de Estudios... Art. 35: Cumplido su cometido y asegurada la documentación respectiva, la Junta Electoral se disolverá."
              </blockquote>
              <p className="mt-2 text-slate-600">
                <strong>Revocación de credenciales:</strong> Al finalizar el escrutinio definitivo y emitir el Acta de Proclamación, el backend marca el proceso como PROCLAIMED e invalida de forma inmediata el token de acceso de la Junta.
              </p>
            </div>
          )}

          {activeStatuteTab === 4 && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 text-amber-700">
                Artículo 28º - Oficialización de Listas y Aval del 10%
              </h4>
              <blockquote className="border-l-4 border-amber-500 pl-3 italic text-slate-600 bg-white p-3 rounded-r-lg">
                "La solicitud de oficialización de cada lista deberá contener: Nombre, datos personales y curso de los postulantes; Cargos a los que se postulan y firma de conformidad; Color y número con los que se identificarán las boletas; Aval escrito del diez por ciento (10%) del padrón electoral."
              </blockquote>
              <p className="mt-2 text-slate-600">
                <strong>Cálculo en vivo:</strong> La Junta verifica la cantidad de avales cargados contra el total de alumnos empadronados. Si no alcanza el 10% estricto, el botón de oficialización permanece bloqueado.
              </p>
            </div>
          )}

          {activeStatuteTab === 5 && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 text-indigo-700">
                Artículo 30º - Representación de Minorías (Piso del 20%)
              </h4>
              <blockquote className="border-l-4 border-indigo-500 pl-3 italic text-slate-600 bg-white p-3 rounded-r-lg">
                "En cada elección, se utilizará un sistema de representación proporcional que garantice la participación de las minorías, cuando estas superen un piso del veinte por ciento (20%) de los votos válidos emitidos. En este último caso, se les adjudicará un tercio (1/3) de las Secretarías de la Comisión Directiva."
              </blockquote>
              <p className="mt-2 text-slate-600">
                <strong>Motor de escrutinio:</strong> El sistema discrimina votos válidos vs en blanco, comprueba si la primera minoría supera el 20%, y redistribuye de forma matemática las secretarías en el Acta de Proclamación.
              </p>
            </div>
          )}

          {activeStatuteTab === 6 && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 text-purple-700">
                Artículos 20º y 41º - Profesor Asesor y Control Contable
              </h4>
              <blockquote className="border-l-4 border-purple-500 pl-3 italic text-slate-600 bg-white p-3 rounded-r-lg">
                "Art. 20: Autorizar, solidariamente con el Presidente y el Profesor Asesor, gastos de inversiones que comprometan al Centro... Art. 41: El Centro de Estudiantes contará con el asesoramiento de un profesor del establecimiento en calidad de asesor, quien lo asistirá en la observancia de la normativa vigente y en la correcta determinación de su contabilidad."
              </blockquote>
              <p className="mt-2 text-slate-600">
                <strong>Doble firma:</strong> Cada gasto e ingreso registrado por el Secretario de Finanzas requiere el Visto Bueno digital del Profesor Asesor antes de computarse en el balance definitivo.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* MODAL: Enviar Noticia desde Colegio */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                <h3 className="font-bold text-base">Redactar Noticia para el Foro Provincial</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitNewsForm} className="p-5 space-y-4 overflow-y-auto text-xs">
              {newsSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">¡Noticia enviada con éxito!</p>
                  <p className="text-xs">
                    Ingresó en estado <strong>PENDIENTE</strong>. Será publicada en el portal tan pronto como el equipo de Soporte Provincial (SuperAdmin) la revise y apruebe.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Control de Moderación:</strong> Todas las noticias ingresan en estado <em>Pendiente</em> para preservar la convivencia institucional y solo se publican tras la aprobación del SuperAdmin Provincial.
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Colegio Emisor *</label>
                    <select
                      value={newsForm.schoolId}
                      onChange={e => setNewsForm({ ...newsForm, schoolId: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    >
                      {schoolsList.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Autor / Secretaría *</label>
                      <input
                        type="text"
                        placeholder="Ej: Sec. de Prensa (Sofía M.)"
                        value={newsForm.authorName}
                        onChange={e => setNewsForm({ ...newsForm, authorName: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Categoría *</label>
                      <select
                        value={newsForm.category}
                        onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        <option value="Institucional">Institucional</option>
                        <option value="Cultura y Deportes">Cultura y Deportes</option>
                        <option value="Solidaridad">Solidaridad</option>
                        <option value="Elecciones">Elecciones</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Título de la Noticia *</label>
                    <input
                      type="text"
                      placeholder="Ej: Convocatoria a Asamblea General para debatir proyectos"
                      value={newsForm.title}
                      onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Resumen / Bajada (Copete) *</label>
                    <textarea
                      rows={2}
                      placeholder="Breve síntesis de la actividad o comunicado..."
                      value={newsForm.summary}
                      onChange={e => setNewsForm({ ...newsForm, summary: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cuerpo Completo del Comunicado *</label>
                    <textarea
                      rows={4}
                      placeholder="Detalle completo de la noticia, fechas, horarios y acuerdos..."
                      value={newsForm.content}
                      onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={newsSubmitting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      {newsSubmitting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Enviar a Revisión Provincial</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Adherir Escuela (CUE) */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base">Solicitud de Adhesión Escolar</h3>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEnrollSchoolForm} className="p-5 space-y-4 overflow-y-auto text-xs">
              {enrollSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">¡Solicitud registrada correctamente!</p>
                  <p className="text-xs">
                    El equipo del SuperAdmin Provincial revisará la validación del CUE y generará las credenciales oficiales de acceso.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 leading-relaxed">
                    Completá los datos del establecimiento educativo según el registro oficial del Ministerio de Educación de Córdoba:
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CUE (Código Único) *</label>
                      <input
                        type="text"
                        placeholder="Ej: 0403442-00"
                        value={enrollForm.cue}
                        onChange={e => setEnrollForm({ ...enrollForm, cue: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Departamento *</label>
                      <input
                        type="text"
                        placeholder="Ej: Capital, Colón, San Justo"
                        value={enrollForm.department}
                        onChange={e => setEnrollForm({ ...enrollForm, department: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre Oficial de la Escuela *</label>
                    <input
                      type="text"
                      placeholder="Ej: IPEM Nº 316 Dr. Bernardo Houssay"
                      value={enrollForm.name}
                      onChange={e => setEnrollForm({ ...enrollForm, name: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ciudad / Localidad *</label>
                    <input
                      type="text"
                      placeholder="Ej: Villa Carlos Paz"
                      value={enrollForm.city}
                      onChange={e => setEnrollForm({ ...enrollForm, city: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-3 space-y-3">
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Profesor Asesor Propuesto (Art. 41 Res. 124)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-600 block mb-1">Nombre del Docente</label>
                        <input
                          type="text"
                          placeholder="Prof. Laura Quiroga"
                          value={enrollForm.advisorTeacherName}
                          onChange={e => setEnrollForm({ ...enrollForm, advisorTeacherName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Email Institucional</label>
                        <input
                          type="email"
                          placeholder="l.quiroga@educacion.cba.gov.ar"
                          value={enrollForm.advisorTeacherEmail}
                          onChange={e => setEnrollForm({ ...enrollForm, advisorTeacherEmail: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEnrollModal(false)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={enrollSubmitting}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      {enrollSubmitting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />}
                      <span>Registrar Solicitud</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
