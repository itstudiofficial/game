
import React, { useState } from 'react';
import { User, Task, Transaction, TaskType } from '../types';

interface DashboardProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, tasks, transactions, onDeleteTask, onUpdateTask }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'settings'>('overview');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const userTasks = tasks.filter(t => user.createdTasks.includes(t.id));

  // Policy: 2,500 Coins = $1.00
  const COIN_RATE = 2500; 
  const usdValue = (user.coins / COIN_RATE).toFixed(2);
  const progressToNextDollar = ((user.coins % COIN_RATE) / COIN_RATE) * 100;

  const [profileData, setProfileData] = useState({
    username: user.username,
    email: user.email || 'user@adspredia.com',
    phone: '+92 3** **** ***',
    country: 'Pakistan',
    bio: "Micro-task enthusiast looking for high-quality campaigns and digital growth.",
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System identity updated successfully!');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onUpdateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        totalWorkers: editingTask.totalWorkers
      });
      setEditingTask(null);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Header Block: Identity Hub */}
        <header className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white text-2xl shadow-2xl shadow-slate-300 transition-transform group-hover:scale-105">
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
          
          <nav className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Dashboard', icon: 'fa-chart-pie' },
              { id: 'tasks', label: 'Campaigns', icon: 'fa-paper-plane' },
              { id: 'settings', label: 'Account', icon: 'fa-gear' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
            
            {/* Asset Insight Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Primary Liquidity Card */}
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
                           Exchange Rate Synchronized
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
                        <span className="text-xs font-bold text-slate-400">Next Withdraw Threshold</span>
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
                
                {/* Visual Architecture */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none opacity-30"></div>
                <i className="fa-solid fa-vault absolute -right-16 -bottom-16 text-[25rem] text-white/5 -rotate-12 pointer-events-none"></i>
              </div>

              {/* Utility Panel */}
              <div className="lg:col-span-4 grid grid-cols-1 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm group hover:border-indigo-300 transition-all flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                   <div className="relative z-10">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 transition-transform group-hover:scale-110">
                        <i className="fa-solid fa-chart-line text-xl"></i>
                      </div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Network Yield Bonus</h4>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">Verified 10%</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-emerald-500"></i>
                        Active referral node
                      </p>
                   </div>
                   <i className="fa-solid fa-arrow-trend-up absolute -right-6 -bottom-6 text-9xl text-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-500"></i>
                </div>
                
                {/* Optional context box for improved layout after removal */}
                <div className="bg-slate-200/30 p-10 rounded-[3rem] border border-dashed border-slate-300 flex flex-col justify-center items-center text-center opacity-60">
                   <i className="fa-solid fa-shield-halved text-2xl text-slate-400 mb-4"></i>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Ledger Sync Active</p>
                </div>
              </div>
            </div>

            {/* Earning History Container (Boxed style) */}
            <div className="bg-white rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl">Earning History</h3>
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
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2">Complete tasks to populate the ledger</p>
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
                            <span className="font-black text-slate-900 text-lg sm:text-xl tracking-tighter capitalize">{tx.type} Sequence</span>
                            <span className={`px-2 py-0.5 text-[7px] font-black rounded uppercase tracking-widest border ${
                              tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>{tx.status}</span>
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest flex flex-wrap items-center gap-2 sm:gap-4">
                             <span className="flex items-center gap-1.5"><i className="fa-solid fa-clock opacity-50"></i> {tx.date}</span>
                             <span className="hidden sm:block w-1 h-1 bg-slate-200 rounded-full"></span>
                             <span className="font-mono text-indigo-400">{tx.id.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-0 pt-4 sm:pt-0 border-slate-100">
                        <div className={`font-black text-2xl sm:text-3xl tracking-tighter transition-all group-hover:translate-x-[-4px] ${tx.type === 'earn' || tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {tx.type === 'earn' || tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">ASSET UNITS</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {transactions.length > 8 && (
                <div className="p-8 bg-slate-50/50 text-center border-t border-slate-100">
                   <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Older Ledger Entries</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-6">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl">Live Deployment Hub</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage and audit your active advertising campaigns</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black border border-indigo-100 shadow-sm">Active Deployments: {userTasks.length}</span>
                </div>
              </div>
              
              <div className="divide-y divide-slate-50">
                {userTasks.length === 0 ? (
                  <div className="p-40 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <i className="fa-solid fa-paper-plane text-slate-200 text-5xl"></i>
                    </div>
                    <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Active Campaigns</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">Deploy your first micro-task campaign to start driving global engagement.</p>
                  </div>
                ) : (
                  userTasks.map(task => (
                    <div key={task.id} className="p-12 flex flex-col xl:flex-row xl:items-center justify-between gap-12 hover:bg-slate-50 transition-all group">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-5 mb-5">
                           <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg transition-all group-hover:bg-indigo-600">
                              <i className={`fa-solid ${task.type === 'YouTube' ? 'fa-youtube' : task.type === 'Websites' ? 'fa-globe' : 'fa-layer-group'}`}></i>
                           </div>
                           <div>
                              <h4 className="font-black text-slate-900 text-2xl tracking-tighter group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className={`px-2.5 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${
                                  task.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                  {task.status}
                                </span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{task.type} Deployment</span>
                              </div>
                           </div>
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed line-clamp-2 max-w-4xl text-sm">{task.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-10 border-t xl:border-t-0 pt-8 xl:pt-0 border-slate-100">
                         <div className="text-center xl:text-right min-w-[140px]">
                            <div className="text-4xl font-black text-slate-900 tracking-tighter">{task.completedCount} <span className="text-xs opacity-20">/ {task.totalWorkers}</span></div>
                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">Verified Interactions</div>
                         </div>
                         
                         <div className="flex gap-4">
                           <button 
                            onClick={() => setEditingTask(task)}
                            className="w-14 h-14 bg-white text-slate-400 rounded-2xl border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                           >
                             <i className="fa-solid fa-pen-nib"></i>
                           </button>
                           <button 
                            onClick={() => onDeleteTask(task.id)}
                            className="w-14 h-14 bg-white text-slate-400 rounded-2xl border border-slate-200 hover:text-red-500 hover:border-red-300 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                           >
                             <i className="fa-solid fa-trash-arrow-up"></i>
                           </button>
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-top-6 duration-700 pb-12">
            <div className="bg-white rounded-[4rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="bg-slate-900 p-16 md:p-24 text-center relative">
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-36 h-36 md:w-48 md:h-48 bg-indigo-600 rounded-[3.5rem] flex items-center justify-center text-7xl font-black text-white border-8 border-slate-900 shadow-2xl transition-transform group-hover:scale-105 group-hover:rotate-2">
                        {user.username.charAt(0)}
                      </div>
                      <button className="absolute bottom-2 right-2 w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-slate-900 hover:bg-indigo-400 transition-all active:scale-90">
                        <i className="fa-solid fa-camera-retro text-sm"></i>
                      </button>
                    </div>
                    <h3 className="text-3xl font-black text-white mt-10 tracking-tight leading-none">{user.username}</h3>
                    <div className="flex items-center gap-3 mt-4">
                       <span className="px-4 py-1.5 bg-white/10 rounded-xl text-[9px] font-black text-indigo-400 uppercase tracking-widest border border-white/5 backdrop-blur-md">Node Partner</span>
                       <span className="text-white/40 font-mono text-[10px] uppercase">ID: {user.id}</span>
                    </div>
                 </div>
                 <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]"></div>
              </div>

              <div className="p-10 md:p-20">
                <form onSubmit={handleProfileUpdate} className="space-y-16">
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-12 pb-5 border-b border-slate-100 flex items-center gap-4">
                      <i className="fa-solid fa-id-card-clip text-indigo-500"></i>
                      Identity Parameters
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Network Handle</label>
                        <div className="relative">
                           <i className="fa-solid fa-user-tag absolute left-7 top-1/2 -translate-y-1/2 text-slate-300"></i>
                           <input 
                            type="text" 
                            value={profileData.username}
                            onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                            className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:ring-4 focus:ring-indigo-600/5 font-black text-slate-700 shadow-inner outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Email Endpoint</label>
                        <div className="relative">
                           <i className="fa-solid fa-envelope-open absolute left-7 top-1/2 -translate-y-1/2 text-slate-300"></i>
                           <input 
                            type="email" 
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:ring-4 focus:ring-indigo-600/5 font-black text-slate-700 shadow-inner outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                     <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-12 pb-5 border-b border-slate-100 flex items-center gap-4">
                      <i className="fa-solid fa-shield-halved text-indigo-500"></i>
                      Security Protocol
                    </h4>
                    <div className="bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div>
                        <h5 className="font-black text-indigo-900 text-lg mb-2 tracking-tight">Multi-Factor Authentication (MFA)</h5>
                        <p className="text-xs text-indigo-700/70 font-bold leading-relaxed max-w-md">Lock your coin vault with biometrics or TOTP tokens for maximum asset security.</p>
                      </div>
                      <button type="button" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap">
                        Engage MFA Lock
                      </button>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button type="submit" className="w-full py-7 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl transform active:scale-[0.98]">
                      Synchronize Account Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Campaign Modification Interface */}
      {editingTask && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-[0_50px_120px_-20px_rgba(0,0,0,0.6)] border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-12 md:p-16">
              <div className="flex justify-between items-center mb-12">
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Campaign Audit</h3>
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                     <i className="fa-solid fa-sliders"></i>
                     Recalibrating Deployment Metrics
                   </p>
                </div>
                <button onClick={() => setEditingTask(null)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Campaign Identity Title</label>
                  <input 
                    type="text" 
                    value={editingTask.title}
                    onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-100 font-black text-slate-700 shadow-inner outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Current Conversion</label>
                      <input 
                        type="number" 
                        readOnly
                        value={editingTask.completedCount}
                        className="w-full px-8 py-5 bg-slate-100 border-none rounded-2xl font-black text-slate-400 cursor-not-allowed text-center"
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Slot Capacity</label>
                      <input 
                        type="number" 
                        value={editingTask.totalWorkers}
                        onChange={e => setEditingTask({...editingTask, totalWorkers: parseInt(e.target.value)})}
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-100 font-black text-slate-700 shadow-inner text-center outline-none transition-all"
                      />
                   </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                  <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Abort Audit</button>
                  <button type="submit" className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98]">Commit Parameters</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
