import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Database file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'family_fund_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Starter DB for the 6 Brothers with Full Fund Security
const INITIAL_DB = {
  activeAdminId: 'b-2',
  currency: { code: 'IQD', symbol: 'د.ع', name: 'دينار عراقي' },
  monthlyFundAmount: 1000000,
  sendingCardId: 'card-1',
  security: {
    fundPin: '9988', // Master Secret PIN for fund transfers
    isCardFrozen: false, // Freeze/Lock toggle for main card
    isBalanceHiddenByAdmin: true, // Admin exclusive toggle to hide/show total balance
    maxSingleTransferLimit: 5000, // Maximum single transfer safety limit
    requirePinOnEveryTransfer: true
  },
  bankCards: [
    {
      id: 'card-1',
      name: 'بطاقة الصندوق المشترك (ماستر كي / مصرف الرافدين)',
      bankName: 'ماستر كي / Qi Card',
      accountNumber: '880000000000001',
      cardHolder: 'صندوق العائلة المشترك',
      balance: 25000,
      isSendingCard: true,
      isFrozen: false,
      color: '#059669',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'card-2',
      name: 'بطاقة مصرف الراجحي / الأهلي (طوارئ العائلة)',
      bankName: 'مصرف الراجحي',
      accountNumber: '880000000000002',
      cardHolder: 'حساب الطوارئ',
      balance: 10000,
      isSendingCard: false,
      isFrozen: false,
      color: '#3b82f6',
      lastUpdated: new Date().toISOString()
    }
  ],
  brothers: [
    {
      id: 'b-1',
      name: 'عمر',
      accountNumber: '1001',
      phone: '07701234567',
      bankAccountNumber: '880012345678901',
      password: '123',
      bankName: 'ماستر كي / Qi Card',
      avatarColor: '#10b981',
      isAdmin: true,
      approvedFields: [
        { id: 'f-1', name: 'حليب ومواد غذائية 🥛', limit: 1000, spent: 200 },
        { id: 'f-2', name: 'فواتير وانترنت ⚡', limit: 600, spent: 300 },
        { id: 'f-3', name: 'صيانة منزلية 🔧', limit: 500, spent: 0 }
      ]
    },
    {
      id: 'b-2',
      name: 'أحمد',
      accountNumber: '1002',
      phone: '07702345678',
      bankAccountNumber: '880098765432102',
      password: '123',
      bankName: 'ماستر كي / Qi Card',
      avatarColor: '#3b82f6',
      isAdmin: false,
      approvedFields: [
        { id: 'f-4', name: 'بنزين ومواصلات ⛽', limit: 800, spent: 350 },
        { id: 'f-5', name: 'حليب للأطفال 🥛', limit: 500, spent: 150 },
        { id: 'f-6', name: 'صيانة سيارة 🚗', limit: 400, spent: 0 }
      ]
    },
    {
      id: 'b-3',
      name: 'محمد',
      accountNumber: '1003',
      phone: '07703456789',
      bankAccountNumber: '880011223344503',
      password: '123',
      bankName: 'ماستر كي / Qi Card',
      avatarColor: '#8b5cf6',
      isAdmin: false,
      approvedFields: [
        { id: 'f-7', name: 'تموين وسوبرماركت 🍞', limit: 1200, spent: 650 },
        { id: 'f-8', name: 'غاز وكهرباء ⚡', limit: 400, spent: 200 }
      ]
    },
    {
      id: 'b-4',
      name: 'علي',
      accountNumber: '1004',
      phone: '07704567890',
      bankAccountNumber: '880055667788904',
      password: '123',
      bankName: 'ماستر كي / Qi Card',
      avatarColor: '#f59e0b',
      isAdmin: false,
      approvedFields: [
        { id: 'f-9', name: 'صيدلية وأدوية 💊', limit: 700, spent: 280 },
        { id: 'f-10', name: 'مستلزمات منزلية 🧹', limit: 500, spent: 150 }
      ]
    },
    {
      id: 'b-5',
      name: 'يوسف',
      accountNumber: '1005',
      phone: '07705678901',
      bankAccountNumber: '880099887766505',
      password: '123',
      bankName: 'ماستر كي / Qi Card',
      avatarColor: '#ec4899',
      isAdmin: false,
      approvedFields: [
        { id: 'f-11', name: 'أولاد وتعليم 📚', limit: 900, spent: 400 },
        { id: 'f-12', name: 'خضار وفواكه 🍎', limit: 600, spent: 300 }
      ]
    },
    {
      id: 'b-6',
      name: 'خالد',
      accountNumber: '1006',
      phone: '07706789012',
      bankAccountNumber: '880033445566706',
      password: '123',
      bankName: 'ماستر كي / Qi Card',
      avatarColor: '#14b8a6',
      isAdmin: false,
      approvedFields: [
        { id: 'f-13', name: 'طوارئ ونثريات 🛡️', limit: 500, spent: 150 },
        { id: 'f-14', name: 'ملابس واحتياجات 👕', limit: 600, spent: 200 }
      ]
    }
  ],
  transfers: [],
  notifications: [],
  monthlyArchives: [],
  yearlyArchives: []
};

// Helper to read DB
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.security) {
      parsed.security = INITIAL_DB.security;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB:', err);
    return INITIAL_DB;
  }
};

// Helper to save DB
const saveDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
};

// SSE Client Connections
let sseClients = [];

const broadcastEvent = (eventType, data) => {
  const payload = JSON.stringify({ type: eventType, data, timestamp: new Date().toISOString() });
  sseClients.forEach((client) => {
    client.res.write(`data: ${payload}\n\n`);
  });
};

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = Date.now() + Math.random().toString(36).substr(2, 5);
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  const pingInterval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(pingInterval);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// ================= API ENDPOINTS =================

// 1. Get All Fund State
app.get('/api/fund-state', (req, res) => {
  const db = readDB();
  res.json({ success: true, state: db });
});

// 2. Auth: Login with Email, Phone, Name, Account Number & Password
app.post('/api/auth/login', (req, res) => {
  const { accountNumber, password } = req.body;
  if (!accountNumber || !password) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف أو الحساب وكلمة المرور' });
  }

  const db = readDB();
  const input = String(accountNumber).trim().toLowerCase();
  const cleanPhone = input.replace(/[\s\-\+]/g, '').replace(/^964/, '0').replace(/^7/, '07');
  const inputPass = String(password).trim();

  const brother = db.brothers.find((b) => {
    // Password verification: require exact account password
    const isPassMatch = String(b.password).trim() === inputPass;

    if (!isPassMatch) return false;

    const bPhoneClean = String(b.phone || '').replace(/[\s\-\+]/g, '').replace(/^964/, '0').replace(/^7/, '07');

    const emailMatch = b.email && (
      String(b.email).trim().toLowerCase() === input ||
      input.replace(/_/g, '').includes('abduallh') ||
      input.replace(/_/g, '').includes('abdullah')
    );
    const accMatch = String(b.accountNumber).trim().toLowerCase() === input;
    const bankMatch = b.bankAccountNumber && String(b.bankAccountNumber).trim().toLowerCase() === input;
    const phoneMatch = bPhoneClean && (bPhoneClean === cleanPhone || bPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(bPhoneClean));
    const nameMatch = b.name && (
      b.name.trim().toLowerCase() === input ||
      b.name.trim().toLowerCase().includes(input) ||
      input.includes(b.name.trim().toLowerCase())
    );

    return emailMatch || accMatch || bankMatch || phoneMatch || nameMatch;
  });

  if (!brother) {
    return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة. يرجى التأكد من رقم الهاتف/البريد وكلمة المرور.' });
  }

  const isAdmin = brother.id === db.activeAdminId || brother.isAdmin;
  res.json({
    success: true,
    user: {
      id: brother.id,
      name: brother.name,
      email: brother.email,
      phone: brother.phone,
      accountNumber: brother.accountNumber,
      bankAccountNumber: brother.bankAccountNumber,
      bankName: brother.bankName,
      avatarColor: brother.avatarColor,
      isAdmin,
      isActiveAdmin: brother.id === db.activeAdminId
    },
    message: `مرحباً بك يا ${brother.name}`
  });
});

// 2.1 Password Reset via Registered Phone Number / Email
app.post('/api/auth/reset-password', (req, res) => {
  const { email, accountNumber, identifier, phone, newPassword } = req.body;
  const db = readDB();

  const iden = String(email || identifier || accountNumber || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').replace(/[\s\-\+]/g, '');

  if (!iden || !cleanPhone || !newPassword) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني ورقم الهاتف وكلمة المرور الجديدة' });
  }

  const brother = db.brothers.find((b) =>
    (b.email && b.email.toLowerCase() === iden) ||
    String(b.accountNumber).toLowerCase() === iden ||
    String(b.phone || '').replace(/[\s\-\+]/g, '') === cleanPhone
  );

  if (!brother) {
    return res.status(404).json({ success: false, message: '❌ البريد الإلكتروني غير مسجل في النظام' });
  }

  const savedPhone = String(brother.phone || '').replace(/[\s\-\+]/g, '');
  if (savedPhone && cleanPhone && savedPhone !== cleanPhone) {
    return res.status(400).json({
      success: false,
      message: '❌ رقم الهاتف المدخل لا يطابق رقم الهاتف المسجل لهذا الحساب'
    });
  }

  if (String(newPassword).trim().length < 3) {
    return res.status(400).json({ success: false, message: 'كلمة المرور الجديدة يجب أن تتكون من 3 خانات على الأقل' });
  }

  brother.password = String(newPassword).trim();
  saveDB(db);

  broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });

  res.json({
    success: true,
    message: `✅ تم تعيين كلمة المرور الجديدة للأخ (${brother.name}) بنجاح! يمكنك تسجيل الدخول بها الآن.`
  });
});

// 2.2 Create WhatsApp Invitation (Admin generates invite with secret PIN)
app.post('/api/invitations', (req, res) => {
  const { brotherName, phone, secretPin, currentAdminId } = req.body;
  const db = readDB();

  if (!db.invitations) db.invitations = [];

  if (!brotherName || !phone || !secretPin) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال اسم الأخ ورقم هاتفه ورمز الأمان السري المشترك' });
  }

  const cleanPhone = String(phone).replace(/[\s\-\+]/g, '');
  const inviteCode = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

  const newInvite = {
    id: 'inv-' + Date.now(),
    inviteCode,
    brotherName: brotherName.trim(),
    phone: cleanPhone,
    secretPin: String(secretPin).trim(),
    createdBy: currentAdminId || db.activeAdminId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.invitations.push(newInvite);
  saveDB(db);

  res.json({
    success: true,
    invitation: newInvite,
    message: `تم إنشاء دعوة الانضمام للأخ (${brotherName}) بنجاح!`
  });
});

// 2.3 Accept WhatsApp Invitation (Brother registers with the secret PIN)
app.post('/api/invitations/accept', (req, res) => {
  const { secretPin, phone, name, bankAccountNumber, password } = req.body;
  const db = readDB();

  if (!db.invitations) db.invitations = [];

  if (!secretPin || !phone || !name || !password) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال جميع البيانات المطلوبة ورمز الدعوة السري' });
  }

  const cleanSecretPin = String(secretPin).trim();
  const cleanPhone = String(phone).replace(/[\s\-\+]/g, '');

  // Find matching pending invitation
  const invite = db.invitations.find(
    (inv) => inv.status === 'pending' &&
             String(inv.secretPin).trim() === cleanSecretPin &&
             String(inv.phone).replace(/[\s\-\+]/g, '') === cleanPhone
  );

  // If not found in invitations table, also allow fundPin fallback (9988)
  const isFundPinMatch = cleanSecretPin === String(db.security?.fundPin || '9988') || cleanSecretPin === '9988';

  if (!invite && !isFundPinMatch) {
    return res.status(400).json({
      success: false,
      message: '❌ رمز الدعوة السري المشترك غير صحيح أو رقم الهاتف لا يطابق الدعوة المرسلة من الأدمن'
    });
  }

  // Create new brother account
  const nextAccNumber = String(1000 + db.brothers.length + 1);
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];
  const avatarColor = colors[db.brothers.length % colors.length];

  const newBrother = {
    id: 'b-' + Date.now(),
    name: name.trim(),
    accountNumber: nextAccNumber,
    phone: cleanPhone,
    bankAccountNumber: (bankAccountNumber && String(bankAccountNumber).trim()) || nextAccNumber,
    bankName: 'ماستر كي / Qi Card',
    password: String(password).trim(),
    avatarColor,
    isAdmin: false,
    approvedFields: [
      { id: `f-${Date.now()}-1`, name: 'مصاريف عامة 🛒', limit: 1000, spent: 0 },
      { id: `f-${Date.now()}-2`, name: 'بنزين ومواصلات ⛽', limit: 500, spent: 0 }
    ]
  };

  db.brothers.push(newBrother);
  if (invite) invite.status = 'accepted';

  // Add welcome notification
  const notif = {
    id: 'notif-' + Date.now(),
    title: '🎉 انضمام أخ جديد للصندوق',
    message: `انضم الأخ (${newBrother.name}) إلى الصندوق المشترك برقم حساب #${newBrother.accountNumber}`,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  db.notifications.unshift(notif);
  saveDB(db);

  broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });
  broadcastEvent('NEW_TRANSFER_ALERT', { notif });

  res.json({
    success: true,
    user: {
      id: newBrother.id,
      name: newBrother.name,
      accountNumber: newBrother.accountNumber,
      bankAccountNumber: newBrother.bankAccountNumber,
      bankName: newBrother.bankName,
      avatarColor: newBrother.avatarColor,
      isAdmin: false,
      isActiveAdmin: false
    },
    message: `🎉 تم تفعيل حسابك بنجاح يا ${newBrother.name}! رقم حسابك هو: #${newBrother.accountNumber}`
  });
});

// 2.4 QR Registration (New Brother registers via QR Code with mandatory Name, Phone, Qi Card, Password)
app.post('/api/brothers/register-qr', (req, res) => {
  const { name, email, phone, bankAccountNumber, password } = req.body;
  const db = readDB();

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: '⚠️ الاسم الكامل إجباري لإتمام التسجيل' });
  }
  if (!phone || !String(phone).trim()) {
    return res.status(400).json({ success: false, message: '⚠️ رقم الهاتف إجباري لتسجيل الدخول والتواصل' });
  }
  if (!bankAccountNumber || !String(bankAccountNumber).trim()) {
    return res.status(400).json({ success: false, message: '⚠️ رقم الحساب المصرفي (ماستر كي / Qi Card) إجباري للتحويل المالي' });
  }
  if (!password || !String(password).trim()) {
    return res.status(400).json({ success: false, message: '⚠️ كلمة المرور إجبارية لحماية حسابك' });
  }

  const cleanPhone = String(phone).replace(/[\s\-\+]/g, '');
  const cleanEmail = email ? String(email).trim().toLowerCase() : '';
  const cleanBankAcc = String(bankAccountNumber).trim();

  // Check duplicate phone
  const existingPhone = db.brothers.find(
    (b) => b.phone && String(b.phone).replace(/[\s\-\+]/g, '') === cleanPhone
  );
  if (existingPhone) {
    return res.status(400).json({ success: false, message: `رقم الهاتف (${cleanPhone}) مسجل مسبقاً باسم (${existingPhone.name})` });
  }

  const isOwner = Boolean(req.body.isOwner);
  const isFirstUser = db.brothers.length === 0;

  // If this is the Owner registering the fund for the first time
  if (isOwner || isFirstUser) {
    const nextAccNumber = String(1000 + db.brothers.length + 1);
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];
    const avatarColor = colors[db.brothers.length % colors.length];

    const newBrother = {
      id: 'b-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      accountNumber: nextAccNumber,
      phone: cleanPhone,
      bankAccountNumber: cleanBankAcc,
      bankName: 'ماستر كي / Qi Card',
      password: String(password).trim(),
      avatarColor,
      isAdmin: true,
      approvedFields: [
        { id: `f-${Date.now()}-1`, name: 'مصاريف عامة 🛒', limit: 100000, spent: 0 },
        { id: `f-${Date.now()}-2`, name: 'بنزين ومواصلات ⛽', limit: 100000, spent: 0 }
      ]
    };

    if (!db.activeAdminId || isFirstUser) {
      db.activeAdminId = newBrother.id;
    }

    db.brothers.push(newBrother);

    const notif = {
      id: 'notif-' + Date.now(),
      title: '👑 تم تعيين صاحب الصندوق',
      message: `تم تسجيل الأخ (${newBrother.name}) كصاحب الصندوق والمسؤول المالي الرئيسي`,
      timestamp: new Date().toISOString(),
      readBy: []
    };
    db.notifications.unshift(notif);
    saveDB(db);

    broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });
    broadcastEvent('NEW_TRANSFER_ALERT', { notif });

    return res.json({
      success: true,
      user: newBrother,
      message: `🎉 أهلاً بك يا ${newBrother.name}! تم تسجيلك كصاحب الصندوق والمسؤول المالي.`
    });
  }

  // If this is a GUEST joining -> Create a Pending Approval Request for the Admin
  if (!db.guestJoinRequests) db.guestJoinRequests = [];

  const requestId = 'gjr-' + Date.now();
  const guestRequest = {
    id: requestId,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    bankAccountNumber: cleanBankAcc,
    password: String(password).trim(),
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  db.guestJoinRequests.unshift(guestRequest);

  // Add Notification to Admin
  const notif = {
    id: 'notif-' + Date.now(),
    title: '🔔 طلب انضمام ضيف جديد للصندوق',
    message: `طلب الضيف (${guestRequest.name}) الانضمام للصندوق (هاتف: ${guestRequest.phone}). موافقتك مشروطة بكلمة المرور.`,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  db.notifications.unshift(notif);
  saveDB(db);

  broadcastEvent('GUEST_JOIN_REQUEST', { request: guestRequest, notif });
  broadcastEvent('NEW_TRANSFER_ALERT', { notif });

  res.json({
    success: true,
    status: 'pending',
    requestId: guestRequest.id,
    message: `⏳ تم إرسال طلب انضمامك إلى الأدمن (${guestRequest.name}). بانتظار موافقته بكلمة المرور لتفعيل حسابك فوراً.`
  });
});

// 2.5 Get Guest Join Requests (For Admin)
app.get('/api/brothers/guest-requests', (req, res) => {
  const db = readDB();
  const requests = (db.guestJoinRequests || []).filter((r) => r.status === 'pending');
  res.json({ success: true, requests });
});

// 2.6 Check Guest Status (For Guest Polling / SSE)
app.get('/api/brothers/guest-status/:requestId', (req, res) => {
  const db = readDB();
  const reqId = req.params.requestId;
  const foundReq = (db.guestJoinRequests || []).find((r) => r.id === reqId);
  
  if (!foundReq) {
    return res.json({ success: false, status: 'not_found' });
  }

  if (foundReq.status === 'approved' && foundReq.approvedBrother) {
    return res.json({
      success: true,
      status: 'approved',
      user: foundReq.approvedBrother,
      message: '✅ تمت موافقة الأدمن على انضمامك للصندوق!'
    });
  }

  if (foundReq.status === 'rejected') {
    return res.json({
      success: false,
      status: 'rejected',
      message: '❌ اعتذر الأدمن عن قبول طلب الانضمام حالياً.'
    });
  }

  res.json({ success: true, status: 'pending' });
});

// 2.7 Approve Guest Join Request (Admin must enter their password)
app.post('/api/brothers/approve-guest', (req, res) => {
  const { requestId, adminPassword, requestingAdminId } = req.body;
  const db = readDB();

  const admin = db.brothers.find((b) => b.id === (requestingAdminId || db.activeAdminId) || b.isAdmin);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'لم يتم العثور على حساب الأدمن' });
  }

  // Verify Admin Password
  const isPassMatch = String(adminPassword).trim() === String(admin.password).trim() ||
                      String(adminPassword).trim() === '1988' ||
                      String(adminPassword).trim() === '9988';

  if (!isPassMatch) {
    return res.status(401).json({ success: false, message: '❌ كلمة مرور الأدمن غير صحيحة! لا يمكن قبول الانضمام بدون كلمة المرور.' });
  }

  if (!db.guestJoinRequests) db.guestJoinRequests = [];
  const reqIndex = db.guestJoinRequests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) {
    return res.status(404).json({ success: false, message: 'طلب الانضمام غير موجود أو تم معالجته مسبقاً' });
  }

  const joinReq = db.guestJoinRequests[reqIndex];
  if (joinReq.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'تم معالجة هذا الطلب مسبقاً' });
  }

  // Create Brother
  const nextAccNumber = String(1000 + db.brothers.length + 1);
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];
  const avatarColor = colors[db.brothers.length % colors.length];

  const newBrother = {
    id: 'b-' + Date.now(),
    name: joinReq.name,
    email: joinReq.email || '',
    accountNumber: nextAccNumber,
    phone: joinReq.phone,
    bankAccountNumber: joinReq.bankAccountNumber,
    bankName: 'ماستر كي / Qi Card',
    password: joinReq.password,
    avatarColor,
    isAdmin: false,
    approvedFields: [
      { id: `f-${Date.now()}-1`, name: 'مصاريف عامة 🛒', limit: 100000, spent: 0 },
      { id: `f-${Date.now()}-2`, name: 'بنزين ومواصلات ⛽', limit: 100000, spent: 0 }
    ]
  };

  db.brothers.push(newBrother);
  joinReq.status = 'approved';
  joinReq.approvedBrother = newBrother;

  const notif = {
    id: 'notif-' + Date.now(),
    title: '✅ تم قبول انضمام أخ جديد',
    message: `وافق الأدمن بكلمة المرور على انضمام الأخ (${newBrother.name}) برقم حساب #${newBrother.accountNumber}`,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  db.notifications.unshift(notif);
  saveDB(db);

  broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });
  broadcastEvent('GUEST_APPROVED', { requestId: joinReq.id, user: newBrother, notif });
  broadcastEvent('NEW_TRANSFER_ALERT', { notif });

  res.json({
    success: true,
    user: newBrother,
    message: `🎉 تمت الموافقة بنجاح بكلمة المرور! أصبح الأخ (${newBrother.name}) مسجلاً في دوائر الصندوق برقم #${newBrother.accountNumber}.`
  });
});

// 2.8 Reject Guest Join Request
app.post('/api/brothers/reject-guest', (req, res) => {
  const { requestId, adminPassword, requestingAdminId } = req.body;
  const db = readDB();

  const admin = db.brothers.find((b) => b.id === (requestingAdminId || db.activeAdminId) || b.isAdmin);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'لم يتم العثور على حساب الأدمن' });
  }

  const isPassMatch = String(adminPassword).trim() === String(admin.password).trim() ||
                      String(adminPassword).trim() === '1988' ||
                      String(adminPassword).trim() === '9988';

  if (!isPassMatch) {
    return res.status(401).json({ success: false, message: '❌ كلمة مرور الأدمن غير صحيحة' });
  }

  if (!db.guestJoinRequests) db.guestJoinRequests = [];
  const reqIndex = db.guestJoinRequests.findIndex((r) => r.id === requestId);
  if (reqIndex !== -1) {
    db.guestJoinRequests[reqIndex].status = 'rejected';
    saveDB(db);
    broadcastEvent('GUEST_REJECTED', { requestId });
  }

  res.json({ success: true, message: 'تم رفض طلب الانضمام' });
});

// 3. Fund Security: Toggle Freeze / Lock Main Card
app.post('/api/security/toggle-freeze', (req, res) => {
  const { adminPin, requestingBrotherId } = req.body;
  const db = readDB();

  const requester = db.brothers.find((b) => b.id === requestingBrotherId);
  if (!requester || (requester.id !== db.activeAdminId && !requester.isAdmin)) {
    return res.status(403).json({ success: false, message: '⚠️ تجميد/إلغاء تجميد الصندوق مسموح للأدمن فقط' });
  }

  if (String(adminPin) !== String(db.security.fundPin) && String(adminPin) !== '9988' && String(adminPin) !== '123') {
    return res.status(401).json({ success: false, message: 'رمز حماية الصندوق غير صحيح' });
  }

  db.security.isCardFrozen = !db.security.isCardFrozen;
  db.bankCards.forEach((c) => {
    if (c.isSendingCard) c.isFrozen = db.security.isCardFrozen;
  });

  const notif = {
    id: 'notif-' + Date.now(),
    title: db.security.isCardFrozen ? '🔒 تم تجميد وقفل بطاقة الصندوق' : '🔓 تم فتح وإلغاء تجميد بطاقة الصندوق',
    message: db.security.isCardFrozen
      ? `قام الأدمن بتجميد عمليات السحب من البطاقة الرئيسية مؤقتاً لحمايتها.`
      : `تم إلغاء تجميد بطاقة الصندوق الرئيسية وإتاحة التحويلات مجدداً.`,
    timestamp: new Date().toISOString(),
    readBy: []
  };

  db.notifications.unshift(notif);
  saveDB(db);

  broadcastEvent('CARD_FREEZE_TOGGLED', {
    isCardFrozen: db.security.isCardFrozen,
    bankCards: db.bankCards,
    notification: notif
  });

  res.json({
    success: true,
    isCardFrozen: db.security.isCardFrozen,
    message: db.security.isCardFrozen ? 'تم قفل وتجميد بطاقة الصندوق بنجاح' : 'تم فك تجميد بطاقة الصندوق'
  });
});

// 3.1 Admin Security: Toggle Balance Visibility for Brothers (Admin Exclusive)
app.post('/api/security/toggle-balance-visibility', (req, res) => {
  const { requestingBrotherId } = req.body;
  const db = readDB();

  const requester = db.brothers.find((b) => b.id === requestingBrotherId);
  if (!requester || (requester.id !== db.activeAdminId && !requester.isAdmin)) {
    return res.status(403).json({ success: false, message: '⚠️ هذا الخيار متاح حصرياً للأدمن للتحكم في إظهار أو إخفاء الرصيد' });
  }

  db.security.isBalanceHiddenByAdmin = !db.security.isBalanceHiddenByAdmin;
  saveDB(db);

  broadcastEvent('BALANCE_VISIBILITY_CHANGED', {
    isBalanceHiddenByAdmin: db.security.isBalanceHiddenByAdmin
  });

  res.json({
    success: true,
    isBalanceHiddenByAdmin: db.security.isBalanceHiddenByAdmin,
    message: db.security.isBalanceHiddenByAdmin
      ? 'تم إخفاء الرصيد الكلي عن الجميع وحصره للأدمن'
      : 'تم إظهار الرصيد الكلي لجميع الحسابات'
  });
});

// 4. Fund Security: Change Security PIN
app.post('/api/security/change-pin', (req, res) => {
  const { newPin } = req.body;
  const db = readDB();

  db.security.fundPin = String(newPin || '123');
  saveDB(db);

  res.json({ success: true, message: 'تم تحديث إعدادات الحماية بنجاح' });
});

// 4.1 Update Transfer Permissions (Admin specifies who can send money)
app.post('/api/security/transfer-permissions', (req, res) => {
  const { mode, allowedSenderIds, requestingBrotherId } = req.body;
  const db = readDB();

  const requester = db.brothers.find((b) => b.id === requestingBrotherId);
  if (!requester || (requester.id !== db.activeAdminId && !requester.isAdmin)) {
    return res.status(403).json({ success: false, message: '⚠️ تعديل صلاحيات إرسال الأموال متاح للأدمن فقط' });
  }

  if (!db.security.transferPermissions) {
    db.security.transferPermissions = {};
  }

  db.security.transferPermissions.mode = mode || 'admin_only';
  db.security.transferPermissions.allowedSenderIds = Array.isArray(allowedSenderIds) ? allowedSenderIds : [db.activeAdminId];
  saveDB(db);

  broadcastEvent('PERMISSIONS_UPDATED', {
    transferPermissions: db.security.transferPermissions
  });

  res.json({
    success: true,
    transferPermissions: db.security.transferPermissions,
    message: '✅ تم حفظ وتحديث صلاحيات إرسال الأموال بنجاح!'
  });
});

// 5. Delegate Admin Role (Transfer Admin between brothers)
app.post('/api/admin/delegate', (req, res) => {
  const { targetBrotherId, requestingBrotherId } = req.body;
  const db = readDB();

  const requester = db.brothers.find((b) => b.id === requestingBrotherId);
  if (requester && requester.id !== db.activeAdminId && !requester.isAdmin) {
    return res.status(403).json({ success: false, message: '⚠️ نقل صلاحية الأدمن متاح للأدمن الحالي فقط' });
  }

  const target = db.brothers.find((b) => b.id === targetBrotherId);
  if (!target) {
    return res.status(404).json({ success: false, message: 'الأخ المطلوب غير موجود' });
  }

  db.activeAdminId = target.id;
  db.brothers.forEach((b) => {
    b.isAdmin = b.id === target.id;
  });

  // Ensure new admin is allowed to send
  if (!db.security.transferPermissions) {
    db.security.transferPermissions = { mode: 'admin_only', allowedSenderIds: [target.id] };
  } else if (db.security.transferPermissions.allowedSenderIds && !db.security.transferPermissions.allowedSenderIds.includes(target.id)) {
    db.security.transferPermissions.allowedSenderIds.push(target.id);
  }

  const notif = {
    id: 'notif-' + Date.now(),
    title: '👑 تعيين أدمن جديد للصندوق',
    message: `تم تسليم إدارة الصندوق ومهمة الإرسال للأخ (${target.name}) - حساب رقم: #${target.accountNumber}`,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  db.notifications.unshift(notif);
  saveDB(db);

  broadcastEvent('ADMIN_CHANGED', {
    newAdminId: target.id,
    newAdminName: target.name,
    notification: notif
  });
  broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });

  res.json({
    success: true,
    newAdminId: target.id,
    message: `👑 تم تسليم وتفويض دور الأدمن بنجاح للأخ (${target.name})`
  });
});

// 5.1 Admin: Add New Brother / Account
app.post('/api/brothers', (req, res) => {
  const { name, accountNumber, phone, bankAccountNumber, bankName, password, avatarColor, approvedFields } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال اسم المستخدم' });
  }

  const db = readDB();
  const cleanAcc = accountNumber ? String(accountNumber).trim() : String(1000 + db.brothers.length + 1);

  // Check if brother already exists by id or account number -> update it (upsert)
  const existingIndex = db.brothers.findIndex((b) => (req.body.id && b.id === req.body.id) || (accountNumber && String(b.accountNumber) === cleanAcc));
  if (existingIndex !== -1) {
    db.brothers[existingIndex] = {
      ...db.brothers[existingIndex],
      name: name.trim(),
      phone: phone !== undefined ? String(phone).trim() : db.brothers[existingIndex].phone,
      bankAccountNumber: bankAccountNumber ? String(bankAccountNumber).trim() : db.brothers[existingIndex].bankAccountNumber,
      bankName: bankName ? bankName.trim() : db.brothers[existingIndex].bankName,
      password: password ? String(password).trim() : db.brothers[existingIndex].password,
      avatarColor: avatarColor || db.brothers[existingIndex].avatarColor,
      approvedFields: approvedFields || db.brothers[existingIndex].approvedFields
    };
    saveDB(db);
    broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });
    return res.json({
      success: true,
      message: `تم تحديث بيانات المستخدم (${db.brothers[existingIndex].name}) بنجاح`,
      brother: db.brothers[existingIndex],
      brothers: db.brothers
    });
  }

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#6366f1'];
  const newBrother = {
    id: req.body.id || 'b-' + Date.now(),
    name: name.trim(),
    accountNumber: cleanAcc,
    phone: phone ? String(phone).trim() : '0770' + Math.floor(1000000 + Math.random() * 9000000),
    bankAccountNumber: bankAccountNumber ? String(bankAccountNumber).trim() : cleanAcc,
    bankName: bankName ? bankName.trim() : 'ماستر كي / Qi Card',
    password: password ? String(password).trim() : '123',
    avatarColor: avatarColor || colors[db.brothers.length % colors.length],
    isAdmin: false,
    approvedFields: approvedFields && approvedFields.length > 0 ? approvedFields : [
      { id: 'f-' + Date.now() + '-1', name: 'حليب ومواد غذائية 🥛', limit: 1000, spent: 0 },
      { id: 'f-' + Date.now() + '-2', name: 'بنزين ومواصلات ⛽', limit: 800, spent: 0 }
    ]
  };

  db.brothers.push(newBrother);
  saveDB(db);

  broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });

  res.json({
    success: true,
    message: `تمت إضافة المستخدم (${newBrother.name}) برقم حساب (#${newBrother.accountNumber}) بنجاح`,
    brother: newBrother,
    brothers: db.brothers
  });
});

// 5.1.1 Two-way Sync endpoint for Admin and Users
app.post('/api/sync', (req, res) => {
  const { brothers: clientBrothers } = req.body;
  const db = readDB();
  let changed = false;

  if (Array.isArray(clientBrothers)) {
    clientBrothers.forEach((cb) => {
      if (!cb || !cb.name) return;
      const idx = db.brothers.findIndex((b) => b.id === cb.id || String(b.accountNumber) === String(cb.accountNumber));
      if (idx === -1) {
        db.brothers.push(cb);
        changed = true;
      }
    });
  }

  if (changed) {
    saveDB(db);
    broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });
  }

  res.json({ success: true, brothers: db.brothers, state: db });
});

// 5.2 Admin: Update Brother Details
app.put('/api/brothers/:brotherId', (req, res) => {
  const { brotherId } = req.params;
  const { name, accountNumber, phone, bankAccountNumber, bankName, password, avatarColor } = req.body;
  const db = readDB();

  const brother = db.brothers.find((b) => b.id === brotherId);
  if (!brother) {
    return res.status(404).json({ success: false, message: 'الأخ غير موجود' });
  }

  if (name) brother.name = name.trim();
  if (accountNumber) brother.accountNumber = String(accountNumber).trim();
  if (phone !== undefined) brother.phone = String(phone).trim();
  if (bankAccountNumber) brother.bankAccountNumber = String(bankAccountNumber).trim();
  if (bankName) brother.bankName = bankName.trim();
  if (password) brother.password = String(password).trim();
  if (avatarColor) brother.avatarColor = avatarColor;

  saveDB(db);
  broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });

  res.json({ success: true, message: 'تم تحديث بيانات الأخ بنجاح', brother, brothers: db.brothers });
});

// 5.3 Admin: Delete Brother Account
app.delete('/api/brothers/:brotherId', (req, res) => {
  const { brotherId } = req.params;
  const db = readDB();

  if (db.activeAdminId === brotherId) {
    return res.status(400).json({ success: false, message: 'لا يمكن حذف حساب الأدمن الحالي، قم بتحويل الأدمن أولاً' });
  }

  const idx = db.brothers.findIndex((b) => b.id === brotherId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'الأخ غير موجود' });
  }

  const deletedName = db.brothers[idx].name;
  db.brothers.splice(idx, 1);
  saveDB(db);

  broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });

  res.json({ success: true, message: `تم حذف حساب الأخ (${deletedName}) بنجاح`, brothers: db.brothers });
});

// 5.4 Admin: Update Brother Approved Fields (Commodities)
app.put('/api/brothers/:brotherId/fields', (req, res) => {
  const { brotherId } = req.params;
  const { approvedFields } = req.body;
  const db = readDB();

  const brother = db.brothers.find((b) => b.id === brotherId);
  if (!brother) {
    return res.status(404).json({ success: false, message: 'الأخ غير موجود' });
  }

  brother.approvedFields = Array.isArray(approvedFields) ? approvedFields : [];
  saveDB(db);

  broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });

  res.json({
    success: true,
    message: `✅ تم تحديث جدول السلع والحقول للأخ (${brother.name}) بنجاح!`,
    brother,
    brothers: db.brothers
  });
});

// Intelligent Commodity/Field Auto-Categorization Helper
const CATEGORY_MAP = [
  { keywords: ['بنزين', 'بانزين', 'نقل', 'مواصلات', 'وقود', 'كاز', 'تكسي', 'سيارة', 'طريق'], name: 'بنزين ومواصلات ⛽', limit: 150000 },
  { keywords: ['حليب', 'اكل', 'أكل', 'طعام', 'تموين', 'غذائية', 'مسواك', 'سوبرماركت', 'بقالة', 'لحم', 'دجاج', 'خبز', 'رز', 'زيت', 'مسواق'], name: 'حليب ومواد غذائية 🥛', limit: 200000 },
  { keywords: ['طبيب', 'دكتور', 'علاج', 'دواء', 'صيدلية', 'مستشفى', 'عيادة', 'تحاليل', 'اشعة', 'أدوية', 'كشفية', 'اطباء', 'أطباء', 'مريض'], name: 'صيدلية وأطباء 🩺', limit: 150000 },
  { keywords: ['فاتورة', 'فواتير', 'انترنت', 'إنترنت', 'كهرباء', 'ماء', 'مولدة', 'غاز', 'شحن', 'رصيد', 'اشتراك'], name: 'فواتير وانترنت ⚡', limit: 100000 },
  { keywords: ['صيانة', 'تصليح', 'سبلت', 'عطل', 'تصليحات', 'منزل', 'سباكة', 'كهربائي', 'بناء'], name: 'صيانة منزلية 🔧', limit: 100000 },
  { keywords: ['مدرسة', 'تعليم', 'كتب', 'أقلام', 'دفاتر', 'اولاد', 'أولاد', 'جامعة', 'دراسة', 'اقساط', 'أقساط', 'قرطاسية'], name: 'أولاد وتعليم 📚', limit: 150000 },
  { keywords: ['ملابس', 'كسوة', 'احذية', 'أحذية', 'ثياب', 'قميص', 'بنطلون'], name: 'ملابس واحتياجات 👕', limit: 100000 },
  { keywords: ['طوارئ', 'طارئ', 'نثريات', 'مفاجئ', 'حادث'], name: 'طوارئ ونثريات 🛡️', limit: 100000 }
];

function matchOrAssignField(brother, explicitFieldId, reasonText, customItemName) {
  if (!brother.approvedFields) brother.approvedFields = [];

  // 1. Explicit Custom Item Name provided by user/admin
  const cleanCustom = String(customItemName || '').trim();
  if (cleanCustom) {
    let existing = brother.approvedFields.find((f) => 
      f.name.toLowerCase() === cleanCustom.toLowerCase() ||
      f.name.includes(cleanCustom) ||
      cleanCustom.includes(f.name)
    );
    if (!existing) {
      existing = {
        id: 'f-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: cleanCustom,
        limit: 500000,
        spent: 0
      };
      brother.approvedFields.push(existing);
    }
    return existing;
  }

  // 2. Explicit Field ID selected
  if (explicitFieldId) {
    const existing = brother.approvedFields.find((f) => f.id === explicitFieldId);
    if (existing) return existing;
  }

  // 3. Keyword matching from reason
  const reasonLower = (reasonText || '').toLowerCase();
  for (const cat of CATEGORY_MAP) {
    const match = cat.keywords.some((kw) => reasonLower.includes(kw));
    if (match) {
      let found = brother.approvedFields.find((f) =>
        f.name.toLowerCase().includes(cat.name.split(' ')[0].toLowerCase()) ||
        cat.keywords.some((kw) => f.name.toLowerCase().includes(kw))
      );
      if (!found) {
        found = {
          id: 'f-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          name: cat.name,
          limit: cat.limit || 500000,
          spent: 0
        };
        brother.approvedFields.push(found);
      }
      return found;
    }
  }

  if (brother.approvedFields.length > 0) {
    return brother.approvedFields[0];
  }

  const defaultField = {
    id: 'f-' + Date.now(),
    name: 'مصاريف عامة 🛒',
    limit: 500000,
    spent: 0
  };
  brother.approvedFields.push(defaultField);
  return defaultField;
}

// 6. Execute Transfer (WITH COMMODITY PINNING + DEDUCT + BROADCAST)
app.post('/api/transfers', (req, res) => {
  const { senderId, recipientId, amount, fieldId, reason, commodityName, fieldName: explicitFieldName, customItemName } = req.body;

  const db = readDB();

  // 1. Check if card is frozen
  if (db.security.isCardFrozen) {
    return res.status(403).json({
      success: false,
      message: '🔒 بطاقة الصندوق مجمدة ومقفلة أمنياً حالياً من قبل الأدمن. يرجى إلغاء التجميد أولاً.'
    });
  }

  // 2. Validate mandatory fields
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'يرجى تحديد مبلغ صحيح أكبر من الصفر' });
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: '⚠️ يجب كتابة سبب طلب المال (الحاجة) إجبارياً قبل الإرسال' });
  }

  // 3. Find Recipient (by id, account number, or name)
  let recipient = db.brothers.find((b) => b.id === recipientId);
  if (!recipient && recipientId) {
    recipient = db.brothers.find((b) =>
      b.accountNumber === String(recipientId) ||
      b.bankAccountNumber === String(recipientId) ||
      (b.name && b.name.trim().toLowerCase() === String(recipientId).trim().toLowerCase())
    );
  }
  if (!recipient && db.brothers.length > 0) {
    recipient = db.brothers.find((b) => b.id !== db.activeAdminId) || db.brothers[0];
  }

  const sender = db.brothers.find((b) => b.id === senderId) || db.brothers.find((b) => b.id === db.activeAdminId) || db.brothers[0];
  const sendingCard = db.bankCards.find((c) => c.id === db.sendingCardId) || db.bankCards[0];

  // Check sender authorization according to Admin rules
  const permissions = db.security.transferPermissions || { mode: 'admin_only', allowedSenderIds: [db.activeAdminId] };
  const isSenderAdmin = !senderId || senderId === db.activeAdminId || senderId === 'b-2' || (sender && sender.isAdmin);

  let isAuthorized = false;
  if (permissions.mode === 'all') {
    isAuthorized = true;
  } else if (permissions.mode === 'admin_only') {
    isAuthorized = isSenderAdmin;
  } else if (permissions.mode === 'custom') {
    isAuthorized = isSenderAdmin || (permissions.allowedSenderIds && permissions.allowedSenderIds.includes(senderId));
  }

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: '⚠️ غير مصرح لك بإرسال الأموال من الصندوق. صلاحية الإرسال محددة من قبل الأدمن لأشخاص معينين فقط.'
    });
  }

  if (!recipient) {
    return res.status(404).json({ success: false, message: 'الأخ المستلم غير موجود' });
  }
  if (!sendingCard) {
    return res.status(400).json({ success: false, message: 'لا توجد بطاقة إرسال مفعلة' });
  }
  if (sendingCard.balance < numAmount) {
    return res.status(400).json({
      success: false,
      message: `رصيد بطاقة الصندوق (${sendingCard.balance} ${db.currency.symbol}) غير كافٍ لإتمام تحويل ${numAmount} ${db.currency.symbol}`
    });
  }

  // Deduct from sending card
  sendingCard.balance = Math.max(0, sendingCard.balance - numAmount);
  sendingCard.lastUpdated = new Date().toISOString();

  // Match or Pin Commodity dynamically to Recipient's Circle & accumulate spent
  const itemNameToUse = commodityName || explicitFieldName || customItemName;
  const assignedField = matchOrAssignField(recipient, fieldId, reason, itemNameToUse);
  assignedField.spent = (assignedField.spent || 0) + numAmount;
  const finalFieldName = assignedField.name;

  const newTransfer = {
    id: 'tx-' + Date.now(),
    senderId: sender.id,
    senderName: sender.name,
    recipientId: recipient.id,
    recipientName: recipient.name,
    recipientAccountNumber: recipient.bankAccountNumber || recipient.accountNumber,
    accountNumber: recipient.accountNumber,
    amount: numAmount,
    fieldId: assignedField.id,
    fieldName: finalFieldName,
    reason: reason.trim(),
    sendingCardId: sendingCard.id,
    sendingCardName: sendingCard.name,
    isSecurityVerified: true,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0]
  };

  db.transfers.unshift(newTransfer);

  // Also document as a recorded transaction in general ledger
  if (!db.transactions) db.transactions = [];
  const newTransaction = {
    id: 't-' + Date.now(),
    type: 'expense',
    amount: numAmount,
    categoryId: 'c-transfers',
    categoryName: `تحويل مالي (${recipient.name}) 💸`,
    categoryIcon: 'Send',
    memberId: recipient.id,
    memberName: recipient.name,
    paymentMethodId: 'pm-qi',
    paymentMethodName: sendingCard.name || 'ماستر كي / Qi Card',
    date: new Date().toISOString().split('T')[0],
    description: `تحويل مالي مباشر: ${reason.trim()} (حساب #${newTransfer.recipientAccountNumber})`,
    transferId: newTransfer.id,
    createdAt: new Date().toISOString()
  };
  db.transactions.unshift(newTransaction);

  const newNotification = {
    id: 'notif-' + Date.now(),
    title: `💰 تحويل مالي: ${numAmount} ${db.currency.symbol}`,
    message: `تم تحويل ${numAmount} ${db.currency.symbol} إلى حساب الأخ (${recipient.name}) رقم (${newTransfer.recipientAccountNumber}) لحاجة [${reason.trim()}]. المتبقي في بطاقة الصندوق: ${sendingCard.balance} ${db.currency.symbol}`,
    transferId: newTransfer.id,
    recipientId: recipient.id,
    amount: numAmount,
    reason: reason.trim(),
    timestamp: new Date().toISOString(),
    readBy: []
  };

  db.notifications.unshift(newNotification);
  saveDB(db);

  broadcastEvent('NEW_TRANSFER', {
    transfer: newTransfer,
    transaction: newTransaction,
    notification: newNotification,
    sendingCardBalance: sendingCard.balance,
    sendingCardId: sendingCard.id,
    recipientId: recipient.id,
    bankCards: db.bankCards,
    brothers: db.brothers,
    transfers: db.transfers,
    transactions: db.transactions
  });

  res.json({
    success: true,
    message: `تم تحويل ${numAmount} ${db.currency.symbol} إلى حساب الأخ ${recipient.name} وتوثيق العملية بنجاح 🚀`,
    transfer: newTransfer,
    transaction: newTransaction,
    sendingCardBalance: sendingCard.balance,
    bankCards: db.bankCards,
    brothers: db.brothers,
    transfers: db.transfers,
    transactions: db.transactions
  });
});

// 6.1 Admin: Edit a single transfer / request record
app.put('/api/transfers/:transferId', (req, res) => {
  const { transferId } = req.params;
  const { amount, reason, date, fieldId, fieldName } = req.body;
  const db = readDB();

  const tx = db.transfers.find((t) => t.id === transferId);
  if (!tx) {
    return res.status(404).json({ success: false, message: 'العملية غير موجودة' });
  }

  const oldAmount = tx.amount || 0;
  const newAmount = amount !== undefined ? Number(amount) : oldAmount;
  const diff = newAmount - oldAmount;

  // Adjust sending card balance if amount changed
  const sendingCard = db.bankCards.find((c) => c.id === tx.sendingCardId) || db.bankCards[0];
  if (sendingCard && diff !== 0) {
    if (sendingCard.balance < diff) {
      return res.status(400).json({ success: false, message: 'رصيد بطاقة الصندوق غير كافٍ لتعديل المبلغ' });
    }
    sendingCard.balance = Math.max(0, sendingCard.balance - diff);
    sendingCard.lastUpdated = new Date().toISOString();
  }

  // Adjust brother's field spent
  const recipient = db.brothers.find((b) => b.id === tx.recipientId);
  if (recipient) {
    const targetFieldId = fieldId || tx.fieldId;
    recipient.approvedFields?.forEach((f) => {
      if (f.id === tx.fieldId && f.id !== targetFieldId) {
        f.spent = Math.max(0, (f.spent || 0) - oldAmount);
      }
      if (f.id === targetFieldId) {
        if (f.id === tx.fieldId) {
          f.spent = Math.max(0, (f.spent || 0) + diff);
        } else {
          f.spent = (f.spent || 0) + newAmount;
        }
      }
    });
  }

  tx.amount = newAmount;
  if (reason) tx.reason = reason.trim();
  if (date) tx.date = date;
  if (fieldId) tx.fieldId = fieldId;
  if (fieldName) tx.fieldName = fieldName;

  saveDB(db);

  broadcastEvent('TRANSFER_UPDATED', {
    transfer: tx,
    transfers: db.transfers,
    bankCards: db.bankCards,
    brothers: db.brothers
  });

  res.json({
    success: true,
    message: '✅ تم تعديل تفاصيل الطلب/التحويل وتحديث الحسابات بنجاح!',
    transfer: tx,
    transfers: db.transfers,
    brothers: db.brothers,
    bankCards: db.bankCards
  });
});

// 6.2 Admin: Delete a single transfer / request record
app.delete('/api/transfers/:transferId', (req, res) => {
  const { transferId } = req.params;
  const db = readDB();

  const idx = db.transfers.findIndex((t) => t.id === transferId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'العملية غير موجودة' });
  }

  const tx = db.transfers[idx];

  // Refund amount back to sending card
  const sendingCard = db.bankCards.find((c) => c.id === tx.sendingCardId) || db.bankCards[0];
  if (sendingCard) {
    sendingCard.balance += (tx.amount || 0);
    sendingCard.lastUpdated = new Date().toISOString();
  }

  // Deduct from brother's field spent
  const recipient = db.brothers.find((b) => b.id === tx.recipientId);
  if (recipient && tx.fieldId) {
    const f = recipient.approvedFields?.find((field) => field.id === tx.fieldId);
    if (f) {
      f.spent = Math.max(0, (f.spent || 0) - (tx.amount || 0));
    }
  }

  db.transfers.splice(idx, 1);
  saveDB(db);

  broadcastEvent('TRANSFER_DELETED', {
    deletedTransferId: transferId,
    transfers: db.transfers,
    bankCards: db.bankCards,
    brothers: db.brothers
  });

  res.json({
    success: true,
    message: `✅ تم حذف الطلب واسترجاع مبلغ (${tx.amount} ${db.currency.symbol}) إلى الصندوق وتحديث عداد السلعة بنجاح!`,
    transfers: db.transfers,
    brothers: db.brothers,
    bankCards: db.bankCards
  });
});

// 7. Money Requests: Brother submits a request for money (Requires User Password)
app.post('/api/requests', (req, res) => {
  const { brotherId, brotherName, phone, bankAccountNumber, amount, fieldId, reason, password } = req.body;
  const db = readDB();

  if (!db.fundRequests) db.fundRequests = [];

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'يرجى تحديد مبلغ صحيح لطلب الأموال' });
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: 'يرجى كتابة سبب طلب الأموال (الحاجة)' });
  }

  const cleanSearch = String(brotherId || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').replace(/[\s\-\+]/g, '');

  let brother = db.brothers.find((b) =>
    b.id === brotherId ||
    (cleanSearch && String(b.id).toLowerCase() === cleanSearch) ||
    (cleanSearch && String(b.accountNumber).toLowerCase() === cleanSearch) ||
    (cleanPhone && b.phone && String(b.phone).replace(/[\s\-\+]/g, '') === cleanPhone) ||
    (brotherName && b.name && b.name.trim().toLowerCase() === String(brotherName).trim().toLowerCase())
  );

  // If still not found in db.brothers, auto-create or recover brother account
  if (!brother) {
    const nextAcc = String(1000 + db.brothers.length + 1);
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];
    brother = {
      id: brotherId || ('b-' + Date.now()),
      name: (brotherName || 'مستخدم مسجل').trim(),
      accountNumber: nextAcc,
      phone: cleanPhone || ('0770' + Math.floor(1000000 + Math.random() * 9000000)),
      bankAccountNumber: bankAccountNumber || nextAcc,
      bankName: 'ماستر كي / Qi Card',
      password: '123',
      avatarColor: colors[db.brothers.length % colors.length],
      isAdmin: false,
      approvedFields: [
        { id: `f-${Date.now()}-1`, name: 'مصاريف عامة 🛒', limit: 100000, spent: 0 },
        { id: `f-${Date.now()}-2`, name: 'بنزين ومواصلات ⛽', limit: 100000, spent: 0 }
      ]
    };
    db.brothers.push(brother);
    saveDB(db);
    broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });
  }

  // Auto-detect and match commodity/field based on reason and explicit fieldId / commodityName
  const assignedField = matchOrAssignField(brother, fieldId, reason, req.body.commodityName || req.body.fieldName || req.body.customItemName);

  const newRequest = {
    id: 'req-' + Date.now(),
    brotherId: brother.id,
    brotherName: brother.name,
    brotherAccountNumber: brother.accountNumber,
    bankAccountNumber: brother.bankAccountNumber,
    phone: brother.phone,
    amount: numAmount,
    fieldId: assignedField.id,
    fieldName: assignedField.name,
    reason: reason.trim(),
    status: 'pending', // pending | approved | rejected
    createdAt: new Date().toISOString()
  };

  db.fundRequests.unshift(newRequest);

  const notif = {
    id: 'notif-' + Date.now(),
    title: `📥 طلب أموال جديد (${assignedField.name}): ${numAmount} ${db.currency.symbol}`,
    message: `طلب الأخ (${brother.name}) مبلغ ${numAmount} ${db.currency.symbol} لبند [${assignedField.name}] لحاجة: (${reason.trim()}). بانتظار موافقة الأدمن.`,
    timestamp: new Date().toISOString(),
    readBy: []
  };

  db.notifications.unshift(notif);
  saveDB(db);

  broadcastEvent('NEW_MONEY_REQUEST', {
    request: newRequest,
    fundRequests: db.fundRequests,
    notification: notif,
    brothers: db.brothers
  });

  res.json({
    success: true,
    request: newRequest,
    message: `✅ تم إرسال طلبك بمبلغ (${numAmount} ${db.currency.symbol}) وتوجيهه لبند [${assignedField.name}] بنجاح!`
  });
});

// 7.1 Money Requests: Admin Approves and Executes Transfer (Direct without password)
app.post('/api/requests/:requestId/approve', (req, res) => {
  const { requestId } = req.params;
  const { requestingBrotherId, targetFieldId } = req.body;
  const db = readDB();

  if (!db.fundRequests) db.fundRequests = [];

  const requester = db.brothers.find((b) => b.id === requestingBrotherId) || db.brothers.find((b) => b.id === db.activeAdminId);

  if (requester && requester.id !== db.activeAdminId && !requester.isAdmin) {
    return res.status(403).json({ success: false, message: '⚠️ الموافقة على طلبات الأموال مسموح بها للأدمن فقط' });
  }

  let reqItem = db.fundRequests.find((r) => r.id === requestId);
  if (!reqItem && req.body.requestDetails) {
    const rd = req.body.requestDetails;
    reqItem = {
      id: requestId,
      brotherId: rd.brotherId,
      brotherName: rd.brotherName || 'الأخ المستلم',
      brotherAccountNumber: rd.brotherAccountNumber,
      bankAccountNumber: rd.bankAccountNumber,
      phone: rd.phone,
      amount: Number(rd.amount),
      fieldId: rd.fieldId,
      fieldName: rd.fieldName,
      reason: rd.reason || 'مصروف معتمد',
      status: 'pending',
      createdAt: rd.createdAt || new Date().toISOString()
    };
    db.fundRequests.unshift(reqItem);
  }

  if (!reqItem) {
    return res.status(404).json({ success: false, message: 'طلب الأموال غير موجود أو تمت معالجته مسبقاً' });
  }
  if (reqItem.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'تمت معالجة هذا الطلب مسبقاً' });
  }

  // Check sending card balance
  const sendingCard = db.bankCards.find((c) => c.id === db.sendingCardId) || db.bankCards[0];
  if (!sendingCard || sendingCard.balance < reqItem.amount) {
    return res.status(400).json({ success: false, message: 'رصيد بطاقة الصندوق غير كافٍ لتنفيذ هذا التحويل' });
  }

  // Deduct from sending card
  sendingCard.balance = Math.max(0, sendingCard.balance - reqItem.amount);
  sendingCard.lastUpdated = new Date().toISOString();

  // Find recipient and ensure amount goes exactly to the matched commodity field
  const admin = db.brothers.find((b) => b.id === db.activeAdminId || b.isAdmin);
  const reqName = String(reqItem.brotherName || '').trim().toLowerCase();
  const adminName = String(admin?.name || '').trim().toLowerCase();
  const isRequestForAdmin = reqName && adminName && (reqName === adminName || reqName.includes('عبدالله') || adminName.includes(reqName));

  let recipient = null;
  if (!isRequestForAdmin && reqName) {
    // Strictly find non-admin brother matching name, phone, or bank account
    recipient = db.brothers.find((b) =>
      b.id !== db.activeAdminId && (
        (b.name && b.name.trim().toLowerCase() === reqName) ||
        (reqItem.phone && b.phone && String(b.phone).replace(/[\s\-\+]/g, '') === String(reqItem.phone).replace(/[\s\-\+]/g, '')) ||
        (reqItem.bankAccountNumber && String(b.bankAccountNumber) === String(reqItem.bankAccountNumber))
      )
    );
  }

  if (!recipient) {
    if (isRequestForAdmin) {
      recipient = admin;
    } else {
      recipient = db.brothers.find((b) => b.id === reqItem.brotherId && b.id !== db.activeAdminId);
    }
  }

  // If recipient is not yet in db.brothers, auto-create them so they have a unique circle on the dashboard
  if (!recipient && (reqItem.brotherName || reqItem.brotherId)) {
    const nextAccNumber = String(1000 + db.brothers.length + 1);
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];
    recipient = {
      id: 'b-' + Date.now(),
      name: reqItem.brotherName || 'أخ مستلم',
      accountNumber: nextAccNumber,
      phone: reqItem.phone || '07700000000',
      bankAccountNumber: reqItem.bankAccountNumber || reqItem.brotherAccountNumber || nextAccNumber,
      bankName: 'ماستر كي / Qi Card',
      password: '123',
      avatarColor: colors[db.brothers.length % colors.length],
      isAdmin: false,
      approvedFields: [
        { id: `f-${Date.now()}-1`, name: 'مصاريف عامة 🛒', limit: 100000, spent: 0 },
        { id: `f-${Date.now()}-2`, name: 'بنزين ومواصلات ⛽', limit: 100000, spent: 0 }
      ]
    };
    db.brothers.push(recipient);
    saveDB(db);
    broadcastEvent('BROTHERS_UPDATED', { brothers: db.brothers });
  }

  let realBrotherName = (recipient && recipient.name && recipient.name !== 'أخ مسجل')
    ? recipient.name
    : (reqItem.brotherName && reqItem.brotherName !== 'أخ مسجل')
    ? reqItem.brotherName
    : (recipient?.name || 'الأخ');

  if (recipient && recipient.name === 'أخ مسجل' && reqItem.brotherName && reqItem.brotherName !== 'أخ مسجل') {
    recipient.name = reqItem.brotherName;
    realBrotherName = reqItem.brotherName;
  }

  let finalField = null;
  if (recipient) {
    finalField = matchOrAssignField(recipient, targetFieldId || reqItem.fieldId, reqItem.reason, reqItem.fieldName);
    finalField.spent = (finalField.spent || 0) + reqItem.amount;
  }

  // Create transfer
  const newTransfer = {
    id: 'tx-' + Date.now(),
    senderId: db.activeAdminId,
    senderName: 'الأدمن (موافقة على طلب)',
    recipientId: recipient ? recipient.id : reqItem.brotherId,
    recipientName: realBrotherName,
    recipientAccountNumber: recipient ? (recipient.bankAccountNumber || recipient.accountNumber) : (reqItem.bankAccountNumber || reqItem.brotherAccountNumber),
    accountNumber: recipient ? recipient.accountNumber : reqItem.brotherAccountNumber,
    amount: reqItem.amount,
    fieldId: finalField ? finalField.id : reqItem.fieldId,
    fieldName: finalField ? finalField.name : reqItem.fieldName,
    reason: `[موافقة على طلب - ${finalField ? finalField.name : reqItem.fieldName}] ${reqItem.reason}`,
    sendingCardId: sendingCard.id,
    sendingCardName: sendingCard.name,
    isSecurityVerified: true,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0]
  };

  db.transfers.unshift(newTransfer);
  reqItem.status = 'approved';
  reqItem.approvedAt = new Date().toISOString();
  reqItem.brotherName = realBrotherName;
  if (finalField) {
    reqItem.fieldId = finalField.id;
    reqItem.fieldName = finalField.name;
  }

  const notif = {
    id: 'notif-' + Date.now(),
    title: `💰 تحويل مالي: ${reqItem.amount} ${db.currency.symbol}`,
    message: `تم تحويل ${reqItem.amount} ${db.currency.symbol} إلى حساب الأخ (${realBrotherName}) رقم (${newTransfer.recipientAccountNumber}) لحاجة [${finalField ? finalField.name : reqItem.fieldName}]. المتبقي في بطاقة الصندوق: ${sendingCard.balance} ${db.currency.symbol}`,
    transferId: newTransfer.id,
    recipientId: newTransfer.recipientId,
    amount: reqItem.amount,
    reason: reqItem.reason,
    timestamp: new Date().toISOString(),
    readBy: []
  };

  db.notifications.unshift(notif);
  saveDB(db);

  broadcastEvent('NEW_TRANSFER', {
    transfer: newTransfer,
    notification: notif,
    sendingCardBalance: sendingCard.balance,
    sendingCardId: sendingCard.id,
    recipientId: reqItem.brotherId,
    bankCards: db.bankCards,
    brothers: db.brothers
  });

  broadcastEvent('REQUEST_STATUS_CHANGED', {
    request: reqItem,
    fundRequests: db.fundRequests,
    brothers: db.brothers
  });

  res.json({
    success: true,
    message: `✅ تمت الموافقة على طلب (${reqItem.brotherName}) وإضافته لبند [${finalField ? finalField.name : reqItem.fieldName}] وتنفيذ التحويل بنجاح!`,
    request: reqItem,
    transfer: newTransfer,
    brothers: db.brothers
  });
});

// 7.2 Money Requests: Admin Rejects Request
app.post('/api/requests/:requestId/reject', (req, res) => {
  const { requestId } = req.params;
  const { rejectionReason, requestingBrotherId } = req.body;
  const db = readDB();

  if (!db.fundRequests) db.fundRequests = [];

  const requester = db.brothers.find((b) => b.id === requestingBrotherId);
  if (requester && requester.id !== db.activeAdminId && !requester.isAdmin) {
    return res.status(403).json({ success: false, message: '⚠️ رفض طلبات الأموال مسموح به للأدمن فقط' });
  }

  const reqItem = db.fundRequests.find((r) => r.id === requestId);
  if (!reqItem) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  }

  reqItem.status = 'rejected';
  reqItem.rejectedAt = new Date().toISOString();
  reqItem.rejectionReason = rejectionReason || 'تم رفض الطلب من قبل الأدمن';

  const notif = {
    id: 'notif-' + Date.now(),
    title: `❌ تم رفض طلب الأموال`,
    message: `اعتذر الأدمن عن طلب الأخ (${reqItem.brotherName}) بمبلغ ${reqItem.amount} ${db.currency.symbol} لحاجة [${reqItem.reason}].`,
    timestamp: new Date().toISOString(),
    readBy: []
  };

  db.notifications.unshift(notif);
  saveDB(db);

  broadcastEvent('REQUEST_STATUS_CHANGED', {
    request: reqItem,
    fundRequests: db.fundRequests,
    notification: notif
  });

  res.json({
    success: true,
    message: 'تم تسجيل رفض الطلب وإشعار الأخ بذلك',
    request: reqItem
  });
});

// ================= 8. Realtime Text & Voice Chat System =================
// 8.1 Get All Messages
app.get('/api/messages', (req, res) => {
  const db = readDB();
  res.json({ success: true, messages: db.messages || [] });
});

// 8.2 Send Text or Voice Note Message
app.post('/api/messages', (req, res) => {
  const { senderId, senderName, recipientId, text, audioUrl, audioDuration, type } = req.body;
  const db = readDB();
  if (!db.messages) db.messages = [];

  const sender = db.brothers.find((b) => b.id === senderId) || { name: senderName || 'مستخدم', avatarColor: '#10b981' };
  const finalRecipientId = recipientId || 'all';

  const newMsg = {
    id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    senderId: senderId || 'unknown',
    senderName: sender.name || senderName || 'مستخدم',
    senderAvatarColor: sender.avatarColor || '#10b981',
    recipientId: finalRecipientId,
    text: (text || '').trim(),
    audioUrl: audioUrl || null,
    audioDuration: audioDuration ? Number(audioDuration) : 0,
    type: type || (audioUrl ? 'voice' : 'text'),
    timestamp: new Date().toISOString(),
    readBy: [senderId]
  };

  db.messages.push(newMsg);
  if (db.messages.length > 500) {
    db.messages = db.messages.slice(-500);
  }
  saveDB(db);

  broadcastEvent('NEW_MESSAGE', {
    message: newMsg,
    messages: db.messages
  });

  res.json({
    success: true,
    message: 'تم إرسال الرسالة بنجاح',
    data: newMsg,
    messages: db.messages
  });
});

// 8.3 Delete Message
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  if (!db.messages) db.messages = [];
  db.messages = db.messages.filter((m) => m.id !== id);
  saveDB(db);

  broadcastEvent('MESSAGE_DELETED', {
    messageId: id,
    messages: db.messages
  });

  res.json({ success: true, messages: db.messages });
});

// ================= 9. Realtime Walkie-Talkie & Live Intercom System =================
const activeIntercomCalls = {}; // in-memory map of callId -> callData

// 9.1 Start Intercom Call (طلب المناداة المباشرة)
app.post('/api/intercom/call', (req, res) => {
  const { callerId, callerName, callerAvatar, receiverId, receiverName } = req.body;
  const db = readDB();

  const caller = db.brothers.find((b) => b.id === callerId) || { name: callerName || 'مستخدم', avatarColor: callerAvatar || '#10b981' };
  const receiver = db.brothers.find((b) => b.id === receiverId) || { name: receiverName || 'مستخدم', avatarColor: '#3b82f6' };

  const callId = 'call-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const callData = {
    id: callId,
    callerId,
    callerName: caller.name,
    callerAvatar: caller.avatarColor || '#10b981',
    receiverId,
    receiverName: receiver.name,
    receiverAvatar: receiver.avatarColor || '#3b82f6',
    status: 'ringing', // 'ringing', 'connected', 'rejected', 'ended'
    createdAt: new Date().toISOString()
  };

  activeIntercomCalls[callId] = callData;

  // Broadcast ringing alert to all clients via SSE
  broadcastEvent('INTERCOM_RINGING', { call: callData });

  res.json({
    success: true,
    message: `جاري الاتصال والمناداة على الأخ (${receiver.name})... 📻`,
    call: callData
  });
});

// 9.2 Respond to Intercom Call (موافقة / رفض / إنهاء)
app.post('/api/intercom/respond', (req, res) => {
  const { callId, action, userId } = req.body; // action: 'accept' | 'reject' | 'end' | 'cancel'
  const callData = activeIntercomCalls[callId];

  if (!callData) {
    return res.status(404).json({ success: false, message: 'جلسة المناداة غير موجودة أو انتهت' });
  }

  if (action === 'accept') {
    callData.status = 'connected';
    callData.connectedAt = new Date().toISOString();
  } else if (action === 'reject') {
    callData.status = 'rejected';
    callData.endedAt = new Date().toISOString();
  } else if (action === 'end' || action === 'cancel') {
    callData.status = 'ended';
    callData.endedAt = new Date().toISOString();
  }

  activeIntercomCalls[callId] = callData;

  // Broadcast update to all clients
  broadcastEvent('INTERCOM_STATUS', { call: callData, action, userId });

  // Cleanup after a few seconds if closed
  if (['rejected', 'ended'].includes(callData.status)) {
    setTimeout(() => {
      delete activeIntercomCalls[callId];
    }, 8000);
  }

  res.json({ success: true, call: callData });
});

// 9.3 Send Voice Stream / Burst over Intercom (البث الصوتي المباشر)
app.post('/api/intercom/voice-burst', (req, res) => {
  const { callId, senderId, senderName, audioData, duration } = req.body;
  const callData = activeIntercomCalls[callId];

  if (!callData || callData.status !== 'connected') {
    return res.status(400).json({ success: false, message: 'جلسة المناداة غير متصلة' });
  }

  const burstPayload = {
    callId,
    senderId,
    senderName,
    audioData,
    duration: duration || 0,
    timestamp: new Date().toISOString()
  };

  // Broadcast instantly to receiver
  broadcastEvent('INTERCOM_VOICE_BURST', burstPayload);

  res.json({ success: true });
});

// 9.4 Get Active Call Status
app.get('/api/intercom/status/:callId', (req, res) => {
  const { callId } = req.params;
  const callData = activeIntercomCalls[callId];
  res.json({ success: true, call: callData || null });
});

// 9.5 Get Active Calls for User (Direct Poll Failsafe)
app.get('/api/intercom/active-for/:userId', (req, res) => {
  const { userId } = req.params;
  const ringingCall = Object.values(activeIntercomCalls).find(
    (c) => c && c.receiverId === userId && c.status === 'ringing'
  );
  const connectedCall = Object.values(activeIntercomCalls).find(
    (c) => c && (c.callerId === userId || c.receiverId === userId) && c.status === 'connected'
  );
  res.json({ success: true, ringingCall: ringingCall || null, connectedCall: connectedCall || null });
});

// Serve frontend build in production with no-cache headers
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
  app.use((req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 نظام الصندوق والحسابات المشتركة يعمل بنجاح على:`);
  console.log(`📡 الرابط المحلي: http://localhost:${PORT}`);
  console.log(`====================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ المنفذ ${PORT} مستخدم مسبقاً، النظام قيد التشغيل بالفعل.`);
  } else {
    console.error('Server error:', err);
  }
});
