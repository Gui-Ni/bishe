import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Activity, 
  Wind, 
  Moon,
  Compass,
  Mic,
  Hand,
  ChevronRight,
  Share2,
  Heart
} from 'lucide-react';

type CabinMode = 'idle' | 'sync' | 'inspiration' | 'voice';
type MobileState = 'home' | 'modeSelect' | 'syncing' | 'result' | 'inspiration';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface Spark {
  id: number;
  x: number;
  y: number;
}

const SyncLogo = ({ size = 'large', className = '', isSyncing = false }: { size?: 'large' | 'small', className?: string, isSyncing?: boolean }) => {
  const dots = [
    { size: 4, y: -40, x: 5 },
    { size: 6, y: -25, x: 15 },
    { size: 8, y: -5, x: 20 },
    { size: 10, y: 20, x: 15 },
    { size: 8, y: 45, x: 10 },
    { size: 6, y: 65, x: 0 },
    { size: 4, y: 80, x: -10 },
  ];

  return (
    <div className={`sync-totem ${!isSyncing ? 'breathing' : ''} ${className} flex items-center justify-center`}>
      <div className="relative flex items-center" style={{ width: size === 'large' ? '360px' : '180px', height: size === 'large' ? '200px' : '100px' }}>
        <motion.div 
          animate={isSyncing ? { scale: [1, 0.95, 1], opacity: [0.9, 0.7, 0.9] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`sync-circle sync-circle-large`} 
          style={{ 
            left: '0',
            width: size === 'large' ? '160px' : '80px',
            height: size === 'large' ? '160px' : '80px'
          }}
        />
        <motion.div 
          animate={isSyncing ? { scale: [1, 0.9, 1], opacity: [0.8, 0.6, 0.8], x: [0, -10, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`sync-circle sync-circle-small`} 
          style={{ 
            left: size === 'large' ? '160px' : '80px',
            width: size === 'large' ? '120px' : '60px',
            height: size === 'large' ? '120px' : '60px'
          }}
        />
        {size === 'large' && (
          <div className="absolute" style={{ left: '300px', top: '50%', transform: 'translateY(-50%)' }}>
            {dots.map((dot, i) => (
              <motion.div
                key={i}
                className="absolute bg-[#7CC2E8] rounded-full opacity-90"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                style={{
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  top: `${dot.y}px`,
                  left: `${dot.x}px`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'cabin' | 'mobile'>('cabin');
  const [cabinMode, setCabinMode] = useState<CabinMode>('idle');
  const [mobileState, setMobileState] = useState<MobileState>('home');
  const [isDoorOpening, setIsDoorOpening] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [isPressing, setIsPressing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedCard, setRecordedCard] = useState(false);
  const rippleIdRef = useRef(0);
  const sparkIdRef = useRef(0);

  const handleCabinClick = (e: React.MouseEvent) => {
    if (cabinMode === 'inspiration') {
      const newRipple = {
        id: rippleIdRef.current++,
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev, newRipple]);
      
      // Generate sparks
      const newSparks = [...Array(3)].map(() => ({
        id: sparkIdRef.current++,
        x: e.clientX + (Math.random() * 100 - 50),
        y: e.clientY + (Math.random() * 100 - 50)
      }));
      setSparks(prev => [...prev, ...newSparks]);

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 2500);
    }
  };

  const triggerVoiceRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setRecordedCard(true);
      setIsRecording(false);
      setSparks([]); // "Inhale" sparks
    }, 2000);
  };

  const startSync = () => {
    setMobileState('modeSelect');
  };

  const enterCabin = () => {
    setIsDoorOpening(true);
    setTimeout(() => {
      setMobileState('syncing');
      setIsDoorOpening(false);
      setTimeout(() => {
        setMobileState('result');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-sync-bg text-[#333] selection:bg-[#4FACFE]/30">
      {/* Navigation Switch */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-1.5 glass-card rounded-full">
        <button 
          onClick={() => setView('cabin')}
          className={`px-6 py-2.5 rounded-full transition-all duration-500 flex items-center gap-2.5 ${view === 'cabin' ? 'bg-[#7CC2E8] text-white shadow-lg' : 'text-[#333]/40 hover:text-[#333]'}`}
        >
          <Monitor size={16} />
          <span className="text-xs font-semibold tracking-wider">交互舱</span>
        </button>
        <button 
          onClick={() => setView('mobile')}
          className={`px-6 py-2.5 rounded-full transition-all duration-500 flex items-center gap-2.5 ${view === 'mobile' ? 'bg-[#7CC2E8] text-white shadow-lg' : 'text-[#333]/40 hover:text-[#333]'}`}
        >
          <Smartphone size={16} />
          <span className="text-xs font-semibold tracking-wider">心跃端</span>
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'cabin' ? (
          <motion.div 
            key="cabin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
            onClick={handleCabinClick}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 transition-colors duration-1000 pointer-events-none ${cabinMode === 'voice' ? 'bg-purple-900/10' : 'bg-[#4FACFE]/5'}`} />
            
            {/* U-Shaped Arc */}
            <div className="arc-container">
              <div className="arc-line" />
            </div>

            {/* Palm Icons (Hand Guide Areas) */}
            <div 
              onMouseDown={() => cabinMode === 'sync' && setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              onMouseLeave={() => setIsPressing(false)}
              className={`palm-icon palm-left cursor-pointer transition-all duration-700 ${cabinMode === 'sync' ? 'opacity-60 scale-110' : 'opacity-20'} ${isPressing ? 'scale-90 opacity-100 brightness-150' : ''}`}
            >
              <Hand size={80} className="text-[#4FACFE]" />
              {cabinMode === 'idle' && (
                <motion.div 
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#4FACFE]/20 blur-2xl rounded-full"
                />
              )}
            </div>
            <div 
              onMouseDown={() => cabinMode === 'sync' && setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              onMouseLeave={() => setIsPressing(false)}
              className={`palm-icon palm-right cursor-pointer transition-all duration-700 ${cabinMode === 'sync' ? 'opacity-60 scale-110' : 'opacity-20'} ${isPressing ? 'scale-90 opacity-100 brightness-150' : ''}`}
            >
              <Hand size={80} className="text-[#4FACFE]" />
              {cabinMode === 'idle' && (
                <motion.div 
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#4FACFE]/20 blur-2xl rounded-full"
                />
              )}
            </div>

            {/* Logo Totem */}
            <SyncLogo className="mb-24" isSyncing={isPressing} />

            {/* Mode Controls */}
            <div className="absolute bottom-12 flex gap-6 z-20">
              {[
                { mode: 'idle', label: '静谧', icon: <Moon size={18}/> },
                { mode: 'sync', label: '同步', icon: <Activity size={18}/> },
                { mode: 'inspiration', label: '灵感', icon: <Sparkles size={18}/> },
                { mode: 'voice', label: '心语', icon: <Mic size={18}/> },
              ].map((m) => (
                <button
                  key={m.mode}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setCabinMode(m.mode as CabinMode);
                    setRecordedCard(false);
                    setIsRecording(false);
                  }}
                  className={`flex flex-col items-center gap-3 transition-all duration-500 ${cabinMode === m.mode ? 'text-[#7CC2E8]' : 'text-[#333]/20 hover:text-[#333]'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500 ${cabinMode === m.mode ? 'border-[#7CC2E8] bg-[#7CC2E8]/10 shadow-[0_0_20px_rgba(124,194,232,0.2)]' : 'border-[#333]/5 bg-[#333]/5'}`}>
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-medium tracking-[0.3em]">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic Content */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {cabinMode === 'sync' && isPressing && (
                <div className="light-flow">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="flow-particle"
                      initial={{ 
                        x: i % 2 === 0 ? -600 : 600, 
                        y: Math.random() * 400 - 200,
                        opacity: 0,
                        scale: 1
                      }}
                      animate={{ 
                        x: 0, 
                        y: 0,
                        opacity: [0, 1, 0],
                        scale: [1, 0.5, 0]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: Math.random() * 1.5,
                        ease: "circIn"
                      }}
                    />
                  ))}
                </div>
              )}
              
              {cabinMode === 'inspiration' && (
                <div className="w-full h-full relative">
                  {/* Sparks (Inspiration Sparks) */}
                  {sparks.map(spark => (
                    <motion.div
                      key={spark.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.5, 1], 
                        opacity: [0, 1, 0.6],
                        y: [0, -20, -10]
                      }}
                      className="absolute w-2 h-2 bg-[#4FACFE] rounded-full blur-[1px] shadow-[0_0_10px_#4FACFE]"
                      style={{ left: spark.x, top: spark.y }}
                    />
                  ))}
                  {ripples.map(ripple => (
                    <div 
                      key={ripple.id}
                      className="ripple"
                      style={{ left: ripple.x, top: ripple.y }}
                    />
                  ))}
                </div>
              )}

              {cabinMode === 'voice' && (
                <div className="flex flex-col items-center gap-12">
                  {!recordedCard ? (
                    <div className="flex flex-col items-center gap-8">
                      <motion.div 
                        animate={isRecording ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="voice-ball" 
                        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)' }}
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); triggerVoiceRecord(); }}
                        className="pointer-events-auto px-8 py-3 rounded-full border border-purple-500/30 bg-purple-500/10 text-[10px] tracking-[0.4em] hover:bg-purple-500/20 transition-all"
                      >
                        {isRecording ? "正在记录..." : "说出 '记录一下'"}
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="glass-card p-8 w-64 aspect-[3/4] flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-16 -mt-16" />
                      <Sparkles className="text-purple-400" size={24} />
                      <p className="text-sm font-light leading-relaxed">
                        “在静谧的深处，光总是会找到它的出口。”
                      </p>
                      <div className="text-[8px] tracking-widest text-white/20 uppercase">
                        Voice Resonance #0429
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* System Info */}
            <div className="absolute top-32 left-12 flex flex-col gap-6 text-[10px] tracking-[0.4em] text-[#333]/20">
              <div className="space-y-1">
                <p className="text-[#333]/10">SYSTEM</p>
                <p className="text-[#333]/40">SYNC·心跃 v2.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-[#333]/10">STATUS</p>
                <p className="text-[#7CC2E8]/60">OPTIMAL RESONANCE</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-32 px-8 flex flex-col items-center"
          >
            {mobileState === 'home' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-md flex flex-col items-center justify-center flex-1"
              >
                {/* Fluid Background Effect for Splash */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                  <div className="fluid-blob fluid-blob-1" />
                  <div className="fluid-blob fluid-blob-2" />
                </div>

                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <SyncLogo size="large" className="mb-12" />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <h1 className="text-5xl font-bold tracking-[0.3em] mb-6 sync-text-gradient">心跃</h1>
                  <p className="text-[#333]/60 text-[10px] tracking-[0.8em] uppercase mb-12">SYNC</p>
                  
                  <button 
                    onClick={startSync}
                    className="px-12 py-4 rounded-full border border-[#333]/10 bg-[#333]/5 backdrop-blur-xl text-sm tracking-[0.4em] hover:bg-[#333]/10 transition-all active:scale-95"
                  >
                    进入系统
                  </button>
                </motion.div>
              </motion.div>
            )}

            {mobileState === 'modeSelect' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-md flex flex-col items-center"
              >
                <div className="text-center mb-16">
                  <h2 className="text-2xl font-light tracking-[0.2em] mb-2">选择同步模式</h2>
                  <p className="text-[#333]/20 text-[8px] tracking-[0.4em] uppercase">Select Your Resonance</p>
                </div>

                <div className="w-full space-y-6">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={enterCabin}
                    className="w-full glass-card p-8 flex flex-col items-start gap-4 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#7CC2E8]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#7CC2E8]/10 transition-colors" />
                    <div className="w-12 h-12 rounded-full bg-[#7CC2E8]/10 flex items-center justify-center mb-2">
                      <Zap size={24} className="text-[#7CC2E8]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-light tracking-widest mb-1">精神充能</h3>
                      <p className="text-[#333]/40 text-xs tracking-wider">10min · 深度意识修复</p>
                    </div>
                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={20} className="text-[#7CC2E8]" />
                    </div>
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={enterCabin}
                    className="w-full glass-card p-8 flex flex-col items-start gap-4 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#7CC2E8]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#7CC2E8]/10 transition-colors" />
                    <div className="w-12 h-12 rounded-full bg-[#7CC2E8]/10 flex items-center justify-center mb-2">
                      <Sparkles size={24} className="text-[#7CC2E8]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-light tracking-widest mb-1">灵感触发</h3>
                      <p className="text-[#333]/40 text-xs tracking-wider">12min · 创意频率同步</p>
                    </div>
                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={20} className="text-[#7CC2E8]" />
                    </div>
                  </motion.button>
                </div>

                <button 
                  onClick={() => setMobileState('home')}
                  className="mt-12 text-[10px] tracking-[0.3em] text-[#333]/20 hover:text-[#333] transition-colors"
                >
                  返回首页
                </button>
              </motion.div>
            )}

            {mobileState === 'syncing' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center flex-1 pb-32"
              >
                <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-dashed border-[#7CC2E8]/20 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border border-dashed border-[#333]/10 rounded-full"
                  />
                  
                  {/* Data flow particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.5, 0],
                        opacity: [0, 0.5, 0],
                        y: [-100, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.25,
                        ease: "easeOut"
                      }}
                      className="absolute w-1 h-1 bg-[#7CC2E8] rounded-full"
                    />
                  ))}
                  
                  <SyncLogo size="small" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] tracking-[0.8em] text-[#7CC2E8] animate-pulse">SYNCING RESONANCE</p>
                  <p className="text-[8px] tracking-[0.4em] text-[#333]/20">DATA TRANSFER IN PROGRESS</p>
                </div>
              </motion.div>
            )}

            {mobileState === 'result' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md flex flex-col items-center"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-light tracking-[0.2em] mb-2">本次 MoodScore: <span className="sync-text-gradient">7.6</span></h2>
                  <p className="text-[#333]/20 text-[8px] tracking-[0.4em] uppercase">Energy Resonance Analysis</p>
                </div>

                {/* Ripple Chart Visualization */}
                <div className="w-full h-48 glass-card mb-12 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute border border-[#7CC2E8] rounded-full"
                        initial={{ width: 0, height: 0, opacity: 0.5 }}
                        animate={{ 
                          width: [0, 400], 
                          height: [0, 400], 
                          opacity: [0.5, 0] 
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity, 
                          delay: i * 0.8,
                          ease: "easeOut" 
                        }}
                      />
                    ))}
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-end gap-1 h-24 mb-4">
                      {[40, 60, 45, 80, 55, 90, 75, 95, 85, 100].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1, duration: 1 }}
                          className="w-2 bg-[#7CC2E8]/40 rounded-t-full"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] tracking-[0.3em] text-[#7CC2E8]">能量回升曲线</span>
                  </div>
                </div>

                <div className="w-full mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm tracking-[0.3em] font-light">生成的灵感卡片</h3>
                    <Sparkles size={14} className="text-[#7CC2E8]" />
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {[1, 2].map((i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        className="glass-card min-w-[200px] p-6 flex flex-col justify-between aspect-[4/5]"
                      >
                        <p className="text-xs leading-relaxed font-light text-[#333]/80">
                          {i === 1 ? "“在静谧的深处，光总是会找到它的出口。”" : "“每一次呼吸，都是与宇宙的一次微小共振。”"}
                        </p>
                        <div className="text-[8px] tracking-widest text-[#333]/60 uppercase">
                          Resonance #{i === 1 ? '0429' : '0430'}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                  <button 
                    onClick={() => setMobileState('home')}
                    className="w-full soft-button justify-center"
                  >
                    返回主页
                  </button>
                  <button 
                    onClick={() => setMobileState('inspiration')}
                    className="w-full soft-button justify-center border-[#333]/5 bg-transparent"
                  >
                    查看全部灵感
                  </button>
                </div>
              </motion.div>
            )}

            {mobileState === 'inspiration' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-xl font-light tracking-widest">灵感卡片</h3>
                  <button onClick={() => setMobileState('home')} className="text-xs text-[#333]/30 hover:text-[#333]">返回</button>
                </div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="glass-card aspect-[3/4] p-10 flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#7CC2E8]/10 blur-3xl -mr-16 -mt-16" />
                  
                  <div className="space-y-8">
                    <Sparkles className="text-[#7CC2E8]" size={24} />
                    <h4 className="text-2xl font-light leading-relaxed">
                      “在静谧的深处，<br />
                      <span className="sync-text-gradient">光</span> 总是会找到它的出口。”
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div className="h-px w-full bg-[#333]/5" />
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[8px] tracking-[0.3em] text-[#333]/60 uppercase">Source</p>
                        <p className="text-[10px] tracking-widest">Resonance #0429</p>
                      </div>
                      <p className="text-[10px] tracking-widest text-[#333]/70">2026.03.20</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabin Door Animation Overlay */}
      <AnimatePresence>
        {isDoorOpening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="door-container"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="door-half door-left"
            >
              <div className="door-logo-half" />
            </motion.div>
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="door-half door-right"
            >
              <div className="door-logo-half" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
