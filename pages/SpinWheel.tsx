
import React, { useState } from 'react';

interface SpinWheelProps {
  userCoins: number;
  onSpin: (reward: number, cost: number) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ userCoins, onSpin }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const SPIN_COST = 50;
  const REWARDS = [0, 10, 25, 50, 100, 250, 500, 1000];

  const handleSpin = () => {
    if (userCoins < SPIN_COST) return alert('Insufficient coins to spin!');
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Random reward index
    const rewardIndex = Math.floor(Math.random() * REWARDS.length);
    const winAmount = REWARDS[rewardIndex];
    
    // Rotation logic (min 5 full circles + calculated slice)
    const newRotation = rotation + (360 * 5) + (360 - (rewardIndex * (360 / REWARDS.length)));
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(winAmount);
      onSpin(winAmount, SPIN_COST);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-black text-slate-900 mb-4">Daily Lucky Spin</h1>
      <p className="text-slate-500 mb-12">Try your luck! Each spin costs {SPIN_COST} coins.</p>

      <div className="relative w-80 h-80 mx-auto mb-16">
        {/* Pointer */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-indigo-600 text-4xl">
          <i className="fa-solid fa-caret-down"></i>
        </div>
        
        {/* Wheel container */}
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
          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-slate-800 rounded-full z-10 border-4 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {result !== null && !isSpinning && (
          <div className="animate-bounce">
            <div className={`text-2xl font-black ${result > SPIN_COST ? 'text-emerald-600' : 'text-red-500'}`}>
              {result > 0 ? `YOU WON ${result} COINS! 🎉` : 'Better luck next time! 😅'}
            </div>
          </div>
        )}

        <button 
          onClick={handleSpin}
          disabled={isSpinning || userCoins < SPIN_COST}
          className={`px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl ${
            isSpinning || userCoins < SPIN_COST 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
          }`}
        >
          {isSpinning ? 'SPINNING...' : `SPIN NOW (${SPIN_COST} COINS)`}
        </button>
        
        <p className="text-sm font-bold text-slate-400">
          Your Balance: <span className="text-indigo-600">{userCoins} Coins</span>
        </p>
      </div>

      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Instant Credits', 'Fair Probabilities', 'Daily Limit', 'Fun Rewards'].map(item => (
          <div key={item} className="bg-white p-4 rounded-2xl border border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-tighter">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpinWheel;
