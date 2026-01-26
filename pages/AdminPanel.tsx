
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

  const forceRefreshData = async () => {
    setLiveSync(true);
    try {
      const [allTxs, allUsers, allTasks, seoConfig] = await Promise.all([
        storage.getAllGlobalTransactions(),
        storage.getAllUsers(),
        storage.getTasks(),
        storage.getSEOConfig()
      ]);

      setTransactions(allTxs.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      }));
      setUsers(allUsers || []);
      setTasks(allTasks || []);
      setSeo(seoConfig);
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
      if (txs) setTransactions([...txs].sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      }));
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  const totalCoinsInCirculation = useMemo(() => users.reduce((acc, u) => acc + (u.coins || 0), 0), [users]);
  const totalDepositBalance = useMemo(() => users.reduce((acc, u) => acc + (u.depositBalance || 0), 0), [users]);
  const pendingTaskAudits = useMemo(() => transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length, [transactions]);
  const pendingFinanceAudits = useMemo(() => transactions.filter(tx => (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').length, [transactions]);
  const totalAuditQueue = pendingTaskAudits + pendingFinanceAudits;
  const pendingTasksCount = useMemo(() => tasks.filter(t => t.status === 'pending').length, [tasks]);

  const filteredUsers = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    if (!s) return users;
    return users.filter(u => {
      if (!u) return false;
      const usernameMatch = (u.username || '').toLowerCase().includes(s);
      const emailMatch = (u.email || '').toLowerCase().includes(s);
      const idMatch = (u.id || '').toLowerCase().includes(s);
      return usernameMatch || emailMatch || idMatch;
    });
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
    forceRefreshData();
  };

  const handleFinanceAction = async (tx: Transaction, status: 'success' | 'failed') => {
    await storage.updateGlobalTransaction(tx.id, { status });
    const cloudUser = await storage.syncUserFromCloud(tx.userId);
    if (!cloudUser) return;
    if (tx.type === 'deposit' && status === 'success') await storage.updateUserInCloud(tx.userId, { depositBalance: (cloudUser.depositBalance || 0) + tx.amount });
    else if (tx.type === 'withdraw' && status === 'failed') await storage.updateUserInCloud(tx.userId, { coins: (cloudUser.coins || 0) + tx.amount });
    forceRefreshData();
  };

  const handleUserStatus = async (userId: string, status: 'active' | 'banned') => {
    await storage.updateUserInCloud(userId, { status });
    forceRefreshData();
  };

  const handleAdjustBalance = async (userId: string, current: number, type: 'add' | 'sub') => {
    const val = parseInt(adjustAmount);
    if (isNaN(val)) return;
    const newBal = type === 'add' ? current + val : Math.max(0, current - val);
    await storage.updateUserInCloud(userId, { coins: newBal });
    setEditingUserId(null);
    setAdjustAmount('');
    forceRefreshData();
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
    forceRefreshData();
  };

  const handleAdminDeleteTask = async (taskId: string) => {
    if (!confirm('Permanently delete this campaign? This action cannot be undone.')) return;
    await storage.deleteTaskFromCloud(taskId);
    forceRefreshData();
  };

  const handleAdminUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      await storage.updateTaskInCloud(editingTask.id, editingTask);
      setEditingTask(null);
      forceRefreshData();
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
    forceRefreshData();
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Authenticating Terminal...</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-2xl">
                <i className="fa-solid fa-user-shield"></i>
             </div>
             <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Admin <span className="text-indigo-400">Terminal</span></h1>
                <div className="flex items-center gap-2 mt-1">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Live Secure Connection</span>
                </div>
             </div>
          </div>
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar w-full xl:w-auto">
            {[
              { id: 'overview', label: 'Dashboard', icon: 'fa-chart-pie' },
              { id: 'users', label: 'Users', icon: 'fa-users' },
              { id: 'reviews', label: 'Reviews', icon: 'fa-camera-retro', badge: pendingTaskAudits },
              { id: 'create-task', label: 'New Task', icon: 'fa-plus' },
              { id: 'tasks', label: 'Manage Tasks', icon: 'fa-list-check', badge: pendingTasksCount },
              { id: 'finance', label: 'Finance', icon: 'fa-wallet', badge: pendingFinanceAudits },
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
               { label: 'Audit Queue', val: totalAuditQueue, icon: 'fa-clock', col: 'text-amber-500' },
               { label: 'Escrow Vault', val: (totalDepositBalance || 0).toLocaleString(), icon: 'fa-shield', col: 'text-emerald-600' },
               { label: 'Coins Active', val: (totalCoinsInCirculation || 0).toLocaleString(), icon: 'fa-coins', col: 'text-blue-600' }
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
                 <input type="text" placeholder="Filter by Node ID or Name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none shadow-inner focus:border-indigo-400 transition-all" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <tr><th className="px-10 py-6">Node Identity</th><th className="px-6 py-6">Credentials</th><th className="px-6 py-6">Asset Vaults</th><th className="px-10 py-6 text-right">Administrative</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="px-10 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No nodes found in directory</td></tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black">{u.username?.charAt(0) || '?'}</div>
                              <div>
                                 <p className="text-sm font-black text-slate-900">{u.username || 'Unnamed Node'}</p>
                                 <p className="text-[10px] text-indigo-400 font-mono font-black">{u.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 text-xs text-slate-500 font-bold">{u.email}</td>
                        <td className="px-6 py-6">
                           <div className="flex gap-3">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black border border-emerald-100">{(u.coins || 0).toLocaleString()} C</span>
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black border border-indigo-100">{(u.depositBalance || 0).toLocaleString()} D</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button onClick={() => setEditingUserId(u.id)} className="text-indigo-600 mr-4 text-xs font-black uppercase hover:underline">Adjust</button>
                          <button onClick={() => handleUserStatus(u.id, u.status === 'banned' ? 'active' : 'banned')} className={`${u.status === 'banned' ? 'text-emerald-600' : 'text-rose-600'} text-xs font-black uppercase hover:underline`}>{u.status === 'banned' ? 'Unban' : 'Suspend'}</button>
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
                    Pending: {pendingTaskAudits}
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
                             <td className="px-10 py-6 text-right flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
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

        {view === 'seo' && (
           <div className="max-w-3xl mx-auto bg-white rounded-[4rem] p-12 border border-slate-200 shadow-sm animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-slate-900 mb-10 uppercase tracking-tighter">Site Optimization Node</h2>
              <form onSubmit={handleSaveSEO} className="space-y-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Global Meta Title</label>
                    <input type="text" value={seo.siteTitle} onChange={e => setSeo({...seo, siteTitle: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Meta Narrative (Description)</label>
                    <textarea rows={4} value={seo.metaDescription} onChange={e => setSeo({...seo, metaDescription: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-slate-800 shadow-inner resize-none leading-relaxed" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Keywords Protocol</label>
                    <input type="text" value={seo.keywords} onChange={e => setSeo({...seo, keywords: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 shadow-inner" placeholder="keyword1, keyword2..." />
                 </div>
                 <button type="submit" disabled={savingSeo} className="w-full py-7 bg-slate-900 text-white font-black rounded-3xl uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-3xl active:scale-95">
                    {savingSeo ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Synchronizing Metadata'}
                 </button>
              </form>
           </div>
        )}

        {view === 'history' && (
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/20 gap-6">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Master Network Logs</h2>
                 <div className="flex items-center gap-4">
                    <button onClick={forceRefreshData} className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                       {liveSync ? <i className="fa-solid fa-sync fa-spin"></i> : 'Sync Logs'}
                    </button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                       <tr><th className="px-10 py-6">Ref ID</th><th className="px-6 py-6">Node Account</th><th className="px-6 py-6">Operation</th><th className="px-6 py-6">Asset Value</th><th className="px-6 py-6">Network State</th><th className="px-10 py-6 text-right">Synchronization</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {transactions.length === 0 ? (
                          <tr><td colSpan={6} className="px-10 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No global logs recorded</td></tr>
                       ) : (
                          transactions.slice(0, 100).map(tx => (
                             <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-6 font-mono text-[10px] text-indigo-600 font-black">{tx.id.substring(0, 12)}</td>
                                <td className="px-6 py-6">
                                   <div className="text-[11px] font-black text-slate-700">{tx.username || 'SYS_AUTH'}</div>
                                   <div className="text-[8px] font-black uppercase text-slate-400 font-mono">{tx.userId}</div>
                                </td>
                                <td className="px-6 py-6"><span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded text-slate-600">{tx.type}</span></td>
                                <td className={`px-6 py-6 font-black ${tx.type === 'deposit' || tx.type === 'earn' ? 'text-emerald-600' : 'text-slate-900'}`}>{(tx.amount || 0).toLocaleString()}</td>
                                <td className="px-6 py-6">
                                   <div className="flex items-center gap-2">
                                      <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'success' ? 'bg-emerald-500' : tx.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                      <span className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'success' ? 'text-emerald-600' : tx.status === 'failed' ? 'text-rose-600' : 'text-amber-600'}`}>{tx.status}</span>
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-right text-[10px] text-slate-400 font-black uppercase">{tx.date?.replace(',', ' |') || 'N/A'}</td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
        
        {view === 'finance' && (
           <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-6 duration-500">
              <div className="p-10 border-b border-slate-100 bg-emerald-50/20 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Liquidity Audit</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Review deposit and withdrawal signals</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase border border-emerald-200">Pending: {pendingFinanceAudits}</span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                       <tr><th className="px-10 py-6">Operator Identity</th><th className="px-6 py-6">Transfer Node</th><th className="px-6 py-6">Asset Volume</th><th className="px-6 py-6">Gateway Info</th><th className="px-10 py-6 text-right">Audit Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {transactions.filter(tx => (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').length === 0 ? (
                          <tr><td colSpan={5} className="px-10 py-24 text-center text-[11px] font-black text-slate-300 uppercase tracking-widest">No liquidity signals requiring audit</td></tr>
                       ) : (
                          transactions.filter(tx => (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').map(tx => (
                             <tr key={tx.id} className="hover:bg-slate-50/50 group">
                                <td className="px-10 py-6">
                                   <div className="text-sm font-black text-slate-900">{tx.username}</div>
                                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tx.userId}</div>
                                </td>
                                <td className="px-6 py-6">
                                   <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{tx.type}</span>
                                </td>
                                <td className="px-6 py-6 font-black text-slate-900 tabular-nums">{(tx.amount || 0).toLocaleString()} <span className="text-[9px] opacity-40 uppercase">Coins</span></td>
                                <td className="px-6 py-6">
                                   <div className="text-[10px] font-black text-slate-600">{tx.method}</div>
                                   <div className="text-[9px] font-bold text-indigo-400 truncate max-w-[150px]">{tx.account}</div>
                                   {tx.proofImage && (
                                      <button onClick={() => setSelectedScreenshot(tx.proofImage!)} className="text-[8px] font-black uppercase text-indigo-600 hover:underline mt-1 flex items-center gap-1"><i className="fa-solid fa-camera"></i> Inspect Transfer Proof</button>
                                   )}
                                </td>
                                <td className="px-10 py-6 text-right">
                                   <div className="flex justify-end gap-2">
                                      <button onClick={() => handleFinanceAction(tx, 'failed')} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm"><i className="fa-solid fa-xmark"></i></button>
                                      <button onClick={() => handleFinanceAction(tx, 'success')} className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 shadow-sm"><i className="fa-solid fa-check"></i></button>
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
      </div>

      {/* Edit User Balance Modal */}
      {editingUserId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-5 mb-8">
                 <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-coins"></i></div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Vault Adjustment</h3>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Modify coin balance for node {editingUserId}</p>
              <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="Enter amount..." className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl mb-8 outline-none shadow-inner focus:border-indigo-400" />
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => handleAdjustBalance(editingUserId, users.find(u => u.id === editingUserId)?.coins || 0, 'sub')} className="py-6 bg-rose-50 text-rose-600 font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-rose-600 hover:text-white transition-all border border-rose-100">Deduct Value</button>
                 <button onClick={() => handleAdjustBalance(editingUserId, users.find(u => u.id === editingUserId)?.coins || 0, 'add')} className="py-6 bg-emerald-50 text-emerald-600 font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100">Credit Value</button>
              </div>
              <button onClick={() => setEditingUserId(null)} className="w-full mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">Terminate Operation</button>
           </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-12 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black text-slate-900 uppercase mb-8 tracking-tighter">Sync Deployment Specs</h3>
              <form onSubmit={handleAdminUpdateTask} className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Asset Label</label>
                    <input type="text" value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Yield Unit</label>
                       <input type="number" value={editingTask.reward} onChange={e => setEditingTask({...editingTask, reward: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Quota Load</label>
                       <input type="number" value={editingTask.totalWorkers} onChange={e => setEditingTask({...editingTask, totalWorkers: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Protocol Summary</label>
                    <textarea rows={4} value={editingTask.description} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className="w-full px-6 py-5 bg-slate-50 rounded-[2rem] font-bold text-slate-800 outline-none resize-none" />
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all">Commit Sync</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Global Screenshot Viewer */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-[1000] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedScreenshot(null)}
        >
           <div className="relative w-full max-w-5xl h-full flex items-center justify-center pointer-events-none">
              <div className="relative w-full h-full flex items-center justify-center pointer-events-auto overflow-hidden rounded-[2rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 group">
                 <img src={selectedScreenshot} alt="Audit Proof Viewer" className="max-w-full max-h-full object-contain" />
                 
                 <div className="absolute top-8 right-8 flex gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); const link = document.createElement('a'); link.href = selectedScreenshot; link.download = 'audit_proof.jpg'; link.click(); }}
                      className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-xl border border-white/20 shadow-2xl"
                      title="Download Proof"
                    >
                       <i className="fa-solid fa-download text-xl"></i>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedScreenshot(null); }} 
                      className="w-14 h-14 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all backdrop-blur-xl border border-rose-500/20 shadow-2xl"
                    >
                       <i className="fa-solid fa-xmark text-2xl"></i>
                    </button>
                 </div>

                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-opacity">
                    Authorized Inspection Mode
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
