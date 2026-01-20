
import React from 'react';
import { User, Task, Transaction } from '../types';

interface DashboardProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, tasks, transactions }) => {
  const COIN_RATE = 3000; 
  const usdValue = (user.coins / COIN_RATE).toFixed(2);
  const progressToNextDollar = ((user.coins % COIN_RATE) / COIN_RATE) * 100;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Header Block: Identity Hub */}
        <header className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white text-2xl shadow-2xl shadow-slate-300 transition-transform group-hover:scale-105 overflow-hidden">
                <i className="fa-solid fa-user-astronaut"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Welcome back, {user.username}</h1>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 shadow-sm">Verified Partner</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-id-badge text-indigo-500"></i>
                Authorized Access ID: <span className="text-slate-600 font-mono">{user.id}</span>
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Network Operational</span>
             </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-[0_40px_80px_-15px_rgba(15,23,42,0.25)]">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-12">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Current Asset Evaluation</p>
                    <div className="flex items-baseline gap-4 mb-6">
                      <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none">${usdValue}</h2>
                      <span className="text-xl font-bold text-slate-500 uppercase tracking-widest">USD</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                       <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-black shadow-inner flex items-center gap-3">
                         <i className="fa-solid fa-coins text-yellow-500"></i>
                         {user.coins.toLocaleString()} <span className="opacity-40 text-[10px]">COINS</span>
                       </div>
                       <div className="px-5 py-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                         Exchange Rate: 3,000 : $1
                       </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md flex flex-col justify-center text-center">
                       <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest">Tasks Done</p>
                       <p className="text-3xl font-black">{user.completedTasks.length}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md flex flex-col justify-center text-center">
                       <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest">Active Ads</p>
                       <p className="text-3xl font-black">{user.createdTasks.length}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-20 w-full max-w-2xl">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 block mb-1">Earning Trajectory</span>
                      <span className="text-xs font-bold text-slate-400">Next Withdraw Milestone</span>
                    </div>
                    <span className="text-sm font-black text-white">{Math.floor(progressToNextDollar)}%</span>
                  </div>
                  <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_25px_rgba(79,70,229,0.5)] relative overflow-hidden"
                      style={{ width: `${progressToNextDollar}%` }}
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-50"></div>
              <i className="fa-solid fa-vault absolute -right-16 -bottom-16 text-[25rem] text-white/5 -rotate-12 pointer-events-none"></i>
            </div>

            <div className="lg:col-span-4 grid grid-cols-1 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm group hover:border-indigo-300 transition-all flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                 <div className="relative z-10">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 transition-transform group-hover:scale-110">
                      <i className="fa-solid fa-chart-line text-xl"></i>
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Network Yield Bonus</h4>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">Verified 10%</p>
                 </div>
                 <i className="fa-solid fa-arrow-trend-up absolute -right-6 -bottom-6 text-9xl text-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-500"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl">Recent Activity</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time asset movement and verification logs</p>
              </div>
            </div>
            <div className="p-4 sm:p-10 space-y-4">
              {transactions.length === 0 ? (
                <div className="p-32 text-center bg-slate-50/30 rounded-[2.5rem] border border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <i className="fa-solid fa-receipt text-slate-200 text-5xl"></i>
                  </div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Operational History</h4>
                </div>
              ) : (
                transactions.slice(0, 8).map(tx => (
                  <div key={tx.id} className="p-6 sm:p-10 bg-slate-50/40 rounded-[2.5rem] border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group gap-6">
                    <div className="flex items-center gap-6 sm:gap-10">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-[1.75rem] flex items-center justify-center text-lg sm:text-xl border shadow-sm transition-transform group-hover:scale-105 ${
                        tx.type === 'earn' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        tx.type === 'spend' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        <i className={`fa-solid ${tx.type === 'earn' ? 'fa-arrow-trend-up' : tx.type === 'spend' ? 'fa-bullseye' : 'fa-code-compare'}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5 sm:mb-2">
                          <span className="font-black text-slate-900 text-lg sm:text-xl tracking-tighter capitalize">{tx.type}</span>
                          <span className={`px-2 py-0.5 text-[7px] font-black rounded uppercase tracking-widest border ${
                            tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>{tx.status}</span>
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest flex flex-wrap items-center gap-2 sm:gap-4">
                           <span className="flex items-center gap-1.5"><i className="fa-solid fa-clock opacity-50"></i> {tx.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-0 pt-4 sm:pt-0 border-slate-100">
                      <div className={`font-black text-2xl sm:text-3xl tracking-tighter ${tx.type === 'earn' || tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                        {tx.type === 'earn' || tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                      </div>
                    </div>
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

export default Dashboard;
