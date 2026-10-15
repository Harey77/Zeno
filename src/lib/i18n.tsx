"use client";

import { useCallback, useEffect } from "react";
import { useStore, type Lang } from "./store";

export const LANGS: { code: Lang; label: string; native: string; html: string }[] = [
  { code: "en", label: "English", native: "English", html: "en-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", html: "hi-IN" },
  { code: "mr", label: "Marathi", native: "मराठी", html: "mr-IN" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", html: "gu-IN" },
  { code: "ta", label: "Tamil", native: "தமிழ்", html: "ta-IN" },
  { code: "bn", label: "Bengali", native: "বাংলা", html: "bn-IN" },
];

// English is the source of truth; other languages fall back to it key by key.
const en = {
  "nav.start": "Start", "nav.tools": "Tools", "nav.learn": "Learn",
  "nav.budget": "Money Snapshot", "nav.budget.d": "Monthly money + expense tracker",
  "nav.planner": "Plan Builder", "nav.planner.d": "Set a goal and a path",
  "nav.compare": "Compare 5 Pathways", "nav.compare.d": "Savings, FDs, funds, gold, stocks",
  "nav.saveMore": "Save ₹500 More", "nav.saveMore.d": "See what a small change adds",
  "nav.stocks": "Stock Reader", "nav.stocks.d": "Read a stock card, practise safely",
  "nav.risk": "Risk Translator", "nav.risk.d": "What a crash really costs, in 3D",
  "nav.life": "Life Happens", "nav.life.d": "Test real-world surprises",
  "nav.learnCenter": "Learn Center", "nav.learnCenter.d": "Ask the AI guide",
  "nav.quiz": "Myth Buster Quiz", "nav.quiz.d": "True or false, no timer",
  "nav.glossary": "Glossary", "nav.glossary.d": "Money words in plain language",
  "nav.dashboard": "Dashboard", "nav.home": "Home", "nav.login": "Log in", "nav.guest": "Guest",
  "nav.cta": "Build My Plan", "nav.language": "Language",

  "home.eyebrow": "PERSONAL FINANCE, WITHOUT THE NOISE",
  "home.h1a": "YOUR FIRST MILLION.", "home.h1b": "NO FAIRYTALES.",
  "home.sub": "A clearer way to understand money, make a plan, and work towards your financial goals.",
  "home.cta2": "Start with a money snapshot",
  "home.privacy": "Free, private, runs in your browser. Nothing leaves your device.",
  "goal.preview": "GOAL PREVIEW", "goal.howLong": "How long to reach",
  "goal.monthly": "Monthly savings",
  "goal.ownOnly": "Your money only", "goal.noGrowth": "No growth assumed",
  "goal.withGrowth": "With {r}% illustrative growth", "goal.notPrediction": "Not a prediction",
  "goal.tenYears": "In 10 years, illustratively:", "goal.youPut": "You put in", "goal.hypGrowth": "Hypothetical growth",
  "goal.usePlan": "Use these numbers in my plan", "goal.reset": "Reset", "goal.saved": "Saved to your plan",

  "footer.tagline": "Personal finance, without the noise. Built for first-time savers and investors in India.",
  "footer.disclaimer": "Zeno is an educational financial-planning prototype. All simulations are illustrative and are not predictions or guarantees. Investments can lose value. This website does not provide personalised financial advice.",

  "chat.title": "Zeno AI guide", "chat.sub": "SEBI-aligned education · not advice",
  "chat.placeholder": "Ask about SIPs, FDs, inflation…",
  "chat.explain": "In plain words", "chat.example": "₹ example with your numbers", "chat.risk": "Risk & limits",

  "auth.title": "Welcome to Zeno", "auth.guest": "One-click demo access",
  "auth.google": "Continue with Google", "auth.apple": "Continue with Apple ID",
  "auth.phone": "Phone OTP (+91)", "auth.email": "Email & password",
  "auth.sendOtp": "Send OTP", "auth.verify": "Verify", "auth.preferred": "Preferred method", "auth.lastUsed": "Last used",
};
export type Key = keyof typeof en;

const hi: Partial<Record<Key, string>> = {
  "nav.start": "शुरुआत", "nav.tools": "टूल्स", "nav.learn": "सीखें",
  "nav.budget": "पैसों का स्नैपशॉट", "nav.budget.d": "मासिक आय-खर्च और खर्च ट्रैकर",
  "nav.planner": "प्लान बिल्डर", "nav.planner.d": "लक्ष्य तय करें, रास्ता देखें",
  "nav.compare": "5 रास्तों की तुलना", "nav.compare.d": "बचत, FD, म्यूचुअल फंड, सोना, शेयर",
  "nav.saveMore": "₹500 ज़्यादा बचाएँ", "nav.saveMore.d": "छोटा बदलाव, साफ़ फ़र्क",
  "nav.stocks": "स्टॉक रीडर", "nav.stocks.d": "स्टॉक कार्ड पढ़ें, सुरक्षित अभ्यास करें",
  "nav.risk": "जोखिम अनुवादक", "nav.risk.d": "गिरावट की असली कीमत, 3D में",
  "nav.life": "ज़िंदगी के झटके", "nav.life.d": "नौकरी, बिल, छूटे महीने",
  "nav.learnCenter": "लर्न सेंटर", "nav.learnCenter.d": "AI गाइड से पूछें",
  "nav.quiz": "मिथक तोड़ क्विज़", "nav.quiz.d": "सच या झूठ, कोई टाइमर नहीं",
  "nav.glossary": "शब्दकोश", "nav.glossary.d": "पैसों के शब्द आसान भाषा में",
  "nav.dashboard": "डैशबोर्ड", "nav.home": "होम", "nav.login": "लॉग इन", "nav.guest": "अतिथि",
  "nav.cta": "मेरा प्लान बनाएँ", "nav.language": "भाषा",
  "home.eyebrow": "बिना शोर के पर्सनल फ़ाइनेंस",
  "home.h1a": "आपका पहला मिलियन।", "home.h1b": "कोई परीकथा नहीं।",
  "home.sub": "पैसे को समझने, योजना बनाने और अपने वित्तीय लक्ष्यों की ओर बढ़ने का एक साफ़ तरीका।",
  "home.cta2": "पैसों के स्नैपशॉट से शुरू करें",
  "home.privacy": "मुफ़्त, निजी, आपके ब्राउज़र में चलता है। कुछ भी आपके डिवाइस से बाहर नहीं जाता।",
  "goal.preview": "लक्ष्य पूर्वावलोकन", "goal.howLong": "पहुँचने में कितना समय", "goal.monthly": "हर महीने की बचत",
  "goal.ownOnly": "सिर्फ़ आपका पैसा", "goal.noGrowth": "कोई ग्रोथ नहीं मानी गई",
  "goal.withGrowth": "{r}% काल्पनिक ग्रोथ के साथ", "goal.notPrediction": "यह भविष्यवाणी नहीं है",
  "goal.tenYears": "10 साल में, उदाहरण के तौर पर:", "goal.youPut": "आपने डाला", "goal.hypGrowth": "काल्पनिक ग्रोथ",
  "goal.usePlan": "ये आँकड़े मेरे प्लान में डालें", "goal.reset": "रीसेट", "goal.saved": "प्लान में सेव हो गया",
  "footer.tagline": "बिना शोर के पर्सनल फ़ाइनेंस। भारत में पहली बार बचत और निवेश करने वालों के लिए।",
  "footer.disclaimer": "Zeno एक शैक्षिक वित्तीय-योजना प्रोटोटाइप है। सभी सिमुलेशन उदाहरण मात्र हैं, भविष्यवाणी या गारंटी नहीं। निवेश का मूल्य घट सकता है। यह वेबसाइट व्यक्तिगत वित्तीय सलाह नहीं देती।",
  "chat.title": "Zeno AI गाइड", "chat.sub": "SEBI-अनुरूप शिक्षा · सलाह नहीं",
  "chat.placeholder": "SIP, FD, महंगाई के बारे में पूछें…",
  "chat.explain": "आसान भाषा में", "chat.example": "आपके आँकड़ों से ₹ उदाहरण", "chat.risk": "जोखिम और सीमाएँ",
  "auth.title": "Zeno में आपका स्वागत है", "auth.guest": "एक क्लिक में डेमो देखें",
  "auth.google": "Google से जारी रखें", "auth.apple": "Apple ID से जारी रखें",
  "auth.phone": "फ़ोन OTP (+91)", "auth.email": "ईमेल और पासवर्ड",
  "auth.sendOtp": "OTP भेजें", "auth.verify": "सत्यापित करें", "auth.preferred": "पसंदीदा तरीका", "auth.lastUsed": "पिछली बार इस्तेमाल किया",
};

const mr: Partial<Record<Key, string>> = {
  "nav.start": "सुरुवात", "nav.tools": "साधने", "nav.learn": "शिका",
  "nav.budget": "पैशांचा आढावा", "nav.budget.d": "मासिक उत्पन्न-खर्च आणि खर्च ट्रॅकर",
  "nav.planner": "योजना बिल्डर", "nav.planner.d": "ध्येय ठरवा, मार्ग पाहा",
  "nav.compare": "5 मार्गांची तुलना", "nav.compare.d": "बचत, FD, म्युच्युअल फंड, सोने, शेअर्स",
  "nav.saveMore": "₹500 जास्त वाचवा", "nav.saveMore.d": "छोटा बदल, स्पष्ट फरक",
  "nav.stocks": "स्टॉक रीडर", "nav.stocks.d": "स्टॉक कार्ड वाचा, सुरक्षित सराव करा",
  "nav.risk": "जोखीम अनुवादक", "nav.risk.d": "घसरणीची खरी किंमत, 3D मध्ये",
  "nav.life": "आयुष्यातील धक्के", "nav.life.d": "नोकरी, बिले, चुकलेले महिने",
  "nav.learnCenter": "शिक्षण केंद्र", "nav.learnCenter.d": "AI मार्गदर्शकाला विचारा",
  "nav.quiz": "गैरसमज क्विझ", "nav.quiz.d": "खरे की खोटे, टायमर नाही",
  "nav.glossary": "शब्दकोश", "nav.glossary.d": "पैशांचे शब्द सोप्या भाषेत",
  "nav.dashboard": "डॅशबोर्ड", "nav.home": "मुख्यपृष्ठ", "nav.login": "लॉग इन", "nav.guest": "पाहुणे",
  "nav.cta": "माझी योजना बनवा", "nav.language": "भाषा",
  "home.eyebrow": "गोंगाटाशिवाय वैयक्तिक अर्थनियोजन",
  "home.h1a": "तुमचे पहिले मिलियन.", "home.h1b": "परीकथा नाही.",
  "home.sub": "पैसा समजून घेण्याचा, योजना बनवण्याचा आणि आर्थिक ध्येयांकडे वाटचाल करण्याचा एक स्पष्ट मार्ग.",
  "home.cta2": "पैशांच्या आढाव्याने सुरुवात करा",
  "home.privacy": "मोफत, खाजगी, तुमच्या ब्राउझरमध्ये चालते. काहीही तुमच्या डिव्हाइसबाहेर जात नाही.",
  "goal.preview": "ध्येय पूर्वावलोकन", "goal.howLong": "पोहोचायला किती वेळ", "goal.monthly": "दरमहा बचत",
  "goal.ownOnly": "फक्त तुमचे पैसे", "goal.noGrowth": "वाढ गृहीत धरलेली नाही",
  "goal.withGrowth": "{r}% काल्पनिक वाढीसह", "goal.notPrediction": "हा अंदाज नाही",
  "goal.tenYears": "10 वर्षांत, उदाहरणादाखल:", "goal.youPut": "तुम्ही भरलेले", "goal.hypGrowth": "काल्पनिक वाढ",
  "goal.usePlan": "हे आकडे माझ्या योजनेत वापरा", "goal.reset": "रीसेट", "goal.saved": "योजनेत जतन केले",
  "footer.tagline": "गोंगाटाशिवाय वैयक्तिक अर्थनियोजन. भारतातील नवीन बचतदार आणि गुंतवणूकदारांसाठी.",
  "footer.disclaimer": "Zeno हा एक शैक्षणिक आर्थिक-नियोजन प्रोटोटाइप आहे. सर्व सिम्युलेशन केवळ उदाहरणादाखल आहेत, अंदाज किंवा हमी नाहीत. गुंतवणुकीचे मूल्य कमी होऊ शकते. ही वेबसाइट वैयक्तिक आर्थिक सल्ला देत नाही.",
  "chat.title": "Zeno AI मार्गदर्शक", "chat.sub": "SEBI-सुसंगत शिक्षण · सल्ला नाही",
  "chat.placeholder": "SIP, FD, महागाईबद्दल विचारा…",
  "chat.explain": "सोप्या भाषेत", "chat.example": "तुमच्या आकड्यांवरून ₹ उदाहरण", "chat.risk": "जोखीम आणि मर्यादा",
  "auth.title": "Zeno मध्ये स्वागत आहे", "auth.guest": "एका क्लिकमध्ये डेमो पाहा",
  "auth.google": "Google ने पुढे चला", "auth.apple": "Apple ID ने पुढे चला",
  "auth.phone": "फोन OTP (+91)", "auth.email": "ईमेल आणि पासवर्ड",
  "auth.sendOtp": "OTP पाठवा", "auth.verify": "पडताळा", "auth.preferred": "पसंतीची पद्धत", "auth.lastUsed": "मागच्या वेळी वापरले",
};

const gu: Partial<Record<Key, string>> = {
  "nav.start": "શરૂઆત", "nav.tools": "સાધનો", "nav.learn": "શીખો",
  "nav.budget": "પૈસાનો સ્નેપશોટ", "nav.budget.d": "માસિક આવક-ખર્ચ અને ખર્ચ ટ્રેકર",
  "nav.planner": "પ્લાન બિલ્ડર", "nav.planner.d": "લક્ષ્ય નક્કી કરો, રસ્તો જુઓ",
  "nav.compare": "5 રસ્તાઓની સરખામણી", "nav.compare.d": "બચત, FD, મ્યુચ્યુઅલ ફંડ, સોનું, શેર",
  "nav.saveMore": "₹500 વધુ બચાવો", "nav.saveMore.d": "નાનો ફેરફાર, સ્પષ્ટ તફાવત",
  "nav.stocks": "સ્ટોક રીડર", "nav.stocks.d": "સ્ટોક કાર્ડ વાંચો, સુરક્ષિત પ્રેક્ટિસ કરો",
  "nav.risk": "જોખમ અનુવાદક", "nav.risk.d": "ઘટાડાની સાચી કિંમત, 3Dમાં",
  "nav.life": "જીવનના આંચકા", "nav.life.d": "નોકરી, બિલ, ચૂકેલા મહિના",
  "nav.learnCenter": "લર્ન સેન્ટર", "nav.learnCenter.d": "AI માર્ગદર્શકને પૂછો",
  "nav.quiz": "ભ્રમ તોડ ક્વિઝ", "nav.quiz.d": "સાચું કે ખોટું, ટાઇમર નહીં",
  "nav.glossary": "શબ્દકોશ", "nav.glossary.d": "પૈસાના શબ્દો સરળ ભાષામાં",
  "nav.dashboard": "ડેશબોર્ડ", "nav.home": "હોમ", "nav.login": "લૉગ ઇન", "nav.guest": "મહેમાન",
  "nav.cta": "મારો પ્લાન બનાવો", "nav.language": "ભાષા",
  "home.eyebrow": "ઘોંઘાટ વિના પર્સનલ ફાઇનાન્સ",
  "home.h1a": "તમારું પહેલું મિલિયન.", "home.h1b": "કોઈ પરીકથા નહીં.",
  "home.sub": "પૈસા સમજવાનો, યોજના બનાવવાનો અને તમારા નાણાકીય લક્ષ્યો તરફ આગળ વધવાનો એક સ્પષ્ટ રસ્તો.",
  "home.cta2": "પૈસાના સ્નેપશોટથી શરૂ કરો",
  "home.privacy": "મફત, ખાનગી, તમારા બ્રાઉઝરમાં ચાલે છે. કંઈ પણ તમારા ઉપકરણની બહાર જતું નથી.",
  "goal.preview": "લક્ષ્ય પૂર્વાવલોકન", "goal.howLong": "પહોંચવામાં કેટલો સમય", "goal.monthly": "દર મહિને બચત",
  "goal.ownOnly": "ફક્ત તમારા પૈસા", "goal.noGrowth": "કોઈ વૃદ્ધિ માની નથી",
  "goal.withGrowth": "{r}% કાલ્પનિક વૃદ્ધિ સાથે", "goal.notPrediction": "આ આગાહી નથી",
  "goal.tenYears": "10 વર્ષમાં, ઉદાહરણ તરીકે:", "goal.youPut": "તમે મૂક્યા", "goal.hypGrowth": "કાલ્પનિક વૃદ્ધિ",
  "goal.usePlan": "આ આંકડા મારા પ્લાનમાં વાપરો", "goal.reset": "રીસેટ", "goal.saved": "પ્લાનમાં સેવ થયું",
  "footer.tagline": "ઘોંઘાટ વિના પર્સનલ ફાઇનાન્સ. ભારતમાં પહેલી વાર બચત અને રોકાણ કરનારાઓ માટે.",
  "footer.disclaimer": "Zeno એક શૈક્ષણિક નાણાકીય-આયોજન પ્રોટોટાઇપ છે. બધા સિમ્યુલેશન માત્ર ઉદાહરણ છે, આગાહી કે ગેરંટી નથી. રોકાણનું મૂલ્ય ઘટી શકે છે. આ વેબસાઇટ વ્યક્તિગત નાણાકીય સલાહ આપતી નથી.",
  "chat.title": "Zeno AI માર્ગદર્શક", "chat.sub": "SEBI-સુસંગત શિક્ષણ · સલાહ નહીં",
  "chat.placeholder": "SIP, FD, મોંઘવારી વિશે પૂછો…",
  "chat.explain": "સરળ ભાષામાં", "chat.example": "તમારા આંકડા પરથી ₹ ઉદાહરણ", "chat.risk": "જોખમ અને મર્યાદાઓ",
  "auth.title": "Zenoમાં આપનું સ્વાગત છે", "auth.guest": "એક ક્લિકમાં ડેમો જુઓ",
  "auth.google": "Google સાથે આગળ વધો", "auth.apple": "Apple ID સાથે આગળ વધો",
  "auth.phone": "ફોન OTP (+91)", "auth.email": "ઇમેઇલ અને પાસવર્ડ",
  "auth.sendOtp": "OTP મોકલો", "auth.verify": "ચકાસો", "auth.preferred": "પસંદગીની રીત", "auth.lastUsed": "છેલ્લે વાપરેલી",
};

const ta: Partial<Record<Key, string>> = {
  "nav.start": "தொடக்கம்", "nav.tools": "கருவிகள்", "nav.learn": "கற்க",
  "nav.budget": "பண நிலவரம்", "nav.budget.d": "மாத வருமானம், செலவு கண்காணிப்பு",
  "nav.planner": "திட்டம் உருவாக்கி", "nav.planner.d": "இலக்கை அமைத்து வழியைப் பாருங்கள்",
  "nav.compare": "5 வழிகளை ஒப்பிடுக", "nav.compare.d": "சேமிப்பு, FD, மியூச்சுவல் ஃபண்ட், தங்கம், பங்குகள்",
  "nav.saveMore": "₹500 கூடுதலாகச் சேமியுங்கள்", "nav.saveMore.d": "சிறிய மாற்றம், தெளிவான வித்தியாசம்",
  "nav.stocks": "பங்கு வாசிப்பான்", "nav.stocks.d": "பங்கு அட்டையைப் படியுங்கள், பாதுகாப்பாகப் பயிற்சி செய்யுங்கள்",
  "nav.risk": "இடர் விளக்கி", "nav.risk.d": "வீழ்ச்சியின் உண்மை விலை, 3D-யில்",
  "nav.life": "வாழ்க்கை அதிர்ச்சிகள்", "nav.life.d": "வேலை, கட்டணங்கள், தவறிய மாதங்கள்",
  "nav.learnCenter": "கற்றல் மையம்", "nav.learnCenter.d": "AI வழிகாட்டியிடம் கேளுங்கள்",
  "nav.quiz": "கட்டுக்கதை உடைப்பு வினாடி வினா", "nav.quiz.d": "உண்மையா பொய்யா, டைமர் இல்லை",
  "nav.glossary": "சொற்களஞ்சியம்", "nav.glossary.d": "பணச் சொற்கள் எளிய மொழியில்",
  "nav.dashboard": "டாஷ்போர்டு", "nav.home": "முகப்பு", "nav.login": "உள்நுழை", "nav.guest": "விருந்தினர்",
  "nav.cta": "என் திட்டத்தை உருவாக்கு", "nav.language": "மொழி",
  "home.eyebrow": "இரைச்சல் இல்லாத தனிநபர் நிதி",
  "home.h1a": "உங்கள் முதல் மில்லியன்.", "home.h1b": "கற்பனைக் கதைகள் இல்லை.",
  "home.sub": "பணத்தைப் புரிந்துகொள்ள, திட்டமிட, உங்கள் நிதி இலக்குகளை நோக்கிச் செல்ல ஒரு தெளிவான வழி.",
  "home.cta2": "பண நிலவரத்துடன் தொடங்குங்கள்",
  "home.privacy": "இலவசம், தனிப்பட்டது, உங்கள் உலாவியில் இயங்குகிறது. எதுவும் உங்கள் சாதனத்தை விட்டு வெளியேறாது.",
  "goal.preview": "இலக்கு முன்னோட்டம்", "goal.howLong": "அடைய எவ்வளவு காலம்", "goal.monthly": "மாதச் சேமிப்பு",
  "goal.ownOnly": "உங்கள் பணம் மட்டும்", "goal.noGrowth": "வளர்ச்சி கணக்கில் இல்லை",
  "goal.withGrowth": "{r}% கற்பனை வளர்ச்சியுடன்", "goal.notPrediction": "இது கணிப்பு அல்ல",
  "goal.tenYears": "10 ஆண்டுகளில், உதாரணமாக:", "goal.youPut": "நீங்கள் செலுத்தியது", "goal.hypGrowth": "கற்பனை வளர்ச்சி",
  "goal.usePlan": "இந்த எண்களை என் திட்டத்தில் பயன்படுத்து", "goal.reset": "மீட்டமை", "goal.saved": "திட்டத்தில் சேமிக்கப்பட்டது",
  "footer.tagline": "இரைச்சல் இல்லாத தனிநபர் நிதி. இந்தியாவில் முதல்முறை சேமிப்பவர்கள், முதலீட்டாளர்களுக்காக.",
  "footer.disclaimer": "Zeno ஒரு கல்விசார் நிதித் திட்டமிடல் முன்மாதிரி. அனைத்து உருவகப்படுத்தல்களும் விளக்கத்திற்காக மட்டுமே; கணிப்புகளோ உத்தரவாதங்களோ அல்ல. முதலீடுகளின் மதிப்பு குறையலாம். இந்த இணையதளம் தனிப்பட்ட நிதி ஆலோசனை வழங்குவதில்லை.",
  "chat.title": "Zeno AI வழிகாட்டி", "chat.sub": "SEBI-இணக்கக் கல்வி · ஆலோசனை அல்ல",
  "chat.placeholder": "SIP, FD, பணவீக்கம் பற்றிக் கேளுங்கள்…",
  "chat.explain": "எளிய மொழியில்", "chat.example": "உங்கள் எண்களுடன் ₹ உதாரணம்", "chat.risk": "இடர்களும் வரம்புகளும்",
  "auth.title": "Zeno-க்கு வரவேற்கிறோம்", "auth.guest": "ஒரே கிளிக்கில் டெமோ",
  "auth.google": "Google மூலம் தொடரவும்", "auth.apple": "Apple ID மூலம் தொடரவும்",
  "auth.phone": "தொலைபேசி OTP (+91)", "auth.email": "மின்னஞ்சல் & கடவுச்சொல்",
  "auth.sendOtp": "OTP அனுப்பு", "auth.verify": "சரிபார்", "auth.preferred": "விருப்ப முறை", "auth.lastUsed": "கடைசியாகப் பயன்படுத்தியது",
};

const bn: Partial<Record<Key, string>> = {
  "nav.start": "শুরু", "nav.tools": "টুলস", "nav.learn": "শিখুন",
  "nav.budget": "টাকার স্ন্যাপশট", "nav.budget.d": "মাসিক আয়-ব্যয় ও খরচ ট্র্যাকার",
  "nav.planner": "প্ল্যান বিল্ডার", "nav.planner.d": "লক্ষ্য ঠিক করুন, পথ দেখুন",
  "nav.compare": "৫টি পথের তুলনা", "nav.compare.d": "সঞ্চয়, FD, মিউচুয়াল ফান্ড, সোনা, শেয়ার",
  "nav.saveMore": "₹500 বেশি সঞ্চয় করুন", "nav.saveMore.d": "ছোট পরিবর্তন, স্পষ্ট পার্থক্য",
  "nav.stocks": "স্টক রিডার", "nav.stocks.d": "স্টক কার্ড পড়ুন, নিরাপদে অনুশীলন করুন",
  "nav.risk": "ঝুঁকি অনুবাদক", "nav.risk.d": "পতনের আসল মূল্য, 3D-তে",
  "nav.life": "জীবনের ধাক্কা", "nav.life.d": "চাকরি, বিল, বাদ পড়া মাস",
  "nav.learnCenter": "লার্ন সেন্টার", "nav.learnCenter.d": "AI গাইডকে জিজ্ঞাসা করুন",
  "nav.quiz": "ভুল ধারণা ভাঙার কুইজ", "nav.quiz.d": "সত্য না মিথ্যা, কোনো টাইমার নেই",
  "nav.glossary": "শব্দকোষ", "nav.glossary.d": "টাকার শব্দ সহজ ভাষায়",
  "nav.dashboard": "ড্যাশবোর্ড", "nav.home": "হোম", "nav.login": "লগ ইন", "nav.guest": "অতিথি",
  "nav.cta": "আমার প্ল্যান বানান", "nav.language": "ভাষা",
  "home.eyebrow": "হইচই ছাড়া ব্যক্তিগত অর্থব্যবস্থা",
  "home.h1a": "আপনার প্রথম মিলিয়ন।", "home.h1b": "কোনো রূপকথা নয়।",
  "home.sub": "টাকা বোঝা, পরিকল্পনা করা এবং আর্থিক লক্ষ্যের দিকে এগোনোর একটি পরিষ্কার উপায়।",
  "home.cta2": "টাকার স্ন্যাপশট দিয়ে শুরু করুন",
  "home.privacy": "বিনামূল্যে, ব্যক্তিগত, আপনার ব্রাউজারে চলে। কিছুই আপনার ডিভাইসের বাইরে যায় না।",
  "goal.preview": "লক্ষ্যের পূর্বরূপ", "goal.howLong": "পৌঁছাতে কত সময়", "goal.monthly": "প্রতি মাসের সঞ্চয়",
  "goal.ownOnly": "শুধু আপনার টাকা", "goal.noGrowth": "কোনো বৃদ্ধি ধরা হয়নি",
  "goal.withGrowth": "{r}% কাল্পনিক বৃদ্ধি সহ", "goal.notPrediction": "এটি পূর্বাভাস নয়",
  "goal.tenYears": "১০ বছরে, উদাহরণ হিসেবে:", "goal.youPut": "আপনি জমা করেছেন", "goal.hypGrowth": "কাল্পনিক বৃদ্ধি",
  "goal.usePlan": "এই সংখ্যাগুলো আমার প্ল্যানে ব্যবহার করুন", "goal.reset": "রিসেট", "goal.saved": "প্ল্যানে সেভ হয়েছে",
  "footer.tagline": "হইচই ছাড়া ব্যক্তিগত অর্থব্যবস্থা। ভারতে প্রথমবার সঞ্চয় ও বিনিয়োগকারীদের জন্য।",
  "footer.disclaimer": "Zeno একটি শিক্ষামূলক আর্থিক-পরিকল্পনা প্রোটোটাইপ। সব সিমুলেশন কেবল উদাহরণ, পূর্বাভাস বা গ্যারান্টি নয়। বিনিয়োগের মূল্য কমে যেতে পারে। এই ওয়েবসাইট ব্যক্তিগত আর্থিক পরামর্শ দেয় না।",
  "chat.title": "Zeno AI গাইড", "chat.sub": "SEBI-সামঞ্জস্যপূর্ণ শিক্ষা · পরামর্শ নয়",
  "chat.placeholder": "SIP, FD, মুদ্রাস্ফীতি নিয়ে জিজ্ঞাসা করুন…",
  "chat.explain": "সহজ ভাষায়", "chat.example": "আপনার সংখ্যা দিয়ে ₹ উদাহরণ", "chat.risk": "ঝুঁকি ও সীমাবদ্ধতা",
  "auth.title": "Zeno-তে স্বাগতম", "auth.guest": "এক ক্লিকে ডেমো দেখুন",
  "auth.google": "Google দিয়ে চালিয়ে যান", "auth.apple": "Apple ID দিয়ে চালিয়ে যান",
  "auth.phone": "ফোন OTP (+91)", "auth.email": "ইমেল ও পাসওয়ার্ড",
  "auth.sendOtp": "OTP পাঠান", "auth.verify": "যাচাই করুন", "auth.preferred": "পছন্দের পদ্ধতি", "auth.lastUsed": "শেষবার ব্যবহৃত",
};

const DICTS: Record<Lang, Partial<Record<Key, string>>> = { en, hi, mr, gu, ta, bn };

export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>) {
  let s = DICTS[lang]?.[key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** Translator bound to the language saved in the store. Also keeps <html lang> in sync. */
export function useT() {
  const { state } = useStore();
  const lang = state.profile.lang ?? "en";
  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.code === lang)?.html ?? "en-IN";
  }, [lang]);
  return useCallback((key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
}
