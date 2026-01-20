
import React, { useState, useEffect } from 'react';
import { User, Task, Transaction, TaskType } from '../types';
import { storage } from '../services/storage';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<'users' | 'transactions' | 'tasks'>('users');
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

  const COIN_RATE = 3000;

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

  const handleCreateGlobalTask = async (e: React.FormEvent) => {
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
    alert('Global campaign injected into the network successfully.');
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

  const handleToggleUserBan = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const isBanned = user.status === 'banned';
    const newStatus = isBanned ? 'active' : 'banned';
    
    if (window.confirm(isBanned ? `Restore access for ${user.username}?` : `Ban user ${user.username} from the network?`)) {
      await storage.updateUserInCloud(userId, { status: newStatus });
      fetchData();
    }
  };

  const handleTransactionStatus = async (tx: Transaction, status: 'success' | 'failed') => {
    await storage.updateGlobalTransaction(tx.id, { status });
    
    if (tx.type === 'deposit' && status === 'success') {
      const user = users.find(u => u.id === tx.userId);
      if (user) {
        await storage.updateUserInCloud(tx.userId, { coins: user.coins + tx.amount });
      }
    }
    if (tx.type === 'withdraw' && status === 'failed') {
      const user = users.find(u => u.id === tx.userId);
      if (user) {
        await storage.updateUserInCloud(tx.userId, { coins: user.coins + tx.amount });
      }
    }
    
    fetchData();
  };

  const handleTaskStatus = (taskId: string, status: 'active' | 'rejected') => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    storage.setTasks(updatedTasks);
    setTasks(updatedTasks);
    alert(`Campaign ${taskId} is now ${status.toUpperCase()}`);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Permanently purge this campaign from the ledger?')) {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      storage.setTasks(updatedTasks);
      setTasks(updatedTasks);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCoins = users.reduce((acc, curr) => acc + curr.coins, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-indigo-200 animate-pulse">
          <i className="fa-solid fa-shield-halved text-5xl text-indigo-600"></i>
        </div>
        <p className="font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Authenticating Admin Protocol</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 pt-32 pb-20 font-medium">
      
      {/* Top Intelligence Header */}
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <div className="bg-white rounded-[3.5rem] p-10 border border-slate-200 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] flex flex-col xl:flex-row justify-between items-center gap-12 relative overflow-hidden">
          <div className="flex items-center gap-10 relative z-10">
             <div className="w-20 h-20 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white text-4xl shadow-2xl transform -rotate-6">
                <i className="fa-solid fa-user-shield"></i>
             </div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Admin <span className="text-indigo-600">Dashboard</span></h1>
                <div className="flex items-center gap-4 mt-2">
                   <span className="flex h-2 w-2 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">System Secure • Oversight Enabled</p>
                </div>
             </div>
          </div>

          <div className="flex bg-slate-100/50 p-2 rounded-[2.5rem] border border-slate-200 backdrop-blur-3xl shadow-inner">
            {[
              { id: 'users', label: 'All Users', icon: 'fa-users-gear' },
              { id: 'transactions', label: 'Income History', icon: 'fa-file-invoice-dollar' },
              { id: 'tasks', label: 'All Campaigns', icon: 'fa-satellite-dish' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id as any)}
                className={`flex items-center gap-4 px-10 py-5 rounded-[1.75rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${view === v.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}
              >
                <i className={`fa-solid ${v.icon} ${view === v.id ? 'opacity-100' : 'opacity-40'}`}></i> 
                {v.label}
              </button>
            ))}
          </div>
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 blur-[100px] rounded-full pointer-events-none opacity-50"></div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {view === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 space-y-12">
            
            {/* KPI Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-500">
                       <i className="fa-solid fa-users"></i>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">Synchronized</div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Total Active Users</p>
                  <div className="text-7xl font-black text-slate-900 tracking-tighter tabular-nums">{users.length}</div>
               </div>

               <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-400 text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                       <i className="fa-solid fa-vault"></i>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Global Vault Balance</p>
                  <div className="text-7xl font-black text-slate-900 tracking-tighter tabular-nums">{totalCoins.toLocaleString()}</div>
                  <div className="text-[10px] font-black text-indigo-400 mt-4 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded w-fit">Network Assets</div>
               </div>

               <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white text-2xl">
                       <i className="fa-solid fa-chart-area"></i>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Active Value</div>
                  </div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Est. Fiat Valuation</p>
                  <div className="text-7xl font-black text-white tracking-tighter tabular-nums">${(totalCoins / COIN_RATE).toFixed(2)}</div>
                  <div className="text-[10px] font-black text-slate-500 mt-4 uppercase tracking-widest">Calculated at 3k : $1</div>
                  <i className="fa-solid fa-sack-dollar absolute -right-10 -bottom-10 text-[12rem] text-white/5 -rotate-12"></i>
               </div>
            </div>

            {/* User Management List */}
            <div className="bg-white rounded-[4rem] border border-slate-200 overflow-hidden shadow-sm">
               <div className="p-14 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-50/50">
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter text-4xl">User Directory</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">Managing global participant accounts</p>
                  </div>
                  <div className="relative w-full md:w-auto">
                    <i className="fa-solid fa-magnifying-glass absolute left-8 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Search Username or Email..." 
                      className="w-full md:w-96 bg-white border-2 border-slate-100 pl-16 pr-8 py-6 rounded-3xl text-sm font-black text-slate-800 outline-none focus:border-indigo-100 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
               </div>
               
               <div className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <div className="p-40 text-center">
                       <i className="fa-solid fa-user-slash text-6xl text-slate-100 mb-8"></i>
                       <p className="text-slate-300 font-black uppercase tracking-[0.4em]">Zero Matching Users</p>
                    </div>
                  ) : (
                    filteredUsers.map(u => (
                      <div key={u.id} className="p-12 flex flex-col xl:flex-row justify-between items-center gap-10 hover:bg-slate-50 transition-all group">
                         <div className="flex items-center gap-10 flex-1 w-full">
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-2xl text-white shadow-xl transition-all duration-500 group-hover:scale-110 ${u.status === 'banned' ? 'bg-red-500' : 'bg-slate-900'}`}>
                              {u.username.charAt(0)}
                            </div>
                            <div className="flex-1">
                               <div className="flex flex-wrap items-center gap-4 mb-2">
                                 <span className="font-black text-slate-900 text-2xl tracking-tighter">{u.username}</span>
                                 {u.isAdmin && <span className="bg-indigo-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase border border-indigo-400 shadow-lg shadow-indigo-100">ADMIN</span>}
                                 {u.status === 'banned' && <span className="bg-red-50 text-red-500 text-[8px] font-black px-3 py-1 rounded-full uppercase border border-red-100">BANNED</span>}
                               </div>
                               <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
                                 <span className="flex items-center gap-2"><i className="fa-solid fa-envelope opacity-30"></i> {u.email}</span>
                                 <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                 <span className="font-mono text-slate-300 text-[10px]"># {u.id}</span>
                               </div>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-16 text-center w-full xl:w-auto border-t xl:border-0 pt-10 xl:pt-0 border-slate-100">
                            <div>
                               <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">{u.coins.toLocaleString()}</div>
                               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Wallet Units</div>
                            </div>
                            <div className="flex gap-4">
                               <button 
                                 onClick={() => setAdjustingUser(u)} 
                                 className="px-10 py-5 bg-indigo-50 text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-3"
                               >
                                 <i className="fa-solid fa-pen-nib text-[10px]"></i>
                                 Adjust
                               </button>
                               <button 
                                 onClick={() => handleToggleUserBan(u.id)} 
                                 className={`px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-3 ${u.status === 'banned' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-red-50 text-red-500 hover:bg-red-600 hover:text-white'}`}
                               >
                                 <i className={`fa-solid ${u.status === 'banned' ? 'fa-unlock' : 'fa-ban'} text-[10px]`}></i>
                                 {u.status === 'banned' ? 'Unban' : 'Ban'}
                               </button>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        )}

        {view === 'transactions' && (
          <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-12">
             <div className="bg-white rounded-[4rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-14 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                   <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tighter text-4xl">Income History</h3>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">Global ledger of all value transfers</p>
                   </div>
                   <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                      <i className="fa-solid fa-receipt text-3xl"></i>
                   </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                   {transactions.length === 0 ? (
                      <div className="p-40 text-center text-slate-300 font-black uppercase tracking-[0.4em]">Zero Records Found</div>
                   ) : (
                     transactions.map(tx => (
                       <div key={tx.id} className="p-12 flex flex-col md:flex-row justify-between items-center gap-10 hover:bg-slate-50 transition-all group">
                          <div className="flex items-center gap-10">
                             <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 shadow-sm transition-transform group-hover:scale-110 ${
                               tx.status === 'pending' ? 'bg-amber-50 text-amber-500 border-amber-100 animate-pulse' : 
                               tx.status === 'success' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                               'bg-red-50 text-red-500 border-red-100'
                             }`}>
                               <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-cloud-arrow-down' : tx.type === 'withdraw' ? 'fa-cloud-arrow-up' : tx.type === 'earn' ? 'fa-hand-holding-dollar' : 'fa-money-bill-transfer'} text-2xl`}></i>
                             </div>
                             <div>
                                <div className="font-black text-slate-900 text-2xl tracking-tight mb-2 flex items-center gap-4">
                                   {tx.type.toUpperCase()}
                                   <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded">#{tx.id.toUpperCase()}</span>
                                </div>
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
                                   <span className="text-indigo-600">{tx.username}</span>
                                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                   <span>{tx.date}</span>
                                </div>
                                {tx.method && <div className="text-[9px] text-indigo-400 mt-4 font-black uppercase bg-indigo-50 w-fit px-3 py-1 rounded-lg border border-indigo-100">{tx.method}</div>}
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-16 w-full md:w-auto border-t md:border-0 pt-10 md:pt-0 border-slate-100">
                             <div className="text-right">
                                <div className={`text-5xl font-black tabular-nums tracking-tighter ${tx.type === 'earn' || tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                  {tx.type === 'earn' || tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                                </div>
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Units</div>
                             </div>
                             
                             <div className="min-w-[160px] flex justify-end">
                               {tx.status === 'pending' ? (
                                 <div className="flex gap-4">
                                    <button 
                                      onClick={() => handleTransactionStatus(tx, 'success')} 
                                      className="w-14 h-14 bg-emerald-500 text-white rounded-[1.25rem] shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center active:scale-90"
                                      title="Approve"
                                    >
                                      <i className="fa-solid fa-check text-xl"></i>
                                    </button>
                                    <button 
                                      onClick={() => handleTransactionStatus(tx, 'failed')} 
                                      className="w-14 h-14 bg-red-500 text-white rounded-[1.25rem] shadow-xl shadow-red-100 hover:bg-red-600 transition-all flex items-center justify-center active:scale-90"
                                      title="Reject"
                                    >
                                      <i className="fa-solid fa-xmark text-xl"></i>
                                    </button>
                                 </div>
                               ) : (
                                 <div className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                   tx.status === 'success' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                                 }`}>
                                   {tx.status}
                                 </div>
                               )}
                             </div>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>
        )}

        {view === 'tasks' && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 space-y-12">
            
            {/* Campaign Control Strip */}
            <div className="bg-slate-900 p-14 rounded-[4rem] border border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-12 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 text-center lg:text-left">
                  <h3 className="font-black text-white uppercase tracking-tighter text-4xl">All Campaigns</h3>
                  <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mt-2">Oversight of global task streams</p>
               </div>
               <button 
                onClick={() => setIsCreatingTask(true)}
                className="px-14 py-8 bg-indigo-600 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/40 flex items-center gap-5 active:scale-95 group relative overflow-hidden"
               >
                 <span className="relative z-10"><i className="fa-solid fa-plus-circle mr-2"></i> Deploy Admin Campaign</span>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
               </button>
            </div>

            {/* Pending Verifications Section */}
            <div className="space-y-8">
              <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] flex items-center gap-4 ml-8">
                <i className="fa-solid fa-clock-rotate-left"></i>
                Pending Admin Authorizations
              </h4>
              <div className="bg-white rounded-[4rem] border-2 border-dashed border-amber-200 overflow-hidden shadow-xl shadow-amber-500/5">
                <div className="divide-y divide-amber-100">
                  {tasks.filter(t => t.status === 'pending').length === 0 ? (
                    <div className="p-32 text-center text-amber-200 font-black uppercase tracking-[0.4em]">Zero Pending Campaigns</div>
                  ) : (
                    tasks.filter(t => t.status === 'pending').map(task => (
                      <div key={task.id} className="p-12 flex flex-col xl:flex-row justify-between items-center gap-12 bg-amber-50/20 hover:bg-amber-50 transition-all">
                        <div className="flex-1 w-full">
                           <div className="flex items-center gap-8 mb-6">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-500 text-2xl border border-amber-100 shadow-sm">
                                 <i className={`fa-solid ${task.type === 'YouTube' ? 'fa-youtube' : 'fa-globe'}`}></i>
                              </div>
                              <div>
                                 <h5 className="font-black text-slate-900 text-2xl tracking-tight mb-1">{task.title}</h5>
                                 <div className="flex items-center gap-4 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                    <span>Client: {task.creatorId.slice(0, 8)}</span>
                                    <span className="w-1 h-1 bg-amber-200 rounded-full"></span>
                                    <span>Stake: {task.reward * task.totalWorkers} Coins</span>
                                 </div>
                              </div>
                           </div>
                           <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-4xl">{task.description}</p>
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => handleTaskStatus(task.id, 'active')} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-900/20 transition-all flex items-center gap-3">
                              <i className="fa-solid fa-check"></i> Approve
                           </button>
                           <button onClick={() => handleTaskStatus(task.id, 'rejected')} className="px-10 py-5 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500 shadow-xl shadow-red-900/20 transition-all flex items-center gap-3">
                              <i className="fa-solid fa-xmark"></i> Reject
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Global Campaign List */}
            <div className="space-y-8">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4 ml-8">
                <i className="fa-solid fa-box-open"></i>
                Authorized Campaign Inventory
              </h4>
              <div className="bg-white rounded-[4rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                    {tasks.filter(t => t.status !== 'pending').map(task => (
                      <div key={task.id} className="p-14 flex flex-col xl:flex-row justify-between items-center gap-14 hover:bg-slate-50 transition-all group">
                         <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-10 mb-8">
                               <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-900 text-4xl border border-slate-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                  <i className={`fa-solid ${task.type === 'YouTube' ? 'fa-youtube' : task.type === 'Websites' ? 'fa-globe' : 'fa-layer-group'}`}></i>
                               </div>
                               <div>
                                  <h4 className="font-black text-slate-900 text-3xl tracking-tight mb-3 transition-colors">{task.title}</h4>
                                  <div className="flex flex-wrap items-center gap-6">
                                    <span className={`px-5 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border shadow-sm ${
                                      task.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                      {task.status}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter bg-slate-100 px-3 py-1 rounded">#{task.id.toUpperCase()}</span>
                                  </div>
                               </div>
                            </div>
                            <p className="text-base text-slate-400 font-bold leading-relaxed max-w-5xl line-clamp-2">{task.description}</p>
                         </div>
                         
                         <div className="flex flex-wrap items-center gap-20 text-center w-full xl:w-auto border-t xl:border-0 pt-10 xl:pt-0 border-slate-100">
                            <div>
                               <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">{task.reward}</div>
                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Unit Reward</div>
                            </div>
                            <div className="min-w-[160px]">
                               <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter mb-4">{task.completedCount} <span className="text-lg opacity-20">/</span> {task.totalWorkers}</div>
                               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                  <div 
                                    className="h-full bg-indigo-600 transition-all duration-1000 shadow-sm" 
                                    style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}
                                  ></div>
                               </div>
                            </div>
                            <button onClick={() => handleDeleteTask(task.id)} className="w-14 h-14 bg-white border border-red-100 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                               <i className="fa-solid fa-trash-can text-sm"></i>
                            </button>
                         </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Node Vault Adjustment */}
      {adjustingUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-xl rounded-[4rem] p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-500 border border-slate-200">
              <div className="text-center mb-12">
                 <div className="w-24 h-24 bg-slate-900 rounded-[2.25rem] flex items-center justify-center text-white text-4xl mx-auto mb-10 shadow-3xl transform -rotate-12">
                    <i className="fa-solid fa-coins"></i>
                 </div>
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Vault Adjustment</h3>
                 <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] mt-3">{adjustingUser.username}</p>
              </div>
              
              <div className="space-y-12">
                 <div className="flex bg-slate-50 p-2 rounded-[2.5rem] border border-slate-200 shadow-inner">
                    <button onClick={() => setAdjustmentType('add')} className={`flex-1 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${adjustmentType === 'add' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>Inject Units</button>
                    <button onClick={() => setAdjustmentType('subtract')} className={`flex-1 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${adjustmentType === 'subtract' ? 'bg-white text-red-600 shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>Subtract</button>
                 </div>
                 
                 <div className="relative">
                   <input 
                     type="number" 
                     value={adjustmentAmount} 
                     onChange={(e) => setAdjustmentAmount(e.target.value)} 
                     placeholder="0000" 
                     className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 px-12 py-10 rounded-[3rem] font-black text-6xl text-slate-900 text-center outline-none transition-all shadow-inner tabular-nums"
                   />
                 </div>

                 <div className="flex gap-6">
                    <button onClick={() => setAdjustingUser(null)} className="flex-1 py-7 bg-slate-100 text-slate-500 font-black rounded-[2rem] uppercase text-[11px] tracking-[0.2em] hover:bg-slate-200 transition-all">Cancel</button>
                    <button onClick={handleApplyAdjustment} className="flex-[2] py-7 bg-slate-900 text-white font-black rounded-[2rem] uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4">
                       <i className="fa-solid fa-sync"></i>
                       Update Account
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Modal: Global Injection Deployment */}
      {isCreatingTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
              <div className="p-14 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-10">
                    <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-xl">
                       <i className="fa-solid fa-satellite-dish"></i>
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Campaign Injection</h3>
                       <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mt-2">Deploying Administrative Campaign</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCreatingTask(false)} className="w-16 h-16 rounded-3xl bg-white border border-slate-100 text-slate-300 flex items-center justify-center hover:text-slate-900 transition-all">
                    <i className="fa-solid fa-xmark text-3xl"></i>
                 </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-16 space-y-16 custom-scrollbar">
                 <form onSubmit={handleCreateGlobalTask} className="space-y-12">
                    <div className="space-y-6">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">Campaign Descriptor</label>
                       <input 
                        required
                        type="text" 
                        value={newTaskData.title}
                        onChange={e => setNewTaskData({...newTaskData, title: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 px-10 py-8 rounded-[2.5rem] font-black text-slate-800 outline-none transition-all shadow-inner text-lg" 
                        placeholder="e.g. Subscribe to Official Network Stream"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-6">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">Target Endpoint</label>
                          <input 
                            required
                            type="url" 
                            value={newTaskData.link}
                            onChange={e => setNewTaskData({...newTaskData, link: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 px-10 py-8 rounded-[2.5rem] font-black text-slate-800 outline-none shadow-inner" 
                            placeholder="https://..."
                          />
                       </div>
                       <div className="space-y-6">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">Campaign Type</label>
                          <select 
                            value={newTaskData.type}
                            onChange={e => setNewTaskData({...newTaskData, type: e.target.value as TaskType})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 px-10 py-8 rounded-[2.5rem] font-black text-slate-800 outline-none appearance-none cursor-pointer shadow-inner"
                          >
                             <option value="YouTube">YouTube System</option>
                             <option value="Websites">Web Traffic Nodes</option>
                             <option value="Apps">App Acquisition</option>
                             <option value="Social Media">Social Reach</option>
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                       <div className="space-y-6">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">Unit Reward</label>
                          <input 
                            required
                            type="number" 
                            value={newTaskData.reward}
                            onChange={e => setNewTaskData({...newTaskData, reward: parseInt(e.target.value)})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 px-10 py-8 rounded-[2.5rem] font-black text-slate-800 outline-none text-center shadow-inner text-3xl"
                          />
                       </div>
                       <div className="space-y-6">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">Slot Allocation</label>
                          <input 
                            required
                            type="number" 
                            value={newTaskData.totalWorkers}
                            onChange={e => setNewTaskData({...newTaskData, totalWorkers: parseInt(e.target.value)})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 px-10 py-8 rounded-[2.5rem] font-black text-slate-800 outline-none text-center shadow-inner text-3xl"
                          />
                       </div>
                       <div className="space-y-6">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">Deployment State</label>
                          <select 
                            value={newTaskData.status}
                            onChange={e => setNewTaskData({...newTaskData, status: e.target.value as any})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 px-10 py-8 rounded-[2.5rem] font-black text-slate-800 outline-none appearance-none cursor-pointer shadow-inner"
                          >
                             <option value="active">IMMEDIATE LIVE</option>
                             <option value="pending">STAGE & STASH</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-10">Operational Protocol</label>
                       <textarea 
                        required
                        rows={6}
                        value={newTaskData.description}
                        onChange={e => setNewTaskData({...newTaskData, description: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 px-12 py-10 rounded-[3rem] font-black text-slate-800 outline-none resize-none leading-relaxed shadow-inner" 
                        placeholder="Provide explicit step-by-step instructions for our global users..."
                       ></textarea>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 pt-12">
                       <button type="button" onClick={() => setIsCreatingTask(false)} className="flex-1 py-8 bg-slate-100 text-slate-500 font-black rounded-3xl uppercase text-[12px] tracking-[0.3em] hover:bg-slate-200 transition-all">Discard Specs</button>
                       <button type="submit" className="flex-[2] py-8 bg-slate-900 text-white font-black rounded-3xl uppercase text-[12px] tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-5">
                          <i className="fa-solid fa-paper-plane"></i>
                          Commit Deployment
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
