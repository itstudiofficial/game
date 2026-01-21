
import React, { useState, useEffect } from 'react';
import { User, Task, Transaction, TaskType } from '../types';
import { storage } from '../services/storage';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<'overview' | 'users' | 'history' | 'tasks' | 'finance' | 'reviews'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

  const MASTER_ADMIN_EMAIL = 'ehtesham@gmail.com';

  const fetchData = async () => {
    setLoading(true);
    try {
      const u = await storage.getAllUsers();
      // Deduplicate users by ID to ensure only one instance of the admin/user shows up
      const uniqueUsers = Array.from(new Map(u.map(user => [user.id, user])).values());
      
      const t = await storage.getAllGlobalTransactions();
      const tasksData = storage.getTasks();
      
      setUsers(uniqueUsers);
      setTransactions(t.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setTasks(tasksData);
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

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: 'GT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      ...newTaskData,
      creatorId: 'ADMIN-CORE',
      completedCount: 0,
      status: 'active',
      reward: newTaskData.reward,
      title: newTaskData.title,
      type: newTaskData.type,
      description: newTaskData.description,
      totalWorkers: newTaskData.totalWorkers
    };
    const updatedTasks = [task, ...tasks];
    storage.setTasks(updatedTasks);
    setTasks(updatedTasks);
    setNewTaskData({
      title: '',
      description: '',
      link: '',
      type: 'YouTube',
      reward: 10,
      totalWorkers: 100,
      status: 'active'
    });
    alert('Global Campaign deployed successfully.');
  };

  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    link: '',
    type: 'YouTube' as TaskType,
    reward: 10,
    totalWorkers: 100,
    status: 'active' as const
  });

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Permanently remove this campaign?')) {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      storage.setTasks(updatedTasks);
      setTasks(updatedTasks);
    }
  };

  const handleAuditSubmission = async (tx: Transaction, status: 'success' | 'failed') => {
    try {
      await storage.updateGlobalTransaction(tx.id, { status });
      if (status === 'success') {
        const targetUser = users.find(u => u.id === tx.userId);
        if (targetUser) {
          const newCoins = (targetUser.coins || 0) + tx.amount;
          await storage.updateUserInCloud(tx.userId, { coins: newCoins });
          alert(`Submission Approved. ${tx.amount} coins credited to ${targetUser.username}.`);
        }
      } else {
        alert('Submission Rejected. User will not be credited.');
      }
      await fetchData();
    } catch (err) {
      console.error("Audit update failed", err);
    }
  };

  const handleApplyAdjustment = async () => {
    if (!adjustingUser) return;
    const amount = parseInt(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    const finalAdjustment = adjustmentType === 'add' ? amount : -amount;
    const newCoins = Math.max(0, (adjustingUser.coins || 0) + finalAdjustment);
    await storage.updateUserInCloud(adjustingUser.id, { coins: newCoins });
    setAdjustingUser(null);
    setAdjustmentAmount('');
    fetchData();
  };

  const toggleUserBan = async (user: User) => {
    if (user.email.toLowerCase() === MASTER_ADMIN_EMAIL) {
      alert("Unauthorized: The Master Admin account cannot be restricted.");
      return;
    }
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    if (window.confirm(`Are you sure you want to ${newStatus === 'banned' ? 'BAN' : 'UNBAN'} ${user.username}?`)) {
      await storage.updateUserInCloud(user.id, { status: newStatus });
      fetchData();
    }
  };

  const handleTransactionStatus = async (tx: Transaction, status: 'success' | 'failed') => {
    await storage.updateGlobalTransaction(tx.id, { status });
    if (tx.type === 'deposit' && status === 'success') {
      const targetUser = users.find(u => u.id === tx.userId);
      if (targetUser) {
        await storage.updateUserInCloud(tx.userId, { depositBalance: (targetUser.depositBalance || 0) + tx.amount });
      }
    }
    await fetchData();
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
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
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-3">Administrative Control Layer</p>
             </div>
          </div>

          <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/10 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
              { id: 'users', label: 'Users', icon: 'fa-users' },
              { id: 'reviews', label: 'Review Submissions', icon: 'fa-camera-retro' },
              { id: 'tasks', label: 'Manage Tasks', icon: 'fa-list-check' },
              { id: 'finance', label: 'Finance Hub', icon: 'fa-wallet' },
              { id: 'history', label: 'History', icon: 'fa-clock' }
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
               { label: 'Active Users', val: users.length, color: 'bg-indigo-600' },
               { label: 'Pending Audits', val: pendingAudits, color: 'bg-rose-600' },
               { label: 'Escrow Vault', val: totalDepositBalance.toLocaleString(), color: 'bg-emerald-600' },
               { label: 'Earning Supply', val: totalCoinsInCirculation.toLocaleString(), color: 'bg-amber-600' }
             ].map((s, i) => (
               <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{s.label}</p>
                 <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{s.val}</h4>
               </div>
             ))}
           </div>
        )}

        {view === 'reviews' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-4">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Review Submission Hub</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Audit user-submitted proof of work</p>
               </div>
               <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                 {pendingAudits} Pending Verifications
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               {transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length === 0 ? (
                 <div className="col-span-full py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 text-center">
                    <i className="fa-solid fa-circle-check text-6xl text-emerald-100 mb-8"></i>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">All proof queues are currently clear</p>
                 </div>
               ) : (
                 transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').map(tx => (
                   <div key={tx.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all">
                      <div 
                        onClick={() => setSelectedScreenshot('https://placehold.co/800x1200/slate/white?text=User+Proof+Snapshot')} 
                        className="w-full md:w-56 h-72 bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden cursor-zoom-in relative group"
                      >
                         <img src="https://placehold.co/800x1200/slate/white?text=View+Screenshot" alt="Proof" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <i className="fa-solid fa-expand text-white text-3xl"></i>
                         </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-6">
                               <div>
                                  <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{tx.username}</h4>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</p>
                               </div>
                               <div className="text-right">
                                  <div className="text-3xl font-black text-indigo-600 tabular-nums">{tx.amount}</div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Coin Reward</p>
                               </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Method Description:</span>
                               <p className="text-sm font-bold text-slate-700">{tx.method || 'General Task Execution'}</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <button 
                              onClick={() => handleAuditSubmission(tx, 'success')} 
                              className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                            >
                              Approve & Credit
                            </button>
                            <button 
                              onClick={() => handleAuditSubmission(tx, 'failed')} 
                              className="flex-1 py-5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white border border-rose-100 active:scale-95 transition-all"
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

        {view === 'users' && (
           <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
             <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Authorized Network Directory</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Unique user entities detected: {users.length}</p>
                </div>
                <input type="text" placeholder="Search by name/email..." className="w-full md:w-96 bg-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-slate-200 focus:border-indigo-400 shadow-sm" onChange={e => setSearchQuery(e.target.value)} />
             </div>
             <div className="divide-y divide-slate-100">
               {filteredUsers.length === 0 ? (
                 <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">No matching entities found</div>
               ) : (
                 filteredUsers.map(u => {
                   const isMasterAdmin = u.email.toLowerCase() === MASTER_ADMIN_EMAIL;
                   return (
                     <div key={u.id} className={`p-8 flex flex-col md:flex-row items-center justify-between hover:bg-slate-50/50 transition-all group gap-6 ${isMasterAdmin ? 'bg-indigo-50/30' : ''}`}>
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg ${isMasterAdmin ? 'bg-indigo-600' : u.status === 'banned' ? 'bg-rose-500' : 'bg-slate-900'}`}>
                             {u.username.charAt(0)}
                           </div>
                           <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="font-black text-slate-900 text-lg tracking-tight">{u.username}</p>
                                {isMasterAdmin ? (
                                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded shadow-sm">Root Authority</span>
                                ) : u.status === 'banned' ? (
                                  <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black uppercase rounded border border-rose-200">Suspended</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase rounded border border-emerald-200">Active Node</span>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6 md:gap-10 ml-auto md:ml-0">
                           <div className="text-right">
                              <p className="text-xl font-black text-slate-900 tabular-nums">{u.coins.toLocaleString()}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unit Balance</p>
                           </div>
                           {!isMasterAdmin && (
                             <div className="flex gap-3">
                                <button onClick={() => setAdjustingUser(u)} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg">Adjust Balance</button>
                                <button onClick={() => toggleUserBan(u)} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${u.status === 'banned' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100'}`}>
                                  {u.status === 'banned' ? 'Restore Access' : 'Restrict'}
                                </button>
                             </div>
                           )}
                        </div>
                     </div>
                   );
                 })
               )}
             </div>
           </div>
        )}

        {view === 'finance' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="px-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Financial Operations Hub</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Manage incoming liquidity and payout fulfillment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Deposit Section */}
              <div className="bg-white rounded-[4rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-10 border-b border-slate-100 bg-emerald-50/30 flex justify-between items-center">
                  <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Secure Deposit Queue</h3>
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                    <i className="fa-solid fa-arrow-down-long"></i>
                  </div>
                </div>
                <div className="divide-y divide-slate-50 min-h-[400px]">
                  {transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').length === 0 ? (
                    <div className="py-24 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">No pending deposits</div>
                  ) : (
                    transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').map(tx => (
                      <div key={tx.id} className="p-8 space-y-6 hover:bg-emerald-50/10 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-2">{tx.username}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-emerald-600 tabular-nums">+{tx.amount.toLocaleString()}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Coins Requested</p>
                          </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[1.75rem] border border-slate-100 font-mono">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Verification Ref:</p>
                          <div className="text-xs font-bold text-slate-700 break-all">{tx.method}: {tx.account || 'NO_REF'}</div>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={() => handleTransactionStatus(tx, 'success')} className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-100 transition-all active:scale-95">Approve & Credit</button>
                          <button onClick={() => handleTransactionStatus(tx, 'failed')} className="flex-1 py-5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95">Deny</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Withdrawal Section */}
              <div className="bg-white rounded-[4rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-10 border-b border-slate-100 bg-indigo-50/30 flex justify-between items-center">
                  <h3 className="text-xl font-black text-indigo-900 uppercase tracking-tighter">Payout Fulfillment Queue</h3>
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                    <i className="fa-solid fa-arrow-up-long"></i>
                  </div>
                </div>
                <div className="divide-y divide-slate-50 min-h-[400px]">
                  {transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending').length === 0 ? (
                    <div className="py-24 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">No pending payouts</div>
                  ) : (
                    transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending').map(tx => (
                      <div key={tx.id} className="p-8 space-y-6 hover:bg-indigo-50/10 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-2">{tx.username}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-slate-900 tabular-nums">-{tx.amount.toLocaleString()}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Coins Claimed</p>
                          </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[1.75rem] border border-slate-100 font-mono">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Recipient Channel:</p>
                          <div className="text-xs font-bold text-slate-700 break-all">Method: {tx.method} <br/> Target: {tx.account}</div>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={() => handleTransactionStatus(tx, 'success')} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95">Confirm Payment</button>
                          <button onClick={() => handleTransactionStatus(tx, 'failed')} className="flex-1 py-5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95">Cancel</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'tasks' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-10">Deploy New Market Task</h3>
              <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Task Title</label>
                  <input required type="text" value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} className="w-full bg-slate-50 border-none px-8 py-5 rounded-2xl font-bold text-slate-800 outline-none" placeholder="e.g. Subscribe to channel" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Target Link</label>
                  <input required type="url" value={newTaskData.link} onChange={e => setNewTaskData({...newTaskData, link: e.target.value})} className="w-full bg-slate-50 border-none px-8 py-5 rounded-2xl font-bold text-slate-800 outline-none" placeholder="https://..." />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Task Category</label>
                  <select value={newTaskData.type} onChange={e => setNewTaskData({...newTaskData, type: e.target.value as TaskType})} className="w-full bg-slate-50 border-none px-8 py-5 rounded-2xl font-bold text-slate-800 outline-none appearance-none">
                    <option value="YouTube">YouTube</option>
                    <option value="Websites">Websites</option>
                    <option value="Apps">Apps</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Reward (Coins)</label>
                    <input required type="number" value={newTaskData.reward} onChange={e => setNewTaskData({...newTaskData, reward: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none px-8 py-5 rounded-2xl font-bold text-slate-800 outline-none" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Total Slots</label>
                    <input required type="number" value={newTaskData.totalWorkers} onChange={e => setNewTaskData({...newTaskData, totalWorkers: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none px-8 py-5 rounded-2xl font-bold text-slate-800 outline-none" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Instructions (Screenshot Mandatory)</label>
                  <textarea required rows={4} value={newTaskData.description} onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} className="w-full bg-slate-50 border-none px-8 py-6 rounded-[2rem] font-bold text-slate-800 outline-none resize-none" placeholder="Provide clear steps for the user..."></textarea>
                </div>
                <button type="submit" className="md:col-span-2 py-6 bg-indigo-600 text-white font-black rounded-3xl uppercase text-[10px] tracking-[0.4em] hover:bg-indigo-700 shadow-2xl transition-all">Launch Global Task</button>
              </form>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-10 border-b border-slate-100 bg-slate-50/30">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Active Network Tasks</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">No tasks deployed</div>
                ) : (
                  tasks.map(t => (
                    <div key={t.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black">{t.type.charAt(0)}</div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">{t.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.reward} Coins • {t.completedCount}/{t.totalWorkers} Filled</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteTask(t.id)} className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
           <div className="bg-white rounded-[4rem] border border-slate-200 overflow-hidden animate-in fade-in duration-700">
             <div className="p-10 border-b border-slate-100 bg-slate-50/30">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Global System History</h3>
             </div>
             <div className="divide-y divide-slate-100">
                {transactions.slice(0, 50).map(tx => (
                   <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-6">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${tx.type === 'earn' || tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                           <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                         </div>
                         <div>
                            <p className="font-black text-slate-900 text-sm uppercase">{tx.type} by {tx.username}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className={`text-lg font-black ${tx.type === 'earn' || tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.amount.toLocaleString()}</p>
                         <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{tx.status}</span>
                      </div>
                   </div>
                ))}
             </div>
           </div>
        )}
      </div>

      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setSelectedScreenshot(null)}
        >
           <div className="relative max-w-5xl max-h-[90vh]">
              <img src={selectedScreenshot} alt="Full Proof" className="w-full h-full object-contain rounded-3xl border border-white/10 shadow-3xl" />
              <button 
                onClick={() => setSelectedScreenshot(null)} 
                className="absolute -top-12 right-0 text-white text-3xl hover:text-indigo-400 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
           </div>
        </div>
      )}

      {adjustingUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-slate-900 uppercase">Override Vault</h3>
                 <button onClick={() => setAdjustingUser(null)} className="text-slate-300 hover:text-slate-900"><i className="fa-solid fa-xmark text-2xl"></i></button>
              </div>
              <div className="space-y-10">
                 <div className="flex bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
                    <button onClick={() => setAdjustmentType('add')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${adjustmentType === 'add' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Authorize Add</button>
                    <button onClick={() => setAdjustmentType('subtract')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${adjustmentType === 'subtract' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-400'}`}>Authorize Sub</button>
                 </div>
                 <div className="relative">
                   <input 
                     type="number" 
                     value={adjustmentAmount} 
                     onChange={e => setAdjustmentAmount(e.target.value)} 
                     placeholder="Enter amount..." 
                     className="w-full bg-slate-50 border-none px-10 py-10 rounded-[2.5rem] font-black text-5xl text-center outline-none shadow-inner text-slate-900" 
                   />
                   <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">
                     Current Balance: {adjustingUser.coins.toLocaleString()} Coins
                   </p>
                 </div>
                 <button onClick={handleApplyAdjustment} className="w-full py-8 bg-slate-900 text-white font-black rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95">
                   Execute Override
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
