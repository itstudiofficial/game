
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';

interface SpinWheelProps {
  userCoins: number;
  onSpin: (reward: number, cost: number) => void;
  transactions: Transaction[];
}

const SpinWheel: React.FC<SpinWheelProps> = ({ userCoins, onSpin, transactions }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [spinStats, setSpinStats] = useState({ count: 0, lastTimestamp: 0 });

  const SPIN_COST = 0;
  const DAILY_LIMIT = 3;
  const REWARDS = [20, 30, 10, 50, 5, 100, 0, 15];
  const COLORS = [
    'bg-indigo-600', 'bg-slate-900', 'bg-indigo-500', 'bg-indigo-800',
    'bg-indigo-700', 'bg-yellow-500', 'bg-slate-400', 'bg-indigo-400'
  ];
  
  const spinHistory = transactions.filter(tx => tx.type === 'spin');

  // Fix: Defined canSpin based on DAILY_LIMIT and isSpinning state
  const canSpin = spinStats.count < DAILY_LIMIT && !isSpinning;

  useEffect(() => {
    const saved = localStorage.getItem('spin_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - parsed.lastTimestamp > twentyFourHours) {
        const initial = { count: 0, lastTimestamp: 0 };
        setSpinStats(initial);
        localStorage.setItem('spin_stats', JSON.stringify(initial));
      } else {
        setSpinStats(parsed);
      }
    }

    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateCountdown = () => {
    const saved = localStorage.getItem('spin_stats');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (parsed.count < DAILY_LIMIT) {
      setTimeLeft('');
      return;
    }

    const now = Date.now();
    const target = parsed.lastTimestamp + (24 * 60 * 60 * 1000);
    const diff = target - now;

    if (diff <= 0) {
      setTimeLeft('');
      const resetStats = { count: 0, lastTimestamp: 0 };
      setSpinStats(resetStats);
      localStorage.setItem('spin_stats', JSON.stringify(resetStats));
    } else {
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (spinStats.count >= DAILY_LIMIT) return;

    setIsSpinning(true);
    setResult(null);

    const rewardIndex = Math.floor(Math.random() * REWARDS.length);
    const winAmount = REWARDS[rewardIndex];
    
    // Calculate rotation: base + extra turns + specific segment offset
    const segmentAngle = 360 / REWARDS.length;
    const extraTurns = 360 * 8; // 8 full turns for excitement
    const targetAngle = 360 - (rewardIndex * segmentAngle);
    const newRotation = rotation + extraTurns + targetAngle - (rotation % 360);
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(winAmount);
      
      const now = Date.now();
      const newStats = {
        count: spinStats.count + 1,
        lastTimestamp: spinStats.count === 0 ? now : spinStats.lastTimestamp
      };
      
      setSpinStats(newStats);
      localStorage.setItem('spin_stats', JSON.stringify(newStats));
      onSpin(winAmount, SPIN_COST);
    }, 4500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-yellow-200 shadow-sm">
          Lucky Rewards Program
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
          The <span className="text-indigo-600">Grand</span> Wheel
        </h1>
        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          Test your luck every 24 hours. No entry fee required. Real coins added directly to your vault.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Stats & Timer */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Availability</p>
            <div className="flex items-center justify-between mb-4">
               <span className="text-sm font-bold text-slate-600">Daily Quota</span>
               <span className="text-sm font-black text-indigo-600">{DAILY_LIMIT - spinStats.count} / {DAILY_LIMIT}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-600 transition-all duration-500" 
                 style={{ width: `${((DAILY_LIMIT - spinStats.count) / DAILY_LIMIT) * 100}%` }}
               ></div>
            </div>
          </div>

          <div className={`p-8 rounded-[2rem] transition-all duration-500 border ${spinStats.count >= DAILY_LIMIT ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${spinStats.count >= DAILY_LIMIT ? 'text-indigo-400' : 'text-slate-400'}`}>
              Reset Countdown
            </p>
            <div className={`text-4xl font-black tracking-tighter ${spinStats.count >= DAILY_LIMIT ? 'text-white' : 'text-slate-300'}`}>
              {timeLeft || "00:00:00"}
            </div>
            {spinStats.count >= DAILY_LIMIT && (
              <p className="mt-4 text-xs font-medium text-slate-500 leading-relaxed">
                You've maximized your luck for today. Check back soon!
              </p>
            )}
          </div>
        </div>

        {/* Center Column: The Wheel */}
        <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
          <div className="relative group">
            {/* 3D Outer Ring Glow */}
            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all"></div>
            
            {/* The Pointer */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-xl">
              <svg width="40" height="50" viewBox="0 0 40 50" fill="none" className={isSpinning ? 'animate-bounce' : ''}>
                <path d="M20 50L40 0H0L20 50Z" fill="#4F46E5" />
                <path d="M20 40L32 8H8L20 40Z" fill="#818CF8" />
              </svg>
            </div>

            {/* The Wheel Housing */}
            <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] rounded-full p-4 md:p-6 bg-slate-800 border-[12px] border-slate-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
              {/* Internal Decoration */}
              <div className="absolute inset-4 md:inset-6 rounded-full border-2 border-white/5 pointer-events-none z-10"></div>
              
              <div 
                className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4500ms] cubic-bezier(0.15, 0, 0.15, 1)"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {REWARDS.map((rew, i) => (
                  <div 
                    key={i}
                    className="absolute w-full h-full origin-center"
                    style={{ transform: `rotate(${(360 / REWARDS.length) * i}deg)` }}
                  >
                    <div 
                      className={`absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-[40%] flex flex-col items-center pt-10 md:pt-16 font-black ${COLORS[i % COLORS.length]} text-white`}
                      style={{ 
                        clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                        transformOrigin: 'bottom center'
                      }}
                    >
                      <span className="text-xl md:text-3xl tracking-tighter transform rotate-180 mb-2">{rew}</span>
                      <i className="fa-solid fa-coins text-xs md:text-sm text-white/30 transform rotate-180"></i>
                    </div>
                  </div>
                ))}
              </div>

              {/* Center Hub */}
              <div className="absolute inset-0 m-auto w-16 h-16 md:w-24 md:h-24 bg-slate-900 rounded-full z-20 border-4 border-slate-700 shadow-2xl flex items-center justify-center">
                 <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center shadow-inner">
                    <i className="fa-solid fa-bolt text-white text-xl md:text-3xl animate-pulse"></i>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            {result !== null && !isSpinning && (
              <div className="mb-8 animate-in zoom-in duration-500">
                <div className={`text-4xl font-black tracking-tighter ${result > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {result > 0 ? `JACKPOT: +${result} COINS` : 'EMPTY SPIN...'}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Added to your balance</div>
              </div>
            )}

            <button 
              onClick={handleSpin}
              disabled={!canSpin}
              className={`relative px-16 py-6 rounded-[2rem] font-black text-xl transition-all overflow-hidden ${
                !canSpin 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.5)]'
              }`}
            >
              <span className="relative z-10">{isSpinning ? 'CALCULATING...' : 'FREE SPIN'}</span>
              {canSpin && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-3 order-3">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Activity Log</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Last 10 results</p>
            </div>
            
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
              {spinHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <i className="fa-solid fa-ghost text-slate-100 text-4xl mb-4"></i>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No history</p>
                </div>
              ) : (
                spinHistory.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${tx.amount > 20 ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-50 text-slate-400'}`}>
                        <i className={`fa-solid ${tx.amount > 20 ? 'fa-crown' : 'fa-circle'}`}></i>
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-800">+{tx.amount} Coins</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{tx.date.split(',')[0]}</div>
                      </div>
                    </div>
                    <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">WIN</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;