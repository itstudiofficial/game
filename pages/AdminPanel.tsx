
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Task, Transaction, TaskType, SEOConfig } from '../types';
import { storage } from '../services/storage';

interface AdminPanelProps {
  initialView?: 'overview' | 'users' | 'history' | 'tasks' | 'finance' | 'reviews' | 'seo' | 'create-task';
}

const CACHE_KEY = 'admin_data_cache';

const AdminPanel: React.FC<AdminPanelProps> = ({ initialView = 'overview' }) => {
  const [view, setView] = useState(initialView);
  const [users, setUsers] = useState<User[]>(() => {
    const cached = localStorage.getItem(`${CACHE_KEY}_users`);
    return cached ? JSON.parse(cached) : [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem(`${CACHE_KEY}_txs`);
    return cached ? JSON.parse(cached) : [];
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = localStorage.getItem(`${CACHE_KEY}_tasks`);
    return cached ? JSON.parse(cached) : [];
  });
  const [seo, setSeo] = useState<SEOConfig>(() => {
    const cached = localStorage.getItem(`${CACHE_KEY}_seo`);
    return cached ? JSON.parse(cached) : { siteTitle: '', metaDescription: '', keywords: '', ogImage: '' };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [savingSeo, setSavingSeo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    link: '',
    type: 'YouTube' as TaskType,
    reward: 10,
    totalWorkers: 100,
    description: '',
    dueDate: ''
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (initialView) setView(initialView);
  }, [initialView]);

  // Segmented Fetching based on Active View
  const refreshActiveData = useCallback(async (forcedView?: string) => {
    const targetView = forcedView || view;
    setIsSyncing(true);
    
    try {
      if (targetView === 'overview' || targetView === 'history' || targetView === 'reviews' || targetView === 'finance') {
        const allTxs = await storage.getAllGlobalTransactions();
        const sortedTxs = allTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(sortedTxs);
        localStorage.setItem(`${CACHE_KEY}_txs`, JSON.stringify(sortedTxs));
      }

      if (targetView === 'overview' || targetView === 'users') {
        const allUsers = await storage.getAllUsers();
        setUsers(allUsers || []);
        localStorage.setItem(`${CACHE_KEY}_users`, JSON.stringify(allUsers));
      }

      if (targetView === 'overview' || targetView === 'tasks' || targetView === 'create-task') {
        const allTasks = await storage.getTasks();
        setTasks(allTasks || []);
        localStorage.setItem(`${CACHE_KEY}_tasks`, JSON.stringify(allTasks));
      }

      if (targetView === 'seo') {
        const seoConfig = await storage.getSEOConfig();
        setSeo(seoConfig);
        localStorage.setItem(`${CACHE_KEY}_seo`, JSON.stringify(seoConfig));
      }
    } catch (err) {
      console.error("Admin segmented sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [view]);

  // Trigger sync on view change
  useEffect(() => {
    refreshActiveData();
  }, [view, refreshActiveData]);

  // Live subscription for transactions only
  useEffect(() => {
    const unsubscribe = storage.subscribeToAllTransactions((txs) => {
      if (txs) {
        const sorted = [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(sorted);
        localStorage.setItem(`${CACHE_KEY}_txs`, JSON.stringify(sorted));
      }
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  // Performance optimized memos
  const stats = useMemo(() => ({
    totalCoins: users.reduce((acc, u) => acc + (u.coins || 0), 0),
    totalDeposit: users.reduce((acc, u) => acc + (u.depositBalance || 0), 0),
    pendingTasks: transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length,
    pendingFinance: transactions.filter(tx => (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').length,
    pendingTasksCount: tasks.filter(t => t.status === 'pending').length
  }), [users, transactions, tasks]);

  const filteredUsers = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    if (!s) return users;
    return users.filter(u => 
      u?.username?.toLowerCase().includes(s) || 
      u?.lastName?.toLowerCase().includes(s) ||
      u?.nickName?.toLowerCase().includes(s) ||
      u?.email?.toLowerCase().includes(s) || 
      u?.city?.toLowerCase().includes(s) ||
      u?.country?.toLowerCase().includes(s) ||
      u?.id?.toLowerCase().includes(s)
    );
  }, [users, searchQuery]);

  const handleAuditSubmission = async (tx: Transaction, status: 'success' | 'failed') => {
    await storage.updateGlobalTransaction(tx.id, { status });
    if (status === 'success') {
      const cloudUser = await storage.syncUserFromCloud(tx.userId);
      if (cloudUser) await storage.updateUserInCloud(tx.userId, { coins: (cloudUser.coins || 0) + tx.amount });
      if (tx.taskId) {
        const t = tasks.find(x => x.id === tx.taskId);
        if (t) await storage.updateTaskInCloud(tx.taskId, { completedCount: (t.completedCount || 0) + 1 });
      }
    }
    refreshActiveData();
  };

  const handleFinanceAction = async (tx: Transaction, status: 'success' | 'failed') => {
    await storage.updateGlobalTransaction(tx.id, { status });
    const cloudUser = await storage.syncUserFromCloud(tx.userId);
    if (!cloudUser) return;
    
    // For deposits: on success, increase depositBalance
    if (tx.type === 'deposit' && status === 'success') {
      await storage.updateUserInCloud(tx.userId, { depositBalance: (cloudUser.depositBalance || 0) + tx.amount });
    } 
    // For withdrawals: if rejected (failed), refund the coins to main balance
    else if (tx.type === 'withdraw' && status === 'failed') {
      await storage.updateUserInCloud(tx.userId, { coins: (cloudUser.coins || 0) + tx.amount });
    }
    refreshActiveData();
  };

  const handleUserStatus = async (userId: string, status: 'active' | 'banned') => {
    await storage.updateUserInCloud(userId, { status });
    refreshActiveData('users');
  };

  const handleAdjustBalance = async (userId: string, current: number, type: 'add' | 'sub') => {
    const val = parseInt(adjustAmount);
    if (isNaN(val)) return;
    const newBal = type === 'add' ? current + val : Math.max(0, current - val);
    await storage.updateUserInCloud(userId, { coins: newBal });
    setEditingUserId(null);
    setAdjustAmount('');
    refreshActiveData('users');
  };

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeo(true);
    await storage.setSEOConfig(seo);
    setSavingSeo(false);
    alert('SEO settings updated.');
  };

  const handleTaskAction = async (taskId: string, status: 'active' | 'rejected') => {
    await storage.updateTaskInCloud(taskId, { status });
    refreshActiveData('tasks');
  };

  const handleAdminDeleteTask = async (taskId: string) => {
    if (!confirm('Permanently delete this campaign?')) return;
    await storage.deleteTaskFromCloud(taskId);
    refreshActiveData('tasks');
  };

  const handleAdminUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      await storage.updateTaskInCloud(editingTask.id, editingTask);
      setEditingTask(null);
      refreshActiveData('tasks');
    }
  };

  const handleAdminCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    const adminUser = storage.getUser();
    const newTask: Task = {
      id: `SYS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      ...newTaskData,
      creatorId: adminUser.id,
      completedCount: 0,
      status: 'active'
    };
    const currentTasks = await storage.getTasks();
    storage.setTasks([...currentTasks, newTask]);
    setNewTaskData({ title: '', link: '', type: 'YouTube', reward: 10, totalWorkers: 100, description: '', dueDate: '' });
    setIsDeploying(false);
    setView('tasks');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
          {isSyncing && (
             <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 overflow-hidden">
                <div className="h-full bg-indigo-300 w-1/3 animate-[shimmer_1.5s_infinite]"></div>
             </div>
          )}
          
          <div className="flex items-center gap-6 relative z-10">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-2xl">
                <i className={`fa-solid ${isSyncing ? 'fa-sync fa-spin' : 'fa-user-shield'}`}></i>
             </div>
             <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Admin <span className="text-indigo-400">Terminal</span></h1>
                <div className="flex items-center gap-2 mt-1">
                   <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                     {isSyncing ? 'Synchronizing Nodes...' : 'System Fully Operational'}
                   </span>
                </div>
             </div>
          </div>
          
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar w-full xl:w-auto relative z-10">
            {[
              { id: 'overview', label: 'Dashboard', icon: 'fa-chart-pie' },
              { id: 'users', label: 'Users', icon: 'fa-users' },
              { id: 'reviews', label: 'Reviews', icon: 'fa-camera-retro', badge: stats.pendingTasks },
              { id: 'create-task', label: 'New Task', icon: 'fa-plus' },
              { id: 'tasks', label: 'Manage Tasks', icon: 'fa-list-check', badge: stats.pendingTasksCount },
              { id: 'finance', label: 'Finance', icon: 'fa-wallet', badge: stats.pendingFinance },
              { id: 'seo', label: 'SEO', icon: 'fa-search' },
              { id: 'history', label: 'Logs', icon: 'fa-clock' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id as any)} className={`relative flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-slate-900">{tab.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {view === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-in fade-in duration-500">
             {[
               { label: 'Network Nodes', val: users.length, icon: 'fa-users', col: 'text-indigo-600' },
               { label: 'Audit Queue', val: stats.pendingTasks + stats.pendingFinance, icon: 'fa-clock', col: 'text-amber-500' },
               { label: 'Escrow Vault', val: (stats.totalDeposit || 0).toLocaleString(), icon: 'fa-shield', col: 'text-emerald-600' },
               { label: 'Coins Active', val: (stats.totalCoins || 0).toLocaleString(), icon: 'fa-coins', col: 'text-blue-600' }
             ].map((s, i) => (
               <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">{s.label}</p>
                 <h4 className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">{s.val}</h4>
                 <i className={`fa-solid ${s.icon} absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:opacity-10 transition-opacity ${s.col}`}></i>
               </div>
             ))}
           </div>
        )}

        {view === 'users' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Operator Registry</h2>
              <div className="relative w-full md:w-80">
                 <i className="fa-solid fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                 <input type="text" placeholder="Filter by ID, Name, City, Nick..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none shadow-inner focus:border-indigo-400 transition-all" />
              </div>
            </div>
            <div className="overflow-x-auto max-h-[70vh] no-scrollbar">
              <table className="w-full text-left min-w-[1200px]">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 sticky top-0 z-20">
                  <tr>
                    <th className="px-10 py-6">Node Identity</th>
                    <th className="px-6 py-6">Personal Details</th>
                    <th className="px-6 py-6">Location Hub</th>
                    <th className="px-6 py-6">Asset Vaults</th>
                    <th className="px-6 py-6">Network Info</th>
                    <th className="px-10 py-6 text-right">Administrative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="px-10 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No nodes found in directory</td></tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                                {u.username?.charAt(0) || '?'}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-900">{u.username || 'Unnamed Node'}</p>
                                 <p className="text-[10px] text-indigo-400 font-mono font-black">{u.id}</p>
                                 <div className="mt-1">
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${u.status === 'banned' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                     {u.status || 'active'}
                                   </span>
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">L.Name: <span className="font-black">{u.lastName || 'N/A'}</span></p>
                            <p className="text-xs font-bold text-slate-700">Nick: <span className="font-black text-indigo-600">@{u.nickName || 'N/A'}</span></p>
                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-city text-slate-300 text-[10px]"></i>
                              <span className="text-xs font-black text-slate-900">{u.city || 'Unknown City'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-earth-americas text-indigo-300 text-[10px]"></i>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{u.country || 'Unknown Country'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-4 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                                <span className="text-[8px] font-black uppercase">Coins</span>
                                <span className="text-xs font-black">{(u.coins || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                                <span className="text-[8px] font-black uppercase">Deposit</span>
                                <span className="text-xs font-black">{(u.depositBalance || 0).toLocaleString()}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Referred By:</p>
                            <p className="text-[10px] font-mono font-black text-indigo-500">{u.referredBy || 'Organic'}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Active Tasks: <span className="text-slate-900">{u.completedTasks?.length || 0}</span></p>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-4">
                            <button onClick={() => setEditingUserId(u.id)} className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-600 transition-all shadow-sm">Adjust</button>
                            <button 
                              onClick={() => handleUserStatus(u.id, u.status === 'banned' ? 'active' : 'banned')} 
                              className={`px-4 py-2 text-[9px] font-black uppercase rounded-lg border transition-all ${
                                u.status === 'banned' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white' 
                                  : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white'
                              }`}
                            >
                              {u.status === 'banned' ? 'Restore' : 'Suspend'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'reviews' && (
           <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-6 duration-500">
              <div className="p-10 border-b border-slate-100 bg-amber-50/20 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Verification Queue</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit task completion proof</p>
                 </div>
                 <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black uppercase border border-amber-200">
                    Pending: {stats.pendingTasks}
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-8 gap-8">
                 {transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length === 0 ? (
                    <div className="col-span-full py-24 text-center">
                       <i className="fa-solid fa-camera-retro text-6xl text-slate-100 mb-6"></i>
                       <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No pending reviews found</p>
                    </div>
                 ) : (
                    transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').map(tx => (
                       <div key={tx.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-200 transition-all group">
                          <div className="flex justify-between items-start mb-6">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operator</p>
                                <h4 className="text-lg font-black text-slate-900">{tx.username}</h4>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Yield</p>
                                <p className="text-lg font-black text-slate-900">{tx.amount} C</p>
                             </div>
                          </div>
                          <div className="mb-8">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Task Context</p>
                             <p className="text-sm font-bold text-slate-700 truncate">{tx.method}</p>
                          </div>
                          
                          {tx.proofImage && (
                             <button 
                               onClick={() => setSelectedScreenshot(tx.proofImage!)}
                               className="w-full py-4 bg-white border border-slate-200 rounded-2xl mb-8 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                             >
                                <i className="fa-solid fa-eye"></i> Inspect Proof
                             </button>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => handleAuditSubmission(tx, 'failed')} className="py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100">Reject</button>
                             <button onClick={() => handleAuditSubmission(tx, 'success')} className="py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100">Approve</button>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        )}

        {view === 'finance' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-6 duration-500">
             <div className="p-10 border-b border-slate-100 bg-emerald-50/20 flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 uppercase">Financial Gateway</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit of incoming deposits and outgoing withdrawals</p>
                </div>
                <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase border border-emerald-200">
                   Queue size: {stats.pendingFinance}
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                     <tr>
                        <th className="px-10 py-6">Node</th>
                        <th className="px-6 py-6">Type</th>
                        <th className="px-6 py-6">Amount</th>
                        <th className="px-6 py-6">Method/Account</th>
                        <th className="px-6 py-6">Reference</th>
                        <th className="px-10 py-6 text-right">Authorize</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {transactions.filter(tx => (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').length === 0 ? (
                        <tr><td colSpan={6} className="px-10 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No pending financial moves</td></tr>
                     ) : (
                        transactions.filter(tx => (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').map(tx => (
                           <tr key={tx.id} className="hover:bg-slate-50/50">
                              <td className="px-10 py-6">
                                 <p className="text-sm font-black text-slate-900">{tx.username}</p>
                                 <p className="text-[10px] font-mono text-slate-400">{tx.userId}</p>
                              </td>
                              <td className="px-6 py-6">
                                 <span className={`px-2 py-1 rounded text-[8px] font-black uppercase border ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {tx.type}
                                 </span>
                              </td>
                              <td className="px-6 py-6 font-black text-slate-900">{tx.amount.toLocaleString()}</td>
                              <td className="px-6 py-6 text-xs font-bold text-slate-500">{tx.method}</td>
                              <td className="px-6 py-6">
                                 {tx.account ? <p className="text-[10px] font-mono font-black text-indigo-600 break-all max-w-[150px]">{tx.account}</p> : <span className="text-slate-200">N/A</span>}
                                 {tx.proofImage && (
                                   <button onClick={() => setSelectedScreenshot(tx.proofImage!)} className="mt-2 flex items-center gap-2 text-[9px] font-black text-indigo-500 uppercase hover:underline">
                                      <i className="fa-solid fa-image"></i> View Proof
                                   </button>
                                 )}
                              </td>
                              <td className="px-10 py-6 text-right">
                                 <div className="flex justify-end gap-3">
                                    <button onClick={() => handleFinanceAction(tx, 'failed')} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
                                    <button onClick={() => handleFinanceAction(tx, 'success')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><i className="fa-solid fa-check"></i></button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
             </div>
          </div>
        )}

        {view === 'history' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
             <div className="p-10 border-b border-slate-100 bg-slate-50/20">
                <h2 className="text-2xl font-black text-slate-900 uppercase">Global Transaction Logs</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit record of every event across the AdsPredia network</p>
             </div>
             <div className="overflow-x-auto max-h-[70vh] no-scrollbar">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b sticky top-0 z-20">
                     <tr>
                        <th className="px-10 py-6">TxID</th>
                        <th className="px-6 py-6">Node Operator</th>
                        <th className="px-6 py-6">Operation Type</th>
                        <th className="px-6 py-6">Unit Volume</th>
                        <th className="px-6 py-6">Final State</th>
                        <th className="px-10 py-6 text-right">Operational Timestamp</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                           <td className="px-10 py-6 font-mono text-[10px] font-black text-indigo-400">{tx.id.substring(0, 12)}...</td>
                           <td className="px-6 py-6">
                              <p className="text-sm font-black text-slate-900">{tx.username || 'System Node'}</p>
                              <p className="text-[9px] font-mono text-slate-400">{tx.userId}</p>
                           </td>
                           <td className="px-6 py-6">
                              <span className="text-[10px] font-black text-slate-500 uppercase">{tx.type}</span>
                              <p className="text-[8px] font-bold text-slate-300 truncate max-w-[150px]">{tx.method}</p>
                           </td>
                           <td className="px-6 py-6 font-black text-slate-900">{tx.amount.toLocaleString()} C</td>
                           <td className="px-6 py-6">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : tx.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {tx.status}
                              </span>
                           </td>
                           <td className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase">{tx.date}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
        )}

        {view === 'seo' && (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
             <div className="bg-white rounded-[4rem] border border-slate-200 shadow-3xl p-12 md:p-20 relative overflow-hidden">
                <div className="relative z-10">
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-12 uppercase">Metadata <span className="text-indigo-600">Engine</span></h2>
                   <form onSubmit={handleSaveSEO} className="space-y-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Global Site Title</label>
                         <input required type="text" value={seo.siteTitle} onChange={e => setSeo({...seo, siteTitle: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-black text-slate-800" />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Search Keywords (Comma Separated)</label>
                         <input required type="text" value={seo.keywords} onChange={e => setSeo({...seo, keywords: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-bold text-slate-600" />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Meta Description (Snippet)</label>
                         <textarea required rows={4} value={seo.metaDescription} onChange={e => setSeo({...seo, metaDescription: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-medium text-slate-500 leading-relaxed resize-none" />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">OG Social Preview Image URL</label>
                         <input type="url" value={seo.ogImage} onChange={e => setSeo({...seo, ogImage: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-mono text-xs text-indigo-400" />
                      </div>
                      <button type="submit" disabled={savingSeo} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4">
                         {savingSeo ? <i className="fa-solid fa-sync fa-spin"></i> : 'Commit Global Metadata Sync'}
                      </button>
                   </form>
                </div>
                <i className="fa-solid fa-search absolute -right-20 -bottom-20 text-[25rem] text-slate-50 -rotate-12 pointer-events-none"></i>
             </div>
          </div>
        )}

        {view === 'create-task' && (
           <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
              <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-3xl">
                 <div className="relative z-10">
                    <h2 className="text-4xl font-black tracking-tighter mb-12 uppercase">Deploy <span className="text-indigo-400">System Task</span></h2>
                    <form onSubmit={handleAdminCreateTask} className="space-y-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Task Name</label>
                          <input required type="text" value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none focus:bg-white/10 transition-all font-bold" placeholder="e.g. Subscribe to Official X Account" />
                       </div>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Yield Unit</label>
                             <input required type="number" value={newTaskData.reward} onChange={e => setNewTaskData({...newTaskData, reward: parseInt(e.target.value)})} className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none font-black text-2xl" />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Target Limit</label>
                             <input required type="number" value={newTaskData.totalWorkers} onChange={e => setNewTaskData({...newTaskData, totalWorkers: parseInt(e.target.value)})} className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none font-black text-2xl" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Asset Modality</label>
                          <select value={newTaskData.type} onChange={e => setNewTaskData({...newTaskData, type: e.target.value as TaskType})} className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none appearance-none font-black uppercase text-xs tracking-widest">
                             <option value="YouTube" className="bg-slate-900">Video Ops (YouTube)</option>
                             <option value="Websites" className="bg-slate-900">Web Traffic (Websites)</option>
                             <option value="Apps" className="bg-slate-900">App Installs (Mobile)</option>
                             <option value="Social Media" className="bg-slate-900">Social Reach (Social)</option>
                          </select>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Resource Link</label>
                          <input required type="url" value={newTaskData.link} onChange={e => setNewTaskData({...newTaskData, link: e.target.value})} className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none font-bold" placeholder="https://..." />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Audit Instructions</label>
                          <textarea required rows={4} value={newTaskData.description} onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none font-bold leading-relaxed resize-none" placeholder="Provide clear steps for operators..." />
                       </div>
                       <button type="submit" disabled={isDeploying} className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-4">
                          {isDeploying ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-paper-plane"></i> Initialize Global Deployment</>}
                       </button>
                    </form>
                 </div>
                 <i className="fa-solid fa-plus-circle absolute -right-20 -bottom-20 text-[25rem] text-white/5 -rotate-12 pointer-events-none"></i>
              </div>
           </div>
        )}

        {view === 'tasks' && (
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Global Campaign Registry</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage global marketing assets and task liquidity</p>
                 </div>
                 <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                    <span className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Assets: {tasks.length}</span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                       <tr><th className="px-10 py-6">ID Node</th><th className="px-6 py-6">Campaign Identity</th><th className="px-6 py-6">Yield</th><th className="px-6 py-6">Progress</th><th className="px-6 py-6">Live Status</th><th className="px-10 py-6 text-right">Task Operations</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {tasks.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-10 py-6 font-mono text-[10px] font-black text-indigo-600">{t.id}</td>
                             <td className="px-6 py-6">
                                <div className="text-sm font-black text-slate-900">{t.title}</div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">{t.type}</div>
                             </td>
                             <td className="px-6 py-6 font-black text-slate-900">{t.reward} C</td>
                             <td className="px-6 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-indigo-600" style={{ width: `${(t.completedCount / (t.totalWorkers || 1)) * 100}%` }}></div>
                                   </div>
                                   <span className="text-[9px] font-black text-slate-500">{t.completedCount}/{t.totalWorkers}</span>
                                </div>
                             </td>
                             <td className="px-6 py-6">
                                <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase border ${t.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : t.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                   {t.status}
                                </span>
                             </td>
                             <td className="px-10 py-6 text-right flex justify-end gap-3">
                                <button onClick={() => setEditingTask(t)} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Edit</button>
                                <button onClick={() => handleTaskAction(t.id, t.status === 'active' ? 'rejected' : 'active')} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm">{t.status === 'active' ? 'Disable' : 'Enable'}</button>
                                <button onClick={() => handleAdminDeleteTask(t.id)} className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all shadow-sm">Delete</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>

      {/* Global Screenshot Viewer */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-[2000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setSelectedScreenshot(null)}
        >
           <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center pointer-events-none">
              <div className="relative w-full h-full flex items-center justify-center pointer-events-auto overflow-hidden rounded-[3rem] shadow-2xl border border-white/10">
                 <img src={selectedScreenshot} alt="Full Size Proof" className="max-w-full max-h-full object-contain" />
                 <button 
                   onClick={(e) => { e.stopPropagation(); setSelectedScreenshot(null); }} 
                   className="absolute top-8 right-8 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-xl border border-white/20"
                 >
                   <i className="fa-solid fa-xmark text-2xl"></i>
                 </button>
              </div>
           </div>
        </div>
      )}

      {editingUserId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Adjust Coin Vault</h3>
                 <button onClick={() => setEditingUserId(null)} className="w-10 h-10 bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                   <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjustment Volume</label>
                    <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-2xl text-slate-900 shadow-inner" placeholder="0" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => {
                      const u = users.find(x => x.id === editingUserId);
                      if (u) handleAdjustBalance(u.id, u.coins, 'sub');
                    }} className="py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm">Subtract</button>
                    <button onClick={() => {
                      const u = users.find(x => x.id === editingUserId);
                      if (u) handleAdjustBalance(u.id, u.coins, 'add');
                    }} className="py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm">Add Units</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Sync Deployment Specs</h3>
                 <button onClick={() => setEditingTask(null)} className="w-12 h-12 bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                   <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>
              <form onSubmit={handleAdminUpdateTask} className="p-10 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Campaign Title</label>
                    <input 
                      type="text" 
                      value={editingTask.title} 
                      onChange={e => setEditingTask({...editingTask, title: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Worker Quota</label>
                    <input 
                      type="number" 
                      value={editingTask.totalWorkers} 
                      onChange={e => setEditingTask({...editingTask, totalWorkers: parseInt(e.target.value)})} 
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Expiry Date</label>
                    <input 
                      type="date" 
                      value={editingTask.dueDate || ''} 
                      onChange={e => setEditingTask({...editingTask, dueDate: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <button 
                  type="submit" 
                  className="w-full py-7 bg-slate-900 text-white font-black rounded-3xl uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-3xl active:scale-95"
                 >
                   Propagate Changes
                 </button>
              </form>
           </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
