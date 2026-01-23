
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
  
  // Coin Adjustment State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
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
    setView(initialView);
  }, [initialView]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const u = await storage.getAllUsers();
      const validUsers = u.filter(user => user && user.id);
      const uniqueUsers = Array.from(new Map(validUsers.map(user => [user.id, user])).values());
      
      const t = await storage.getAllGlobalTransactions();
      const seoData = await storage.getSEOConfig();
      
      const tasksSnapshot = await storage.getTasks();
      
      setUsers(uniqueUsers);
      setTransactions((t || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setTasks(tasksSnapshot || []);
      setSeo(seoData);
    } catch (error) {
      console.error("Critical Admin Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCoinsInCirculation = useMemo(() => users.reduce((acc, u) => acc + (u.coins || 0), 0), [users]);
  const totalDepositBalance = useMemo(() => users.reduce((acc, u) => acc + (u.depositBalance || 0), 0), [users]);
  const pendingAudits = useMemo(() => transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length, [transactions]);
  const pendingTasksCount = useMemo(() => tasks.filter(t => t.status === 'pending').length, [tasks]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const search = searchQuery.toLowerCase();
      const name = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const id = (u.id || '').toLowerCase();
      return name.includes(search) || email.includes(search) || id.includes(search);
    });
  }, [users, searchQuery]);

  const handleAuditSubmission = async (tx: Transaction, status: 'success' | 'failed') => {
    try {
      await storage.updateGlobalTransaction(tx.id, { status });
      if (status === 'success') {
        const targetUser = users.find(u => u.id === tx.userId);
        if (targetUser) {
          const newCoins = (targetUser.coins || 0) + tx.amount;
          await storage.updateUserInCloud(tx.userId, { coins: newCoins });
        }
      }
      await fetchData();
    } catch (err) {
      console.error("Audit update failed", err);
    }
  };

  const handleFinanceAction = async (tx: Transaction, status: 'success' | 'failed') => {
    try {
      await storage.updateGlobalTransaction(tx.id, { status });
      const targetUser = users.find(u => u.id === tx.userId);
      
      if (status === 'success' && tx.type === 'deposit') {
        if (targetUser) {
          const newDepBal = (targetUser.depositBalance || 0) + tx.amount;
          await storage.updateUserInCloud(tx.userId, { depositBalance: newDepBal });
        }
      } else if (status === 'failed' && tx.type === 'withdraw') {
        if (targetUser) {
          const newCoins = (targetUser.coins || 0) + tx.amount;
          await storage.updateUserInCloud(tx.userId, { coins: newCoins });
        }
      }
      await fetchData();
    } catch (err) {
      console.error("Finance action failed", err);
    }
  };

  const handleUserStatus = async (userId: string, status: 'active' | 'banned') => {
    try {
      await storage.updateUserInCloud(userId, { status });
      await fetchData();
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
      await fetchData();
      alert(`Balance updated for node ${userId}. New balance: ${newBalance.toLocaleString()}`);
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
      await fetchData();
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
      storage.setTasks([...currentTasks, newTask]);
      alert('System Asset Deployed.');
      setNewTaskData({ title: '', link: '', type: 'YouTube', reward: 10, totalWorkers: 100, description: '' });
      setView('tasks');
      await fetchData();
    } catch (error) {
      alert('Deployment failed.');
    } finally {
      setIsDeploying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
       <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
       <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Command Hub...</h2>
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
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   Session Root: Authorized
                </p>
             </div>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar w-full xl:w-auto">
            {[
              { id: 'overview', label: 'Dashboard', icon: 'fa-chart-pie' },
              { id: 'users', label: 'Users', icon: 'fa-users' },
              { id: 'reviews', label: 'Reviews', icon: 'fa-camera-retro' },
              { id: 'create-task', label: 'New Task', icon: 'fa-plus' },
              { id: 'tasks', label: 'Audit', icon: 'fa-list-check', badge: pendingTasksCount },
              { id: 'finance', label: 'Finance', icon: 'fa-wallet' },
              { id: 'seo', label: 'SEO', icon: 'fa-search' },
              { id: 'history', label: 'Logs', icon: 'fa-clock' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id as any)} className={`relative flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>
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
               { label: 'Audit Queue', val: pendingAudits, icon: 'fa-clock', color: 'rose' },
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Full database of registered network nodes</p>
                 </div>
                 <div className="relative w-full md:w-96">
                    <i className="fa-solid fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Search ID, Email, or Name..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all" 
                    />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <tr>
                          <th className="px-10 py-6">Operator Node</th>
                          <th className="px-6 py-6">Identity Ref</th>
                          <th className="px-6 py-6 text-right">Main Vault</th>
                          <th className="px-6 py-6 text-right">Escrow Bal</th>
                          <th className="px-6 py-6 text-center">Status</th>
                          <th className="px-10 py-6 text-right">Control</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredUsers.length === 0 ? (
                         <tr>
                            <td colSpan={6} className="py-40 text-center">
                               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                                  <i className="fa-solid fa-user-slash text-4xl"></i>
                               </div>
                               <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No matching operator records found</p>
                            </td>
                         </tr>
                       ) : (
                         filteredUsers.map(u => (
                           <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-10 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">
                                       {(u.username || 'G').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                       <div className="font-black text-slate-900 text-sm">{u.username || 'Anonymous'}</div>
                                       <div className="text-[9px] text-slate-400 lowercase font-bold">{u.email || 'no-email@registered.node'}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-6 font-mono text-[10px] text-indigo-600 font-bold">{u.id}</td>
                              <td className="px-6 py-6 text-right font-black text-slate-900">{(u.coins || 0).toLocaleString()}</td>
                              <td className="px-6 py-6 text-right font-black text-slate-400">{(u.depositBalance || 0).toLocaleString()}</td>
                              <td className="px-6 py-6 text-center">
                                 <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border transition-all ${
                                   u.status === 'banned' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                 }`}>
                                   {u.status || 'active'}
                                 </span>
                              </td>
                              <td className="px-10 py-6 text-right">
                                 <div className="flex flex-col gap-3 justify-end items-end">
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button 
                                          onClick={() => setEditingUserId(editingUserId === u.id ? null : u.id)} 
                                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                                       >
                                          {editingUserId === u.id ? 'Cancel' : 'Adjust'}
                                       </button>
                                       {u.status === 'banned' ? (
                                         <button onClick={() => handleUserStatus(u.id, 'active')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Activate</button>
                                       ) : (
                                         <button onClick={() => handleUserStatus(u.id, 'banned')} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">Suspend</button>
                                       )}
                                    </div>
                                    
                                    {/* Inline Adjustment UI */}
                                    {editingUserId === u.id && (
                                       <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                          <input 
                                             type="number" 
                                             placeholder="Amt"
                                             value={adjustAmount}
                                             onChange={(e) => setAdjustAmount(e.target.value)}
                                             className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black outline-none focus:ring-2 focus:ring-indigo-600/10"
                                          />
                                          <button 
                                             onClick={() => handleAdjustBalance(u.id, u.coins, 'add')}
                                             className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-500 active:scale-95 transition-all shadow-sm"
                                          >
                                             <i className="fa-solid fa-plus"></i>
                                          </button>
                                          <button 
                                             onClick={() => handleAdjustBalance(u.id, u.coins, 'sub')}
                                             className="w-8 h-8 flex items-center justify-center bg-rose-600 text-white rounded-lg text-xs hover:bg-rose-500 active:scale-95 transition-all shadow-sm"
                                          >
                                             <i className="fa-solid fa-minus"></i>
                                          </button>
                                       </div>
                                    )}
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

        {view === 'create-task' && (
          <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">System Asset Deployment</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Inject verified global tasks into the marketplace</p>
              </div>
              <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 text-[9px] font-black uppercase tracking-widest">
                Admin Privilege: Root Authority
              </div>
            </div>

            <form onSubmit={handleAdminCreateTask} className="space-y-10 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Campaign Title</label>
                  <input type="text" value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} placeholder="e.g. Subscribe to Spredia TV" className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all" required />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Destination Target Link</label>
                  <input type="url" value={newTaskData.link} onChange={e => setNewTaskData({...newTaskData, link: e.target.value})} placeholder="https://youtube.com/..." className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Task Modality</label>
                  <select value={newTaskData.type} onChange={e => setNewTaskData({...newTaskData, type: e.target.value as TaskType})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all appearance-none cursor-pointer">
                    <option value="YouTube">YouTube</option>
                    <option value="Websites">Websites</option>
                    <option value="Apps">Apps</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Reward (Coins)</label>
                  <input type="number" value={newTaskData.reward} onChange={e => setNewTaskData({...newTaskData, reward: parseInt(e.target.value) || 0})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all" required />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Slot Quota</label>
                  <input type="number" value={newTaskData.totalWorkers} onChange={e => setNewTaskData({...newTaskData, totalWorkers: parseInt(e.target.value) || 0})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all" required />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Operator Instructions</label>
                <textarea rows={4} value={newTaskData.description} onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} placeholder="Detailed steps for the end-user..." className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all resize-none leading-relaxed" required />
              </div>

              <div className="flex justify-end pt-6">
                 <button type="submit" disabled={isDeploying} className="px-16 py-6 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.4em] hover:bg-indigo-600 transition-all flex items-center gap-4 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50">
                   {isDeploying ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rocket"></i>}
                   Propagate System Asset
                 </button>
              </div>
            </form>
          </div>
        )}

        {view === 'reviews' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-4">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Audit Verification Queue</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Validate submitted assets for manual credit release</p>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               {transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length === 0 ? (
                 <div className="col-span-full py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 text-center">
                    <i className="fa-solid fa-check-double text-6xl text-emerald-100 mb-8"></i>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No pending audits in network stack.</p>
                 </div>
               ) : (
                 transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').map(tx => (
                   <div key={tx.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all group overflow-hidden">
                      <div 
                        onClick={() => tx.proofImage && setSelectedScreenshot(tx.proofImage)} 
                        className="w-full md:w-56 h-72 bg-slate-900 rounded-[2rem] border border-slate-100 overflow-hidden cursor-zoom-in relative shrink-0"
                      >
                         {tx.proofImage ? (
                           <img src={tx.proofImage} alt="Proof" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                             <i className="fa-solid fa-image-slash text-4xl mb-4"></i>
                             <span className="text-[8px] font-black uppercase tracking-widest">No Visual Proof</span>
                           </div>
                         )}
                         <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <i className="fa-solid fa-expand text-white text-3xl"></i>
                         </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                         <div className="space-y-6">
                            <div className="flex justify-between items-start">
                               <div className="min-w-0">
                                  <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2 truncate">{tx.username || 'Ghost Node'}</h4>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</p>
                               </div>
                               <div className="text-right shrink-0">
                                  <div className="text-2xl font-black text-indigo-600 tabular-nums">+{tx.amount}</div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">COIN DELTA</p>
                               </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Target Asset Context:</span>
                               <p className="text-[11px] font-bold text-slate-700 leading-relaxed truncate">{tx.method || 'Unknown Task Submission'}</p>
                            </div>
                         </div>
                         <div className="flex gap-4 mt-8">
                            <button 
                              onClick={() => handleAuditSubmission(tx, 'success')} 
                              className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                            >
                              Verify & Pay
                            </button>
                            <button 
                              onClick={() => handleAuditSubmission(tx, 'failed')} 
                              className="flex-1 py-5 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white border border-rose-100 transition-all active:scale-95"
                            >
                              Reject
                            </button>
                         </div>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        )}

        {view === 'finance' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-4">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Financial Command Center</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage network inflow and liquidity requests</p>
               </div>
               <div className="flex gap-4">
                  <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Pending Inflow</p>
                    <p className="text-xl font-black text-emerald-700 tabular-nums">
                      {transactions.filter(t => t.type === 'deposit' && t.status === 'pending').reduce((s,t) => s+t.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Pending Outflow</p>
                    <p className="text-xl font-black text-blue-700 tabular-nums">
                      {transactions.filter(t => t.type === 'withdraw' && t.status === 'pending').reduce((s,t) => s+t.amount, 0).toLocaleString()}
                    </p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
               {/* PENDING DEPOSITS SECTION */}
               <section>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Pending Deposit Requests</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').length === 0 ? (
                      <div className="col-span-full py-20 bg-white rounded-[3rem] border border-slate-100 text-center">
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No pending deposits detected.</p>
                      </div>
                    ) : (
                      transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').map(tx => (
                        <div key={tx.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all group overflow-hidden">
                           <div 
                             onClick={() => tx.proofImage && setSelectedScreenshot(tx.proofImage)} 
                             className="w-full md:w-48 h-56 bg-slate-900 rounded-[2rem] border border-slate-100 overflow-hidden cursor-zoom-in relative shrink-0"
                           >
                              {tx.proofImage ? (
                                <img src={tx.proofImage} alt="Proof" className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                                  <i className="fa-solid fa-image-slash text-2xl mb-2"></i>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                 <i className="fa-solid fa-expand text-white text-2xl"></i>
                              </div>
                           </div>
                           <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                 <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                       <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1 truncate">{tx.username}</h4>
                                       <div className="flex items-center gap-2">
                                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[7px] font-black rounded border border-emerald-100 uppercase">Deposit</span>
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.method}</span>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <div className="text-2xl font-black text-emerald-600 tabular-nums">+{tx.amount.toLocaleString()}</div>
                                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">COIN UNITS</p>
                                    </div>
                                 </div>
                                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">TxID / Reference:</p>
                                    <p className="text-[10px] font-mono font-bold text-slate-700 break-all">{tx.account || 'NO_REF_PROVIDED'}</p>
                                 </div>
                              </div>
                              <div className="flex gap-3">
                                 <button onClick={() => handleFinanceAction(tx, 'success')} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-100 transition-all">Approve</button>
                                 <button onClick={() => handleFinanceAction(tx, 'failed')} className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
               </section>

               {/* PENDING WITHDRAWALS SECTION */}
               <section>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Pending Withdrawal Requests</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending').length === 0 ? (
                      <div className="col-span-full py-20 bg-white rounded-[3rem] border border-slate-100 text-center">
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No pending withdrawals detected.</p>
                      </div>
                    ) : (
                      transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending').map(tx => (
                        <div key={tx.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col group transition-all hover:shadow-xl">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-5">
                                 <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl">
                                    <i className="fa-solid fa-money-bill-transfer"></i>
                                 </div>
                                 <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">{tx.username}</h4>
                                    <div className="flex items-center gap-2">
                                       <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[7px] font-black rounded border border-blue-100 uppercase">Withdraw</span>
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.method}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="text-right">
                                 {/* Policy Update: 2,000 Coins = $1.00 */}
                                 <div className="text-2xl font-black text-slate-900 tabular-nums">{(tx.amount / 2000).toFixed(2)} <span className="text-xs text-slate-400">USD</span></div>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">-{tx.amount.toLocaleString()} COINS</p>
                              </div>
                           </div>
                           
                           <div className="bg-slate-900 p-6 rounded-2xl mb-8 relative overflow-hidden">
                              <div className="relative z-10">
                                 <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">Recipient Payout Details:</p>
                                 <p className="text-sm font-black text-white break-all">{tx.account || 'NO_ACCOUNT_INFO'}</p>
                              </div>
                              <i className="fa-solid fa-wallet absolute -right-4 -bottom-4 text-6xl text-white/5 -rotate-12"></i>
                           </div>

                           <div className="flex gap-4">
                              <button onClick={() => handleFinanceAction(tx, 'success')} className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all flex items-center justify-center gap-3">
                                 <i className="fa-solid fa-circle-check text-emerald-400"></i> Process Payment
                              </button>
                              <button onClick={() => handleFinanceAction(tx, 'failed')} className="flex-1 py-5 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">
                                 Reject & Refund
                              </button>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
               </section>
            </div>
          </div>
        )}

        {view === 'tasks' && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Campaign Registry Audit</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Review user-created tasks for global deployment</p>
                 </div>
                 <button onClick={fetchData} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                   <i className="fa-solid fa-sync"></i> Refresh Registry
                 </button>
              </div>

              {/* PRIORITIZED PENDING REVIEW SECTION */}
              <section>
                <div className="flex items-center gap-4 mb-8 px-4">
                   <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">Campaigns Awaiting Review</h3>
                   <div className="h-px bg-indigo-100 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tasks.filter(t => t.status === 'pending').length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
                       <i className="fa-solid fa-clipboard-check text-4xl text-slate-100 mb-4"></i>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No campaigns currently pending review.</p>
                    </div>
                  ) : (
                    tasks.filter(t => t.status === 'pending').map(t => (
                      <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-amber-100 shadow-xl shadow-amber-500/5 hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden">
                         <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-110 transition-transform"></div>
                         <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                               <span className="px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border bg-amber-50 text-amber-600 border-amber-100 animate-pulse">Pending Review</span>
                               <div className="text-right">
                                  <div className="text-xl font-black text-slate-900">{t.reward} <span className="text-[8px] opacity-40 uppercase">Coins</span></div>
                               </div>
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-4 tracking-tight line-clamp-1">{t.title}</h4>
                            
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Instructions:</p>
                               <p className="text-[11px] font-bold text-slate-600 line-clamp-3 leading-relaxed">{t.description}</p>
                            </div>

                            <div className="space-y-3 mb-8">
                               <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                  <span>Creator Node:</span>
                                  <span className="text-indigo-600 font-mono">{t.creatorId}</span>
                               </div>
                               <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                  <span>Target Slots:</span>
                                  <span className="text-slate-900">{t.totalWorkers}</span>
                               </div>
                               <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                  <span>Category:</span>
                                  <span className="text-slate-900">{t.type}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex gap-3 mt-auto relative z-10">
                            <button onClick={() => handleTaskAction(t.id, 'active')} className="flex-[2] py-4 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-100 transition-all active:scale-95">Go Active</button>
                            <button onClick={() => handleTaskAction(t.id, 'rejected')} className="flex-1 py-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95">Reject</button>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* ARCHIVE / ACTIVE TASKS SECTION */}
              <section>
                <div className="flex items-center gap-4 mb-8 px-4">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Registry</h3>
                   <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-60 hover:opacity-100 transition-opacity">
                  {tasks.filter(t => t.status !== 'pending').map(t => (
                    <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-full">
                       <div>
                          <div className="flex justify-between items-start mb-6">
                             <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${t.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{t.status}</span>
                             <div className="text-right">
                                <div className="text-xl font-black text-slate-900">{t.reward} <span className="text-[8px] opacity-40 uppercase">Coins</span></div>
                             </div>
                          </div>
                          <h4 className="text-base font-black text-slate-900 mb-2 truncate">{t.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mb-6 line-clamp-2 leading-relaxed">{t.description}</p>
                       </div>
                       <div className="flex gap-3 mt-auto">
                          {t.status === 'rejected' ? (
                             <button onClick={() => handleTaskAction(t.id, 'active')} className="w-full py-3.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-indigo-600 transition-all active:scale-95">Reinstate</button>
                          ) : (
                             <button onClick={() => handleTaskAction(t.id, 'rejected')} className="w-full py-3.5 bg-rose-50 text-rose-600 text-[9px] font-black uppercase rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95">Terminate</button>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              </section>
           </div>
        )}

        {view === 'history' && (
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Universal Event Logs</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time recording of all node operations</p>
                 </div>
                 <i className="fa-solid fa-list-ul text-slate-100 text-3xl"></i>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <tr>
                          <th className="px-10 py-6">Event UID</th>
                          <th className="px-6 py-6">Operator</th>
                          <th className="px-6 py-6">Action</th>
                          <th className="px-6 py-6 text-right">Magnitude</th>
                          <th className="px-10 py-6 text-right">Timestamp</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {transactions.map(tx => (
                         <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6 font-mono text-[9px] text-slate-400 uppercase">{tx.id}</td>
                            <td className="px-6 py-6">
                               <div className="font-black text-slate-900 text-[11px]">{tx.username || 'System Agent'}</div>
                               <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{tx.userId}</div>
                            </td>
                            <td className="px-6 py-6">
                               <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">
                                  {tx.type.replace('_', ' ')}
                               </span>
                            </td>
                            <td className={`px-6 py-6 text-right font-black text-[11px] ${tx.type === 'withdraw' || tx.type === 'spend' ? 'text-rose-600' : 'text-emerald-600'}`}>
                               {tx.type === 'withdraw' || tx.type === 'spend' ? '-' : '+'}{tx.amount.toLocaleString()}
                            </td>
                            <td className="px-10 py-6 text-right text-[9px] font-black text-slate-300 uppercase tracking-widest">{tx.date}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {view === 'seo' && (
           <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-sm animate-in fade-in duration-500">
              <div className="mb-12">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Search Engine Configuration</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage global site indexing and social metadata</p>
              </div>
              
              <form onSubmit={handleSaveSEO} className="space-y-10 max-w-4xl">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Global Network Title</label>
                    <input type="text" value={seo.siteTitle} onChange={e => setSeo({...seo, siteTitle: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Marketing Description</label>
                    <textarea rows={3} value={seo.metaDescription} onChange={e => setSeo({...seo, metaDescription: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner resize-none focus:ring-4 focus:ring-indigo-600/5 transition-all" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Discovery Keywords</label>
                    <input type="text" value={seo.keywords} onChange={e => setSeo({...seo, keywords: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-black text-[11px] text-slate-800 outline-none shadow-inner focus:ring-4 focus:ring-indigo-600/5 transition-all" />
                 </div>
                 <button type="submit" disabled={savingSeo} className="px-12 py-6 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center gap-4 shadow-xl active:scale-95 disabled:opacity-50">
                   {savingSeo ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                   Commit SEO Config
                 </button>
              </form>
           </div>
        )}
      </div>

      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-[2000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300 overflow-y-auto"
          onClick={() => setSelectedScreenshot(null)}
        >
           <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center pointer-events-none">
              <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
                 <img src={selectedScreenshot} alt="Full Proof" className="max-w-full max-h-full object-contain rounded-xl md:rounded-3xl border border-white/10 shadow-2xl" />
                 <button 
                   onClick={(e) => { e.stopPropagation(); setSelectedScreenshot(null); }} 
                   className="absolute -top-12 md:-top-16 right-0 w-12 h-12 bg-white/10 rounded-full text-white flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-md pointer-events-auto shadow-xl"
                 >
                   <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
