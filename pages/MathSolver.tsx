
import React, { useState, useMemo, useEffect } from 'react';
import { User, Transaction } from '../types';

interface MathSolverProps {
  user: User;
  onSolve: (reward: number, isLast: boolean) => void;
  transactions: Transaction[];
}

interface Question {
  q: string;
  a: number;
}

const MathSolver: React.FC<MathSolverProps> = ({ user, onSolve, transactions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const questions: Question[] = useMemo(() => [
    { q: "5 + 3", a: 8 },
    { q: "12 - 4", a: 8 },
    { q: "6 * 2", a: 12 },
    { q: "15 + 10", a: 25 },
    { q: "20 - 7", a: 13 },
    { q: "4 * 5", a: 20 },
    { q: "9 + 6", a: 15 },
    { q: "18 - 9", a: 9 },
    { q: "3 * 7", a: 21 },
    { q: "25 + 25", a: 50 },
  ], []);

  const mathHistory = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'math_reward')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const isLocked = useMemo(() => {
    if (!user.lastMathTimestamp) return false;
    return Date.now() - user.lastMathTimestamp < TWENTY_FOUR_HOURS;
  }, [user.lastMathTimestamp]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (user.lastMathTimestamp) {
        const diff = TWENTY_FOUR_HOURS - (Date.now() - user.lastMathTimestamp);
        if (diff <= 0) {
          setTimeLeft('');
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [user.lastMathTimestamp]);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const ans = parseInt(userAnswer);
    if (ans === questions[currentIndex].a) {
      setIsCorrect(true);
      setEarnedCoins(prev => prev + 5);
      
      const isLast = currentIndex === questions.length - 1;
      onSolve(5, isLast);
      
      setTimeout(() => {
        if (!isLast) {
          setCurrentIndex(prev => prev + 1);
          setUserAnswer('');
          setIsCorrect(null);
        } else {
          setCompleted(true);
        }
      }, 1000);
    } else {
      setIsCorrect(false);
      setTimeout(() => setIsCorrect(null), 1500);
    }
  };

  const SolverCard = () => {
    if (isLocked) {
      return (
        <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center shadow-3xl relative overflow-hidden animate-in zoom-in duration-500 w-full">
          <div className="relative z-10">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
              <i className="fa-solid fa-hourglass-half text-4xl text-indigo-100 animate-pulse"></i>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 uppercase">Syncing Quota</h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed mb-12">
              Neural processing units require cooling. The Math Solve sequence will reboot in:
            </p>
            <div className="text-6xl md:text-7xl font-black text-indigo-400 tabular-nums tracking-tighter mb-12">
              {timeLeft || "00:00:00"}
            </div>
            <button 
              onClick={() => window.location.hash = '#dashboard'}
              className="w-full py-6 bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white hover:bg-white/20 transition-all"
            >
              Return to Hub
            </button>
          </div>
          <i className="fa-solid fa-calculator absolute -right-20 -bottom-20 text-[25rem] text-white/5 -rotate-12 pointer-events-none"></i>
        </div>
      );
    }

    if (completed) {
      return (
        <div className="bg-slate-900 rounded-[4rem] p-16 text-center text-white shadow-3xl animate-in zoom-in-95 duration-500 w-full">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
             <i className="fa-solid fa-trophy text-4xl text-yellow-400"></i>
          </div>
          <h2 className="text-5xl font-black tracking-tighter mb-6 uppercase">Calculation Complete</h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm mx-auto mb-12">
             You have earned <span className="text-emerald-400 font-black">{earnedCoins} Coins</span>. The node is now entering a 24-hour cooldown.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.hash = '#dashboard'}
              className="w-full py-6 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-500 transition-all active:scale-95"
            >
              Return to Command Hub
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl p-10 md:p-16 relative overflow-hidden animate-in fade-in duration-500 w-full">
        <div className="flex justify-between items-center mb-12 relative z-10">
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Question Module</p>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Level 01: Basics</h2>
           </div>
           <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vault Yield</p>
             <div className="text-2xl font-black text-emerald-600">+{earnedCoins} <span className="text-[10px] opacity-40">Coins</span></div>
           </div>
        </div>

        <div className="text-center py-16 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner mb-12 relative z-10">
           <div className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-none animate-in slide-in-from-bottom-4">
             {questions[currentIndex].q}
           </div>
           <div className="mt-8 text-indigo-600 font-black text-xl uppercase tracking-widest">
              Solve the Equation
           </div>
        </div>

        <form onSubmit={handleCheck} className="relative z-10 space-y-8">
           <div className="relative">
             <input 
               type="number" 
               autoFocus
               value={userAnswer}
               onChange={e => setUserAnswer(e.target.value)}
               placeholder="Enter answer" 
               className={`w-full px-10 py-8 bg-slate-50 border-4 rounded-[2.5rem] font-black text-4xl text-center outline-none transition-all ${
                 isCorrect === true ? 'border-emerald-500 text-emerald-600' : 
                 isCorrect === false ? 'border-rose-500 text-rose-500 animate-shake' : 
                 'border-transparent focus:border-indigo-100 focus:bg-white text-slate-900'
               }`}
               disabled={isCorrect === true}
             />
             {isCorrect === true && (
               <div className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500 text-4xl">
                 <i className="fa-solid fa-circle-check animate-bounce"></i>
               </div>
             )}
           </div>

           <button 
             type="submit" 
             disabled={!userAnswer || isCorrect === true}
             className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
           >
             Execute Calculation
           </button>
        </form>

        <div className="mt-12 flex justify-between items-center relative z-10 px-4">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</div>
           <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{currentIndex + 1} / {questions.length}</div>
        </div>
        <div className="mt-4 w-full h-3 bg-slate-50 rounded-full border border-slate-100 p-1 relative z-10 overflow-hidden">
           <div 
             className="h-full bg-indigo-600 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
             style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
           ></div>
        </div>
        <i className="fa-solid fa-calculator absolute -right-16 -bottom-16 text-[20rem] text-slate-50 -rotate-12 pointer-events-none"></i>
      </div>
    );
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 border border-indigo-100 shadow-sm">
            <i className="fa-solid fa-brain"></i>
            Neural Training Node
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
            Math <span className="text-indigo-600">Solver</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Solve easy equations to generate unit yield. Each correct calculation credits 5 coins to your vault instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Content: Solver */}
          <div className="lg:col-span-8 flex justify-center">
            <SolverCard />
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Audit History</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recent math yields</p>
                </div>
                <i className="fa-solid fa-clock-rotate-left text-slate-300 text-xl"></i>
              </div>
              
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto no-scrollbar">
                {mathHistory.length === 0 ? (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                      <i className="fa-solid fa-ghost text-3xl"></i>
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No history recorded</p>
                  </div>
                ) : (
                  mathHistory.slice(0, 20).map((tx) => (
                    <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm border shadow-sm transition-transform group-hover:scale-110 bg-indigo-50 text-indigo-600 border-indigo-100">
                          <i className="fa-solid fa-calculator"></i>
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 tracking-tight">+{tx.amount} <span className="text-[9px] opacity-40 uppercase font-black">Coins</span></div>
                          <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{tx.date.split(',')[0]}</div>
                        </div>
                      </div>
                      <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        SYNCED
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
               <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Node Stats</h4>
                  <div className="flex items-baseline gap-2 mb-2">
                     <span className="text-3xl font-black tabular-nums">{mathHistory.length}</span>
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Calculations</span>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Math Yield: <span className="text-emerald-400">+{mathHistory.reduce((sum, tx) => sum + tx.amount, 0)} Units</span></p>
               </div>
               <i className="fa-solid fa-bolt absolute -right-4 -bottom-4 text-6xl text-white/5 -rotate-12"></i>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MathSolver;
