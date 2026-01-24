
import React, { useState, useMemo } from 'react';

interface MathSolverProps {
  onSolve: (reward: number) => void;
}

interface Question {
  q: string;
  a: number;
}

const MathSolver: React.FC<MathSolverProps> = ({ onSolve }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

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

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const ans = parseInt(userAnswer);
    if (ans === questions[currentIndex].a) {
      setIsCorrect(true);
      setEarnedCoins(prev => prev + 5);
      onSolve(5);
      
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
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

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setIsCorrect(null);
    setCompleted(false);
    setEarnedCoins(0);
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="max-w-2xl w-full px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 border border-indigo-100 shadow-sm">
            <i className="fa-solid fa-brain"></i>
            Neural Training Node
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
            Math <span className="text-indigo-600">Solver</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Solve easy equations to generate unit yield. Each correct calculation credits 5 coins to your vault.
          </p>
        </div>

        {!completed ? (
          <div className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl p-10 md:p-16 relative overflow-hidden animate-in fade-in duration-500">
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
                   placeholder="Enter your answer" 
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
        ) : (
          <div className="bg-slate-900 rounded-[4rem] p-16 text-center text-white shadow-3xl animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
               <i className="fa-solid fa-trophy text-4xl text-yellow-400"></i>
            </div>
            <h2 className="text-5xl font-black tracking-tighter mb-6 uppercase">Calculation Sequence Complete</h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm mx-auto mb-12">
               You have successfully solved all units and earned a total of <span className="text-emerald-400 font-black">{earnedCoins} Coins</span>.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleRestart}
                className="flex-1 py-6 bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
              >
                Retrain Brain
              </button>
              <button 
                onClick={() => window.location.hash = '#dashboard'}
                className="flex-[2] py-6 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-500 transition-all active:scale-95"
              >
                Return to Command Hub
              </button>
            </div>
          </div>
        )}
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
