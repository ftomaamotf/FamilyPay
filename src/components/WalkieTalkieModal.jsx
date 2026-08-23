import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Signal,
  Check,
  Crown,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const WalkieTalkieModal = () => {
  const {
    currentUser,
    activeAdminId,
    activeCall,
    incomingCall,
    isWalkieTalkieOpen,
    setIsWalkieTalkieOpen,
    acceptIntercomCall,
    rejectIntercomCall,
    endIntercomCall,
    sendIntercomVoiceBurst,
    playWalkieTalkieChirp,
    playIntercomRingtone
  } = useFinance();

  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const ringtoneIntervalRef = useRef(null);
  const callDurationRef = useRef(null);

  // Incoming Call Ringtone loop
  useEffect(() => {
    if (incomingCall && incomingCall.status === 'ringing') {
      playIntercomRingtone();
      ringtoneIntervalRef.current = setInterval(() => {
        playIntercomRingtone();
      }, 2500);
    } else {
      if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    }
    return () => {
      if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    };
  }, [incomingCall, playIntercomRingtone]);

  // Connected Call Duration Timer
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      setCallDuration(0);
      callDurationRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callDurationRef.current) clearInterval(callDurationRef.current);
    }
    return () => {
      if (callDurationRef.current) clearInterval(callDurationRef.current);
    };
  }, [activeCall]);

  // Format Duration seconds
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  };

  // Start Transmitting Voice Burst (Push-To-Talk Press)
  const handleStartTransmitting = async () => {
    if (isTransmitting) return;
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);

      const recorder = new MediaRecorder(audioStream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          if (activeCall && activeCall.id) {
            await sendIntercomVoiceBurst({
              callId: activeCall.id,
              audioData: base64Audio,
              duration: 1
            });
          }
        };
        audioStream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsTransmitting(true);
      playWalkieTalkieChirp();
    } catch (err) {
      console.error('Walkie-talkie mic access error:', err);
      alert('تعذر فتح المايكروفون. يرجى التأكد من منح الإذن في المتصفح.');
    }
  };

  // Stop Transmitting Voice Burst (Push-To-Talk Release)
  const handleStopTransmitting = () => {
    if (mediaRecorder && isTransmitting) {
      mediaRecorder.stop();
      setIsTransmitting(false);
      playWalkieTalkieChirp();
    }
  };

  const isCaller = activeCall && currentUser && activeCall.callerId === currentUser.id;
  const otherPartyName = activeCall ? (isCaller ? activeCall.receiverName : activeCall.callerName) : '';
  const otherPartyAvatar = activeCall ? (isCaller ? activeCall.receiverAvatar : activeCall.callerAvatar) : '#10b981';

  return (
    <>
      {/* 🚨 1. Incoming Intercom Call Alert Modal (طلب المناداة الواردة) 🚨 */}
      {incomingCall && incomingCall.status === 'ringing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
          <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
            
            {/* Background Radar Waves */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-64 h-64 rounded-full border border-emerald-400 animate-ping" />
              <div className="w-48 h-48 rounded-full border border-teal-400 animate-ping delay-200" />
            </div>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black">
              <Radio className="w-4 h-4 animate-bounce" />
              <span>جهاز المناداة واللاسلكي المالي 📻</span>
            </div>

            {/* Caller Profile Avatar */}
            <div className="relative mx-auto w-24 h-24">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-500/30 border-2 border-white/20 mx-auto"
                style={{ backgroundColor: incomingCall.callerAvatar || '#10b981' }}
              >
                {incomingCall.callerName?.[0] || 'م'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-pulse">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>

            {/* Title and prompt */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white">
                الأخ ({incomingCall.callerName})
              </h3>
              <p className="text-emerald-300 text-sm font-bold animate-pulse">
                يطلب التحدث المباشر معك الآن عبر جهاز المناداة.. هل توافق؟
              </p>
              <p className="text-xs text-slate-400">
                عند الموافقة سيتم فتح قناة التحدث المباشر اللاسلكية فوراً
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Accept */}
              <button
                type="button"
                onClick={() => acceptIntercomCall(incomingCall.id)}
                className="py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95 border border-emerald-400/40"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>موافقة والتحدث 🟢</span>
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => rejectIntercomCall(incomingCall.id)}
                className="py-3.5 px-4 bg-slate-800 hover:bg-rose-950/80 text-rose-300 border border-slate-700 hover:border-rose-500/50 font-black text-sm rounded-2xl transition active:scale-95 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                <span>اعتذار / رفض 🔴</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📻 2. Active Walkie-Talkie Session Modal (شاشة جهاز اللاسلكي المباشر) 📻 */}
      {isWalkieTalkieOpen && activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn" dir="rtl">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border-2 border-emerald-500/60 flex flex-col overflow-hidden text-white relative">
            
            {/* Header: Radio Antenna & Close */}
            <div className="p-4 bg-gradient-to-l from-slate-950 via-slate-900 to-emerald-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shadow-inner">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                    <span>جهاز المناداة اللاسلكي</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      CH-01
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-300/80 font-mono flex items-center gap-1">
                    <Signal className="w-3 h-3 text-emerald-400" />
                    <span>قناة اتصال مشفرة ومباشرة</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => endIntercomCall(activeCall.id)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LCD Screen Display */}
            <div className="p-4 mx-4 mt-4 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 shadow-inner flex flex-col items-center justify-center text-center space-y-3 font-mono">
              {/* Call Status */}
              <div className="flex items-center justify-between w-full text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {activeCall.status === 'connected' ? '🟢 متصل ومباشر' : '📡 جاري الرنين...'}
                </span>
                <span className="text-slate-300 font-bold">
                  {activeCall.status === 'connected' ? formatDuration(callDuration) : '--:--'}
                </span>
              </div>

              {/* Connected Brother Info */}
              <div className="flex items-center gap-3 py-1">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-md border border-white/20"
                  style={{ backgroundColor: otherPartyAvatar }}
                >
                  {otherPartyName[0] || 'م'}
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white block">
                    {otherPartyName}
                  </span>
                  <span className="text-xs text-emerald-300/90 block">
                    {activeCall.status === 'connected' ? 'جاهز للتحدث والاستماع 🎙️' : 'بانتظار موافقة الطرف الآخر...'}
                  </span>
                </div>
              </div>

              {/* Status Message or Wave Animation */}
              {activeCall.status === 'connected' ? (
                <div className="w-full flex items-center justify-center gap-1 h-6">
                  {isTransmitting ? (
                    <div className="flex items-center gap-1 w-full justify-center">
                      <span className="text-xs font-bold text-rose-400 mr-2 animate-pulse">جاري البث... 🔴</span>
                      {[40, 80, 100, 60, 90, 70, 100, 50, 80, 60].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                          style={{ height: h + '%', animationDelay: (i * 0.1) + 's' }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>القناة في وضع الاستعداد • اضغط وتحدث</span>
                    </div>
                  )}
                </div>
              ) : activeCall.status === 'rejected' ? (
                <div className="text-rose-400 text-xs font-bold py-1">
                  ❌ اعتذر الطرف الآخر عن المناداة
                </div>
              ) : (
                <div className="text-amber-400 text-xs font-bold py-1 animate-pulse">
                  🔔 جاري إرسال صوت التنبيه للطرف الآخر...
                </div>
              )}
            </div>

            {/* PTT (Push-To-Talk) Center Button Area */}
            <div className="p-6 flex flex-col items-center justify-center space-y-4">
              {activeCall.status === 'connected' ? (
                <div className="flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    onMouseDown={handleStartTransmitting}
                    onMouseUp={handleStopTransmitting}
                    onTouchStart={handleStartTransmitting}
                    onTouchEnd={handleStopTransmitting}
                    className={'w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-150 select-none cursor-pointer border-4 ' + (
                      isTransmitting
                        ? 'bg-rose-600 border-rose-400 scale-105 shadow-rose-600/50 ring-4 ring-rose-500/40'
                        : 'bg-gradient-to-b from-emerald-600 to-teal-700 border-emerald-400 hover:scale-105 active:scale-95 shadow-emerald-600/40'
                    )}
                  >
                    <Mic className={'w-10 h-10 text-white ' + (isTransmitting ? 'animate-bounce' : '')} />
                    <span className="text-xs font-black text-white mt-1">
                      {isTransmitting ? 'تحدث الآن' : 'اضغط للتحدث'}
                    </span>
                    <span className="text-[9px] text-emerald-100/80 font-mono">
                      PUSH TO TALK
                    </span>
                  </button>
                  <p className="text-[11px] text-slate-400 font-bold text-center">
                    اضغط مع الاستمرار للتحدث، واترك الزر عند الانتهاء 📻
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400 animate-spin">
                    <Radio className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-slate-300">
                    جاري مناداة ({otherPartyName})...
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions: End Call Button */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center">
              <button
                type="button"
                onClick={() => endIntercomCall(activeCall.id)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>إنهاء المناداة وإغلاق الخط 🔴</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
