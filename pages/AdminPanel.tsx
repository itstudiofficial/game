
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
  
  // State for Balance Adjustment
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

  // State for Admin Task Creation
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'YouTube' as TaskType,
    reward: 10,
    totalWorkers: 100,
    link: '',
    status: 'active' as const
  });

  const fetchData = async () => {
    setLoading(true);
    const u = await storage.getAllUsers();
    const t = await storage.getAllGlobalTransactions();
    const tasksData = storage.getTasks();
    setUsers(u);
    setTransactions(t.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setTasks(tasksData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyAdjustment = async () => {
    if (!adjustingUser) return;
    const amount = parseInt(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    const finalAdjustment = adjustmentType === 'add' ? amount : -amount;
    const newCoins = Math.max(0, adjustingUser.coins + finalAdjustment);

    await storage.updateUserInCloud(adjustingUser.id, { coins: newCoins });
    
    // Log adjustment
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
    alert(`Balance for ${adjustingUser.username} updated successfully.`);
  };

  const handleToggleUserBan = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const isBanned = user.status === 'banned';
    const newStatus = isBanned ? 'active' : 'banned';
    
    const confirmMsg = isBanned 
      ? `RESTORE ACCESS for ${user.username}?` 
      : `BAN ACCOUNT: Are you sure you want to blacklist ${user.username}? They will lose access to all earning features.`;

    if (window.confirm(confirmMsg)) {
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
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this campaign?')) {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      storage.setTasks(updatedTasks);
      setTasks(updatedTasks);
    }
  };

  const handleCreateAdminTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: 'ADM-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      ...newTask,
      creatorId: 'ADMIN',
      completedCount: 0,
    };

    const updatedTasks = [task, ...tasks];
    storage.setTasks(updatedTasks);
    setTasks(updatedTasks);
    setShowCreateForm(false);
    setNewTask({
      title: '',
      description: '',
      type: 'YouTube',
      reward: 10,
      totalWorkers: 100,
      link: '',
      status: 'active'
    });
    alert('Global System Campaign Deployed Successfully!');
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCoins = users.reduce((acc, curr) => acc + curr.coins, 0);
  const bannedCount = users.filter(u => u.status === 'banned').length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-shield-halved text-indigo-500 text-2xl animate-pulse"></i>
        </div>
      </div>
      <p className="font-black uppercase tracking-[0.3em] text-[11px] text-indigo-400">Initializing Admin Core...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Futurist Header */}
      <div className="bg-slate-900/80 border-b border-slate-800 py-6 px-10 sticky top-0 z-50 backdrop-blur-2xl">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
              <i className="fa-solid fa-bolt-lightning text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">Command <span className="text-indigo-400">Console</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Node Alpha Online • v2.4.0</p>
              </div>
            </div>
          </div>
          
          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            {[
              { id: 'users', icon: 'fa-users-gear' },
              { id: 'transactions', icon: 'fa-receipt' },
              { id: 'tasks', icon: 'fa-briefcase' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id as any)}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
              >
                <i className={`fa-solid ${v.icon}`}></i>
                {v.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-10">
        {view === 'users' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Real-time Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden group hover:border-indigo-500/50 transition-all cursor-default">
                 <div className="relative z-10">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex justify-between">
                      Population 
                      <span className="text-emerald-500">+12%</span>
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter mb-2">{users.length}</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase">Verified Accounts</div>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                 <i className="fa-solid fa-user-group absolute -right-6 -bottom-6 text-8xl text-white/5 group-hover:text-indigo-500/10 transition-all duration-500"></i>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden group hover:border-indigo-500/50 transition-all cursor-default">
                 <div className="relative z-10">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Network Liquidity</div>
                    <div className="text-5xl font-black text-indigo-400 tracking-tighter mb-2">{totalCoins.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase">≈ ${(totalCoins/2500).toFixed(2)} USD value</div>
                 </div>
                 <i className="fa-solid fa-coins absolute -right-6 -bottom-6 text-8xl text-white/5 group-hover:text-indigo-500/10 transition-all duration-500"></i>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden group hover:border-red-500/50 transition-all cursor-default">
                 <div className="relative z-10">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Security Alerts</div>
                    <div className="text-5xl font-black text-red-500 tracking-tighter mb-2">{bannedCount}</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase">Blacklisted Entities</div>
                 </div>
                 <i className="fa-solid fa-shield-virus absolute -right-6 -bottom-6 text-8xl text-white/5 group-hover:text-red-500/10 transition-all duration-500"></i>
               </div>

               <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/20 relative overflow-hidden group cursor-pointer hover:bg-indigo-500 transition-all">
                  <div className="relative z-10 text-white h-full flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">System Ops</div>
                      <h4 className="text-xl font-black tracking-tight">Generate Audit Report</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-xl border border-white/10">
                      Access Logs <i className="fa-solid fa-arrow-right"></i>
                    </div>
                  </div>
                  <i className="fa-solid fa-microchip absolute -right-4 -bottom-4 text-7xl text-white/10"></i>
               </div>
            </div>

            {/* Managed User List */}
            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-8 bg-slate-950/30">
                <div className="flex-1 w-full max-w-xl">
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-600"></i>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search identity by name, email or ID..."
                      className="w-full pl-16 pr-8 py-5 bg-slate-950/50 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder-slate-700"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-3">
                    <i className="fa-solid fa-filter"></i> Filters
                  </button>
                  <button onClick={fetchData} className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all">
                    <i className="fa-solid fa-rotate"></i>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950/50">
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity Profile</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Wallet Integrity</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Engagement Score</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Access Status</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">System Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-40 text-center">
                          <i className="fa-solid fa-user-slash text-slate-800 text-7xl mb-6"></i>
                          <p className="text-slate-500 font-black text-xs uppercase tracking-widest">No matching identities found in core</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className={`hover:bg-slate-800/20 transition-all group ${u.status === 'banned' ? 'opacity-40 grayscale bg-red-500/[0.02]' : ''}`}>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black border-2 transition-all duration-500 ${u.status === 'banned' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-950 text-indigo-400 border-slate-800 group-hover:border-indigo-500 group-hover:scale-110 shadow-inner'}`}>
                                {u.username.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <div className="font-black text-white text-base tracking-tight">{u.username}</div>
                                  {u.isAdmin && <span className="px-2 py-0.5 bg-indigo-600 text-[7px] font-black text-white rounded uppercase tracking-widest">Admin</span>}
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                  <i className="fa-solid fa-fingerprint opacity-50"></i> {u.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                              {u.coins.toLocaleString()}
                              <i className="fa-solid fa-coins text-xs text-yellow-500/50"></i>
                            </div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">Verified Balance</div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <div className="flex-1 h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full w-[65%]"></div>
                              </div>
                              <span className="text-[10px] font-black text-white">65%</span>
                            </div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">Trust Level</div>
                          </td>
                          <td className="px-10 py-8">
                            <span className={`px-4 py-2 text-[9px] font-black rounded-xl uppercase tracking-widest border shadow-sm flex items-center gap-2 w-fit ${u.status === 'banned' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'banned' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                              {u.status === 'banned' ? 'Deactivated' : 'Authorized'}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setAdjustingUser(u)}
                                className="w-11 h-11 bg-slate-800 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-slate-700 shadow-sm flex items-center justify-center"
                                title="Adjust Balance"
                              >
                                <i className="fa-solid fa-vault text-sm"></i>
                              </button>
                              <button 
                                onClick={() => handleToggleUserBan(u.id)}
                                className={`w-11 h-11 rounded-xl transition-all border shadow-sm flex items-center justify-center ${
                                  u.status === 'banned' 
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                                    : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                                }`}
                                title={u.status === 'banned' ? "Unban Account" : "Terminate Access"}
                              >
                                <i className={`fa-solid ${u.status === 'banned' ? 'fa-user-check' : 'fa-user-slash'}`}></i>
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
          </div>
        )}

        {view === 'transactions' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
             <div className="flex justify-between items-center mb-6 px-4">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Financial Ledger</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Real-time synchronization with global vaults</p>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Volume</div>
                      <div className="text-2xl font-black text-indigo-400">84,500 <span className="text-[10px] opacity-50 uppercase">Coins</span></div>
                   </div>
                   <div className="w-px h-12 bg-slate-800"></div>
                   <button className="px-8 py-4 bg-indigo-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20">
                     Export Report
                   </button>
                </div>
             </div>

            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="divide-y divide-slate-800/50">
                {transactions.length === 0 ? (
                  <div className="p-40 text-center">
                    <i className="fa-solid fa-inbox text-slate-800 text-7xl mb-8"></i>
                    <p className="text-slate-600 font-black text-xs uppercase tracking-[0.3em]">Ledger is current empty</p>
                  </div>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="p-10 flex items-center justify-between hover:bg-slate-800/30 transition-all group relative overflow-hidden">
                      <div className="flex items-center gap-10 relative z-10">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl border-2 shadow-inner transition-transform group-hover:scale-105 ${
                          tx.type === 'deposit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          tx.type === 'withdraw' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-950 text-slate-600 border-slate-800'
                        }`}>
                          <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-arrow-down-long' : tx.type === 'withdraw' ? 'fa-arrow-up-long' : 'fa-code-compare'}`}></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-5">
                            <span className="font-black text-white text-2xl tracking-tighter capitalize">{tx.type} Request</span>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-4 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center gap-2">
                               <i className="fa-solid fa-at opacity-50"></i>{tx.username}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3 flex items-center gap-4">
                            <span className="flex items-center gap-2"><i className="fa-solid fa-calendar-day opacity-50"></i> {tx.date}</span>
                            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                            <span className="flex items-center gap-2"><i className="fa-solid fa-credit-card opacity-50"></i> {tx.method}</span>
                            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                            <span className="flex items-center gap-2"><i className="fa-solid fa-shield opacity-50"></i> {tx.id.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-12 relative z-10">
                        <div className="text-right">
                          <div className={`text-4xl font-black tracking-tighter ${tx.type === 'deposit' ? 'text-blue-400' : tx.type === 'withdraw' ? 'text-amber-400' : 'text-white'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} 
                            <span className="text-xs text-slate-600 uppercase ml-2">Coins</span>
                          </div>
                          <div className={`text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center justify-end gap-2 ${
                            tx.status === 'success' ? 'text-emerald-500' : 
                            tx.status === 'pending' ? 'text-amber-500 animate-pulse' : 'text-red-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'success' ? 'bg-emerald-500' : tx.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                            {tx.status}
                          </div>
                        </div>
                        {tx.status === 'pending' && (
                          <div className="flex gap-4">
                            <button 
                              onClick={() => handleTransactionStatus(tx, 'success')}
                              className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-90"
                              title="Approve Transaction"
                            >
                              <i className="fa-solid fa-check text-xl"></i>
                            </button>
                            <button 
                              onClick={() => handleTransactionStatus(tx, 'failed')}
                              className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 active:scale-90"
                              title="Reject Transaction"
                            >
                              <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'tasks' && (
          <div className="animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="flex justify-between items-center mb-10 px-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Campaign Ecosystem</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Audit and deployment of decentralized micro-tasks</p>
              </div>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="px-10 py-5 bg-indigo-600 text-white text-[10px] font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 uppercase tracking-[0.3em] flex items-center gap-4 group"
              >
                <i className="fa-solid fa-plus group-hover:rotate-90 transition-transform"></i>
                Initiate Official Campaign
              </button>
            </div>

            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="divide-y divide-slate-800/50">
                {tasks.length === 0 ? (
                  <div className="p-40 text-center">
                    <i className="fa-solid fa-layer-group text-slate-800 text-7xl mb-8"></i>
                    <p className="text-slate-600 font-black text-xs uppercase tracking-[0.3em]">No active campaigns found in network</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="p-12 flex flex-col xl:flex-row items-start xl:items-center justify-between hover:bg-slate-800/30 transition-all group gap-8">
                      <div className="flex-1">
                         <div className="flex flex-wrap items-center gap-5 mb-4">
                            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-indigo-400 border border-slate-800 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <i className={`fa-solid ${task.type === 'YouTube' ? 'fa-youtube' : task.type === 'Websites' ? 'fa-globe' : 'fa-mobile'}`}></i>
                            </div>
                            <h4 className="text-3xl font-black text-white tracking-tighter group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                            <span className={`px-4 py-1.5 text-[9px] font-black rounded-xl uppercase tracking-widest border flex items-center gap-2 ${
                              task.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                              task.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                              {task.status}
                            </span>
                            {task.creatorId === 'ADMIN' && (
                              <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded-xl uppercase tracking-widest border border-indigo-500/20">System Master</span>
                            )}
                         </div>
                         <p className="text-lg text-slate-500 max-w-4xl line-clamp-2 font-medium leading-relaxed">{task.description}</p>
                         <div className="mt-8 flex flex-wrap items-center gap-8">
                           <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Target Allocation</span>
                             <span className="text-sm font-black text-white">{task.completedCount} / {task.totalWorkers} Slots</span>
                           </div>
                           <div className="w-px h-8 bg-slate-800"></div>
                           <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Unit Reward</span>
                             <span className="text-sm font-black text-indigo-400">{task.reward} Coins</span>
                           </div>
                           <div className="w-px h-8 bg-slate-800"></div>
                           <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Asset Link</span>
                             <span className="text-sm font-black text-slate-400 truncate max-w-[200px] hover:text-indigo-400 transition-colors cursor-pointer">{task.link}</span>
                           </div>
                         </div>
                      </div>
                      
                      <div className="flex gap-4 self-end xl:self-center">
                        {task.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleTaskStatus(task.id, 'active')}
                              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
                            >
                              Approve Campaign
                            </button>
                            <button 
                              onClick={() => handleTaskStatus(task.id, 'rejected')}
                              className="px-8 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all border border-slate-700 shadow-xl shadow-red-500/10"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-14 h-14 bg-slate-950 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl flex items-center justify-center transition-all border border-slate-800 shadow-inner group/del"
                          title="Purge Campaign"
                        >
                          <i className="fa-solid fa-trash-can text-lg group-hover/del:scale-110 transition-transform"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Futuristic Balance Adjustment Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-slate-800 animate-in zoom-in-95 duration-400">
            <div className="p-12 relative overflow-hidden">
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full"></div>

              <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Wallet Override</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-[12px] font-black text-white">
                      {adjustingUser.username.charAt(0)}
                    </div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">User: {adjustingUser.username}</p>
                  </div>
                </div>
                <button onClick={() => setAdjustingUser(null)} className="w-12 h-12 bg-slate-950 text-slate-600 rounded-2xl flex items-center justify-center hover:text-white transition-all border border-slate-800 shadow-inner">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                   <button 
                    onClick={() => setAdjustmentType('add')}
                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adjustmentType === 'add' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-600 hover:text-slate-400'}`}
                   >
                     <i className="fa-solid fa-plus mr-3"></i> Add Funds
                   </button>
                   <button 
                    onClick={() => setAdjustmentType('subtract')}
                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adjustmentType === 'subtract' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-slate-600 hover:text-slate-400'}`}
                   >
                     <i className="fa-solid fa-minus mr-3"></i> Penalize
                   </button>
                </div>

                <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-slate-800 shadow-inner group">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Input Amount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={adjustmentAmount}
                      onChange={(e) => setAdjustmentAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent text-5xl font-black text-white outline-none placeholder-slate-900 group-hover:text-indigo-400 transition-colors"
                      autoFocus
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-700 font-black text-sm uppercase">Coins</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800 shadow-inner">
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Pre-Balance</div>
                    <div className="text-xl font-black text-white">{adjustingUser.coins.toLocaleString()}</div>
                  </div>
                  <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800 shadow-inner">
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Projected</div>
                    <div className={`text-xl font-black ${adjustmentType === 'add' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {Math.max(0, adjustingUser.coins + (adjustmentType === 'add' ? (parseInt(adjustmentAmount) || 0) : -(parseInt(adjustmentAmount) || 0))).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleApplyAdjustment}
                  className={`w-full py-7 font-black rounded-3xl transition-all shadow-2xl uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 group ${
                    adjustmentType === 'add' ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-red-600 text-white shadow-red-500/30'
                  }`}
                >
                  Confirm System Update
                  <i className="fa-solid fa-check-double group-hover:scale-125 transition-transform"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Deployment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-[3.5rem] w-full max-w-4xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-slate-800 animate-in zoom-in-95 duration-400">
            <div className="p-14 relative overflow-hidden">
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex justify-between items-center mb-12 relative z-10">
                <div>
                   <h3 className="text-4xl font-black text-white tracking-tighter">New Master Campaign</h3>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-3">Deploying official content to global feed</p>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="w-16 h-16 bg-slate-950 text-slate-600 rounded-2xl flex items-center justify-center hover:text-white transition-all border border-slate-800 shadow-inner group">
                  <i className="fa-solid fa-xmark text-2xl group-hover:rotate-90 transition-transform"></i>
                </button>
              </div>

              <form onSubmit={handleCreateAdminTask} className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Campaign Identity Title</label>
                    <input 
                      type="text" 
                      required
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      placeholder="Enter a high-impact descriptive title..."
                      className="w-full px-8 py-6 bg-slate-950/50 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner placeholder-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Global Destination Resource (URL)</label>
                    <div className="relative">
                      <i className="fa-solid fa-link absolute left-8 top-1/2 -translate-y-1/2 text-slate-800"></i>
                      <input 
                        type="url" 
                        required
                        value={newTask.link}
                        onChange={e => setNewTask({...newTask, link: e.target.value})}
                        placeholder="https://resource.cdn/target-id"
                        className="w-full pl-16 pr-8 py-6 bg-slate-950/50 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner placeholder-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Platform Context</label>
                    <div className="relative">
                      <i className="fa-solid fa-layer-group absolute left-8 top-1/2 -translate-y-1/2 text-slate-800"></i>
                      <select 
                        value={newTask.type}
                        onChange={e => setNewTask({...newTask, type: e.target.value as TaskType})}
                        className="w-full pl-16 pr-8 py-6 bg-slate-950/50 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all appearance-none shadow-inner"
                      >
                        {['YouTube', 'Websites', 'Apps', 'Social Media'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-8 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none"></i>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Unit Value</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={newTask.reward}
                        onChange={e => setNewTask({...newTask, reward: parseInt(e.target.value) || 0})}
                        className="w-full px-8 py-6 bg-slate-950/50 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Slot Allocation</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={newTask.totalWorkers}
                        onChange={e => setNewTask({...newTask, totalWorkers: parseInt(e.target.value) || 0})}
                        className="w-full px-8 py-6 bg-slate-950/50 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Operational Protocol (Instructions)</label>
                    <textarea 
                      required
                      rows={5}
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Specify explicit verification requirements for network participants..."
                      className="w-full px-8 py-6 bg-slate-950/50 border border-slate-800 rounded-[2rem] focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner leading-relaxed placeholder-slate-800"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-10 flex flex-col md:flex-row gap-6">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-7 bg-slate-950 text-slate-600 font-black rounded-3xl hover:bg-slate-800 transition-all uppercase text-[11px] tracking-[0.4em] border border-slate-800 shadow-inner">Terminate Draft</button>
                  <button type="submit" className="flex-[2] py-7 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30 uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-4 group">
                    Deploy Official Campaign
                    <i className="fa-solid fa-paper-plane group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
