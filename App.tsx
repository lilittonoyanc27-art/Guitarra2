import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  HelpCircle, 
  Award, 
  Play, 
  BookOpen, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Info,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  GitCommit,
  Layers,
  Flame,
  Globe,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SPANISH_WORDS, GUITAR_CHORDS, STRING_FREQUENCIES, STRING_NAMES, SpanishWord, GuitarChord } from './words';

export default function App() {
  // Navigation / Views: 'lessons' | 'game' | 'freestyle'
  const [activeTab, setActiveTab] = useState<'lessons' | 'game' | 'freestyle'>('lessons');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.8);
  
  // Audio context ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Lesson state variables
  const [selectedWord, setSelectedWord] = useState<SpanishWord>(SPANISH_WORDS[0]);
  const [selectedCategory, setSelectedCategory] = useState<'Aguda' | 'Llana' | 'Esdrújula' | 'Sobreesdrújula'>('Aguda');

  // Interactive Freestyle state
  const [activeChord, setActiveChord] = useState<GuitarChord | null>(null);
  const [vibratingStrings, setVibratingStrings] = useState<boolean[]>([false, false, false, false, false, false]);
  const [fretboardAngle, setFretboardAngle] = useState({ x: 12, y: -8 });

  // Game state variables
  const [gameState, setGameState] = useState<{
    currentWordIndex: number;
    score: number;
    streak: number;
    highestStreak: number;
    answered: boolean;
    selectedSyllableIdx: number | null;
    selectedAccentAnswer: boolean | null; // true = yes, false = no
    isCorrect: boolean | null;
    showExplanation: boolean;
  }>({
    currentWordIndex: 0,
    score: 0,
    streak: 0,
    highestStreak: 0,
    answered: false,
    selectedSyllableIdx: null,
    selectedAccentAnswer: null,
    isCorrect: null,
    showExplanation: false,
  });

  const [gameWords, setGameWords] = useState<SpanishWord[]>([]);

  // Initialize Game Words on load
  useEffect(() => {
    const shuffled = [...SPANISH_WORDS].sort(() => Math.random() - 0.5);
    setGameWords(shuffled);
  }, []);

  // Set up Audio Context
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setAudioEnabled(true);
    playNotificationSound(true);
  };

  // Sound generator synthesizing classical guitar (nylon strings)
  const pluckGuitarString = (frequency: number, delay = 0) => {
    if (!audioEnabled || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime + delay;
    const destination = ctx.destination;

    // Gain node for initial pluck volume and decay envelope
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(soundVolume * 0.45, now + 0.005);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    // Warm Lowpass Filter simulating guitar wood resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);
    filter.Q.setValueAtTime(1, now);

    // Dynamic pluck transient - white noise burst
    const bufferSize = ctx.sampleRate * 0.03; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(frequency, now);
    noiseFilter.Q.setValueAtTime(2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(soundVolume * 0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(filter);

    // Fundamental Frequency string oscillator (Triangle behaves like real classical string pluck)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, now);

    // 1st Overtone
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2, now);

    // 2nd Overtone
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(frequency * 3, now);

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();

    gain1.gain.setValueAtTime(0.6, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    gain2.gain.setValueAtTime(0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    gain3.gain.setValueAtTime(0.15, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);

    filter.connect(masterGain);
    masterGain.connect(destination);

    // Start all
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    noiseNode.start(now);

    // Stop all
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
    osc3.stop(now + 2.0);
    noiseNode.stop(now + 2.0);
  };

  // Play Notification audio (feedback)
  const playNotificationSound = (success: boolean) => {
    if (!audioEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    if (success) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.setValueAtTime(392.00, now + 0.1); // G4
      osc.frequency.setValueAtTime(523.25, now + 0.2); // C5
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(146.83, now); // D3
      osc.frequency.setValueAtTime(130.81, now + 0.1); // C3
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    }
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  };

  // Trigger strings vibration and guitar synthesis
  const triggerGuitarString = (stringIndex: number, specificFreq?: number) => {
    const baseFreq = STRING_FREQUENCIES[5 - stringIndex];
    let targetFreq = baseFreq;

    if (activeChord) {
      const fret = activeChord.strings[stringIndex];
      if (fret === null) return; 
      targetFreq = baseFreq * Math.pow(2, fret / 12);
    } else if (specificFreq) {
      targetFreq = specificFreq;
    }

    pluckGuitarString(targetFreq);

    setVibratingStrings(prev => {
      const next = [...prev];
      next[stringIndex] = true;
      return next;
    });

    setTimeout(() => {
      setVibratingStrings(prev => {
        const next = [...prev];
        next[stringIndex] = false;
        return next;
      });
    }, 400);
  };

  // Play full combined scale chord
  const strumChord = (chord: GuitarChord) => {
    setActiveChord(chord);
    
    chord.strings.forEach((fret, stringIdx) => {
      if (fret !== null) {
        const baseFreq = STRING_FREQUENCIES[5 - stringIdx];
        const targetFreq = baseFreq * Math.pow(2, fret / 12);
        
        setTimeout(() => {
          pluckGuitarString(targetFreq);
          setVibratingStrings(prev => {
            const next = [...prev];
            next[stringIdx] = true;
            return next;
          });
          setTimeout(() => {
            setVibratingStrings(prev => {
              const next = [...prev];
              next[stringIdx] = false;
              return next;
            });
          }, 350);
        }, stringIdx * 45); 
      }
    });
  };

  // Tilt neck when cursor moves
  const handleNeckTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setFretboardAngle({
      x: 12 - y / 15,
      y: -8 + x / 30
    });
  };

  const handleNeckLeave = () => {
    setFretboardAngle({ x: 12, y: -8 });
  };

  // GAME LOGIC IMPLEMENTATIONS
  const currentWord = gameWords[gameState.currentWordIndex] || SPANISH_WORDS[0];

  const selectGameSyllable = (idx: number) => {
    if (gameState.answered) return;
    triggerGuitarString(Math.min(idx, 5), STRING_FREQUENCIES[Math.min(idx, 5)] * 1.5);
    setGameState(prev => ({
      ...prev,
      selectedSyllableIdx: idx
    }));
  };

  const handleAccentAnswer = (requiresAccent: boolean) => {
    if (gameState.answered || gameState.selectedSyllableIdx === null) return;

    const correctSyllable = currentWord.stressedSyllableIndex;
    const syllabusCorrect = gameState.selectedSyllableIdx === correctSyllable;
    const accentCorrect = requiresAccent === currentWord.hasWrittenAccent;
    const isCorrect = syllabusCorrect && accentCorrect;

    playNotificationSound(isCorrect);
    
    if (isCorrect) {
      pluckGuitarString(STRING_FREQUENCIES[1] * 2, 0.05);
      pluckGuitarString(STRING_FREQUENCIES[2] * 2, 0.15);
      pluckGuitarString(STRING_FREQUENCIES[4] * 2, 0.25);
    }

    setGameState(prev => {
      const newScore = isCorrect ? prev.score + 100 : prev.score;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newHighest = Math.max(newStreak, prev.highestStreak);
      
      return {
        ...prev,
        answered: true,
        selectedAccentAnswer: requiresAccent,
        isCorrect,
        score: newScore,
        streak: newStreak,
        highestStreak: newHighest,
        showExplanation: true
      };
    });
  };

  const nextGameWord = () => {
    pluckGuitarString(STRING_FREQUENCIES[3] * 1.5);
    setGameState(prev => {
      const nextIndex = (prev.currentWordIndex + 1) % gameWords.length;
      return {
        ...prev,
        currentWordIndex: nextIndex,
        answered: false,
        selectedSyllableIdx: null,
        selectedAccentAnswer: null,
        isCorrect: null,
        showExplanation: false
      };
    });
  };

  const restartGame = () => {
    const shuffled = [...SPANISH_WORDS].sort(() => Math.random() - 0.5);
    setGameWords(shuffled);
    setGameState({
      currentWordIndex: 0,
      score: 0,
      streak: 0,
      highestStreak: gameState.highestStreak,
      answered: false,
      selectedSyllableIdx: null,
      selectedAccentAnswer: null,
      isCorrect: null,
      showExplanation: false
    });
    playNotificationSound(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans relative overflow-x-hidden p-4 md:p-8 selection:bg-[#FF4D00] selection:text-black border-4 md:border-8 border-[#1A1A1A]">
      <div className="absolute inset-0 bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Brand Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 pb-6 border-b border-zinc-900 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter text-[#FF4D00] uppercase font-sans">
              Guitarra
            </h1>
            <div className="w-3 h-3 rounded-full bg-[#FF4D00] animate-ping" />
          </div>
          <p className="text-xs md:text-sm tracking-[0.25em] font-medium text-zinc-500 mt-2 uppercase flex items-center gap-1.5 flex-wrap">
            <span>Interactive Harmonic Learning</span>
            <span className="text-[#FF4D00]">•</span>
            <span>ARM ⇄ ESP</span>
            <span className="text-[#FF4D00]">•</span>
            <span className="bg-zinc-900 px-2 py-0.5 rounded text-zinc-400 font-mono text-[10px]">3D AUDIO</span>
          </p>
        </div>

        {/* Global Stats / Settings Controls aligned right */}
        <div className="flex flex-wrap items-center gap-6 md:gap-10 text-right w-full lg:w-auto">
          {/* Audio Setup button */}
          <div className="flex flex-col items-start lg:items-end justify-center">
            <span className="text-[10px] uppercase tracking-widest text-[#FF4D00] font-black mb-1.5">AUDIO SYSTEM</span>
            {!audioEnabled ? (
              <button
                id="btn-init-audio-top"
                onClick={initAudio}
                className="px-4 py-2 bg-white text-black font-black text-xs rounded-lg uppercase tracking-wider hover:bg-[#FF4D00] hover:text-black active:scale-95 transition-all cursor-pointer animate-bounce"
              >
                🔊 ՄԻԱՑՆԵԼ ՁԱՅՆԸ
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                <Volume2 className="w-4 h-4 text-[#FF4D00]" />
                <input 
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-16 accent-[#FF4D00] h-1 cursor-pointer bg-zinc-800 rounded-lg appearance-none"
                  title="Volume"
                />
                <span className="text-[10px] font-mono text-zinc-400 font-bold">{Math.round(soundVolume*100)}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-1 font-mono">Streak</span>
            <span className="text-3xl md:text-4xl font-mono font-black leading-none text-white flex items-center gap-1">
              <Flame className="w-6 h-6 text-[#FF4D00]" />
              {gameState.streak}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-1 font-mono">Score</span>
            <span className="text-3xl md:text-4xl font-mono font-black leading-none text-[#FF4D00]">
              {gameState.score.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Mode Switcher / Navigation Tabs fitted in Bold black & white structure */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-[#111111] border border-zinc-800 rounded-2xl mb-8">
        {(['lessons', 'game', 'freestyle'] as const).map((tab) => (
          <button
            id={`btn-nav-mode-${tab}`}
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              pluckGuitarString(tab === 'lessons' ? 196 : tab === 'game' ? 246.94 : 329.63);
            }}
            className={`py-3 md:py-4 px-2 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === tab
                ? 'bg-[#FF4D00] text-black shadow-lg scale-[1.01]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            {tab === 'lessons' && '📝 Դասեր'}
            {tab === 'game' && '🏆 Ինտերակտիվ Խաղ'}
            {tab === 'freestyle' && '🎸 Գիտառ նվագել'}
          </button>
        ))}
      </div>

      {/* Core layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        
        {/* Left Interactive Section (e.g. 3D Fretboard Area or Word explanation panels) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main 3D Guitar neck display - standard across states but enhanced for high visual identity */}
          <div className="relative bg-[#111111] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6 min-h-[360px] justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-transparent opacity-40 pointer-events-none" />
            
            <div className="flex justify-between items-center z-10">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#FF4D00] font-black block">PHYSICAL STRING SIMULATOR</span>
                <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                  Կլասիկ Գիտառի 3D Կոսմիկ Լարեր
                </h3>
              </div>
              <span className="text-xs text-zinc-500 font-mono bg-black px-2 py-1 rounded border border-zinc-800">
                {activeChord ? `Active Chord: ${activeChord.name}` : 'Solo Mode: Pluck Strings'}
              </span>
            </div>

            {/* Simulated 3D Fretboard Box */}
            <div 
              className="w-full h-56 relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] to-[#141414] rounded-2xl border border-zinc-800 flex items-center justify-center my-6 shadow-inner cursor-pointer"
              onMouseMove={handleNeckTilt}
              onMouseLeave={handleNeckLeave}
              style={{ perspective: 1200 }}
            >
              <div 
                className="w-[90%] h-[80%] bg-zinc-900 border border-zinc-700 rounded-xl relative flex z-10 transition-transform duration-305"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${fretboardAngle.x}deg) rotateY(${fretboardAngle.y}deg)`,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.9)'
                }}
              >
                {/* Wood Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 opacity-80 mix-blend-overlay rounded-xl" />
                
                {/* Spanish soundhole circle */}
                <div className="absolute left-[-15%] top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-black border-4 border-zinc-800 shadow-2xl flex items-center justify-center z-0">
                  <div className="w-[80%] h-[80%] rounded-full bg-zinc-950 ring-2 ring-[#FF4D00]/40" />
                </div>

                {/* Custom vertical Steel Frets */}
                {[1, 2, 3, 4, 5, 6, 7].map((fret) => (
                  <div 
                    key={fret}
                    className="absolute top-0 bottom-0 border-r border-zinc-700/60 font-black font-mono text-[9px] text-[#FF4D00]/50 flex items-start justify-center pt-0.5"
                    style={{ left: `${fret * 14}%`, width: '1px' }}
                  >
                    <span>{fret}</span>
                    {(fret === 3 || fret === 5) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 absolute top-1/2 -translate-y-1/2 left-[-1px]" />
                    )}
                  </div>
                ))}

                {/* 6 Nylon String Interactive Elements */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 z-20">
                  {[0, 1, 2, 3, 4, 5].map((strIdx) => {
                    const isVibrating = vibratingStrings[strIdx];
                    const thickness = 1 + (5 - strIdx) * 0.7; // Thicker base strings
                    return (
                      <div
                        key={strIdx}
                        onClick={() => triggerGuitarString(strIdx)}
                        onMouseEnter={() => triggerGuitarString(strIdx)}
                        className="w-full relative py-1 cursor-crosshair group"
                        style={{ height: '18px' }}
                      >
                        <motion.div
                          className="w-full absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-100 via-[#FF4D00] to-yellow-100"
                          animate={isVibrating ? {
                            y: [-1.5, 1.5, -1, 1, -0.5, 0.5, 0],
                            scaleY: [1.4, 0.7, 1.2, 0.9, 1]
                          } : {}}
                          transition={{ duration: 0.35 }}
                          style={{ 
                            height: `${thickness}px`,
                            boxShadow: isVibrating 
                              ? '0 0 12px #FF4D00, 0 0 6px #fff' 
                              : '0 1px 2px rgba(0,0,0,0.4)',
                            opacity: isVibrating ? 1.0 : 0.65 + (strIdx * 0.05)
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Finger circle coordinates corresponding to active chord */}
                {activeChord && (
                  <div className="absolute inset-0 z-30 pointer-events-none">
                    {activeChord.strings.map((fret, stringIdx) => {
                      if (fret === null || fret === 0) return null;
                      return (
                        <div 
                          key={stringIdx}
                          className="absolute w-3.5 h-3.5 rounded-full bg-[#FF4D00] border border-white text-[8px] font-black text-black flex items-center justify-center shadow-[0_0_10px_rgba(255,77,0,0.8)]"
                          style={{
                            left: `${fret * 14 - 7}%`,
                            top: `${stringIdx * 15.5 + 13.5}%`,
                            transform: 'translate(-50%, -50%) font-sans'
                          }}
                        >
                          {activeChord.name[0]}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-zinc-500 font-mono mt-2 flex-wrap gap-2">
              <span className="flex items-center gap-1.5 uppercase">
                <Layers className="w-4 h-4 text-[#FF4D00] shrink-0" />
                Սահեցրեք մկնիկը լարերին ձայն արձակելու համար
              </span>
              <span className="text-zinc-400">
                Լարեր՝ 1(e), 2(B), 3(G), 4(D), 5(A), 6(E)
              </span>
            </div>
          </div>

          {/* TAB CONTENT BLOCK : LESSONS (📝) */}
          {activeTab === 'lessons' && (
            <div className="space-y-6">
              
              {/* Category Rules Selection Panel */}
              <div className="bg-[#111111] p-6 rounded-3xl border border-zinc-800">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-black block mb-4">CHOOSE SPANISH ACCENTUATION GROUP</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['Aguda', 'Llana', 'Esdrújula', 'Sobreesdrújula'] as const).map(cat => (
                    <button
                      id={`lesson-cat-${cat}`}
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        pluckGuitarString(cat === 'Aguda' ? 196.00 : cat === 'Llana' ? 246.94 : cat === 'Esdrújula' ? 329.63 : 146.83);
                        const matchedWord = SPANISH_WORDS.find(w => w.category === cat);
                        if (matchedWord) setSelectedWord(matchedWord);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        selectedCategory === cat 
                          ? 'bg-[#FF4D00] text-black border-transparent shadow-lg scale-[1.02]' 
                          : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <h4 className="text-base font-black tracking-tight">{cat}</h4>
                      <p className={`text-[10px] mt-1 font-bold ${selectedCategory === cat ? 'text-black/80' : 'text-zinc-500'}`}>
                        {cat === 'Aguda' && 'Շեշտը՝ Վերջին վանկ'}
                        {cat === 'Llana' && 'Շեշտը՝ Նախավերջին'}
                        {cat === 'Esdrújula' && 'Շեշտը՝ 3-րդ վանկ'}
                        {cat === 'Sobreesdrújula' && 'Շեշտը՝ 4-րդ վանկ'}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Explanation text in white outline black panel */}
                <div className="mt-4 p-5 bg-black border border-zinc-850 rounded-2xl">
                  {selectedCategory === 'Aguda' && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-black text-[#FF4D00] uppercase tracking-wide">Agudas բառեր (Վերջնաշեշտ)</h5>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        Շեշտն ընկնում է բառի <strong className="text-white">վերջին վանկի</strong> վրա (օրինակ՝ <span className="font-mono bg-zinc-900 px-1 py-0.5 text-[#FF4D00]">ha-blar</span> - խոսել, <span className="font-mono bg-zinc-900 px-1 py-0.5 text-[#FF4D00]">can-ción</span> - երգ)։
                      </p>
                      <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-900 space-y-1 font-sans">
                        <p className="text-white font-bold">⚠️ Գրավոր շեշտադրության կանոնը (Tilde).</p>
                        <p>Եթե Aguda բառը վերջանում է <strong className="text-white">ձայնավորով</strong> կամ <strong className="text-white">N</strong> կամ <strong className="text-white">S</strong> տառերով, նրա վրա դրվում է գրավոր շեշտ (tilde):</p>
                      </div>
                    </div>
                  )}

                  {selectedCategory === 'Llana' && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-black text-[#FF4D00] uppercase tracking-wide">Llanas / Graves բառեր (Նախավերջնաշեշտ)</h5>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        Շեշտն ընկնում է բառի <strong className="text-white">նախավերջին վանկի</strong> վրա (օրինակ՝ <span className="font-mono bg-zinc-900 px-1 py-0.5 text-[#FF4D00]">ca-sa</span> - տուն, <span className="font-mono bg-zinc-900 px-1 py-0.5 text-[#FF4D00]">ár-bol</span> - ծառ)։
                      </p>
                      <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-900 space-y-1 font-sans">
                        <p className="text-white font-bold">⚠️ Գրավոր շեշտադրության կանոնը (Tilde).</p>
                        <p>Եթե Llana բառը վերջանում է ցանկացած <strong className="text-white">բաղաձայնով</strong> (ԲԱՑԻ <strong className="text-white">N</strong> և <strong className="text-white">S</strong> տառերից), ապա այն պահանջում է գրավոր շեշտ (tilde):</p>
                      </div>
                    </div>
                  )}

                  {selectedCategory === 'Esdrújula' && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-black text-[#FF4D00] uppercase tracking-wide">Esdrújulas բառեր (Նախանախավերջնաշեշտ)</h5>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        Շեշտն ընկնում է հետևից հաշված <strong className="text-white">երրորդ վանկի</strong> վրա (օրինակ՝ <span className="font-mono bg-zinc-900 px-1 py-0.5 text-[#FF4D00]">mú-si-ca</span> - երաժշտություն, <span className="font-mono bg-zinc-900 px-1 py-0.5 text-[#FF4D00]">te-lé-fo-no</span> - հեռախոս)։
                      </p>
                      <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-900 space-y-1 font-sans">
                        <p className="text-white font-bold">⚠️ Գրավոր շեշտադրության կանոնը (Tilde).</p>
                        <p className="text-emerald-400 font-bold">Բոլոր Esdrújula բառերը առանց բացառության միշտ ստանում են գրավոր շեշտ!</p>
                      </div>
                    </div>
                  )}

                  {selectedCategory === 'Sobreesdrújula' && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-black text-[#FF4D00] uppercase tracking-wide">Sobreesdrújulas բառեր</h5>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        Շեշտն ընկնում է հետևից հաշված <strong className="text-white">չորրորդ վանկի</strong> կամ ավելի հեռու վանկի վրա (օրինակ՝ <span className="font-mono bg-zinc-900 px-1 py-0.5 text-[#FF4D00]">fá-cil-men-te</span> - հեշտությամբ)։
                      </p>
                      <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-900 space-y-1 font-sans">
                        <p className="text-white font-bold">⚠️ Գրավոր շեշտադրության կանոնը (Tilde).</p>
                        <p>Այս բառերը նույնպես միշտ ստանում են գրավոր շեշտ: Մակբայների դեպքում (mente) շեշտը պահպանվում է միայն այն դեպքում, եթե սկզբնական ածականն ուներ շեշտ (fácil ➜ fácilmente):</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Word Sandbox Cards */}
              <div className="bg-[#111111] p-6 rounded-3xl border border-zinc-800">
                <span className="text-[10px] uppercase tracking-widest text-[#FF4D00] font-black block mb-4">SELECT A WORD TO PRACTICE ACCENT & AUDIO</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPANISH_WORDS.filter(w => w.category === selectedCategory).map(w => (
                    <button
                      id={`btn-word-tab-practice-${w.word}`}
                      key={w.id}
                      onClick={() => {
                        setSelectedWord(w);
                        const sLength = Math.min(w.syllables.length, 5);
                        triggerGuitarString(sLength);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        selectedWord.id === w.id
                          ? 'bg-zinc-900 text-white border-[#FF4D00] shadow-[0_0_15px_rgba(255,77,0,0.25)]'
                          : 'bg-[#0E0E0E] text-zinc-400 border-zinc-800/80 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-black text-lg text-white underline decoration-[#FF4D00] decoration-2">
                          {w.word}
                        </span>
                        {w.hasWrittenAccent && <span className="text-xs text-[#FF4D00] font-mono font-black">´ tilde</span>}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{w.translationArm}</p>
                    </button>
                  ))}
                </div>

                {/* Info Display Card */}
                {selectedWord && (
                  <motion.div
                    key={selectedWord.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-black border border-zinc-800 rounded-2xl space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-900">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Word Breakdown</span>
                        <h3 className="text-3xl font-black text-white tracking-widest font-mono">
                          {selectedWord.word}
                        </h3>
                        <p className="text-xs text-[#FF4D00] mt-1 font-mono uppercase tracking-wider">
                          [{selectedWord.transliterationArm}] • {selectedWord.category}
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-start sm:items-end">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Հայերեն Թարգմանություն</span>
                        <span className="text-xl font-black text-[#FF4D00]">
                          {selectedWord.translationArm}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Syllable Buttons plucking guitar */}
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#FF4D05] font-black block mb-3">
                        🔊 Սեղմեք վանկերին նվագելու և շեշտը լսելու համար՝
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        {selectedWord.syllables.map((syl, idx) => {
                          const isStressed = idx === selectedWord.stressedSyllableIndex;
                          return (
                            <button
                              id={`syl-play-${syl}`}
                              key={idx}
                              onClick={() => {
                                const pitchOffset = 1 + (idx * 0.2);
                                triggerGuitarString(Math.min(idx, 5), STRING_FREQUENCIES[1] * pitchOffset);
                              }}
                              className={`py-3 px-6 rounded-xl font-mono font-black text-lg transition-all flex flex-col items-center justify-center min-w-[70px] ${
                                isStressed 
                                  ? 'bg-[#FF4D00] text-black shadow-lg shadow-[#FF4D00]/20 scale-105 border-2 border-white' 
                                  : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <span>{syl}</span>
                              <span className={`text-[8px] uppercase tracking-widest leading-none mt-1 ${isStressed ? 'text-black/80 font-black' : 'text-zinc-600'}`}>
                                {isStressed ? '📌 ՇԵՇՏ' : `ԼԱՐ ${idx+1}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rule Box in Armenian */}
                    <div className="p-4 bg-zinc-950 border-l-4 border-[#FF4D00] rounded-r-lg space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-[#FF4D00] tracking-widest flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        Ինչո՞ւ է այսպես շեշտվում
                      </span>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {selectedWord.explanationArm}
                      </p>
                    </div>

                    {/* Example sentence with translations */}
                    <div className="space-y-1 border-t border-zinc-900 pt-4 font-sans">
                      <span className="text-[9px] uppercase tracking-widest font-black text-zinc-500">Իսպաներեն Օրինակ (Ejemplo)</span>
                      <p className="text-zinc-200 text-sm font-medium italic">
                        "{selectedWord.exampleSentence}"
                      </p>
                      <p className="text-zinc-400 text-xs mt-0.5">
                        Հայերեն՝ <strong className="text-zinc-300">«{selectedWord.exampleTranslationArm}»</strong>
                      </p>
                    </div>

                  </motion.div>
                )}
              </div>

            </div>
          )}

          {/* TAB CONTENT BLOCK : GAME MODE (🏆) */}
          {activeTab === 'game' && (
            <div className="space-y-6">
              
              {/* Game Layout Box */}
              <div className="bg-[#111111] p-6 rounded-3xl border border-zinc-800 relative">
                
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#FF4D00] font-black block">HARMONIC SOUND GAME</span>
                    <h3 className="text-xl font-black uppercase text-white font-sans">
                      Շեշտադրման ինտերակտիվ վիկտորինա
                    </h3>
                  </div>
                  
                  {/* Word progress */}
                  <span className="text-xs font-mono font-bold bg-black text-zinc-400 px-3 py-1.5 rounded-lg border border-zinc-800">
                    Բառ՝ {gameState.currentWordIndex + 1} / {gameWords.length || SPANISH_WORDS.length}
                  </span>
                </div>

                {/* Main sound prompt Card */}
                <div className="p-8 bg-black border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
                  
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">CURRENT PROMPT WORD (ԱՌԱՆՑ ՇԵՇՏԻ ՆՇԱՆԻ)</span>
                    <h2 className="text-5xl md:text-6xl font-black tracking-widest text-[#FF4D00] uppercase font-mono py-2">
                      {currentWord.wordNoAccent}
                    </h2>
                    <p className="text-sm text-zinc-400 font-sans">
                      Հայերեն թարգմանություն՝ <strong className="text-white">«{currentWord.translationArm}»</strong>
                    </p>
                    <p className="text-xs text-zinc-500 font-mono italic">
                      Տառադարձում՝ [{currentWord.transliterationArm}]
                    </p>
                  </div>

                  {/* Step 1: Choose Stressed Syllable */}
                  <div className="w-full pt-4 space-y-3">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                      1. Ընտրեք ճիշտ շեշտվող վանկը (Սեղմեք վանկի վրա՝ գիտառը լսելու համար)՝
                    </span>

                    <div className="flex flex-wrap justify-center items-center gap-3">
                      {currentWord.syllables.map((syl, sIdx) => {
                        // Word syllables without graphic accents so that the user identifies the sound
                        const cleanSyl = syl.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        const isSelected = gameState.selectedSyllableIdx === sIdx;
                        return (
                          <button
                            id={`btn-game-syl-${cleanSyl}`}
                            key={sIdx}
                            onClick={() => selectGameSyllable(sIdx)}
                            disabled={gameState.answered}
                            className={`py-4 px-8 rounded-xl font-mono text-xl font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? 'bg-[#FF4D00] text-black border-2 border-white scale-105 shadow-[0_0_15px_rgba(255,77,0,0.4)]'
                                : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <span>{cleanSyl}</span>
                            <span className="block text-[8px] opacity-60 font-medium lowercase">վանկ {sIdx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Does it require written accent over the sound? */}
                  {gameState.selectedSyllableIdx !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full pt-4 border-t border-zinc-900 space-y-4"
                    >
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                        2. Արդյո՞ք այս բառը պահանջում է գրավոր շեշտ (Tilde &#180;) ըստ կանոնի.
                      </span>

                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        <button
                          id="btn-game-accent-yes"
                          onClick={() => handleAccentAnswer(true)}
                          disabled={gameState.answered}
                          className={`py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                            gameState.selectedAccentAnswer === true
                              ? 'bg-white text-black border-2 border-[#FF4D00]'
                              : 'bg-zinc-900 text-white border border-zinc-850 hover:bg-zinc-800'
                          }`}
                        >
                          🟢 ԱՅՈ (Պետք է)
                        </button>

                        <button
                          id="btn-game-accent-no"
                          onClick={() => handleAccentAnswer(false)}
                          disabled={gameState.answered}
                          className={`py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                            gameState.selectedAccentAnswer === false
                              ? 'bg-white text-black border-2 border-[#FF4D00]'
                              : 'bg-zinc-900 text-white border border-zinc-850 hover:bg-zinc-800'
                          }`}
                        >
                          🔴 ՈՉ (Պետք չէ)
                        </button>
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* Answer Feedback overlay */}
                <AnimatePresence>
                  {gameState.answered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 p-6 rounded-2xl border-2 space-y-4 bg-black"
                      style={{
                        borderColor: gameState.isCorrect ? '#10B981' : '#EF4444'
                      }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          {gameState.isCorrect ? (
                            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                              <CheckCircle className="w-8 h-8" />
                            </span>
                          ) : (
                            <span className="p-2 bg-red-400/10 text-red-500 rounded-full border border-red-500/30">
                              <XCircle className="w-8 h-8" />
                            </span>
                          )}

                          <div>
                            <h4 className="text-2xl font-black tracking-tight">
                              {gameState.isCorrect ? 'ՃԻՇՏ Է! ✨ +100 միավոր' : 'ՍԽԱԼ Է 😢 Փորձեք կրկին'}
                            </h4>
                            <p className="text-xs text-zinc-400 font-sans mt-0.5">
                              Ճիշտ գրելաձևն է՝ <strong className="text-white text-base font-mono">{currentWord.word}</strong> ({currentWord.category})
                            </p>
                          </div>
                        </div>

                        <button
                          id="btn-game-next-word"
                          onClick={nextGameWord}
                          className="px-6 py-4 bg-[#FF4D00] text-black font-black text-xs rounded-xl uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#FF4D00]/20 flex items-center gap-2 active:scale-95 transition-all self-stretch sm:self-auto justify-center cursor-pointer"
                        >
                          <span>ՀԱՋՈՐԴ ԲԱՌԸ</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Explanation box */}
                      <div className="p-4 bg-zinc-950 border-l-2 border-zinc-800 rounded text-xs space-y-2 font-sans">
                        <strong className="text-[#FF4D00] uppercase block tracking-wider">Շեշտադրման բացատրություն (Armenian)՝</strong>
                        <p className="text-zinc-300 leading-relaxed">
                          {currentWord.explanationArm}
                        </p>
                        <p className="text-zinc-400 italic text-[11px] mt-1">
                          Օրինակ՝ "{currentWord.exampleSentence}" ➜ «{currentWord.exampleTranslationArm}»
                        </p>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Extra action bar */}
                <div className="mt-6 flex justify-between items-center text-xs font-mono font-bold text-zinc-500 border-t border-zinc-900 pt-4">
                  <span>ՀԱՂԹԱԿԱՆ ՇԱՐՔ՝ {gameState.streak} • ԼԱՎԱԳՈՒՅՆ ՇԱՐՔ՝ {gameState.highestStreak}</span>
                  <button
                    id="btn-restart-game"
                    onClick={restartGame}
                    className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    ՍԿՍԵԼ ՆՈՐԻՑ
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB CONTENT BLOCK : FREESTYLE SOLO MODE (🎸) */}
          {activeTab === 'freestyle' && (
            <div className="space-y-6">
              
              <div className="bg-[#111111] p-6 rounded-3xl border border-zinc-800 space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#FF4D00] font-black block">FREE STRUM SANDBOX</span>
                  <h3 className="text-xl font-black uppercase text-white font-sans">
                    Նվագեք իսպանական ակորդներ
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Սեղմեք ակորդների վրա՝ գիտառով համահնչյուն արձակելու համար։ Մկնիկով տատանեք բաց լարերը սոլո կատարումների համար:
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {GUITAR_CHORDS.map((chord) => {
                    const isSelected = activeChord?.name === chord.name;
                    return (
                      <button
                        id={`btn-strum-chord-${chord.name}`}
                        key={chord.name}
                        onClick={() => strumChord(chord)}
                        className={`p-4 rounded-xl text-center transition-all duration-200 border-2 flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF4D00] text-black border-transparent shadow-[0_0_15px_rgba(255,77,0,0.4)] scale-105 font-black'
                            : 'bg-black text-white border-zinc-850 hover:bg-zinc-900 hover:border-zinc-750'
                        }`}
                      >
                        <span className="text-lg font-mono font-black">{chord.name.split(' ')[0]}</span>
                        <span className={`text-[9px] uppercase tracking-wider font-bold mt-1 ${isSelected ? 'text-black/70' : 'text-zinc-500'}`}>
                          {chord.name.split(' ')[1]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Multi string tuner plucker overview */}
                <div className="p-5 bg-black border border-zinc-850 rounded-2xl">
                  <span className="text-[10px] uppercase tracking-widest text-[#FF4D00] font-black block mb-3">TUNING CONTROL & PLUCKING PADS</span>
                  <div className="grid grid-cols-6 gap-2">
                    {STRING_NAMES.map((name, idx) => (
                      <button
                        id={`btn-tuner-pluck-${idx}`}
                        key={idx}
                        onClick={() => triggerGuitarString(5 - idx)}
                        className="py-3 bg-zinc-905 border border-zinc-800 text-zinc-300 font-mono text-xs hover:bg-[#FF4D00] hover:text-black font-black uppercase rounded-lg active:scale-95 transition-all text-center cursor-pointer"
                      >
                        Lv.{idx+1}
                        <span className="block text-xl mt-1 text-white">{name}</span>
                        <span className="block text-[8px] opacity-60 mt-0.5">{STRING_FREQUENCIES[idx]}Hz</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
              
            </div>
          )}

        </section>

        {/* Right Info Section (Bento info card & Category references) */}
        <section className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Linguistics Stress Theory Comparison Panel */}
          <div className="bg-[#111111] p-8 rounded-3xl border border-zinc-805 flex flex-col justify-between">
            <div>
              <h4 className="text-zinc-500 font-black uppercase tracking-widest text-xs mb-4">
                Linguistic Accent (Շեշտադրություն)
              </h4>

              <div className="space-y-6">
                
                <div className="p-5 bg-black border border-zinc-800 rounded-2xl space-y-2">
                  <h3 className="text-2xl font-black text-white font-mono">
                    gui-TÁ-rra
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed italic font-sans">
                    Իսպաներենում շեշտն ընկնում է նախավերջին վանկի վրա, եթե բառը վերջանում է ձայնավորով կամ N/S տառերով: Այդ պատճառով «guitarra»-ն չի ստանում գրավոր շեշտ, բայց արտասանվում է շեշտված [TÁ]:
                  </p>
                </div>

                <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-1.5">
                  <h3 className="text-base font-black text-[#FF4D00] font-sans flex items-center gap-1.5">
                    ARM: Կիթառ
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                    Հայերենում շեշտը գրեթե միշտ ընկնում է բառի <strong className="text-white">վերջին վանկի</strong> վրա՝ Ki-thÁRR: Ահա սա էլ հանդիսանում է հիմնական տարբերությունը:
                  </p>
                </div>

                <div className="pt-2">
                  <h5 className="text-[10px] uppercase tracking-widest font-black text-zinc-500 mb-2 font-mono">Game Metric Rules</h5>
                  <p className="text-xs text-zinc-500 leading-normal font-sans">
                    Ընտրեք համապատասխան վանկը և որոշեք «Tilde»-ի կարիքը՝ ճիշտ պատասխանների երկար շարքեր (STREAK) ստեղծելու համար:
                  </p>
                </div>

              </div>
            </div>

            {/* Quick helper badge */}
            <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D00] animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Rhythm System: Standard 440Hz</span>
            </div>
          </div>

          {/* Tips Bento Box */}
          <div className="bg-[#FF4D00]/10 p-6 rounded-3xl border border-[#FF4D00]/30 space-y-4">
            <div className="flex items-center gap-2 text-[#FF4D00]">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
              <span className="text-xs font-black uppercase tracking-widest font-sans">Օգտակար Խորհուրդ</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Գիտառ նվագելու և իսպաներենի շեշտերի միջև կապը ձայնային ներդաշնակությունն է։ Յուրաքանչյուր վանկ ունի իր գիտառային լարի բարձրությունը։ Լսեք կլասիկ գիտառի լարերը և կսովորեք շեշտադրությունը շատ ավելի արագ!
            </p>
          </div>

        </section>

      </div>

      {/* Styled Footer matching version constraints without unrequested telemetry noise */}
      <footer className="mt-12 pt-6 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] font-black text-zinc-600 gap-4">
        <span>GUITARRA SYSTEM VERSION 3.1.0 • NO FOLDER ARCHITECTURE</span>
        <span>© 2026 HARMONIC REVOLUTION</span>
      </footer>

    </div>
  );
}
