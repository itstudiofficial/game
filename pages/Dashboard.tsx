
import React, { useMemo } from 'react';
import { User, Task, Transaction } from '../types';

interface DashboardProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, tasks, transactions }) => {
  // Guard clause for non-logged in state to prevent "not showing" issues
  if (!user || !user.isLoggedIn) {
    return (
      <div className="pt-40 pb-20 flex flex-col items-center justify-center text-center px-6">
        <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-8">
          <i className="fa-solid fa-lock text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Secure Area</h2>
        <p className="text-slate-500 max-w-sm font-medium">Please synchronize your identity via the login gateway to access the analytics hub.</p>
      </div>
    );
  }

  const COIN_RATE = 5000;
  const earnings = useMemo(() => {
    const total = user.coins || 0;
    const usd = (total / COIN_RATE).toFixed(2);
    const pending = transactions
      .filter(tx => tx.type === 'earn' && tx.status === 'pending')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return { total, usd, pending };
  }, [user.coins, transactions]);

  const progressToNextDollar = ((earnings.total % COIN_RATE) / COIN_RATE) * 100;

  // Analysis Data: Earnings by Category
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = { 'YouTube': 0, 'Websites': 0, 'Apps': 0, 'Social Media': 0 };
    transactions
      .filter(tx => tx.type === 'earn' && tx.status === 'success')
      .forEach(tx => {
        const cat = tx.method?.split(': ')[1] || 'Websites';
        if (counts[cat] !== undefined) counts[cat] += tx.amount;
      });
    return counts;
  }, [transactions]);

  // Fix: Explicitly cast Object.values to number[] to satisfy Math.max typing requirements for line 52
  const maxCatValue = Math.max(...(Object.values(categoryStats) as number[]), 1);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* Header Block: Identity Hub */}
        <header className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white text-2xl shadow-2xl shadow-slate-300 transition-transform group-hover:scale-105 overflow-hidden">
                <span className="font-black">{user.username.charAt(0).toUpperCase()}</span>
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
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Network Live</span>
               </div>
            </div>
            <div className="bg-indigo-600 px-8 py-4 rounded-2xl text-white shadow-xl shadow-indigo-100">
               <span className="text-[10px] font-black uppercase tracking-widest">Node Level 01</span>
            </div>
          </div>
        </header>

        {/* Earning Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Vault Card */}
          <div className="lg:col-span-8 bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-12">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Earning Evaluation</p>
                  <div className="flex items-baseline gap-4 mb-6">
                    <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none">${earnings.usd}</h2>
                    <span className="text-xl font-bold text-slate-500 uppercase tracking-widest">USD</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                     <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-black shadow-inner flex items-center gap-3">
                       <i className="fa-solid fa-coins text-yellow-500"></i>
                       {earnings.total.toLocaleString()} <span className="opacity-40 text-[10px]">COINS</span>
                     </div>
                     <div className="px-5 py-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                       Pending Vault: {earnings.pending.toLocaleString()}
                     </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md flex flex-col justify-center text-center">
                     <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest">Tasks Done</p>
                     <p className="text-3xl font-black">{user.completedTasks?.length || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md flex flex-col justify-center text-center">
                     <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest">Deposit Bal</p>
                     <p className="text-3xl font-black">{user.depositBalance || 0}</p>
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

          {/* Revenue Distribution Chart */}
          <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm flex flex-col relative overflow-hidden">
             <div className="relative z-10 mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Revenue Analysis</h3>
                <h4 className="text-2xl font-black text-slate-900 tracking-tighter">Category Yield</h4>
             </div>
             
             <div className="flex-grow flex flex-col justify-center gap-6 relative z-10">
                {Object.entries(categoryStats).map(([cat, val], i) => (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                       <span className="text-slate-500">{cat}</span>
                       <span className="text-slate-900">{(val as number).toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          cat === 'YouTube' ? 'bg-red-500' : 
                          cat === 'Websites' ? 'bg-indigo-500' : 
                          cat === 'Apps' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        // Fix: Explicitly cast val to number to resolve arithmetic operation type error on line 170
                        style={{ width: `${((val as number) / maxCatValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-10 pt-6 border-t border-slate-50 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Analysis synchronized with global ledger</p>
             </div>
          </div>
        </div>

        {/* Activity Feed and Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Recent Activity Ledger */}
           <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Recent Activity</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit of your latest network operations</p>
                 </div>
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                    <i className="fa-solid fa-receipt text-xl"></i>
                 </div>
              </div>
              
              <div className="divide-y divide-slate-50">
                 {transactions.length === 0 ? (
                   <div className="p-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <i className="fa-solid fa-ghost text-3xl"></i>
                      </div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No activity found in vault</p>
                   </div>
                 ) : (
                   transactions.slice(0, 6).map((tx) => (
                     <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all group">
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg border shadow-sm transition-transform group-hover:scale-110 ${
                             tx.type === 'earn' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                             tx.type === 'withdraw' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                             'bg-slate-50 text-slate-600 border-slate-100'
                           }`}>
                             <i className={`fa-solid ${
                               tx.type === 'earn' ? 'fa-circle-dollar-to-slot' : 
                               tx.type === 'withdraw' ? 'fa-paper-plane' : 'fa-receipt'
                             }`}></i>
                           </div>
                           <div>
                              <div className="text-base font-black text-slate-900 tracking-tight flex items-center gap-3">
                                {tx.type.toUpperCase()} 
                                <span className="text-[8px] px-2 py-0.5 bg-slate-100 rounded text-slate-400">{tx.id}</span>
                              </div>
                              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{tx.date}</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className={`text-xl font-black tracking-tighter tabular-nums ${tx.type === 'earn' ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {tx.type === 'earn' ? '+' : '-'}{tx.amount.toLocaleString()}
                           </div>
                           <div className={`text-[8px] font-black uppercase tracking-widest mt-1 ${
                             tx.status === 'success' ? 'text-emerald-500' : 
                             tx.status === 'pending' ? 'text-amber-500' : 'text-rose-500'
                           }`}>
                             {tx.status}
                           </div>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>

           {/* Performance Tips & Quick Actions */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group cursor-pointer">
                 <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-4">Yield Optimizer</h4>
                    <p className="text-xl font-black mb-6 leading-tight">Complete 5 more high-value tasks to unlock Tier 2 rewards.</p>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all">
                       Upgrade Node <i className="fa-solid fa-arrow-right"></i>
                    </div>
                 </div>
                 <i className="fa-solid fa-rocket absolute -right-6 -bottom-6 text-9xl text-white/5 -rotate-12 transition-transform group-hover:scale-110"></i>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">System Stats</h4>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Pulse</span>
                       <span className="text-[10px] font-black text-emerald-500 uppercase">Strong</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Latency</span>
                       <span className="text-[10px] font-black text-slate-900 uppercase">24ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Affiliate Count</span>
                       <span className="text-[10px] font-black text-indigo-600 uppercase">{user.claimedReferrals?.length || 0} Nodes</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
