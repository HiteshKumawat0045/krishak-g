export type LanguageCode = "hi" | "en" | "mr" | "gu" | "pa" | "ta" | "te";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" }
];

export interface TranslationSchema {
  // Navigation
  home: string;
  dashboard: string;
  history: string;
  weather: string;
  schemes: string;
  profile: string;
  settings: string;
  notifications: string;

  // Header Subtitle / Tagline
  voiceAssistant: string;

  // Emergency Alert
  emergencyAlertTitle: string;
  highPriority: string;
  emergencyAlertMsg: string;

  // Voice States & Buttons
  handsFreeActive: string;
  handsFreeSublabel: string;
  listening: string;
  thinking: string;
  speaking: string;
  interrupted: string;
  idle: string;
  startHandsFree: string;
  pauseHandsFree: string;
  handsFreeInstruction: string;
  youSaid: string;
  assistantName: string;
  thinkingMessage: string;
  micPermissionDenied: string;

  // Dashboard Cards
  weatherTitle: string;
  mandiTitle: string;
  schemesTitle: string;
  advisoryTitle: string;
  liveApi: string;
  agmarknet: string;
  officialDataset: string;
  agronomicAdvice: string;
  temperature: string;
  humidity: string;
  wind: string;
  applyNow: string;
  guidanceLabel: string;
  pestAlertLabel: string;
  actionRecommendedLabel: string;

  // Profile Form
  setupProfile: string;
  setupDesc: string;
  fullName: string;
  enterName: string;
  country: string;
  selectState: string;
  selectDistrict: string;
  preferredLanguage: string;
  getStarted: string;
  savingProfile: string;

  // History & Transcript
  conversationHistory: string;
  pastInteractions: string;
  noConversations: string;
  transcript: string;
  backToHistory: string;
  newChat: string;
  loading: string;
}

export const translations: Record<LanguageCode, TranslationSchema> = {
  hi: {
    home: "होम",
    dashboard: "डैशबोर्ड",
    history: "इतिहास",
    weather: "मौसम",
    schemes: "योजनाएं",
    profile: "प्रोफाइल",
    settings: "सेटिंग्स",
    notifications: "सूचनाएं",
    voiceAssistant: "कृषि वॉयस असिस्टेंट",
    emergencyAlertTitle: "आपातकालीन मौसम चेतावनी",
    highPriority: "उच्च प्राथमिकता",
    emergencyAlertMsg: "24 घंटे के भीतर भारी बारिश और 45 किमी/घंटा हवाओं की संभावना। कटाई की फसल सुरक्षित करें।",
    handsFreeActive: "सुन रहा है (हैंड्स-फ्री)",
    handsFreeSublabel: "हैंड्स-फ्री सक्रिय — कभी भी बोलें",
    listening: "सुन रहा है...",
    thinking: "सोच रहा है...",
    speaking: "बोल रहा है...",
    interrupted: "रोका गया",
    idle: "निष्क्रिय",
    startHandsFree: "हैंड्स-फ्री शुरू करें",
    pauseHandsFree: "हैंड्स-फ्री रोकें",
    handsFreeInstruction: "हैंड्स-फ्री मोड सक्रिय है। अपना सवाल कभी भी बोलें (जैसे 'गेहूँ का मंडी भाव क्या है?')।",
    youSaid: "आपने कहा",
    assistantName: "कृषक-जी",
    thinkingMessage: "सोच रहा है और लाइव जानकारी प्राप्त कर रहा है...",
    micPermissionDenied: "माइक की अनुमति नहीं दी गई। कृपया बोलने के लिए माइक एक्सेस दें।",
    weatherTitle: "मौसम और वर्षा पूर्वानुमान",
    mandiTitle: "मंडी जिंस भाव",
    schemesTitle: "सरकारी योजनाएं और सब्सिडी",
    advisoryTitle: "फसल सलाह और मृदा देखभाल",
    liveApi: "लाइव एपीआई",
    agmarknet: "एगमार्कनेट",
    officialDataset: "सरकारी डेटासेट",
    agronomicAdvice: "कृषि वैज्ञानिक सलाह",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    wind: "हवा",
    applyNow: "आवेदन करें ↗",
    guidanceLabel: "सलाह:",
    pestAlertLabel: "कीट/रोग चेतावनी:",
    actionRecommendedLabel: "अनुशंसित कार्रवाई:",
    setupProfile: "किसान प्रोफाइल सेट अप",
    setupDesc: "व्यक्तिगत वॉयस सहायता के लिए अपना स्थान और पसंदीदा भाषा चुनें।",
    fullName: "पूरा नाम",
    enterName: "अपना नाम दर्ज करें",
    country: "देश",
    selectState: "राज्य चुनें",
    selectDistrict: "ज़िला चुनें",
    preferredLanguage: "पसंदीदा भाषा",
    getStarted: "शुरू करें",
    savingProfile: "सहेज रहा है...",
    conversationHistory: "बातचीत का इतिहास",
    pastInteractions: "पिछली आवाज और सलाह बातचीत",
    noConversations: "अभी कोई बातचीत नहीं हुई है। सवाल पूछना शुरू करें!",
    transcript: "ट्रांसक्रिप्ट",
    backToHistory: "इतिहास पर वापस जाएं",
    newChat: "+ नई बातचीत",
    loading: "लोड हो रहा है..."
  },

  en: {
    home: "Home",
    dashboard: "Dashboard",
    history: "History",
    weather: "Weather",
    schemes: "Schemes",
    profile: "Profile",
    settings: "Settings",
    notifications: "Notifications",
    voiceAssistant: "Agricultural Voice OS",
    emergencyAlertTitle: "Emergency Weather Warning",
    highPriority: "High Priority",
    emergencyAlertMsg: "Heavy rainfall & 45 km/h winds expected within 24 hours. Secure harvested crops & delay pesticide sprays.",
    handsFreeActive: "Listening (Hands-Free)",
    handsFreeSublabel: "Hands-free active — speak normally anytime",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
    interrupted: "Interrupted",
    idle: "Idle",
    startHandsFree: "Start Hands-Free Session",
    pauseHandsFree: "Pause Hands-Free Session",
    handsFreeInstruction: "Hands-free mode is active. Speak your question anytime (e.g. 'What is the wheat market price?').",
    youSaid: "You Said",
    assistantName: "Krishak-G",
    thinkingMessage: "Thinking and fetching live info...",
    micPermissionDenied: "Microphone permission denied. Please allow microphone access to speak.",
    weatherTitle: "Weather & Rainfall Forecast",
    mandiTitle: "Mandi Commodity Prices",
    schemesTitle: "Government Schemes & Subsidies",
    advisoryTitle: "Crop Advisory & Soil Care",
    liveApi: "Live API",
    agmarknet: "AGMARKNET",
    officialDataset: "Official Dataset",
    agronomicAdvice: "Agronomic Advice",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    applyNow: "Apply ↗",
    guidanceLabel: "Guidance:",
    pestAlertLabel: "Pest/Disease Alert:",
    actionRecommendedLabel: "Recommended Action:",
    setupProfile: "Farmer Profile Setup",
    setupDesc: "Set your location and preferred language for personalized voice assistance.",
    fullName: "Full Name",
    enterName: "Enter your name",
    country: "Country",
    selectState: "Select State",
    selectDistrict: "Select District",
    preferredLanguage: "Preferred Language",
    getStarted: "Get Started",
    savingProfile: "Saving Profile...",
    conversationHistory: "Conversation History",
    pastInteractions: "Past Voice & Advice Interactions",
    noConversations: "No conversations yet. Start asking questions!",
    transcript: "Transcript",
    backToHistory: "Back to History",
    newChat: "+ New Chat",
    loading: "Loading..."
  },

  mr: {
    home: "होम",
    dashboard: "डॅशबोर्ड",
    history: "इतिहास",
    weather: "हवामान",
    schemes: "योजना",
    profile: "प्रोफाइल",
    settings: "सेटिंग्ज",
    notifications: "सूचना",
    voiceAssistant: "शेती व्हॉइस असिस्टंट",
    emergencyAlertTitle: "तातडीची हवामान इशारा",
    highPriority: "उच्च प्राधान्य",
    emergencyAlertMsg: "२४ तासांत मुसळधार पाऊस व ४५ किमी/तास वाऱ्याची शक्यता. कापलेले पीक सुरक्षित करा.",
    handsFreeActive: "एकत आहे (हँड्स-फ्री)",
    handsFreeSublabel: "हँड्स-फ्री सक्रिय — कधीही बोला",
    listening: "एकत आहे...",
    thinking: "विचार करत आहे...",
    speaking: "बोलत आहे...",
    interrupted: "थांबवले",
    idle: "निष्क्रिय",
    startHandsFree: "हँड्स-फ्री सुरू करा",
    pauseHandsFree: "हँड्स-फ्री थांबवा",
    handsFreeInstruction: "हँड्स-फ्री मोड सक्रिय आहे. आपला प्रश्न कधीही बोला (उदा. 'गव्हाचा बाजार भाव काय आहे?').",
    youSaid: "तुम्ही म्हणालात",
    assistantName: "कृषक-जी",
    thinkingMessage: "विचार करत आहे आणि थेट माहिती मिळवत आहे...",
    micPermissionDenied: "मायक्रोफोनची परवानगी नाकारली. कृपया बोलण्यासाठी मायक्रोफोन ॲक्सेस द्या.",
    weatherTitle: "हवामान व पाऊस अंदाज",
    mandiTitle: "बाजार समिती शेतमाल भाव",
    schemesTitle: "शासकीय योजना व सबसिडी",
    advisoryTitle: "पीक सल्ला व माती काळजी",
    liveApi: "थेट API",
    agmarknet: "ॲगमार्कनेट",
    officialDataset: "शासकीय माहिती",
    agronomicAdvice: "कृषी तज्ज्ञ सल्ला",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    wind: "वारा",
    applyNow: "अर्ज करा ↗",
    guidanceLabel: "सल्ला:",
    pestAlertLabel: "कीड/रोग इशारा:",
    actionRecommendedLabel: "शिफारस केलेली कृती:",
    setupProfile: "शेतकरी प्रोफाइल मांडणी",
    setupDesc: "वैयक्तिक व्हॉइस मदतीसाठी तुमचे ठिकाण व भाषा निवडा.",
    fullName: "पूर्ण नाव",
    enterName: "तुमचे नाव टाका",
    country: "देश",
    selectState: "राज्य निवडा",
    selectDistrict: "जिल्हा निवडा",
    preferredLanguage: "निवडलेली भाषा",
    getStarted: "सुरू करा",
    savingProfile: "साठवत आहे...",
    conversationHistory: "संवादाचा इतिहास",
    pastInteractions: "मागील आवाज व सल्ला संवाद",
    noConversations: "अजून कोणताही संवाद नाही. प्रश्न विचारण्यास सुरुवात करा!",
    transcript: "लिखित संवाद",
    backToHistory: "इतिहासाकडे परत",
    newChat: "+ नवीन संवाद",
    loading: "लोड होत आहे..."
  },

  gu: {
    home: "હોમ",
    dashboard: "ડેશબોર્ડ",
    history: "ઇતિહાસ",
    weather: "હવામાન",
    schemes: "યોજનાઓ",
    profile: "પ્રોફાઇલ",
    settings: "સેટિંગ્સ",
    notifications: "સૂચનાઓ",
    voiceAssistant: "કૃષિ વોઇસ આસિસ્ટન્ટ",
    emergencyAlertTitle: "ઇમરજન્સી હવામાન ચેતવણી",
    highPriority: "ઉચ્ચ પ્રાથમિકતા",
    emergencyAlertMsg: "24 કલાકમાં ભારે વરસાદ અને 45 કિમી/કલાકની ઝડપે પવનની શક્યતા. પાક સુરક્ષિત કરો.",
    handsFreeActive: "સાંભળી રહ્યું છે (હેન્ડ્સ-ફ્રી)",
    handsFreeSublabel: "હેન્ડ્સ-ફ્રી સક્રિય — ગમે ત્યારે બોલો",
    listening: "સાંભળી રહ્યું છે...",
    thinking: "વિચારી રહ્યું છે...",
    speaking: "બોલી રહ્યું છે...",
    interrupted: "અટકાવ્યું",
    idle: "નિષ્ક્રિય",
    startHandsFree: "હેન્ડ્સ-ફ્રી શરૂ કરો",
    pauseHandsFree: "હેન્ડ્સ-ફ્રી અટકાવો",
    handsFreeInstruction: "હેન્ડ્સ-ફ્રી મોડ સક્રિય છે. તમારો પ્રશ્ન ગમે ત્યારે બોલો (દા.ત. 'ઘઉંના બજાર ભાવ શું છે?').",
    youSaid: "તમે કહ્યું",
    assistantName: "કૃષક-જી",
    thinkingMessage: "વિચારી રહ્યું છે અને લાઇન માહિતી મેળવી રહ્યું છે...",
    micPermissionDenied: "માઇક્રોફોનની પરવાનગી ના પાડી. કૃપા કરીને બોલવા માટે માઇક ઍક્સેસ આપો.",
    weatherTitle: "હવામાન અને વરસાદની આગાહી",
    mandiTitle: "માર્કેટિંગ યાર્ડ ભાવ",
    schemesTitle: "સરકારી યોજનાઓ અને સબસિડી",
    advisoryTitle: "પાક સલાહ અને જમીન સંભાળ",
    liveApi: "લાઇવ API",
    agmarknet: "એગમાર્કનેટ",
    officialDataset: "સરકારી ડેટાસેટ",
    agronomicAdvice: "કૃષિ વિજ્ઞાની સલાહ",
    temperature: "તાપમાન",
    humidity: "ભેજ",
    wind: "પવન",
    applyNow: "અરજી કરો ↗",
    guidanceLabel: "સલાહ:",
    pestAlertLabel: "જીવાત/રોગ ચેતવણી:",
    actionRecommendedLabel: "સુચવેલ પગલું:",
    setupProfile: "ખેડૂત પ્રોફાઇલ સેટઅપ",
    setupDesc: "વ્યક્તિગત વોઇસ મદદ માટે તમારું સ્થળ અને ભાષા પસંદ કરો.",
    fullName: "પૂરું નામ",
    enterName: "તમારું નામ લખો",
    country: "દેશ",
    selectState: "રાજ્ય પસંદ કરો",
    selectDistrict: "જિલ્લો પસંદ કરો",
    preferredLanguage: "પસંદગીની ભાષા",
    getStarted: "શરૂ કરો",
    savingProfile: "સાચવી રહ્યું છે...",
    conversationHistory: "વાતચીતનો ઇતિહાસ",
    pastInteractions: "અગાઉની વોઇસ અને સલાહ વાતચીત",
    noConversations: "હજી કોઈ વાતચીત થઈ નથી. પ્રશ્નો પૂછવાનું શરૂ કરો!",
    transcript: "ટ્રાન્સક્રિપ્ટ",
    backToHistory: "ઇતિહાસ પર પાછા જાઓ",
    newChat: "+ નવી વાતચીત",
    loading: "લોડ થઈ રહ્યું છે..."
  },

  pa: {
    home: "ਹੋਮ",
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    history: "ਇਤਿਹਾਸ",
    weather: "ਮੌਸਮ",
    schemes: "ਯੋਜਨਾਵਾਂ",
    profile: "ਪ੍ਰੋਫਾਈਲ",
    settings: "ਸੈਟਿੰਗਾਂ",
    notifications: "ਸੂਚਨਾਵਾਂ",
    voiceAssistant: "ਖੇਤੀਬਾੜੀ ਵੌਇਸ ਸਹਾਇਕ",
    emergencyAlertTitle: "ਐਮਰਜੈਂਸੀ ਮੌਸਮ ਚੇਤਾਵਨੀ",
    highPriority: "ਉੱਚ ਪ੍ਰਾਥਮਿਕਤਾ",
    emergencyAlertMsg: "24 ਘੰਟਿਆਂ ਦੇ ਅੰਦਰ ਭਾਰੀ ਮੀਂਹ ਅਤੇ 45 ਕਿਲੋਮੀਟਰ/ਘੰਟਾ ਹਵਾਵਾਂ ਦੀ ਸੰਭਾਵਨਾ। ਫ਼ਸਲ ਸੰਭਾਲੋ।",
    handsFreeActive: "ਸੁਣ ਰਿਹਾ ਹੈ (ਹੈਂਡਸ-ਫ੍ਰੀ)",
    handsFreeSublabel: "ਹੈਂਡਸ-ਫ੍ਰੀ ਸਰਗਰਮ — ਕਿਸੇ ਵੀ ਸਮੇਂ ਬੋਲੋ",
    listening: "ਸੁਣ ਰਿਹਾ ਹੈ...",
    thinking: "ਸੋਚ ਰਿਹਾ ਹੈ...",
    speaking: "ਬੋਲ ਰਿਹਾ ਹੈ...",
    interrupted: "ਰੋਕਿਆ ਗਿਆ",
    idle: "ਨਿਸ਼ਕਿਰਿਆ",
    startHandsFree: "ਹੈਂਡਸ-ਫ੍ਰੀ ਸ਼ੁਰੂ ਕਰੋ",
    pauseHandsFree: "ਹੈਂਡਸ-ਫ੍ਰੀ ਰੋਕੋ",
    handsFreeInstruction: "ਹੈਂਡਸ-ਫ੍ਰੀ ਮੋਡ ਸਰਗਰਮ ਹੈ। ਆਪਣਾ ਸਵਾਲ ਕਿਸੇ ਵੀ ਸਮੇਂ ਬੋਲੋ (ਜਿਵੇਂ 'ਕਣਕ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?')।",
    youSaid: "ਤੁਸੀਂ ਕਿਹਾ",
    assistantName: "ਕ੍ਰਿਸ਼ਕ-ਜੀ",
    thinkingMessage: "ਸੋਚ ਰਿਹਾ ਹੈ ਅਤੇ ਲਾਈਵ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰ ਰਿਹਾ ਹੈ...",
    micPermissionDenied: "ਮਾਈਕ੍ਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਮਿਲੀ। ਬੋਲਣ ਲਈ ਮਾਈਕ ਪਹੁੰਚ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ।",
    weatherTitle: "ਮੌਸਮ ਅਤੇ ਮੀਂਹ ਦੀ ਭਵਿੱਖਬਾਣੀ",
    mandiTitle: "ਮੰਡੀ ਫ਼ਸਲ ਭਾਅ",
    schemesTitle: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਅਤੇ ਸਬਸਿਡੀ",
    advisoryTitle: "ਫ਼ਸਲ ਸਲਾਹ ਅਤੇ ਮਿੱਟੀ ਦੀ ਦੇਖਭਾਲ",
    liveApi: "ਲਾਈਵ API",
    agmarknet: "ਐਗਮਾਰਕਨੈੱਟ",
    officialDataset: "ਸਰਕਾਰੀ ਡਾਟਾਸੈੱਟ",
    agronomicAdvice: "ਖੇਤੀ ਵਿਗਿਆਨੀ ਸਲਾਹ",
    temperature: "ਤਾਪਮਾਨ",
    humidity: "ਨਮੀ",
    wind: "ਹਵਾ",
    applyNow: "ਅਪਲਾਈ ਕਰੋ ↗",
    guidanceLabel: "ਸਲਾਹ:",
    pestAlertLabel: "ਕੀੜੇ/ਬੀਮਾਰੀ ਚੇਤਾਵਨੀ:",
    actionRecommendedLabel: "ਸਿਫਾਰਸ਼ੀ ਕਾਰਵਾਈ:",
    setupProfile: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਸੈੱਟਅੱਪ",
    setupDesc: "ਨਿੱਜੀ ਵੌਇਸ ਸਹਾਇਤਾ ਲਈ ਆਪਣਾ ਸਥਾਨ ਅਤੇ ਭਾਸ਼ਾ ਚੁਣੋ।",
    fullName: "ਪੂਰਾ ਨਾਮ",
    enterName: "ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ",
    country: "ਦੇਸ਼",
    selectState: "ਰਾਜ ਚੁਣੋ",
    selectDistrict: "ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ",
    preferredLanguage: "ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ",
    getStarted: "ਸ਼ੁਰੂ ਕਰੋ",
    savingProfile: "ਸੰਭਾਲ ਰਿਹਾ ਹੈ...",
    conversationHistory: "ਗੱਲਬਾਤ ਦਾ ਇਤਿਹਾਸ",
    pastInteractions: "ਪਿਛਲੀ ਵੌਇਸ ਅਤੇ ਸਲਾਹ ਗੱਲਬਾਤ",
    noConversations: "ਅਜੇ ਕੋਈ ਗੱਲਬਾਤ ਨਹੀਂ ਹੋਈ। ਸਵਾਲ ਪੁੱਛਣਾ ਸ਼ੁਰੂ ਕਰੋ!",
    transcript: "ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ",
    backToHistory: "ਇਤਿਹਾਸ ਵੱਲ ਵਾਪਸ",
    newChat: "+ ਨਵੀਂ ਗੱਲਬਾਤ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..."
  },

  ta: {
    home: "முகப்பு",
    dashboard: "டாஷ்போர்டு",
    history: "வரலாறு",
    weather: "வானிலை",
    schemes: "திட்டங்கள்",
    profile: "சுயவிவரம்",
    settings: "அமைப்புகள்",
    notifications: "அறிவிப்புகள்",
    voiceAssistant: "வேளாண் குரல் ረዳட்",
    emergencyAlertTitle: "அவசர வானிலை எச்சரிக்கை",
    highPriority: "முக்கிய முன்னுரிமை",
    emergencyAlertMsg: "24 மணி நேரத்திற்குள் பலத்த மழை மற்றும் 45 கி.மீ/மணி காற்று எதிர்பார்க்கப்படுகிறது. பயிர்களை பாதுகாக்கவும்.",
    handsFreeActive: "கேட்கிறது (ஹேண்ட்ஸ்-ஃப்ரீ)",
    handsFreeSublabel: "ஹேண்ட்ஸ்-ஃப்ரீ செயல்படுகிறது — எப்போதும் பேசுங்கள்",
    listening: "கேட்கிறது...",
    thinking: "யோசிக்கிறது...",
    speaking: "பேசுகிறது...",
    interrupted: "நிறுத்தப்பட்டது",
    idle: "செயலற்றது",
    startHandsFree: "ஹேண்ட்ஸ்-ஃப்ரீ தொடங்குக",
    pauseHandsFree: "ஹேண்ட்ஸ்-ஃப்ரீ நிறுத்துக",
    handsFreeInstruction: "ஹேண்ட்ஸ்-ஃப்ரீ பயன்முறை செயல்படுகிறது. உங்கள் கேள்வியை எப்போது வேண்டுமானாலும் பேசுங்கள்.",
    youSaid: "நீங்கள் கூறியது",
    assistantName: "கிரிஷக்-ஜி",
    thinkingMessage: "யோசித்து நேரடி தகவல்களை பெறுகிறது...",
    micPermissionDenied: "மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. பேச மைக் அணுகலை அனுமதிக்கவும்.",
    weatherTitle: "வானிலை மற்றும் மழை முன்னறிவிப்பு",
    mandiTitle: "சந்தை பயிர் விலைகள்",
    schemesTitle: "அரசு திட்டங்கள் மற்றும் மானியங்கள்",
    advisoryTitle: "பயிர் ஆலோசனை மற்றும் மண் பராமரிப்பு",
    liveApi: "நேரடி API",
    agmarknet: "அக்மார்க்நெட்",
    officialDataset: "அரசு தரவு",
    agronomicAdvice: "வேளாண் நிபுணர் ஆலோசனை",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    wind: "காற்று",
    applyNow: "விண்ணப்பிக்க ↗",
    guidanceLabel: "ஆலோசனை:",
    pestAlertLabel: "பூச்சி/நோய் எச்சரிக்கை:",
    actionRecommendedLabel: "பரிந்துரைக்கப்பட்ட நடவடிக்கை:",
    setupProfile: "விவசாயி சுயவிவர அமைப்பு",
    setupDesc: "தனிப்பயனாக்கப்பட்ட குரல் உதவிக்கு உங்கள் இருப்பிடம் மற்றும் மொழியைத் தேர்ந்தெடுக்கவும்.",
    fullName: "முழு பெயர்",
    enterName: "உங்கள் பெயரை உள்ளிடவும்",
    country: "நாடு",
    selectState: "மாநிலத்தைத் தேர்ந்தெடுக்கவும்",
    selectDistrict: "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்",
    preferredLanguage: "விருப்பமான மொழி",
    getStarted: "தொடங்கவும்",
    savingProfile: "சேமிக்கிறது...",
    conversationHistory: "உரையாடல் வரலாறு",
    pastInteractions: "முந்தைய குரல் உரையாடல்கள்",
    noConversations: "இன்னும் உரையாடல்கள் இல்லை. கேள்விகளைக் கேட்கத் தொடங்குங்கள்!",
    transcript: "படியெடுத்தல்",
    backToHistory: "வரலாற்றுக்குத் திரும்பு",
    newChat: "+ புதிய உரையாடல்",
    loading: "ஏற்றுகிறது..."
  },

  te: {
    home: "హోమ్",
    dashboard: "డాష్‌బోర్డ్",
    history: "చరిత్ర",
    weather: "వాతావరణం",
    schemes: "పథకాలు",
    profile: "ప్రొఫైల్",
    settings: "సెట్టింగ్‌లు",
    notifications: "నోటిఫికేషన్లు",
    voiceAssistant: "వ్యవసాయ వాయిస్ అసిస్టెంట్",
    emergencyAlertTitle: "అత్యవసర వాతావరణ హెచ్చరిక",
    highPriority: "అత్యధిక ప్రాధాన్యత",
    emergencyAlertMsg: "24 గంటల్లో భారీ వర్షం మరియు 45 కిమీ/గం ఈదురుగాలులు వీచే అవకాశం ఉంది. కోత కోసిన పంటను సురక్షితం చేయండి.",
    handsFreeActive: "వింటోంది (హ్యాండ్స్-ఫ్రీ)",
    handsFreeSublabel: "హ్యాండ్స్-ఫ్రీ సక్రియంగా ఉంది — ఎప్పుడైనా మాట్లాడండి",
    listening: "వింటోంది...",
    thinking: "ఆలోచిస్తోంది...",
    speaking: "మాట్లాడుతోంది...",
    interrupted: "ఆపివేయబడింది",
    idle: "నిష్క్రియ",
    startHandsFree: "హ్యాండ్స్-ఫ్రీ ప్రారంభించండి",
    pauseHandsFree: "హ్యాండ్స్-ఫ్రీ ఆపండి",
    handsFreeInstruction: "హ్యాండ్స్-ఫ్రీ మోడ్ సక్రియంగా ఉంది. మీ ప్రశ్నను ఎప్పుడైనా మాట్లాడండి (ఉదా. 'గోధుమ మార్కెట్ ధర ఎంత?').",
    youSaid: "మీరు చెప్పారు",
    assistantName: "క్రిషక్-జి",
    thinkingMessage: "ఆలోచిస్తోంది మరియు లైవ్ సమాచారాన్ని పొందుతోంది...",
    micPermissionDenied: "మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. మాట్లాడటానికి దయచేసి మైక్ యాక్సెస్ ఇవ్వండి.",
    weatherTitle: "వాతావరణం మరియు వర్షపాతం అంచనా",
    mandiTitle: "మార్కెట్ యార్డ్ ధరలు",
    schemesTitle: "ప్రభుత్వ పథకాలు మరియు సబ్సిడీలు",
    advisoryTitle: "పంట సలహా మరియు నేల సంరక్షణ",
    liveApi: "లైవ్ API",
    agmarknet: "అగ్మార్క్‌నెట్",
    officialDataset: "ప్రభుత్వ సమాచారం",
    agronomicAdvice: "వ్యవసాయ శాస్త్రవేత్త సలహా",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    wind: "గాలి",
    applyNow: "దరఖాస్తు చేయండి ↗",
    guidanceLabel: "సలహా:",
    pestAlertLabel: "కీటకాలు/తెగులు హెచ్చరిక:",
    actionRecommendedLabel: "సిఫార్సు చేసిన చర్య:",
    setupProfile: "రైతు ప్రొఫైల్ సెటప్",
    setupDesc: "వ్యక్తిగత వాయిస్ సహాయం కోసం మీ స్థానం మరియు ప్రాధాన్య భాషను ఎంచుకోండి.",
    fullName: "పూర్తి పేరు",
    enterName: "మీ పేరు నమోదు చేయండి",
    country: "దేశం",
    selectState: "రాష్ట్రాన్ని ఎంచుకోండి",
    selectDistrict: "జిల్లాను ఎంచుకోండి",
    preferredLanguage: "ప్రాధాన్య భాష",
    getStarted: "ప్రారంభించండి",
    savingProfile: "సేవ్ చేస్తోంది...",
    conversationHistory: "సంభాషణ చరిత్ర",
    pastInteractions: "గత వాయిస్ మరియు సలహా సంభాషణలు",
    noConversations: "ఇంకా సంభాషణలు లేవు. ప్రశ్నలు అడగడం ప్రారంభించండి!",
    transcript: "ట్రాన్స్క్రిప్ట్",
    backToHistory: "చరిత్రకు తిరిగి వెళ్లు",
    newChat: "+ కొత్త సంభాషణ",
    loading: "లోడ్ అవుతోంది..."
  }
};

export function getTranslation(lang: string): TranslationSchema {
  const code = (lang || "en").toLowerCase() as LanguageCode;
  return translations[code] || translations["en"];
}
