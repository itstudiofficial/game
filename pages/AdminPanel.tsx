
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
  const [selectedScreenshots, setSelectedScreenshots] = useState<string[] | null>(null);

  useEffect(() => {
    if (initialView) setView(initialView);
  }, [initialView]);

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

  useEffect(() => {
    refreshActiveData();
  }, [view, refreshActiveData]);

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

  const stats = useMemo(() => ({
    totalCoins: users.reduce((acc, u) => acc + (Number(u.coins) || 0), 0),
    totalDeposit: users.reduce((acc, u) => acc + (Number(u.depositBalance) || 0), 0),
    pendingTasks: transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length,
    pendingFinance: transactions.filter(tx => (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').length,
    pendingTasksCount: tasks.filter(t => t.status === 'pending').length,
    
    taskDistribution: tasks.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    financialFlow: {
      deposits: transactions.filter(tx => tx.type === 'deposit' && tx.status === 'success').reduce((s, tx) => s + (Number(tx.amount) || 0), 0),
      withdrawals: transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'success').reduce((s, tx) => s + (Number(tx.amount) || 0), 0),
    },
    
    completionAudit: {
      done: tasks.reduce((s, t) => s + (Number(t.completedCount) || 0), 0),
      total: tasks.reduce((s, t) => s + (Number(t.totalWorkers) || 0), 0),
    }
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
    
    if (tx.type === 'deposit' && status === 'success') {
      await storage.updateUserInCloud(tx.userId, { depositBalance: (cloudUser.depositBalance || 0) + tx.amount });
    } 
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
      status: 'active',
      createdAt: new Date().toLocaleString() // Set creation date and time
    };
    const currentTasks = await storage.getTasks();
    storage.setTasks([...currentTasks, newTask]);
    setNewTaskData({ title: '', link: '', type: 'YouTube', reward: 10, totalWorkers: 100, description: '', dueDate: '' });
    setIsDeploying(false);
    setView('tasks');
  };

  const getIcon = (type: string) => {
    if (type.includes('YouTube')) return 'fa-youtube text-red-500';
    if (type.includes('Websites')) return 'fa-globe text-indigo-500';
    if (type.includes('Apps')) return 'fa-mobile-screen text-emerald-500';
    if (type.includes('Social Media')) return 'fa-share-nodes text-blue-500';
    return 'fa-tasks text-slate-400';
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
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Asset Analysis</h3>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Campaign Mix</h4>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <i className="fa-solid fa-chart-pie"></i>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {Object.entries(stats.taskDistribution).length === 0 ? (
                    <p className="text-[10px] font-black text-slate-300 uppercase py-10 text-center">No campaign data recorded</p>
                  ) : (
                    Object.entries(stats.taskDistribution).map(([type, count]) => (
                      <div key={type} className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                             <i className={`fa-solid ${getIcon(type).split(' ')[0]} ${getIcon(type).split(' ')[1]} text-[10px]`}></i>
                             <span className="text-slate-600">{type}</span>
                          </div>
                          <span className="text-slate-900">{count} Active</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              type === 'YouTube' ? 'bg-rose-500' : 
                              type === 'Websites' ? 'bg-indigo-500' : 
                              type === 'Apps' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`} 
                            style={{ width: `${tasks.length > 0 ? (count / tasks.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 bg-slate-900 p-10 md:p-14 rounded-[3.5rem] text-white relative overflow-hidden shadow-3xl">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8">Financial Flow Audit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Verified Inbound (Deposits)</p>
                         <h4 className="text-5xl font-black text-emerald-400 tracking-tighter mb-4">+{stats.financialFlow.deposits.toLocaleString()}</h4>
                         <p className="text-[10px] font-bold text-slate-400 leading-relaxed">Total authorized coins injected into the AdsPredia escrow network.</p>
                       </div>
                       <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Verified Outbound (Payouts)</p>
                         <h4 className="text-5xl font-black text-indigo-400 tracking-tighter mb-4">-{stats.financialFlow.withdrawals.toLocaleString()}</h4>
                         <p className="text-[10px] font-bold text-slate-400 leading-relaxed">Total authorized coins settled via global payment gateways.</p>
                       </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-4 text-[9px] font-black uppercase tracking-widest">
                           <span className="text-indigo-300">Network Task Fulfillment</span>
                           <span>{Math.round(((stats.completionAudit.done || 0) / (stats.completionAudit.total || 1)) * 100)}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                           <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                            style={{ width: `${((stats.completionAudit.done || 0) / (stats.completionAudit.total || 1)) * 100}%` }}
                           ></div>
                        </div>
                     </div>
                     <div className="text-right shrink-0">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Global Load</p>
                        <p className="text-xl font-black">{stats.completionAudit.done.toLocaleString()} / {stats.completionAudit.total.toLocaleString()}</p>
                     </div>
                  </div>
                </div>
                <i className="fa-solid fa-chart-line absolute -right-16 -bottom-16 text-[25rem] text-white/5 -rotate-12 pointer-events-none"></i>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Recent Network Pulses</h3>
                  <button onClick={() => setView('history')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Logs</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
                  {transactions.slice(0, 4).map(tx => (
                    <div key={tx.id} className="p-8 hover:bg-slate-50/50 transition-colors">
                       <div className="flex items-center gap-3 mb-4">
                          <span className={`w-2 h-2 rounded-full ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : tx.status === 'pending' ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-rose-50 text-rose-600'}`}></span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tx.type} node</span>
                       </div>
                       <p className="text-sm font-black text-slate-900 mb-1">{tx.username || 'System Node'}</p>
                       <p className="text-[10px] font-black text-indigo-600 mb-2">{tx.amount.toLocaleString()} Coins</p>
                       <p className="text-[8px] font-bold text-slate-300 uppercase">{tx.date}</p>
                    </div>
                  ))}
               </div>
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
                       <tr>
                         <th className="px-10 py-6">ID Node</th>
                         <th className="px-6 py-6">Campaign Identity</th>
                         <th className="px-6 py-6">Yield</th>
                         <th className="px-6 py-6">Posted At</th>
                         <th className="px-6 py-6">Live Status</th>
                         <th className="px-10 py-6 text-right">Task Operations</th>
                       </tr>
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
                             <td className="px-6 py-6 font-black text-slate-400 text-[10px] uppercase">
                                {t.createdAt || 'N/A'}
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
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
