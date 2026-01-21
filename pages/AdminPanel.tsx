
import React, { useState, useEffect } from 'react';
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
  
  // New Task Form State
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

  // Sync internal view with prop updates
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const u = await storage.getAllUsers();
      const uniqueUsers = Array.from(new Map(u.map(user => [user.id, user])).values());
      const t = await storage.getAllGlobalTransactions();
      const tasksData = storage.getTasks();
      const seoData = await storage.getSEOConfig();
      
      setUsers(uniqueUsers);
      setTransactions(t.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setTasks(tasksData);
      setSeo(seoData);
    } catch (error) {
      console.error("Failed to sync system data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCoinsInCirculation = users.reduce((acc, u) => acc + (u.coins || 0), 0);
  const totalDepositBalance = users.reduce((acc, u) => acc + (u.depositBalance || 0), 0);
  const pendingAudits = transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length;

  const handleAuditSubmission = async (tx: Transaction, status: 'success' | 'failed') => {
    try {
      await storage.updateGlobalTransaction(tx.id, { status });
      if (status === 'success') {
        const targetUser = users.find(u => u.id === tx.userId);
        if (targetUser) {
          const newCoins = (targetUser.coins || 0) + tx.amount;
          await storage.updateUserInCloud(tx.userId, { coins: newCoins });
          alert(`Submission Approved. ${tx.amount} coins credited.`);
        }
      }
      await fetchData();
    } catch (err) {
      console.error("Audit update failed", err);
    }
  };

  const handleUserStatus = async (userId: string, status: 'active' | 'banned') => {
    await storage.updateUserInCloud(userId, { status });
    await fetchData();
    alert(`User node ${status === 'active' ? 'activated' : 'decommissioned'}.`);
  };

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeo(true);
    try {
      await storage.setSEOConfig(seo);
      alert('SEO Configuration synchronized globally.');
    } catch (err) {
      alert('Failed to update SEO.');
    } finally {
      setSavingSeo(false);
    }
  };

  const handleTaskAction = async (taskId: string, status: 'active' | 'rejected') => {
    await storage.updateTaskInCloud(taskId, { status });
    await fetchData();
    alert(`Task status updated to ${status}`);
  };

  const handleAdminCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title || !newTaskData.description || !newTaskData.link) {
      return alert('All fields are required for deployment.');
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
      const updatedTasks = [...currentTasks, newTask];
      storage.setTasks(updatedTasks);
      
      alert('System Task deployed successfully!');
      setNewTaskData({
        title: '',
        link: '',
        type: 'YouTube',
        reward: 10,
        totalWorkers: 100,
        description: ''
      });
      setView('tasks');
      await fetchData();
    } catch (error) {
      alert('Failed to deploy system task.');
    } finally {
      setIsDeploying(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black uppercase tracking-[0.3em] text-slate-400">Syncing Admin Hub...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-medium">
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-500/20">
                <i className="fa-solid fa-user-shield"></i>
             </div>
             <div>
                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Command <span className="text-indigo-400">Center</span></h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-3">Active Session: Admin Root</p>
             </div>
          </div>

          <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/10 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
              { id: 'users', label: 'Users', icon: 'fa-users' },
              { id: 'reviews', label: 'Reviews', icon: 'fa-camera-retro' },
              { id: 'create-task', label: 'New Task', icon: 'fa-plus' },
              { id: 'tasks', label: 'Audit', icon: 'fa-list-check' },
              { id: 'finance', label: 'Finance', icon: 'fa-wallet' },
              { id: 'seo', label: 'SEO', icon: 'fa-search' },
              { id: 'history', label: 'Logs', icon: 'fa-clock' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id as any)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${view === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {view === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-in fade-in duration-700">
             {[
               { label: 'Active Network Nodes', val: users.length, color: 'bg-indigo-600' },
               { label: 'Verification Queue', val: pendingAudits, color: 'bg-rose-600' },
               { label: 'Campaign Escrow', val: totalDepositBalance.toLocaleString(), color: 'bg-emerald-600' },
               { label: 'Total Supply', val: totalCoinsInCirculation.toLocaleString(), color: 'bg-amber-600' }
             ].map((s, i) => (
               <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{s.label}</p>
                 <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{s.val}</h4>
               </div>
             ))}
           </div>
        )}

        {view === 'users' && (
           <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Network Directory</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Manage authorized operator nodes</p>
                 </div>
                 <div className="relative w-full md:w-96">
                    <i className="fa-solid fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Search by ID or Email..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <tr>
                          <th className="px-10 py-6">Operator</th>
                          <th className="px-6 py-6">ID Node</th>
                          <th className="px-6 py-6">Vault (Main)</th>
                          <th className="px-6 py-6">Escrow (Dep)</th>
                          <th className="px-6 py-6">Status</th>
                          <th className="px-10 py-6 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredUsers.map(u => (
                         <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6">
                               <div className="font-black text-slate-900">{u.username}</div>
                               <div className="text-[10px] text-slate-400 lowercase">{u.email}</div>
                            </td>
                            <td className="px-6 py-6 font-mono text-xs text-indigo-600">{u.id}</td>
                            <td className="px-6 py-6 font-black text-slate-900">{u.coins.toLocaleString()}</td>
                            <td className="px-6 py-6 font-black text-slate-500">{u.depositBalance.toLocaleString()}</td>
                            <td className="px-6 py-6">
                               <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${u.status === 'banned' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                 {u.status || 'active'}
                               </span>
                            </td>
                            <td className="px-10 py-6 text-right">
                               {u.status === 'banned' ? (
                                 <button onClick={() => handleUserStatus(u.id, 'active')} className="text-emerald-500 hover:text-emerald-700 transition-colors text-xs font-black uppercase tracking-widest">Restore</button>
                               ) : (
                                 <button onClick={() => handleUserStatus(u.id, 'banned')} className="text-rose-500 hover:text-rose-700 transition-colors text-xs font-black uppercase tracking-widest">Suspend</button>
                               )}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {view === 'create-task' && (
          <div className="bg-white rounded-[3.5rem] p-12 md:p-16 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Deploy System Asset</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Initialize verified network tasks</p>
              </div>
              <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                Admin Privilege: 0 Cost
              </div>
            </div>

            <form onSubmit={handleAdminCreateTask} className="space-y-10 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Task Name (Visible to Users)</label>
                  <input 
                    type="text" 
                    value={newTaskData.title}
                    onChange={e => setNewTaskData({...newTaskData, title: e.target.value})}
                    placeholder="e.g. Subscribe to Spredia TV" 
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner focus:ring-2 focus:ring-indigo-100" 
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Destination Link</label>
                  <input 
                    type="url" 
                    value={newTaskData.link}
                    onChange={e => setNewTaskData({...newTaskData, link: e.target.value})}
                    placeholder="https://youtube.com/..." 
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner focus:ring-2 focus:ring-indigo-100" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Task Modality</label>
                  <select 
                    value={newTaskData.type}
                    onChange={e => setNewTaskData({...newTaskData, type: e.target.value as TaskType})}
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner focus:ring-2 focus:ring-indigo-100 appearance-none"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Websites">Websites</option>
                    <option value="Apps">Apps</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Reward (Coins)</label>
                  <input 
                    type="number" 
                    value={newTaskData.reward}
                    onChange={e => setNewTaskData({...newTaskData, reward: parseInt(e.target.value) || 0})}
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner focus:ring-2 focus:ring-indigo-100" 
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Slot Quota (Workers)</label>
                  <input 
                    type="number" 
                    value={newTaskData.totalWorkers}
                    onChange={e => setNewTaskData({...newTaskData, totalWorkers: parseInt(e.target.value) || 0})}
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner focus:ring-2 focus:ring-indigo-100" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Operator Instructions</label>
                <textarea 
                  rows={4} 
                  value={newTaskData.description}
                  onChange={e => setNewTaskData({...newTaskData, description: e.target.value})}
                  placeholder="Explicit steps for the user..." 
                  className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-800 outline-none shadow-inner focus:ring-2 focus:ring-indigo-100 resize-none leading-relaxed" 
                  required
                />
              </div>

              <div className="flex justify-end gap-6 pt-6">
                 <div className="flex items-center gap-6 px-10 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-right">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Escrow</p>
                       <p className="text-sm font-black text-slate-900">{(newTaskData.reward * newTaskData.totalWorkers).toLocaleString()} Coins</p>
                    </div>
                    <i className="fa-solid fa-calculator text-slate-200"></i>
                 </div>
                 <button 
                  type="submit" 
                  disabled={isDeploying}
                  className="px-16 py-6 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center gap-4 shadow-xl active:scale-95 disabled:opacity-50"
                 >
                   {isDeploying ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                   Propagate Task
                 </button>
              </div>
            </form>
          </div>
        )}

        {view === 'finance' && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Pending Withdrawals</p>
                    <h3 className="text-5xl font-black tabular-nums">
                       {transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending').length}
                    </h3>
                 </div>
                 <div className="bg-white p-10 rounded-[3rem] border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Deposit Tickets</p>
                    <h3 className="text-5xl font-black tabular-nums">
                       {transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').length}
                    </h3>
                 </div>
              </div>

              <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-10 border-b border-slate-50">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Financial Queue</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Audit all liquidity requests</p>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <tr>
                             <th className="px-10 py-6">Transaction</th>
                             <th className="px-6 py-6">Method</th>
                             <th className="px-6 py-6">Ref/Account</th>
                             <th className="px-6 py-6">Amount</th>
                             <th className="px-10 py-6 text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {transactions.filter(tx => tx.type === 'deposit' || tx.type === 'withdraw').map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-10 py-6">
                                  <div className="font-black text-slate-900 uppercase tracking-tighter text-xs">{tx.type}</div>
                                  <div className="text-[9px] text-slate-400 uppercase font-black">{tx.date}</div>
                               </td>
                               <td className="px-6 py-6 text-xs font-bold text-slate-600">{tx.method}</td>
                               <td className="px-6 py-6 font-mono text-xs text-indigo-600 max-w-[150px] truncate">{tx.account || 'N/A'}</td>
                               <td className={`px-6 py-6 font-black ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {tx.amount.toLocaleString()}
                               </td>
                               <td className="px-10 py-6 text-right">
                                  {tx.status === 'pending' ? (
                                    <div className="flex justify-end gap-3">
                                       <button onClick={() => handleAuditSubmission(tx, 'success')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">Pay</button>
                                       <button onClick={() => handleAuditSubmission(tx, 'failed')} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[8px] font-black uppercase tracking-widest border border-rose-100">Reject</button>
                                    </div>
                                  ) : (
                                    <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                       {tx.status}
                                    </span>
                                  )}
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {view === 'history' && (
           <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-50">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Global Ledger</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Every network movement recorded</p>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <tr>
                          <th className="px-10 py-6">Event ID</th>
                          <th className="px-6 py-6">Operator</th>
                          <th className="px-6 py-6">Type</th>
                          <th className="px-6 py-6">Delta</th>
                          <th className="px-10 py-6 text-right">Timestamp</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {transactions.map(tx => (
                         <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6 font-mono text-[10px] text-slate-400">{tx.id}</td>
                            <td className="px-6 py-6 font-black text-slate-900 text-xs">{tx.username || 'Ghost Node'}</td>
                            <td className="px-6 py-6">
                               <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black uppercase tracking-widest text-slate-500">
                                  {tx.type.replace('_', ' ')}
                               </span>
                            </td>
                            <td className={`px-6 py-6 font-black text-xs ${tx.type === 'withdraw' || tx.type === 'spend' ? 'text-rose-600' : 'text-emerald-600'}`}>
                               {tx.type === 'withdraw' || tx.type === 'spend' ? '-' : '+'}{tx.amount.toLocaleString()}
                            </td>
                            <td className="px-10 py-6 text-right text-[10px] font-bold text-slate-400">{tx.date}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {view === 'seo' && (
           <div className="bg-white rounded-[3.5rem] p-12 md:p-16 border border-slate-200 shadow-sm animate-in fade-in duration-500">
              <div className="mb-12">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Search Engine Optimization</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Manage global site metadata and discoverability</p>
              </div>
              
              <form onSubmit={handleSaveSEO} className="space-y-10 max-w-4xl">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Global Site Title</label>
                    <input 
                      type="text" 
                      value={seo.siteTitle} 
                      onChange={e => setSeo({...seo, siteTitle: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Meta Description</label>
                    <textarea 
                      rows={3}
                      value={seo.metaDescription} 
                      onChange={e => setSeo({...seo, metaDescription: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner resize-none" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Keywords (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={seo.keywords} 
                      onChange={e => setSeo({...seo, keywords: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <button 
                  type="submit" 
                  disabled={savingSeo}
                  className="px-12 py-6 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-4 disabled:opacity-50"
                 >
                   {savingSeo ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                   Synchronize Meta Config
                 </button>
              </form>
           </div>
        )}

        {view === 'reviews' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-4">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Visual Verification Desk</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Audit user task snapshots for authenticity</p>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               {transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length === 0 ? (
                 <div className="col-span-full py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 text-center">
                    <i className="fa-solid fa-circle-check text-6xl text-emerald-100 mb-8"></i>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Verification queue is clear.</p>
                 </div>
               ) : (
                 transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').map(tx => (
                   <div key={tx.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all group">
                      <div 
                        onClick={() => tx.proofImage && setSelectedScreenshot(tx.proofImage)} 
                        className="w-full md:w-56 h-72 bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden cursor-zoom-in relative"
                      >
                         {tx.proofImage ? (
                           <img src={tx.proofImage} alt="Task Proof" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                             <i className="fa-solid fa-image-slash text-4xl mb-4"></i>
                             <span className="text-[8px] font-black uppercase">Broken Asset</span>
                           </div>
                         )}
                         <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <i className="fa-solid fa-expand text-white text-3xl"></i>
                         </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                         <div className="space-y-6">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{tx.username}</h4>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SUBMITTED: {tx.date}</p>
                               </div>
                               <div className="text-right">
                                  <div className="text-3xl font-black text-indigo-600 tabular-nums">{tx.amount}</div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Potential Credit</p>
                               </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Proof Metadata:</span>
                               <p className="text-sm font-bold text-slate-700">{tx.method || 'General Task Evidence'}</p>
                            </div>
                         </div>
                         <div className="flex gap-4 mt-8">
                            <button 
                              onClick={() => handleAuditSubmission(tx, 'success')} 
                              className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-100 transition-all"
                            >
                              Verify & Pay
                            </button>
                            <button 
                              onClick={() => handleAuditSubmission(tx, 'failed')} 
                              className="flex-1 py-5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white border border-rose-100 transition-all"
                            >
                              Deny
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
                 <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Operational Task Audit</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tasks.map(t => (
                  <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${t.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{t.status}</span>
                        <div className="text-right">
                           <div className="text-2xl font-black text-slate-900">{t.reward}</div>
                           <p className="text-[8px] font-black text-slate-400 uppercase">Per Unit</p>
                        </div>
                     </div>
                     <h4 className="text-lg font-black text-slate-900 mb-2">{t.title}</h4>
                     <p className="text-xs text-slate-500 mb-6 line-clamp-2">{t.description}</p>
                     <div className="flex gap-3">
                        <button onClick={() => handleTaskAction(t.id, 'active')} className="flex-1 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-indigo-500 transition-all">Approve</button>
                        <button onClick={() => handleTaskAction(t.id, 'rejected')} className="flex-1 py-3 bg-rose-50 text-rose-600 text-[9px] font-black uppercase rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        )}
      </div>

      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-[2000] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setSelectedScreenshot(null)}
        >
           <div className="relative max-w-6xl max-h-[90vh]">
              <img src={selectedScreenshot} alt="Full Resolution Proof" className="w-full h-full object-contain rounded-3xl border border-white/10 shadow-3xl" />
              <button 
                onClick={() => setSelectedScreenshot(null)} 
                className="absolute -top-12 right-0 text-white text-4xl hover:text-indigo-400 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
