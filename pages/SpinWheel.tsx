
import React, { useState, useEffect, useRef } from 'react';
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

  const SPIN_COST = 50;
  const DAILY_LIMIT = 3;
  const REWARDS = [20, 30, 20, 10, 60, 20, 0];
  
  // Filter for spin transactions only
  const spinHistory = transactions.filter(tx => tx.type === 'spin');

  // Load and check daily limits
  useEffect(() => {
    const saved = localStorage.getItem('spin_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - parsed.lastTimestamp > twentyFourHours) {
        // Reset if more than 24 hours passed
        const initial = { count: 0, lastTimestamp: 0 };
        setSpinStats(initial);
        localStorage.setItem('spin_stats', JSON.stringify(initial));
      } else {
        setSpinStats(parsed);
      }
    }

    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);

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
      setSpinStats({ count: 0, lastTimestamp: 0 });
      localStorage.setItem('spin_stats', JSON.stringify({ count: 0, lastTimestamp: 0 }));
    } else {
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }
  };

  const handleSpin = () => {
    if (userCoins < SPIN_COST) return alert('Insufficient coins to spin!');
    if (isSpinning) return;
    if (spinStats.count >= DAILY_LIMIT) {
      return alert(`Daily limit reached! Next spin available in ${timeLeft}`);
    }

    setIsSpinning(true);
    setResult(null);

    const rewardIndex = Math.floor(Math.random() * REWARDS.length);
    const winAmount = REWARDS[rewardIndex];
    
    const newRotation = rotation + (360 * 5) + (360 - (rewardIndex * (360 / REWARDS.length)));
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
    }, 4000);
  };

  const canSpin = !isSpinning && userCoins >= SPIN_COST && spinStats.count < DAILY_LIMIT;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Daily Lucky Spin</h1>
        <p className="text-slate-500">Try your luck! Each spin costs {SPIN_COST} coins.</p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest">
          <i className="fa-solid fa-bolt"></i>
          Spins Remaining: {DAILY_LIMIT - spinStats.count} / {DAILY_LIMIT}
        </div>
      </div>

      <div className="relative w-80 h-80 mx-auto mb-16">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-indigo-600 text-4xl">
          <i className="fa-solid fa-caret-down"></i>
        </div>
        
        <div 
          className="w-full h-full rounded-full border-8 border-slate-800 relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1) shadow-2xl"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {REWARDS.map((rew, i) => (
            <div 
              key={i}
              className="absolute w-full h-full"
              style={{ transform: `rotate(${(360 / REWARDS.length) * i}deg)` }}
            >
              <div 
                className={`h-1/2 w-full flex flex-col items-center pt-8 font-black text-lg ${i % 2 === 0 ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}
                style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
              >
                {rew}
              </div>
            </div>
          ))}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-slate-800 rounded-full z-10 border-4 border-white shadow-lg flex items-center justify-center">
            <div className={`w-2 h-2 bg-yellow-400 rounded-full ${isSpinning ? 'animate-ping' : ''}`}></div>
          </div>
        </div>
      </div>

      <div className="space-y-6 text-center">
        {result !== null && !isSpinning && (
          <div className="animate-bounce">
            <div className={`text-2xl font-black ${result > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {result > 0 ? `YOU WON ${result} COINS! 🎉` : 'Better luck next time! 😅'}
            </div>
          </div>
        )}

        {spinStats.count >= DAILY_LIMIT ? (
          <div className="bg-slate-100 p-6 rounded-3xl inline-block border border-slate-200">
            <p className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-widest">Limit Reached</p>
            <div className="text-3xl font-black text-slate-800 tracking-tighter">
              {timeLeft || "RELOADING..."}
            </div>
          </div>
        ) : (
          <button 
            onClick={handleSpin}
            disabled={!canSpin}
            className={`px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl ${
              !canSpin 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
            }`}
          >
            {isSpinning ? 'SPINNING...' : `SPIN NOW (${SPIN_COST} COINS)`}
          </button>
        )}
        
        <p className="text-sm font-bold text-slate-400">
          Your Balance: <span className="text-indigo-600">{userCoins} Coins</span>
        </p>
      </div>

      {/* Spin History Section */}
      <div className="mt-20 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Spin History</h2>
          <div className="h-px flex-grow bg-slate-200 mx-6"></div>
          <i className="fa-solid fa-clock-rotate-left text-slate-400"></i>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          {spinHistory.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-dice-three text-slate-300 text-2xl"></i>
              </div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No spins yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {spinHistory.map((tx) => {
                // Since amount in tx is (reward - cost), the reward won is amount + SPIN_COST
                const rewardWon = tx.amount + SPIN_COST;
                return (
                  <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rewardWon > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        <i className={`fa-solid ${rewardWon > 0 ? 'fa-trophy' : 'fa-face-meh'}`}></i>
                      </div>
                      <div>
                        <div className="font-black text-slate-800 tracking-tight">
                          {rewardWon > 0 ? `Won ${rewardWon} Coins` : 'No Reward'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tx.date}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-black ${rewardWon > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {rewardWon > 0 ? `+${rewardWon}` : '0'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['3 Spins Daily', 'Verified Fair', 'Instant Win', 'Daily Reset'].map(item => (
          <div key={item} className="bg-white p-4 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpinWheel;
