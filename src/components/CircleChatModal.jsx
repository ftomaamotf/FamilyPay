import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Mic,
  Send,
  Trash2,
  X,
  Play,
  Pause,
  Volume2,
  Users,
  Crown,
  Smile,
  CheckCheck,
  Radio,
  MessageCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

// High-Fidelity Voice Note Player with Click-to-Seek & Audio Context Resilience
const VoiceMessagePlayer = ({ audioUrl, duration = 0, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(Math.round(audio.duration));
      } else if (duration) {
        setAudioDuration(duration);
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = (e) => {
      console.log('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, duration]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.log('Audio play toggle note:', err);
      setIsPlaying(false);
    }
  };

  const handleSeek = (idx) => {
    if (!audioRef.current || !audioDuration) return;
    const targetPercent = idx / 18;
    const targetTime = targetPercent * audioDuration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-1.5 px-2.5 min-w-[210px] sm:min-w-[250px]" dir="ltr">
      <audio ref={audioRef} src={audioUrl} preload="auto" playsInline />

      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition shadow-md shrink-0 active:scale-95 ${
          isMe
            ? 'bg-white text-emerald-700 hover:bg-slate-100 hover:scale-105'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        {/* Interactive Audio Waveform with Click-to-Seek */}
        <div className="flex items-center gap-1 h-6 cursor-pointer py-1" title="اضغط للانتقال">
          {[25, 55, 80, 40, 95, 65, 45, 90, 60, 75, 100, 45, 70, 35, 85, 55, 90, 40].map((height, idx) => {
            const barProgress = (idx / 18) * 100;
            const isPlayed = progress >= barProgress;
            return (
              <div
                key={idx}
                onClick={() => handleSeek(idx)}
                className={`flex-1 rounded-full transition-all duration-150 hover:opacity-100 ${
                  isPlayed
                    ? isMe ? 'bg-white' : 'bg-emerald-600'
                    : isMe ? 'bg-white/40' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Timers */}
        <div className="flex items-center justify-between text-[10px] font-mono font-bold opacity-90">
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3 opacity-70" />
            <span>{formatTime(audioDuration || duration || 0)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const CircleChatModal = ({ isOpen, onClose, initialRecipientId = 'all' }) => {
  const {
    messages = [],
    sendMessage,
    deleteMessage,
    currentUser,
    brothers = [],
    activeAdminId
  } = useFinance();

  const [activeTab, setActiveTab] = useState(initialRecipientId || 'all');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordingStartTimeRef = useRef(0);
  const mediaStreamRef = useRef(null);

  const getBestMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  useEffect(() => {
    if (initialRecipientId) {
      setActiveTab(initialRecipientId);
    }
  }, [initialRecipientId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isOpen]);

  if (!isOpen) return null;

  const channelMessages = messages.filter((m) => {
    if (activeTab === 'all') {
      return !m.recipientId || m.recipientId === 'all';
    }
    const isSentToUser = (m.recipientId === activeTab && m.senderId === currentUser?.id);
    const isReceivedFromUser = (m.senderId === activeTab && m.recipientId === currentUser?.id);
    return isSentToUser || isReceivedFromUser;
  });

  const selectedBrother = brothers.find((b) => b.id === activeTab);

  const handleSendText = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    await sendMessage({
      recipientId: activeTab,
      text: inputText.trim(),
      type: 'text'
    });
    setInputText('');
    setSending(false);
  };

  const startRecording = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        mediaStreamRef.current = stream;

        const mimeType = getBestMimeType();
        const options = mimeType ? { mimeType } : undefined;
        const recorder = new MediaRecorder(stream, options);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const finalDuration = Math.max(1, Math.round((Date.now() - recordingStartTimeRef.current) / 1000));
          const actualMime = mimeType || 'audio/webm';
          const audioBlob = new Blob(chunks, { type: actualMime });

          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result;
            if (base64Audio) {
              await sendMessage({
                recipientId: activeTab,
                audioUrl: base64Audio,
                audioDuration: finalDuration,
                type: 'voice'
              });
            }
          };

          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
          }
        };

        recordingStartTimeRef.current = Date.now();
        recorder.start(250);
        setMediaRecorder(recorder);
        setIsRecording(true);
        setRecordingSeconds(0);

        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        alert('المتصفح لا يدعم تسجيل الصوت.');
      }
    } catch (err) {
      alert('تعذر الوصول إلى المايكروفون. يرجى التأكد من منح إذن المايكروفون في إعدادات الهاتف.');
      console.error('Audio recording error:', err);
    }
  };

  const stopRecordingAndSend = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.ondataavailable = null;
      mediaRecorder.onstop = null;
      mediaRecorder.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const quickEmojis = ['👍', '❤️', '👏', '💸', '⛽', '🥛', '🩺', '🤲', '🌹', '✅'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[92vh] sm:h-[85vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>محادثة ورسائل دوائر المستخدمين 🎙️💬</span>
              </h3>
              <p className="text-xs text-emerald-200">
                محادثات فورية وبصمات صوتية مع إشعار صوتي فوري عند الإرسال
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels / User Tabs Bar */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={'px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition whitespace-nowrap ' + (
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>🌐 محادثة عامة للدوائر</span>
          </button>

          {brothers.map((b) => {
            const isMe = b.id === currentUser?.id;
            const isSelected = activeTab === b.id;
            const isAdmin = b.id === activeAdminId || b.isAdmin;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveTab(b.id)}
                className={'px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap border ' + (
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                )}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                  style={{ backgroundColor: b.avatarColor || '#10b981' }}
                >
                  {b.name[0]}
                </span>
                <span>{b.name}</span>
                {isAdmin && <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />}
                {isMe && <span className="text-[9px] opacity-75">(أنت)</span>}
              </button>
            );
          })}
        </div>

        {/* Current Active Channel Status Bar */}
        <div className="px-4 py-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              {activeTab === 'all'
                ? '🌐 أنت الآن في المحادثة العامة لجميع دوائر المستخدمين والأدمن'
                : ('👤 محادثة مباشرة مع: ' + (selectedBrother?.name || 'المستخدم'))
              }
            </span>

            {/* WhatsApp Actions */}
            {activeTab !== 'all' && (
              <div className="flex items-center gap-1.5 mr-1">
                {/* WhatsApp Chat & Call Button */}
                {selectedBrother?.phone && (
                  <a
                    href={`https://wa.me/${String(selectedBrother.phone).replace(/[\s\-\+]/g, '').replace(/^0/, '964')}?text=${encodeURIComponent(`مرحباً ${selectedBrother.name}، بخصوص حساب ومصاريف الصندوق..`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] rounded-xl shadow-sm transition flex items-center gap-1 active:scale-95 border border-emerald-400"
                    title="مكالمة أو مراسلة عبر واتساب"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>واتساب 💬</span>
                  </a>
                )}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400">
            {channelMessages.length} رسالة
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-100/60 dark:bg-slate-950/40">
          {channelMessages.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                لا توجد رسائل سابقة في هذه المحادثة
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                اكتب رسالة نصية أو اضغط على المايكروفون 🎙️ لتسجيل بصمة صوتية وإرسالها فوراً مع صوت إشعار!
              </p>
            </div>
          ) : (
            channelMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              const senderBrother = brothers.find((b) => b.id === msg.senderId);
              const avatarColor = senderBrother?.avatarColor || msg.senderAvatarColor || '#10b981';

              return (
                <div
                  key={msg.id}
                  className={'flex items-end gap-2 ' + (isMe ? 'flex-row-reverse' : 'flex-row') + ' group/msg'}
                >
                  <div
                    className="w-8 h-8 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0"
                    style={{ backgroundColor: avatarColor }}
                    title={msg.senderName}
                  >
                    {msg.senderName?.[0] || 'م'}
                  </div>

                  <div className={'max-w-[80%] sm:max-w-[70%] space-y-1 ' + (isMe ? 'items-end' : 'items-start')}>
                    {!isMe && (
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 px-1">
                        {msg.senderName}
                      </span>
                    )}

                    <div
                      className={'p-3.5 rounded-3xl shadow-md text-xs leading-relaxed relative ' + (
                        isMe
                          ? 'bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                      )}
                    >
                      {msg.type === 'voice' && msg.audioUrl ? (
                        <VoiceMessagePlayer
                          audioUrl={msg.audioUrl}
                          duration={msg.audioDuration}
                          isMe={isMe}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      )}

                      <div
                        className={'flex items-center gap-1.5 mt-1 text-[9px] font-mono ' + (
                          isMe ? 'text-emerald-200 justify-end' : 'text-slate-400 justify-start'
                        )}
                      >
                        <span>
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                      </div>
                    </div>
                  </div>

                  {(isMe || currentUser?.isAdmin || currentUser?.id === activeAdminId) && (
                    <button
                      type="button"
                      onClick={() => deleteMessage(msg.id)}
                      title="حذف هذه الرسالة"
                      className="opacity-0 group-hover/msg:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Emoji Reactions Bar */}
        <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[11px] text-slate-400 font-bold px-1 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span>تفاعل سريع:</span>
          </span>
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                sendMessage({
                  recipientId: activeTab,
                  text: emoji,
                  type: 'text'
                });
              }}
              className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl border border-slate-200 dark:border-slate-700 text-sm transition active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Message Input & Voice Recording Area */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {isRecording ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 text-rose-800 dark:text-rose-200 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-rose-600 animate-ping" />
                <div className="flex items-center gap-2 font-black text-xs">
                  <Mic className="w-4 h-4 text-rose-600" />
                  <span>جاري تسجيل بصمة صوتية...</span>
                  <span className="font-mono text-sm font-black bg-rose-200 dark:bg-rose-900 px-2 py-0.5 rounded-lg">
                    {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60) < 10 ? '0' : ''}{recordingSeconds % 60}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  title="إلغاء التسجيل"
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>إلغاء</span>
                </button>

                <button
                  type="button"
                  onClick={stopRecordingAndSend}
                  title="إنهاء وإرسال البصمة"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 -rotate-45" />
                  <span>إرسال البصمة 🎙️</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <button
                type="button"
                onClick={startRecording}
                title="اضغط لتسجيل بصمة صوتية 🎙️"
                className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center transition active:scale-95 shadow-sm shrink-0"
              >
                <Mic className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeTab === 'all'
                    ? 'اكتب رسالة عامة للدوائر والأدمن...'
                    : ('اكتب رسالة خاصة إلى ' + (selectedBrother?.name || 'المستخدم') + '...')
                }
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className={'w-11 h-11 rounded-2xl flex items-center justify-center transition shrink-0 ' + (
                  inputText.trim() && !sending
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                )}
              >
                <Send className="w-5 h-5 -rotate-45" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
