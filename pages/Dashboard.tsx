import React, { useMemo, useState, useEffect } from 'react';
import { User, Task, Transaction } from '../types';

interface DashboardProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, tasks, transactions }) => {
  const [ledgerTab, setLedgerTab] = useState<'all' | 'pending' | 'verified'>('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const COIN_RATE = 3000;
  
  const earnings = useMemo(() => {
    const total = user.coins || 0;
    const usd = (total / COIN_RATE).toFixed(2);
    const pending = transactions
      .filter(tx => tx.type === 'earn' && tx.status === 'pending')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return { total, usd, pending };
  }, [user.coins, transactions]);

  const progressToNextDollar = ((earnings.total % COIN_RATE) / COIN_RATE) * 100;

  const ledgerList = useMemo(() => {
    let filtered = transactions.filter(tx => tx.type === 'earn');
    if (ledgerTab === 'pending') filtered = filtered.filter(tx => tx.status === 'pending');
    else if (ledgerTab === 'verified') filtered = filtered.filter(tx => tx.status === 'success');
    
    return filtered
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [transactions, ledgerTab]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = { 'YouTube': 0, 'Websites': 0, 'Apps': 0, 'Social Media': 0 };
    transactions
      .filter(tx => tx.type === 'earn' && tx.status === 'success')
      .forEach(tx => {
        const cat = tx.method?.split('|')[1]?.trim() || 'Websites';
        if (counts[cat] !== undefined) counts[cat] += tx.amount;
      });
    return counts;
  }, [transactions]);

  const maxCatValue = Math.max(...(Object.values(categoryStats) as number[]), 1);

  const getCategoryIcon = (methodStr: string = '') => {
    if (methodStr.includes('YouTube')) return 'fa-youtube text-rose-500';
    if (methodStr.includes('Websites')) return 'fa-globe text-indigo-500';
    if (methodStr.includes('Apps')) return 'fa-mobile-screen text-emerald-500';
    if (methodStr.includes('Social Media')) return 'fa-share-nodes text-blue-500';
    return 'fa-coins text-amber-500';
  };

  if (!isClient) return null;

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

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                     <div className={`px-5 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${earnings.pending > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
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
                     <p className="text-3xl font-black tabular-nums">{user.depositBalance || 0}</p>
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

        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/20 gap-6">
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Income Analysis</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit of yield and verification status</p>
             </div>
             
             <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Activity' },
                  { id: 'pending', label: 'In Audit' },
                  { id: 'verified', label: 'Verified' }
                ].map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => setLedgerTab(tab.id as any)}
                    className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${ledgerTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                    {tab.label}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
             {ledgerList.length === 0 ? (
               <div className="col-span-full py-32 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-100">
                    <i className="fa-solid fa-receipt text-4xl"></i>
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No entries found for {ledgerTab} filter</p>
               </div>
             ) : (
               ledgerList.map((tx) => (
                 <div key={tx.id} className="p-8 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                          <i className={`fa-solid ${getCategoryIcon(tx.method)}`}></i>
                       </div>
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-lg font-black text-slate-900 tabular-nums">+{tx.amount.toLocaleString()}</span>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Coins</span>
                          </div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{tx.date}</p>
                       </div>
                    </div>
                    <div className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border transition-all ${
                       tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                    }`}>
                       {tx.status === 'pending' ? 'Audit In-Progress' : 'Verified'}
                    </div>
                 </div>
               ))
             )}
          </div>
          
          <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verification managed by AI-Node Cluster-07</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
};

export default Dashboard;