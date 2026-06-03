"use strict";

const STORAGE_KEY = "esh-workflow-v1";
const PERSONAL_STORAGE_PREFIX = "esh-personal-v1";
const FIREBASE_CLIENT_KEY = "esh-firebase-client-id";
const FIREBASE_SYNC_DEBOUNCE_MS = 650;
const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const WEEKDAY_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const REORDERABLE_NAV_VIEWS = ["dashboard", "notes", "tasks", "paperwork", "calendar", "people", "templates", "reports"];
const FIXED_HOLIDAYS = [
  ["01-01", "Yılbaşı"],
  ["04-23", "Ulusal Egemenlik ve Çocuk Bayramı"],
  ["05-01", "Emek ve Dayanışma Günü"],
  ["05-19", "Atatürk'ü Anma, Gençlik ve Spor Bayramı"],
  ["07-15", "Demokrasi ve Milli Birlik Günü"],
  ["08-30", "Zafer Bayramı"],
  ["10-29", "Cumhuriyet Bayramı"]
];
const DEFAULT_CATEGORIES = ["Hasta", "Depo", "Rapor", "Kalite", "Nöbet", "Eğitim", "İdari"];
const DEFAULT_CLOSING = ["Bugünün tüm görevlerini kontrol et", "Geciken görevleri gözden geçir", "Yarınki kritik işleri kontrol et", "Yedek durumunu kontrol et"];
const PAPERWORK_STATUS = {
  pending: "Hazırlanacak",
  preparing: "Hazırlanıyor",
  sent: "Gönderildi",
  archived: "Arşivlendi"
};
const DEFAULT_PAPERWORK_ITEMS = [
  { id: "puantaj", title: "Puantaj", category: "Personel", dueDay: 21, description: "İzin, rapor, nöbet ve çalışma günlerini kontrol edip imzaya hazırla.", steps: ["Personel listesi kontrol edildi", "İzin/raporlar işlendi", "Nöbetler eklendi", "Çıktı alındı", "İmzaya sunuldu"] },
  { id: "nobet", title: "Nöbet Listesi", category: "Personel", dueDay: 21, description: "Sonraki ay nöbet planını hazırlayıp ilgili yerlere gönder.", steps: ["Mazeretler soruldu", "Liste hazırlandı", "İstatistik eklendi", "Koordinasyona gönderildi", "Arşivlendi"] },
  { id: "calisma-cizelgesi", title: "Çalışma Çizelgesi", category: "Personel", dueDay: 21, description: "Bir sonraki ayın çalışma çizelgesini renkli ve siyah-beyaz çıktı düzeninde hazırla.", steps: ["Taslak indirildi", "Personel dağılımı girildi", "Kontrol edildi", "Çıktı alındı", "İmzaya sunuldu"] },
  { id: "ikys", title: "İKYS Formu", category: "Personel", dueDay: 21, description: "İKYS formunu iki nüsha hazırlayıp teslim sürecini takip et.", steps: ["Veriler kontrol edildi", "Form dolduruldu", "2 nüsha çıktı alındı", "Teslim edildi"] },
  { id: "bakanlik-rapor", title: "Bakanlık Raporlama", category: "Rapor", dueDay: 30, description: "Bakanlık raporlamasını hazırla, imzaya çıkar ve koordinasyona gönder.", steps: ["Veriler toplandı", "Rapor hazırlandı", "DYS imzaya çıktı", "Koordinasyona gönderildi", "Arşivlendi"] },
  { id: "e-rapor", title: "E-Rapor Kayıtları", category: "Rapor", dueDay: 30, description: "E-rapor kayıtlarını düzenle, doktor/koordinasyon gönderimlerini kontrol et.", steps: ["Kayıtlar kontrol edildi", "Eksikler tamamlandı", "Doktorlara iletildi", "Sertaç'a/koordinasyona gönderildi"] },
  { id: "kalite", title: "Kalite Evrakları", category: "Kalite", dueDay: 30, description: "Kalite evraklarını, glikometri ve acil çanta kontrollerini aylık kapat.", steps: ["Kalite formları dolduruldu", "Glikometri evrakı kontrol edildi", "Acil çanta evrakı kontrol edildi", "Asıl/fotokopi ayrıldı", "Arşivlendi"] },
  { id: "egitim", title: "Eğitim Evrakları", category: "Eğitim", dueDay: 21, description: "Hizmet içi ve hasta yakını eğitim evraklarını teslim için hazırla.", steps: ["Eğitim kayıtları toplandı", "İmzalar kontrol edildi", "Teslim formu hazırlandı", "Eğitim birimine teslim edildi"] },
  { id: "hizmet-sunum", title: "Hizmet Sunum Alanı Formu", category: "Rapor", dueDay: 21, description: "Hizmet sunum alanı formunu ilgili dönem için hazırla.", steps: ["Veriler kontrol edildi", "Form hazırlandı", "İmzaya sunuldu", "Arşivlendi"] },
  { id: "ek-odeme", title: "Ek Ödeme Formu", category: "Personel", dueDay: 21, description: "Hizmet kodu 28 ile ek ödeme formunu hazırla.", steps: ["Hizmet kodu kontrol edildi", "Form dolduruldu", "Çıktı alındı", "Teslim edildi"] }
];
const DEFAULT_MONTHLY_CLOSURE = ["Tüm aylık evrakların durumu kontrol edildi", "Gönderim/teslim kayıtları işlendi", "Eksik imzalar takip edildi", "DYS/e-posta gönderimleri doğrulandı", "Çıktılar ve dijital dosyalar arşivlendi", "Sonraki ay kritik işleri gözden geçirildi"];
const COLOR_PRESETS = [
  { id: "teal", label: "Deniz", brand: "#1d6f8f", brandDark: "#14536c", darkBrand: "#35a4c9", darkBrandDark: "#8ed8ef" },
  { id: "emerald", label: "Zümrüt", brand: "#0f8a5f", brandDark: "#0a6b4a", darkBrand: "#34d399", darkBrandDark: "#6ee7b7" },
  { id: "violet", label: "Mor", brand: "#7c3aed", brandDark: "#5b21b6", darkBrand: "#a78bfa", darkBrandDark: "#c4b5fd" },
  { id: "rose", label: "Gül", brand: "#e11d48", brandDark: "#be123c", darkBrand: "#fb7185", darkBrandDark: "#fda4af" },
  { id: "amber", label: "Altın", brand: "#d97706", brandDark: "#b45309", darkBrand: "#fbbf24", darkBrandDark: "#fcd34d" },
  { id: "blue", label: "Mavi", brand: "#2563eb", brandDark: "#1d4ed8", darkBrand: "#60a5fa", darkBrandDark: "#93c5fd" },
  { id: "slate", label: "Çelik", brand: "#475569", brandDark: "#334155", darkBrand: "#94a3b8", darkBrandDark: "#cbd5e1" },
  { id: "orange", label: "Turuncu", brand: "#ea580c", brandDark: "#c2410c", darkBrand: "#fb923c", darkBrandDark: "#fdba74" }
];

const TYPOGRAPHY_DEFAULTS = {
  taskTitle:    { fontSize: 13, color: "" },
  taskSubtitle: { fontSize: 11.5, color: "" },
  taskNote:     { fontSize: 12, color: "" },
  panelTitle:   { fontSize: 16, color: "" },
  badge:        { fontSize: 12, color: "" },
  noteTitle:    { fontSize: 13, color: "" },
  noteSubtitle: { fontSize: 11.5, color: "" },
  noteBody:     { fontSize: 14, color: "" }
};

const TYPOGRAPHY_FIELDS = [
  { section: "Görev Listesi", items: [
    { key: "taskTitle", label: "Görev başlığı" },
    { key: "taskSubtitle", label: "Görev alt yazısı" },
    { key: "taskNote", label: "Görev notu (açıklama)" }
  ]},
  { section: "Not Kartları", items: [
    { key: "noteTitle", label: "Not kartı başlığı" },
    { key: "noteSubtitle", label: "Not kartı alt yazısı" },
    { key: "noteBody", label: "Not içeriği" }
  ]},
  { section: "Genel", items: [
    { key: "panelTitle", label: "Panel başlığı" },
    { key: "badge", label: "Etiket / rozet" }
  ]}
];

function normalizeTypography(input) {
  const result = {};
  for (const key of Object.keys(TYPOGRAPHY_DEFAULTS)) {
    const def = TYPOGRAPHY_DEFAULTS[key];
    const val = input?.[key];
    result[key] = {
      fontSize: Number(val?.fontSize) || def.fontSize,
      color: (typeof val?.color === "string") ? val.color : ""
    };
  }
  return result;
}

const DEFAULT_MESSAGE_TEMPLATES = [
  { id: "e-rapor-gonderim", title: "E-Rapor gönderimi", text: "Merhaba, e-rapor kayıtları kontrol edilerek ekte/ilgili sistem üzerinden gönderilmiştir. Bilgilerinize." },
  { id: "puantaj-imza", title: "Puantaj imza", text: "Merhaba, ilgili aya ait puantaj kontrol edilerek imzaya sunulmuştur. Uygunluğunuza arz ederim." },
  { id: "eksik-evrak", title: "Eksik evrak hatırlatma", text: "Merhaba, aylık evrak kontrolünde aşağıdaki eksikler görülmüştür. Tamamlandığında bilgi verilmesini rica ederim." },
  { id: "koordinasyon", title: "Koordinasyon gönderimi", text: "Merhaba, ilgili aya ait evrak/rapor düzenlenerek koordinasyona gönderilmiştir. Bilgilerinize." },
  { id: "arsiv", title: "Arşiv notu", text: "İlgili evrak kontrol edilmiş, gönderim/teslim kaydı tamamlanmış ve arşivlenmiştir." }
];

const defaultTasks = [
  ...[
    "Ekip Çıkışlarını Gruba Yolla",
    "Ekiplere Hasta Aramalarını Yaptır",
    "Hasta Listelerini Yazdır",
    "Hasta Atamalarını Yazdır",
    "Hasta Atamalarını Kaydet",
    "E Rapor Atamalarını Kontrol Et",
    "E Rapor Atamalarını Doktorlara İlet",
    "Dys kontrolü yap",
    "E posta kontrolü yap",
    "Birimde Kalan Personele Yeni Hasta Dosyası Yaptır",
    "Pansuman Hastalarına Reçete Yazdır",
    "Eksik Malzeme Kontrolü Yap",
    "Yeni Hasta Dosyası Yap/Yaptır",
    "Isı Nem Takibi Yap",
    "Acil Çantası Kontrolü Yap",
    "Kanları Gönder",
    "Yeni Dosya Kayıtlarını Yap (müracaat)",
    "Malzeme düşümü yap",
    "Sarf malzemelerini atığa at",
    "İzinli/raporlu varsa sisteme kaydet"
  ].map((title) => taskTemplate(title, "daily")),
  taskTemplate("Hulusi beye bir önceki haftanın çalışma listelerini götür", "weekly", { weekdays: [1], priority: "high" }),
  taskTemplate("Sarf Depo İstemi Yap", "weekly", { weekdays: [1, 4] }),
  taskTemplate("İlaç Depo İstemi Yap ve Al", "weekly", { weekdays: [1, 4] }),
  taskTemplate("Sarf Depo Malzeme Al", "weekly", { weekdays: [2, 5] }),
  taskTemplate("Laboratuvar Depo İstemi Yap ve Al", "weekly", { weekdays: [2] }),
  taskTemplate("Kırtasiye/Temizlik (ayniyat) Depo İstemi Yap ve Al", "weekly", { weekdays: [3] }),
  taskTemplate("Cumartesi Gününün Hasta Listesini Yazdır", "weekly", { weekdays: [5] }),
  taskTemplate("Nöbetçilere Spanç ve Yeni Hasta Dosyası Yaptır", "weekly", { weekdays: [5] }),
  taskTemplate("Acil çantasında kırık var mı kontrol et", "weekly", { weekdays: [5], priority: "high" }),
  taskTemplate("Personele Nöbet Mazeretlerini Sor", "monthly", { monthDay: 20, adjustBusinessDay: true, priority: "high" }),
  taskTemplate("Personele Planlı Yıllık İzinleri Sor", "monthly", { monthDay: 20, adjustBusinessDay: true, priority: "high" }),
  ...[
    "Bir Sonraki Ayın Nöbet Listesini Hazırla (2 adet + arkasına istatistik)",
    "Bulunduğun Ayın Puantajını Hazırla (1 adet renkli)",
    "Bir sonraki ayın Çalışma Çizelgesini Hazırla (1 renkli, 1 S/B)",
    "Ek ödeme formu hazırla (hizmet kodu: 28)",
    "Hizmet sunum alanı formu hazırla",
    "İKYS formunu hazırla (2 adet)",
    "Nöbet Listesini Koordinasyona Yolla",
    "E rapor kayıtlarını düzenle ve Sertaça yolla",
    "Hizmet İçi / Hasta yakını eğitimlerini eğitim birimine teslim et"
  ].map((title) => taskTemplate(title, "monthly", { monthDay: 21, adjustBusinessDay: true, priority: "high" })),
  ...[
    "Koordinasyon formlarını hazırla",
    "Aylık çalışma taslağını gruptan indir/doldur",
    "Bakanlık Raporlamasını hazırla/imzaya yolla (dys)",
    "Bakanlık raporlamasını koordinasyona yolla",
    "Kalite evraklarını doldur (orijinal hulusi beye/başhekime, fotokopi sende)",
    "Glikometri kontrol evrakını laboratuvara yolla"
  ].map((title) => taskTemplate(title, "monthly", { monthDay: 30, fallbackDays: [29], adjustBusinessDay: true, priority: "high" }))
];

let commonState = loadState();
let activeWorkspace = "common";
let state = commonState;
let personalState = loadPersonalState();
let personalUnlocked = true;
let commonUnlocked = !commonState.settings.passwordEnabled;
let pendingPersonalView = "dashboard";
let pendingCommonView = "dashboard";
let activeDate = todayKey();
let calendarCursor = startOfMonth(parseDate(activeDate));
let showOverdueList = false;
let notificationTimer = null;
let notificationLastSent = { commonCritical: 0, commonNormal: 0, personal: 0 };
let activeBrowserNotification = null;
let deferredInstallPrompt = null;
let upcomingFilter = "daily";
let paperworkTab = "tracking";
let paperworkStepDraft = [];
let touchStartX = 0;
let touchStartY = 0;
let dashboardSummaryOpen = false;
let taskFiltersOpen = false;
let paperworkSummaryOpen = false;
let globalSearchType = "all";
let startupPreferenceApplied = false;
let auditRecordedSinceLastSave = false;
let navDragState = null;
let taskTouchDragState = null;
let suppressNavClick = false;
const TASK_TOUCH_LONG_PRESS_MS = 2000;
const TASK_TOUCH_MOVE_TOLERANCE = 10;
let firebaseSync = {
  enabled: false,
  ready: false,
  authReady: false,
  user: null,
  applyingRemote: false,
  remoteLoaded: false,
  personalRemoteLoaded: false,
  workspaceRole: "viewer",
  workspaceMembers: [],
  workspaceUsers: [],
  pendingLocalSave: false,
  pendingPersonalSave: false,
  unsubscribe: null,
  personalUnsubscribe: null,
  memberUnsubscribe: null,
  membersUnsubscribe: null,
  userDirectoryUnsubscribe: null,
  docRef: null,
  personalDocRef: null,
  memberDocRef: null,
  membersCollectionRef: null,
  userDirectoryRef: null,
  userDirectoryDocRef: null,
  saveTimer: null,
  personalSaveTimer: null,
  clientId: localStorage.getItem(FIREBASE_CLIENT_KEY) || cryptoId()
};
localStorage.setItem(FIREBASE_CLIENT_KEY, firebaseSync.clientId);

const $ = (id) => document.getElementById(id);

function taskTemplate(title, frequency, extra = {}) {
  return {
    id: cryptoId(),
    title,
    description: "",
    frequency,
    weekdays: extra.weekdays || [],
    monthDay: extra.monthDay || null,
    fallbackDays: extra.fallbackDays || [],
    adjustBusinessDay: Boolean(extra.adjustBusinessDay),
    specificDate: extra.specificDate || "",
    priority: extra.priority || "normal",
    category: extra.category || inferCategory(title),
    assigneeId: extra.assigneeId || "",
    repeatRule: extra.repeatRule || "",
    mustDo: Boolean(extra.mustDo),
    attachments: extra.attachments || [],
    active: true,
    createdAt: new Date().toISOString()
  };
}

function inferCategory(title) {
  const lower = title.toLocaleLowerCase("tr");
  if (lower.includes("hasta") || lower.includes("dosya") || lower.includes("pansuman")) return "Hasta";
  if (lower.includes("depo") || lower.includes("malzeme") || lower.includes("sarf") || lower.includes("çanta")) return "Depo";
  if (lower.includes("rapor") || lower.includes("puantaj") || lower.includes("form")) return "Rapor";
  if (lower.includes("kalite") || lower.includes("glikometri")) return "Kalite";
  if (lower.includes("nöbet")) return "Nöbet";
  if (lower.includes("eğitim")) return "Eğitim";
  return "İdari";
}

function cryptoId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return normalizeState({ tasks: defaultTasks, completions: {}, holidays: defaultHolidaysForYear(new Date().getFullYear()), settings: defaultSettings() });
  }
  try {
    const parsed = JSON.parse(raw);
    return normalizeState({
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaultTasks,
      completions: parsed.completions || {},
      holidays: Array.isArray(parsed.holidays) ? parsed.holidays : [],
      settings: { ...defaultSettings(), ...(parsed.settings || {}) },
      people: parsed.people || [],
      shifts: parsed.shifts || [],
      categories: parsed.categories || DEFAULT_CATEGORIES,
      profiles: parsed.profiles || [],
      audit: parsed.audit || [],
      closing: parsed.closing || {},
      paperworkItems: parsed.paperworkItems || DEFAULT_PAPERWORK_ITEMS,
      paperworkRecords: parsed.paperworkRecords || {},
      dispatches: parsed.dispatches || [],
      messageTemplates: parsed.messageTemplates || DEFAULT_MESSAGE_TEMPLATES,
      monthlyClosure: parsed.monthlyClosure || {},
      notes: parsed.notes || []
    });
  } catch {
    return normalizeState({ tasks: defaultTasks, completions: {}, holidays: [], settings: defaultSettings() });
  }
}

function personalStorageKey(user = null) {
  const owner = user?.uid || user?.email || "local";
  return `${PERSONAL_STORAGE_PREFIX}:${owner}`;
}

function loadPersonalState(user = null) {
  // Kullanıcı biliniyorsa direkt key'i kullan
  if (user) {
    const raw = localStorage.getItem(personalStorageKey(user));
    if (raw) try { return normalizePersonalState(JSON.parse(raw)); } catch { return defaultPersonalState(); }
    return defaultPersonalState();
  }
  // Kullanıcı henüz bilinmiyorsa (Firebase yüklenmeden önce):
  // localStorage'daki tüm esh-personal-v1:* key'lerini tara, tema ayarı olan ilkini kullan
  try {
    const prefix = `${PERSONAL_STORAGE_PREFIX}:`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix) || key.endsWith(":local")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = normalizePersonalState(JSON.parse(raw));
        // Tema ayarı kaydedilmişse bu kullanıcı verisidir
        if (parsed.settings?.commonThemeMode || parsed.settings?.themeMode || parsed.settings?.commonAccentColor) {
          return parsed;
        }
      } catch { /* devam */ }
    }
    // Kullanıcı key'i yoksa local key'e bak
    const localRaw = localStorage.getItem(`${prefix}local`);
    if (localRaw) return normalizePersonalState(JSON.parse(localRaw));
  } catch { /* ignore */ }
  return defaultPersonalState();
}

function defaultPersonalState() {
  return normalizePersonalState({
    workspace: normalizeState({
      tasks: [],
      completions: {},
      holidays: [],
      settings: defaultSettings()
    }),
    notes: [],
    todos: [],
    settings: {
      areaTitle: "Benim Yapılacaklarım",
      startupScope: "common",
      startupView: "dashboard",
      passwordEnabled: false,
      passwordHash: ""
    }
  });
}

function normalizePersonalState(input = {}) {
  const workspace = normalizePersonalWorkspace(input.workspace);
  return {
    workspace,
    notes: (input.notes || []).map(normalizeNote),
    todos: (input.todos || []).map(normalizePersonalTodo),
    settings: {
      areaTitle: input.settings?.areaTitle || "Benim Yapılacaklarım",
      startupScope: ["common", "personal"].includes(input.settings?.startupScope) ? input.settings.startupScope : "common",
      startupView: ["dashboard", "notes", "tasks", "paperwork", "calendar", "people", "templates", "reports", "appearance", "help"].includes(input.settings?.startupView) ? input.settings.startupView : "dashboard",
      passwordEnabled: Boolean(input.settings?.passwordEnabled),
      passwordHash: input.settings?.passwordHash || "",
      accentColor: input.settings?.accentColor || "teal",
      themeMode: ["light", "dark"].includes(input.settings?.themeMode) ? input.settings.themeMode : "light",
      commonAccentColor: input.settings?.commonAccentColor || "teal",
      commonThemeMode: ["light", "dark"].includes(input.settings?.commonThemeMode) ? input.settings.commonThemeMode : "light",
      nickname: input.settings?.nickname || "",
      compactMode: Boolean(input.settings?.compactMode ?? input.workspace?.settings?.compactMode),
      backupReminderDays: Number(input.settings?.backupReminderDays || input.workspace?.settings?.backupReminderDays) || 7,
      notificationsEnabled: Boolean(input.settings?.notificationsEnabled ?? input.workspace?.settings?.notificationsEnabled),
      androidNotificationsEnabled: Boolean(input.settings?.androidNotificationsEnabled),
      commonNotificationsEnabled: Boolean(input.settings?.commonNotificationsEnabled ?? input.workspace?.settings?.notificationsEnabled ?? true),
      personalNotificationsEnabled: Boolean(input.settings?.personalNotificationsEnabled ?? true),
      normalNotifyMinutes: Number(input.settings?.normalNotifyMinutes || input.workspace?.settings?.normalNotifyMinutes) || 30,
      criticalNotifyMinutes: Number(input.settings?.criticalNotifyMinutes || input.workspace?.settings?.criticalNotifyMinutes) || 15,
      quietStart: input.settings?.quietStart || input.workspace?.settings?.quietStart || "22:00",
      quietEnd: input.settings?.quietEnd || input.workspace?.settings?.quietEnd || "07:00",
      simplifiedCommonView: Boolean(input.settings?.simplifiedCommonView),
      simplifiedPersonalView: Boolean(input.settings?.simplifiedPersonalView),
      commonNavOrder: normalizeNavOrder(input.settings?.commonNavOrder),
      personalNavOrder: normalizeNavOrder(input.settings?.personalNavOrder),
      autoLockMinutes: Number(input.settings?.autoLockMinutes) || 0,
      commonTypography: normalizeTypography(input.settings?.commonTypography),
      personalTypography: normalizeTypography(input.settings?.personalTypography)
    }
  };
}

function normalizeNavOrder(order = []) {
  const unique = Array.isArray(order) ? order.filter((view, index) => REORDERABLE_NAV_VIEWS.includes(view) && order.indexOf(view) === index) : [];
  return [...unique, ...REORDERABLE_NAV_VIEWS.filter((view) => !unique.includes(view))];
}

function emptyPersonalWorkspace() {
  const workspace = normalizeState({
    tasks: [],
    completions: {},
    holidays: [],
    people: [],
    shifts: [],
    categories: DEFAULT_CATEGORIES,
    profiles: [],
    audit: [],
    closing: {},
    paperworkItems: [],
    paperworkRecords: {},
    dispatches: [],
    messageTemplates: DEFAULT_MESSAGE_TEMPLATES,
    monthlyClosure: {},
    notes: [],
    settings: defaultSettings()
  });
  workspace.tasks = [];
  workspace.holidays = [];
  workspace.profiles = [];
  workspace.paperworkItems = [];
  workspace.messageTemplates = [];
  return workspace;
}

function normalizePersonalWorkspace(workspace = null) {
  if (!workspace) return emptyPersonalWorkspace();
  if (looksLikeUntouchedDefaultWorkspace(workspace)) return emptyPersonalWorkspace();
  const normalized = normalizeState(workspace);
  stripSharedSeedsFromPersonalWorkspace(normalized);
  if (Array.isArray(workspace.tasks) && !workspace.tasks.length) normalized.tasks = [];
  if (Array.isArray(workspace.holidays) && !workspace.holidays.length) normalized.holidays = [];
  if (Array.isArray(workspace.profiles) && !workspace.profiles.length) normalized.profiles = [];
  if (Array.isArray(workspace.paperworkItems) && !workspace.paperworkItems.length) normalized.paperworkItems = [];
  if (Array.isArray(workspace.messageTemplates) && !workspace.messageTemplates.length) normalized.messageTemplates = [];
  return normalized;
}

function stripSharedSeedsFromPersonalWorkspace(workspace) {
  const defaultTaskTitles = new Set(defaultTasks.map((task) => task.title));
  const seededTaskCount = workspace.tasks.filter((task) => defaultTaskTitles.has(task.title)).length;
  if (seededTaskCount >= Math.min(10, Math.ceil(defaultTasks.length * 0.4))) {
    const removedTaskIds = new Set();
    workspace.tasks = workspace.tasks.filter((task) => {
      const seeded = defaultTaskTitles.has(task.title);
      if (seeded) removedTaskIds.add(task.id);
      return !seeded;
    });
    Object.keys(workspace.completions || {}).forEach((key) => {
      const taskId = key.split("::")[1];
      if (removedTaskIds.has(taskId)) delete workspace.completions[key];
    });
  }
  const defaultPaperworkTitles = new Set(DEFAULT_PAPERWORK_ITEMS.map((item) => item.title));
  const seededPaperworkCount = workspace.paperworkItems.filter((item) => defaultPaperworkTitles.has(item.title)).length;
  if (seededPaperworkCount >= Math.min(3, DEFAULT_PAPERWORK_ITEMS.length)) {
    workspace.paperworkItems = workspace.paperworkItems.filter((item) => !defaultPaperworkTitles.has(item.title));
  }
}

function looksLikeUntouchedDefaultWorkspace(workspace) {
  const tasks = Array.isArray(workspace.tasks) ? workspace.tasks : [];
  const defaultTitles = new Set(defaultTasks.map((task) => task.title));
  const hasOnlySeedTasks = tasks.length === defaultTasks.length && tasks.every((task) => defaultTitles.has(task.title));
  const hasUserData = [
    workspace.notes,
    workspace.people,
    workspace.shifts,
    workspace.dispatches
  ].some((rows) => Array.isArray(rows) && rows.length)
    || Object.keys(workspace.completions || {}).length
    || Object.keys(workspace.closing || {}).length
    || Object.keys(workspace.paperworkRecords || {}).length
    || Object.keys(workspace.monthlyClosure || {}).length;
  return hasOnlySeedTasks && !hasUserData;
}

function normalizeNote(note = {}) {
  return {
    id: note.id || cryptoId(),
    title: note.title || "",
    body: note.body || "",
    category: note.category || "Genel",
    color: note.color || "blue",
    pinned: Boolean(note.pinned),
    createdAt: note.createdAt || new Date().toISOString(),
    updatedAt: note.updatedAt || new Date().toISOString()
  };
}

function normalizePersonalTodo(todo = {}) {
  return {
    id: todo.id || cryptoId(),
    title: todo.title || "",
    note: todo.note || "",
    dueDate: todo.dueDate || todayKey(),
    priority: todo.priority || "normal",
    done: Boolean(todo.done),
    createdAt: todo.createdAt || new Date().toISOString(),
    updatedAt: todo.updatedAt || new Date().toISOString(),
    completedAt: todo.completedAt || ""
  };
}

function normalizeState(input) {
  const normalized = {
    tasks: (input.tasks || defaultTasks).map((task, index) => normalizeTask(task, index)),
    completions: input.completions || {},
    holidays: input.holidays || [],
    settings: { ...defaultSettings(), ...(input.settings || {}) },
    people: (input.people || []).map(normalizePerson),
    shifts: input.shifts || [],
    categories: input.categories && input.categories.length ? input.categories : DEFAULT_CATEGORIES,
    profiles: input.profiles && input.profiles.length ? input.profiles : [{ id: cryptoId(), name: "Yönetici", role: "admin" }],
    audit: input.audit || [],
    closing: input.closing || {},
    paperworkItems: (input.paperworkItems && input.paperworkItems.length ? input.paperworkItems : DEFAULT_PAPERWORK_ITEMS).map(normalizePaperworkItem),
    paperworkRecords: input.paperworkRecords || {},
    dispatches: (input.dispatches || []).map(normalizeDispatch),
    messageTemplates: input.messageTemplates && input.messageTemplates.length ? input.messageTemplates : DEFAULT_MESSAGE_TEMPLATES,
    monthlyClosure: input.monthlyClosure || {},
    notes: (input.notes || []).map(normalizeNote)
  };
  return normalized;
}

function normalizeDispatch(dispatch) {
  return {
    id: dispatch.id || cryptoId(),
    date: dispatch.date || todayKey(),
    month: dispatch.month || (dispatch.date || todayKey()).slice(0, 7),
    type: dispatch.type || "DYS",
    target: dispatch.target || "",
    subject: dispatch.subject || "",
    status: dispatch.status || "Gönderildi",
    note: dispatch.note || "",
    createdAt: dispatch.createdAt || new Date().toISOString()
  };
}

function normalizePaperworkItem(item, index = 0) {
  return {
    id: item.id || cryptoId(),
    title: item.title || "Yeni Evrak",
    category: item.category || "İdari",
    dueDay: Math.min(31, Math.max(1, Number(item.dueDay) || 21)),
    description: item.description || "",
    steps: Array.isArray(item.steps) && item.steps.length ? item.steps : ["Hazırlandı"],
    order: Number.isFinite(item.order) ? item.order : index
  };
}

function normalizePerson(person) {
  return {
    id: person.id || cryptoId(),
    name: person.name || "",
    role: person.role || "Personel",
    tc: person.tc || "",
    phone: person.phone || "",
    email: person.email || "",
    certificate: person.certificate || "",
    certificateDate: person.certificateDate || "",
    note: person.note || ""
  };
}

function normalizeTask(task, index = 0) {
  return {
    ...task,
    category: task.category || inferCategory(task.title || ""),
    assigneeId: task.assigneeId || "",
    repeatRule: task.repeatRule || "",
    mustDo: Boolean(task.mustDo),
    attachments: task.attachments || [],
    priority: task.priority || "normal",
    order: Number.isFinite(task.order) ? task.order : index
  };
}

function saveState() {
  if (activeWorkspace === "personal") {
    personalState.workspace = normalizeState(state);
    savePersonalState();
    return;
  }
  if (!canWriteCommonWorkspace()) {
    commonState = loadState();
    state = commonState;
    renderWorkspaceRole();
    renderAll();
    alert("Ortak alanda değişiklik yapmak için yönetici veya düzenleyici rolü gerekir.");
    return;
  }
  if (!auditRecordedSinceLastSave) audit("Ortak alan güncellendi", "Genel veri değişikliği");
  auditRecordedSinceLastSave = false;
  commonState = normalizeState(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(commonState));
  mirrorToIndexedDb();
  queueFirebaseSave();
  syncAndroidNotifications();
}

function savePersonalState(forceSync = false) {
  personalState = normalizePersonalState(personalState);
  if (activeWorkspace === "personal") state = personalState.workspace;
  localStorage.setItem(personalStorageKey(firebaseSync.user), JSON.stringify(personalState));
  queuePersonalFirebaseSave(forceSync);
  syncAndroidNotifications();
}

function canWriteCommonWorkspace() {
  if (!firebaseConfig().enabled || !firebaseSync.user) return true;
  return ["admin", "editor"].includes(firebaseSync.workspaceRole);
}

function audit(action, details = "") {
  if (activeWorkspace !== "common") return;
  state.audit.unshift({
    id: cryptoId(),
    action,
    details,
    at: new Date().toISOString(),
    actorEmail: currentUserEmail(),
    actorUid: firebaseSync.user?.uid || ""
  });
  state.audit = state.audit.slice(0, 250);
  auditRecordedSinceLastSave = true;
}

function currentUserEmail() {
  return firebaseSync.user?.email || "Yerel kullanıcı";
}

function completionPayload(extra = {}) {
  return {
    completedAt: new Date().toISOString(),
    note: "",
    delayReason: "",
    completedByEmail: currentUserEmail(),
    completedByUid: firebaseSync.user?.uid || "",
    ...extra
  };
}

function completionActorText(completion = {}) {
  return completion.completedByEmail ? `Tamamlayan: ${completion.completedByEmail}` : "";
}

function openWorkflowDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB desteklenmiyor."));
    const request = indexedDB.open("esh-workflow-db", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("snapshots");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function mirrorToIndexedDb() {
  try {
    const db = await openWorkflowDb();
    const tx = db.transaction("snapshots", "readwrite");
    tx.objectStore("snapshots").put({ state, updatedAt: new Date().toISOString() }, "latest");
  } catch {
    // localStorage ana kaynak olarak çalışmaya devam eder.
  }
}

async function restoreFromIndexedDb() {
  try {
    const db = await openWorkflowDb();
    const tx = db.transaction("snapshots", "readonly");
    const request = tx.objectStore("snapshots").get("latest");
    request.onsuccess = () => {
      if (!request.result?.state) return alert("IndexedDB içinde geri alınacak kayıt yok.");
      state = normalizeState(request.result.state);
      saveState();
      applyTheme();
      applyCompactMode();
      renderAll();
      alert("IndexedDB yedeği geri alındı.");
    };
  } catch (error) {
    alert(error.message);
  }
}

function firebaseConfig() {
  return window.ESH_FIREBASE || {};
}

function firebaseStatus(message) {
  console.info(`[Firebase] ${message}`);
  if ($("firebaseStatus")) $("firebaseStatus").textContent = message;
}

async function setupFirebaseSync() {
  const options = firebaseConfig();
  if (!options.enabled) {
    firebaseStatus("Firebase kapalı. Veriler bu cihazda saklanıyor.");
    renderFirebaseAuthGate(false);
    return;
  }
  if (!window.firebase || !options.config?.apiKey) {
    firebaseStatus("Firebase config eksik. firebase-config.js dosyasını doldur.");
    renderFirebaseAuthGate(false);
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(options.config);
    const auth = firebase.auth();
    firebaseSync.enabled = true;
    auth.onAuthStateChanged((user) => {
      firebaseSync.authReady = true;
      firebaseSync.user = user;
      renderFirebaseAuthGate(Boolean(user));
      if (user) startFirestoreSync();
      else stopFirestoreSync("Giriş bekleniyor.");
    });
  } catch (error) {
    firebaseStatus(`Firebase bağlantı hatası: ${error.message}`);
    renderFirebaseAuthGate(false);
  }
}

function startFirestoreSync() {
  const options = firebaseConfig();
  if (firebaseSync.unsubscribe) firebaseSync.unsubscribe();
  if (firebaseSync.personalUnsubscribe) firebaseSync.personalUnsubscribe();
  if (firebaseSync.memberUnsubscribe) firebaseSync.memberUnsubscribe();
  if (firebaseSync.membersUnsubscribe) firebaseSync.membersUnsubscribe();
  if (firebaseSync.userDirectoryUnsubscribe) firebaseSync.userDirectoryUnsubscribe();
  const db = firebase.firestore();
  const workspaceRef = db.collection("workspaces").doc(options.workspaceId || "default");
  firebaseSync.docRef = db
    .collection("workspaces")
    .doc(options.workspaceId || "default")
    .collection("state")
    .doc("main");
  firebaseSync.personalDocRef = db
    .collection("users")
    .doc(firebaseSync.user.uid)
    .collection("privateState")
    .doc("main");
  firebaseSync.memberDocRef = db
    .collection("workspaces")
    .doc(options.workspaceId || "default")
    .collection("members")
    .doc(firebaseSync.user.uid);
  firebaseSync.membersCollectionRef = db
    .collection("workspaces")
    .doc(options.workspaceId || "default")
    .collection("members");
  firebaseSync.userDirectoryRef = workspaceRef.collection("userDirectory");
  firebaseSync.userDirectoryDocRef = firebaseSync.userDirectoryRef.doc(firebaseSync.user.uid);
  upsertWorkspaceUserDirectory();
  personalState = loadPersonalState(firebaseSync.user);
  personalUnlocked = !personalState.settings.passwordEnabled;
  if (activeWorkspace === "personal") state = personalState.workspace;
  firebaseSync.ready = true;
  firebaseSync.personalRemoteLoaded = false;
  firebaseStatus(`Firebase bağlı. Canlı senkronizasyon aktif: ${firebaseSync.user.email}`);
  firebaseSync.unsubscribe = firebaseSync.docRef.onSnapshot({ includeMetadataChanges: true }, handleFirebaseSnapshot, (error) => {
    firebaseStatus(`Firebase dinleme hatası: ${error.message}`);
  });
  firebaseSync.personalUnsubscribe = firebaseSync.personalDocRef.onSnapshot({ includeMetadataChanges: true }, handlePersonalFirebaseSnapshot, (error) => {
    firebaseStatus(`Kişisel alan dinleme hatası: ${error.message}`);
  });
  firebaseSync.memberUnsubscribe = firebaseSync.memberDocRef.onSnapshot({ includeMetadataChanges: true }, handleWorkspaceMemberSnapshot, (error) => {
    firebaseStatus(`Ortak alan rolü okunamadı: ${error.message}`);
  });
  renderPersonalGate();
  renderPersonalArea();
  renderNotes();
  renderSettings();
  applyTheme();
  applyCompactMode();
  setupNotifications();
  restartAutoLockInterval();
  applyStartupPreference();
}

function stopFirestoreSync(message = "Firebase oturumu kapalı.") {
  if (firebaseSync.unsubscribe) firebaseSync.unsubscribe();
  if (firebaseSync.personalUnsubscribe) firebaseSync.personalUnsubscribe();
  if (firebaseSync.memberUnsubscribe) firebaseSync.memberUnsubscribe();
  if (firebaseSync.membersUnsubscribe) firebaseSync.membersUnsubscribe();
  if (firebaseSync.userDirectoryUnsubscribe) firebaseSync.userDirectoryUnsubscribe();
  firebaseSync.unsubscribe = null;
  firebaseSync.personalUnsubscribe = null;
  firebaseSync.memberUnsubscribe = null;
  firebaseSync.membersUnsubscribe = null;
  firebaseSync.userDirectoryUnsubscribe = null;
  firebaseSync.ready = false;
  firebaseSync.remoteLoaded = false;
  firebaseSync.personalRemoteLoaded = false;
  firebaseSync.pendingLocalSave = false;
  firebaseSync.pendingPersonalSave = false;
  firebaseSync.docRef = null;
  firebaseSync.personalDocRef = null;
  firebaseSync.memberDocRef = null;
  firebaseSync.membersCollectionRef = null;
  firebaseSync.userDirectoryRef = null;
  firebaseSync.userDirectoryDocRef = null;
  firebaseSync.workspaceRole = "viewer";
  firebaseSync.workspaceMembers = [];
  firebaseSync.workspaceUsers = [];
  personalState = loadPersonalState(null);
  personalUnlocked = true;
  if (activeWorkspace === "personal") state = personalState.workspace;
  renderPersonalGate();
  renderPersonalArea();
  renderNotes();
  setupNotifications();
  firebaseStatus(message);
}

function renderFirebaseAuthGate(isSignedIn) {
  const firebaseEnabled = Boolean(firebaseConfig().enabled);
  document.body.classList.toggle("firebase-auth-required", firebaseEnabled && !isSignedIn);
  if ($("firebaseLogoutBtn")) $("firebaseLogoutBtn").style.display = firebaseEnabled && isSignedIn ? "inline-flex" : "none";
  if (!firebaseEnabled) $("firebaseLoginScreen").style.display = "none";
  else $("firebaseLoginScreen").style.display = isSignedIn ? "none" : "grid";
}

function setWorkspaceScope(scope, targetView = "dashboard", options = {}) {
  if (scope === "personal" && personalState.settings.passwordEnabled && !personalUnlocked && !options.skipLock) {
    pendingPersonalView = targetView;
    activeWorkspace = "personal";
    state = personalState.workspace;
    switchView("personal");
    renderWorkspaceChrome();
    renderPersonalGate();
    return;
  }
  if (scope === "common" && commonState.settings.passwordEnabled && !commonUnlocked && !options.skipLock) {
    pendingCommonView = targetView;
    activeWorkspace = "common";
    state = commonState;
    switchView("dashboard");
    openCommonPasswordDialog();
    renderWorkspaceChrome();
    return;
  }
  if (activeWorkspace === "personal" && scope !== "personal" && personalState.settings.passwordEnabled) {
    personalUnlocked = false;
  }
  activeWorkspace = scope;
  state = activeWorkspace === "personal" ? personalState.workspace : commonState;
  applyTheme();
  applyCompactMode();
  renderAll();
  switchView(targetView);
  renderWorkspaceChrome();
}

function applyStartupPreference() {
  if (startupPreferenceApplied) return;
  startupPreferenceApplied = true;
  const scope = personalState.settings.startupScope || "common";
  const view = personalState.settings.startupView || "dashboard";
  setWorkspaceScope(scope, view);
}

function renderWorkspaceChrome() {
  document.body.dataset.workspace = activeWorkspace;
  const label = activeWorkspace === "personal" ? (personalState.settings.areaTitle || "Kişisel Alan") : "Ortak Alan";
  const today = formatDate(todayKey());
  if ($("todayLabel")) $("todayLabel").textContent = `${label} · ${today}`;
  const lockedPersonal = activeWorkspace === "personal" && personalLocked();
  const activeViewId = document.querySelector(".view.active")?.id || "dashboardView";
  if ($("quickNoteBtn")) $("quickNoteBtn").style.display = lockedPersonal ? "none" : "";
  if ($("quickAddBtn")) $("quickAddBtn").style.display = lockedPersonal ? "none" : "";
  if ($("simplifiedViewBtn")) $("simplifiedViewBtn").style.display = lockedPersonal || activeViewId !== "dashboardView" ? "none" : "";
  if ($("personalSettingsPanel")) $("personalSettingsPanel").style.display = activeWorkspace === "personal" ? "" : "none";
  if ($("firebaseSyncPanel")) $("firebaseSyncPanel").style.display = activeWorkspace === "common" ? "" : "none";
  if ($("commonPasswordPanel")) $("commonPasswordPanel").style.display = activeWorkspace === "common" && firebaseSync.workspaceRole === "admin" ? "" : "none";
  if ($("commonAuditPanel")) $("commonAuditPanel").style.display = activeWorkspace === "common" && (!firebaseConfig().enabled || firebaseSync.workspaceRole === "admin") ? "" : "none";
  if ($("memberRolesPanel")) $("memberRolesPanel").style.display = activeWorkspace === "common" ? "" : "none";
  if ($("commonThemePanel")) $("commonThemePanel").style.display = activeWorkspace === "common" ? "" : "none";
  if ($("sidebarUserEmail")) $("sidebarUserEmail").textContent = personalState.settings.nickname || firebaseSync.user?.email || "Giriş bekleniyor";
  document.querySelectorAll(".ws-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.workspace === activeWorkspace);
  });
  applyNavOrder();
  document.querySelectorAll('.nav-btn[data-view="appearance"]').forEach((btn) => {
    btn.style.display = activeWorkspace === "common" ? "" : "none";
  });
  if ($("workspaceIndicator")) $("workspaceIndicator").textContent = activeWorkspace === "personal" ? "KİŞİSEL ALAN" : "ORTAK ALAN";
  renderSimplifiedViewMode();
  renderWorkspaceRole();
}

function navOrderSettingKey() {
  return activeWorkspace === "personal" ? "personalNavOrder" : "commonNavOrder";
}

function currentNavOrder() {
  return normalizeNavOrder(personalState.settings[navOrderSettingKey()]);
}

function applyNavOrder() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const orderedViews = currentNavOrder();
  const fixedStart = [];
  orderedViews.forEach((view) => {
    const btn = nav.querySelector(`.nav-btn[data-view="${view}"]`);
    if (btn) {
      btn.draggable = true;
      btn.classList.add("nav-reorderable");
      nav.appendChild(btn);
    }
  });
  ["appearance", "settings", "help"].forEach((view) => {
    const btn = nav.querySelector(`.nav-btn[data-view="${view}"]`);
    if (btn) {
      btn.draggable = false;
      btn.classList.remove("nav-reorderable");
      nav.appendChild(btn);
    }
  });
  if ($("firebaseLogoutBtn")) nav.appendChild($("firebaseLogoutBtn"));
}

function saveNavOrderFromDom() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  personalState.settings[navOrderSettingKey()] = [...nav.querySelectorAll(".nav-btn.nav-reorderable")]
    .map((btn) => btn.dataset.view)
    .filter((view) => REORDERABLE_NAV_VIEWS.includes(view));
  savePersonalState(true);
}

function navButtonReorderable(button) {
  return button?.classList?.contains("nav-reorderable") && REORDERABLE_NAV_VIEWS.includes(button.dataset.view);
}

function startNavDrag(event) {
  if (!navButtonReorderable(event.currentTarget)) return event.preventDefault();
  event.dataTransfer.setData("text/plain", event.currentTarget.dataset.view);
  event.dataTransfer.effectAllowed = "move";
}

function allowNavDrop(event) {
  if (!navButtonReorderable(event.currentTarget)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function dropNavButton(event) {
  if (!navButtonReorderable(event.currentTarget)) return;
  event.preventDefault();
  const sourceView = event.dataTransfer.getData("text/plain");
  reorderNavButton(sourceView, event.currentTarget.dataset.view);
}

function startNavPointerDrag(event) {
  const button = event.currentTarget;
  if (!navButtonReorderable(button) || event.pointerType === "mouse") return;
  button.setPointerCapture?.(event.pointerId);
  navDragState = {
    button,
    view: button.dataset.view,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    dragging: false
  };
}

function moveNavPointerDrag(event) {
  if (!navDragState) return;
  if (navDragState.pointerId !== event.pointerId) return;
  const distance = Math.hypot(event.clientX - navDragState.startX, event.clientY - navDragState.startY);
  if (distance > 8) {
    navDragState.dragging = true;
    navDragState.button.classList.add("dragging");
    event.preventDefault();
  }
}

function endNavPointerDrag(event) {
  if (!navDragState) return;
  if (navDragState.pointerId !== event.pointerId) return;
  const state = navDragState;
  navDragState = null;
  state.button.releasePointerCapture?.(event.pointerId);
  state.button.classList.remove("dragging");
  if (!state.dragging) return;
  suppressNavClick = true;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".nav-btn.nav-reorderable");
  if (target) reorderNavButton(state.view, target.dataset.view);
  setTimeout(() => { suppressNavClick = false; }, 0);
}

function reorderNavButton(sourceView, targetView) {
  if (!sourceView || !targetView || sourceView === targetView) return;
  const nav = document.querySelector(".nav");
  const source = nav?.querySelector(`.nav-btn[data-view="${sourceView}"]`);
  const target = nav?.querySelector(`.nav-btn[data-view="${targetView}"]`);
  if (!navButtonReorderable(source) || !navButtonReorderable(target)) return;
  const buttons = [...nav.querySelectorAll(".nav-btn.nav-reorderable")];
  const sourceIndex = buttons.indexOf(source);
  const targetIndex = buttons.indexOf(target);
  if (sourceIndex < 0 || targetIndex < 0) return;
  nav.insertBefore(source, sourceIndex < targetIndex ? target.nextSibling : target);
  saveNavOrderFromDom();
}

function simplifiedSettingKey() {
  return activeWorkspace === "personal" ? "simplifiedPersonalView" : "simplifiedCommonView";
}

function simplifiedViewEnabled() {
  return Boolean(personalState.settings[simplifiedSettingKey()]);
}

function renderSimplifiedViewMode() {
  const activeView = document.querySelector(".view.active")?.id || "dashboardView";
  const enabled = !(activeWorkspace === "personal" && personalLocked()) && simplifiedViewEnabled() && activeView === "dashboardView";
  document.body.classList.toggle("simplified-dashboard", enabled);
  if ($("simplifiedViewBtn")) {
    $("simplifiedViewBtn").classList.toggle("active", enabled);
    $("simplifiedViewBtn").textContent = enabled ? "Standart Görünüm" : "Sadeleşmiş Görünüm";
  }
}

function toggleSimplifiedView() {
  if (activeWorkspace === "personal" && personalLocked()) return;
  const key = simplifiedSettingKey();
  personalState.settings[key] = !personalState.settings[key];
  savePersonalState(true);
  syncSimplifiedViewPreference();
  setWorkspaceScope(activeWorkspace, "dashboard", { skipLock: true });
}

function syncSimplifiedViewPreference() {
  renderSimplifiedViewMode();
}

function renderWorkspaceRole() {
  if (!$("workspaceRoleStatus")) return;
  const roleText = { admin: "Yönetici", editor: "Düzenleyici", viewer: "Sadece görüntüleme" }[firebaseSync.workspaceRole] || "Sadece görüntüleme";
  $("workspaceRoleStatus").textContent = firebaseSync.user
    ? `Ortak alan rolün: ${roleText}. ${canWriteCommonWorkspace() ? "Ortak alanda değişiklik yapabilirsin." : "Ortak alanı görebilirsin ama değiştiremezsin."}`
    : "Ortak alan rolü için Firebase girişi gerekir.";
  renderMemberRoleList();
}

function canManageWorkspaceMembers() {
  return firebaseSync.user && firebaseSync.workspaceRole === "admin" && firebaseSync.membersCollectionRef;
}

function renderMemberRoleList() {
  if (!$("memberRoleList")) return;
  const canManage = canManageWorkspaceMembers();
  ["memberUserSelect", "memberRole", "saveMemberRoleBtn"].forEach((id) => {
    if ($(id)) $(id).disabled = !canManage;
  });
  if ($("memberRoleHelp")) {
    $("memberRoleHelp").textContent = canManage
      ? "Kayıtlı kullanıcıyı e-posta adresinden seçip ortak alan rolünü değiştirebilirsin."
      : "Bu paneli kullanmak için ortak alanda yönetici rolün olmalı.";
  }
  if (!canManage) {
    $("memberRoleList").innerHTML = empty("Yetki listesini yalnızca yöneticiler görebilir.");
    return;
  }
  const selectedUser = $("memberUserSelect")?.value || "";
  const userOptions = firebaseSync.workspaceUsers
    .sort((a, b) => (a.email || a.uid).localeCompare(b.email || b.uid, "tr"))
    .map((user) => `<option value="${escapeAttr(user.uid)}">${escapeHtml(user.email || user.uid)}</option>`);
  setOptions("memberUserSelect", ['<option value="">Kayıtlı kullanıcı seç</option>', ...userOptions]);
  if ($("memberUserSelect")) $("memberUserSelect").value = firebaseSync.workspaceUsers.some((user) => user.uid === selectedUser) ? selectedUser : "";
  $("memberRoleList").innerHTML = firebaseSync.workspaceMembers
    .sort((a, b) => (a.email || a.uid).localeCompare(b.email || b.uid, "tr"))
    .map((member) => `
      <div class="compact-item">
        <div class="task-title">
          <strong>${escapeHtml(member.email || member.uid)}</strong>
          <small>${escapeHtml(member.uid)} · ${workspaceRoleText(member.role)}</small>
        </div>
        <span class="button-row">
          <button type="button" onclick="fillMemberRoleForm('${escapeAttr(member.uid)}')">Düzenle</button>
          <button type="button" class="danger-btn" onclick="removeWorkspaceMember('${escapeAttr(member.uid)}')">Sil</button>
        </span>
      </div>
    `).join("") || empty("Henüz rol atanmış kullanıcı yok.");
}

function workspaceRoleText(role) {
  return { admin: "Yönetici", editor: "Düzenleyici", viewer: "Sadece görüntüleme" }[role] || "Sadece görüntüleme";
}

function fillMemberRoleForm(uid) {
  const member = firebaseSync.workspaceMembers.find((item) => item.uid === uid);
  if (!member) return;
  $("memberUserSelect").value = member.uid;
  $("memberRole").value = member.role || "viewer";
}

async function saveMemberRole() {
  if (!canManageWorkspaceMembers()) return alert("Rol atamak için ortak alanda yönetici olmalısın.");
  const uid = $("memberUserSelect").value;
  const user = firebaseSync.workspaceUsers.find((item) => item.uid === uid);
  const email = user?.email || "";
  const role = $("memberRole").value;
  if (!uid) return alert("Rol vermek için kayıtlı kullanıcı seç.");
  if (!["admin", "editor", "viewer"].includes(role)) return alert("Rol geçerli değil.");
  try {
    await firebaseSync.membersCollectionRef.doc(uid).set({
      role,
      email,
      updatedAt: new Date().toISOString(),
      updatedBy: firebaseSync.user.uid
    }, { merge: true });
    $("memberUserSelect").value = "";
    $("memberRole").value = "viewer";
  } catch (error) {
    alert(`Rol kaydedilemedi: ${error.message}`);
  }
}

async function removeWorkspaceMember(uid) {
  if (!canManageWorkspaceMembers()) return alert("Rol silmek için ortak alanda yönetici olmalısın.");
  if (uid === firebaseSync.user.uid && !confirm("Kendi yönetici rolünü silersen ortak alan yetkilerini kaybedebilirsin. Devam edilsin mi?")) return;
  if (uid !== firebaseSync.user.uid && !confirm("Bu kullanıcının ortak alan rolü silinsin mi?")) return;
  try {
    await firebaseSync.membersCollectionRef.doc(uid).delete();
  } catch (error) {
    alert(`Rol silinemedi: ${error.message}`);
  }
}

async function loginFirebase(event) {
  event.preventDefault();
  const email = $("firebaseEmail").value.trim();
  const password = $("firebasePassword").value;
  if (!email || !password) return;
  $("firebaseLoginMessage").textContent = "Giriş yapılıyor...";
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    $("firebasePassword").value = "";
    $("firebaseLoginMessage").textContent = "";
  } catch (error) {
    $("firebaseLoginMessage").textContent = firebaseAuthErrorMessage(error);
  }
}

async function logoutFirebase() {
  if (!window.firebase?.auth) return;
  await firebase.auth().signOut();
}

function firebaseAuthErrorMessage(error) {
  const messages = {
    "auth/invalid-email": "E-posta adresi geçerli değil.",
    "auth/user-disabled": "Bu kullanıcı pasif durumda.",
    "auth/user-not-found": "Bu e-posta ile kullanıcı bulunamadı.",
    "auth/wrong-password": "Şifre hatalı.",
    "auth/invalid-credential": "E-posta veya şifre hatalı.",
    "auth/too-many-requests": "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene."
  };
  return messages[error.code] || `Giriş başarısız: ${error.message}`;
}

function handleFirebaseSnapshot(snapshot) {
  if (snapshot.metadata.hasPendingWrites) {
    firebaseSync.remoteLoaded = true;
    firebaseStatus("Firebase yerel değişikliği gönderiyor...");
    return;
  }
  if (!snapshot.exists) {
    firebaseSync.remoteLoaded = true;
    firebaseStatus("Firebase ilk kayıt oluşturuluyor...");
    queueFirebaseSave(true);
    return;
  }
  const data = snapshot.data();
  if (!data?.state || data.updatedBy === firebaseSync.clientId) {
    firebaseSync.remoteLoaded = true;
    firebaseSync.pendingLocalSave = false;
    firebaseStatus("Firebase güncel.");
    return;
  }
  firebaseSync.applyingRemote = true;
  commonState = normalizeState(data.state);
  commonUnlocked = !commonState.settings.passwordEnabled || commonUnlocked;
  if (activeWorkspace === "common") state = commonState;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(commonState));
  firebaseSync.remoteLoaded = true;
  renderAll();
  firebaseSync.applyingRemote = false;
  firebaseStatus(`Firebase senkronlandı: ${new Date(data.updatedAt || Date.now()).toLocaleString("tr-TR")}`);
}

function queueFirebaseSave(force = false) {
  if (!firebaseSync.ready || firebaseSync.applyingRemote) return;
  if (!firebaseSync.remoteLoaded && !force) {
    firebaseSync.pendingLocalSave = true;
    firebaseStatus("Firebase ilk veri bekleniyor; değişiklik sıraya alındı.");
    return;
  }
  clearTimeout(firebaseSync.saveTimer);
  firebaseSync.saveTimer = setTimeout(pushStateToFirebase, force ? 0 : FIREBASE_SYNC_DEBOUNCE_MS);
}

async function pushStateToFirebase() {
  if (!firebaseSync.docRef || firebaseSync.applyingRemote) return;
  try {
    await firebaseSync.docRef.set({
      state: commonState,
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
      updatedBy: firebaseSync.clientId
    });
    firebaseSync.pendingLocalSave = false;
    firebaseStatus("Firebase kaydedildi. Diğer cihazlara aktarılıyor.");
  } catch (error) {
    firebaseStatus(`Firebase kayıt hatası: ${error.message}`);
  }
}

function handlePersonalFirebaseSnapshot(snapshot) {
  if (snapshot.metadata.hasPendingWrites) {
    firebaseSync.personalRemoteLoaded = true;
    return;
  }
  if (!snapshot.exists) {
    firebaseSync.personalRemoteLoaded = true;
    queuePersonalFirebaseSave(true);
    return;
  }
  const data = snapshot.data();
  const isOwnWrite = data?.updatedBy === firebaseSync.clientId;
  if (!data?.state || isOwnWrite) {
    if (data?.state) {
      personalState = normalizePersonalState(data.state);
      localStorage.setItem(personalStorageKey(firebaseSync.user), JSON.stringify(personalState));
      if (activeWorkspace === "personal") state = personalState.workspace;
      renderPersonalGate();
      renderPersonalArea();
      renderNotes();
      renderSettings();
      renderWorkspaceChrome();
      applyTheme();
      applyCompactMode();
      syncSimplifiedViewPreference();
      setupNotifications();
      restartAutoLockInterval();
    }
    firebaseSync.personalRemoteLoaded = true;
    firebaseSync.pendingPersonalSave = false;
    return;
  }
  firebaseSync.applyingRemote = true;
  personalState = normalizePersonalState(data.state);
  localStorage.setItem(personalStorageKey(firebaseSync.user), JSON.stringify(personalState));
  if (activeWorkspace === "personal") state = personalState.workspace;
  firebaseSync.personalRemoteLoaded = true;
  renderPersonalGate();
  renderPersonalArea();
  renderNotes();
  renderSettings();
  renderWorkspaceChrome();
  applyTheme();
  applyCompactMode();
  syncSimplifiedViewPreference();
  setupNotifications();
  firebaseSync.applyingRemote = false;
}

function queuePersonalFirebaseSave(force = false) {
  if (!firebaseSync.ready || firebaseSync.applyingRemote || !firebaseSync.personalDocRef) return;
  if (!firebaseSync.personalRemoteLoaded && !force) {
    firebaseSync.pendingPersonalSave = true;
    return;
  }
  clearTimeout(firebaseSync.personalSaveTimer);
  firebaseSync.personalSaveTimer = setTimeout(pushPersonalStateToFirebase, force ? 0 : FIREBASE_SYNC_DEBOUNCE_MS);
}

async function pushPersonalStateToFirebase() {
  if (!firebaseSync.personalDocRef || firebaseSync.applyingRemote) return;
  try {
    await firebaseSync.personalDocRef.set({
      state: personalState,
      ownerEmail: firebaseSync.user?.email || "",
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
      updatedBy: firebaseSync.clientId
    });
    firebaseSync.pendingPersonalSave = false;
  } catch (error) {
    firebaseStatus(`Kişisel alan kayıt hatası: ${error.message}`);
  }
}

function handleWorkspaceMemberSnapshot(snapshot) {
  const role = snapshot.exists ? snapshot.data()?.role : "viewer";
  firebaseSync.workspaceRole = ["admin", "editor", "viewer"].includes(role) ? role : "viewer";
  if (firebaseSync.workspaceRole === "admin") startWorkspaceMembersSync();
  else stopWorkspaceMembersSync();
  renderWorkspaceRole();
  renderWorkspaceChrome();
}

function startWorkspaceMembersSync() {
  if (!firebaseSync.membersCollectionRef || firebaseSync.membersUnsubscribe) return;
  firebaseSync.membersUnsubscribe = firebaseSync.membersCollectionRef.onSnapshot((snapshot) => {
    firebaseSync.workspaceMembers = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    renderMemberRoleList();
  }, (error) => {
    firebaseStatus(`Yetki listesi okunamadı: ${error.message}`);
  });
  if (firebaseSync.userDirectoryRef && !firebaseSync.userDirectoryUnsubscribe) {
    firebaseSync.userDirectoryUnsubscribe = firebaseSync.userDirectoryRef.onSnapshot((snapshot) => {
      firebaseSync.workspaceUsers = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
      renderMemberRoleList();
    }, (error) => {
      firebaseStatus(`Kullanıcı listesi okunamadı: ${error.message}`);
    });
  }
}

function stopWorkspaceMembersSync() {
  if (firebaseSync.membersUnsubscribe) firebaseSync.membersUnsubscribe();
  if (firebaseSync.userDirectoryUnsubscribe) firebaseSync.userDirectoryUnsubscribe();
  firebaseSync.membersUnsubscribe = null;
  firebaseSync.userDirectoryUnsubscribe = null;
  firebaseSync.workspaceMembers = [];
  firebaseSync.workspaceUsers = [];
  renderMemberRoleList();
}

async function upsertWorkspaceUserDirectory() {
  if (!firebaseSync.userDirectoryDocRef || !firebaseSync.user) return;
  try {
    await firebaseSync.userDirectoryDocRef.set({
      uid: firebaseSync.user.uid,
      email: firebaseSync.user.email || "",
      displayName: firebaseSync.user.displayName || "",
      lastSeenAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    firebaseStatus(`Kullanıcı dizini güncellenemedi: ${error.message}`);
  }
}

function defaultSettings() {
  return {
    theme: "light",
    notificationsEnabled: false,
    androidNotificationsEnabled: false,
    normalNotifyMinutes: 30,
    criticalNotifyMinutes: 15,
    quietStart: "22:00",
    quietEnd: "07:00",
    passwordEnabled: false,
    passwordHash: "",
    compactMode: false,
    backupReminderDays: 7,
    lastBackupAt: "",
    autoLockMinutes: 0
  };
}

function defaultHolidaysForYear(year) {
  return FIXED_HOLIDAYS.map(([monthDay, name]) => ({ date: `${year}-${monthDay}`, name }));
}

function parseDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayKey() {
  return toKey(new Date());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function formatDate(key) {
  const date = parseDate(key);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()} ${WEEKDAYS[date.getDay()]}`;
}

function isHoliday(key) {
  const fixedHoliday = FIXED_HOLIDAYS.some(([monthDay]) => key.endsWith(monthDay));
  return fixedHoliday || state.holidays.some((holiday) => holiday.date === key);
}

function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

function previousBusinessDay(date) {
  let cursor = new Date(date);
  while (isWeekend(cursor) || isHoliday(toKey(cursor))) {
    cursor = addDays(cursor, -1);
  }
  return cursor;
}

function effectiveMonthlyDate(task, year, monthIndex) {
  if (task.repeatRule === "lastBusinessDay") {
    return toKey(previousBusinessDay(new Date(year, monthIndex + 1, 0)));
  }
  if (task.repeatRule === "firstMonday") {
    return nthWeekdayOfMonth(year, monthIndex, 1, 1);
  }
  if (task.repeatRule === "secondTuesday") {
    return nthWeekdayOfMonth(year, monthIndex, 2, 2);
  }
  const maxDay = daysInMonth(year, monthIndex);
  const preferred = Math.min(task.monthDay || 1, maxDay);
  let day = preferred;
  if (task.fallbackDays && task.fallbackDays.length && preferred > maxDay) {
    const validFallback = [...task.fallbackDays].sort((a, b) => b - a).find((d) => d <= maxDay);
    day = validFallback || maxDay;
  }
  let date = new Date(year, monthIndex, day);
  if (task.adjustBusinessDay) date = previousBusinessDay(date);
  return toKey(date);
}

function nthWeekdayOfMonth(year, monthIndex, weekday, nth) {
  let count = 0;
  for (let day = 1; day <= daysInMonth(year, monthIndex); day += 1) {
    const date = new Date(year, monthIndex, day);
    if (date.getDay() === weekday) {
      count += 1;
      if (count === nth) return toKey(date);
    }
  }
  return toKey(new Date(year, monthIndex, 1));
}

function isTaskDueOn(task, key) {
  if (!task.active) return false;
  const date = parseDate(key);
  if (task.frequency === "daily") return !isWeekend(date);
  if (task.frequency === "weekly") {
    if (task.repeatRule === "biweekly") {
      const start = parseDate(task.createdAt ? task.createdAt.slice(0, 10) : "2026-01-05");
      const weeks = Math.floor((date - start) / (7 * 24 * 60 * 60 * 1000));
      return weeks >= 0 && weeks % 2 === 0 && task.weekdays.includes(date.getDay());
    }
    return task.weekdays.includes(date.getDay());
  }
  if (task.frequency === "monthly") return effectiveMonthlyDate(task, date.getFullYear(), date.getMonth()) === key;
  if (task.frequency === "specific") return task.specificDate === key;
  return false;
}

function dueTasksFor(key) {
  return state.tasks
    .filter((task) => isTaskDueOn(task, key))
    .sort(compareTasks);
}

function compareTasks(a, b) {
  return (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title, "tr");
}

function completionKey(taskId, dateKey) {
  return `${dateKey}::${taskId}`;
}

function isComplete(taskId, dateKey) {
  return Boolean(state.completions[completionKey(taskId, dateKey)]);
}

function setComplete(taskId, dateKey, done) {
  const key = completionKey(taskId, dateKey);
  if (done) state.completions[key] = completionPayload();
  else delete state.completions[key];
  audit(done ? "Görev tamamlandı" : "Görev geri alındı", `${taskTitle(taskId)} - ${dateKey}`);
  saveState();
  renderAll();
}

function taskTitle(taskId) {
  return state.tasks.find((task) => task.id === taskId)?.title || "Görev";
}

function overdueOccurrences() {
  const today = parseDate(todayKey());
  const start = addDays(today, -45);
  const items = [];
  for (let cursor = new Date(start); cursor < today; cursor = addDays(cursor, 1)) {
    const key = toKey(cursor);
    dueTasksFor(key).forEach((task) => {
      if (!isComplete(task.id, key)) items.push({ task, dateKey: key });
    });
  }
  return items.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

function upcomingTasks(frequency = "monthly", limit = 8) {
  const start = parseDate(activeDate);
  const items = [];
  for (let offset = 0; offset < 75; offset += 1) {
    const key = toKey(addDays(start, offset));
    state.tasks.forEach((task) => {
      if (task.frequency === frequency && isTaskDueOn(task, key)) items.push({ task, dateKey: key });
    });
    if (items.length >= limit) break;
  }
  return items.slice(0, limit);
}

function init() {
  applyTheme();
  applyCompactMode();
  if ($("activeDate")) $("activeDate").value = activeDate;
  $("dashboardDate").value = activeDate;
  $("reportStart").value = toKey(addDays(parseDate(activeDate), -7));
  $("reportEnd").value = activeDate;
  $("taskPrintStart").value = activeDate;
  $("taskPrintEnd").value = activeDate;
  $("templatePrintStart").value = activeDate;
  $("templatePrintEnd").value = activeDate;
  $("paperworkMonth").value = activeDate.slice(0, 7);
  $("dispatchDate").value = activeDate;
  if ($("personalTodoDate")) $("personalTodoDate").value = activeDate;
  if ($("personalTodoDue")) $("personalTodoDue").value = activeDate;
  $("todayLabel").textContent = formatDate(todayKey());
  setupWeekdayPicker();
  bindEvents();
  enableDatePickers();
  registerServiceWorker();
  renderAll();
  renderSettings();
  renderDashboardSummaryToggle();
  renderTaskFilterToggle();
  renderPaperworkSummaryToggle();
  // Personel paneli mobilde varsayılan kapalı - mobile-panel-open eklenmez
  setupNotifications();
  clearPersonForm();
  setupFirebaseSync();
}

function bindEvents() {
  $("firebaseLoginForm").addEventListener("submit", loginFirebase);
  $("firebaseLogoutBtn").addEventListener("click", logoutFirebase);
  $("brandHomeBtn").addEventListener("click", goWorkspaceHome);
  $("mobileMenuBtn").addEventListener("click", toggleMobileMenu);
  $("summaryToggleBtn").addEventListener("click", toggleDashboardSummary);
  $("taskFilterToggleBtn").addEventListener("click", toggleTaskFilters);
  $("paperworkSummaryToggleBtn").addEventListener("click", togglePaperworkSummary);
  $("globalSearchBtn").addEventListener("click", openGlobalSearchDialog);
  $("closeGlobalSearchDialogBtn").addEventListener("click", () => $("globalSearchDialog").close());
  $("globalSearchInput").addEventListener("input", renderGlobalSearch);
  $("globalSearchResults").addEventListener("click", handleGlobalSearchResultClick);
  document.querySelectorAll("[data-global-search-type]").forEach((button) => {
    button.addEventListener("click", () => {
      globalSearchType = button.dataset.globalSearchType || "all";
      renderGlobalSearch();
    });
  });
  $("refreshPageBtn").addEventListener("click", refreshPage);
  $("closeMobileMenuBtn").addEventListener("click", closeMobileMenu);
  document.addEventListener("click", closeMobileMenuFromOverlay);
  document.addEventListener("touchstart", handleMenuTouchStart, { passive: true });
  document.addEventListener("touchend", handleMenuTouchEnd, { passive: true });
  document.querySelectorAll(".ws-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setWorkspaceScope(button.dataset.workspace);
      closeMobileMenu();
    });
  });
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (suppressNavClick) {
        suppressNavClick = false;
        return;
      }
      setWorkspaceScope(activeWorkspace, button.dataset.view);
      closeMobileMenu();
    });
    button.addEventListener("dragstart", startNavDrag);
    button.addEventListener("dragover", allowNavDrop);
    button.addEventListener("drop", dropNavButton);
    button.addEventListener("pointerdown", startNavPointerDrag);
  });
  document.addEventListener("pointermove", moveNavPointerDrag);
  document.addEventListener("pointerup", endNavPointerDrag);
  document.addEventListener("pointercancel", endNavPointerDrag);
  $("todayTaskList").addEventListener("touchstart", startTaskTouchDrag, { passive: true });
  document.addEventListener("touchmove", moveTaskTouchDrag, { passive: false });
  document.addEventListener("touchend", endTaskTouchDrag, { passive: false });
  document.addEventListener("touchcancel", cancelTaskTouchDrag, { passive: true });
  // Masaüstü sürükle-bırak (mouse)
  $("todayTaskList").addEventListener("dragstart", onTaskListDragStart);
  $("todayTaskList").addEventListener("dragover", onTaskListDragOver);
  $("todayTaskList").addEventListener("drop", onTaskListDrop);
  $("todayTaskList").addEventListener("dragend", onTaskListDragEnd);
  if ($("activeDate")) {
    $("activeDate").addEventListener("change", (event) => {
      setActiveDate(event.target.value || todayKey());
    });
  }
  $("dashboardDate").addEventListener("change", (event) => setActiveDate(event.target.value || todayKey()));
  $("prevDayBtn").addEventListener("click", () => setActiveDate(toKey(addDays(parseDate(activeDate), -1))));
  $("nextDayBtn").addEventListener("click", () => setActiveDate(toKey(addDays(parseDate(activeDate), 1))));
  $("todayBtn").addEventListener("click", () => setActiveDate(todayKey()));
  $("simplifiedViewBtn").addEventListener("click", toggleSimplifiedView);
  $("quickAddBtn").addEventListener("click", () => openTaskDialog());
  $("quickNoteBtn").addEventListener("click", () => openQuickTaskDialog());
  $("saveNoteBtn").addEventListener("click", saveNote);
  $("clearNoteBtn").addEventListener("click", clearNoteForm);
  $("deleteNoteBtn").addEventListener("click", deleteNoteFromForm);
  $("noteSearch").addEventListener("input", renderNotes);
  $("noteCategoryFilter").addEventListener("change", renderNotes);
  $("personalTodoDate").addEventListener("change", renderPersonalArea);
  $("personalTodoSearch").addEventListener("input", renderPersonalArea);
  $("personalTodoFilter").addEventListener("change", renderPersonalArea);
  $("savePersonalTodoBtn").addEventListener("click", savePersonalTodo);
  $("clearPersonalTodoBtn").addEventListener("click", clearPersonalTodoForm);
  $("deletePersonalTodoBtn").addEventListener("click", deletePersonalTodoFromForm);
  $("unlockPersonalBtn").addEventListener("click", unlockPersonalArea);
  $("personalUnlockPassword").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      unlockPersonalArea();
    }
  });
  $("quickTaskForm").addEventListener("submit", saveQuickTask);
  $("closeQuickTaskDialogBtn").addEventListener("click", () => $("quickTaskDialog").close());
  $("cancelQuickTaskBtn").addEventListener("click", () => $("quickTaskDialog").close());
  $("deleteQuickTaskBtn").addEventListener("click", deleteQuickTask);
  document.querySelectorAll("[data-quick-date]").forEach((button) => {
    button.addEventListener("click", () => setQuickTaskDateMode(button.dataset.quickDate));
  });
  $("closeDialogBtn").addEventListener("click", () => $("taskDialog").close());
  $("taskFrequency").addEventListener("change", () => {
    renderRepeatRuleOptions();
    renderFrequencyOptions();
  });
  $("taskForm").addEventListener("submit", saveTaskFromForm);
  $("deleteTaskBtn").addEventListener("click", deleteTaskFromForm);
  $("taskSearch").addEventListener("input", renderTaskTable);
  $("frequencyFilter").addEventListener("change", renderTaskTable);
  $("categoryFilter").addEventListener("change", renderTaskTable);
  $("assigneeFilter").addEventListener("change", renderTaskTable);
  $("priorityFilter").addEventListener("change", renderTaskTable);
  $("statusFilter").addEventListener("change", renderTaskTable);
  $("seedDefaultsBtn").addEventListener("click", seedDefaults);
  $("openPrintRangeBtn").addEventListener("click", openPrintRangeDialog);
  $("printTodayBtn").addEventListener("click", printTodaySummary);
  $("closePrintRangeDialogBtn").addEventListener("click", () => $("printRangeDialog").close());
  $("openTaskExportDialogBtn").addEventListener("click", openTaskExportDialog);
  $("closeTaskExportDialogBtn").addEventListener("click", () => $("taskExportDialog").close());
  $("exportTaskListPdfBtn").addEventListener("click", exportTaskListPdf);
  $("exportTaskListXlsxBtn").addEventListener("click", exportTaskListXlsx);
  $("prevMonthBtn").addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
    renderCalendar();
  });
  $("nextMonthBtn").addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
    renderCalendar();
  });
  $("backupBtn").addEventListener("click", backupJson);
  $("restoreInput").addEventListener("change", restoreJson);
  $("addHolidayBtn").addEventListener("click", addHoliday);
  $("exportPdfBtn").addEventListener("click", exportPdf);
  $("exportXlsxBtn").addEventListener("click", exportXlsx);
  $("exportYearBtn").addEventListener("click", exportYearArchive);
  $("reportStart").addEventListener("change", renderReportSummary);
  $("reportEnd").addEventListener("change", renderReportSummary);
  $("toggleOverdueBtn").addEventListener("click", () => {
    showOverdueList = !showOverdueList;
    renderDashboard();
  });
  document.querySelectorAll("[data-upcoming]").forEach((button) => {
    button.addEventListener("click", () => {
      upcomingFilter = button.dataset.upcoming;
      renderDashboard();
    });
  });
  document.querySelectorAll("[data-mobile-panel-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleMobilePanel(button.dataset.mobilePanelToggle));
  });
  $("completeAllOverdueBtn").addEventListener("click", completeAllOverdue);
  $("notificationToggleBtn").addEventListener("click", toggleNotifications);
  $("commonNotificationsEnabled").addEventListener("change", saveNotificationSettings);
  $("personalNotificationsEnabled").addEventListener("change", saveNotificationSettings);
  $("androidNotificationsEnabled")?.addEventListener("change", saveNotificationSettings);
  $("saveNotificationSettingsBtn").addEventListener("click", saveNotificationSettings);
  $("androidTestNotificationBtn")?.addEventListener("click", sendAndroidTestNotification);
  $("androidRunNotificationBtn")?.addEventListener("click", runAndroidNotificationCheck);
  $("compactToggleBtn").addEventListener("click", toggleCompactMode);
  $("savePasswordBtn").addEventListener("click", savePassword);
  $("disablePasswordBtn").addEventListener("click", disablePassword);
  $("unlockBtn").addEventListener("click", unlockApp);
  $("passwordDialog").addEventListener("cancel", (event) => event.preventDefault());
  $("loginPassword").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      unlockApp();
    }
  });
  $("closeDayDialogBtn").addEventListener("click", () => $("dayDialog").close());
  $("selectAllDayTasksBtn").addEventListener("click", selectAllDayTasks);
  $("completeSelectedDayTasksBtn").addEventListener("click", completeSelectedDayTasks);
  $("transferTasksBtn").addEventListener("click", transferTasks);
  $("addPersonBtn").addEventListener("click", addPerson);
  $("cancelPersonEditBtn").addEventListener("click", clearPersonForm);
  $("addShiftBtn").addEventListener("click", addShift);
  $("buildTemplateBtn").addEventListener("click", buildTemplate);
  $("printTemplateBtn").addEventListener("click", printTemplate);
  $("paperworkMonth").addEventListener("change", renderPaperwork);
  document.querySelectorAll("[data-paperwork-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      paperworkTab = button.dataset.paperworkTab;
      renderPaperworkTabs();
    });
  });
  $("addPaperworkItemBtn").addEventListener("click", () => openPaperworkItemDialog());
  $("paperworkItemForm").addEventListener("submit", savePaperworkItemFromDialog);
  $("closePaperworkItemDialogBtn").addEventListener("click", () => $("paperworkItemDialog").close());
  $("cancelPaperworkItemBtn").addEventListener("click", () => $("paperworkItemDialog").close());
  $("deletePaperworkItemBtn").addEventListener("click", deletePaperworkItemFromDialog);
  $("addPaperworkStepBtn").addEventListener("click", addPaperworkStepDraft);
  $("seedPaperworkTasksBtn").addEventListener("click", seedPaperworkTasks);
  $("exportPaperworkSummaryBtn").addEventListener("click", exportPaperworkSummary);
  $("addDispatchBtn").addEventListener("click", addDispatch);
  $("dispatchTarget").addEventListener("change", renderDispatchOtherFields);
  $("dispatchSubject").addEventListener("change", renderDispatchOtherFields);
  $("addCategoryBtn").addEventListener("click", addCategory);
  if ($("addProfileBtn")) $("addProfileBtn").addEventListener("click", addProfile);
  $("saveMemberRoleBtn").addEventListener("click", saveMemberRole);
  $("openAuditLogBtn").addEventListener("click", openAuditLogDialog);
  $("closeAuditLogDialogBtn").addEventListener("click", () => $("auditLogDialog").close());
  $("applyAuditLogRangeBtn").addEventListener("click", renderAuditLogRange);
  $("deleteAuditLogRangeBtn").addEventListener("click", deleteAuditLogRange);
  $("commonThemeLightBtn").addEventListener("click", () => setCommonThemeMode("light"));
  $("commonThemeDarkBtn").addEventListener("click", () => setCommonThemeMode("dark"));
  $("saveUserNicknameBtn").addEventListener("click", saveUserNickname);
  $("savePersonalAreaNameBtn").addEventListener("click", savePersonalAreaName);
  $("saveStartupViewBtn").addEventListener("click", saveStartupViewPreference);
  $("savePersonalPasswordBtn").addEventListener("click", savePersonalPassword);
  $("disablePersonalPasswordBtn").addEventListener("click", disablePersonalPassword);
  $("personalThemeLightBtn").addEventListener("click", () => setPersonalThemeMode("light"));
  $("personalThemeDarkBtn").addEventListener("click", () => setPersonalThemeMode("dark"));
  $("clearAuditBtn").addEventListener("click", clearAudit);
  $("installPwaBtn").addEventListener("click", installPwa);
  $("encryptedBackupBtn").addEventListener("click", encryptedBackup);
  $("restoreIndexedDbBtn").addEventListener("click", restoreFromIndexedDb);
  $("resetClosingBtn").addEventListener("click", resetClosingChecklist);
  document.querySelectorAll(".help-section h2").forEach((heading) => {
    heading.addEventListener("click", () => heading.closest(".help-section")?.classList.toggle("open"));
  });
  $("saveCommonAutoLockBtn")?.addEventListener("click", saveCommonAutoLock);
  $("savePersonalAutoLockBtn")?.addEventListener("click", savePersonalAutoLock);
  // Otomatik kilit: her tıklama / tuş / dokunma aktivite zamanını sıfırlar
  ["mousedown", "keydown", "touchstart", "pointermove"].forEach((ev) => {
    document.addEventListener(ev, resetAutoLockTimer, { passive: true });
  });
  restartAutoLockInterval();
}

// ── Otomatik Kilit Motoru ──────────────────────────────────────────────────
let _autoLockTimer = null;
let _lastActivityAt = Date.now();

function resetAutoLockTimer() {
  _lastActivityAt = Date.now();
}

// Ayar kaydedildiğinde: hem _lastActivityAt'i sıfırla hem timer'ı başlat
function setupAutoLock() {
  _lastActivityAt = Date.now();
  restartAutoLockInterval();
}

// Firebase/init çağrıları için: sadece timer'ı (yeniden) başlat, _lastActivityAt'e dokunma
function restartAutoLockInterval() {
  if (_autoLockTimer) clearInterval(_autoLockTimer);
  const commonMinutes = Number(state.settings?.autoLockMinutes) || 0;
  const personalMinutes = Number(personalState.settings?.autoLockMinutes) || 0;
  if (!commonMinutes && !personalMinutes) { _autoLockTimer = null; return; }
  _autoLockTimer = setInterval(checkAutoLock, 15_000); // 15 saniyede bir kontrol
}

function checkAutoLock() {
  const idleMs = Date.now() - _lastActivityAt;
  const commonMinutes = Number(state.settings?.autoLockMinutes) || 0;
  const personalMinutes = Number(personalState.settings?.autoLockMinutes) || 0;

  // Ortak alan kilitleme — hangi alanda olunursa olsun kilitle
  if (commonMinutes > 0 && state.settings.passwordEnabled && commonUnlocked) {
    if (idleMs >= commonMinutes * 60_000) {
      commonUnlocked = false;
      audit("Ortak alan otomatik kilitlendi", `${commonMinutes} dk hareketsizlik`);
      if (activeWorkspace === "common") {
        openCommonPasswordDialog();
      } else {
        // Kişisel alandayken ortak alan kilitlendi — geçiş yapılırsa soracak
        renderWorkspaceChrome();
      }
    }
  }

  // Kişisel alan kilitleme — hangi alanda olunursa olsun kilitle
  if (personalMinutes > 0 && personalState.settings.passwordEnabled && personalUnlocked) {
    if (idleMs >= personalMinutes * 60_000) {
      personalUnlocked = false;
      audit("Kişisel alan otomatik kilitlendi", `${personalMinutes} dk hareketsizlik`);
      if (activeWorkspace === "personal") {
        // Şu an kişisel alandaysa hemen kilit ekranını göster
        switchView("personal");
        renderPersonalGate();
        renderPersonalArea();
      }
      // Ortak alandaysa zaten kilitli — geçiş anında soracak
    }
  }
}

// Android APK WebView desteği: Uygulama arka plana alındığında setInterval durur.
// Tekrar öne geldiğinde visibilitychange ile anında kontrol et.
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    // Ön plana döndü → hemen kilit kontrolü yap
    checkAutoLock();
    // Timer'ı yeniden başlat (uzun süre arkaplanda kaldıysa interval durmuş olabilir)
    restartAutoLockInterval();
  }
});

// Android WebView resume desteği (bazı WebView sürümleri visibilitychange yerine
// pageshow/focus kullanır)
window.addEventListener("focus", function () {
  checkAutoLock();
  restartAutoLockInterval();
});
window.addEventListener("pageshow", function () {
  checkAutoLock();
  restartAutoLockInterval();
});
// ─────────────────────────────────────────────────────────────────────────────


function toggleMobileMenu() {
  const open = !document.body.classList.contains("mobile-menu-open");
  document.body.classList.toggle("mobile-menu-open", open);
  $("mobileMenuBtn").setAttribute("aria-expanded", String(open));
}

function closeMobileMenu() {
  document.body.classList.remove("mobile-menu-open");
  $("mobileMenuBtn").setAttribute("aria-expanded", "false");
}

function refreshPage() {
  closeMobileMenu();
  window.location.reload();
}

function goWorkspaceHome() {
  setWorkspaceScope(activeWorkspace, "dashboard", { skipLock: true });
  closeMobileMenu();
}

function toggleDashboardSummary() {
  dashboardSummaryOpen = !dashboardSummaryOpen;
  renderDashboardSummaryToggle();
}

function renderDashboardSummaryToggle() {
  document.body.classList.toggle("summary-open", dashboardSummaryOpen);
  $("summaryToggleBtn").setAttribute("aria-expanded", String(dashboardSummaryOpen));
  $("summaryToggleBtn").textContent = dashboardSummaryOpen ? "Özeti Gizle" : "Özet";
}

function toggleTaskFilters() {
  taskFiltersOpen = !taskFiltersOpen;
  renderTaskFilterToggle();
}

function renderTaskFilterToggle() {
  document.body.classList.toggle("task-filters-open", taskFiltersOpen);
  $("taskFilterToggleBtn").setAttribute("aria-expanded", String(taskFiltersOpen));
  $("taskFilterToggleBtn").textContent = taskFiltersOpen ? "Filtreleri Gizle" : "Filtrele";
}

function togglePaperworkSummary() {
  paperworkSummaryOpen = !paperworkSummaryOpen;
  renderPaperworkSummaryToggle();
}

function renderPaperworkSummaryToggle() {
  document.body.classList.toggle("paperwork-summary-open", paperworkSummaryOpen);
  $("paperworkSummaryToggleBtn").setAttribute("aria-expanded", String(paperworkSummaryOpen));
  $("paperworkSummaryToggleBtn").textContent = paperworkSummaryOpen ? "Özeti Gizle" : "Özet";
}

function toggleMobilePanel(panelName) {
  const panel = document.querySelector(`[data-mobile-panel="${panelName}"]`);
  if (!panel) return;
  const open = !panel.classList.contains("mobile-panel-open");
  panel.classList.toggle("mobile-panel-open", open);
  const button = panel.querySelector("[data-mobile-panel-toggle]");
  if (button) button.setAttribute("aria-expanded", String(open));
}

function closeMobileMenuFromOverlay(event) {
  if (!document.body.classList.contains("mobile-menu-open")) return;
  if (event.target.closest(".sidebar") || event.target.closest("#mobileMenuBtn")) return;
  closeMobileMenu();
}

function handleMenuTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleMenuTouchEnd(event) {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = Math.abs(touch.clientY - touchStartY);
  if (deltaY > 70 || Math.abs(deltaX) < 70) return;
  if (!document.body.classList.contains("mobile-menu-open") && touchStartX < 32 && deltaX > 0) toggleMobileMenu();
  if (document.body.classList.contains("mobile-menu-open") && deltaX < 0) closeMobileMenu();
}

function enableDatePickers() {
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.addEventListener("click", () => openDatePicker(input));
    input.addEventListener("focus", () => openDatePicker(input));
  });
}

function openDatePicker(input) {
  if (typeof input.showPicker !== "function") return;
  try {
    input.showPicker();
  } catch {
    // Tarayıcı sadece doğrudan kullanıcı etkileşiminde izin verirse normal davranış kalır.
  }
}

function setActiveDate(dateKey) {
  activeDate = dateKey;
  if ($("activeDate")) $("activeDate").value = activeDate;
  $("dashboardDate").value = activeDate;
  calendarCursor = startOfMonth(parseDate(activeDate));
  renderAll();
}

function switchView(view) {
  if (activeWorkspace === "personal" && personalLocked() && view !== "personal") view = "personal";
  if (activeWorkspace === "personal" && view === "appearance") view = "settings";
  if (activeWorkspace === "common" && view === "settings" && firebaseConfig().enabled && firebaseSync.workspaceRole !== "admin") {
    alert("Ortak alan ayarlarını yalnızca admin rolündeki kullanıcılar açabilir.");
    view = "dashboard";
  }
  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === view));
  document.querySelectorAll(".view").forEach((panel) => panel.classList.toggle("active", panel.id === `${view}View`));
  const titles = { dashboard: "Ana Sayfa", notes: "Notlar", personal: "Kişisel Alan", tasks: "Görevler", paperwork: "Evrak", calendar: "Takvim", people: "Personel", templates: "Şablonlar", reports: "Raporlar", appearance: "Kişisel Tercihler", settings: "Ayarlar", help: "Yardım" };
  $("viewTitle").textContent = titles[view] || "Ana Sayfa";
  if (view === "dashboard") $("viewTitle").textContent = activeWorkspace === "personal" ? (personalState.settings.areaTitle || "Kişisel Alan") : "Ana Sayfa";
  renderWorkspaceChrome();
  renderSimplifiedViewMode();
}

function setupWeekdayPicker() {
  $("weeklyOptions").innerHTML = WEEKDAY_SHORT.map((day, index) => `
    <label><input type="checkbox" value="${index}" /> ${day}</label>
  `).join("");
}

function renderAll() {
  renderFilterOptions();
  renderDashboard();
  renderTaskTable();
  renderCalendar();
  renderHolidays();
  renderReportSummary();
  renderSettings();
  renderPeople();
  renderTemplates();
  renderPaperwork();
  renderAdvancedReports();
  renderAudit();
  renderClosingChecklist();
  renderPersonalGate();
  renderNotes();
  renderPersonalArea();
  renderWorkspaceChrome();
  renderTypographyEditors();
}

function renderFilterOptions() {
  if (!$("categoryFilter")) return;
  const categoryOptions = ['<option value="all">Tüm kategoriler</option>', ...state.categories.map((category) => `<option value="${escapeAttr(category)}">${escapeHtml(category)}</option>`)];
  const personOptions = ['<option value="all">Tüm sorumlular</option>', '<option value="">Sorumlu yok</option>', ...state.people.map((person) => `<option value="${person.id}">${escapeHtml(person.name)}</option>`)];
  setOptions("categoryFilter", categoryOptions);
  setOptions("assigneeFilter", personOptions);
  setOptions("taskCategory", state.categories.map((category) => `<option value="${escapeAttr(category)}">${escapeHtml(category)}</option>`));
  setOptions("taskAssignee", ['<option value="">Sorumlu yok</option>', ...state.people.map((person) => `<option value="${person.id}">${escapeHtml(person.name)}</option>`)]);
  setOptions("shiftPerson", [
    `<option value="">${state.people.length ? "Personel seç" : "Önce personel ekle"}</option>`,
    ...state.people.map((person) => `<option value="${person.id}">${escapeHtml(person.name)}</option>`)
  ]);
  if ($("shiftPerson")) $("shiftPerson").disabled = state.people.length === 0;
}

function setOptions(id, options) {
  const element = $(id);
  if (!element) return;
  const current = element.value;
  element.innerHTML = options.join("");
  if ([...element.options].some((option) => option.value === current)) element.value = current;
}

function openGlobalSearchDialog() {
  if (activeWorkspace === "personal" && personalLocked()) {
    renderPersonalGate();
    return alert("Arama yapmak için kişisel alanın kilidini aç.");
  }
  globalSearchType = "all";
  $("globalSearchInput").value = "";
  renderGlobalSearch();
  $("globalSearchDialog").showModal();
  setTimeout(() => $("globalSearchInput")?.focus(), 50);
}

function renderGlobalSearch() {
  if (!$("globalSearchResults")) return;
  document.querySelectorAll("[data-global-search-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.globalSearchType === globalSearchType);
  });
  const query = $("globalSearchInput")?.value || "";
  const needle = normalizeSearchText(query);
  const sourceRows = globalSearchRows().filter((row) => globalSearchType === "all" || row.type === globalSearchType);
  const rows = sourceRows.filter((row) => !needle || normalizeSearchText(row.searchText).includes(needle)).slice(0, 80);
  $("globalSearchSummary").textContent = query.trim() ? `${rows.length} sonuç gösteriliyor` : `${sourceRows.length} kayıt içinde ara`;
  $("globalSearchResults").innerHTML = rows.map(renderGlobalSearchRow).join("") || empty("Sonuç bulunamadı.");
}

function globalSearchRows() {
  const rows = [];
  const workspaceLabel = activeWorkspace === "personal" ? "Kişisel" : "Ortak";

  state.tasks.forEach((task) => {
    const date = task.specificDate || task.createdAt?.slice(0, 10) || activeDate;
    rows.push({
      type: "task",
      id: task.id,
      date,
      badge: "Görev",
      title: task.title,
      meta: `${workspaceLabel} alan · ${frequencyLabel(task)} · ${task.category || "Kategori yok"} · ${personName(task.assigneeId)}`,
      detail: task.description || priorityText(task.priority),
      searchText: [
        task.title,
        task.description,
        task.category,
        personName(task.assigneeId),
        priorityText(task.priority),
        frequencyLabel(task),
        ...(task.attachments || []).map((file) => file.name)
      ].join(" ")
    });
  });

  activeNotes().forEach((note) => {
    rows.push({
      type: "note",
      id: note.id,
      badge: "Not",
      title: note.title || "Başlıksız not",
      meta: `${workspaceLabel} alan · ${note.category || "Genel"} · ${new Date(note.updatedAt || note.createdAt).toLocaleString("tr-TR")}`,
      detail: note.body,
      searchText: [note.title, note.body, note.category].join(" ")
    });
  });

  paperworkItems().forEach((item) => {
    rows.push({
      type: "paperwork",
      id: item.id,
      month: currentPaperworkMonth(),
      badge: "Evrak",
      title: item.title,
      meta: `${workspaceLabel} alan · ${item.category || "Kategori yok"} · Son gün ${item.dueDay || "-"}`,
      detail: item.description,
      searchText: [item.title, item.category, item.description, ...(item.steps || [])].join(" ")
    });
  });

  Object.entries(state.paperworkRecords || {}).forEach(([key, record]) => {
    const [month, itemId] = key.split("::");
    const item = state.paperworkItems.find((row) => row.id === itemId);
    if (!item || (!record?.note && !record?.status)) return;
    rows.push({
      type: "paperwork",
      id: itemId,
      month,
      badge: "Evrak",
      title: `${item.title} (${month})`,
      meta: `${workspaceLabel} alan · ${PAPERWORK_STATUS[record.status] || "Durum yok"}`,
      detail: record.note,
      searchText: [item.title, item.category, item.description, record.status, record.note].join(" ")
    });
  });

  state.people.forEach((person) => {
    rows.push({
      type: "person",
      id: person.id,
      badge: "Personel",
      title: person.name,
      meta: `${person.role || "Personel"} · ${person.phone || "Telefon yok"} · ${person.email || "E-posta yok"}`,
      detail: [person.certificate, person.certificateDate, person.note].filter(Boolean).join(" · "),
      searchText: [person.name, person.role, person.tc, person.phone, person.email, person.certificate, person.certificateDate, person.note].join(" ")
    });
  });

  state.dispatches.forEach((dispatch) => {
    rows.push({
      type: "dispatch",
      id: dispatch.id,
      month: dispatch.date?.slice(0, 7) || currentPaperworkMonth(),
      badge: "Gönderim",
      title: dispatch.subject,
      meta: `${formatDate(dispatch.date)} · ${dispatch.target} · ${dispatch.status}`,
      detail: `${dispatch.type}${dispatch.note ? ` · ${dispatch.note}` : ""}`,
      searchText: [dispatch.date, dispatch.type, dispatch.target, dispatch.subject, dispatch.status, dispatch.note].join(" ")
    });
  });

  if (activeWorkspace === "personal") {
    personalState.todos.forEach((todo) => {
      rows.push({
        type: "task",
        id: todo.id,
        date: todo.dueDate,
        personalTodo: true,
        badge: "Kişisel İş",
        title: todo.title,
        meta: `${formatDate(todo.dueDate)} · ${priorityText(todo.priority)} · ${todo.done ? "Tamamlandı" : "Açık"}`,
        detail: todo.note,
        searchText: [todo.title, todo.note, todo.dueDate, priorityText(todo.priority)].join(" ")
      });
    });
  }

  return rows.sort((a, b) => String(a.title).localeCompare(String(b.title), "tr"));
}

function renderGlobalSearchRow(row) {
  return `
    <button type="button" class="global-search-item" data-result-type="${escapeAttr(row.type)}" data-result-id="${escapeAttr(row.id)}" data-result-date="${escapeAttr(row.date || "")}" data-result-month="${escapeAttr(row.month || "")}" data-personal-todo="${row.personalTodo ? "true" : "false"}">
      <span class="badge">${escapeHtml(row.badge)}</span>
      <span class="task-title">
        <strong>${escapeHtml(row.title || "Başlıksız")}</strong>
        <small>${escapeHtml(row.meta || "")}</small>
        ${row.detail ? `<small>${escapeHtml(String(row.detail)).slice(0, 180)}</small>` : ""}
      </span>
    </button>
  `;
}

function handleGlobalSearchResultClick(event) {
  const item = event.target.closest("[data-result-type]");
  if (!item) return;
  goToGlobalSearchResult({
    type: item.dataset.resultType,
    id: item.dataset.resultId,
    date: item.dataset.resultDate,
    month: item.dataset.resultMonth,
    personalTodo: item.dataset.personalTodo === "true"
  });
}

function goToGlobalSearchResult(result) {
  $("globalSearchDialog")?.close();
  if (result.personalTodo) {
    setWorkspaceScope("personal", "dashboard");
    $("personalTodoDate").value = result.date || activeDate;
    renderPersonalArea();
    editPersonalTodo(result.id);
    return;
  }
  if (result.type === "task") {
    if (result.date) setActiveDate(result.date);
    setWorkspaceScope(activeWorkspace, "dashboard");
    return;
  }
  if (result.type === "note") {
    setWorkspaceScope(activeWorkspace, "notes");
    editNote(result.id);
    return;
  }
  if (result.type === "paperwork") {
    if (result.month) $("paperworkMonth").value = result.month;
    paperworkTab = "tracking";
    setWorkspaceScope(activeWorkspace, "paperwork");
    renderPaperwork();
    openPaperworkItemDialog(result.id);
    return;
  }
  if (result.type === "dispatch") {
    if (result.month) $("paperworkMonth").value = result.month;
    paperworkTab = "dispatch";
    setWorkspaceScope(activeWorkspace, "paperwork");
    renderPaperwork();
    return;
  }
  if (result.type === "person") {
    setWorkspaceScope(activeWorkspace, "people");
    editPerson(result.id);
  }
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");
}

function renderDashboard() {
  const dueToday = dueTasksFor(activeDate);
  const done = dueToday.filter((task) => isComplete(task.id, activeDate)).length;
  const completion = dueToday.length ? Math.round((done / dueToday.length) * 100) : 100;
  const overdue = overdueOccurrences();
  const dailyPanel = document.querySelector(".alerts-panel");
  if (dailyPanel) {
    dailyPanel.classList.toggle("date-today", activeDate === todayKey());
    dailyPanel.classList.toggle("date-past", activeDate < todayKey());
    dailyPanel.classList.toggle("date-future", activeDate > todayKey());
  }
  $("dailyPanelTitle").textContent = activeDate === todayKey() ? "Bugünün İşleri" : `${formatDate(activeDate)} Görevleri`;
  $("statDueToday").textContent = dueToday.length;
  $("statDueTodayNote").textContent = formatDate(activeDate);
  $("statCompletion").textContent = `${completion}%`;
  $("statOverdue").textContent = overdue.length;
  $("statTaskCount").textContent = state.tasks.filter((task) => task.active).length;
  $("todayProgressText").textContent = `${done}/${dueToday.length} tamamlandı`;
  $("todayProgressBar").style.width = `${completion}%`;
  $("alertCount").textContent = overdue.length;
  $("toggleOverdueBtn").textContent = showOverdueList ? "Gecikenleri Gizle" : "Gecikenleri Göster";
  $("completeAllOverdueBtn").disabled = overdue.length === 0;

  const dueTodaySorted = [
    ...dueToday.filter((task) => !isComplete(task.id, activeDate)),
    ...dueToday.filter((task) => isComplete(task.id, activeDate))
  ];
  $("todayTaskList").innerHTML = dueTodaySorted.length ? dueTodaySorted.map((task) => renderTaskOccurrence(task, activeDate)).join("") : empty("Seçili tarih için planlı görev yok.");
  $("overdueList").style.display = showOverdueList ? "grid" : "none";
  $("overdueList").innerHTML = overdue.length ? overdue.slice(0, 25).map(({ task, dateKey }) => `
    <div class="alert-item">
      <div class="task-title"><strong>${escapeHtml(task.title)}</strong><small>${formatDate(dateKey)}</small></div>
      <button onclick="setComplete('${task.id}', '${dateKey}', true)">Tamamla</button>
    </div>
  `).join("") : empty("Gecikmiş görev bulunmuyor.");
  document.querySelectorAll("[data-upcoming]").forEach((button) => {
    button.classList.toggle("active", button.dataset.upcoming === upcomingFilter);
  });
  const upcomingLabels = { daily: "Yaklaşan Günlük Görevler", weekly: "Yaklaşan Haftalık Görevler", monthly: "Yaklaşan Aylık Görevler" };
  $("upcomingTitle").textContent = upcomingLabels[upcomingFilter];
  $("upcomingTaskList").innerHTML = upcomingTasks(upcomingFilter).map(({ task, dateKey }) => `
    <div class="compact-item">
      <div class="task-title"><strong>${escapeHtml(task.title)}</strong><small>${formatDate(dateKey)}</small></div>
      <span class="badge">${task.priority === "critical" ? "Kritik" : task.priority === "high" ? "Önemli" : frequencyName(task.frequency)}</span>
    </div>
  `).join("") || empty("Bu sekme için yaklaşan görev yok.");
  renderClosingChecklist();
  renderWeeklyChart();
  renderTopOverdue();
}

function renderTaskOccurrence(task, dateKey) {
  const done = isComplete(task.id, dateKey);
  const late = dateKey < todayKey() && !done;
  const completion = state.completions[completionKey(task.id, dateKey)] || {};
  const actor = completionActorText(completion);
  const draggable = "true";
  return `
    <div class="task-item ${done ? "done" : ""} ${late ? "overdue" : ""} ${task.mustDo ? "must-do" : ""}" data-task-id="${escapeAttr(task.id)}" data-date-key="${escapeAttr(dateKey)}" draggable="${draggable}" ondragstart="startTaskDrag(event, '${task.id}', '${dateKey}')" ondragover="allowTaskReorder(event)" ondrop="dropTaskOnTask(event, '${task.id}')">
      <label class="check-label">
        <input type="checkbox" ${done ? "checked" : ""} onchange="setComplete('${task.id}', '${dateKey}', this.checked)" />
        <span class="task-title">
          <strong>${task.mustDo ? '<span class="must-icon">★</span>' : ""}${done ? '<span class="done-check">✓</span>' : ""}${escapeHtml(task.title)}</strong>
          <small>${frequencyLabel(task)} · ${escapeHtml(task.category || "İdari")} · ${escapeHtml(personName(task.assigneeId))}${task.priority === "critical" ? " · Kritik" : task.priority === "high" ? " · Yüksek" : ""}</small>
          ${task.description ? `<small class="task-description-note">${escapeHtml(task.description)}</small>` : ""}
          ${actor ? `<small class="completion-actor">${escapeHtml(actor)}</small>` : ""}
        </span>
      </label>
      <button class="mobile-icon-action" data-mobile-icon="✏️" aria-label="Düzenle" onclick="openTaskDialog('${task.id}')">✏️</button>
    </div>
  `;
}

function renderTaskTable() {
  const search = ($("taskSearch")?.value || "").toLocaleLowerCase("tr");
  const filter = $("frequencyFilter")?.value || "all";
  const category = $("categoryFilter")?.value || "all";
  const assignee = $("assigneeFilter")?.value || "all";
  const priority = $("priorityFilter")?.value || "all";
  const status = $("statusFilter")?.value || "all";
  const tasks = state.tasks.filter((task) => {
    const matchesSearch = task.title.toLocaleLowerCase("tr").includes(search);
    const matchesFilter = filter === "all" || task.frequency === filter;
    const matchesCategory = category === "all" || task.category === category;
    const matchesAssignee = assignee === "all" || task.assigneeId === assignee;
    const matchesPriority = priority === "all" || task.priority === priority;
    const matchesStatus = status === "all" || (status === "active" && task.active) || (status === "passive" && !task.active) || (status === "must" && task.mustDo);
    return matchesSearch && matchesFilter && matchesCategory && matchesAssignee && matchesPriority && matchesStatus;
  }).sort(compareTasks);
  $("taskTableBody").innerHTML = tasks.map((task, index) => `
    <tr>
      <td class="task-index">${index + 1}</td>
      <td><strong>${escapeHtml(task.title)}</strong>${task.description ? `<br><small>${escapeHtml(task.description)}</small>` : ""}</td>
      <td><span class="badge">${escapeHtml(task.category || "İdari")}</span></td>
      <td>${escapeHtml(personName(task.assigneeId))}</td>
      <td>${frequencyName(task.frequency)}</td>
      <td>${frequencyLabel(task)}</td>
      <td>${task.active ? '<span class="badge">Aktif</span>' : '<span class="badge danger">Pasif</span>'} ${task.mustDo ? '<span class="badge warning">Mutlaka</span>' : ""} ${priorityBadge(task.priority)}</td>
      <td><button class="mobile-icon-action" data-mobile-icon="✏️" aria-label="Düzenle" onclick="openTaskDialog('${task.id}')">✏️</button></td>
    </tr>
  `).join("") || `<tr><td colspan="8">${empty("Kayıt bulunamadı.")}</td></tr>`;
}

function filteredTasks() {
  const search = ($("taskSearch")?.value || "").toLocaleLowerCase("tr");
  const filter = $("frequencyFilter")?.value || "all";
  const category = $("categoryFilter")?.value || "all";
  const assignee = $("assigneeFilter")?.value || "all";
  const priority = $("priorityFilter")?.value || "all";
  const status = $("statusFilter")?.value || "all";
  return state.tasks.filter((task) => {
    const matchesSearch = task.title.toLocaleLowerCase("tr").includes(search);
    const matchesFilter = filter === "all" || task.frequency === filter;
    const matchesCategory = category === "all" || task.category === category;
    const matchesAssignee = assignee === "all" || task.assigneeId === assignee;
    const matchesPriority = priority === "all" || task.priority === priority;
    const matchesStatus = status === "all" || (status === "active" && task.active) || (status === "passive" && !task.active) || (status === "must" && task.mustDo);
    return matchesSearch && matchesFilter && matchesCategory && matchesAssignee && matchesPriority && matchesStatus;
  }).sort(compareTasks);
}

function personName(id) {
  return state.people.find((person) => person.id === id)?.name || "Sorumlu yok";
}

function priorityBadge(priority) {
  const label = { low: "Düşük", normal: "Normal", high: "Yüksek", critical: "Kritik" }[priority] || "Normal";
  const cls = priority === "critical" ? "danger" : priority === "high" ? "warning" : "";
  return `<span class="badge ${cls}">${label}</span>`;
}

function renderCalendar() {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  $("calendarMonthLabel").textContent = `${MONTHS[month]} ${year}`;
  const first = new Date(year, month, 1);
  const gridStart = addDays(first, -((first.getDay() + 6) % 7));
  const overdue = new Set(overdueOccurrences().map((item) => item.dateKey));
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const date = addDays(gridStart, i);
    const key = toKey(date);
    const due = dueTasksFor(key);
    cells.push(`
      <button type="button" class="calendar-cell ${date.getMonth() !== month ? "muted-day" : ""} ${key === todayKey() ? "today" : ""} ${overdue.has(key) ? "has-overdue" : ""}" data-date="${key}" onclick="openDayDialog('${key}')">
        <div class="day-num"><span>${date.getDate()}</span><small>${isHoliday(key) ? "Tatil" : ""}</small></div>
        ${due.slice(0, 4).map((task) => `<span class="calendar-pill ${isComplete(task.id, key) ? "done" : ""} ${key < todayKey() && !isComplete(task.id, key) ? "overdue" : ""}">${escapeHtml(task.title)}</span>`).join("")}
        ${due.length > 4 ? `<span class="calendar-pill">+${due.length - 4} görev</span>` : ""}
      </button>
    `);
  }
  $("calendarGrid").innerHTML = cells.join("");
  document.querySelectorAll(".calendar-cell").forEach((cell) => {
    cell.addEventListener("dragover", (event) => event.preventDefault());
    cell.addEventListener("drop", dropTaskOnDay);
  });
}

function renderHolidays() {
  $("holidayList").innerHTML = state.holidays
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((holiday) => `
      <div class="compact-item">
        <div class="task-title"><strong>${escapeHtml(holiday.name)}</strong><small>${formatDate(holiday.date)}</small></div>
      <button class="mobile-icon-action" data-mobile-icon="🗑️" aria-label="Sil" onclick="removeHoliday('${holiday.date}', '${escapeAttr(holiday.name)}')">🗑️</button>
      </div>
    `).join("") || empty("Kayıtlı resmi tatil yok.");
}

function renderPeople() {
  if (!$("peopleList")) return;
  $("peopleList").innerHTML = state.people.map((person) => `
    <div class="person-card">
      <div class="person-card-head">
        <div class="task-title">
          <strong>${escapeHtml(person.name)}</strong>
          <small>${escapeHtml(person.role || "Personel")}</small>
        </div>
        <div class="button-row">
          <button class="mobile-icon-action" data-mobile-icon="✏️" aria-label="Düzenle" onclick="editPerson('${person.id}')">✏️</button>
          <button class="mobile-icon-action" data-mobile-icon="🗑️" aria-label="Sil" onclick="removePerson('${person.id}')">🗑️</button>
        </div>
      </div>
      <div class="person-meta">
        <span>TC: ${escapeHtml(person.tc || "-")}</span>
        <span>Tel: ${escapeHtml(person.phone || "-")}</span>
        <span>Mail: ${person.email ? `<a href="mailto:${escapeAttr(person.email)}">${escapeHtml(person.email)}</a>` : "-"}</span>
        <span>Sertifika: ${escapeHtml(person.certificate || "-")}</span>
        <span>Geçerlilik: ${person.certificateDate ? formatDate(person.certificateDate) : "-"}</span>
      </div>
      ${person.note ? `<p class="muted person-note">${escapeHtml(person.note)}</p>` : ""}
    </div>
  `).join("") || empty("Personel kaydı yok.");
  $("shiftList").innerHTML = state.shifts.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).map((shift) => `
    <div class="compact-item">
      <div class="task-title"><strong>${escapeHtml(personName(shift.personId))}</strong><small>${formatDate(shift.date)} · ${escapeHtml(shift.note)}</small></div>
      <button class="mobile-icon-action" data-mobile-icon="🗑️" aria-label="Sil" onclick="removeShift('${shift.id}')">🗑️</button>
    </div>
  `).join("") || empty("Vardiya/nöbet kaydı yok.");
}

function renderTemplates() {
  if (!$("categoryList")) return;
  $("categoryList").innerHTML = state.categories.map((category) => `
    <div class="compact-item">
      <strong>${escapeHtml(category)}</strong>
      <button class="mobile-icon-action" data-mobile-icon="🗑️" aria-label="Sil" onclick="removeCategory('${escapeAttr(category)}')">🗑️</button>
    </div>
  `).join("");
}

function renderClosingChecklist() {
  if (!$("closingChecklist")) return;
  const key = activeDate;
  const done = state.closing[key] || {};
  $("closingChecklist").innerHTML = DEFAULT_CLOSING.map((item, index) => `
    <label class="task-item ${done[index] ? "done" : ""}">
      <span class="check-label"><input type="checkbox" ${done[index] ? "checked" : ""} onchange="toggleClosingItem('${key}', ${index}, this.checked)" /> <span>${escapeHtml(item)}</span></span>
    </label>
  `).join("");
}

function renderWeeklyChart() {
  if (!$("weeklyChart")) return;
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const key = toKey(addDays(parseDate(activeDate), -i));
    const due = dueTasksFor(key);
    const done = due.filter((task) => isComplete(task.id, key)).length;
    const pct = due.length ? Math.round((done / due.length) * 100) : 100;
    days.push({ key, pct, label: WEEKDAY_SHORT[parseDate(key).getDay()] });
  }
  const avg = Math.round(days.reduce((sum, item) => sum + item.pct, 0) / days.length);
  $("trendSummary").textContent = `Ortalama ${avg}%`;
  $("weeklyChart").innerHTML = days.map((item) => `
    <div class="bar-item">
      <div class="bar-track"><span style="height:${item.pct}%"></span></div>
      <small>${item.label}</small>
      <strong>${item.pct}%</strong>
    </div>
  `).join("");
}

function renderTopOverdue() {
  if (!$("topOverdueList")) return;
  const counts = new Map();
  overdueOccurrences().forEach(({ task }) => counts.set(task.title, (counts.get(task.title) || 0) + 1));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  $("topOverdueList").innerHTML = top.map(([title, count]) => `
    <div class="compact-item"><strong>${escapeHtml(title)}</strong><span class="badge danger">${count}</span></div>
  `).join("") || empty("Gecikme yok.");
}

function renderAdvancedReports() {
  if (!$("advancedReports")) return;
  const rows = reportRows();
  const byCategory = groupCount(rows, "category");
  const byAssignee = groupCount(rows, "assignee");
  const overdue = overdueOccurrences();
  $("advancedReports").innerHTML = [
    reportBox("Kategori Dağılımı", byCategory),
    reportBox("Sorumlu Dağılımı", byAssignee),
    reportBox("Gecikme Özeti", overdue.slice(0, 8).map((item) => [item.task.title, item.dateKey]))
  ].join("");
}

function groupCount(rows, key) {
  const map = new Map();
  rows.forEach((row) => map.set(row[key], (map.get(row[key]) || 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function reportBox(title, rows) {
  return `<div class="summary-box"><h2>${escapeHtml(title)}</h2>${rows.length ? rows.map(([name, value]) => `<div class="mini-row"><span>${escapeHtml(name || "Yok")}</span><strong>${escapeHtml(value)}</strong></div>`).join("") : empty("Kayıt yok.")}</div>`;
}

function renderAudit() {
  if (!$("auditList")) return;
  $("auditList").innerHTML = state.audit.slice(0, 12).map((item) => `
    <div class="compact-item">
      <div class="task-title"><strong>${escapeHtml(item.action)}</strong><small>${new Date(item.at).toLocaleString("tr-TR")} · ${escapeHtml(item.actorEmail || "Eski kayıt")} · ${escapeHtml(item.details || "")}</small></div>
    </div>
  `).join("") || empty("Denetim kaydı yok.");
}

function openAuditLogDialog() {
  if (firebaseConfig().enabled && firebaseSync.workspaceRole !== "admin") return alert("Log kaydını yalnızca admin rolündeki kullanıcılar görebilir.");
  const end = todayKey();
  const start = toKey(addDays(parseDate(end), -7));
  $("auditLogStart").value = $("auditLogStart").value || start;
  $("auditLogEnd").value = $("auditLogEnd").value || end;
  renderAuditLogRange();
  $("auditLogDialog").showModal();
}

function auditRowsInRange(start, end) {
  const startDate = start || "0000-01-01";
  const endDate = end || "9999-12-31";
  return (state.audit || []).filter((item) => {
    const key = (item.at || "").slice(0, 10);
    return key >= startDate && key <= endDate;
  });
}

function renderAuditLogRange() {
  const start = $("auditLogStart").value || todayKey();
  const end = $("auditLogEnd").value || start;
  if (start > end) {
    $("auditLogResults").innerHTML = empty("Başlangıç tarihi bitişten sonra olamaz.");
    $("auditLogSummary").textContent = "";
    return;
  }
  const rows = auditRowsInRange(start, end);
  $("auditLogSummary").textContent = `${formatDate(start)} - ${formatDate(end)} · ${rows.length} kayıt`;
  $("auditLogResults").innerHTML = rows.map((item) => `
    <div class="compact-item audit-log-item">
      <div class="task-title">
        <strong>${escapeHtml(item.action)}</strong>
        <small>${new Date(item.at).toLocaleString("tr-TR")} · ${escapeHtml(item.actorEmail || "Eski kayıt")}</small>
        ${item.details ? `<small>${escapeHtml(item.details)}</small>` : ""}
      </div>
    </div>
  `).join("") || empty("Seçilen tarih aralığında log kaydı yok.");
}

function deleteAuditLogRange() {
  if (firebaseConfig().enabled && firebaseSync.workspaceRole !== "admin") return alert("Log kaydını yalnızca admin rolündeki kullanıcılar silebilir.");
  const start = $("auditLogStart").value || todayKey();
  const end = $("auditLogEnd").value || start;
  if (start > end) return alert("Başlangıç tarihi bitişten sonra olamaz.");
  const rows = auditRowsInRange(start, end);
  if (!rows.length) return alert("Seçilen tarih aralığında silinecek log kaydı yok.");
  if (!confirm(`${formatDate(start)} - ${formatDate(end)} aralığındaki ${rows.length} log kaydı silinsin mi?`)) return;
  const removeIds = new Set(rows.map((item) => item.id));
  state.audit = (state.audit || []).filter((item) => !removeIds.has(item.id));
  audit("Log kayıtları silindi", `${start} - ${end}: ${rows.length} kayıt`);
  saveState();
  renderAudit();
  renderAuditLogRange();
}

function currentPaperworkMonth() {
  return $("paperworkMonth")?.value || todayKey().slice(0, 7);
}

function paperworkKey(month, itemId) {
  return `${month}::${itemId}`;
}

function paperworkRecord(month, item) {
  const key = paperworkKey(month, item.id);
  if (!state.paperworkRecords[key]) {
    state.paperworkRecords[key] = { status: "pending", steps: [], note: "", updatedAt: "" };
  }
  return state.paperworkRecords[key];
}

function renderPaperwork() {
  if (!$("paperworkBoard")) return;
  const month = currentPaperworkMonth();
  const records = paperworkItems().map((item) => ({ item, record: paperworkRecord(month, item) }));
  const doneCount = records.filter(({ record }) => record.status === "archived").length;
  const sentCount = records.filter(({ record }) => record.status === "sent" || record.status === "archived").length;
  const preparingCount = records.filter(({ record }) => record.status === "preparing").length;
  const progress = records.length ? Math.round((doneCount / records.length) * 100) : 100;
  $("paperworkProgressBadge").textContent = `${progress}%`;
  $("paperworkStats").innerHTML = [
    ["Evrak", records.length, "Toplam takip"],
    ["Gönderilen", sentCount, "DYS/e-posta/teslim"],
    ["Arşivlenen", doneCount, "Tam kapanan"],
    ["Hazırlanan", preparingCount, "Devam eden"]
  ].map(([label, value, note]) => `<article class="stat-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");
  $("paperworkBoard").innerHTML = records
    .filter(({ record }) => record.status !== "archived")
    .map(({ item, record }) => renderPaperworkCard(month, item, record)).join("") || empty("Bu ay takip edilecek evrak kalmadı. Arşiv sekmesini kontrol edebilirsin.");
  renderPaperworkTabs();
  renderMonthlyClosure(month);
  renderMessageTemplates();
  renderDispatchOptions();
  renderDispatches(month);
  renderPaperworkArchive(month, records);
}

function renderPaperworkTabs() {
  document.querySelectorAll("[data-paperwork-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.paperworkTab === paperworkTab);
  });
  $("paperworkTrackingPanel").classList.toggle("active", paperworkTab === "tracking");
  $("paperworkDispatchPanel").classList.toggle("active", paperworkTab === "dispatch");
  $("paperworkArchivePanel").classList.toggle("active", paperworkTab === "archive");
}

function renderPaperworkArchive(month, records = paperworkItems().map((item) => ({ item, record: paperworkRecord(month, item) }))) {
  const archived = records.filter(({ record }) => record.status === "archived");
  $("archiveCountBadge").textContent = `${archived.length} evrak`;
  $("paperworkArchiveList").innerHTML = archived.map(({ item, record }) => `
    <div class="compact-item">
      <div class="task-title">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.category)} · Arşiv tarihi: ${record.archivedAt ? new Date(record.archivedAt).toLocaleString("tr-TR") : "-"}</small>
      </div>
      <span class="badge">Arşivlendi</span>
    </div>
  `).join("") || empty("Bu ay arşivlenen evrak yok.");
}

function renderPaperworkCard(month, item, record) {
  const dueDate = monthDueDate(month, item.dueDay);
  const late = dueDate < todayKey() && record.status !== "archived";
  return `
    <article class="paperwork-card ${late ? "late" : ""}">
      <div class="paperwork-card-head">
        <div>
          <div class="paperwork-card-title-row">
            <span class="badge ${late ? "danger" : ""}">${escapeHtml(item.category)}</span>
            <span class="button-row">
              <button type="button" class="mobile-icon-action" data-mobile-icon="✏️" aria-label="Düzenle" onclick="openPaperworkItemDialog('${item.id}')">✏️</button>
            </span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="muted">${escapeHtml(item.description)}</p>
        </div>
        <div class="paperwork-due">
          <small>Son tarih</small>
          <strong>${formatDate(dueDate)}</strong>
        </div>
      </div>
      <div class="paperwork-status">
        ${Object.entries(PAPERWORK_STATUS).map(([value, label]) => `<button type="button" class="status-chip ${record.status === value ? "active" : ""}" onclick="updatePaperworkStatus('${month}', '${item.id}', '${value}')">${label}</button>`).join("")}
      </div>
      <div class="paperwork-steps">
        ${item.steps.map((step, index) => `
          <label class="check-label ${record.steps?.[index] ? "done-step" : ""}">
            <input type="checkbox" ${record.steps?.[index] ? "checked" : ""} onchange="togglePaperworkStep('${month}', '${item.id}', ${index}, this.checked)" />
            <span>${escapeHtml(step)}</span>
          </label>
        `).join("")}
      </div>
      <textarea rows="2" placeholder="Not / eksik / takip bilgisi" onchange="updatePaperworkNote('${month}', '${item.id}', this.value)">${escapeHtml(record.note || "")}</textarea>
    </article>
  `;
}

function paperworkItems() {
  return [...state.paperworkItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title, "tr"));
}

function monthDueDate(month, dueDay) {
  const [year, monthNumber] = month.split("-").map(Number);
  const maxDay = daysInMonth(year, monthNumber - 1);
  const date = new Date(year, monthNumber - 1, Math.min(dueDay, maxDay));
  return toKey(previousBusinessDay(date));
}

function openPaperworkItemDialog(itemId = "") {
  const item = state.paperworkItems.find((entry) => entry.id === itemId);
  paperworkStepDraft = [...(item?.steps || ["Hazırlandı"])];
  $("paperworkItemDialogTitle").textContent = item ? "Evrakı Düzenle" : "Evrak Ekle";
  $("paperworkItemId").value = item?.id || "";
  $("paperworkItemTitle").value = item?.title || "";
  $("paperworkItemCategory").value = item?.category || "İdari";
  $("paperworkItemDueDay").value = item?.dueDay || 21;
  $("paperworkItemDescription").value = item?.description || "";
  $("deletePaperworkItemBtn").style.visibility = item ? "visible" : "hidden";
  renderPaperworkStepEditor();
  $("paperworkItemDialog").showModal();
}

function renderPaperworkStepEditor() {
  $("paperworkStepEditor").innerHTML = paperworkStepDraft.map((step, index) => `
    <div class="inline-fields paperwork-step-row">
      <input type="text" value="${escapeHtml(step)}" onchange="updatePaperworkStepDraft(${index}, this.value)" placeholder="Alt görev" />
      <button type="button" class="danger-btn mobile-icon-action" data-mobile-icon="🗑️" aria-label="Sil" onclick="removePaperworkStepDraft(${index})">🗑️</button>
    </div>
  `).join("") || empty("Henüz alt görev yok.");
}

function addPaperworkStepDraft() {
  paperworkStepDraft.push("");
  renderPaperworkStepEditor();
}

function updatePaperworkStepDraft(index, value) {
  paperworkStepDraft[index] = value.trim();
}

function removePaperworkStepDraft(index) {
  paperworkStepDraft.splice(index, 1);
  renderPaperworkStepEditor();
}

function savePaperworkItemFromDialog(event) {
  event.preventDefault();
  paperworkStepDraft = [...document.querySelectorAll("#paperworkStepEditor input")].map((input) => input.value.trim());
  const id = $("paperworkItemId").value || cryptoId();
  const existingIndex = state.paperworkItems.findIndex((item) => item.id === id);
  const existing = existingIndex >= 0 ? state.paperworkItems[existingIndex] : null;
  const item = normalizePaperworkItem({
    ...(existing || {}),
    id,
    title: $("paperworkItemTitle").value.trim(),
    category: $("paperworkItemCategory").value.trim() || "İdari",
    dueDay: Number($("paperworkItemDueDay").value) || 21,
    description: $("paperworkItemDescription").value.trim(),
    steps: paperworkStepDraft.map((step) => step.trim()).filter(Boolean),
    order: existing ? existing.order : nextPaperworkOrder()
  });
  if (!item.title) return alert("Evrak adı gerekli.");
  if (existingIndex >= 0) state.paperworkItems[existingIndex] = item;
  else state.paperworkItems.push(item);
  audit(existingIndex >= 0 ? "Evrak görevi düzenlendi" : "Evrak görevi eklendi", item.title);
  saveState();
  $("paperworkItemDialog").close();
  renderPaperwork();
}

function deletePaperworkItemFromDialog() {
  const itemId = $("paperworkItemId").value;
  const item = state.paperworkItems.find((entry) => entry.id === itemId);
  if (!item || !confirm(`"${item.title}" evrak görevi silinsin mi? Bu aya ait durum/not kayıtları da kaldırılır.`)) return;
  state.paperworkItems = state.paperworkItems.filter((entry) => entry.id !== itemId);
  Object.keys(state.paperworkRecords).forEach((key) => {
    if (key.endsWith(`::${itemId}`)) delete state.paperworkRecords[key];
  });
  audit("Evrak görevi silindi", item.title);
  saveState();
  $("paperworkItemDialog").close();
  renderPaperwork();
}

function nextPaperworkOrder() {
  return state.paperworkItems.length ? Math.max(...state.paperworkItems.map((item) => item.order ?? 0)) + 1 : 0;
}

function updatePaperworkStatus(month, itemId, status) {
  const item = state.paperworkItems.find((entry) => entry.id === itemId);
  const record = paperworkRecord(month, item);
  if (status === "archived" && record.status !== "archived") {
    if (!confirm(`"${item?.title || "Evrak"}" arşivlensin mi? Bu ay arşive taşınır ve sonraki ay için görev oluşturulur.`)) return;
    record.archivedAt = new Date().toISOString();
    createNextMonthPaperworkTask(month, item);
  }
  record.status = status;
  record.updatedAt = new Date().toISOString();
  audit("Evrak durumu güncellendi", `${item?.title || itemId}: ${PAPERWORK_STATUS[status]}`);
  saveState();
  renderPaperwork();
}

function createNextMonthPaperworkTask(month, item) {
  if (!item) return;
  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonthDate = new Date(year, monthNumber, 1);
  const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const date = monthDueDate(nextMonth, item.dueDay);
  const exists = state.tasks.some((task) => task.title === item.title && task.specificDate === date);
  if (exists) return;
  state.tasks.push({
    ...taskTemplate(item.title, "specific", { specificDate: date, category: item.category, priority: "high", mustDo: true }),
    description: item.description,
    specificDate: date,
    order: nextTaskOrder()
  });
}

function togglePaperworkStep(month, itemId, index, checked) {
  const item = state.paperworkItems.find((entry) => entry.id === itemId);
  const record = paperworkRecord(month, item);
  record.steps = record.steps || [];
  record.steps[index] = checked;
  if (record.steps.filter(Boolean).length && record.status === "pending") record.status = "preparing";
  if (item && record.steps.filter(Boolean).length === item.steps.length && record.status !== "archived") record.status = "sent";
  record.updatedAt = new Date().toISOString();
  saveState();
  renderPaperwork();
}

function updatePaperworkNote(month, itemId, note) {
  const item = state.paperworkItems.find((entry) => entry.id === itemId);
  const record = paperworkRecord(month, item);
  record.note = note.trim();
  record.updatedAt = new Date().toISOString();
  saveState();
}

function renderMonthlyClosure(month) {
  const done = state.monthlyClosure[month] || [];
  const complete = DEFAULT_MONTHLY_CLOSURE.length && done.filter(Boolean).length === DEFAULT_MONTHLY_CLOSURE.length;
  $("monthlyClosureBadge").textContent = complete ? "Tamam" : "Eksik";
  $("monthlyClosureBadge").className = `badge ${complete ? "" : "warning"}`;
  $("monthlyClosureList").innerHTML = DEFAULT_MONTHLY_CLOSURE.map((item, index) => `
    <label class="task-item ${done[index] ? "done" : ""}">
      <span class="check-label"><input type="checkbox" ${done[index] ? "checked" : ""} onchange="toggleMonthlyClosure('${month}', ${index}, this.checked)" /> <span>${escapeHtml(item)}</span></span>
    </label>
  `).join("");
}

function toggleMonthlyClosure(month, index, checked) {
  state.monthlyClosure[month] = state.monthlyClosure[month] || [];
  state.monthlyClosure[month][index] = checked;
  saveState();
  renderMonthlyClosure(month);
}

function renderMessageTemplates() {
  $("messageTemplateList").innerHTML = state.messageTemplates.map((template) => `
    <div class="compact-item message-template">
      <div class="task-title"><strong>${escapeHtml(template.title)}</strong><small>${escapeHtml(template.text)}</small></div>
      <button type="button" onclick="copyMessageTemplate('${template.id}')">Kopyala</button>
    </div>
  `).join("");
}

async function copyMessageTemplate(id) {
  const template = state.messageTemplates.find((item) => item.id === id);
  if (!template) return;
  try {
    await navigator.clipboard.writeText(template.text);
    alert("Mesaj panoya kopyalandı.");
  } catch {
    prompt("Mesajı kopyalayabilirsin:", template.text);
  }
}

function addDispatch() {
  const date = $("dispatchDate").value || todayKey();
  const target = dispatchSelectValue("dispatchTarget", "dispatchTargetOther");
  const subject = dispatchSelectValue("dispatchSubject", "dispatchSubjectOther");
  if (!subject || !target) return alert("Gönderim kaydı için konu ve kime/nereye alanı gerekli.");
  const dispatch = normalizeDispatch({
    id: cryptoId(),
    date,
    month: date.slice(0, 7),
    type: $("dispatchType").value,
    target,
    subject,
    status: $("dispatchStatus").value,
    note: $("dispatchNote").value.trim(),
    createdAt: new Date().toISOString()
  });
  state.dispatches.unshift(dispatch);
  $("dispatchSubject").value = "";
  $("dispatchTarget").value = "";
  $("dispatchSubjectOther").value = "";
  $("dispatchTargetOther").value = "";
  $("dispatchNote").value = "";
  audit("Gönderim kaydı eklendi", `${dispatch.type}: ${dispatch.subject}`);
  saveState();
  renderPaperwork();
}

function dispatchSelectValue(selectId, otherId) {
  const selected = $(selectId).value;
  return (selected === "__other__" ? $(otherId).value : selected).trim();
}

function renderDispatchOptions() {
  setDispatchOptions("dispatchTarget", dispatchTargetOptions());
  setDispatchOptions("dispatchSubject", dispatchSubjectOptions());
  renderDispatchOtherFields();
}

function setDispatchOptions(id, options) {
  const element = $(id);
  const current = element.value;
  const unique = [...new Set(options.filter(Boolean).map((item) => item.trim()).filter(Boolean))];
  const placeholder = id === "dispatchTarget" ? "Kime / nereye gönderildi?" : "Hangi konu / evrak?";
  element.innerHTML = [
    `<option value="">${placeholder}</option>`,
    '<option value="__other__">Diğer (elle yaz)</option>',
    ...unique.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)
  ].join("");
  if ([...element.options].some((option) => option.value === current)) element.value = current;
}

function dispatchTargetOptions() {
  const taskTargets = state.tasks.flatMap((task) => inferDispatchTargets(`${task.title} ${task.description || ""}`));
  return [
    "Koordinasyon",
    "Başhekimlik",
    "Hulusi Bey",
    "Sertaç",
    "Doktorlar",
    "Eğitim Birimi",
    "Kalite Birimi",
    "Laboratuvar",
    "Ayniyat / Depo",
    "WhatsApp Grubu",
    ...state.people.map((person) => person.name),
    ...state.dispatches.map((dispatch) => dispatch.target),
    ...taskTargets
  ];
}

function dispatchSubjectOptions() {
  return [
    ...paperworkItems().map((item) => item.title),
    ...state.dispatches
      .map((dispatch) => dispatch.subject)
      .filter((subject) => state.paperworkItems.some((item) => item.title === subject))
  ];
}

function inferDispatchTargets(text) {
  const lower = text.toLocaleLowerCase("tr");
  const targets = [];
  if (lower.includes("koordinasyon")) targets.push("Koordinasyon");
  if (lower.includes("doktor")) targets.push("Doktorlar");
  if (lower.includes("hulusi")) targets.push("Hulusi Bey");
  if (lower.includes("sertaç")) targets.push("Sertaç");
  if (lower.includes("eğitim")) targets.push("Eğitim Birimi");
  if (lower.includes("laboratuvar") || lower.includes("glikometri")) targets.push("Laboratuvar");
  if (lower.includes("depo") || lower.includes("ayniyat") || lower.includes("malzeme")) targets.push("Ayniyat / Depo");
  if (lower.includes("grup")) targets.push("WhatsApp Grubu");
  if (lower.includes("başhekim")) targets.push("Başhekimlik");
  return targets;
}

function renderDispatchOtherFields() {
  toggleOtherField("dispatchTarget", "dispatchTargetOther");
  toggleOtherField("dispatchSubject", "dispatchSubjectOther");
}

function toggleOtherField(selectId, inputId) {
  const show = $(selectId).value === "__other__";
  $(inputId).style.display = show ? "block" : "none";
  if (show) $(inputId).focus();
}

function renderDispatches(month) {
  const items = state.dispatches.filter((item) => item.month === month).sort((a, b) => b.date.localeCompare(a.date));
  $("dispatchCountBadge").textContent = `${items.length} kayıt`;
  $("dispatchList").innerHTML = items.map((item) => `
    <div class="compact-item dispatch-item">
      <div class="task-title">
        <strong>${escapeHtml(item.subject)}</strong>
        <small>${formatDate(item.date)} · ${escapeHtml(item.type)} · ${escapeHtml(item.target)} · ${escapeHtml(item.status)}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</small>
      </div>
      <button type="button" class="danger-btn mobile-icon-action" data-mobile-icon="🗑️" aria-label="Sil" onclick="removeDispatch('${item.id}')">🗑️</button>
    </div>
  `).join("") || empty("Bu ay için gönderim/teslim kaydı yok.");
}

function removeDispatch(id) {
  const item = state.dispatches.find((dispatch) => dispatch.id === id);
  if (!item || !confirm("Bu gönderim kaydı silinsin mi?")) return;
  state.dispatches = state.dispatches.filter((dispatch) => dispatch.id !== id);
  audit("Gönderim kaydı silindi", item.subject);
  saveState();
  renderPaperwork();
}

function seedPaperworkTasks() {
  const month = currentPaperworkMonth();
  const known = new Set(state.tasks.map((task) => `${task.title}::${task.specificDate}`));
  const additions = paperworkItems().map((item) => {
    const date = monthDueDate(month, item.dueDay);
    return { item, date };
  }).filter(({ item, date }) => !known.has(`${item.title}::${date}`)).map(({ item, date }) => ({
    ...taskTemplate(item.title, "specific", { specificDate: date, category: item.category, priority: "high", mustDo: true }),
    description: item.description,
    specificDate: date,
    order: nextTaskOrder()
  }));
  state.tasks.push(...additions);
  audit("Aylık evrak işleri görevlere eklendi", `${month}: ${additions.length} kayıt`);
  saveState();
  renderAll();
  alert(`${additions.length} aylık evrak işi Görevler listesine eklendi.`);
}

function exportPaperworkSummary() {
  const month = currentPaperworkMonth();
  const records = paperworkItems().map((item) => ({ item, record: paperworkRecord(month, item) }));
  const dispatches = state.dispatches.filter((item) => item.month === month);
  const closure = state.monthlyClosure[month] || [];
  const lines = [
    `Evde Sağlık Aylık Evrak Özeti - ${month}`,
    `Oluşturma: ${new Date().toLocaleString("tr-TR")}`,
    "",
    "Evrak Durumları",
    ...records.map(({ item, record }) => `${item.title} | ${PAPERWORK_STATUS[record.status] || "Hazırlanacak"} | Son tarih: ${monthDueDate(month, item.dueDay)}${record.note ? ` | Not: ${record.note}` : ""}`),
    "",
    "Aylık Kapanış",
    ...DEFAULT_MONTHLY_CLOSURE.map((item, index) => `${closure[index] ? "Tamam" : "Eksik"} | ${item}`),
    "",
    "Gönderim Kayıtları",
    ...(dispatches.length ? dispatches.map((item) => `${item.date} | ${item.type} | ${item.target} | ${item.subject} | ${item.status}`) : ["Kayıt bulunamadı."])
  ];
  downloadBlob(createSimplePdf(lines), `esh-aylik-evrak-ozeti-${month}.pdf`, "application/pdf");
}

function renderReportSummary() {
  const rows = reportRows();
  const total = rows.length;
  const done = rows.filter((row) => row.status === "Tamamlandı").length;
  const missed = rows.filter((row) => row.status === "Yapılmadı").length;
  const percent = total ? Math.round((done / total) * 100) : 100;
  $("reportRangeLabel").textContent = `${$("reportStart").value || "-"} / ${$("reportEnd").value || "-"}`;
  $("reportSummary").innerHTML = [
    ["Toplam", total],
    ["Tamamlanan", done],
    ["Yapılmayan", missed],
    ["Başarı", `${percent}%`]
  ].map(([label, value]) => `<div class="summary-box"><span>${label}</span><strong>${value}</strong></div>`).join("");
}

function reportRows() {
  const start = $("reportStart").value;
  const end = $("reportEnd").value;
  if (!start || !end || start > end) return [];
  const rows = [];
  for (let cursor = parseDate(start); toKey(cursor) <= end; cursor = addDays(cursor, 1)) {
    const key = toKey(cursor);
    dueTasksFor(key).forEach((task) => {
      rows.push({
        date: key,
        day: WEEKDAYS[cursor.getDay()],
        task: task.title,
        category: task.category || "İdari",
        assignee: personName(task.assigneeId),
        frequency: frequencyName(task.frequency),
        priority: priorityText(task.priority),
        status: isComplete(task.id, key) ? "Tamamlandı" : "Yapılmadı",
        note: state.completions[completionKey(task.id, key)]?.note || "",
        delayReason: state.completions[completionKey(task.id, key)]?.delayReason || ""
      });
    });
  }
  return rows;
}

function priorityText(priority) {
  return { low: "Düşük", normal: "Normal", high: "Yüksek", critical: "Kritik" }[priority] || "Normal";
}

function frequencyName(frequency) {
  return { daily: "Hafta içi", weekly: "Haftalık", monthly: "Aylık", specific: "Belirli tarih" }[frequency] || frequency;
}

function frequencyLabel(task) {
  if (task.frequency === "daily") return "Hafta içi her gün";
  if (task.frequency === "weekly") return task.weekdays.map((day) => WEEKDAYS[day]).join(", ") || "Gün seçilmedi";
  if (task.frequency === "monthly") return `Her ayın ${task.monthDay}. günü${task.adjustBusinessDay ? " · önceki iş günü kuralı" : ""}`;
  if (task.frequency === "specific") return task.specificDate ? formatDate(task.specificDate) : "Tarih seçilmedi";
  return "";
}

function openTaskDialog(taskId = "") {
  const task = state.tasks.find((item) => item.id === taskId);
  renderFilterOptions();
  $("taskDialogTitle").textContent = task ? "Görevi Düzenle" : "Görev Ekle";
  $("taskId").value = task?.id || "";
  $("taskTitle").value = task?.title || "";
  $("taskDescription").value = task?.description || "";
  $("taskDate").value = task?.specificDate || activeDate || todayKey();
  $("taskFrequency").value = task?.frequency || "specific";
  $("taskPriority").value = task?.priority || "normal";
  $("taskCategory").value = task?.category || state.categories[0] || "İdari";
  $("taskAssignee").value = task?.assigneeId || "";
  renderRepeatRuleOptions(task?.repeatRule || "");
  $("monthDay").value = task?.monthDay || 20;
  $("adjustBusinessDay").checked = task?.adjustBusinessDay || false;
  $("specificDate").value = task?.specificDate || $("taskDate").value || activeDate;
  $("taskActive").checked = task?.active ?? true;
  $("taskMustDo").checked = task?.mustDo || false;
  $("taskAttachment").value = "";
  $("taskAttachmentPreview").innerHTML = task?.attachments?.length ? task.attachments.map((file) => `<div class="compact-item"><strong>${escapeHtml(file.name)}</strong><small>${escapeHtml(file.type || "dosya")}</small></div>`).join("") : empty("Ek dosya yok.");
  $("taskDate").onchange = () => {
    $("specificDate").value = $("taskDate").value;
  };
  document.querySelectorAll("#weeklyOptions input").forEach((input) => {
    input.checked = task?.weekdays?.includes(Number(input.value)) || false;
  });
  $("deleteTaskBtn").style.visibility = task ? "visible" : "hidden";
  renderFrequencyOptions();
  $("taskDialog").showModal();
}

function openQuickTaskDialog(taskId = "") {
  const task = state.tasks.find((item) => item.id === taskId);
  $("quickTaskDialogTitle").textContent = task ? "Hızlı Görevi Düzenle" : "Hızlı Görev Ekle";
  $("quickTaskId").value = task?.id || "";
  $("quickTaskTitle").value = task?.title || "";
  $("quickTaskNote").value = task?.description || "";
  $("quickTaskMustDo").checked = task?.mustDo || false;
  const date = task?.specificDate || activeDate || todayKey();
  setQuickTaskDateMode(date === toKey(addDays(parseDate(todayKey()), 1)) ? "tomorrow" : "today");
  $("deleteQuickTaskBtn").style.visibility = task ? "visible" : "hidden";
  $("quickTaskDialog").showModal();
}

function setQuickTaskDateMode(mode) {
  document.querySelectorAll("[data-quick-date]").forEach((button) => {
    button.classList.toggle("active", button.dataset.quickDate === mode);
  });
  $("quickTaskDialog").dataset.dateMode = mode;
}

function saveQuickTask(event) {
  event.preventDefault();
  const id = $("quickTaskId").value || cryptoId();
  const existingIndex = state.tasks.findIndex((task) => task.id === id);
  const mode = $("quickTaskDialog").dataset.dateMode || "today";
  const date = mode === "tomorrow" ? toKey(addDays(parseDate(todayKey()), 1)) : todayKey();
  const existing = existingIndex >= 0 ? state.tasks[existingIndex] : null;
  const task = {
    ...(existing || taskTemplate("", "specific")),
    id,
    title: $("quickTaskTitle").value.trim(),
    description: $("quickTaskNote").value.trim(),
    frequency: "specific",
    specificDate: date,
    category: existing?.category || "İdari",
    priority: $("quickTaskMustDo").checked ? "critical" : "normal",
    mustDo: $("quickTaskMustDo").checked,
    active: true,
    order: existing ? existing.order : nextTaskOrder(),
    createdAt: existing?.createdAt || new Date().toISOString()
  };
  if (!task.title) return;
  if (existingIndex >= 0) state.tasks[existingIndex] = task;
  else state.tasks.unshift(task);
  audit(existingIndex >= 0 ? "Hızlı görev güncellendi" : "Hızlı görev eklendi", task.title);
  saveState();
  $("quickTaskDialog").close();
  renderAll();
}

function deleteQuickTask() {
  const id = $("quickTaskId").value;
  if (!id) return;
  const task = state.tasks.find((item) => item.id === id);
  if (!confirm("Bu hızlı görev silinsin mi?")) return;
  state.tasks = state.tasks.filter((item) => item.id !== id);
  audit("Hızlı görev silindi", task?.title || id);
  saveState();
  $("quickTaskDialog").close();
  renderAll();
}

function renderFrequencyOptions() {
  const frequency = $("taskFrequency").value;
  if (frequency === "specific") $("specificDate").value = $("taskDate").value || activeDate || todayKey();
  $("weeklyOptions").style.display = frequency === "weekly" ? "grid" : "none";
  $("monthlyOptions").style.display = frequency === "monthly" ? "grid" : "none";
  $("specificOptions").style.display = frequency === "specific" ? "block" : "none";
}

function renderRepeatRuleOptions(preferred = $("taskRepeatRule").value) {
  const frequency = $("taskFrequency").value;
  const optionsByFrequency = {
    daily: [["", "Standart"]],
    specific: [["", "Standart"]],
    weekly: [["", "Standart"], ["biweekly", "İki haftada bir"]],
    monthly: [
      ["", "Standart"],
      ["lastBusinessDay", "Ayın son iş günü"],
      ["firstMonday", "Ayın ilk pazartesisi"],
      ["secondTuesday", "Ayın ikinci salısı"]
    ]
  };
  const options = optionsByFrequency[frequency] || [["", "Standart"]];
  $("taskRepeatRule").innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  $("taskRepeatRule").value = options.some(([value]) => value === preferred) ? preferred : "";
}

function saveTaskFromForm(event) {
  event.preventDefault();
  const id = $("taskId").value || cryptoId();
  const existingIndex = state.tasks.findIndex((task) => task.id === id);
  const existing = existingIndex >= 0 ? state.tasks[existingIndex] : null;
  let frequency = $("taskFrequency").value;
  const taskDate = $("taskDate").value || activeDate || todayKey();
  if (!existing && frequency === "daily" && isWeekend(parseDate(taskDate))) {
    const makeSpecific = confirm("Seçtiğin tarih hafta sonu. Hafta içi frekansı bu görevi ilk iş gününde gösterir. Bu görevi seçili tarihe özel kaydetmek ister misin?");
    if (makeSpecific) frequency = "specific";
  }
  const task = {
    id,
    title: $("taskTitle").value.trim(),
    description: $("taskDescription").value.trim(),
    frequency,
    weekdays: [...document.querySelectorAll("#weeklyOptions input:checked")].map((input) => Number(input.value)),
    monthDay: Number($("monthDay").value) || null,
    fallbackDays: existingIndex >= 0 ? state.tasks[existingIndex].fallbackDays || [] : [],
    adjustBusinessDay: $("adjustBusinessDay").checked,
    specificDate: frequency === "specific" ? ($("specificDate").value || taskDate) : taskDate,
    priority: $("taskPriority").value,
    category: $("taskCategory").value || "İdari",
    assigneeId: $("taskAssignee").value,
    repeatRule: $("taskRepeatRule").value,
    mustDo: $("taskMustDo").checked,
    attachments: existing?.attachments || [],
    active: $("taskActive").checked,
    order: existing ? existing.order : nextTaskOrder(),
    createdAt: existingIndex >= 0 ? state.tasks[existingIndex].createdAt : new Date().toISOString()
  };
  if (!task.title) return;
  const file = $("taskAttachment").files[0];
  const finish = () => {
    if (existingIndex >= 0) state.tasks[existingIndex] = task;
    else state.tasks.unshift(task);
    audit(existingIndex >= 0 ? "Görev güncellendi" : "Görev eklendi", task.title);
    saveState();
    $("taskDialog").close();
    renderAll();
  };
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      task.attachments = [...task.attachments, { id: cryptoId(), name: file.name, type: file.type, size: file.size, dataUrl: reader.result }];
      finish();
    };
    reader.readAsDataURL(file);
  } else {
    finish();
  }
}

function nextTaskOrder() {
  return state.tasks.length ? Math.max(...state.tasks.map((task) => task.order ?? 0)) + 1 : 0;
}

function deleteTaskFromForm() {
  const id = $("taskId").value;
  if (!id) return;
  if (!confirm("Bu görevi silmek istiyor musun? Geçmiş tamamlama kayıtları korunur.")) return;
  state.tasks = state.tasks.filter((task) => task.id !== id);
  audit("Görev silindi", id);
  saveState();
  $("taskDialog").close();
  renderAll();
}

function seedDefaults() {
  const known = new Set(state.tasks.map((task) => task.title));
  const additions = defaultTasks.filter((task) => !known.has(task.title)).map((task) => ({ ...task, id: cryptoId() }));
  state.tasks.push(...additions);
  saveState();
  renderAll();
  alert(`${additions.length} varsayılan görev eklendi.`);
}

function addHoliday() {
  const date = $("holidayDate").value;
  const name = $("holidayName").value.trim() || "Resmi Tatil";
  if (!date) return;
  state.holidays = state.holidays.filter((holiday) => holiday.date !== date);
  state.holidays.push({ date, name });
  $("holidayDate").value = "";
  $("holidayName").value = "";
  saveState();
  renderAll();
}

function removeHoliday(date, name) {
  state.holidays = state.holidays.filter((holiday) => !(holiday.date === date && holiday.name === name));
  saveState();
  renderAll();
}

function addPerson() {
  const name = $("personName").value.trim();
  if (!name) return;
  const tc = $("personTc").value.trim();
  const email = $("personEmail").value.trim();
  if (tc && !/^\d{11}$/.test(tc)) return alert("TC kimlik no 11 haneli olmalı.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("E-posta adresi geçerli görünmüyor.");
  const id = $("personId").value || cryptoId();
  const existingIndex = state.people.findIndex((person) => person.id === id);
  const person = {
    id,
    name,
    role: $("personRole").value.trim() || "Personel",
    tc,
    phone: $("personPhone").value.trim(),
    email,
    certificate: $("personCertificate").value.trim(),
    certificateDate: $("personCertificateDate").value,
    note: $("personNote").value.trim()
  };
  if (existingIndex >= 0) state.people[existingIndex] = person;
  else state.people.push(person);
  clearPersonForm();
  audit(existingIndex >= 0 ? "Personel güncellendi" : "Personel eklendi", name);
  saveState();
  renderAll();
}

function editPerson(id) {
  const person = state.people.find((item) => item.id === id);
  if (!person) return;
  $("personId").value = person.id;
  $("personName").value = person.name || "";
  $("personRole").value = person.role || "";
  $("personTc").value = person.tc || "";
  $("personPhone").value = person.phone || "";
  $("personEmail").value = person.email || "";
  $("personCertificate").value = person.certificate || "";
  $("personCertificateDate").value = person.certificateDate || "";
  $("personNote").value = person.note || "";
  $("addPersonBtn").textContent = "Güncelle";
  $("cancelPersonEditBtn").style.display = "inline-flex";
  $("personName").focus();
}

function clearPersonForm() {
  ["personId", "personName", "personRole", "personTc", "personPhone", "personEmail", "personCertificate", "personCertificateDate", "personNote"].forEach((id) => {
    $(id).value = "";
  });
  $("addPersonBtn").textContent = "Ekle";
  $("cancelPersonEditBtn").style.display = "none";
}

function removePerson(id) {
  const person = personName(id);
  state.people = state.people.filter((item) => item.id !== id);
  state.tasks.forEach((task) => { if (task.assigneeId === id) task.assigneeId = ""; });
  audit("Personel silindi", person);
  saveState();
  renderAll();
}

function addShift() {
  if (!state.people.length) return alert("Vardiya/nöbet kaydı için önce Personel bölümünden personel eklemelisin.");
  if (!$("shiftDate").value || !$("shiftPerson").value) return alert("Tarih ve personel seçmelisin.");
  state.shifts.push({ id: cryptoId(), date: $("shiftDate").value, personId: $("shiftPerson").value, note: $("shiftNote").value.trim() || "Nöbet" });
  $("shiftNote").value = "";
  audit("Vardiya kaydedildi", $("shiftDate").value);
  saveState();
  renderAll();
}

function removeShift(id) {
  state.shifts = state.shifts.filter((shift) => shift.id !== id);
  saveState();
  renderAll();
}

function addCategory() {
  const name = $("categoryName").value.trim();
  if (!name || state.categories.includes(name)) return;
  state.categories.push(name);
  $("categoryName").value = "";
  audit("Kategori eklendi", name);
  saveState();
  renderAll();
}

function removeCategory(name) {
  if (DEFAULT_CATEGORIES.includes(name)) return alert("Varsayılan kategori silinemez.");
  state.categories = state.categories.filter((category) => category !== name);
  state.tasks.forEach((task) => { if (task.category === name) task.category = "İdari"; });
  saveState();
  renderAll();
}

function addProfile() {
  const name = $("profileName").value.trim();
  if (!name) return;
  state.profiles.push({ id: cryptoId(), name, role: $("profileRole").value });
  $("profileName").value = "";
  audit("Profil eklendi", name);
  saveState();
  renderSettings();
}

function removeProfile(id) {
  state.profiles = state.profiles.filter((profile) => profile.id !== id);
  saveState();
  renderSettings();
}

function clearAudit() {
  if (!confirm("Denetim kaydı temizlensin mi?")) return;
  state.audit = [];
  auditRecordedSinceLastSave = true;
  saveState();
  renderAudit();
}

function toggleClosingItem(dateKey, index, checked) {
  state.closing[dateKey] = state.closing[dateKey] || {};
  state.closing[dateKey][index] = checked;
  audit("Kapanış kontrolü güncellendi", `${dateKey} - ${DEFAULT_CLOSING[index]}`);
  saveState();
  renderClosingChecklist();
}

function resetClosingChecklist() {
  delete state.closing[activeDate];
  saveState();
  renderClosingChecklist();
}

function completeAllOverdue() {
  const overdue = overdueOccurrences();
  if (!overdue.length) return;
  if (!confirm(`${overdue.length} geciken görevin tamamı tamamlandı işaretlensin mi?`)) return;
  overdue.forEach(({ task, dateKey }) => {
    state.completions[completionKey(task.id, dateKey)] = completionPayload();
  });
  audit("Geciken görevler toplu tamamlandı", `${overdue.length} görev`);
  saveState();
  renderAll();
}

function openDayDialog(dateKey) {
  $("dayDialogDate").value = dateKey;
  $("transferTargetDate").value = activeDate === dateKey ? toKey(addDays(parseDate(dateKey), 1)) : activeDate;
  $("dayDialogTitle").textContent = formatDate(dateKey);
  renderDayDialogTasks();
  $("dayDialog").showModal();
}

function renderDayDialogTasks() {
  const dateKey = $("dayDialogDate").value;
  const tasks = dueTasksFor(dateKey);
  $("dayTaskList").innerHTML = tasks.length ? tasks.map((task) => {
    const done = isComplete(task.id, dateKey);
    const completion = state.completions[completionKey(task.id, dateKey)] || {};
    return `
      <div class="task-item ${done ? "done" : ""}">
        <label class="check-label">
          <input type="checkbox" class="day-task-select" value="${task.id}" />
          <span class="task-title">
            <strong>${task.mustDo ? '<span class="must-icon">★</span>' : ""}${done ? '<span class="done-check">✓</span>' : ""}${escapeHtml(task.title)}</strong>
            <small>${frequencyLabel(task)}${done ? " · Tamamlandı" : ""}</small>
            ${done && completionActorText(completion) ? `<small class="completion-actor">${escapeHtml(completionActorText(completion))}</small>` : ""}
          </span>
        </label>
        <button type="button" onclick="setCompleteFromDayDialog('${task.id}', '${dateKey}', ${done ? "false" : "true"})">${done ? "Geri Al" : "Tamamla"}</button>
        <div class="inline-fields">
          <input type="text" placeholder="Tamamlama notu" value="${escapeAttr(completion.note || "")}" onchange="saveCompletionMeta('${task.id}', '${dateKey}', 'note', this.value)" />
          <select onchange="saveCompletionMeta('${task.id}', '${dateKey}', 'delayReason', this.value)">
            ${["", "Personel eksikliği", "Malzeme bekleniyor", "Hasta uygun değil", "Sistem/DYS aksaklığı", "Diğer"].map((reason) => `<option value="${escapeAttr(reason)}" ${completion.delayReason === reason ? "selected" : ""}>${reason || "Gecikme nedeni yok"}</option>`).join("")}
          </select>
        </div>
      </div>
    `;
  }).join("") : empty("Bu gün için planlı görev yok.");
}

function setCompleteFromDayDialog(taskId, dateKey, done) {
  const key = completionKey(taskId, dateKey);
  if (done) state.completions[key] = completionPayload();
  else delete state.completions[key];
  audit(done ? "Görev tamamlandı" : "Görev geri alındı", `${taskTitle(taskId)} - ${dateKey}`);
  saveState();
  renderAll();
  renderDayDialogTasks();
}

function saveCompletionMeta(taskId, dateKey, field, value) {
  const key = completionKey(taskId, dateKey);
  state.completions[key] = { ...(state.completions[key] || completionPayload({ completedAt: "" })), [field]: value };
  audit("Görev notu güncellendi", `${taskTitle(taskId)} - ${dateKey}`);
  saveState();
  renderReportSummary();
}

function selectAllDayTasks() {
  document.querySelectorAll(".day-task-select").forEach((input) => {
    input.checked = true;
  });
}

function completeSelectedDayTasks() {
  const dateKey = $("dayDialogDate").value;
  const selectedIds = [...document.querySelectorAll(".day-task-select:checked")].map((input) => input.value);
  if (!selectedIds.length) return alert("Tamamlanacak görev seçilmedi.");
  selectedIds.forEach((taskId) => {
    state.completions[completionKey(taskId, dateKey)] = completionPayload();
  });
  audit("Seçili gün görevleri tamamlandı", `${dateKey}: ${selectedIds.length} görev`);
  saveState();
  renderAll();
  renderDayDialogTasks();
}

function transferTasks() {
  const sourceDate = $("dayDialogDate").value;
  const targetDate = $("transferTargetDate").value;
  if (!targetDate) return alert("Hedef gün seçmelisin.");
  const sourceTasks = dueTasksFor(sourceDate);
  const selectedIds = $("transferMode").value === "all"
    ? sourceTasks.map((task) => task.id)
    : [...document.querySelectorAll(".day-task-select:checked")].map((input) => input.value);
  if (!selectedIds.length) return alert("Aktarılacak görev seçilmedi.");
  const targetTitles = new Set(dueTasksFor(targetDate).map((task) => task.title));
  const additions = sourceTasks
    .filter((task) => selectedIds.includes(task.id) && !targetTitles.has(task.title))
    .map((task) => ({
      ...task,
      id: cryptoId(),
      frequency: "specific",
      weekdays: [],
      monthDay: null,
      fallbackDays: [],
      adjustBusinessDay: false,
      specificDate: targetDate,
      order: nextTaskOrder(),
      description: task.description || `Aktarıldı: ${formatDate(sourceDate)}`,
      createdAt: new Date().toISOString()
    }));
  state.tasks.push(...additions);
  saveState();
  renderAll();
  renderDayDialogTasks();
  alert(`${additions.length} görev ${formatDate(targetDate)} gününe aktarıldı.`);
}

function startTaskDrag(event, taskId, dateKey) {
  event.dataTransfer.setData("application/json", JSON.stringify({ taskId, dateKey }));
  event.dataTransfer.effectAllowed = "move";
}

function allowTaskReorder(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function dropTaskOnTask(event, targetTaskId) {
  event.preventDefault();
  event.stopPropagation();
  const payload = JSON.parse(event.dataTransfer.getData("application/json") || "{}");
  if (!payload.taskId || payload.taskId === targetTaskId) return;
  reorderVisibleTasks(payload.taskId, targetTaskId, payload.dateKey || activeDate);
}

function touchReorderMode() {
  return Boolean(window.matchMedia?.("(pointer: coarse)")?.matches || window.matchMedia?.("(hover: none)")?.matches || navigator.maxTouchPoints);
}

function clearTaskTouchDragTimer(state = taskTouchDragState) {
  if (state?.longPressTimer) {
    clearTimeout(state.longPressTimer);
    state.longPressTimer = null;
  }
}

function taskTouchPoint(event, changed = false) {
  const touches = changed ? event.changedTouches : event.touches;
  if (!touches?.length) return null;
  if (taskTouchDragState?.touchId == null) return touches[0];
  return [...touches].find((touch) => touch.identifier === taskTouchDragState.touchId) || null;
}

function resetTaskTouchDrag(state = taskTouchDragState) {
  clearTaskTouchDragTimer(state);
  if (state?.item) {
    state.item.classList.remove("dragging");
    state.item.style.transform = "";
    state.item.style.zIndex = "";
  }
  document.body.classList.remove("task-touch-dragging");
  if (state === taskTouchDragState) taskTouchDragState = null;
}

function startTaskTouchDrag(event) {
  if (event.touches.length !== 1) return;
  if (event.target.closest("button, input, select, textarea, a")) return;
  const item = event.target.closest("#todayTaskList .task-item[data-task-id]");
  if (!item) return;
  const touch = taskTouchPoint(event);
  if (!touch) return;
  resetTaskTouchDrag();
  taskTouchDragState = {
    item,
    taskId: item.dataset.taskId,
    dateKey: item.dataset.dateKey || activeDate,
    touchId: touch.identifier,
    startX: touch.clientX,
    startY: touch.clientY,
    longPressReady: false,
    dragging: false
  };
  taskTouchDragState.longPressTimer = setTimeout(() => {
    if (!taskTouchDragState || taskTouchDragState.touchId !== touch.identifier) return;
    taskTouchDragState.longPressReady = true;
    taskTouchDragState.dragging = true;
    taskTouchDragState.scrollX = window.scrollX;
    taskTouchDragState.scrollY = window.scrollY;
    taskTouchDragState.item.classList.add("dragging");
    document.body.classList.add("task-touch-dragging");
    navigator.vibrate?.(20);
  }, TASK_TOUCH_LONG_PRESS_MS);
}

function moveTaskTouchDrag(event) {
  if (!taskTouchDragState) return;
  const touch = taskTouchPoint(event);
  if (!touch) return;
  const distance = Math.hypot(touch.clientX - taskTouchDragState.startX, touch.clientY - taskTouchDragState.startY);
  if (!taskTouchDragState.longPressReady) {
    if (distance > TASK_TOUCH_MOVE_TOLERANCE) {
      resetTaskTouchDrag();
    }
    return;
  }
  event.preventDefault();
  window.scrollTo(taskTouchDragState.scrollX || 0, taskTouchDragState.scrollY || 0);
  const offsetY = touch.clientY - taskTouchDragState.startY;
  taskTouchDragState.item.style.transform = `translate3d(0, ${offsetY}px, 0) scale(0.99)`;
  taskTouchDragState.item.style.zIndex = "20";
  const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("#todayTaskList .task-item[data-task-id]");
  taskTouchDragState.dropTargetId = target?.dataset.taskId || "";
}

function endTaskTouchDrag(event) {
  if (!taskTouchDragState) return;
  const touch = taskTouchPoint(event, true);
  if (!touch) return;
  const state = taskTouchDragState;
  const target = state.dropTargetId
    ? [...document.querySelectorAll("#todayTaskList .task-item[data-task-id]")].find((item) => item.dataset.taskId === state.dropTargetId)
    : state.dragging
    ? document.elementFromPoint(touch.clientX, touch.clientY)?.closest("#todayTaskList .task-item[data-task-id]")
    : null;
  resetTaskTouchDrag(state);
  taskTouchDragState = null;
  if (!state.dragging) return;
  event.preventDefault();
  if (target && target.dataset.taskId !== state.taskId) {
    reorderVisibleTasks(state.taskId, target.dataset.taskId, state.dateKey);
  }
}

function cancelTaskTouchDrag() {
  resetTaskTouchDrag();
}

function reorderVisibleTasks(sourceTaskId, targetTaskId, dateKey) {
  const visible = dueTasksFor(dateKey);
  const sourceIndex = visible.findIndex((task) => task.id === sourceTaskId);
  const targetIndex = visible.findIndex((task) => task.id === targetTaskId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const reordered = [...visible];
  const [source] = reordered.splice(sourceIndex, 1);
  reordered.splice(targetIndex, 0, source);
  // Global sıralama: tüm günlerde geçerli olacak şekilde order güncelle
  reordered.forEach((task, index) => {
    const realTask = state.tasks.find((item) => item.id === task.id);
    if (realTask) realTask.order = index * 10;
  });
  // Listede görünmeyen görevlerin sıralamasını koruyarak sonuna yerleştir
  const reorderedIds = new Set(reordered.map((t) => t.id));
  const hidden = state.tasks.filter((task) => !reorderedIds.has(task.id)).sort(compareTasks);
  hidden.forEach((task, index) => {
    task.order = reordered.length * 10 + index * 10;
  });
  audit("Görev sırası güncellendi", formatDate(dateKey));
  saveState();
  renderAll();
}

// Masaüstü (mouse) sürükle-bırak yönetimi
let _mouseDragSourceId = null;
let _mouseDragDateKey = null;

function onTaskListDragStart(event) {
  const item = event.target.closest(".task-item[data-task-id]");
  if (!item) return;
  _mouseDragSourceId = item.dataset.taskId;
  _mouseDragDateKey = item.dataset.dateKey || activeDate;
  item.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/json", JSON.stringify({ taskId: _mouseDragSourceId, dateKey: _mouseDragDateKey }));
}

function onTaskListDragOver(event) {
  const item = event.target.closest(".task-item[data-task-id]");
  if (!item || item.dataset.taskId === _mouseDragSourceId) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  document.querySelectorAll("#todayTaskList .task-item.drag-over").forEach((el) => el.classList.remove("drag-over"));
  item.classList.add("drag-over");
}

function onTaskListDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  document.querySelectorAll("#todayTaskList .task-item.drag-over").forEach((el) => el.classList.remove("drag-over"));
  const targetItem = event.target.closest(".task-item[data-task-id]");
  if (!targetItem || !_mouseDragSourceId || targetItem.dataset.taskId === _mouseDragSourceId) return;
  reorderVisibleTasks(_mouseDragSourceId, targetItem.dataset.taskId, _mouseDragDateKey || activeDate);
}

function onTaskListDragEnd(event) {
  document.querySelectorAll("#todayTaskList .task-item.dragging, #todayTaskList .task-item.drag-over").forEach((el) => {
    el.classList.remove("dragging");
    el.classList.remove("drag-over");
  });
  _mouseDragSourceId = null;
  _mouseDragDateKey = null;
}

function dropTaskOnDay(event) {
  event.preventDefault();
  event.stopPropagation();
  const targetDate = event.currentTarget.dataset.date;
  const payload = JSON.parse(event.dataTransfer.getData("application/json") || "{}");
  const task = state.tasks.find((item) => item.id === payload.taskId);
  if (!task || !targetDate) return;
  state.tasks.push({
    ...task,
    id: cryptoId(),
    frequency: "specific",
    weekdays: [],
    monthDay: null,
    fallbackDays: [],
    adjustBusinessDay: false,
    specificDate: targetDate,
    order: nextTaskOrder(),
    description: task.description || `Sürükle-bırak ile aktarıldı: ${payload.dateKey}`,
    createdAt: new Date().toISOString()
  });
  audit("Görev sürükle-bırak aktarıldı", `${task.title} -> ${targetDate}`);
  saveState();
  renderAll();
}

function buildTemplate() {
  const type = $("templateType").value;
  const { start, end, label } = getPrintRange("template");
  const dueText = tasksInRangeText(start, end);
  const shifts = state.shifts.filter((shift) => shift.date >= start && shift.date <= end);
  const templates = {
    daily: `GÜNLÜK ÖZET\nAralık: ${label}\n\n${dueText}`,
    puantaj: `PUANTAJ TASLAĞI\nAralık: ${label}\n\nPersonel:\n${state.people.map((p) => `- ${p.name} (${p.role})`).join("\n")}`,
    nobet: `NÖBET LİSTESİ TASLAĞI\nAralık: ${label}\n\n${shifts.map((s) => `${s.date} - ${personName(s.personId)} - ${s.note}`).join("\n") || "Kayıt yok."}`,
    koordinasyon: `KOORDİNASYON FORMU\nAralık: ${label}\n\nHazırlanacak formlar:\n- Koordinasyon formları\n- Aylık çalışma taslağı\n- Bakanlık raporlaması\n\nGörevler:\n${dueText}`,
    kalite: `KALİTE EVRAK KONTROLÜ\nAralık: ${label}\n\n- Kalite evrakları\n- Glikometri kontrol evrakı\n- Acil çantası kontrolü\n- Isı nem takibi\n\nGörevler:\n${dueText}`,
    egitim: `EĞİTİM TESLİM FORMU\nAralık: ${label}\n\n- Hizmet içi eğitim kayıtları\n- Hasta yakını eğitim kayıtları\n- Teslim alan / teslim eden\n\nGörevler:\n${dueText}`
  };
  $("templateOutput").value = templates[type] || "";
}

function printTemplate() {
  const { label } = getPrintRange("template");
  printText(`Yazdırma Aralığı: ${label}\n\n${$("templateOutput").value || "Taslak yok."}`);
}

function printText(text) {
  const isMobile = navigator.userAgent.includes("wv") || typeof window.AndroidNotifications !== "undefined" || window.innerWidth < 768;
  if (isMobile) {
    downloadBlob(createSimplePdf(text.split("\n")), "esh-yazdir.pdf", "application/pdf");
    return;
  }
  const win = window.open("", "_blank");
  if (!win) {
    downloadBlob(createSimplePdf(text.split("\n")), "esh-yazdir.pdf", "application/pdf");
    return;
  }
  win.document.write(`<pre style="font:14px Arial;white-space:pre-wrap">${escapeHtml(text)}</pre>`);
  win.document.close();
  win.print();
}

function getPrintRange(scope) {
  const startId = scope === "template" ? "templatePrintStart" : "taskPrintStart";
  const endId = scope === "template" ? "templatePrintEnd" : "taskPrintEnd";
  let start = $(startId)?.value || $("reportStart")?.value || activeDate;
  let end = $(endId)?.value || $("reportEnd")?.value || start;
  if (start > end) [start, end] = [end, start];
  return {
    start,
    end,
    label: start === end ? formatDate(start) : `${formatDate(start)} - ${formatDate(end)}`
  };
}

function tasksInRangeText(start, end) {
  const blocks = [];
  for (let cursor = parseDate(start); toKey(cursor) <= end; cursor = addDays(cursor, 1)) {
    const key = toKey(cursor);
    const rows = dueTasksFor(key);
    blocks.push(`${formatDate(key)}\n${rows.length ? rows.map((task) => `- [${isComplete(task.id, key) ? "x" : " "}] ${task.title} / ${personName(task.assigneeId)} / ${task.category || "İdari"}`).join("\n") : "- Planlı görev yok."}`);
  }
  return blocks.join("\n\n");
}

function renderPersonalGate() {
  const locked = personalState.settings.passwordEnabled && !personalUnlocked;
  if ($("personalLockedPanel")) $("personalLockedPanel").style.display = locked ? "block" : "none";
  if ($("personalContent")) $("personalContent").style.display = "none";
  if ($("personalEmailLabel")) $("personalEmailLabel").textContent = firebaseSync.user?.email ? `${firebaseSync.user.email} kişisel alanı` : "Bu cihaza özel kişisel alan";
}

function personalLocked() {
  return personalState.settings.passwordEnabled && !personalUnlocked;
}

function activeNotes() {
  return activeWorkspace === "personal" ? personalState.notes : (state.notes || []);
}

function setActiveNotes(notes) {
  if (activeWorkspace === "personal") {
    personalState.notes = notes;
    savePersonalState();
    return;
  }
  state.notes = notes;
  saveState();
}

function renderNotes() {
  if (!$("notesList")) return;
  if (activeWorkspace === "personal" && personalLocked()) {
    $("notesList").innerHTML = empty("Kişisel alan kilitli. Notları görmek için Kişisel Alan sekmesinden şifreyi gir.");
    $("noteCountBadge").textContent = "Kilitli";
    return;
  }
  const search = ($("noteSearch")?.value || "").toLocaleLowerCase("tr");
  const category = $("noteCategoryFilter")?.value || "all";
  const notes = activeNotes();
  const categories = [...new Set(notes.map((note) => note.category || "Genel"))].sort((a, b) => a.localeCompare(b, "tr"));
  setOptions("noteCategoryFilter", ['<option value="all">Tüm kategoriler</option>', ...categories.map((item) => `<option value="${escapeAttr(item)}">${escapeHtml(item)}</option>`)]);
  if ($("noteCategoryFilter")) $("noteCategoryFilter").value = categories.includes(category) ? category : "all";
  const rows = notes
    .filter((note) => {
      const haystack = `${note.title} ${note.body} ${note.category}`.toLocaleLowerCase("tr");
      return (!search || haystack.includes(search)) && (category === "all" || note.category === category);
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  $("noteCountBadge").textContent = `${notes.length} not`;
  $("notesList").innerHTML = rows.map(renderNoteCard).join("") || empty("Henüz not yok.");
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return text.replace(urlRegex, function(url) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--brand); text-decoration: underline;">${url}</a>`;
  });
}

function renderNoteCard(note) {
  return `
    <article class="note-card note-${escapeAttr(note.color)}">
      <button type="button" class="note-card-toggle" onclick="toggleNoteCard('${note.id}')">
        <div class="task-title">
          <strong>${note.pinned ? "★ " : ""}${escapeHtml(note.title || "Başlıksız not")}</strong>
          <small>${escapeHtml(note.category || "Genel")} · ${new Date(note.updatedAt).toLocaleString("tr-TR")}</small>
        </div>
        <span class="note-chevron">Aç</span>
      </button>
      <div class="note-card-body" id="noteBody-${escapeAttr(note.id)}">
        <p>${linkify(escapeHtml(note.body || "").replaceAll("\n", "<br>"))}</p>
        <div class="note-card-actions">
          <button type="button" class="danger-btn note-delete-btn" onclick="deleteNoteInline('${note.id}')">Sil</button>
          <button type="button" onclick="editNote('${note.id}')">Düzenle</button>
        </div>
      </div>
    </article>
  `;
}

function toggleNoteCard(id) {
  const body = $(`noteBody-${id}`);
  if (!body) return;
  body.classList.toggle("open");
  const card = body.closest(".note-card");
  const label = card?.querySelector(".note-chevron");
  if (label) label.textContent = body.classList.contains("open") ? "Kapat" : "Aç";
}

function clearNoteForm() {
  $("noteId").value = "";
  $("noteTitle").value = "";
  $("noteBody").value = "";
  $("noteCategory").value = "";
  $("noteColor").value = "blue";
  $("notePinned").checked = false;
}

function editNote(id) {
  if (activeWorkspace === "personal" && personalLocked()) return;
  const note = activeNotes().find((item) => item.id === id);
  if (!note) return;
  $("noteId").value = note.id;
  $("noteTitle").value = note.title;
  $("noteBody").value = note.body;
  $("noteCategory").value = note.category;
  $("noteColor").value = note.color;
  $("notePinned").checked = note.pinned;
  switchView("notes");
}

function saveNote() {
  if (activeWorkspace === "personal" && personalLocked()) return alert("Not kaydetmek için kişisel alanın kilidini aç.");
  const title = $("noteTitle").value.trim();
  const body = $("noteBody").value.trim();
  if (!title && !body) return alert("Not başlığı veya içeriği yazmalısın.");
  const id = $("noteId").value || cryptoId();
  const notes = activeNotes();
  const existing = notes.find((note) => note.id === id);
  const next = normalizeNote({
    ...existing,
    id,
    title,
    body,
    category: $("noteCategory").value.trim() || "Genel",
    color: $("noteColor").value,
    pinned: $("notePinned").checked,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  setActiveNotes(existing ? notes.map((note) => note.id === id ? next : note) : [next, ...notes]);
  clearNoteForm();
  renderNotes();
}

function deleteNoteFromForm() {
  const id = $("noteId").value;
  if (!id) return clearNoteForm();
  if (!confirm("Bu not silinsin mi?")) return;
  setActiveNotes(activeNotes().filter((note) => note.id !== id));
  clearNoteForm();
  renderNotes();
}

function deleteNoteInline(id) {
  if (!id) return;
  if (activeWorkspace === "personal" && personalLocked()) return;
  if (!confirm("Bu not silinsin mi?")) return;
  setActiveNotes(activeNotes().filter((note) => note.id !== id));
  // Eğer form'da bu not açıksa formu temizle
  if ($("noteId").value === id) clearNoteForm();
  renderNotes();
}

function renderPersonalArea() {
  if (!$("personalTodoList")) return;
  renderPersonalGate();
  $("personalAreaTitle").textContent = personalState.settings.areaTitle || "Benim Yapılacaklarım";
  if ($("personalAreaNameInput")) $("personalAreaNameInput").value = personalState.settings.areaTitle || "Benim Yapılacaklarım";
  if (!$("personalTodoDate").value) $("personalTodoDate").value = activeDate;
  if (!$("personalTodoDue").value) $("personalTodoDue").value = $("personalTodoDate").value || activeDate;
  if (personalLocked()) {
    $("personalTodoList").innerHTML = empty("Kişisel alan kilitli.");
    return;
  }
  const search = ($("personalTodoSearch")?.value || "").toLocaleLowerCase("tr");
  const filter = $("personalTodoFilter")?.value || "open";
  const selectedDate = $("personalTodoDate")?.value || todayKey();
  const rows = personalState.todos
    .filter((todo) => {
      const matchesSearch = !search || `${todo.title} ${todo.note}`.toLocaleLowerCase("tr").includes(search);
      const matchesFilter = filter === "all" || (filter === "open" && !todo.done) || (filter === "done" && todo.done) || (filter === "today" && todo.dueDate === selectedDate);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate) || priorityRank(b.priority) - priorityRank(a.priority));
  const openCount = personalState.todos.filter((todo) => !todo.done).length;
  $("personalTodoStats").textContent = `${openCount} açık`;
  $("personalTodoList").innerHTML = rows.map(renderPersonalTodo).join("") || empty("Bu filtrede kişisel iş yok.");
  renderPersonalSettings();
}

function renderPersonalTodo(todo) {
  return `
    <div class="task-item ${todo.done ? "done" : ""}">
      <label class="task-check">
        <input type="checkbox" ${todo.done ? "checked" : ""} onchange="togglePersonalTodo('${todo.id}', this.checked)" />
      </label>
      <div class="task-title">
        <strong>${escapeHtml(todo.title)}</strong>
        <small>${formatDate(todo.dueDate)} · ${priorityText(todo.priority)}${todo.note ? ` · ${escapeHtml(todo.note)}` : ""}</small>
      </div>
      <button type="button" onclick="editPersonalTodo('${todo.id}')">Düzenle</button>
    </div>
  `;
}

function priorityRank(priority) {
  return { low: 0, normal: 1, high: 2, critical: 3 }[priority] || 1;
}

function clearPersonalTodoForm() {
  $("personalTodoId").value = "";
  $("personalTodoTitle").value = "";
  $("personalTodoNote").value = "";
  $("personalTodoDue").value = $("personalTodoDate").value || activeDate;
  $("personalTodoPriority").value = "normal";
}

function editPersonalTodo(id) {
  if (personalLocked()) return;
  const todo = personalState.todos.find((item) => item.id === id);
  if (!todo) return;
  $("personalTodoId").value = todo.id;
  $("personalTodoTitle").value = todo.title;
  $("personalTodoNote").value = todo.note;
  $("personalTodoDue").value = todo.dueDate;
  $("personalTodoPriority").value = todo.priority;
}

function savePersonalTodo() {
  if (personalLocked()) return alert("Kişisel iş kaydetmek için alanın kilidini aç.");
  const title = $("personalTodoTitle").value.trim();
  if (!title) return alert("Yapılacak iş başlığı gerekli.");
  const id = $("personalTodoId").value || cryptoId();
  const existing = personalState.todos.find((todo) => todo.id === id);
  const next = normalizePersonalTodo({
    ...existing,
    id,
    title,
    note: $("personalTodoNote").value.trim(),
    dueDate: $("personalTodoDue").value || todayKey(),
    priority: $("personalTodoPriority").value,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  personalState.todos = existing ? personalState.todos.map((todo) => todo.id === id ? next : todo) : [next, ...personalState.todos];
  savePersonalState();
  clearPersonalTodoForm();
  renderPersonalArea();
}

function deletePersonalTodoFromForm() {
  const id = $("personalTodoId").value;
  if (!id) return clearPersonalTodoForm();
  if (!confirm("Bu kişisel iş silinsin mi?")) return;
  personalState.todos = personalState.todos.filter((todo) => todo.id !== id);
  savePersonalState();
  clearPersonalTodoForm();
  renderPersonalArea();
}

function togglePersonalTodo(id, done) {
  personalState.todos = personalState.todos.map((todo) => todo.id === id ? { ...todo, done, completedAt: done ? new Date().toISOString() : "", updatedAt: new Date().toISOString() } : todo);
  savePersonalState();
  renderPersonalArea();
}

async function unlockPersonalArea() {
  const password = $("personalUnlockPassword").value;
  if (!password) return;
  const hash = await hashPassword(password);
  if (hash !== personalState.settings.passwordHash) {
    $("personalUnlockMessage").textContent = "Şifre hatalı.";
    return;
  }
  personalUnlocked = true;
  $("personalUnlockPassword").value = "";
  $("personalUnlockMessage").textContent = "";
  setWorkspaceScope("personal", pendingPersonalView || "dashboard", { skipLock: true });
  renderNotes();
  renderPersonalArea();
}

function renderPersonalSettings() {
  if (!$("personalPasswordStatus")) return;
  $("personalSettingsOwner").textContent = firebaseSync.user?.email
    ? `Bu ayarlar ${firebaseSync.user.email} hesabına özel saklanır.`
    : "Firebase oturumu yoksa bu ayarlar yalnızca bu cihazda saklanır.";
  $("personalPasswordStatus").textContent = personalState.settings.passwordEnabled ? "Kişisel alan şifre koruması açık." : "Kişisel alan şifre koruması kapalı.";
  $("backupReminderStatus").textContent = activeWorkspace === "personal"
    ? "Bu ekrandaki yedekleme işlemleri kişisel alan verilerini indirir veya geri yükler."
    : $("backupReminderStatus").textContent;
  renderPasswordPanels();
  if ($("startupViewSelect")) $("startupViewSelect").value = `${personalState.settings.startupScope || "common"}:${personalState.settings.startupView || "dashboard"}`;
  renderColorPicker();
  renderThemeModeButtons();
}

function savePersonalAreaName() {
  const title = $("personalAreaNameInput").value.trim() || "Benim Yapılacaklarım";
  personalState.settings.areaTitle = title;
  savePersonalState();
  renderPersonalArea();
}

function saveStartupViewPreference() {
  const [scope, view] = ($("startupViewSelect").value || "common:dashboard").split(":");
  personalState.settings.startupScope = ["common", "personal"].includes(scope) ? scope : "common";
  personalState.settings.startupView = ["dashboard", "notes", "tasks", "paperwork", "calendar", "people", "templates", "reports", "appearance", "help"].includes(view) ? view : "dashboard";
  savePersonalState();
  renderPersonalSettings();
  alert("Açılış sekmesi kaydedildi.");
}

async function savePersonalPassword() {
  const password = $("personalNewPassword").value;
  if (password.length < 4) return alert("Kişisel şifre en az 4 karakter olmalı.");
  if (personalState.settings.passwordEnabled && personalState.settings.passwordHash) {
    const current = $("personalCurrentPassword").value;
    if (!current) return alert("Kişisel şifreyi değiştirmek için mevcut şifreyi gir.");
    if (await hashPassword(current) !== personalState.settings.passwordHash) return alert("Mevcut kişisel şifre hatalı.");
  }
  personalState.settings.passwordHash = await hashPassword(password);
  personalState.settings.passwordEnabled = true;
  personalUnlocked = false;
  pendingPersonalView = "settings";
  $("personalCurrentPassword").value = "";
  $("personalNewPassword").value = "";
  savePersonalState();
  switchView("personal");
  renderPersonalGate();
  renderPersonalArea();
  alert("Kişisel alan şifresi kaydedildi.");
}

async function disablePersonalPassword() {
  if (!personalState.settings.passwordEnabled) return;
  const current = $("personalCurrentPassword").value;
  if (!current) return alert("Kişisel şifreyi kapatmak için mevcut şifreyi gir.");
  if (await hashPassword(current) !== personalState.settings.passwordHash) return alert("Mevcut kişisel şifre hatalı.");
  personalState.settings.passwordEnabled = false;
  personalState.settings.passwordHash = "";
  personalUnlocked = true;
  $("personalCurrentPassword").value = "";
  $("personalNewPassword").value = "";
  savePersonalState();
  renderPersonalArea();
}

function applyTheme() {
  const settings = activeWorkspace === "personal" ? personalThemeSettings() : commonThemeSettings();
  applyThemeSettings(settings);
  applyTypography();
}

function personalThemeSettings() {
  return {
    mode: personalState.settings.themeMode || "light",
    colorId: personalState.settings.accentColor || "teal"
  };
}

function commonThemeSettings() {
  return {
    mode: personalState.settings.commonThemeMode || "light",
    colorId: personalState.settings.commonAccentColor || "teal"
  };
}

function applyThemeSettings({ mode, colorId }) {
  const preset = COLOR_PRESETS.find((c) => c.id === colorId) || COLOR_PRESETS[0];
  document.documentElement.dataset.theme = mode;
  const isDark = mode === "dark";
  const brand = isDark ? preset.darkBrand : preset.brand;
  const brandDark = isDark ? preset.darkBrandDark : preset.brandDark;
  document.documentElement.style.setProperty("--brand", brand);
  document.documentElement.style.setProperty("--brand-dark", brandDark);
  // Cache'i yalnızca Firebase kişisel verisi yüklendikten sonra yaz
  // (varsayılan "light" ayarı cache'deki geçerli "dark" değerini ezmesin)
  try {
    const cacheReady = !firebaseSync?.ready || firebaseSync?.personalRemoteLoaded;
    if (cacheReady) {
      localStorage.setItem("esh-theme-cache", JSON.stringify({ mode, brand, brandDark }));
    }
  } catch (_) {}
}

function renderColorPicker() {
  renderScopedColorPicker("colorPickerGrid", "accentColor", () => activeWorkspace === "personal" && applyTheme());
  renderScopedColorPicker("commonColorPickerGrid", "commonAccentColor", () => activeWorkspace === "common" && applyTheme());
}

function renderScopedColorPicker(gridId, settingKey, afterSave) {
  const grid = $(gridId);
  if (!grid) return;
  const current = personalState.settings[settingKey] || "teal";
  grid.innerHTML = COLOR_PRESETS.map((preset) => `
    <button type="button" class="color-swatch ${preset.id === current ? "active" : ""}" data-color="${preset.id}" style="background: ${preset.brand}" title="${preset.label}"></button>
  `).join("");
  grid.querySelectorAll(".color-swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      personalState.settings[settingKey] = btn.dataset.color;
      savePersonalState();
      afterSave();
      renderColorPicker();
      renderThemeModeButtons();
    });
  });
}

function renderThemeModeButtons() {
  const personalMode = personalState.settings.themeMode || "light";
  if ($("personalThemeLightBtn")) $("personalThemeLightBtn").classList.toggle("active", personalMode === "light");
  if ($("personalThemeDarkBtn")) $("personalThemeDarkBtn").classList.toggle("active", personalMode === "dark");
  const commonMode = personalState.settings.commonThemeMode || "light";
  if ($("commonThemeLightBtn")) $("commonThemeLightBtn").classList.toggle("active", commonMode === "light");
  if ($("commonThemeDarkBtn")) $("commonThemeDarkBtn").classList.toggle("active", commonMode === "dark");
}

function setPersonalThemeMode(mode) {
  personalState.settings.themeMode = mode;
  savePersonalState();
  if (activeWorkspace === "personal") applyTheme();
  renderThemeModeButtons();
}

function setCommonThemeMode(mode) {
  personalState.settings.commonThemeMode = mode;
  savePersonalState();
  if (activeWorkspace === "common") applyTheme();
  renderThemeModeButtons();
}

// ── Typography (Yazı Boyutu & Renk) Sistemi ─────────────────────────────────

const TYPO_CSS_MAP = {
  taskTitle:    { size: "--typo-task-title-size",    color: "--typo-task-title-color" },
  taskSubtitle: { size: "--typo-task-subtitle-size", color: "--typo-task-subtitle-color" },
  taskNote:     { size: "--typo-task-note-size",     color: "--typo-task-note-color" },
  panelTitle:   { size: "--typo-panel-title-size",   color: "--typo-panel-title-color" },
  badge:        { size: "--typo-badge-size",          color: "--typo-badge-color" },
  noteTitle:    { size: "--typo-note-title-size",    color: "--typo-note-title-color" },
  noteSubtitle: { size: "--typo-note-subtitle-size", color: "--typo-note-subtitle-color" },
  noteBody:     { size: "--typo-note-body-size",     color: "--typo-note-body-color" }
};

function applyTypography() {
  const typo = activeWorkspace === "personal"
    ? personalState.settings.personalTypography
    : personalState.settings.commonTypography;
  const root = document.documentElement;
  for (const [key, cssVars] of Object.entries(TYPO_CSS_MAP)) {
    const val = typo?.[key] || TYPOGRAPHY_DEFAULTS[key];
    root.style.setProperty(cssVars.size, `${val.fontSize}px`);
    root.style.setProperty(cssVars.color, val.color || "");
  }
}

function renderTypographyEditors() {
  renderTypographyEditor("common", "commonTypographyEditor");
  renderTypographyEditor("personal", "personalTypographyEditor");
}

function renderTypographyEditor(scope, containerId) {
  const container = $(containerId);
  if (!container) return;
  const settingsKey = scope === "personal" ? "personalTypography" : "commonTypography";
  const typo = personalState.settings[settingsKey] || normalizeTypography();

  let html = '<div class="typo-editor">';
  for (const section of TYPOGRAPHY_FIELDS) {
    html += `<div class="typo-section-label">${section.section}</div>`;
    for (const field of section.items) {
      const val = typo[field.key] || TYPOGRAPHY_DEFAULTS[field.key];
      const hasCustomColor = Boolean(val.color);
      html += `
        <div class="typo-row">
          <span class="typo-row-label">${field.label}</span>
          <input type="number" class="typo-size-input" data-typo-key="${field.key}" data-typo-scope="${scope}" data-typo-field="fontSize" value="${val.fontSize}" min="4" max="24" step="0.5" title="Yazı boyutu (px)" />
          <input type="color" class="typo-color-input" data-typo-key="${field.key}" data-typo-scope="${scope}" data-typo-field="color" value="${hasCustomColor ? val.color : "#000000"}" title="Yazı rengi" />
          <button type="button" class="typo-color-reset" data-typo-key="${field.key}" data-typo-scope="${scope}" title="Rengi varsayılana döndür"${hasCustomColor ? "" : ' disabled'}>✕</button>
        </div>
      `;
    }
  }
  html += `
    <div class="typo-actions">
      <button type="button" data-typo-save="${scope}">Kaydet</button>
      <button type="button" data-typo-reset="${scope}">Varsayılana Dön</button>
    </div>
  </div>`;
  container.innerHTML = html;

  // Event bindings
  container.querySelectorAll(".typo-size-input").forEach((input) => {
    input.addEventListener("change", () => livePreviewTypography(scope));
  });
  container.querySelectorAll(".typo-color-input").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.typoKey;
      const resetBtn = container.querySelector(`.typo-color-reset[data-typo-key="${key}"]`);
      if (resetBtn) { resetBtn.disabled = false; delete resetBtn.dataset.typoCleared; }
      livePreviewTypography(scope);
    });
  });
  container.querySelectorAll(".typo-color-reset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.typoKey;
      const colorInput = container.querySelector(`.typo-color-input[data-typo-key="${key}"]`);
      if (colorInput) colorInput.value = "#000000";
      btn.disabled = true;
      // Mark for reset: store a data attribute
      btn.dataset.typoCleared = "true";
      livePreviewTypography(scope);
    });
  });
  container.querySelector(`[data-typo-save="${scope}"]`)?.addEventListener("click", () => saveTypography(scope));
  container.querySelector(`[data-typo-reset="${scope}"]`)?.addEventListener("click", () => resetTypography(scope));
}

function livePreviewTypography(scope) {
  const containerId = scope === "personal" ? "personalTypographyEditor" : "commonTypographyEditor";
  const container = $(containerId);
  if (!container) return;
  // Only live preview if currently on matching workspace
  if (activeWorkspace !== scope) return;
  const root = document.documentElement;
  for (const [key, cssVars] of Object.entries(TYPO_CSS_MAP)) {
    const sizeInput = container.querySelector(`.typo-size-input[data-typo-key="${key}"]`);
    const colorInput = container.querySelector(`.typo-color-input[data-typo-key="${key}"]`);
    const resetBtn = container.querySelector(`.typo-color-reset[data-typo-key="${key}"]`);
    if (sizeInput) {
      root.style.setProperty(cssVars.size, `${sizeInput.value}px`);
    }
    if (colorInput && resetBtn) {
      const cleared = resetBtn.dataset.typoCleared === "true" || resetBtn.disabled;
      root.style.setProperty(cssVars.color, cleared ? "" : colorInput.value);
    }
  }
}

function saveTypography(scope) {
  const containerId = scope === "personal" ? "personalTypographyEditor" : "commonTypographyEditor";
  const settingsKey = scope === "personal" ? "personalTypography" : "commonTypography";
  const container = $(containerId);
  if (!container) return;
  const typo = {};
  for (const key of Object.keys(TYPOGRAPHY_DEFAULTS)) {
    const sizeInput = container.querySelector(`.typo-size-input[data-typo-key="${key}"]`);
    const colorInput = container.querySelector(`.typo-color-input[data-typo-key="${key}"]`);
    const resetBtn = container.querySelector(`.typo-color-reset[data-typo-key="${key}"]`);
    const size = Number(sizeInput?.value) || TYPOGRAPHY_DEFAULTS[key].fontSize;
    const cleared = resetBtn?.dataset.typoCleared === "true" || resetBtn?.disabled;
    const color = cleared ? "" : (colorInput?.value || "");
    typo[key] = { fontSize: Math.max(4, Math.min(24, size)), color };
  }
  personalState.settings[settingsKey] = typo;
  savePersonalState();
  applyTypography();
  renderTypographyEditors();
  alert("Yazı ayarları kaydedildi.");
}

function resetTypography(scope) {
  if (!confirm("Yazı boyutu ve renk ayarları varsayılana dönecek. Emin misin?")) return;
  const settingsKey = scope === "personal" ? "personalTypography" : "commonTypography";
  personalState.settings[settingsKey] = normalizeTypography();
  savePersonalState();
  applyTypography();
  renderTypographyEditors();
}
// ─────────────────────────────────────────────────────────────────────────────

function registerServiceWorker() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

function installPwa() {
  if (!deferredInstallPrompt) return alert("Bu tarayıcıda kurulum istemi henüz hazır değil. Chrome/Edge üzerinden http://localhost ile açarsan PWA kurulumu aktif olur.");
  deferredInstallPrompt.prompt();
}

function renderPasswordPanels() {
  const commonOn = Boolean(state.settings.passwordEnabled);
  if ($("passwordStatus")) $("passwordStatus").textContent = commonOn ? "Ortak alan şifresi açık." : "Ortak alan şifresi kapalı.";
  if ($("currentPassword")) $("currentPassword").style.display = commonOn ? "" : "none";
  if ($("disablePasswordBtn")) $("disablePasswordBtn").style.display = commonOn ? "" : "none";
  if ($("savePasswordBtn")) $("savePasswordBtn").textContent = commonOn ? "Şifreyi Değiştir" : "Şifreyi Aç";
  if ($("newPassword")) $("newPassword").placeholder = commonOn ? "Yeni şifre" : "Ortak alan şifresi";
  // Ortak alan otomatik kilit satırı
  if ($("commonAutoLockRow")) $("commonAutoLockRow").style.display = commonOn ? "" : "none";
  if ($("commonAutoLockMinutes") && commonOn) {
    const saved = Number(state.settings.autoLockMinutes) || 0;
    $("commonAutoLockMinutes").value = saved || "";
  }

  const personalOn = Boolean(personalState.settings.passwordEnabled);
  if ($("personalCurrentPassword")) $("personalCurrentPassword").style.display = personalOn ? "" : "none";
  if ($("disablePersonalPasswordBtn")) $("disablePersonalPasswordBtn").style.display = personalOn ? "" : "none";
  if ($("savePersonalPasswordBtn")) $("savePersonalPasswordBtn").textContent = personalOn ? "Şifreyi Değiştir" : "Şifreyi Aç";
  if ($("personalNewPassword")) $("personalNewPassword").placeholder = personalOn ? "Yeni kişisel şifre" : "Kişisel alan şifresi";
  // Kişisel alan otomatik kilit satırı
  if ($("personalAutoLockRow")) $("personalAutoLockRow").style.display = personalOn ? "" : "none";
  if ($("personalAutoLockMinutes") && personalOn) {
    const saved = Number(personalState.settings.autoLockMinutes) || 0;
    $("personalAutoLockMinutes").value = saved || "";
  }
}

function saveCommonAutoLock() {
  const minutes = Number($("commonAutoLockMinutes")?.value) || 0;
  state.settings.autoLockMinutes = minutes;
  saveState();
  setupAutoLock();
  renderPasswordPanels();
  alert(minutes > 0 ? `Ortak alan ${minutes} dakika hareketsizlikte otomatik kilitlenecek.` : "Ortak alan otomatik kilitleme kapalı.");
}

function savePersonalAutoLock() {
  const minutes = Number($("personalAutoLockMinutes")?.value) || 0;
  personalState.settings.autoLockMinutes = minutes;
  savePersonalState();
  setupAutoLock();
  renderPasswordPanels();
  alert(minutes > 0 ? `Kişisel alan ${minutes} dakika hareketsizlikte otomatik kilitlenecek.` : "Kişisel alan otomatik kilitleme kapalı.");
}

function renderSettings() {
  if (!$("notificationToggleBtn")) return;
  const notifySettings = notificationSettings();
  if ($("userNicknameInput")) $("userNicknameInput").value = personalState.settings.nickname || "";
  if ($("userNicknameStatus")) $("userNicknameStatus").textContent = personalState.settings.nickname
    ? `Menüde "${personalState.settings.nickname}" görünüyor.`
    : "Boş bırakılırsa menüde e-posta adresin gösterilir.";
  $("notificationToggleBtn").textContent = notifySettings.notificationsEnabled ? "Bildirimleri Kapat" : "Bildirimleri Aç";
  $("compactToggleBtn").textContent = personalState.settings.compactMode ? "Standart Mobil Mod" : "Kompakt Mobil Mod";
  $("commonNotificationsEnabled").checked = notifySettings.commonNotificationsEnabled;
  $("personalNotificationsEnabled").checked = notifySettings.personalNotificationsEnabled;
  if ($("androidNotificationsRow")) $("androidNotificationsRow").hidden = !androidNotificationsAvailable();
  if ($("androidNotificationsEnabled")) $("androidNotificationsEnabled").checked = notifySettings.androidNotificationsEnabled;
  if ($("androidTestNotificationBtn")) $("androidTestNotificationBtn").hidden = !androidNotificationsAvailable();
  if ($("androidRunNotificationBtn")) $("androidRunNotificationBtn").hidden = !androidNotificationsAvailable();
  $("criticalNotifyMinutes").value = notifySettings.criticalNotifyMinutes;
  $("normalNotifyMinutes").value = notifySettings.normalNotifyMinutes;
  $("quietStart").value = notifySettings.quietStart;
  $("quietEnd").value = notifySettings.quietEnd;
  $("backupReminderDays").value = personalState.settings.backupReminderDays || 7;
  const permission = "Notification" in window ? Notification.permission : "desteklenmiyor";
  const androidStatus = androidNotificationsAvailable() ? ` Android: ${androidNotificationStatusText()}. ${androidNotificationSummaryText()}` : "";
  $("notificationStatus").textContent = notifySettings.notificationsEnabled
    ? `Bildirimler açık. Tarayıcı izni: ${permission}. Ortak: ${notifySettings.commonNotificationsEnabled ? "açık" : "kapalı"}, kişisel: ${notifySettings.personalNotificationsEnabled ? "açık" : "kapalı"}.`
    : `Bildirimler kapalı. Tarayıcı izni: ${permission}.`;
  $("notificationStatus").textContent += androidStatus;
  renderPasswordPanels();
  const lastBackup = state.settings.lastBackupAt ? new Date(state.settings.lastBackupAt).toLocaleString("tr-TR") : "Henüz yok";
  $("backupReminderStatus").textContent = `Son yedek: ${lastBackup}.`;
  renderPersonalSettings();
  renderColorPicker();
  renderThemeModeButtons();
  renderTypographyEditors();
  if ($("profileList")) {
    $("profileList").innerHTML = state.profiles.map((profile) => `
      <div class="compact-item">
        <div class="task-title"><strong>${escapeHtml(profile.name)}</strong><small>${profileRoleText(profile.role)}</small></div>
        <button class="mobile-icon-action" data-mobile-icon="🗑️" aria-label="Sil" onclick="removeProfile('${profile.id}')">🗑️</button>
      </div>
    `).join("") || empty("Profil yok.");
  }
}

function saveUserNickname() {
  personalState.settings.nickname = ($("userNicknameInput")?.value || "").trim();
  savePersonalState(true);
  renderWorkspaceChrome();
  renderSettings();
}

function profileRoleText(role) {
  return { admin: "Yönetici", staff: "Personel", viewer: "Sadece görüntüleme" }[role] || role;
}

function saveNotificationSettings() {
  personalState.settings.commonNotificationsEnabled = $("commonNotificationsEnabled").checked;
  personalState.settings.personalNotificationsEnabled = $("personalNotificationsEnabled").checked;
  personalState.settings.androidNotificationsEnabled = $("androidNotificationsEnabled")?.checked || false;
  personalState.settings.criticalNotifyMinutes = Number($("criticalNotifyMinutes").value) || 15;
  personalState.settings.normalNotifyMinutes = Number($("normalNotifyMinutes").value) || 30;
  personalState.settings.quietStart = $("quietStart").value || "22:00";
  personalState.settings.quietEnd = $("quietEnd").value || "07:00";
  personalState.settings.backupReminderDays = Number($("backupReminderDays").value) || 7;
  savePersonalState();
  setupNotifications();
  syncAndroidNotifications();
  renderSettings();
}

function applyCompactMode() {
  document.body.classList.toggle("compact-mode", Boolean(personalState.settings.compactMode));
}

function toggleCompactMode() {
  personalState.settings.compactMode = !personalState.settings.compactMode;
  savePersonalState();
  applyCompactMode();
  renderSettings();
}

async function savePassword() {
  if (firebaseConfig().enabled && firebaseSync.workspaceRole !== "admin") return alert("Ortak alan şifresini yalnızca admin değiştirebilir.");
  const password = $("newPassword").value;
  if (password.length < 4) return alert("Şifre en az 4 karakter olmalı.");
  if (state.settings.passwordEnabled && state.settings.passwordHash) {
    const current = $("currentPassword").value;
    if (!current) return alert("Şifreyi değiştirmek için mevcut şifreyi girmelisin.");
    const currentHash = await hashPassword(current);
    if (currentHash !== state.settings.passwordHash) return alert("Mevcut şifre hatalı.");
  }
  state.settings.passwordHash = await hashPassword(password);
  state.settings.passwordEnabled = true;
  commonUnlocked = false;
  $("currentPassword").value = "";
  $("newPassword").value = "";
  saveState();
  renderSettings();
  alert("Ortak alan şifresi kaydedildi.");
}

async function disablePassword() {
  if (firebaseConfig().enabled && firebaseSync.workspaceRole !== "admin") return alert("Ortak alan şifresini yalnızca admin kapatabilir.");
  if (!state.settings.passwordEnabled) return;
  const current = $("currentPassword").value;
  if (!current) return alert("Şifre korumasını kapatmak için mevcut şifreyi girmelisin.");
  const currentHash = await hashPassword(current);
  if (currentHash !== state.settings.passwordHash) return alert("Mevcut şifre hatalı.");
  if (!confirm("Şifre koruması kapatılsın mı?")) return;
  state.settings.passwordEnabled = false;
  state.settings.passwordHash = "";
  commonUnlocked = true;
  $("currentPassword").value = "";
  $("newPassword").value = "";
  saveState();
  renderSettings();
}

async function hashPassword(password) {
  if (!window.crypto || !crypto.subtle) return simpleHash(`esh-local-${password}`);
  const bytes = new TextEncoder().encode(`esh-local-${password}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function simpleHash(value) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  return `fallback-${hash >>> 0}`;
}

function setupPasswordGate() {
  if (!commonState.settings.passwordEnabled || !commonState.settings.passwordHash) return;
  openCommonPasswordDialog();
}

function openCommonPasswordDialog() {
  if ($("passwordDialogTitle")) $("passwordDialogTitle").textContent = "Ortak Alan Şifresi";
  if ($("loginMessage")) $("loginMessage").textContent = "";
  document.body.classList.add("locked");
  if (!$("passwordDialog").open) $("passwordDialog").showModal();
}

async function unlockApp() {
  const password = $("loginPassword").value;
  const hash = await hashPassword(password);
  if (hash !== commonState.settings.passwordHash) {
    $("loginMessage").textContent = "Şifre hatalı.";
    return;
  }
  commonUnlocked = true;
  $("loginPassword").value = "";
  $("loginMessage").textContent = "";
  document.body.classList.remove("locked");
  $("passwordDialog").close();
  setWorkspaceScope("common", pendingCommonView || "dashboard", { skipLock: true });
}

async function toggleNotifications() {
  if (!("Notification" in window)) return alert("Bu tarayıcı bildirimleri desteklemiyor.");
  const settings = notificationSettings();
  if (!settings.notificationsEnabled && Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      renderSettings();
      return alert("Bildirim izni verilmedi.");
    }
  }
  personalState.settings.notificationsEnabled = !settings.notificationsEnabled;
  savePersonalState();
  setupNotifications();
  syncAndroidNotifications();
  renderSettings();
}

function setupNotifications() {
  if (notificationTimer) clearInterval(notificationTimer);
  syncAndroidNotifications();
  const settings = notificationSettings();
  if (!settings.notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
  notificationTimer = setInterval(sendIncompleteTaskNotification, 60 * 1000);
  setTimeout(sendIncompleteTaskNotification, 1500);
}

function sendIncompleteTaskNotification() {
  const settings = notificationSettings();
  if (!settings.notificationsEnabled || isQuietTime(settings)) return;
  const now = Date.now();
  if (settings.commonNotificationsEnabled) sendCommonTaskNotifications(settings, now);
  if (settings.personalNotificationsEnabled) sendPersonalTodoNotifications(settings, now);
}

function notificationSettings() {
  return {
    notificationsEnabled: Boolean(personalState.settings.notificationsEnabled),
    androidNotificationsEnabled: Boolean(personalState.settings.androidNotificationsEnabled),
    commonNotificationsEnabled: Boolean(personalState.settings.commonNotificationsEnabled),
    personalNotificationsEnabled: Boolean(personalState.settings.personalNotificationsEnabled),
    normalNotifyMinutes: Number(personalState.settings.normalNotifyMinutes) || 30,
    criticalNotifyMinutes: Number(personalState.settings.criticalNotifyMinutes) || 15,
    quietStart: personalState.settings.quietStart || "22:00",
    quietEnd: personalState.settings.quietEnd || "07:00"
  };
}

function androidNotificationsAvailable() {
  return Boolean(window.AndroidNotifications?.configure);
}

function androidNotificationStatusText() {
  if (!androidNotificationsAvailable()) return "desteklenmiyor";
  try {
    const status = window.AndroidNotifications.getStatus?.() || "unknown";
    if (status === "enabled") return "açık";
    if (status === "permission-denied") return "izin bekliyor";
    if (status === "disabled") return "kapalı";
    return status;
  } catch {
    return "durum okunamadı";
  }
}

function androidNotificationSummaryText() {
  const snapshot = androidNotificationSnapshot();
  return `Bekleyen ortak: ${snapshot.commonCritical + snapshot.commonNormal}, kişisel: ${snapshot.personalCount}. Ortak bildirimleri: ${snapshot.commonEnabled ? "açık" : "kapalı"}, kişisel: ${snapshot.personalEnabled ? "açık" : "kapalı"}.`;
}

function androidNotificationSnapshot() {
  const settings = notificationSettings();
  const today = todayKey();
  const previousState = state;
  let commonRemaining = [];
  try {
    state = commonState;
    commonRemaining = dueTasksFor(today).filter((task) => !isComplete(task.id, today));
  } finally {
    state = previousState;
  }
  const commonCritical = commonRemaining.filter((task) => task.priority === "critical" || task.mustDo).length;
  const personalRemaining = (personalState.todos || []).filter((todo) => !todo.done && todo.dueDate <= today);
  return {
    enabled: Boolean(settings.androidNotificationsEnabled),
    commonEnabled: Boolean(settings.commonNotificationsEnabled),
    personalEnabled: Boolean(settings.personalNotificationsEnabled),
    criticalMinutes: Math.max(1, Number(settings.criticalNotifyMinutes) || 15),
    normalMinutes: Math.max(1, Number(settings.normalNotifyMinutes) || 30),
    quietStart: settings.quietStart,
    quietEnd: settings.quietEnd,
    commonCritical,
    commonNormal: Math.max(0, commonRemaining.length - commonCritical),
    personalCount: personalRemaining.length,
    personalOverdue: personalRemaining.filter((todo) => todo.dueDate < today).length,
    updatedAt: new Date().toISOString()
  };
}

function syncAndroidNotifications() {
  if (!androidNotificationsAvailable()) return;
  try {
    window.AndroidNotifications.configure(JSON.stringify(androidNotificationSnapshot()));
  } catch (error) {
    console.warn("Android bildirim ayarları aktarılamadı", error);
  }
}

function sendAndroidTestNotification() {
  if (!androidNotificationsAvailable()) return;
  syncAndroidNotifications();
  try {
    window.AndroidNotifications.test("ESH test bildirimi", "Android yerel bildirim sistemi çalışıyor.");
  } catch (error) {
    alert(`Android test bildirimi gönderilemedi: ${error.message}`);
  }
}

function runAndroidNotificationCheck() {
  if (!androidNotificationsAvailable()) return;
  syncAndroidNotifications();
  try {
    window.AndroidNotifications.runNow?.();
  } catch (error) {
    alert(`Android kontrolü çalıştırılamadı: ${error.message}`);
  }
}

function sendCommonTaskNotifications(settings, now) {
  const today = todayKey();
  const previousState = state;
  let remaining = [];
  try {
    state = commonState;
    remaining = dueTasksFor(today).filter((task) => !isComplete(task.id, today));
  } finally {
    state = previousState;
  }
  if (!remaining.length) return;
  const critical = remaining.filter((task) => task.priority === "critical" || task.mustDo);
  const normalCount = remaining.length - critical.length;
  if (critical.length && shouldSendNotification("commonCritical", settings.criticalNotifyMinutes, now)) {
    showPersistentNotification("Ortak alan kritik görevler bekliyor", {
      body: `Bugün tamamlanmamış ${critical.length} kritik/mutlaka görev var.`,
      tag: "esh-common-critical-tasks"
    });
  }
  if (normalCount && shouldSendNotification("commonNormal", settings.normalNotifyMinutes, now)) {
    showPersistentNotification("Ortak alan görevleri tamamlanmadı", {
      body: `Bugün tamamlanmamış ${remaining.length} ortak görev var.${critical.length ? ` Kritik: ${critical.length}` : ""}`,
      tag: "esh-common-normal-tasks"
    });
  }
}

function sendPersonalTodoNotifications(settings, now) {
  const today = todayKey();
  const remaining = (personalState.todos || []).filter((todo) => !todo.done && todo.dueDate <= today);
  if (!remaining.length || !shouldSendNotification("personal", settings.normalNotifyMinutes, now)) return;
  const overdue = remaining.filter((todo) => todo.dueDate < today).length;
  showPersistentNotification("Kişisel yapılacaklar bekliyor", {
    body: `${remaining.length} kişisel iş açık.${overdue ? ` Geciken: ${overdue}` : ""}`,
    tag: "esh-personal-todos"
  });
}

function showPersistentNotification(title, options = {}) {
  if (activeBrowserNotification) activeBrowserNotification.close();
  activeBrowserNotification = new Notification(title, {
    ...options,
    requireInteraction: true
  });
  activeBrowserNotification.addEventListener("close", () => {
    activeBrowserNotification = null;
  }, { once: true });
}

function shouldSendNotification(key, minutes, now) {
  const interval = Math.max(1, Number(minutes) || 15) * 60 * 1000;
  if (now - (notificationLastSent[key] || 0) < interval) return false;
  notificationLastSent[key] = now;
  return true;
}

function isQuietTime(settings = notificationSettings()) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = settings.quietStart.split(":").map(Number);
  const [eh, em] = settings.quietEnd.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (start === end) return false;
  return start < end ? current >= start && current < end : current >= start || current < end;
}

function backupJson() {
  if (activeWorkspace === "common" && !canWriteCommonWorkspace()) {
    alert("Ortak alan yedeğini indirmek için yönetici veya düzenleyici rolü gerekir.");
    return;
  }
  state.settings.lastBackupAt = new Date().toISOString();
  saveState();
  downloadBlob(JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2), "esh-yedek.json", "application/json");
  renderSettings();
}

async function encryptedBackup() {
  if (activeWorkspace === "common" && !canWriteCommonWorkspace()) {
    alert("Ortak alan yedeğini indirmek için yönetici veya düzenleyici rolü gerekir.");
    return;
  }
  const password = $("backupPassword").value;
  if (!password) return alert("Şifreli yedek için yedek şifresi gir.");
  state.settings.lastBackupAt = new Date().toISOString();
  saveState();
  const payload = JSON.stringify({ ...state, exportedAt: new Date().toISOString() });
  const encrypted = await encryptText(payload, password);
  downloadBlob(JSON.stringify(encrypted, null, 2), "esh-sifreli-yedek.json", "application/json");
  renderSettings();
}

async function encryptText(text, password) {
  if (window.crypto?.subtle) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const iterations = 210000;
    const key = await deriveBackupKey(password, salt, iterations);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(text)
    );
    return {
      encrypted: true,
      method: "aes-gcm-pbkdf2",
      iterations,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      data: bytesToBase64(new Uint8Array(encrypted))
    };
  }
  const key = await hashPassword(password);
  let output = "";
  for (let i = 0; i < text.length; i += 1) {
    output += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return { encrypted: true, method: "local-xor-legacy", data: btoa(unescape(encodeURIComponent(output))) };
}

async function decryptText(data, password, options = {}) {
  if (options.method === "aes-gcm-pbkdf2") {
    if (!window.crypto?.subtle) throw new Error("Bu tarayıcı AES-GCM yedek çözmeyi desteklemiyor.");
    const salt = base64ToBytes(options.salt);
    const iv = base64ToBytes(options.iv);
    const encrypted = base64ToBytes(data);
    const key = await deriveBackupKey(password, salt, Number(options.iterations) || 210000);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
    return new TextDecoder().decode(plain);
  }
  const key = await hashPassword(password);
  const raw = decodeURIComponent(escape(atob(data)));
  let output = "";
  for (let i = 0; i < raw.length; i += 1) {
    output += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return output;
}

async function deriveBackupKey(password, salt, iterations) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function restoreJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    (async () => {
    try {
      let parsed = JSON.parse(reader.result);
      if (parsed.encrypted) {
        const password = $("backupPassword").value || prompt("Şifreli yedek şifresini gir:");
        if (!password) throw new Error("Şifre girilmedi.");
        parsed = JSON.parse(await decryptText(parsed.data, password, parsed));
      }
      if (!Array.isArray(parsed.tasks)) throw new Error("Görev listesi bulunamadı.");
      const incoming = normalizeState({
        tasks: parsed.tasks,
        completions: parsed.completions || {},
        holidays: parsed.holidays || [],
        settings: { ...defaultSettings(), ...(parsed.settings || {}) },
        people: parsed.people || [],
        shifts: parsed.shifts || [],
        categories: parsed.categories || DEFAULT_CATEGORIES,
        profiles: parsed.profiles || [],
        audit: parsed.audit || [],
        closing: parsed.closing || {},
        paperworkItems: parsed.paperworkItems || DEFAULT_PAPERWORK_ITEMS,
        paperworkRecords: parsed.paperworkRecords || {},
        dispatches: parsed.dispatches || [],
        messageTemplates: parsed.messageTemplates || DEFAULT_MESSAGE_TEMPLATES,
        monthlyClosure: parsed.monthlyClosure || {},
        notes: parsed.notes || []
      });
      if (state.tasks.length && confirm("Mevcut verilerle birleştirilsin mi? İptal edersen yedek mevcut verinin yerine geçer.")) {
        const titles = new Set(state.tasks.map((task) => task.title));
        state.tasks.push(...incoming.tasks.filter((task) => !titles.has(task.title)));
        state.people.push(...incoming.people.filter((person) => !state.people.some((item) => item.name === person.name)));
        state.categories = [...new Set([...state.categories, ...incoming.categories])];
        state.holidays = [...state.holidays, ...incoming.holidays.filter((holiday) => !state.holidays.some((item) => item.date === holiday.date && item.name === holiday.name))];
        state.completions = { ...incoming.completions, ...state.completions };
        state.paperworkRecords = { ...incoming.paperworkRecords, ...state.paperworkRecords };
        state.paperworkItems = [...state.paperworkItems, ...incoming.paperworkItems.filter((item) => !state.paperworkItems.some((existing) => existing.id === item.id || existing.title === item.title))];
        state.monthlyClosure = { ...incoming.monthlyClosure, ...state.monthlyClosure };
        state.dispatches.push(...incoming.dispatches.filter((dispatch) => !state.dispatches.some((item) => item.id === dispatch.id)));
        state.messageTemplates = [...state.messageTemplates, ...incoming.messageTemplates.filter((template) => !state.messageTemplates.some((item) => item.id === template.id))];
        state.audit = [...incoming.audit, ...state.audit].slice(0, 250);
      } else {
        state = incoming;
      }
      saveState();
      applyTheme();
      renderAll();
      alert("Yedek başarıyla geri yüklendi.");
    } catch (error) {
      alert(`Geri yükleme başarısız: ${error.message}`);
    } finally {
      event.target.value = "";
    }
    })();
  };
  reader.readAsText(file);
}

function exportPdf() {
  const rows = reportRows();
  const lines = [
    "Evde Sağlık İş Akışı ve Görev Takip Sistemi",
    `Rapor: ${$("reportStart").value} - ${$("reportEnd").value}`,
    `Oluşturma: ${new Date().toLocaleString("tr-TR")}`,
    "",
    ...rows.map((row) => `${row.date} | ${row.day} | ${row.status} | ${row.category} | ${row.assignee} | ${row.task}`)
  ];
  const pdf = createSimplePdf(lines);
  downloadBlob(pdf, "esh-rapor.pdf", "application/pdf");
}

function exportXlsx() {
  const rows = reportRows();
  const table = [
    ["Tarih", "Gün", "Görev", "Kategori", "Sorumlu", "Frekans", "Önem", "Durum", "Not", "Gecikme Nedeni"],
    ...rows.map((row) => [row.date, row.day, row.task, row.category, row.assignee, row.frequency, row.priority, row.status, row.note, row.delayReason])
  ];
  const bytes = createXlsx(table);
  downloadBlob(bytes, "esh-rapor.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

function exportYearArchive() {
  const year = parseDate(activeDate).getFullYear();
  $("reportStart").value = `${year}-01-01`;
  $("reportEnd").value = `${year}-12-31`;
  renderReportSummary();
  const rows = reportRows();
  const summary = [
    `Evde Sağlık Yıl Sonu Arşivi - ${year}`,
    `Toplam kayıt: ${rows.length}`,
    `Tamamlanan: ${rows.filter((row) => row.status === "Tamamlandı").length}`,
    `Yapılmayan: ${rows.filter((row) => row.status === "Yapılmadı").length}`,
    "",
    ...rows.map((row) => `${row.date} | ${row.status} | ${row.category} | ${row.assignee} | ${row.task}`)
  ];
  downloadBlob(createSimplePdf(summary), `esh-yil-arsivi-${year}.pdf`, "application/pdf");
}

function printTodaySummary() {
  const { start, end, label } = getPrintRange("task");
  $("printRangeDialog")?.close();
  printText(`Görev Özeti\nAralık: ${label}\n\n${tasksInRangeText(start, end)}`);
}

function openPrintRangeDialog() {
  $("taskPrintStart").value = $("taskPrintStart").value || activeDate;
  $("taskPrintEnd").value = $("taskPrintEnd").value || activeDate;
  $("printRangeDialog").showModal();
}

function openTaskExportDialog() {
  $("taskExportDialog").showModal();
}

function exportTaskListPdf() {
  const tasks = filteredTasks();
  const lines = [
    "Evde Sağlık Görev Listesi",
    `Oluşturma: ${new Date().toLocaleString("tr-TR")}`,
    `Toplam Görev: ${tasks.length}`,
    "",
    ...(tasks.length ? tasks.map((task, index) => `${index + 1}. ${task.title} | ${task.category || "İdari"} | ${personName(task.assigneeId)} | ${frequencyName(task.frequency)} | ${task.active ? "Aktif" : "Pasif"}${task.mustDo ? " | Mutlaka" : ""} | ${priorityText(task.priority)}`) : ["Kayıt bulunamadı."])
  ];
  downloadBlob(createSimplePdf(lines), "esh-gorev-listesi.pdf", "application/pdf");
  $("taskExportDialog")?.close();
}

function exportTaskListXlsx() {
  const tasks = filteredTasks();
  const table = [
    ["Sıra", "Görev", "Açıklama", "Kategori", "Sorumlu", "Frekans", "Plan", "Durum", "Öncelik", "Mutlaka"],
    ...tasks.map((task, index) => [
      index + 1,
      task.title,
      task.description || "",
      task.category || "İdari",
      personName(task.assigneeId),
      frequencyName(task.frequency),
      frequencyLabel(task),
      task.active ? "Aktif" : "Pasif",
      priorityText(task.priority),
      task.mustDo ? "Evet" : "Hayır"
    ])
  ];
  downloadBlob(createXlsx(table), "esh-gorev-listesi.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  $("taskExportDialog")?.close();
}

function createSimplePdf(lines) {
  const encoder = new TextEncoder();
  const safeLines = (lines.length ? lines : ["Rapor için kayıt bulunamadı."]).map((line) => String(line ?? ""));
  const title = safeLines[0] || "ESH Raporu";
  const bodyLines = safeLines.slice(1);
  const preparedLines = [];
  bodyLines.forEach((line) => {
    if (!line.trim()) {
      preparedLines.push("");
      return;
    }
    preparedLines.push(...wrapPdfLine(line, 94));
  });
  const pageChunks = [];
  for (let i = 0; i < preparedLines.length; i += 34) pageChunks.push(preparedLines.slice(i, i + 34));
  if (!pageChunks.length) pageChunks.push([]);

  const objects = ["%PDF-1.4\n"];
  const pages = [];
  pageChunks.forEach((chunk, index) => {
    const contentId = 4 + index * 2;
    const pageId = 5 + index * 2;
    pages.push(pageId);
    const commands = [
      "q 0.93 0.97 1 rg 36 790 523 34 re f Q",
      "q 0.11 0.44 0.56 rg 36 790 5 34 re f Q",
      `BT /F1 14 Tf 48 811 Td <${pdfHexEncode(title).slice(0, 260)}> Tj ET`,
      `BT /F1 8 Tf 430 812 Td <${pdfHexEncode(`Oluşturma: ${new Date().toLocaleString("tr-TR")}`)}> Tj ET`,
      "q 0.82 0.86 0.90 RG 36 770 523 0.5 re S Q"
    ];
    chunk.forEach((line, lineIndex) => {
      const y = 748 - lineIndex * 19;
      if (!line.trim()) {
        commands.push(`q 0.90 0.93 0.96 RG 42 ${y + 6} 511 0.4 re S Q`);
        return;
      }
      const isSection = line.length < 64 && !line.includes("|") && (line.endsWith(":") || line === line.toLocaleUpperCase("tr"));
      commands.push(`BT /F1 ${isSection ? 11 : 9} Tf 42 ${y} Td <${pdfHexEncode(line).slice(0, 360)}> Tj ET`);
    });
    commands.push("q 0.82 0.86 0.90 RG 36 42 523 0.5 re S Q");
    commands.push(`BT /F1 8 Tf 42 28 Td <${pdfHexEncode("Evde Sağlık İş Akışı ve Görev Takip Sistemi")}> Tj ET`);
    commands.push(`BT /F1 8 Tf 500 28 Td <${pdfHexEncode(`${index + 1}/${pageChunks.length}`)}> Tj ET`);
    const text = commands.join("\n");
    objects[contentId] = `${contentId} 0 obj\n<< /Length ${encoder.encode(text).length} >>\nstream\n${text}\nendstream\nendobj\n`;
    objects[pageId] = `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`;
  });
  objects[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pages.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>\nendobj\n`;
  objects[3] = "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding << /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [128 /gbreve /Gbreve /Idotaccent /dotlessi /scedilla /Scedilla /ccedilla /Ccedilla /odieresis /Odieresis /udieresis /Udieresis] >> >>\nendobj\n";
  let body = objects[0];
  const offsets = [0];
  for (let i = 1; i < objects.length; i += 1) {
    if (!objects[i]) continue;
    offsets[i] = encoder.encode(body).length;
    body += objects[i];
  }
  const xrefOffset = encoder.encode(body).length;
  body += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i += 1) {
    body += `${String(offsets[i] || 0).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return encoder.encode(body);
}

function wrapPdfLine(line, maxLength = 94) {
  if (line.length <= maxLength) return [line];
  const parts = [];
  let current = "";
  line.split(/\s+/).forEach((word) => {
    if (!current) {
      current = word;
      return;
    }
    if (`${current} ${word}`.length <= maxLength) current += ` ${word}`;
    else {
      parts.push(current);
      current = word;
    }
  });
  if (current) parts.push(current);
  return parts.length ? parts : [line.slice(0, maxLength)];
}

function createXlsx(table) {
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
${table.map((row, r) => `<row r="${r + 1}">${row.map((cell, c) => `<c r="${columnName(c)}${r + 1}" t="inlineStr"><is><t>${xmlEscape(String(cell))}</t></is></c>`).join("")}</row>`).join("")}
</sheetData></worksheet>`;
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Rapor" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    "xl/worksheets/sheet1.xml": sheetXml
  };
  return zipStore(files);
}

function zipStore(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const local = concatBytes(u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), nameBytes, data);
    chunks.push(local);
    central.push(concatBytes(u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes));
    offset += local.length;
  });
  const centralSize = central.reduce((sum, item) => sum + item.length, 0);
  const end = concatBytes(u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length), u32(centralSize), u32(offset), u16(0));
  return concatBytes(...chunks, ...central, end);
}

function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function u16(value) {
  return new Uint8Array([value & 255, (value >>> 8) & 255]);
}

function u32(value) {
  return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]);
}

function concatBytes(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function columnName(index) {
  let name = "";
  let n = index + 1;
  while (n > 0) {
    const mod = (n - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    n = Math.floor((n - mod) / 26);
  }
  return name;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function escapeAttr(value) {
  return String(value).replace(/['\\]/g, "\\$&");
}

function xmlEscape(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char]));
}

function pdfHexEncode(value) {
  const pdfCharMap = {
    "ğ": 128,
    "Ğ": 129,
    "İ": 130,
    "ı": 131,
    "ş": 132,
    "Ş": 133,
    "ç": 134,
    "Ç": 135,
    "ö": 136,
    "Ö": 137,
    "ü": 138,
    "Ü": 139
  };
  return [...String(value)].map((char) => {
    const code = pdfCharMap[char] ?? char.charCodeAt(0);
    return (code >= 32 && code <= 255 ? code : 63).toString(16).padStart(2, "0").toUpperCase();
  }).join("");
}

function pdfEscape(value) {
  return String(value).replace(/[()\\]/g, "\\$&");
}

function asciiFold(value) {
  return String(value)
    .replaceAll("ı", "i").replaceAll("İ", "I").replaceAll("ğ", "g").replaceAll("Ğ", "G")
    .replaceAll("ü", "u").replaceAll("Ü", "U").replaceAll("ş", "s").replaceAll("Ş", "S")
    .replaceAll("ö", "o").replaceAll("Ö", "O").replaceAll("ç", "c").replaceAll("Ç", "C");
}

function empty(message) {
  return `<div class="empty">${message}</div>`;
}

window.setComplete = setComplete;
window.openTaskDialog = openTaskDialog;
window.openQuickTaskDialog = openQuickTaskDialog;
window.removeHoliday = removeHoliday;
window.openDayDialog = openDayDialog;
window.setCompleteFromDayDialog = setCompleteFromDayDialog;
window.saveCompletionMeta = saveCompletionMeta;
window.removePerson = removePerson;
window.editPerson = editPerson;
window.removeShift = removeShift;
window.removeCategory = removeCategory;
window.removeProfile = removeProfile;
window.toggleClosingItem = toggleClosingItem;
window.openPaperworkItemDialog = openPaperworkItemDialog;
window.updatePaperworkStepDraft = updatePaperworkStepDraft;
window.removePaperworkStepDraft = removePaperworkStepDraft;
window.updatePaperworkStatus = updatePaperworkStatus;
window.togglePaperworkStep = togglePaperworkStep;
window.updatePaperworkNote = updatePaperworkNote;
window.toggleMonthlyClosure = toggleMonthlyClosure;
window.copyMessageTemplate = copyMessageTemplate;
window.removeDispatch = removeDispatch;
window.editNote = editNote;
window.toggleNoteCard = toggleNoteCard;
window.editPersonalTodo = editPersonalTodo;
window.togglePersonalTodo = togglePersonalTodo;
window.fillMemberRoleForm = fillMemberRoleForm;
window.removeWorkspaceMember = removeWorkspaceMember;
window.startTaskDrag = startTaskDrag;
window.allowTaskReorder = allowTaskReorder;
window.dropTaskOnTask = dropTaskOnTask;

init();

