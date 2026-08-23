import React, { useState, useEffect } from 'react';
import { School, ElectoralList, Student } from '../types';
import {
  Vote,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Lock,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface BiomboVotingModuleProps {
  school: School;
  lists: ElectoralList[];
  onCastVote: (dni: string, token: string, candidateListId: string | null) => Promise<{ success: boolean; message: string; receiptHash?: string }>;
  onBackToPublic: () => void;
}

export const BiomboVotingModule: React.FC<BiomboVotingModuleProps> = ({
  school,
  lists = [],
  onCastVote,
  onBackToPublic,
}) => {
  // Steps: 1 = Identification (DNI + Token), 2 = Ballot Selection, 3 = Confirmation, 4 = Cast & Receipt
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [dni, setDni] = useState('');
  const [token, setToken] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isBlankVote, setIsBlankVote] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptHash, setReceiptHash] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(6);

  const officializedLists = (lists || []).filter(l => l.isOfficialized);
  const selectedList = officializedLists.find(l => l.id === selectedListId);

  // Countdown timer on step 4 to reset for next student
  useEffect(() => {
    let timer: any;
    if (step === 4 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (step === 4 && countdown === 0) {
      handleResetForNextVoter();
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleStartVoting = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!dni || !token) {
      setErrorMessage('Por favor ingresá tu DNI y el Token de 6 caracteres entregado en la Mesa.');
      return;
    }
    setStep(2);
  };

  const handleSelectList = (listId: string) => {
    setSelectedListId(listId);
    setIsBlankVote(false);
    setStep(3);
  };

  const handleSelectBlank = () => {
    setSelectedListId(null);
    setIsBlankVote(true);
    setStep(3);
  };

  const handleConfirmAndDeposit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await onCastVote(dni.trim(), token.trim().toUpperCase(), isBlankVote ? null : selectedListId);
    setIsSubmitting(false);

    if (res.success) {
      setReceiptHash(res.receiptHash || 'VOT-REC-OK');
      setCountdown(6);
      setStep(4);
    } else {
      setErrorMessage(res.message || 'Error al procesar el voto en la urna.');
      setStep(1);
    }
  };

  const handleResetForNextVoter = () => {
    setDni('');
    setToken('');
    setSelectedListId(null);
    setIsBlankVote(false);
    setErrorMessage('');
    setReceiptHash('');
    setCountdown(6);
    setStep(1);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-between max-w-5xl mx-auto pb-12">
      {/* Booth Top Header */}
      <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-lg border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-lg">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base">
                Biombo Digital &bull; Boleta Única Electrónica
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.2 rounded-full border border-emerald-500/30">
                Urna Anónima Desacoplada
              </span>
            </div>
            <p className="text-xs text-slate-400">{school.name} &bull; Elecciones Estudiantiles</p>
          </div>
        </div>

        <button
          onClick={onBackToPublic}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Salir del Biombo</span>
        </button>
      </div>

      {/* STEP 1: AUTH & TOKEN ENTRY */}
      {step === 1 && (
        <div className="my-8 max-w-md mx-auto w-full bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Vote className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Ingreso al Cuarto Oscuro
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ingresá tu DNI y el <strong>Token de 6 caracteres</strong> que te entregaron las autoridades de mesa.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleStartVoting} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">
                Número de DNI del Estudiante
              </label>
              <input
                type="text"
                placeholder="Ej: 46219801"
                value={dni}
                onChange={e => setDni(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-sm font-mono font-bold focus:border-red-600 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">
                Token Único de Votación (6 dígitos)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="Ej: TK8892"
                value={token}
                onChange={e => setToken(e.target.value.toUpperCase())}
                required
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-base font-mono font-black tracking-widest text-center uppercase focus:border-red-600 focus:bg-white focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Abrir Boleta Única</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>El voto es secreto, libre e irrevocable</span>
          </div>
        </div>
      )}

      {/* STEP 2: BOLETA ÚNICA DIGITAL */}
      {step === 2 && (
        <div className="my-6 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Boleta Única Digital &bull; Seleccioná tu Opción
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tocá la tarjeta de la lista que querés votar o elegí el voto en blanco.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officializedLists.map(list => (
              <button
                key={list.id}
                onClick={() => handleSelectList(list.id)}
                className="group bg-white rounded-3xl border-3 p-6 text-left shadow-md hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between space-y-4"
                style={{ borderColor: list.colorHex }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-3 py-1 rounded-full text-white text-xs font-black"
                      style={{ backgroundColor: list.colorHex }}
                    >
                      LISTA {list.listNumber}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Oficializada
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition">
                    {list.listName}
                  </h3>

                  <p className="text-xs italic text-slate-500 mt-1">"{list.motto}"</p>

                  {/* Candidate Formula */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Presidente:
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {list.presidentName} ({list.presidentYear}º)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Vicepresidente:
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {list.vicePresidentName} ({list.vicePresidentYear}º)
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="w-full py-2.5 rounded-xl text-center font-black text-xs text-white shadow-xs"
                  style={{ backgroundColor: list.colorHex }}
                >
                  SELECCIONAR LISTA {list.listNumber}
                </div>
              </button>
            ))}

            {/* VOTO EN BLANCO CARD */}
            <button
              onClick={handleSelectBlank}
              className="group bg-slate-100 hover:bg-slate-200 rounded-3xl border-3 border-dashed border-slate-300 hover:border-slate-400 p-6 text-left shadow-xs hover:shadow-md hover:scale-[1.02] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-full bg-slate-300 text-slate-700 text-xs font-black">
                    OPCIÓN
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Estatutario</span>
                </div>

                <h3 className="text-xl font-black text-slate-700 group-hover:text-slate-900">
                  VOTO EN BLANCO
                </h3>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  No computa para la asignación de secretarías a ninguna de las listas presentadas.
                </p>
              </div>

              <div className="w-full py-2.5 rounded-xl text-center font-bold text-xs bg-slate-300 text-slate-700 mt-6">
                SELECCIONAR VOTO EN BLANCO
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIRMATION MODAL / SCREEN */}
      {step === 3 && (
        <div className="my-8 max-w-lg mx-auto w-full bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <Vote className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Confirmación de Sufragio
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              ¿Confirmás tu elección?
            </h2>

            {isBlankVote ? (
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 text-slate-800 font-bold text-base">
                Has seleccionado: <strong>VOTO EN BLANCO</strong>
              </div>
            ) : (
              selectedList && (
                <div
                  className="p-5 rounded-2xl border-2 text-left space-y-2"
                  style={{ borderColor: selectedList.colorHex, backgroundColor: `${selectedList.colorHex}10` }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: selectedList.colorHex }}
                    ></span>
                    <span className="font-black text-slate-900 text-lg">
                      Lista {selectedList.listNumber}: {selectedList.listName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700">
                    Fórmula: <strong>{selectedList.presidentName}</strong> (Pres.) y{' '}
                    <strong>{selectedList.vicePresidentName}</strong> (Vice)
                  </div>
                </div>
              )
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Al tocar en <strong>"Emitir y Depositar en Urna"</strong>, tu voto se guardará de forma completamente anónima y tu token quedará invalidado.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Cambiar Opción
            </button>

            <button
              onClick={handleConfirmAndDeposit}
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Emitir y Depositar en Urna</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: VOTE CASTED & ANONYMOUS RECEIPT */}
      {step === 4 && (
        <div className="my-8 max-w-lg mx-auto w-full bg-white p-8 rounded-3xl border-2 border-emerald-400 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-3 py-1 rounded-full">
              ¡Sufragio Depositado con Éxito!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Gracias por Participar
            </h2>
            <p className="text-xs text-slate-500">
              Tu voto fue procesado y archivado de forma 100% anónima en la urna digital.
            </p>
          </div>

          {/* Anonymous Hash Token */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              Comprobante Criptográfico de Emisión:
            </div>
            <div className="font-mono text-xs font-bold text-slate-800 break-all">
              {receiptHash}
            </div>
          </div>

          {/* Auto-reset countdown */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>
              La pantalla se reiniciará en <strong>{countdown} segundos</strong> para el próximo votante...
            </span>
          </div>

          <button
            onClick={handleResetForNextVoter}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Finalizar Ahora (Siguiente Alumno)</span>
          </button>
        </div>
      )}

      {/* Booth Footer */}
      <div className="text-center text-xs text-slate-400">
        Sistema de Boleta Electrónica Presencial &bull; Resolución Ministerial Nº 124/2010 Córdoba
      </div>
    </div>
  );
};
