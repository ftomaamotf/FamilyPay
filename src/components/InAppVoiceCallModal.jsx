import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export const InAppVoiceCallModal = () => {
  const {
    currentUser,
    activeCall,
    incomingCall,
    acceptVoiceCall,
    rejectVoiceCall,
    endVoiceCall,
    sendCallVoiceChunk,
    incomingVoiceBurst
  } = useFinance();

  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);

  // Audio recording stream ref for continuous live conversation
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Handle call timer when connected
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCall?.status]);

  // Handle continuous live microphone streaming when call is connected
  useEffect(() => {
    if (activeCall?.status === 'connected' && !isMuted) {
      startLiveAudioStreaming();
    } else {
      stopLiveAudioStreaming();
    }

    return () => {
      stopLiveAudioStreaming();
    };
  }, [activeCall?.status, isMuted]);

  const startLiveAudioStreaming = async () => {
    if (isRecordingRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
      });
      mediaRecorderRef.current = recorder;
      isRecordingRef.current = true;

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0 && activeCall?.id) {
          const reader = new FileReader();
          reader.readAsDataURL(e.data);
          reader.onloadend = () => {
            sendCallVoiceChunk(activeCall.id, reader.result);
          };
        }
      };

      // Slice audio in 350ms packets for continuous real-time live streaming
      recorder.start(350);
    } catch (err) {
      console.log('Mic access error for live call:', err);
    }
  };

  const stopLiveAudioStreaming = () => {
    isRecordingRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Format seconds into MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  };

  // 1. INCOMING CALL POPUP (مكالمة واردة)
  if (incomingCall && (!activeCall || activeCall.status !== 'connected')) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fadeIn" dir="rtl">
        <div className="bg-slate-900 border-2 border-emerald-500/50 w-full max-w-sm rounded-3xl p-6 text-center text-white shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Caller Avatar with Pulsing Rings */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping duration-1000" />
            <div className="absolute inset-2 rounded-full bg-emerald-500/40 animate-pulse" />
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-xl ring-4 ring-emerald-400 relative z-10"
              style={{ backgroundColor: incomingCall.callerAvatar || '#10b981' }}
            >
              {incomingCall.callerName ? incomingCall.callerName[0] : '📞'}
            </div>
          </div>

          {/* Caller Info */}
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1.5 animate-bounce">
              <Phone className="w-3.5 h-3.5" />
              <span>مكالمة صوتية مباشرة واردة 📞</span>
            </span>
            <h3 className="text-xl font-black text-white">
              {incomingCall.callerName}
            </h3>
            <p className="text-xs text-slate-400">
              يتصل بك الآن داخل البرنامج للتحدث الصوتي المباشر...
            </p>
          </div>

          {/* Accept / Reject Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => acceptVoiceCall(incomingCall.id)}
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/40 flex items-center justify-center gap-2 transition active:scale-95 border border-emerald-400"
            >
              <Phone className="w-4 h-4" />
              <span>رد / قبول 📞</span>
            </button>

            <button
              type="button"
              onClick={() => rejectVoiceCall(incomingCall.id)}
              className="flex-1 py-3.5 px-4 bg-rose-600/90 hover:bg-rose-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition active:scale-95 border border-rose-500"
            >
              <PhoneOff className="w-4 h-4" />
              <span>رفض ❌</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. ACTIVE / CALLING MODAL (مكالمة جارية أو جاري الاتصال)
  if (!activeCall) return null;

  const isCaller = activeCall.callerId === currentUser?.id;
  const peerName = isCaller ? activeCall.receiverName : activeCall.callerName;
  const peerAvatar = isCaller ? activeCall.receiverAvatar : activeCall.callerAvatar;
  const isConnected = activeCall.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fadeIn" dir="rtl">
      <div className="bg-slate-900 border-2 border-slate-700/80 w-full max-w-sm rounded-3xl p-6 sm:p-7 text-center text-white shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow */}
        <div className={'absolute -top-20 -left-20 w-48 h-48 rounded-full blur-3xl pointer-events-none ' + (
          isConnected ? 'bg-emerald-500/25' : 'bg-amber-500/25'
        )} />

        {/* Peer Avatar & Audio Animation */}
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          {isConnected && (
            <>
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
              <div className="absolute -inset-2 rounded-full border-2 border-dashed border-emerald-400/40 animate-spin" style={{ animationDuration: '8s' }} />
            </>
          )}
          {!isConnected && (
            <div className="absolute inset-0 rounded-full bg-amber-500/30 animate-pulse duration-700" />
          )}

          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-4 ring-white/20 relative z-10"
            style={{ backgroundColor: peerAvatar || '#10b981' }}
          >
            {peerName ? peerName[0] : '👤'}
          </div>
        </div>

        {/* Peer Name & Call Status */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-white">
            {peerName}
          </h3>

          {isConnected ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-mono font-black text-sm">
                {formatDuration(callDuration)}
              </span>
              <span className="text-xs text-slate-400 font-bold">• مكالمة صوتية مباشرة</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-xs animate-pulse">
              <Phone className="w-3.5 h-3.5" />
              <span>جاري الاتصال والرنين على المستخدم... 📶</span>
            </div>
          )}
        </div>

        {/* Live Audio Waves Visualizer */}
        {isConnected && (
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-center gap-1.5">
            <span className="text-[11px] text-emerald-400 font-black">جاري نقل الصوت المباشر بجودة عالية</span>
            <div className="flex items-center gap-1">
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            </div>
          </div>
        )}

        {/* In-Call Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          
          {/* Mute / Unmute Button */}
          {isConnected && (
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={'w-12 h-12 rounded-2xl flex items-center justify-center transition active:scale-95 shadow-md ' + (
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              )}
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم المايكروفون'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
            </button>
          )}

          {/* End Call Button (Red Hangup) */}
          <button
            type="button"
            onClick={() => endVoiceCall(activeCall.id)}
            className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-600/40 flex items-center justify-center gap-2 transition active:scale-95 border border-rose-500"
          >
            <PhoneOff className="w-4 h-4" />
            <span>إنهاء المكالمة 🔴</span>
          </button>

        </div>

      </div>
    </div>
  );
};
