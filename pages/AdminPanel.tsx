
import React, { useState, useEffect, useMemo } from 'react';
import { User, Task, Transaction, TaskType, SEOConfig } from '../types';
import { storage } from '../services/storage';

interface AdminPanelProps {
  initialView?: 'overview' | 'users' | 'history' | 'tasks' | 'finance' | 'reviews' | 'seo' | 'create-task';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialView = 'overview' }) => {
  const [view, setView] = useState(initialView);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [seo, setSeo] = useState<SEOConfig>({ siteTitle: '', metaDescription: '', keywords: '', ogImage: '' });
  const [loading, setLoading] = useState(true);
  const [savingSeo, setSavingSeo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveSync, setLiveSync] = useState(false);
  
  // Coin Adjustment & Detail State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    link: '',
    type: 'YouTube' as TaskType,
    reward: 10,
    totalWorkers: 100,
    description: ''
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);

  const forceRefreshData = async () => {
    setLiveSync(true);
    try {
      const txs = await storage.getAllGlobalTransactions();
      const sortedTxs = txs.sort((a, b) => {
        const tA = new Date(a.date).getTime();
        const tB = new Date(b.date).getTime();
        return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
      });
      setTransactions(sortedTxs);
      
      const u = await storage.getAllUsers();
      setUsers(u || []);
      
      const tasksSnapshot = await storage.getTasks();
      setTasks(tasksSnapshot || []);
      
      const seoData = await storage.getSEOConfig();
      setSeo(seoData);
    } catch (err) {
      console.error("Admin refresh error:", err);
    } finally {
      setTimeout(() => setLiveSync(false), 1000);
    }
  };

  useEffect(() => {
    const initAdmin = async () => {
      setLoading(true);
      await forceRefreshData();
      setLoading(false);
    };

    initAdmin();

    const unsubscribe = storage.subscribeToAllTransactions((txs) => {
      if (txs) {
        const sorted = [...txs].sort((a, b) => {
          const tA = new Date(a.date).getTime();
          const tB = new Date(b.date).getTime();
          return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
        });
        setTransactions(sorted);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const totalCoinsInCirculation = useMemo(() => users.reduce((acc, u) => acc + (u.coins || 0), 0), [users]);
  const totalDepositBalance = useMemo(() => users.reduce((acc, u) => acc + (u.depositBalance || 0), 0), [users]);
  
  const pendingTaskAudits = useMemo(() => 
    transactions.filter(tx => tx && tx.type === 'earn' && tx.status === 'pending').length, 
    [transactions]
  );
  
  const pendingFinanceAudits = useMemo(() => 
    transactions.filter(tx => tx && (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').length, 
    [transactions]
  );
  
  const totalAuditQueue = pendingTaskAudits + pendingFinanceAudits;
  const pendingTasksCount = useMemo(() => tasks.filter(t => t.status === 'pending').length, [tasks]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const search = searchQuery.toLowerCase();
      const name = (u.username || '').toLowerCase();
      const lastName = (u.lastName || '').toLowerCase();
      const nickName = (u.nickName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const id = (u.id || '').toLowerCase();
      const city = (u.city || '').toLowerCase();
      const country = (u.country || '').toLowerCase();
      return name.includes(search) || lastName.includes(search) || nickName.includes(search) || email.includes(search) || id.includes(search) || city.includes(search) || country.includes(search);
    });
  }, [users, searchQuery]);

  const handleAuditSubmission = async (tx: Transaction, status: 'success' | 'failed') => {
    try {
      await storage.updateGlobalTransaction(tx.id, { status });
      
      if (status === 'success') {
        const cloudUser = await storage.syncUserFromCloud(tx.userId);
        if (cloudUser) {
          const newCoins = (cloudUser.coins || 0) + tx.amount;
          await storage.updateUserInCloud(tx.userId, { coins: newCoins });
        }

        if (tx.taskId) {
          const taskToUpdate = tasks.find(t => t.id === tx.taskId);
          if (taskToUpdate) {
            const newCount = (taskToUpdate.completedCount || 0) + 1;
            await storage.updateTaskInCloud(tx.taskId, { completedCount: newCount });
          }
        }
      }
      forceRefreshData();
    } catch (err) {
      console.error("Audit update failed", err);
      alert("Status synchronization failed.");
    }
  };

  const handleFinanceAction = async (tx: Transaction, status: 'success' | 'failed') => {
    try {
      await storage.updateGlobalTransaction(tx.id, { status });
      const cloudUser = await storage.syncUserFromCloud(tx.userId);
      
      if (!cloudUser) throw new Error("Target user node not found");

      if (tx.type === 'deposit' && status === 'success') {
        const newDepBal = (cloudUser.depositBalance || 0) + tx.amount;
        await storage.updateUserInCloud(tx.userId, { depositBalance: newDepBal });
      } else if (tx.type === 'withdraw' && status === 'failed') {
        const newCoins = (cloudUser.coins || 0) + tx.amount;
        await storage.updateUserInCloud(tx.userId, { coins: newCoins });
      }
      forceRefreshData();
    } catch (err) {
      console.error("Finance action failed", err);
      alert("Operation failed.");
    }
  };

  const handleUserStatus = async (userId: string, status: 'active' | 'banned') => {
    try {
      await storage.updateUserInCloud(userId, { status });
      forceRefreshData();
    } catch (e) {
      alert("Status update failed.");
    }
  };

  const handleAdjustBalance = async (userId: string, currentBalance: number, type: 'add' | 'sub') => {
    const val = parseInt(adjustAmount);
    if (isNaN(val) || val <= 0) return alert("Please enter a valid positive number.");
    
    let newBalance = currentBalance;
    if (type === 'add') {
      newBalance += val;
    } else {
      newBalance = Math.max(0, currentBalance - val);
    }

    try {
      await storage.updateUserInCloud(userId, { coins: newBalance });
      setEditingUserId(null);
      setAdjustAmount('');
      forceRefreshData();
    } catch (e) {
      alert("Adjustment failed.");
    }
  };

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeo(true);
    try {
      await storage.setSEOConfig(seo);
      alert('Global SEO sync complete.');
    } catch (err) {
      alert('SEO update failed.');
    } finally {
      setSavingSeo(false);
    }
  };

  const handleTaskAction = async (taskId: string, status: 'active' | 'rejected') => {
    try {
      await storage.updateTaskInCloud(taskId, { status });
      forceRefreshData();
    } catch (error) {
      alert("Failed to update task status.");
    }
  };

  const handleAdminCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title || !newTaskData.description || !newTaskData.link) {
      return alert('Operational data incomplete.');
    }
    
    setIsDeploying(true);
    const adminUser = storage.getUser();
    const newTask: Task = {
      id: `SYS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      ...newTaskData,
      creatorId: adminUser.id,
      completedCount: 0,
      status: 'active'
    };

    try {
      const currentTasks = await storage.getTasks();
      const updatedTasks = [...currentTasks, newTask];
      storage.setTasks(updatedTasks);
      alert('System Asset Deployed.');
      setNewTaskData({ title: '', link: '', type: 'YouTube', reward: 10, totalWorkers: 100, description: '' });
      setView('tasks');
      forceRefreshData();
    } catch (error) {
      alert('Deployment failed.');
    } finally {
      setIsDeploying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
       <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
       <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Master Root...</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-2xl shadow-indigo-500/20">
                <i className="fa-solid fa-user-shield"></i>
             </div>
             <div>
                <h1 className="text-3xl font-black text-white tracking-tighter leading-none uppercase">Admin <span className="text-indigo-400">Terminal</span></h1>
                <div className="flex items-center gap-3 mt-2">
                   <span className={`w-2 h-2 rounded-full ${liveSync ? 'bg-indigo-400 animate-ping' : 'bg-emerald-500'}`}></span>
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Node Status: Authorized</p>
                </div>
             </div>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar w-full xl:w-auto">
            {[
              { id: 'overview', label: 'Dashboard', icon: 'fa-chart-pie' },
              { id: 'users', label: 'Users', icon: 'fa-users' },
              { id: 'reviews', label: 'Reviews', icon: 'fa-camera-retro', badge: pendingTaskAudits },
              { id: 'create-task', label: 'New Task', icon: 'fa-plus' },
              { id: 'tasks', label: 'Audit', icon: 'fa-list-check', badge: pendingTasksCount },
              { id: 'finance', label: 'Finance', icon: 'fa-wallet', badge: pendingFinanceAudits },
              { id: 'seo', label: 'SEO', icon: 'fa-search' },
              { id: 'history', label: 'Logs', icon: 'fa-clock' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setView(tab.id as any)} 
                className={`relative flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                <i className={`fa-solid ${tab.icon} ${view === tab.id ? 'opacity-100' : 'opacity-40'}`}></i> {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-slate-900">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {view === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-in fade-in duration-700">
             {[
               { label: 'Network Nodes', val: users.length, icon: 'fa-users', color: 'indigo' },
               { label: 'Audit Queue', val: totalAuditQueue, icon: 'fa-clock', color: 'rose' },
               { label: 'Market Escrow', val: totalDepositBalance.toLocaleString(), icon: 'fa-shield', color: 'emerald' },
               { label: 'Coin Velocity', val: totalCoinsInCirculation.toLocaleString(), icon: 'fa-coins', color: 'amber' }
             ].map((s, i) => (
               <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm group">
                 <div className="flex justify-between items-start mb-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                       <i className={`fa-solid ${s.icon}`}></i>
                    </div>
                 </div>
                 <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{s.val}</h4>
               </div>
             ))}
           </div>
        )}

        {view === 'users' && (
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Operator Registry</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Full database including Name, City, Country and Nickname</p>
                 </div>
                 <div className="relative w-full md:w-96">
                    <i className="fa-solid fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Search ID, Nickname, City..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all"
                    />
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                       <tr>
                          <th className="px-10 py-6">Operator Node</th>
                          <th className="px-6 py-6">Identity</th>
                          <th className="px-6 py-6">Email Identity</th>
                          <th className="px-6 py-6">Location</th>
                          <th className="px-6 py-6">Vaults</th>
                          <th className="px-6 py-6">Status</th>
                          <th className="px-10 py-6 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                                      {u.username.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900">{u.username} {u.lastName}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Master Node</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-6">
                                <p className="text-[11px] font-black text-indigo-600 uppercase tracking-tight">@{u.nickName || 'No Nick'}</p>
                                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{u.id}</p>
                             </td>
                             <td className="px-6 py-6 text-[11px] font-bold text-slate-600">{u.email}</td>
                             <td className="px-6 py-6">
                                <div className="flex flex-col gap-1">
                                   <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-black uppercase rounded w-fit">{u.city || 'Unknown City'}</span>
                                   <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded w-fit">{u.country || 'Unknown Country'}</span>
                                </div>
                             </td>
                             <td className="px-6 py-6">
                                <div className="space-y-1">
                                   <p className="text-[11px] font-black text-slate-900">{u.coins?.toLocaleString() || 0} <span className="text-[8px] text-slate-400">Earn</span></p>
                                   <p className="text-[11px] font-black text-emerald-600">{u.depositBalance?.toLocaleString() || 0} <span className="text-[8px] text-slate-400">Dep</span></p>
                                </div>
                             </td>
                             <td className="px-6 py-6">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${u.status === 'banned' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                   {u.status || 'active'}
                                </span>
                             </td>
                             <td className="px-10 py-6 text-right">
                                <div className="flex items-center justify-end gap-3">
                                   <button 
                                      onClick={() => setSelectedProfileUser(u)}
                                      className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
                                      title="View Profile Dossier"
                                   >
                                      <i className="fa-solid fa-eye text-xs"></i>
                                   </button>
                                   <button 
                                      onClick={() => setEditingUserId(editingUserId === u.id ? null : u.id)}
                                      className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
                                      title="Adjust Balance"
                                   >
                                      <i className="fa-solid fa-coins text-xs"></i>
                                   </button>
                                   <button 
                                      onClick={() => handleUserStatus(u.id, u.status === 'banned' ? 'active' : 'banned')}
                                      className={`w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center transition-all shadow-sm ${u.status === 'banned' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-rose-500 hover:bg-rose-50'}`}
                                      title={u.status === 'banned' ? 'Activate Node' : 'Suspend Node'}
                                   >
                                      <i className={`fa-solid ${u.status === 'banned' ? 'fa-user-check' : 'fa-user-slash'} text-xs`}></i>
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {view === 'reviews' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-700">
              {transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length === 0 ? (
                <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                   <i className="fa-solid fa-camera text-6xl text-slate-100 mb-6"></i>
                   <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No pending audits in queue</p>
                </div>
              ) : (
                transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').map(tx => (
                   <div key={tx.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col group">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">{tx.method?.split('|')[1]?.trim() || 'Unit'}</p>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter truncate max-w-[180px]">{tx.method?.split('|')[0] || 'Task Reward'}</h3>
                         </div>
                         <div className="text-right">
                            <p className="text-2xl font-black text-emerald-600">+{tx.amount.toLocaleString()}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Yield</p>
                         </div>
                      </div>

                      <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden mb-8 border border-slate-200 cursor-pointer" onClick={() => setSelectedScreenshot(tx.proofImage || null)}>
                         {tx.proofImage ? (
                           <img src={tx.proofImage} alt="Audit Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                              <i className="fa-solid fa-image-slash text-3xl"></i>
                              <span className="text-[10px] font-black uppercase">No evidence attached</span>
                           </div>
                         )}
                         <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-white text-[8px] font-black uppercase tracking-widest">
                            {tx.date.split(',')[0]}
                         </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-8">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Operator Node</p>
                         <p className="text-[11px] font-bold text-slate-700">{tx.username} <span className="text-slate-300 mx-2">|</span> ID: {tx.userId}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-auto">
                         <button onClick={() => handleAuditSubmission(tx, 'failed')} className="py-4 bg-white border border-rose-100 text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all">Reject Unit</button>
                         <button onClick={() => handleAuditSubmission(tx, 'success')} className="py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">Verify Yield</button>
                      </div>
                   </div>
                ))
              )}
           </div>
        )}

        {view === 'finance' && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Global Finance Ledger</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit of deposits and withdrawal requests</p>
                    </div>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                       <div className="px-6 py-2.5 text-[9px] font-black uppercase text-amber-600 bg-white rounded-lg shadow-sm">{pendingFinanceAudits} Pending Requests</div>
                    </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <tr>
                             <th className="px-10 py-6">Transaction ID</th>
                             <th className="px-6 py-6">Operator</th>
                             <th className="px-6 py-6">Type</th>
                             <th className="px-6 py-6">Gateway</th>
                             <th className="px-6 py-6">Amount</th>
                             <th className="px-6 py-6">Proof/Details</th>
                             <th className="px-10 py-6 text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {transactions.filter(tx => (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').map(tx => (
                             <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-6 font-mono text-[10px] font-black text-indigo-600">{tx.id.toUpperCase()}</td>
                                <td className="px-6 py-6">
                                   <p className="text-sm font-black text-slate-900">{tx.username}</p>
                                   <p className="text-[9px] font-mono text-slate-400">ID: {tx.userId}</p>
                                </td>
                                <td className="px-6 py-6">
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{tx.type}</span>
                                </td>
                                <td className="px-6 py-6 text-xs font-black text-slate-700">{tx.method}</td>
                                <td className="px-6 py-6 font-black text-slate-900">{tx.amount.toLocaleString()} <span className="text-[8px] text-slate-400 uppercase">Coins</span></td>
                                <td className="px-6 py-6 max-w-[200px]">
                                   <div className="flex items-center gap-3">
                                      {tx.proofImage && (
                                        <button onClick={() => setSelectedScreenshot(tx.proofImage || null)} className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shrink-0">
                                           <i className="fa-solid fa-camera"></i>
                                        </button>
                                      )}
                                      <p className="text-[10px] font-bold text-slate-500 truncate">{tx.account || 'No ref provided'}</p>
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                   <div className="flex items-center justify-end gap-3">
                                      <button onClick={() => handleFinanceAction(tx, 'failed')} className="w-10 h-10 bg-white border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all"><i className="fa-solid fa-xmark"></i></button>
                                      <button onClick={() => handleFinanceAction(tx, 'success')} className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-indigo-600 transition-all shadow-lg"><i className="fa-solid fa-check"></i></button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {view === 'tasks' && (
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Campaign Audit</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Review and synchronize active marketplace assets</p>
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <tr>
                          <th className="px-10 py-6">Asset ID</th>
                          <th className="px-6 py-6">Campaign Info</th>
                          <th className="px-6 py-6">Creator ID</th>
                          <th className="px-6 py-6">Payout Units</th>
                          <th className="px-6 py-6">Quota Stats</th>
                          <th className="px-6 py-6">Audit Status</th>
                          <th className="px-10 py-6 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {tasks.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-10 py-6 font-mono text-[10px] font-black text-indigo-600">{t.id.toUpperCase()}</td>
                             <td className="px-6 py-6">
                                <p className="text-sm font-black text-slate-900 truncate max-w-[250px]">{t.title}</p>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.type}</span>
                             </td>
                             <td className="px-6 py-6 text-[10px] font-mono font-bold text-slate-400">{t.creatorId}</td>
                             <td className="px-6 py-6 font-black text-slate-900">{t.reward.toLocaleString()}</td>
                             <td className="px-6 py-6">
                                <p className="text-[11px] font-black text-slate-700 tabular-nums">{t.completedCount} <span className="text-slate-300 mx-1">/</span> {t.totalWorkers}</p>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden shadow-inner">
                                   <div className="h-full bg-indigo-500" style={{ width: `${(t.completedCount / t.totalWorkers) * 100}%` }}></div>
                                </div>
                             </td>
                             <td className="px-6 py-6">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${t.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : t.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'}`}>
                                   {t.status}
                                </span>
                             </td>
                             <td className="px-10 py-6 text-right">
                                <div className="flex items-center justify-end gap-3">
                                   {t.status === 'pending' && (
                                     <>
                                       <button onClick={() => handleTaskAction(t.id, 'rejected')} className="w-10 h-10 bg-white border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-sm"><i className="fa-solid fa-ban text-xs"></i></button>
                                       <button onClick={() => handleTaskAction(t.id, 'active')} className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"><i className="fa-solid fa-check text-xs"></i></button>
                                     </>
                                   )}
                                   {t.status === 'active' && (
                                     <button onClick={() => handleTaskAction(t.id, 'rejected')} className="w-10 h-10 bg-white border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-sm"><i className="fa-solid fa-power-off text-xs"></i></button>
                                   )}
                                   {t.status === 'rejected' && (
                                     <button onClick={() => handleTaskAction(t.id, 'active')} className="w-10 h-10 bg-white border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-all shadow-sm"><i className="fa-solid fa-play text-xs"></i></button>
                                   )}
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {view === 'create-task' && (
           <div className="max-w-3xl mx-auto bg-white rounded-[4rem] p-12 md:p-20 border border-slate-200 shadow-3xl animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-6 mb-16">
                 <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.75rem] flex items-center justify-center text-2xl shadow-xl">
                    <i className="fa-solid fa-plus"></i>
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">System Asset Deployment</h2>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Manual node generation for marketplace</p>
                 </div>
              </div>

              <form onSubmit={handleAdminCreateTask} className="space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Campaign Title</label>
                    <input type="text" value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} placeholder="e.g. System Reward Sequence Alpha" className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-slate-800 outline-none shadow-inner" />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Modality</label>
                       <select value={newTaskData.type} onChange={e => setNewTaskData({...newTaskData, type: e.target.value as any})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-slate-800 outline-none shadow-inner appearance-none">
                          <option>YouTube</option>
                          <option>Websites</option>
                          <option>Apps</option>
                          <option>Social Media</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Target Destination</label>
                       <input type="url" value={newTaskData.link} onChange={e => setNewTaskData({...newTaskData, link: e.target.value})} placeholder="https://..." className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-slate-800 outline-none shadow-inner" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Reward Units</label>
                       <input type="number" value={newTaskData.reward} onChange={e => setNewTaskData({...newTaskData, reward: parseInt(e.target.value)})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-slate-800 outline-none shadow-inner" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Quota Cap</label>
                       <input type="number" value={newTaskData.totalWorkers} onChange={e => setNewTaskData({...newTaskData, totalWorkers: parseInt(e.target.value)})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-slate-800 outline-none shadow-inner" />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Protocol Instructions</label>
                    <textarea rows={5} value={newTaskData.description} onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2.5rem] font-black text-slate-800 outline-none shadow-inner resize-none leading-relaxed" placeholder="Explicit steps for verification..."></textarea>
                 </div>

                 <button type="submit" disabled={isDeploying} className="w-full py-7 bg-slate-900 text-white font-black rounded-3xl uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-3xl active:scale-95">
                    {isDeploying ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Execute Deployment'}
                 </button>
              </form>
           </div>
        )}

        {view === 'seo' && (
           <div className="max-w-3xl mx-auto bg-white rounded-[4rem] p-12 md:p-20 border border-slate-200 shadow-3xl animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-6 mb-16">
                 <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.75rem] flex items-center justify-center text-2xl shadow-xl">
                    <i className="fa-solid fa-search"></i>
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Search Optimization</h2>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Configure global meta directives</p>
                 </div>
              </div>

              <form onSubmit={handleSaveSEO} className="space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Site Authority Title</label>
                    <input type="text" value={seo.siteTitle} onChange={e => setSeo({...seo, siteTitle: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-slate-800 outline-none shadow-inner" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Meta Description</label>
                    <textarea rows={4} value={seo.metaDescription} onChange={e => setSeo({...seo, metaDescription: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] font-black text-slate-800 outline-none shadow-inner resize-none leading-relaxed"></textarea>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Index Keywords (CSV)</label>
                    <input type="text" value={seo.keywords} onChange={e => setSeo({...seo, keywords: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-slate-800 outline-none shadow-inner" />
                 </div>
                 <button type="submit" disabled={savingSeo} className="w-full py-7 bg-slate-900 text-white font-black rounded-3xl uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-3xl active:scale-95">
                    {savingSeo ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Commit Meta Directives'}
                 </button>
              </form>
           </div>
        )}

        {view === 'history' && (
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Global Master Logs</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Audit Stream</p>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <tr>
                          <th className="px-10 py-6">Event ID</th>
                          <th className="px-6 py-6">Identity</th>
                          <th className="px-6 py-6">Operation</th>
                          <th className="px-6 py-6">Value</th>
                          <th className="px-6 py-6">Status</th>
                          <th className="px-10 py-6 text-right">Timestamp</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {transactions.slice(0, 50).map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-10 py-6 font-mono text-[10px] font-black text-indigo-600">{tx.id.split('-')[1] || tx.id.substring(0, 8)}</td>
                             <td className="px-6 py-6 text-[11px] font-bold text-slate-700">{tx.username || 'System'}</td>
                             <td className="px-6 py-6">
                                <span className="text-[11px] font-black uppercase tracking-tight text-slate-900">{tx.type}</span>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[150px]">{tx.method}</p>
                             </td>
                             <td className="px-6 py-6 font-black text-slate-900">{tx.amount.toLocaleString()}</td>
                             <td className="px-6 py-6">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : tx.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{tx.status}</span>
                             </td>
                             <td className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.date.split(',')[0]}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>

      {/* USER COIN ADJUSTMENT MODAL */}
      {editingUserId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Coin Adjustment</h3>
                 <button onClick={() => setEditingUserId(null)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-colors"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="space-y-8">
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Node ID</p>
                    <p className="text-sm font-black text-slate-800 font-mono">{editingUserId}</p>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Adjustment Value</label>
                    <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="0" className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-2xl text-slate-900 focus:ring-4 focus:ring-indigo-600/5 shadow-inner" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleAdjustBalance(editingUserId, users.find(u => u.id === editingUserId)?.coins || 0, 'sub')} className="py-6 bg-rose-50 text-rose-600 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm">Deduct Balance</button>
                    <button onClick={() => handleAdjustBalance(editingUserId, users.find(u => u.id === editingUserId)?.coins || 0, 'add')} className="py-6 bg-emerald-50 text-emerald-600 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm">Credit Balance</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* FULL USER PROFILE DOSSIER MODAL */}
      {selectedProfileUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300 overflow-y-auto">
           <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 relative">
              <div className="bg-slate-900 p-12 text-white relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <i className="fa-solid fa-passport text-9xl"></i>
                 </div>
                 <div className="relative z-10 flex items-center gap-8">
                    <div className="w-24 h-24 bg-white/10 rounded-[2rem] border border-white/20 flex items-center justify-center text-white text-4xl font-black shadow-inner">
                       {selectedProfileUser.username.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-4xl font-black tracking-tighter mb-2">{selectedProfileUser.username} {selectedProfileUser.lastName}</h3>
                       <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">@{selectedProfileUser.nickName || 'No Nick'}</span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">ID: {selectedProfileUser.id}</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedProfileUser(null)} className="absolute top-8 right-8 w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                    <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>

              <div className="p-12 space-y-12">
                 <div className="grid grid-cols-2 gap-10">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Geographical Node</p>
                       <div className="space-y-2">
                          <div className="flex items-center gap-4 text-slate-900 font-black">
                             <i className="fa-solid fa-city text-indigo-500 w-5"></i>
                             <span>{selectedProfileUser.city || 'Not Provided'}</span>
                          </div>
                          <div className="flex items-center gap-4 text-slate-900 font-black">
                             <i className="fa-solid fa-earth-americas text-indigo-500 w-5"></i>
                             <span>{selectedProfileUser.country || 'Not Provided'}</span>
                          </div>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Communication Channel</p>
                       <div className="flex items-center gap-4 text-slate-900 font-black">
                          <i className="fa-solid fa-envelope text-indigo-500 w-5"></i>
                          <span className="break-all">{selectedProfileUser.email}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-10">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Metrics</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Earning Bal</p>
                             <p className="text-2xl font-black text-slate-900 tabular-nums">{selectedProfileUser.coins?.toLocaleString() || 0}</p>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Deposit Bal</p>
                             <p className="text-2xl font-black text-emerald-600 tabular-nums">{selectedProfileUser.depositBalance?.toLocaleString() || 0}</p>
                          </div>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Operational Status</p>
                       <div className={`p-6 rounded-3xl border flex items-center justify-center gap-4 ${selectedProfileUser.status === 'banned' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                          <i className={`fa-solid ${selectedProfileUser.status === 'banned' ? 'fa-lock' : 'fa-check-circle'} text-2xl`}></i>
                          <span className="text-xl font-black uppercase tracking-tighter">{selectedProfileUser.status || 'active'}</span>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Node Initialization: Synchronized</p>
                    <div className="flex gap-4">
                       <button 
                         onClick={() => {
                            setEditingUserId(selectedProfileUser.id);
                            setSelectedProfileUser(null);
                         }}
                         className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                       >
                         Manage Funds
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* FULL-SCREEN SCREENSHOT VIEWER */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300" onClick={() => setSelectedScreenshot(null)}>
           <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center pointer-events-none">
              <div className="relative w-full h-full flex items-center justify-center pointer-events-auto overflow-hidden rounded-[2rem] md:rounded-[4rem] shadow-2xl border border-white/10">
                 <img src={selectedScreenshot} alt="Full Audit Evidence" className="max-w-full max-h-full object-contain" />
                 <button onClick={(e) => { e.stopPropagation(); setSelectedScreenshot(null); }} className="absolute top-6 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-xl border border-white/20"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
