import React, { useState, useEffect } from 'react';
import {
  School,
  NewsPost,
  User,
  Role,
  MinuteActa,
  FinanceEntry,
  ElectionProcess,
  Student,
  ElectoralList,
  JuntaMember,
  ScrutinyResult,
  SchoolStatus,
  NewsStatus,
  ElectionStatus,
} from './types';
import { Header } from './components/Header';
import { PublicLanding } from './components/PublicLanding';
import { SuperAdminPortal } from './components/SuperAdminPortal';
import { AdminCDPortal } from './components/AdminCDPortal';
import { AdminJuntaPortal } from './components/AdminJuntaPortal';
import { BiomboVotingModule } from './components/BiomboVotingModule';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { GuestPortal } from './components/GuestPortal';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation View: 'public' | 'voting' | 'portal' | 'architecture'
  const [currentView, setCurrentView] = useState<'public' | 'voting' | 'portal' | 'architecture'>('public');
  const [showArchModal, setShowArchModal] = useState<boolean>(false);

  // App Data State
  const [schools, setSchools] = useState<School[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // CD State
  const [actas, setActas] = useState<MinuteActa[]>([]);
  const [finances, setFinances] = useState<FinanceEntry[]>([]);

  // Junta & Voting State
  const [election, setElection] = useState<ElectionProcess | null>(null);
  const [padron, setPadron] = useState<Student[]>([]);
  const [lists, setLists] = useState<ElectoralList[]>([]);
  const [juntaMembers, setJuntaMembers] = useState<JuntaMember[]>([]);

  // Loading & Notification State
  const [loading, setLoading] = useState<boolean>(true);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch initial system data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [schoolsRes, newsRes, usersRes] = await Promise.all([
        fetch('/api/public/schools').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/public/news').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/superadmin/users').then(r => r.json()).catch(() => ({ success: false })),
      ]);

      if (schoolsRes?.success) setSchools(schoolsRes.schools || schoolsRes.data || []);
      if (newsRes?.success) setNews(newsRes.news || newsRes.data || []);
      if (usersRes?.success) {
        const userList = usersRes.users || usersRes.data || [];
        setUsers(userList);
      }

      // Fetch CD data
      const [actasRes, financesRes] = await Promise.all([
        fetch('/api/cd/actas').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/cd/finances').then(r => r.json()).catch(() => ({ success: false })),
      ]);
      if (actasRes?.success) setActas(actasRes.actas || actasRes.data || []);
      if (financesRes?.success) setFinances(financesRes.finances || financesRes.data || []);

      // Fetch Junta data
      const [electionRes, padronRes, listsRes, membersRes] = await Promise.all([
        fetch('/api/junta/election').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/junta/padron').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/junta/lists').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/junta/members').then(r => r.json()).catch(() => ({ success: false })),
      ]);
      if (electionRes?.success) setElection(electionRes.election || electionRes.data || null);
      if (padronRes?.success) setPadron(padronRes.padron || padronRes.data || []);
      if (listsRes?.success) setLists(listsRes.lists || listsRes.data || []);
      if (membersRes?.success) setJuntaMembers(membersRes.members || membersRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setGlobalMessage({ type, text });
    setTimeout(() => {
      setGlobalMessage(null);
    }, 3500);
  };

  // HANDLERS FOR PUBLIC MODULE
  const handleSubmitNews = async (newsData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/public/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Noticia enviada con éxito (Pendiente de moderación)');
        fetchData();
        return true;
      } else {
        showNotification('error', data.message || 'Error al enviar noticia');
        return false;
      }
    } catch {
      showNotification('error', 'Error de conexión');
      return false;
    }
  };

  const handleRequestSchool = async (schoolData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/public/schools/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Solicitud de adhesión enviada al SuperAdmin');
        fetchData();
        return true;
      } else {
        showNotification('error', data.message || 'Error en solicitud');
        return false;
      }
    } catch {
      showNotification('error', 'Error de red');
      return false;
    }
  };

  // HANDLERS FOR SUPERADMIN MODULE
  const handleUpdateSchoolStatus = async (schoolId: string, status: SchoolStatus, generateCredentials = false): Promise<boolean> => {
    try {
      const res = await fetch(`/api/superadmin/schools/${schoolId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, generateCredentials }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Colegio ${status === SchoolStatus.APPROVED ? 'aprobado con credenciales emitidas' : 'actualizado'}`);
        fetchData();
        return true;
      }
      return false;
    } catch {
      showNotification('error', 'Error de conexión');
      return false;
    }
  };

  const handleModerateNews = async (newsId: string, status: NewsStatus, isPinned = false): Promise<boolean> => {
    try {
      const res = await fetch(`/api/superadmin/news/${newsId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, isPinned }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Estado de noticia actualizado');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleCreateProvincialNotice = async (noticeData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/superadmin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Comunicado oficial provincial publicado');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleCreateCredential = async (credData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/superadmin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Credencial creada y activada');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // HANDLERS FOR ADMIN CD MODULE
  const handleValidateFormula = async (formulaData: any): Promise<any> => {
    try {
      const res = await fetch('/api/cd/formula-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulaData),
      });
      return await res.json();
    } catch {
      return { isValid: false, errors: ['Error de conexión al servidor'] };
    }
  };

  const handleCreateActa = async (actaData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/cd/actas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actaData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Acta Nº ${data.acta.actNumber} foliada en el libro digital`);
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSignActaByAdvisor = async (actaId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cd/actas/${actaId}/sign-advisor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Acta rubricada con Visto Bueno del Profesor Asesor (Art. 41)');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleCreateFinance = async (financeData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/cd/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financeData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Movimiento registrado (requiere VºBº del Asesor)');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleApproveFinanceByAdvisor = async (financeId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cd/finances/${financeId}/approve-advisor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Asiento contable aprobado por Profesor Asesor');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSubmitNewsDraft = async (draftData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/cd/news/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Noticia enviada a revisión');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // HANDLERS FOR ADMIN JUNTA MODULE
  const handleGenerateTokens = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/junta/generate-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Se generaron ${data.tokensGenerated} tokens únicos de votación`);
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleOfficializeList = async (listId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/junta/lists/${listId}/officialize`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Lista oficializada tras comprobar 10% de avales y Art. 17');
        fetchData();
        return true;
      } else {
        showNotification('error', data.message || 'No cumple requisitos');
        return false;
      }
    } catch {
      return false;
    }
  };

  const handleRegisterList = async (listData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/junta/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Lista electoral registrada');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleComputeScrutiny = async (): Promise<ScrutinyResult | null> => {
    try {
      const res = await fetch('/api/junta/compute-scrutiny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Cómputo definitivo y adjudicación de minorías calculados');
        fetchData();
        return data.scrutiny;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleProclaimElection = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/junta/proclaim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', '¡Autoridades Proclamadas! Junta disuelta conforme al Art. 35');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleAddStudent = async (studentData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/junta/padron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Estudiante incorporado al padrón');
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // HANDLER FOR BIOMBO VOTING
  const handleCastVote = async (
    dni: string,
    token: string,
    candidateListId: string | null
  ): Promise<{ success: boolean; message: string; receiptHash?: string }> => {
    try {
      const res = await fetch('/api/voting/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: schools?.[0]?.id || 'school-cordoba-1',
          dni,
          token,
          candidateListId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        return {
          success: true,
          message: data.message,
          receiptHash: data.receiptHash,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error en votación',
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  };

  // Active School Object for portals
  const activeSchool = schools?.[0] || {
    id: 'school-cordoba-1',
    name: 'IPEM Nº 268 Deán Funes',
    cue: '0402334-00',
    department: 'Capital',
    city: 'Córdoba Capital',
    status: SchoolStatus.APPROVED,
    advisorTeacherName: 'Prof. Marcelo Altamirano',
    advisorTeacherEmail: 'm.altamirano@educacion.cba.gov.ar',
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Institutional Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        usersList={users}
        onOpenArchitecture={() => setShowArchModal(true)}
      />

      {/* Global Alert Notification Toast */}
      {globalMessage && (
        <div className="fixed top-16 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
              globalMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-red-600 text-white border-red-700'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{globalMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {loading && (
          <div className="flex items-center justify-center py-6 gap-2 text-xs font-bold text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Sincronizando estado con el servidor institucional...</span>
          </div>
        )}

        {/* VIEW 1: PUBLIC LANDING & SHARED FORUM */}
        {currentView === 'public' && (
          <PublicLanding
            newsList={news}
            schoolsList={schools}
            onOpenVoting={() => setCurrentView('voting')}
            onSubmitNews={handleSubmitNews}
            onRequestSchool={handleRequestSchool}
          />
        )}

        {/* VIEW 2: BIOMBO DE VOTACIÓN PRESENCIAL */}
        {currentView === 'voting' && (
          <BiomboVotingModule
            school={activeSchool}
            lists={lists}
            onCastVote={handleCastVote}
            onBackToPublic={() => setCurrentView('public')}
          />
        )}

        {/* VIEW 3: PRIVATE MANAGEMENT PORTAL (RBAC) */}
        {currentView === 'portal' && (
          <div>
            {!currentUser ? (
              <GuestPortal
                school={activeSchool}
                newsList={news}
                actasList={actas}
                financesList={finances}
                election={election}
                lists={lists}
              />
            ) : currentUser.role === Role.SUPERADMIN ? (
              <SuperAdminPortal
                schoolsList={schools}
                newsList={news}
                usersList={users}
                onUpdateSchoolStatus={handleUpdateSchoolStatus}
                onModerateNews={handleModerateNews}
                onCreateProvincialNotice={handleCreateProvincialNotice}
                onCreateCredential={handleCreateCredential}
              />
            ) : currentUser.role === Role.ADMIN_CD ? (
              <AdminCDPortal
                school={activeSchool}
                actasList={actas}
                financesList={finances}
                currentUser={currentUser}
                onValidateFormula={handleValidateFormula}
                onCreateActa={handleCreateActa}
                onSignActaByAdvisor={handleSignActaByAdvisor}
                onCreateFinance={handleCreateFinance}
                onApproveFinanceByAdvisor={handleApproveFinanceByAdvisor}
                onSubmitNewsDraft={handleSubmitNewsDraft}
              />
            ) : currentUser.role === Role.ADMIN_JUNTA ? (
              <AdminJuntaPortal
                school={activeSchool}
                election={
                  election || {
                    id: 'elec-cordoba-2026',
                    schoolId: activeSchool.id,
                    year: 2026,
                    title: 'Elecciones Generales de Centro de Estudiantes 2026',
                    status: ElectionStatus.VOTING_OPEN,
                    padronCount: padron.length,
                    votesCount: 0,
                    electionDate: '2026-09-16',
                    votingStartTime: '08:00',
                    votingEndTime: '17:00',
                    juntaDisolved: false,
                  }
                }
                padronList={padron}
                lists={lists}
                juntaMembers={juntaMembers}
                isDisolved={currentUser.isJuntaDisolved || false}
                onGenerateTokens={handleGenerateTokens}
                onOfficializeList={handleOfficializeList}
                onRegisterList={handleRegisterList}
                onComputeScrutiny={handleComputeScrutiny}
                onProclaimElection={handleProclaimElection}
                onAddStudent={handleAddStudent}
              />
            ) : null}
          </div>
        )}
      </main>

      {/* Architecture & Relational Database Specification Modal */}
      <ArchitectureDocsModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white text-xs font-black">
              📢
            </div>
            <span className="font-extrabold text-slate-200">Estudiantes al Centro</span>
            <span>&bull;</span>
            <span>Gobierno de la Provincia de Córdoba</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Resolución Ministerial Nº 124/2010</span>
            <span>&bull;</span>
            <button
              onClick={() => setShowArchModal(true)}
              className="text-sky-400 hover:text-sky-300 font-semibold underline"
            >
              Ver Esquema DB & Arquitectura
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
