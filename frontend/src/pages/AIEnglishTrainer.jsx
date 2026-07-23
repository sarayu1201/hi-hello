import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Sparkles, BookOpen, MessageSquare, Award, Play, RotateCcw, AlertTriangle, CheckCircle, PenTool, ChevronLeft } from "lucide-react";
import "./AIEnglishTrainer.css";

const BACKEND_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? (window.location.protocol + "//" + window.location.hostname + ":5000") : "");

const SPEAKING_PROMPTS = [
  { id: "prompt_1", title: "Introduce Yourself", desc: "Briefly explain your background, education, and career goals. (Simulates Banking Interview round 1)", expectedKeywords: ["graduate", "career", "banking", "experience", "achieve"] },
  { id: "prompt_2", title: "Why Banking Sector?", desc: "Explain why you want to transition or start your career in public sector banks. (Highly expected in SBI PO)", expectedKeywords: ["growth", "economy", "stability", "customer service", "reputable"] },
  { id: "prompt_3", title: "Explain Inflation", desc: "Explain inflation in simple terms as if explaining to a retail bank customer.", expectedKeywords: ["prices", "purchasing power", "money supply", "goods", "services"] }
];

const PRONUNCIATION_SENTENCES = [
  "The administrative authorities issued a declaration of financial emergency.",
  "Quantitative aptitude and analytical reasoning are crucial skills for bank officers.",
  "Customer relationship management is the cornerstone of modern retail banking operations."
];

const ESSAY_PROMPTS = [
  { id: "essay_1", title: "Impact of Digital Currency on Banking System", placeholder: "Write a 150-250 words essay analyzing how Central Bank Digital Currencies (CBDC) will affect traditional commercial banks..." },
  { id: "essay_2", title: "Role of UPI in Rural Indian Economy", placeholder: "Write an essay detailing the penetration of Unified Payments Interface (UPI) in rural sectors and its contribution to financial inclusion..." }
];

const getOfflineTutorResponse = (query, username = "Candidate", companionName = "SpeakMate") => {
  const q = query.toLowerCase();
  const isTelugu = /[\u0C00-\u0C7F]/.test(query);
  
  if (isTelugu) {
    if (q.includes("నమస్కారం") || q.includes("హలో") || q.includes("నమస్తే")) {
      return {
        corrected: "Hello / Greetings",
        explanation: "Telugu 'నమస్కారం' or 'నమస్తే' are polite greetings that translate to 'Hello' or 'Greetings' in English.",
        reply: `Hello ${username}! It is a pleasure to meet you. I am glad you are practicing with me today.`,
        question: "How has your day been so far?"
      };
    }
    if (q.includes("ఎలా ఉన్నారు") || q.includes("ఎలా ఉన్నావు") || q.includes("బాగున్నావా") || q.includes("బాగున్నారా")) {
      return {
        corrected: "How are you?",
        explanation: "In Telugu, 'ఎలా ఉన్నారు' or 'బాగున్నావా' translates to 'How are you?' in English. Use this when greeting someone.",
        reply: `I am doing great, thank you for asking, ${username}! I hope you are having a wonderful day.`,
        question: "How about you? How are you feeling today?"
      };
    }
    if (q.includes("మార్కెట్") || q.includes("వెళ్తున్నా") || q.includes("వెళ్ళాను")) {
      return {
        corrected: "I went to the market. / I am going to the market.",
        explanation: "Telugu 'నేను మార్కెట్ కి వెళ్తున్నాను' is present continuous and translates to 'I am going to the market.' 'వెళ్ళాను' means 'went' (past tense).",
        reply: "Ah, going to the market is a great daily activity! Did you buy fresh vegetables or groceries?",
        question: "What did you buy at the market?"
      };
    }
    // Generic Telugu fallback
    return {
      corrected: "English translation of your Telugu phrase.",
      explanation: `We detected Telugu input. ${companionName} automatically translates and corrects your phrasing to help you learn English.`,
      reply: `I heard you speak in Telugu! It is a beautiful language. I'm here to help you practice English speaking.`,
      question: "Would you like to try saying that in English, or shall we practice another topic?"
    };
  }
  
  if (q.includes("can you hear me") || q.includes("hear me") || q.includes("test")) {
    return {
      corrected: "None",
      explanation: "None",
      reply: `Yes, I can hear you loud and clear, ${username}! I am ${companionName}, your English learning companion.`,
      question: "How is your preparation going today? Are you ready to practice?"
    };
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return {
      corrected: "None",
      explanation: "None",
      reply: `Hello ${username}! It is wonderful to meet you. I'm excited to practice speaking with you.`,
      question: "Tell me, how has your day been so far?"
    };
  }
  if (q.includes("how are you") || q.includes("how r u")) {
    return {
      corrected: "None",
      explanation: "None",
      reply: `I am doing fantastic, thank you for asking, ${username}! I've been looking forward to our speaking practice.`,
      question: "How about you? How are you feeling today?"
    };
  }
  if (q.includes("thank") || q.includes("thanks")) {
    return {
      corrected: "None",
      explanation: "None",
      reply: `You are very welcome! Helping you learn is my absolute pleasure.`,
      question: "Would you like to try another topic or ask me something else?"
    };
  }
  if (q.includes("what is your name") || q.includes("who are you")) {
    return {
      corrected: "None",
      explanation: "None",
      reply: `I am ${companionName}, your friendly AI English tutor and companion.`,
      question: "What should I call you, or is your name Vinaya?"
    };
  }
  if (q.includes("go market") || q.includes("went market")) {
    return {
      corrected: "I went to the market yesterday.",
      explanation: "Use 'went' because it's past tense, and add 'to the' before market.",
      reply: "Ah, going to the market is a great daily activity! Did you buy fresh vegetables or groceries?",
      question: "What did you buy at the market?"
    };
  }

  if (q.includes("introduce") || q.includes("introduction") || q.includes("myself")) {
    const hasGrammarMistake = q.includes("explain me") || q.includes("give the self");
    return {
      corrected: hasGrammarMistake ? "Can you please explain how to introduce myself?" : "None",
      explanation: hasGrammarMistake ? "Instead of 'explain me the way to give the self introduction', say 'explain how to introduce myself' or 'give a self-introduction'." : "None",
      reply: `I would love to help you with that! Introducing yourself is all about three parts: First, your name and origin. Second, your education or job history. Third, your future career goals. For example: "Hello, my name is ${username}. I graduated in Commerce and I am preparing for bank exams because I am highly interested in the financial sector."`,
      question: "Would you like to try introducing yourself to me now so I can give you feedback?"
    };
  }

  if (q.includes("bank") || q.includes("exam") || q.includes("po") || q.includes("sbi") || q.includes("recruitment")) {
    return {
      corrected: "None",
      explanation: "None",
      reply: `Preparing for bank exams like SBI PO requires solid planning, ${username}. Focus on your quantitative aptitude shortcuts, logical reasoning negatives, and daily English reading to boost speed and accuracy!`,
      question: "Which of these subjects do you find the most challenging in your study plan?"
    };
  }

  if (q.includes("hobby") || q.includes("hobbies") || q.includes("free time") || q.includes("interest")) {
    return {
      corrected: "None",
      explanation: "None",
      reply: `Hobbies are a great way to unwind and refresh your mind between intense study sessions! I enjoy chatting with you, of course. Some people love reading books, playing games, or going for walks.`,
      question: "What do you enjoy doing in your free time, or when you are not studying?"
    };
  }

  if (q.includes("weather") || q.includes("rain") || q.includes("hot") || q.includes("climate")) {
    return {
      corrected: "None",
      explanation: "None",
      reply: `The weather has a huge impact on our mood! A pleasant day makes studying so much more comfortable, whereas extreme heat can make it hard to focus.`,
      question: "How is the weather in your city today? Is it warm or rainy?"
    };
  }
  
  // Dynamic general fallbacks to behave like a true companion
  const randomReplies = [
    {
      reply: `That is a really interesting point, ${username}! I like the way you think. Conversing about different topics is the fastest way to build confidence.`,
      question: "Can you tell me more about that or share another detail?"
    },
    {
      reply: `I completely agree with you! Expressing yourself clearly gets easier the more we talk. You are doing a fantastic job keeping this conversation going.`,
      question: "What other thoughts do you have on this topic?"
    },
    {
      reply: `That sounds wonderful, ${username}! I'm really enjoying our practice session today. Your vocabulary usage is growing nicely.`,
      question: "Shall we continue talking about this, or would you like to choose one of the interview prompts on the left?"
    }
  ];
  const selected = randomReplies[Math.floor(Math.random() * randomReplies.length)];
  return {
    corrected: "None",
    explanation: "None",
    reply: selected.reply,
    question: selected.question
  };
};

function AIAvatar({ state, mouthOpen = false }) {
  return (
    <div className={`ai-avatar-container state-${state}`}>
      <div className="avatar-status-badge">
        <span className={`status-dot ${state}`} />
        <span className="status-text">
          {state === "speaking" ? "AI Speaking" :
           state === "listening" ? "Listening..." :
           state === "thinking" ? "Thinking..." :
           state === "happy" || state === "feedback" ? "Excellent!" : 
           state === "thoughtful" ? "Hmm..." : "AI Companion (Idle)"}
        </span>
      </div>
      <svg width="180" height="180" viewBox="0 0 200 200" className="ai-avatar-svg">
        <defs>
          <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2E4380" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1E2460" stopOpacity="0.0" />
          </radialGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E4380" />
            <stop offset="100%" stopColor="#1E2460" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#E5C158" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="90" fill="url(#faceGlow)" className="ambient-glow" />

        <path d="M 40,105 A 60,60 0 0,1 160,105" fill="none" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" className="headband" />
        <rect x="30" y="85" width="16" height="36" rx="8" fill="url(#goldGrad)" className="headphone-left" />
        <rect x="154" y="85" width="16" height="36" rx="8" fill="url(#goldGrad)" className="headphone-right" />

        <line x1="100" y1="50" x2="100" y2="25" stroke="url(#bodyGrad)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="100" cy="20" r="8" fill="url(#goldGrad)" className="antenna-light" />

        <rect x="50" y="50" width="100" height="90" rx="24" fill="url(#bodyGrad)" stroke="#E5C158" strokeWidth="3" className="head-hull" />

        <circle cx="48" cy="95" r="6" fill="#E5C158" />
        <circle cx="152" cy="95" r="6" fill="#E5C158" />

        <rect x="62" y="65" width="76" height="52" rx="12" fill="#0D1117" stroke="#2E4380" strokeWidth="2" />

        {/* EYES AND EYEBROWS BASED ON EXPRESSION */}
        {state === "happy" || state === "feedback" ? (
          <>
            {/* Arched happy eyebrows */}
            <path d="M 68,52 Q 80,44 92,52" fill="none" stroke="#E5C158" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 108,52 Q 120,44 132,52" fill="none" stroke="#E5C158" strokeWidth="2.5" strokeLinecap="round" />
            {/* Smiling closed eyes */}
            <path d="M 70,82 Q 80,72 90,82" fill="none" stroke="#E5C158" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 110,82 Q 120,72 130,82" fill="none" stroke="#E5C158" strokeWidth="4.5" strokeLinecap="round" />
          </>
        ) : state === "thoughtful" ? (
          <>
            {/* Curious, tilted eyebrows */}
            <path d="M 68,50 Q 80,48 92,56" fill="none" stroke="#E5C158" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 108,56 Q 120,44 132,48" fill="none" stroke="#E5C158" strokeWidth="2.5" strokeLinecap="round" />
            {/* Wide eyes looking upward */}
            <circle cx="80" cy="80" r="8" fill="#E5C158" />
            <circle cx="80" cy="76" r="3" fill="#0D1117" />
            <circle cx="120" cy="80" r="8" fill="#E5C158" />
            <circle cx="120" cy="76" r="3" fill="#0D1117" />
          </>
        ) : state === "thinking" ? (
          <>
            <g className="eye-gear eye-left">
              <circle cx="80" cy="85" r="10" fill="none" stroke="#E5C158" strokeWidth="3" strokeDasharray="6,4" className="spinning-gear" />
              <circle cx="80" cy="85" r="4" fill="#E5C158" />
            </g>
            <g className="eye-gear eye-right">
              <circle cx="120" cy="85" r="10" fill="none" stroke="#E5C158" strokeWidth="3" strokeDasharray="6,4" className="spinning-gear" />
              <circle cx="120" cy="85" r="4" fill="#E5C158" />
            </g>
          </>
        ) : state === "listening" ? (
          <>
            <circle cx="80" cy="85" r="10" fill="#E5C158" className="eye-pulse" />
            <circle cx="80" cy="85" r="3" fill="#000" />
            <circle cx="120" cy="85" r="10" fill="#E5C158" className="eye-pulse" />
            <circle cx="120" cy="85" r="3" fill="#000" />
          </>
        ) : (
          <>
            <ellipse cx="80" cy="85" rx="8" ry="8" fill="#E5C158" className="eye-standard" />
            <ellipse cx="120" cy="85" rx="8" ry="8" fill="#E5C158" className="eye-standard" />
          </>
        )}

        {/* MOUTH BASED ON EXPRESSION & SPEAKING LIP-SYNC */}
        {state === "speaking" ? (
          mouthOpen ? (
            /* Mouth open oval */
            <ellipse cx="100" cy="108" rx="10" ry="7" fill="none" stroke="#E5C158" strokeWidth="3.5" />
          ) : (
            /* Mouth closed straight line */
            <line x1="85" y1="108" x2="115" y2="108" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round" />
          )
        ) : state === "feedback" || state === "happy" ? (
          /* Broad smile */
          <path d="M 78,103 Q 100,122 122,103" fill="none" stroke="#E5C158" strokeWidth="4.5" strokeLinecap="round" />
        ) : state === "thoughtful" ? (
          /* Small concerned/thinking curve */
          <path d="M 88,110 Q 100,105 112,110" fill="none" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round" />
        ) : state === "listening" ? (
          <path d="M 85,105 Q 100,100 115,105" fill="none" stroke="#E5C158" strokeWidth="3" strokeLinecap="round" className="listening-mouth" />
        ) : (
          <line x1="85" y1="105" x2="115" y2="105" stroke="#E5C158" strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

export default function AIEnglishTrainer({ user, requestAuth, navigate }) {
  const [activeTab, setActiveTab] = useState("speaking"); // 'speaking' | 'writing' | 'pronunciation'
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Speaking Room States
  const [selectedPrompt, setSelectedPrompt] = useState(SPEAKING_PROMPTS[0]);
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [speakingFeedback, setSpeakingFeedback] = useState(null);
  const [speakingAIReply, setSpeakingAIReply] = useState("");
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  
  // Pronunciation Coach States
  const [targetSentenceIdx, setTargetSentenceIdx] = useState(0);
  const [isPronouncing, setIsPronouncing] = useState(false);
  const [spokenPronunciation, setSpokenPronunciation] = useState("");
  const [pronunciationScore, setPronunciationScore] = useState(null);

  // Speaking input language state
  const [inputLang, setInputLang] = useState("en-IN"); // "en-IN" or "te-IN"

  // Companion Settings & Chat History States
  const [companionName, setCompanionName] = useState(() => localStorage.getItem("speakmate_companion_name") || "SpeakMate");
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("speakmate_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem("speakmate_chat_history");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      {
        id: "welcome",
        sender: "ai",
        text: `Hello! I am ${localStorage.getItem("speakmate_companion_name") || "SpeakMate"}, your English learning companion. Shall we practice speaking together today? Choose a topic from the sidebar and click the microphone!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("speakmate_companion_name", companionName);
  }, [companionName]);

  useEffect(() => {
    localStorage.setItem("speakmate_api_key", customApiKey);
  }, [customApiKey]);

  useEffect(() => {
    localStorage.setItem("speakmate_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Mouth Open/Close lip-sync states
  const [mouthOpen, setMouthOpen] = useState(false);
  const mouthTimerRef = useRef(null);

  // Gamification States
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("speakmate_xp") || "0"));
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem("speakmate_level") || "1"));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("speakmate_streak") || "1"));
  const [streakLastDate, setStreakLastDate] = useState(() => localStorage.getItem("speakmate_streak_date") || "");
  const [unlockedWords, setUnlockedWords] = useState(() => JSON.parse(localStorage.getItem("speakmate_vocab") || "[]"));
  const [badges, setBadges] = useState(() => JSON.parse(localStorage.getItem("speakmate_badges") || "[]"));
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [floatAmount, setFloatAmount] = useState(0);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("speakmate_xp", xp.toString());
    localStorage.setItem("speakmate_level", level.toString());
    localStorage.setItem("speakmate_streak", streak.toString());
    localStorage.setItem("speakmate_streak_date", streakLastDate);
    localStorage.setItem("speakmate_vocab", JSON.stringify(unlockedWords));
    localStorage.setItem("speakmate_badges", JSON.stringify(badges));
  }, [xp, level, streak, streakLastDate, unlockedWords, badges]);

  // Handle streak verification on mount
  useEffect(() => {
    const todayStr = new Date().toDateString();
    if (streakLastDate && streakLastDate !== todayStr) {
      const lastDate = new Date(streakLastDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        setStreak(1); // Reset streak if missed a day
      }
    }
  }, []);

  // Sync mouth movement with speech synthesis
  useEffect(() => {
    if (isSpeaking) {
      mouthTimerRef.current = setInterval(() => {
        setMouthOpen((open) => !open);
      }, 130);
    } else {
      clearInterval(mouthTimerRef.current);
      setMouthOpen(false);
    }
    return () => clearInterval(mouthTimerRef.current);
  }, [isSpeaking]);

  const awardXP = (amount) => {
    setFloatAmount(amount);
    setShowXpFloat(true);
    setTimeout(() => setShowXpFloat(false), 2000);

    setXp((prevXp) => {
      const newXp = prevXp + amount;
      const neededXP = level * 100;
      if (newXp >= neededXP) {
        setLevel((prevLevel) => prevLevel + 1);
        unlockBadge("level_up", `Level ${level + 1} Achieved!`, "Leveled up by accumulating experience points!");
        return newXp - neededXP;
      }
      return newXp;
    });

    const todayStr = new Date().toDateString();
    if (streakLastDate !== todayStr) {
      if (streakLastDate) {
        const lastDate = new Date(streakLastDate);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          setStreak((prev) => prev + 1);
        }
      }
      setStreakLastDate(todayStr);
    }
  };

  const unlockBadge = (id, name, desc = "") => {
    setBadges((prevBadges) => {
      if (prevBadges.some((b) => b.id === id)) return prevBadges;
      return [...prevBadges, { id, name, desc, date: new Date().toLocaleDateString() }];
    });
  };

  const checkVocabUnlock = (text) => {
    const textLower = text.toLowerCase();
    const targetWords = ["quantitative", "aptitude", "relationship", "emergency", "inflation", "market", "finance", "graduation", "career", "stabilize"];
    const foundWords = targetWords.filter(word => textLower.includes(word) && !unlockedWords.includes(word));
    
    if (foundWords.length > 0) {
      setUnlockedWords((prev) => [...prev, ...foundWords]);
      awardXP(foundWords.length * 15);
    }
  };

  // Writing Room States
  const [selectedEssay, setSelectedEssay] = useState(ESSAY_PROMPTS[0]);
  const [essayContent, setEssayContent] = useState("");
  const [isAnalyzingEssay, setIsAnalyzingEssay] = useState(false);
  const [essayFeedback, setEssayFeedback] = useState(null);

  // Web Speech API recognition instances
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    // Initialise Web Speech API if supported by the browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = activeTab === "pronunciation" ? "en-IN" : inputLang; // Set to selected language, fallback to English for pronunciation coach

      rec.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        transcriptRef.current = transcript;
        
        if (activeTab === "speaking") {
          setSpeechText(transcript);
        } else if (activeTab === "pronunciation") {
          setSpokenPronunciation(transcript);
        }
      };

      rec.onerror = (err) => {
        console.error("Speech Recognition Error: ", err);
        setIsListening(false);
        setIsPronouncing(false);
      };

      rec.onend = () => {
        setIsListening(false);
        setIsPronouncing(false);
        
        const capturedText = transcriptRef.current.trim();
        if (capturedText) {
          transcriptRef.current = ""; // Reset
          if (activeTab === "speaking") {
            analyzeSpeechPerformance(capturedText);
          } else if (activeTab === "pronunciation") {
            evaluatePronunciation(capturedText);
          }
        }
      };

      recognitionRef.current = rec;
    }
  }, [activeTab, inputLang]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeTab]);

  const toggleListening = () => {
    if (!requestAuth()) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      
      transcriptRef.current = "";
      setSpeechText("");
      setSpeakingFeedback(null);
      setSpeakingAIReply("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        alert("Speech recognition is already active or failed to start. Please try again.");
      }
    }
  };

  const analyzeSpeechPerformance = async (textVal) => {
    const text = textVal || speechText;
    if (!text) {
      alert("No speech captured. Please speak into your microphone.");
      return;
    }

    setIsProcessingSpeech(true);

    // Create user message and append to chat log
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory(prev => [...prev, userMsg]);

    // Format chat history for Gemini API
    const geminiHistory = chatHistory.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));
    geminiHistory.push({
      role: "user",
      parts: [{ text: `Student Level: Beginner\nRecent Mistakes: None\nStudent Message: ${text}` }]
    });

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/english-trainer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "speaking",
          query: text,
          user_level: "Beginner",
          recent_mistakes: "",
          companionName,
          customApiKey,
          history: geminiHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.reply || "";

        // Parse custom response format
        const correctedMatch = reply.match(/Corrected Sentence:\s*([\s\S]*?)(?=\n\nExplanation:|\nExplanation:|$)/i);
        const explanationMatch = reply.match(/Explanation:\s*([\s\S]*?)(?=\n\nReply:|\nReply:|$)/i);
        const replyMatch = reply.match(/Reply:\s*([\s\S]*?)(?=\n\nQuestion:|\nQuestion:|$)/i);
        const questionMatch = reply.match(/Question:\s*([\s\S]*?)$/i);

        const correctedText = correctedMatch ? correctedMatch[1].trim() : "None";
        const explanationText = explanationMatch ? explanationMatch[1].trim() : "None";
        const bodyText = replyMatch ? replyMatch[1].trim() : reply;
        const questionText = questionMatch ? questionMatch[1].trim() : "";

        const finalAIReply = bodyText + (questionText ? "\n\n" + questionText : "");

        const lowerText = text.toLowerCase();
        const fillers = (lowerText.match(/\b(um|uh|like|you know|so)\b/g) || []).length;
        const matchedKeywords = selectedPrompt.expectedKeywords.filter(k => lowerText.includes(k));
        const wordsCount = text.trim().split(/\s+/).length;

        const isPerfect = correctedText.toLowerCase() === "none" || correctedText === "";
        const scoreVal = isPerfect ? 95 : 75;

        // Gamification awards
        awardXP(isPerfect ? 35 : 15);
        checkVocabUnlock(text);
        if (isPerfect) {
          unlockBadge("grammar_guru", "Grammar Guru", "Spoke a grammatically perfect English sentence!");
        }
        if (wordsCount > 10) {
          unlockBadge("first_steps", "First Steps", "Spoke more than 10 words in a single turn!");
        }
        const speedVal = Math.round((wordsCount / 1) * 60);
        if (speedVal > 100) {
          unlockBadge("speedy", "Speedy Speaker", "Spoke at a conversational speed of over 100 WPM!");
        }

        setSpeakingFeedback({
          score: scoreVal,
          fillers,
          wordCount: wordsCount,
          speechSpeed: speedVal,
          matchedKeywords,
          grammarChecks: isPerfect ? "Excellent" : `Mistake: ${explanationText}`,
          fillerReport: fillers > 2 
            ? "High filler words. Try to pause naturally rather than using 'um' or 'like'."
            : "Excellent control! Very few filler words.",
          correctedSentence: correctedText,
          explanation: explanationText
        });
        setSpeakingAIReply(finalAIReply);

        // Add AI response message to chat history
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: finalAIReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          feedback: {
            score: scoreVal,
            correctedSentence: correctedText,
            explanation: explanationText
          }
        };
        setChatHistory(prev => [...prev, aiMsg]);

        setIsProcessingSpeech(false);

        // Auto-speak feedback like a companion
        const isInputTelugu = /[\u0C00-\u0C7F]/.test(text) || inputLang === "te-IN";
        let spokenText = "";
        if (correctedText.toLowerCase() !== "none" && correctedText !== "") {
          if (isInputTelugu) {
            spokenText = `The way to speak this in English is: "${correctedText}". ${explanationText}. ${bodyText} ${questionText}`;
          } else {
            spokenText = `A better way to say this in English is: "${correctedText}". ${explanationText}. ${bodyText} ${questionText}`;
          }
        } else {
          spokenText = `${bodyText} ${questionText}`;
        }
        speakPromptText(spokenText, true);
        return;
      } else {
        try {
          const errorData = await response.json();
          console.warn("Server API error, falling back to offline mode:", errorData.error);
        } catch (e) {
          console.warn("Server API error, falling back to offline mode.");
        }
      }
    } catch (err) {
      console.warn("Speaking AI analysis failed, falling back to simulated results:", err);
    }

    // Offline / Network Failure Fallback
    setTimeout(() => {
      const username = user?.name || "Vinaya";
      const offlineResult = getOfflineTutorResponse(text, username, companionName);

      const words = text.trim().split(/\s+/);
      const wordCount = words.length;
      const lowerText = text.toLowerCase();
      const fillers = (lowerText.match(/\b(um|uh|like|you know|so)\b/g) || []).length;
      const matchedKeywords = selectedPrompt.expectedKeywords.filter(k => lowerText.includes(k));
      const speechSpeed = Math.round((wordCount / 1) * 60);

      const isCorrect = offlineResult.corrected.toLowerCase() === "none";
      const finalScore = isCorrect ? 95 : 70;

      // Gamification rewards
      awardXP(isCorrect ? 35 : 15);
      checkVocabUnlock(text);
      if (isCorrect) {
        unlockBadge("grammar_guru", "Grammar Guru", "Spoke a grammatically perfect English sentence!");
      }
      if (wordCount > 10) {
        unlockBadge("first_steps", "First Steps", "Spoke more than 10 words in a single turn!");
      }
      if (speechSpeed > 100) {
        unlockBadge("speedy", "Speedy Speaker", "Spoke at a conversational speed of over 100 WPM!");
      }

      setSpeakingFeedback({
        score: finalScore,
        fillers,
        wordCount,
        speechSpeed,
        matchedKeywords,
        grammarChecks: isCorrect ? "Excellent" : `Mistake: ${offlineResult.explanation}`,
        fillerReport: fillers > 2 
          ? "High filler words. Try to pause naturally rather than using 'um' or 'like'."
          : "Excellent control! Very few filler words.",
        correctedSentence: offlineResult.corrected,
        explanation: offlineResult.explanation
      });

      const finalAIReply = offlineResult.reply + "\n\n" + offlineResult.question;
      setSpeakingAIReply(finalAIReply);

      // Add AI offline response to chat history
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: finalAIReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: {
          score: finalScore,
          correctedSentence: offlineResult.corrected,
          explanation: offlineResult.explanation
        }
      };
      setChatHistory(prev => [...prev, aiMsg]);

      setIsProcessingSpeech(false);

      const isInputTelugu = /[\u0C00-\u0C7F]/.test(text) || inputLang === "te-IN";
      let spokenText = "";
      if (!isCorrect) {
        if (isInputTelugu) {
          spokenText = `The way to speak this in English is: "${offlineResult.corrected}". ${offlineResult.explanation}. ${offlineResult.reply} ${offlineResult.question}`;
        } else {
          spokenText = `A better way to say this in English is: "${offlineResult.corrected}". ${offlineResult.explanation}. ${offlineResult.reply} ${offlineResult.question}`;
        }
      } else {
        spokenText = `${offlineResult.reply} ${offlineResult.question}`;
      }
      speakPromptText(spokenText, true);
    }, 1500);
  };

  // Pronunciation Coach Toggle
  const togglePronouncing = () => {
    if (!requestAuth()) return;
    
    if (isPronouncing) {
      recognitionRef.current?.stop();
      setIsPronouncing(false);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      
      transcriptRef.current = "";
      setSpokenPronunciation("");
      setPronunciationScore(null);
      try {
        recognitionRef.current?.start();
        setIsPronouncing(true);
      } catch (e) {
        alert("Microphone failed to start.");
      }
    }
  };

  const evaluatePronunciation = async (textVal) => {
    const text = textVal || spokenPronunciation;
    if (!text) {
      alert("No pronunciation detected. Please say the sentence clearly.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/english-trainer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "pronunciation",
          expected: PRONUNCIATION_SENTENCES[targetSentenceIdx],
          recognized: text
        })
      });

      if (response.ok) {
        const data = await response.json();
        const cleanJson = data.reply.replace(/```json/gi, "").replace(/```/g, "").trim();
        const result = JSON.parse(cleanJson);

        const targetWords = PRONUNCIATION_SENTENCES[targetSentenceIdx].toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(/\s+/);
        const evaluatedWords = targetWords.map(tWord => {
          const isMiss = (result.mispronounced_words || []).some(w => w.toLowerCase().includes(tWord)) || 
                         (result.missing_words || []).some(w => w.toLowerCase().includes(tWord));
          return { word: tWord, correct: !isMiss };
        });

        setPronunciationScore({
          accuracy: result.accuracy_score || 0,
          wordsReport: evaluatedWords
        });
        return;
      }
    } catch (err) {
      console.warn("Pronunciation AI analysis failed, falling back to substring evaluation:", err);
    }

    // Fallback Evaluation
    const target = PRONUNCIATION_SENTENCES[targetSentenceIdx].toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    const spoken = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    
    const targetWords = target.split(/\s+/);
    const spokenWords = spoken.split(/\s+/);
    
    let matchedCount = 0;
    const evaluatedWords = targetWords.map(tWord => {
      const match = spokenWords.includes(tWord);
      if (match) matchedCount++;
      return { word: tWord, correct: match };
    });

    const accuracy = Math.round((matchedCount / targetWords.length) * 100);
    
    setPronunciationScore({
      accuracy,
      wordsReport: evaluatedWords
    });
  };

  // Essay Scoring System
  const analyzeEssay = async () => {
    if (!requestAuth()) return;
    if (!essayContent.trim()) {
      alert("Please write or paste your essay first.");
      return;
    }

    setIsAnalyzingEssay(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/english-trainer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "essay",
          essay: essayContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        const cleanJson = data.reply.replace(/```json/gi, "").replace(/```/g, "").trim();
        const result = JSON.parse(cleanJson);

        setEssayFeedback({
          grade: result.grade || 0,
          wordCount: result.wordCount || essayContent.trim().split(/\s+/).length,
          spellingErrors: result.spellingErrors || [],
          readability: result.readability || "Medium",
          grammarScore: result.grammarScore || "Good",
          essayRatingReport: result.essayRatingReport || ""
        });
        setIsAnalyzingEssay(false);
        return;
      }
    } catch (err) {
      console.warn("Essay AI analysis failed, falling back to offline evaluator:", err);
    }

    // Fallback Essay Scoring
    setTimeout(() => {
      const words = essayContent.trim().split(/\s+/);
      const wordCount = words.length;

      let score = 5.0;
      if (wordCount >= 150 && wordCount <= 250) score += 2.5;
      else if (wordCount > 250) score += 1.5;
      else score += 0.5;

      const spellingErrors = [];
      const lowerEssay = essayContent.toLowerCase();
      const commonMispellings = [
        { wrong: "recieve", right: "receive" },
        { wrong: "goverment", right: "government" },
        { wrong: "financialy", right: "financially" },
        { wrong: "reponsibility", right: "responsibility" }
      ];

      commonMispellings.forEach(item => {
        if (lowerEssay.includes(item.wrong)) spellingErrors.push(item);
      });

      if (spellingErrors.length === 0) score += 2.0;
      else score -= (spellingErrors.length * 0.5);

      const finalGrade = Math.min(10, Math.max(1, parseFloat(score.toFixed(1))));

      setEssayFeedback({
        grade: finalGrade,
        wordCount,
        spellingErrors,
        readability: wordCount > 180 ? "High (Suitable for Bank Exams)" : "Medium",
        grammarScore: finalGrade >= 8 ? "Excellent" : finalGrade >= 6.5 ? "Good" : "Needs Improvement",
        essayRatingReport: finalGrade >= 8 
          ? "Strong structure, rich vocabulary, and correct word limit. Excellent for descriptive paper."
          : finalGrade >= 6.5 
            ? "Good grammar. Work on expanding key points. Ensure paragraphs transition smoothly."
            : "Review word limits (Aim for 200 words). Check for spelling errors and run-on sentences."
      });
      setIsAnalyzingEssay(false);
    }, 1800);
  };

  const speakPromptText = (text, forceSpeak = false) => {
    const SpeechSynthesis = window.speechSynthesis;
    if (SpeechSynthesis) {
      if (isSpeaking && !forceSpeak) {
        SpeechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        SpeechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance; // Prevents garbage collection crash in Chrome
        utterance.lang = "en-US";
        utterance.rate = 0.95;
        utterance.onstart = () => {
          setIsSpeaking(true);
        };
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
        };
        SpeechSynthesis.speak(utterance);
      }
    }
  };

  let avatarState = "idle";
  if (isSpeaking) {
    avatarState = "speaking";
  } else if (isListening) {
    avatarState = "listening";
  } else if (isProcessingSpeech) {
    avatarState = "thinking";
  } else if (speakingFeedback) {
    const isCorrect = !speakingFeedback.correctedSentence || speakingFeedback.correctedSentence.toLowerCase() === "none" || speakingFeedback.correctedSentence.toLowerCase() === "none.";
    avatarState = isCorrect ? "happy" : "thoughtful";
  }

  let pronAvatarState = "idle";
  if (isSpeaking) {
    pronAvatarState = "speaking";
  } else if (isPronouncing) {
    pronAvatarState = "listening";
  } else if (pronunciationScore) {
    pronAvatarState = "feedback";
  }

  return (
    <div className="trainer-page">
      <div className="back-home-wrapper">
        <button className="btn-back-home" onClick={() => navigate("home")}>
          <ChevronLeft size={16} /> Back to Home
        </button>
      </div>
      <div className="page-hero">
        <h1>AI <span>English Trainer</span></h1>
        <p>Real offline-training feel. Practice speaking, essay composition, and pronunciation with automated feedback.</p>
      </div>

      <div className="trainer-body">
        {/* Navigation Tabs */}
        <div className="trainer-tabs">
          <button 
            className={`trainer-tab-btn ${activeTab === "speaking" ? "active" : ""}`}
            onClick={() => setActiveTab("speaking")}
          >
            🎙️ Voice Speaking Room
          </button>
          <button 
            className={`trainer-tab-btn ${activeTab === "writing" ? "active" : ""}`}
            onClick={() => setActiveTab("writing")}
          >
            ✍️ Descriptive Writing Room
          </button>
          <button 
            className={`trainer-tab-btn ${activeTab === "pronunciation" ? "active" : ""}`}
            onClick={() => setActiveTab("pronunciation")}
          >
            🗣️ Pronunciation Coach
          </button>
        </div>

        {/* SPEAKING ROOM VIEW */}
        {activeTab === "speaking" && (
          <div className="speaking-room">
            <div className="speaking-layout">
              {/* Prompts list sidebar and Gamification Dashboard */}
              <div className="speaking-prompts-sidebar-wrapper" style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "280px" }}>
                <div className="speaking-prompts-sidebar">
                  <h3>Select Interview Prompt:</h3>
                  <div className="prompts-list">
                    {SPEAKING_PROMPTS.map(p => (
                      <button 
                        key={p.id}
                        className={`prompt-select-btn ${selectedPrompt.id === p.id ? "active" : ""}`}
                        onClick={() => {
                          setSelectedPrompt(p);
                          setSpeechText("");
                          setSpeakingFeedback(null);
                          setSpeakingAIReply("");
                        }}
                      >
                        <h4>{p.title}</h4>
                        <p>{p.desc.substring(0, 50)}...</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gamification Panel */}
                <div className="gamification-panel">
                  <h3>🏆 Coach Progression</h3>
                  
                  {/* Streak Card */}
                  <div className="streak-widget">
                    <span className="streak-fire-icon">🔥</span>
                    <div className="streak-info">
                      <span className="streak-count">{streak} Day Streak</span>
                      <span className="streak-hint">Practice daily to build habits!</span>
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="xp-widget">
                    <div className="xp-header">
                      <span>Level {level}</span>
                      <span>{xp} / {level * 100} XP</span>
                    </div>
                    <div className="xp-progress-bar">
                      <div 
                        className="xp-progress-fill" 
                        style={{ width: `${Math.min(100, (xp / (level * 100)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Badges Earned */}
                  <div className="badges-widget">
                    <h4>Earned Badges ({badges.length})</h4>
                    {badges.length === 0 ? (
                      <p className="no-badges-text">Practice speaking to earn badges!</p>
                    ) : (
                      <div className="badges-grid-mini">
                        {badges.map(b => (
                          <div className="mini-badge" key={b.id} title={`${b.name}: ${b.desc}`}>
                            🏅 {b.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vocabulary Unlocked */}
                  <div className="vocab-widget">
                    <h4>Unlocked Vocab ({unlockedWords.length})</h4>
                    {unlockedWords.length === 0 ? (
                      <p className="no-vocab-text">Use advanced words in your answers.</p>
                    ) : (
                      <div className="vocab-tags-flex">
                        {unlockedWords.map(w => (
                          <span className="vocab-tag-unlocked" key={w}>
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active voice console */}
              <div className="speaking-main-console">
                <div className="prompt-display-card">
                  <div className="pd-header">
                    <span>Active Prompt Practice</span>
                    <button className="btn-audio-listen" onClick={() => speakPromptText(selectedPrompt.desc)}>
                      <Play size={12}/> Listen to Prompt
                    </button>
                  </div>
                  <h3>{selectedPrompt.title}</h3>
                  <p>{selectedPrompt.desc}</p>
                  <div className="expected-keywords-bar">
                    <strong>Expected Keywords:</strong>
                    {selectedPrompt.expectedKeywords.map(k => (
                      <span className="keyword-tag" key={k}>{k}</span>
                    ))}
                  </div>
                </div>

                <div className="language-selector">
                  <span className="selector-label">I want to speak in:</span>
                  <div className="selector-buttons">
                    <button 
                      onClick={() => setInputLang("en-IN")} 
                      className={`lang-btn ${inputLang === "en-IN" ? "active" : ""}`}
                    >
                      🇺🇸 English
                    </button>
                    <button 
                      onClick={() => setInputLang("te-IN")} 
                      className={`lang-btn ${inputLang === "te-IN" ? "active" : ""}`}
                    >
                      🇮🇳 Telugu (తెలుగు)
                    </button>
                  </div>
                </div>

                <div className="companion-console-card">
                  <div className="companion-console-header">
                    <div className="c-header-left">
                      <Sparkles size={16} color="var(--accent)" />
                      <h3>AI Companion: <span className="companion-active-name">{companionName}</span></h3>
                    </div>
                    <div className="c-header-actions">
                      <button 
                        className="btn-clear-chat" 
                        title="Clear Conversation"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to clear the conversation?")) {
                            setChatHistory([
                              {
                                id: "welcome",
                                sender: "ai",
                                text: `Hello! I am ${companionName}, your English learning companion. Shall we practice speaking together today? Choose a topic from the sidebar and click the microphone!`,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                            ]);
                            setSpeechText("");
                            setSpeakingFeedback(null);
                            setSpeakingAIReply("");
                          }
                        }}
                      >
                        <RotateCcw size={14} /> Clear Chat
                      </button>
                      <button 
                        className={`btn-toggle-settings ${showSettings ? "active" : ""}`} 
                        title="Companion Settings"
                        onClick={() => setShowSettings(!showSettings)}
                      >
                        ⚙️ Settings
                      </button>
                    </div>
                  </div>

                  {/* Settings Widget */}
                  {showSettings && (
                    <div className="companion-settings-panel">
                      <h4>Configure Your AI Companion</h4>
                      <div className="settings-field">
                        <label>AI Companion Name:</label>
                        <input 
                          type="text" 
                          placeholder="e.g. SpeakMate, Alex, Sophia" 
                          value={companionName} 
                          onChange={(e) => setCompanionName(e.target.value)} 
                        />
                      </div>
                      <div className="settings-field">
                        <label>Custom Gemini API Key (optional):</label>
                        <input 
                          type="password" 
                          placeholder="Enter your AI Studio API Key" 
                          value={customApiKey} 
                          onChange={(e) => setCustomApiKey(e.target.value)} 
                        />
                        <span className="settings-hint">
                          If left blank, the server will fall back to the backend's `.env` configuration.
                        </span>
                      </div>
                      <button className="btn-save-settings" onClick={() => setShowSettings(false)}>
                        Apply & Save
                      </button>
                    </div>
                  )}

                  {/* API Key Info Card */}
                  {!customApiKey && (
                    <div className="api-key-warning-card" style={{ background: "rgba(46, 67, 128, 0.04)", border: "1.5px solid var(--border)", color: "var(--navy)" }}>
                      <Sparkles size={16} color="var(--blue)" />
                      <div>
                        <strong>Using Default Server Key</strong>
                        <p>To use your personal Gemini API key, open Settings and paste your key. Otherwise, the trainer uses the default server-configured key.</p>
                      </div>
                    </div>
                  )}

                  {/* Scrollable Chat Area */}
                  <div className="chat-log-scroll-area">
                    {chatHistory.map(msg => (
                      <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                        <div className="chat-bubble">
                          <div className="bubble-header">
                            <span className="sender-name">{msg.sender === "user" ? (user?.name || "You") : companionName}</span>
                            <span className="bubble-time">{msg.timestamp}</span>
                          </div>
                          <p className="bubble-text">{msg.text}</p>
                          
                          {/* Render grammar details in the history for AI messages if available */}
                          {msg.sender === "ai" && msg.feedback && msg.feedback.correctedSentence && msg.feedback.correctedSentence.toLowerCase() !== "none" && msg.feedback.correctedSentence.toLowerCase() !== "none." && (
                            <div className="bubble-feedback-details">
                              <div className="bfd-title">🇮🇳 Translation / Suggested English Phrasing:</div>
                              <div className="bfd-corrected">"{msg.feedback.correctedSentence}"</div>
                              {msg.feedback.explanation && msg.feedback.explanation.toLowerCase() !== "none" && (
                                <div className="bfd-explanation"><strong>Tip:</strong> {msg.feedback.explanation}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="voice-recorder-card">
                    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
                      <AIAvatar state={avatarState} mouthOpen={mouthOpen} />
                      {showXpFloat && (
                        <div className="xp-float-bubble">
                          +{floatAmount} XP
                        </div>
                      )}
                    </div>
                    
                    {/* Voice recording wave animation */}
                    {isListening && (
                      <div className="voice-wave-container">
                        <div className="voice-wave-bar"></div>
                        <div className="voice-wave-bar"></div>
                        <div className="voice-wave-bar flex-long"></div>
                        <div className="voice-wave-bar flex-short"></div>
                        <div className="voice-wave-bar"></div>
                        <span className="listening-tag">Listening... Speak in {inputLang === "te-IN" ? "Telugu" : "English"} now!</span>
                      </div>
                    )}

                    {!isListening && (
                      <div className="recorder-controls">
                        <button 
                          className="btn-mic-record"
                          onClick={toggleListening}
                        >
                          <Mic size={24}/>
                        </button>
                        <span className="mic-hint">
                          Click Microphone to Start Speaking
                        </span>
                      </div>
                    )}
                    
                    {isListening && (
                      <div className="recorder-controls">
                        <button 
                          className="btn-mic-record active"
                          onClick={toggleListening}
                        >
                          <MicOff size={24}/>
                        </button>
                        <span className="mic-hint">
                          Click to Stop & Analyze
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isProcessingSpeech && (
                  <div className="processing-indicator">
                    <Sparkles size={18} className="spin-icon"/>
                    <span>AI Trainer is evaluating your response...</span>
                  </div>
                )}

                {/* AI Spoken Trainer Feedback */}
                {speakingFeedback && (
                  <div className="feedback-result-block">
                    <div className="feedback-stats">
                      <div className="f-stat-item">
                        <span className="f-num">{speakingFeedback.score}%</span>
                        <span className="f-label">Fluency Score</span>
                      </div>
                      <div className="f-stat-item">
                        <span className="f-num">{speakingFeedback.wordCount}</span>
                        <span className="f-label">Words Spoken</span>
                      </div>
                      <div className="f-stat-item">
                        <span className="f-num">{speakingFeedback.fillerReport.includes("Excellent") ? "Low" : "High"}</span>
                        <span className="f-label">Filler Words</span>
                      </div>
                      <div className="f-stat-item">
                        <span className="f-num">{speakingFeedback.speechSpeed}</span>
                        <span className="f-label">Speed (WPM)</span>
                      </div>
                    </div>

                    {speakingFeedback.correctedSentence && speakingFeedback.correctedSentence.toLowerCase() !== "none" && speakingFeedback.correctedSentence.toLowerCase() !== "none." && (
                      <div className="corrected-sentence-box" style={{
                        background: /[\u0C00-\u0C7F]/.test(speechText) ? "rgba(46, 67, 128, 0.03)" : "rgba(239, 68, 68, 0.03)",
                        border: /[\u0C00-\u0C7F]/.test(speechText) ? "1.5px solid var(--blue)" : "1.5px solid var(--red)",
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "20px",
                        fontSize: "14.5px",
                        color: "var(--text)",
                        textAlign: "left"
                      }}>
                        <div style={{ fontWeight: "800", color: /[\u0C00-\u0C7F]/.test(speechText) ? "var(--blue)" : "var(--red)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                          {/[\u0C00-\u0C7F]/.test(speechText) ? "🇮🇳 English Translation & Phrasing:" : "❌ Suggested Phrasing / Correction:"}
                        </div>
                        <div style={{ color: "var(--text)", fontWeight: "700", fontStyle: "italic", marginBottom: "8px", background: "var(--white)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                          "{speakingFeedback.correctedSentence}"
                        </div>
                        {speakingFeedback.explanation && speakingFeedback.explanation.toLowerCase() !== "none" && speakingFeedback.explanation.toLowerCase() !== "none." && (
                          <div style={{ fontSize: "13px", color: "var(--muted)", paddingTop: "8px", borderTop: "1px dashed var(--border)", lineHeight: "1.5" }}>
                            <strong>💡 Conversation Tip:</strong> {speakingFeedback.explanation}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {(!speakingFeedback.correctedSentence || speakingFeedback.correctedSentence.toLowerCase() === "none" || speakingFeedback.correctedSentence.toLowerCase() === "none.") && (
                      <div className="corrected-sentence-box" style={{
                        background: "rgba(16, 185, 129, 0.05)",
                        border: "1.5px solid var(--green)",
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "20px",
                        fontSize: "14.5px",
                        color: "var(--text)"
                      }}>
                        <div style={{ fontWeight: "800", color: "var(--green)", display: "flex", alignItems: "center", gap: "6px" }}>
                          ✓ Perfect Pronunciation & Grammar!
                        </div>
                      </div>
                    )}

                    <div className="coach-advice-box">
                      <div className="coach-avatar">🤗</div>
                      <div className="coach-bubble" style={{ textAlign: "left" }}>
                        <h4>{companionName} English Companion</h4>
                        <p className="coach-text">{speakingAIReply}</p>
                        <div className="coach-tips">
                          <strong>💡 Fluency Tip:</strong> {speakingFeedback.fillerReport}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DESCRIPTIVE WRITING VIEW */}
        {activeTab === "writing" && (
          <div className="writing-room">
            <div className="writing-layout">
              <div className="writing-sidebar">
                <h3>Select Writing Topic:</h3>
                <div className="essay-topics-list">
                  {ESSAY_PROMPTS.map(e => (
                    <button 
                      key={e.id}
                      className={`essay-topic-btn ${selectedEssay.id === e.id ? "active" : ""}`}
                      onClick={() => {
                        setSelectedEssay(e);
                        setEssayContent("");
                        setEssayFeedback(null);
                      }}
                    >
                      <PenTool size={16}/>
                      <span>{e.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="writing-main">
                <div className="essay-guide-card">
                  <span>Descriptive Test Prep (Bank PO / SSC CGL)</span>
                  <h3>{selectedEssay.title}</h3>
                  <p>Type your essay below (Word count guide: 150-250 words).</p>
                </div>

                <div className="essay-textarea-wrapper">
                  <textarea
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    placeholder={selectedEssay.placeholder}
                    maxLength={2000}
                    disabled={isAnalyzingEssay}
                  />
                  <div className="essay-meta-footer">
                    <span>Words: <strong>{essayContent.trim() === "" ? 0 : essayContent.trim().split(/\s+/).length}</strong></span>
                    <button 
                      className="btn-analyze-essay" 
                      onClick={analyzeEssay}
                      disabled={isAnalyzingEssay || essayContent.trim() === ""}
                    >
                      {isAnalyzingEssay ? "Analyzing Structure..." : "Submit for AI Analysis"}
                    </button>
                  </div>
                </div>

                {essayFeedback && (
                  <div className="essay-feedback-card">
                    <div className="ef-header">
                      <div className="ef-grade">
                        <span className="grade-val">{essayFeedback.grade} / 10</span>
                        <span className="grade-lbl">AI Descriptive Grade</span>
                      </div>
                      <div className="ef-meta">
                        <div>Readability Index: <strong>{essayFeedback.readability}</strong></div>
                        <div>Grammar rating: <strong>{essayFeedback.grammarScore}</strong></div>
                      </div>
                    </div>

                    <div className="ef-report">
                      <h4>📝 Descriptive Performance Evaluation:</h4>
                      <p>{essayFeedback.essayRatingReport}</p>
                    </div>

                    {essayFeedback.spellingErrors.length > 0 ? (
                      <div className="ef-errors">
                        <h4>⚠️ Grammar / Spelling Warnings flagged:</h4>
                        <ul>
                          {essayFeedback.spellingErrors.map((err, i) => (
                            <li key={i}>
                              Detected <strong>"{err.wrong}"</strong>. Correct spelling is <strong>"{err.right}"</strong>.
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="ef-success-tag">
                        <CheckCircle size={16}/> No spelling errors flagged! Clean vocabulary syntax.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRONUNCIATION COACH VIEW */}
        {activeTab === "pronunciation" && (
          <div className="pronunciation-coach">
            <div className="pron-card">
              <AIAvatar state={pronAvatarState} mouthOpen={mouthOpen} />
              <span>Pronunciation Accent Coach</span>
              <h2>Speak the Sentence below:</h2>
              
              <div className="pron-target-sentence">
                "{PRONUNCIATION_SENTENCES[targetSentenceIdx]}"
              </div>

              <div className="pron-coach-controls">
                <button 
                  className={`btn-pronounce-record ${isPronouncing ? "active" : ""}`}
                  onClick={togglePronouncing}
                >
                  {isPronouncing ? <MicOff size={22}/> : <Mic size={22}/>}
                </button>
                <div className="pron-hints">
                  <strong>
                    {isPronouncing ? "Listening... Speak sentence now!" : "Click microphone, read out loud, click stop"}
                  </strong>
                </div>
              </div>

              {spokenPronunciation && (
                <div className="spoken-transcription-result">
                  <h4>We heard:</h4>
                  <p className="spoken-text">"{spokenPronunciation}"</p>
                </div>
              )}

              {pronunciationScore && (
                <div className="pron-score-report">
                  <div className="pron-score-gauge">
                    <div className="gauge-val">{pronunciationScore.accuracy}%</div>
                    <div className="gauge-lbl">Pronunciation Accuracy</div>
                  </div>

                  <div className="pron-words-visualizer">
                    <h4>Word-by-Word Matching:</h4>
                    <div className="words-flex">
                      {pronunciationScore.wordsReport.map((w, idx) => (
                        <span 
                          key={idx} 
                          className={`visual-word ${w.correct ? "match" : "miss"}`}
                        >
                          {w.word}
                        </span>
                      ))}
                    </div>
                    <span className="visualizer-caption">
                      (Words highlighted in gold are correct. Words in red were skipped or mispronounced.)
                    </span>
                  </div>
                </div>
              )}

              <div className="pron-footer-navigation">
                <button 
                  className="btn-next-sentence"
                  onClick={() => {
                    setTargetSentenceIdx((targetSentenceIdx + 1) % PRONUNCIATION_SENTENCES.length);
                    setSpokenPronunciation("");
                    setPronunciationScore(null);
                  }}
                >
                  Try Another Sentence &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
