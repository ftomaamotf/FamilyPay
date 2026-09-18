// ======================================================================
// Notification & Message Sounds Synthesizer (Web Audio API)
// 100% Offline, Zero Latency, Cross-Platform (Web & Android WebView)
// ======================================================================

// Helper to safely get or create AudioContext
const getAudioContext = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  } catch (e) {
    console.warn('AudioContext creation error:', e);
    return null;
  }
};

// Vibrate helper
const triggerVibrate = (pattern) => {
  try {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(pattern);
    }
  } catch {
    // ignore
  }
};

/**
 * 1. Tone Synthesizer Functions
 */
const synthFunctions = {
  // 🔔 جرس الصندوق الكلاسيكي (Two-tone warm bell chime)
  'chime-classic': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.35 * vol, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    gain2.gain.setValueAtTime(0.4 * vol, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  },

  // 💰 رنين العملات الذهبية (Sparkling coin chimes)
  'chime-coins': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    const frequencies = [1318.51, 1567.98, 1975.53, 2637.02]; // E6, G6, B6, E7
    frequencies.forEach((freq, idx) => {
      const startTime = now + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.32 * vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  },

  // 💎 الكريستال الحديث (Crisp modern pop / glass chime)
  'chime-modern': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    const notes = [
      { f: 1046.5, t: 0, d: 0.18, type: 'sine' }, // C6
      { f: 1396.91, t: 0.08, d: 0.22, type: 'sine' }, // F6
      { f: 1567.98, t: 0.16, d: 0.35, type: 'sine' } // G6
    ];
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type;
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.35 * vol, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  },

  // 🎶 لحن الماريمبا الهادئ (Warm wooden marimba arpeggio)
  'chime-marimba': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.4 * vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  },

  // 👑 نغمة كبار الشخصيات (Royal VIP 4-stage bell melody)
  'chime-vip': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    const notes = [
      { f: 698.46, t: 0, d: 0.2 }, // F5
      { f: 880.0, t: 0.09, d: 0.2 }, // A5
      { f: 1046.5, t: 0.18, d: 0.25 }, // C6
      { f: 1318.51, t: 0.27, d: 0.45 } // E6
    ];
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type;
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.38 * vol, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  },

  // 📻 النبض الرقمي السريع (Futuristic dual digital pulse)
  'chime-digital': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    [0, 0.09].forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1480, now + t);
      osc.frequency.exponentialRampToValueAtTime(2200, now + t + 0.06);
      gain.gain.setValueAtTime(0.18 * vol, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.07);
    });
  },

  // 💬 نقرة الرسائل الذكية (Smart subtle pop)
  'msg-smart': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
    gain.gain.setValueAtTime(0.3 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  },

  // 🫧 فقاعة صوتية ناعمة (Water bubble pop)
  'msg-bubble': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(1300, now + 0.1);
    gain.gain.setValueAtTime(0.35 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  },

  // 🔔 جرس المحادثة المزدوج (Double bell chime)
  'msg-double': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.28 * vol, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.14);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    gain2.gain.setValueAtTime(0.35 * vol, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.28);
  },

  // 🎵 صفير هادئ ولطيف (Gentle whistle)
  'msg-whistle': (ctx, vol = 1) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(1600, now + 0.08);
    osc.frequency.linearRampToValueAtTime(1400, now + 0.18);
    gain.gain.setValueAtTime(0.25 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }
};

/**
 * 2. Tone Catalogs for UI Display
 */
export const NOTIFICATION_TONES = [
  {
    id: 'chime-classic',
    name: 'جرس الصندوق الكلاسيكي',
    category: 'notification',
    icon: '🔔',
    color: 'emerald',
    description: 'نغمة جرس ثنائية ناعمة ومألوفة ومريحة للأذن (الافتراضية)',
    durationMs: 450
  },
  {
    id: 'chime-coins',
    name: 'رنين العملات الذهبية',
    category: 'notification',
    icon: '💰',
    color: 'amber',
    description: 'نغمات متصاعدة تشبه رنين العملات النقدية والوفرة المالية',
    durationMs: 400
  },
  {
    id: 'chime-modern',
    name: 'الكريستال الحديث (Smart Crystal)',
    category: 'notification',
    icon: '💎',
    color: 'cyan',
    description: 'نغمة ثلاثية إلكترونية عصرية وفائقة النقاء تشبه الهواتف الفاخرة',
    durationMs: 500
  },
  {
    id: 'chime-marimba',
    name: 'لحن الماريمبا الهادئ',
    category: 'notification',
    icon: '🎶',
    color: 'purple',
    description: 'نوتات خشبية دافئة ومتتالية بنعومة فائقة وراحة كاملة',
    durationMs: 550
  },
  {
    id: 'chime-vip',
    name: 'نغمة كبار الشخصيات (VIP)',
    category: 'notification',
    icon: '👑',
    color: 'indigo',
    description: 'رنين ملكي رباعي النغمات وواضح جداً للتنبيهات والتحويلات الهامة',
    durationMs: 650
  },
  {
    id: 'chime-digital',
    name: 'النبض الرقمي السريع',
    category: 'notification',
    icon: '📻',
    color: 'rose',
    description: 'نبضات إلكترونية مستقبلية سريعة وخفيفة جداً',
    durationMs: 300
  }
];

export const MESSAGE_TONES = [
  {
    id: 'msg-smart',
    name: 'نقرة الشات الذكية',
    category: 'message',
    icon: '💬',
    color: 'teal',
    description: 'نقرة ناعمة ورشيقة للرسائل والمحادثات السريعة (الافتراضية)',
    durationMs: 150
  },
  {
    id: 'msg-double',
    name: 'جرس المحادثة المزدوج',
    category: 'message',
    icon: '🔔',
    color: 'emerald',
    description: 'رنين ثنائي هادئ وواضح مع نغمة جرس متناغمة',
    durationMs: 300
  },
  {
    id: 'msg-bubble',
    name: 'فقاعة الماء الصوتية',
    category: 'message',
    icon: '🫧',
    color: 'sky',
    description: 'صوت فقاعة ماء لطيف ومبهج يلفت الانتباه بنعومة',
    durationMs: 200
  },
  {
    id: 'msg-whistle',
    name: 'الصفير اللطيف',
    category: 'message',
    icon: '🎵',
    color: 'amber',
    description: 'صفير نغمي خفيف وواضح دون أي إزعاج',
    durationMs: 250
  }
];

/**
 * 3. Master Play Function
 */
export const playNotificationTone = (toneId = 'chime-classic', options = {}) => {
  const { volume = 1, vibrate = true } = options;

  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    // Resume suspended audio context (browser autoplay policies)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const synth = synthFunctions[toneId] || synthFunctions['chime-classic'];
    synth(ctx, Math.max(0.1, Math.min(1.5, volume)));

    // Handle Vibration if enabled
    if (vibrate) {
      if (toneId.startsWith('msg-')) {
        triggerVibrate([150, 70, 150]);
      } else {
        triggerVibrate([400, 150, 400]);
      }
    }

    return true;
  } catch (err) {
    console.warn('Error playing tone:', toneId, err);
    return false;
  }
};
