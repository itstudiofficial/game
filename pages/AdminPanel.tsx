
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
      const tasksData = storage.getTasks();
      const seoData = await storage.getSEOConfig();
      
      setUsers(uniqueUsers);
      setTransactions((t || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setTasks(tasksData || []);
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
          alert(`Success: ${tx.amount} coins credited to ${targetUser.username}`);
        }
      }
      await fetchData();
    } catch (err) {
      console.error("Audit update failed", err);
    }
  };

  const handleUserStatus = async (userId: string, status: 'active' | 'banned') => {
    try {
      await storage.updateUserInCloud(userId, { status });
      await fetchData();
      alert(`Node ${userId} updated to ${status}.`);
    } catch (e) {
      alert("Status update failed.");
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
    await storage.updateTaskInCloud(taskId, { status });
    await fetchData();
    alert(`Task protocol updated: ${status}`);
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
      const currentTasks = storage.getTasks();
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
              { id: 'tasks', label: 'Audit', icon: 'fa-list-check' },
              { id: 'finance', label: 'Finance', icon: 'fa-wallet' },
              { id: 'seo', label: 'SEO', icon: 'fa-search' },
              { id: 'history', label: 'Logs', icon: 'fa-clock' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id as any)} className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                <i className={`fa-solid ${tab.icon} ${view === tab.id ? 'opacity-100' : 'opacity-40'}`}></i> {tab.label}
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
                                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {u.status === 'banned' ? (
                                      <button onClick={() => handleUserStatus(u.id, 'active')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Activate</button>
                                    ) : (
                                      <button onClick={() => handleUserStatus(u.id, 'banned')} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">Suspend</button>
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

        {view === 'tasks' && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center px-4">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Campaign Registry Audit</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global task status monitoring</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tasks.map(t => (
                  <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-full">
                     <div>
                        <div className="flex justify-between items-start mb-6">
                           <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${t.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{t.status}</span>
                           <div className="text-right">
                              <div className="text-xl font-black text-slate-900">{t.reward} <span className="text-[8px] opacity-40 uppercase">Coins</span></div>
                           </div>
                        </div>
                        <h4 className="text-base font-black text-slate-900 mb-2 truncate">{t.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mb-6 line-clamp-2 leading-relaxed">{t.description}</p>
                     </div>
                     <div className="flex gap-3 mt-auto">
                        <button onClick={() => handleTaskAction(t.id, 'active')} className="flex-1 py-3.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-indigo-500 transition-all active:scale-95">Approve</button>
                        <button onClick={() => handleTaskAction(t.id, 'rejected')} className="flex-1 py-3.5 bg-rose-50 text-rose-600 text-[9px] font-black uppercase rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95">Ban</button>
                     </div>
                  </div>
                ))}
              </div>
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
