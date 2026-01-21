
import React, { useState, useEffect } from 'react';
import { User, Task, Transaction, TaskType } from '../types';
import { storage } from '../services/storage';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<'overview' | 'users' | 'history' | 'tasks' | 'finance'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

  // Task Creation State
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    link: '',
    type: 'YouTube' as TaskType,
    reward: 10,
    totalWorkers: 100,
    status: 'active' as const
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const u = await storage.getAllUsers();
      const t = await storage.getAllGlobalTransactions();
      const tasksData = storage.getTasks();
      setUsers(u);
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
  const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title || !newTaskData.link || !newTaskData.description) {
      alert('Missing critical deployment parameters.');
      return;
    }

    const task: Task = {
      id: 'GT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      ...newTaskData,
      creatorId: 'ADMIN-CORE',
      completedCount: 0,
    };

    const updatedTasks = [task, ...tasks];
    storage.setTasks(updatedTasks);
    setTasks(updatedTasks);
    setIsCreatingTask(false);
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

  const handleUpdateTaskStatus = (taskId: string, status: 'active' | 'rejected') => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    storage.setTasks(updatedTasks);
    setTasks(updatedTasks);
    alert(`Campaign ${taskId} status updated to ${status.toUpperCase()}.`);
  };

  const handleApplyAdjustment = async () => {
    if (!adjustingUser) return;
    const amount = parseInt(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive unit count.');
      return;
    }

    const finalAdjustment = adjustmentType === 'add' ? amount : -amount;
    const newCoins = Math.max(0, adjustingUser.coins + finalAdjustment);

    await storage.updateUserInCloud(adjustingUser.id, { coins: newCoins });
    
    const adminTx: Transaction = {
      id: 'ADJ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: adjustingUser.id,
      username: adjustingUser.username,
      amount: amount,
      type: adjustmentType === 'add' ? 'earn' : 'spend',
      status: 'success',
      method: 'Admin Correction',
      date: new Date().toLocaleString()
    };
    await storage.addTransaction(adminTx);
    
    setAdjustingUser(null);
    setAdjustmentAmount('');
    fetchData();
    alert(`Vault balance for ${adjustingUser.username} synchronized.`);
  };

  const handleTransactionStatus = async (tx: Transaction, status: 'success' | 'failed') => {
    try {
      await storage.updateGlobalTransaction(tx.id, { status });
      const targetUser = users.find(u => u.id === tx.userId);
      
      if (tx.type === 'deposit' && status === 'success') {
        if (targetUser) {
          const currentDep = targetUser.depositBalance || 0;
          await storage.updateUserInCloud(tx.userId, { depositBalance: currentDep + tx.amount });
          alert(`Approved: ${tx.amount} coins added to ${targetUser.username}'s Ad Vault.`);
        }
      } else if (tx.type === 'withdraw' && status === 'failed') {
        if (targetUser) {
          await storage.updateUserInCloud(tx.userId, { coins: (targetUser.coins || 0) + tx.amount });
          alert(`Rejected: ${tx.amount} coins refunded to ${targetUser.username}'s vault.`);
        }
      } else {
        alert(`Transaction updated to ${status}.`);
      }
      
      await fetchData();
    } catch (err) {
      console.error("Failed to update transaction status", err);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Permanently delete this campaign?')) {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      storage.setTasks(updatedTasks);
      setTasks(updatedTasks);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-slate-700 animate-pulse">
          <i className="fa-solid fa-user-shield text-5xl text-white"></i>
        </div>
        <p className="font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">AdsPredia Core Syncing</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 pt-32 pb-20 font-medium">
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-12 border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
          <div className="flex items-center gap-8 relative z-10">
             <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-500/20">
                <i className="fa-solid fa-shield-halved"></i>
             </div>
             <div>
                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Command <span className="text-indigo-400">Center</span></h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-3">Verified Administrative Session</p>
             </div>
          </div>

          <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/10 overflow-x-auto no-scrollbar max-w-full backdrop-blur-md">
            {[
              { id: 'overview', label: 'Overview', icon: 'fa-table-columns' },
              { id: 'users', label: 'Directory', icon: 'fa-users-gear' },
              { id: 'tasks', label: 'Campaigns', icon: 'fa-satellite-dish' },
              { id: 'finance', label: 'Payouts', icon: 'fa-money-bill-transfer' },
              { id: 'history', label: 'Ledger', icon: 'fa-file-invoice-dollar' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                <i className={`fa-solid ${tab.icon} ${view === tab.id ? 'opacity-100' : 'opacity-40'}`}></i>
                {tab.label}
              </button>
            ))}
          </div>
          <i className="fa-solid fa-server absolute -right-10 -bottom-10 text-[20rem] text-white/5 pointer-events-none"></i>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {view === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Network Population', val: users.length, sub: 'Verified Nodes', icon: 'fa-users', color: 'bg-indigo-500' },
                  { label: 'Earning Circulation', val: totalCoinsInCirculation.toLocaleString(), sub: 'In Earning Vaults', icon: 'fa-coins', color: 'bg-emerald-500' },
                  { label: 'Global Escrow', val: totalDepositBalance.toLocaleString(), sub: 'Ad Budget Funds', icon: 'fa-vault', color: 'bg-amber-500' },
                  { label: 'Action Required', val: pendingTransactions + pendingTasks, sub: 'Audit Queue items', icon: 'fa-bell', color: 'bg-rose-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                     <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg transition-transform group-hover:rotate-12`}>
                           <i className={`fa-solid ${stat.icon}`}></i>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                     </div>
                     <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.val}</div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">{stat.sub}</p>
                  </div>
                ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Recent Platform Events</h3>
                      <button onClick={() => setView('history')} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">View Ledger</button>
                   </div>
                   <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto no-scrollbar">
                      {transactions.slice(0, 8).map(tx => (
                        <div key={tx.id} className="p-6 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs ${tx.type === 'earn' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                 <i className={`fa-solid ${tx.type === 'earn' ? 'fa-plus' : 'fa-minus'}`}></i>
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 text-sm tracking-tight">{tx.username}</p>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tx.type} • {tx.date}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-black text-slate-900 text-sm">{tx.amount.toLocaleString()}</p>
                              <span className="text-[7px] font-black uppercase text-slate-300 tracking-widest">{tx.status}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                   <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-black tracking-tighter mb-4">Core Financials</h3>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-sm mb-10">Real-time aggregate of all platform assets including user liquidity and campaign escrows.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[8px] font-black text-indigo-400 uppercase mb-2">Total Node Coins</p>
                            <p className="text-2xl font-black">{(totalCoinsInCirculation + totalDepositBalance).toLocaleString()}</p>
                         </div>
                         <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[8px] font-black text-indigo-400 uppercase mb-2">Avg per Node</p>
                            <p className="text-2xl font-black">{users.length ? Math.floor(totalCoinsInCirculation / users.length) : 0}</p>
                         </div>
                      </div>
                   </div>
                   <i className="fa-solid fa-chart-pie absolute -right-10 -bottom-10 text-[15rem] text-white/5 pointer-events-none"></i>
                </div>
             </div>
          </div>
        )}

        {view === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-10">
            <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl">Global Directory</h3>
                  <div className="relative w-full md:w-96">
                    <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Filter by name/email..." 
                      className="w-full bg-white border border-slate-200 pl-14 pr-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-400 shadow-sm"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
               </div>
               <div className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-slate-50/50 transition-colors">
                       <div className="flex items-center gap-6 flex-1">
                          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">{u.username.charAt(0)}</div>
                          <div>
                             <h4 className="font-black text-slate-900 text-xl tracking-tight leading-none mb-2">{u.username}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-12 text-center">
                          <div className="min-w-[100px]">
                             <div className="text-2xl font-black text-slate-900 tabular-nums">{u.coins.toLocaleString()}</div>
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Earned</div>
                          </div>
                          <div className="min-w-[100px]">
                             <div className="text-2xl font-black text-indigo-600 tabular-nums">{u.depositBalance?.toLocaleString() || 0}</div>
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Deposited</div>
                          </div>
                          <button onClick={() => setAdjustingUser(u)} className="px-6 py-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">Balance Adjust</button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'tasks' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-12">
            <div className="bg-indigo-600 p-12 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="font-black text-white uppercase tracking-tighter text-3xl">Asset Management</h3>
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-2">Audit submissions or deploy official network tasks</p>
               </div>
               <button 
                onClick={() => setIsCreatingTask(true)}
                className="px-10 py-6 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-3 relative z-10 shadow-2xl"
               >
                 <i className="fa-solid fa-plus-circle"></i> Deploy Global Campaign
               </button>
               <i className="fa-solid fa-satellite-dish absolute -right-10 -bottom-10 text-9xl text-white/10 rotate-12"></i>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-sm">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Awaiting Operational Approval</h4>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[8px] font-black rounded-lg border border-amber-200 uppercase">{pendingTasks} Pending</span>
               </div>
               <div className="divide-y divide-slate-100">
                  {tasks.filter(t => t.status === 'pending').length === 0 ? (
                    <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Audit queue is currently empty</div>
                  ) : (
                    tasks.filter(t => t.status === 'pending').map(task => (
                      <div key={task.id} className="p-10 flex flex-col lg:flex-row justify-between items-center gap-10 hover:bg-slate-50/50 transition-colors">
                         <div className="flex-1">
                            <h5 className="font-black text-slate-900 text-2xl tracking-tight mb-3">{task.title}</h5>
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                               <span className="px-3 py-1 bg-white text-slate-500 rounded-lg text-[8px] font-black uppercase border border-slate-200">{task.type}</span>
                               <span className="text-[10px] font-black text-indigo-600 uppercase">Unit Reward: {task.reward} Coins</span>
                               <span className="text-[10px] font-black text-slate-400 uppercase italic">Quota: {task.totalWorkers}</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed italic bg-slate-100/50 p-4 rounded-xl border border-dashed border-slate-200">{task.description}</p>
                         </div>
                         <div className="flex items-center gap-4 shrink-0">
                            <button onClick={() => handleUpdateTaskStatus(task.id, 'active')} className="px-8 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-500 shadow-xl shadow-emerald-100 transition-all">Authorize Task</button>
                            <button onClick={() => handleUpdateTaskStatus(task.id, 'rejected')} className="px-8 py-5 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Decline Submission</button>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-sm">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Active Asset Directory</h4>
               </div>
               <div className="divide-y divide-slate-100">
                  {tasks.filter(t => t.status !== 'pending').map(task => (
                    <div key={task.id} className="p-8 flex flex-col lg:flex-row justify-between items-center gap-8 hover:bg-slate-50 transition-all group">
                       <div className="flex-1">
                          <h5 className="font-black text-slate-900 text-lg tracking-tight mb-2 group-hover:text-indigo-600">{task.title}</h5>
                          <div className="flex items-center gap-4">
                             <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${task.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-400 border-red-200'}`}>{task.status}</span>
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">ID: {task.id}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-12 text-center">
                          <div>
                             <div className="text-2xl font-black text-slate-900 tabular-nums">{task.reward}</div>
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reward</div>
                          </div>
                          <div>
                             <div className="text-2xl font-black text-slate-900 tabular-nums">{task.completedCount} / {task.totalWorkers}</div>
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Growth</div>
                          </div>
                          <button onClick={() => handleDeleteTask(task.id)} className="w-12 h-12 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can"></i></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'finance' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-10 border-b border-slate-100 bg-emerald-50/30 flex justify-between items-center">
                     <h3 className="font-black text-emerald-900 uppercase tracking-tighter text-2xl">Deposit Hub</h3>
                     <i className="fa-solid fa-circle-arrow-down text-emerald-500 text-2xl"></i>
                  </div>
                  <div className="divide-y divide-slate-50 flex-grow">
                     {transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').length === 0 ? (
                        <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No pending verification requests</div>
                     ) : (
                        transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').map(tx => (
                          <div key={tx.id} className="p-8 space-y-6 hover:bg-slate-50/50 transition-colors">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="font-black text-slate-900 text-xl tracking-tight leading-none mb-2">{tx.username}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-2xl font-black text-emerald-600">+{tx.amount.toLocaleString()}</p>
                                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{tx.method}</p>
                                </div>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 text-[10px] font-mono break-all text-slate-600 shadow-inner">
                                <span className="text-slate-400 mr-2">REFERENCE:</span> {tx.account || 'NOT PROVIDED'}
                             </div>
                             <div className="flex gap-4">
                                <button onClick={() => handleTransactionStatus(tx, 'success')} className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-500 shadow-xl shadow-emerald-100 transition-all">Authorize Deposit</button>
                                <button onClick={() => handleTransactionStatus(tx, 'failed')} className="flex-1 py-5 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Decline</button>
                             </div>
                          </div>
                        ))
                     )}
                  </div>
               </div>

               <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-10 border-b border-slate-100 bg-indigo-50/30 flex justify-between items-center">
                     <h3 className="font-black text-indigo-900 uppercase tracking-tighter text-2xl">Payout Portal</h3>
                     <i className="fa-solid fa-circle-arrow-up text-indigo-500 text-2xl"></i>
                  </div>
                  <div className="divide-y divide-slate-50 flex-grow">
                     {transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending').length === 0 ? (
                        <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No pending withdrawal requests</div>
                     ) : (
                        transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending').map(tx => (
                          <div key={tx.id} className="p-8 space-y-6 hover:bg-slate-50/50 transition-colors">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="font-black text-slate-900 text-xl tracking-tight leading-none mb-2">{tx.username}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-2xl font-black text-slate-900">-{tx.amount.toLocaleString()}</p>
                                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{tx.method}</p>
                                </div>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 text-[10px] font-mono break-all text-slate-600 shadow-inner">
                                <span className="text-slate-400 mr-2">DESTINATION:</span> {tx.account || 'NOT PROVIDED'}
                             </div>
                             <div className="flex gap-4">
                                <button onClick={() => handleTransactionStatus(tx, 'success')} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all">Finalize Payout</button>
                                <button onClick={() => handleTransactionStatus(tx, 'failed')} className="flex-1 py-5 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Reject</button>
                             </div>
                          </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                   <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl">Global Ledger</h3>
                   <div className="flex gap-4">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-lg border border-emerald-100 uppercase">Audit Clean</span>
                   </div>
                </div>
                <div className="divide-y divide-slate-100">
                   {transactions.map(tx => (
                     <div key={tx.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl border transition-all group-hover:rotate-6 ${tx.type === 'earn' || tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                             <i className={`fa-solid ${tx.type === 'deposit' || tx.type === 'earn' ? 'fa-arrow-up-right-dots' : 'fa-arrow-down-left-and-arrow-up-right-dots'}`}></i>
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">{tx.type.toUpperCase()}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.username} • {tx.date}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`text-2xl font-black tabular-nums ${tx.type === 'earn' || tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                             {tx.type === 'earn' || tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                           </p>
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">{tx.status.toUpperCase()}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>

      {adjustingUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Vault Override</h3>
                <button onClick={() => setAdjustingUser(null)} className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="space-y-10">
                 <div className="flex bg-slate-50 p-2 rounded-[2rem] border border-slate-100 shadow-inner">
                    <button onClick={() => setAdjustmentType('add')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase transition-all ${adjustmentType === 'add' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Authorize Injection</button>
                    <button onClick={() => setAdjustmentType('subtract')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase transition-all ${adjustmentType === 'subtract' ? 'bg-white text-red-600 shadow-xl' : 'text-slate-400'}`}>Execute Penalty</button>
                 </div>
                 <div className="relative">
                    <input type="number" value={adjustmentAmount} onChange={(e) => setAdjustmentAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border-none px-10 py-10 rounded-[2.5rem] font-black text-5xl text-center outline-none shadow-inner text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all" />
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Unit Count Synchronization</span>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setAdjustingUser(null)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                    <button onClick={handleApplyAdjustment} className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">Synchronize Vault</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {isCreatingTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
           <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-[4rem]">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Global Network Deployment</h3>
                 <button onClick={() => setIsCreatingTask(false)} className="w-12 h-12 bg-white rounded-2xl text-slate-300 hover:text-slate-900 shadow-sm transition-colors flex items-center justify-center"><i className="fa-solid fa-xmark text-2xl"></i></button>
              </div>
              <form onSubmit={handleCreateCampaign} className="p-12 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Campaign Designation</label>
                    <input required type="text" value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} className="w-full bg-slate-50 border-none px-8 py-6 rounded-2xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner" placeholder="E.g. Official Network Survey Alpha" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Resource endpoint (URL)</label>
                       <input required type="url" value={newTaskData.link} onChange={e => setNewTaskData({...newTaskData, link: e.target.value})} className="w-full bg-slate-50 border-none px-8 py-6 rounded-2xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner" placeholder="https://..." />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Unit Bounty (Coins)</label>
                       <input required type="number" value={newTaskData.reward} onChange={e => setNewTaskData({...newTaskData, reward: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none px-8 py-6 rounded-2xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Operational Protocol (Instructions)</label>
                    <textarea required rows={4} value={newTaskData.description} onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} className="w-full bg-slate-50 border-none px-8 py-8 rounded-[2rem] font-black text-slate-800 outline-none resize-none leading-relaxed shadow-inner focus:ring-4 focus:ring-indigo-100 transition-all" placeholder="Enter explicit step-by-step instructions for verification..."></textarea>
                 </div>
                 <button type="submit" className="w-full py-8 bg-slate-900 text-white font-black rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 transform active:scale-[0.98]">Deploy Official Network Task</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
