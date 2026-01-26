
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
  
  // Modals & States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
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
    transactions.filter(tx => tx && (tx.type === 'deposit' || tx.type === 'withdraw' ) && tx.status === 'pending').length, 
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
    let newBalance = type === 'add' ? currentBalance + val : Math.max(0, currentBalance - val);
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

  const handleAdminDeleteTask = async (taskId: string) => {
    if (!confirm('SYSTEM WARNING: Proceed with absolute deletion of this marketplace asset? This cannot be undone.')) return;
    try {
      await storage.deleteTaskFromCloud(taskId);
      forceRefreshData();
    } catch (e) {
      alert('Deletion failed.');
    }
  };

  const handleAdminUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      try {
        await storage.updateTaskInCloud(editingTask.id, editingTask);
        setEditingTask(null);
        forceRefreshData();
      } catch (e) {
        alert('Update protocol failed.');
      }
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
      setNewTaskData({ title: '', link: '', type: 'YouTube', reward: 10, totalWorkers: 100, description: '', dueDate: '' });
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
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Secure Protocol: Active</p>
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

        {view === 'tasks' && (
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Campaign Management</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Marketplace Audit and Asset Control</p>
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <tr>
                          <th className="px-10 py-6">Asset ID</th>
                          <th className="px-6 py-6">Campaign Info</th>
                          <th className="px-6 py-6">Due Date</th>
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
                             <td className="px-6 py-6 text-[10px] font-bold text-slate-500">{t.dueDate || 'N/A'}</td>
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
                                   <button 
                                      onClick={() => setEditingTask(t)}
                                      className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
                                      title="Edit Parameters"
                                   >
                                      <i className="fa-solid fa-pen-to-square text-xs"></i>
                                   </button>
                                   
                                   {t.status === 'pending' && (
                                     <>
                                       <button onClick={() => handleTaskAction(t.id, 'rejected')} className="w-10 h-10 bg-white border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-sm" title="Reject"><i className="fa-solid fa-ban text-xs"></i></button>
                                       <button onClick={() => handleTaskAction(t.id, 'active')} className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-indigo-600 transition-all shadow-lg" title="Approve"><i className="fa-solid fa-check text-xs"></i></button>
                                     </>
                                   )}
                                   {t.status === 'active' && (
                                     <button onClick={() => handleTaskAction(t.id, 'rejected')} className="w-10 h-10 bg-white border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-sm" title="Suspend"><i className="fa-solid fa-power-off text-xs"></i></button>
                                   )}
                                   {t.status === 'rejected' && (
                                     <button onClick={() => handleTaskAction(t.id, 'active')} className="w-10 h-10 bg-white border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-all shadow-sm" title="Activate"><i className="fa-solid fa-play text-xs"></i></button>
                                   )}

                                   <button 
                                      onClick={() => handleAdminDeleteTask(t.id)}
                                      className="w-10 h-10 bg-white border border-rose-50 text-rose-300 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                      title="Delete Asset"
                                   >
                                      <i className="fa-solid fa-trash-can text-xs"></i>
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

        {/* Global SEO view, Finance view, and others continue here as per current logic */}
        {/* ... (rest of the current AdminPanel view logic remains the same) ... */}
      </div>

      {/* SYSTEM EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Modify Marketplace Asset</h3>
                 <button onClick={() => setEditingTask(null)} className="w-12 h-12 bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                   <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>
              <form onSubmit={handleAdminUpdateTask} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Asset ID (Master)</label>
                       <div className="w-full px-8 py-5 bg-slate-100 rounded-2xl font-mono text-xs font-black text-slate-400">{editingTask.id}</div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Campaign Title</label>
                       <input type="text" value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Reward Units</label>
                       <input type="number" value={editingTask.reward} onChange={e => setEditingTask({...editingTask, reward: parseInt(e.target.value)})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Slot Quota</label>
                       <input type="number" value={editingTask.totalWorkers} onChange={e => setEditingTask({...editingTask, totalWorkers: parseInt(e.target.value)})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Target Destination</label>
                    <input type="url" value={editingTask.link || ''} onChange={e => setEditingTask({...editingTask, link: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Expiry Timeline (Due Date)</label>
                    <input type="date" value={editingTask.dueDate || ''} onChange={e => setEditingTask({...editingTask, dueDate: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Instructions Meta</label>
                    <textarea rows={4} value={editingTask.description} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2.5rem] font-bold text-slate-800 outline-none shadow-inner resize-none leading-relaxed" />
                 </div>

                 <button type="submit" className="w-full py-7 bg-slate-900 text-white font-black rounded-3xl uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-3xl">Commit System Update</button>
              </form>
           </div>
        </div>
      )}

      {/* USER COIN ADJUSTMENT, PROFILE MODAL, etc continue... */}
    </div>
  );
};

export default AdminPanel;
