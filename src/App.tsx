import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Sparkles, Smartphone, Monitor, ChevronRight, Power, Hand, Mic, Check, ArrowLeft
} from 'lucide-react';

type CabinMode = 'idle' | 'pose-confirm' | 'recharge' | 'inspiration' | 'ending';
type MobileState = 'home' | 'modeSelect' | 'activeInCabin' | 'result' | 'cardList';

interface Ripple { id: number; x: number; y: number; }
interface SessionResult { mode: string; percent: number; score: string; cards: number; }

const INSPIRATION_DB = [
  "在静谧的深处，光总是会找到它的出口。",
  "每一次呼吸，都是与宇宙频率的重新校准。",
  "向内收束不是封闭，而是为了更有力量的绽放。",
  "打破原有的边界，让神经元以意想不到的方式连接。"
];

// ==========================================
// 1. SYNC Logo 组件 (修复了视觉重心偏移)
// ==========================================
const SyncLogo = ({ size = 'large', className = '', isSyncing = false }: { size?: 'large' | 'small', className?: string, isSyncing?: boolean }) => {
  const baseSize = size === 'large' ? 160 : 80;
  const midSize = size === 'large' ? 120 : 60;
  
  const dots = [
    { size: 4, y: -45, x: 0 }, { size: 6, y: -25, x: 10 }, { size: 8, y: -5, x: 15 },
    { size: 10, y: 15, x: 15 }, { size: 8, y: 35, x: 10 }, { size: 6, y: 55, x: 0 }, { size: 4, y: 75, x: -10 },
  ];

  return (
    <div className={`sync-totem flex items-center justify-center w-full ${!isSyncing ? 'breathing' : ''} ${className}`}>
      <div className="flex items-center justify-center relative" style={{ transform: 'translateX(-4%)' }}>
        <motion.div animate={isSyncing ? { scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] } : {}} transition={{ duration: 2, repeat: Infinity }}
          className="sync-circle relative z-20 shadow-[0_0_40px_rgba(79,172,254,0.3)]" style={{ width: `${baseSize}px`, height: `${baseSize}px`, background: 'linear-gradient(to left, #4FACFE 0%, rgba(255, 255, 255, 0.9) 100%)' }} />
        <motion.div animate={isSyncing ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          className="sync-circle relative z-10" style={{ width: `${midSize}px`, height: `${midSize}px`, marginLeft: '-2px', background: 'linear-gradient(to right, #4FACFE 0%, rgba(255, 255, 255, 0.9) 100%)' }} />
        {size === 'large' && (
          <div className="relative h-full ml-4 flex items-center">
            {dots.map((dot, i) => (
              <motion.div key={i} className="absolute bg-[#4FACFE] rounded-full opacity-90 shadow-[0_0_10px_#4FACFE]"
                initial={{ opacity: 0.4 }} animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                style={{ width: `${dot.size}px`, height: `${dot.size}px`, top: `calc(50% + ${dot.y}px - ${dot.size/2}px)`, left: `${dot.x}px` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. 交互舱 UI (重构充能交互 & 8秒谢幕)
// ==========================================
const CabinUI = ({ 
  cabinMode, setCabinMode, targetMode, addCard, timeElapsed, endSession
}: { 
  cabinMode: CabinMode, setCabinMode: (m: CabinMode) => void, targetMode: CabinMode | null, addCard: (t: string) => void, timeElapsed: number, endSession: () => void 
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [confirmProgress, setConfirmProgress] = useState(0);
  const [pushProgress, setPushProgress] = useState(0);
  const [randomSpots, setRandomSpots] = useState<{id: number, deg: number}[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [recordFeedback, setRecordFeedback] = useState("");
  const rippleIdRef = useRef(0);

  // 姿态确认逻辑
  useEffect(() => {
    let interval: any;
    if (cabinMode === 'pose-confirm') {
      if (isPressing) interval = setInterval(() => setConfirmProgress(p => p >= 100 ? 100 : p + 2), 30);
      else interval = setInterval(() => setConfirmProgress(p => Math.max(p - 4, 0)), 30);
    }
    if (confirmProgress >= 100 && targetMode) {
        setCabinMode(targetMode);
        setConfirmProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPressing, cabinMode, confirmProgress]);

  // 精神充能交互逻辑
  useEffect(() => {
    let interval: any;
    if (cabinMode === 'recharge') {
      if (isPressing) interval = setInterval(() => setPushProgress(p => Math.min(p + 1.5, 100)), 30);
      else interval = setInterval(() => setPushProgress(p => Math.max(p - 2, 0)), 30);
    }
    return () => clearInterval(interval);
  }, [isPressing, cabinMode]);

  // 灵感触发逻辑
  useEffect(() => {
    if (cabinMode === 'inspiration') {
      const generate = () => setRandomSpots([{ id: Math.random(), deg: -60 + Math.random() * 40 }, { id: Math.random(), deg: 20 + Math.random() * 40 }]);
      generate();
      const itv = setInterval(generate, 4000);
      return () => clearInterval(itv);
    }
  }, [cabinMode]);

  const handleSpotClick = (e: React.MouseEvent, id: number) => {
    const newRipple = { id: rippleIdRef.current++, x: e.clientX, y: e.clientY };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 2000);
    setRandomSpots(prev => prev.filter(s => s.id !== id));
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-screen flex flex-col items-center justify-center overflow-hidden w-full"
      onMouseDown={() => setIsPressing(true)} onMouseUp={() => setIsPressing(false)} onMouseLeave={() => setIsPressing(false)}>
      
      <div className="absolute inset-0 bg-[#4FACFE]/5 pointer-events-none" />

      {/* 1. 顶部状态栏 */}
      <AnimatePresence>
        {(cabinMode === 'recharge' || cabinMode === 'inspiration') && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-40 flex flex-col items-center gap-2">
            <span className="text-white font-mono text-xl tracking-[0.2em]">进行中 ({formatTime(timeElapsed)})</span>
          </motion.div>
        )}
        {cabinMode === 'pose-confirm' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-40 flex flex-col items-center gap-4">
            <span className="text-white/80 font-light text-lg tracking-[0.4em]">请长按双手引导区确认姿态</span>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#4FACFE] transition-all" style={{ width: `${confirmProgress}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. 核心交互内容 */}
      <div className="absolute bottom-[-50px] w-[800px] h-[800px] rounded-full flex items-center justify-center pointer-events-none">
        
        {/* 精神充能：聚焦与收集动效 */}
        {cabinMode === 'recharge' && (
          <>
            <motion.div className="absolute w-full h-full flex items-start justify-center" style={{ rotate: `${-75 + (pushProgress * 0.75)}deg` }}>
               <div className="w-16 h-16 -mt-8 rounded-full bg-white blur-[8px] shadow-[0_0_30px_#4FACFE]" style={{ opacity: 0.2 + (pushProgress/100) }} />
               {isPressing && <div className="absolute top-0 w-1 h-32 bg-gradient-to-t from-[#4FACFE] to-transparent opacity-40 blur-sm" />}
            </motion.div>
            <motion.div className="absolute w-full h-full flex items-start justify-center" style={{ rotate: `${75 - (pushProgress * 0.75)}deg` }}>
               <div className="w-16 h-16 -mt-8 rounded-full bg-white blur-[8px] shadow-[0_0_30px_#4FACFE]" style={{ opacity: 0.2 + (pushProgress/100) }} />
               {isPressing && <div className="absolute top-0 w-1 h-32 bg-gradient-to-t from-[#4FACFE] to-transparent opacity-40 blur-sm" />}
            </motion.div>
            
            {/* 上升提升感：当推到顶部产生的向上光束 */}
            {pushProgress > 80 && (
                <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 0.6, y: -200 }} className="absolute top-0 w-1 bg-white h-[600px] blur-md shadow-[0_0_50px_#4FACFE]" />
            )}
          </>
        )}

        {/* 灵感触发 */}
        {cabinMode === 'inspiration' && randomSpots.map(spot => (
          <motion.div key={spot.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute w-full h-full flex items-start justify-center" style={{ rotate: `${spot.deg}deg` }}>
            <div className="w-16 h-16 -mt-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center cursor-pointer pointer-events-auto hover:scale-125 transition-all"
              onMouseDown={(e) => handleSpotClick(e, spot.id)}>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </motion.div>
        ))}

        {/* 谢幕状态 (ending) */}
        {cabinMode === 'ending' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-[-100px] flex flex-col items-center gap-6">
              <SyncLogo size="large" isSyncing={true} />
              <p className="text-white tracking-[0.6em] text-xl font-light mt-12">祝您旅程愉快</p>
              <p className="text-white/20 text-xs tracking-widest">舱门将于数秒后开启</p>
           </motion.div>
        )}
      </div>

      {cabinMode !== 'ending' && (
        <>
            <SyncLogo className="mb-24 scale-[0.8]" isSyncing={isPressing || cabinMode === 'inspiration'} />
            <div className="arc-container"><div className="arc-line" /></div>
        </>
      )}

      {/* 引导手掌 */}
      {(cabinMode === 'pose-confirm' || cabinMode === 'recharge') && cabinMode !== 'ending' && (
        <>
          <div className={`palm-icon palm-left ${isPressing ? 'opacity-100 scale-90' : 'opacity-30'}`}><Hand size={80} className="text-[#4FACFE]" /></div>
          <div className={`palm-icon palm-right ${isPressing ? 'opacity-100 scale-90' : 'opacity-30'}`}><Hand size={80} className="text-[#4FACFE]" /></div>
        </>
      )}

      {/* 涟漪 */}
      <div className="absolute inset-0 pointer-events-none">{ripples.map(r => <div key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />)}</div>

      {/* 语音记录 */}
      {(cabinMode === 'recharge' || cabinMode === 'inspiration') && (
        <button onClick={(e) => { e.stopPropagation(); setRecordFeedback("已捕捉灵感"); addCard(INSPIRATION_DB[Math.floor(Math.random()*4)]); setTimeout(()=>setRecordFeedback(""), 2000); }} 
          className="absolute bottom-12 right-12 flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all z-40">
          <Mic size={16} className={recordFeedback ? "text-[#4FACFE]" : "text-white/40"} />
          <span className="text-xs text-white/50 tracking-widest">{recordFeedback || "说出“灵感记录”"}</span>
        </button>
      )}
    </motion.div>
  );
};

// ==========================================
// 3. 手机端 UI (结果页字体加粗 & 卡片列表)
// ==========================================
const MobileUI = ({ 
  mobileState, setMobileState, enterCabin, cabinMode, targetMode, sessionResult, endSession, cards
}: { 
  mobileState: MobileState, setMobileState: (s: MobileState) => void, enterCabin: (m: CabinMode) => void, cabinMode: CabinMode, targetMode: CabinMode | null, sessionResult: SessionResult | null, endSession: () => void, cards: string[]
}) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-32 px-8 flex flex-col items-center w-full">
      {mobileState === 'home' && (
        <div className="w-full max-w-md flex flex-col items-center justify-center flex-1">
          <SyncLogo size="large" className="mb-12" />
          <h1 className="text-5xl font-bold tracking-[0.3em] sync-text-gradient mb-2" style={{ paddingLeft: '0.3em' }}>心跃</h1>
          <h2 className="text-3xl font-bold tracking-[0.4em] sync-text-gradient opacity-90 mb-16" style={{ paddingLeft: '0.4em' }}>SYNC</h2>
          <button onClick={() => setMobileState('modeSelect')} className="px-12 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white tracking-[0.4em]">进入系统</button>
        </div>
      )}

      {mobileState === 'modeSelect' && (
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-light tracking-[0.4em] text-white/90 text-center mb-12">选择同步模式</h2>
          <button onClick={() => enterCabin('recharge')} className="w-full bg-[#1A1A1A] border border-white/10 rounded-[32px] p-8 flex flex-col items-start gap-4">
            <Zap size={24} className="text-[#4FACFE]" /><h3 className="text-xl font-medium tracking-widest text-white">精神充能</h3>
          </button>
          <button onClick={() => enterCabin('inspiration')} className="w-full bg-[#1A1A1A] border border-white/10 rounded-[32px] p-8 flex flex-col items-start gap-4">
            <Sparkles size={24} className="text-[#4FACFE]" /><h3 className="text-xl font-medium tracking-widest text-white">灵感触发</h3>
          </button>
        </div>
      )}

      {mobileState === 'activeInCabin' && (
        <div className="flex flex-col items-center justify-center flex-1 w-full">
          <SyncLogo size="small" isSyncing={true} className="mb-16" />
          <h2 className="text-2xl font-light tracking-[0.3em] text-white mb-12">交互舱同步中</h2>
          <button onClick={endSession} className="flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 text-white/40"><Power size={14} /> 提前结束</button>
        </div>
      )}

      {mobileState === 'result' && sessionResult && (
        <div className="w-full max-w-md flex flex-col items-center">
          <SyncLogo size="small" className="mb-12" />
          <h2 className="text-xl text-white/90 tracking-[0.4em] font-light mb-12">祝您旅程愉快</h2>
          <div className="w-full bg-[#1A1A1A] rounded-3xl p-10 flex flex-col items-center gap-6 border border-white/5 shadow-2xl mb-12">
            <p className="text-white/40 text-[10px] tracking-widest uppercase">本次 MoodScore</p>
            {/* 字体加粗处理 */}
            <h3 className="text-7xl font-bold text-[#4FACFE] tracking-tighter">{sessionResult.score}</h3>
            <div className="w-full h-px bg-white/5 my-4" />
            <div className="w-full flex justify-between px-4 text-sm tracking-widest">
              <span className="text-white/60">{sessionResult.mode === 'recharge' ? '精神充能' : '灵感触发'}: +{sessionResult.percent}%</span>
              <span className="text-white/60">灵感记录: +{sessionResult.cards}</span>
            </div>
          </div>
          <div className="flex w-full gap-4">
            <button onClick={() => setMobileState('home')} className="flex-1 py-4 rounded-2xl border border-white/10 bg-[#111] text-white/60 tracking-widest">返回主页</button>
            <button onClick={() => setMobileState('cardList')} className="flex-1 py-4 rounded-2xl bg-[#4FACFE]/10 border border-[#4FACFE]/30 text-[#4FACFE] tracking-widest">查看灵感卡片</button>
          </div>
        </div>
      )}

      {mobileState === 'cardList' && (
          <div className="w-full max-w-md flex flex-col gap-6">
              <button onClick={() => setMobileState('result')} className="flex items-center gap-2 text-white/40 mb-4"><ArrowLeft size={16}/> 返回</button>
              <h2 className="text-xl tracking-widest mb-4">记录的灵感 ({cards.length})</h2>
              {cards.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 italic text-white/80 leading-relaxed font-light">
                      “{c}”
                  </motion.div>
              ))}
              {cards.length === 0 && <p className="text-center text-white/20 mt-12">暂无记录</p>}
          </div>
      )}
    </motion.div>
  );
};

// ==========================================
// 4. 主流程逻辑 (8秒谢幕控制)
// ==========================================
export default function App() {
  const [view, setView] = useState<'cabin' | 'mobile'>('mobile');
  const [cabinMode, setCabinMode] = useState<CabinMode>('idle');
  const [targetMode, setTargetMode] = useState<CabinMode | null>(null);
  const [mobileState, setMobileState] = useState<MobileState>('home');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [generatedCards, setGeneratedCards] = useState<string[]>([]);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    let interval: any;
    if (cabinMode === 'recharge' || cabinMode === 'inspiration') interval = setInterval(() => setTimeElapsed(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [cabinMode]);

  const enterCabin = (mode: CabinMode) => {
    setGeneratedCards([]);
    setTargetMode(mode);
    setView('cabin');
    setCabinMode('pose-confirm');
    setMobileState('activeInCabin');
  };

  const endSession = () => {
    const max = targetMode === 'recharge' ? 600 : 720;
    const percent = Math.min(Math.round((timeElapsed / max) * 100), 100);
    setSessionResult({ mode: targetMode!, percent, score: (7.0 + Math.random()*2).toFixed(1), cards: generatedCards.length });
    
    // 核心改动：舱内进入 8 秒谢幕状态
    setCabinMode('ending');
    setMobileState('result');
    
    setTimeout(() => {
      setCabinMode('idle');
      setView('mobile');
      setTimeElapsed(0);
    }, 8000); // 8秒后自动切回
  };

  return (
    <div className="min-h-screen bg-[#111] text-white selection:bg-[#4FACFE]/30 flex flex-col font-sans">
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-1.5 bg-white/5 border border-white/10 backdrop-blur-md rounded-full">
        <button onClick={() => setView('cabin')} className={`px-6 py-2.5 rounded-full flex items-center gap-2.5 ${view === 'cabin' ? 'bg-[#4FACFE] text-white' : 'text-white/40'}`}><Monitor size={16} /><span className="text-xs">交互舱</span></button>
        <button onClick={() => setView('mobile')} className={`px-6 py-2.5 rounded-full flex items-center gap-2.5 ${view === 'mobile' ? 'bg-[#4FACFE] text-white' : 'text-white/40'}`}><Smartphone size={16} /><span className="text-xs">心跃端</span></button>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'cabin' ? (
          <CabinUI key="cabin" cabinMode={cabinMode} setCabinMode={setCabinMode} targetMode={targetMode} addCard={t => setGeneratedCards(p =>[...p, t])} timeElapsed={timeElapsed} endSession={endSession} />
        ) : (
          <MobileUI key="mobile" mobileState={mobileState} setMobileState={setMobileState} enterCabin={enterCabin} cabinMode={cabinMode} targetMode={targetMode} sessionResult={sessionResult} endSession={endSession} cards={generatedCards} />
        )}
      </AnimatePresence>
    </div>
  );
}