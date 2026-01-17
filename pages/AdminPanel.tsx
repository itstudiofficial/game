
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-indigo-500"></i>
      <p className="font-black uppercase tracking-widest text-[10px]">Synchronizing Secure Nodes...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pb-20">
      <div className="bg-slate-900/50 border-b border-slate-800 py-6 px-8 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <i className="fa-solid fa-user-shield text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">Admin <span className="text-indigo-400">Hub</span></h1>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1.5">System Core Level 4 Access</p>
            </div>
          </div>
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {['users', 'transactions', 'tasks'].map(v => (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {view === 'users' && (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
               <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Users</div>
                    <div className="text-5xl font-black text-white tracking-tighter">{users.length}</div>
                 </div>
                 <i className="fa-solid fa-users absolute -right-4 -bottom-4 text-7xl text-white/5 group-hover:scale-110 transition-transform"></i>
               </div>
               <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Coins</div>
                    <div className="text-5xl font-black text-indigo-400 tracking-tighter">{users.reduce((acc, curr) => acc + curr.coins, 0).toLocaleString()}</div>
                 </div>
                 <i className="fa-solid fa-coins absolute -right-4 -bottom-4 text-7xl text-white/5 group-hover:scale-110 transition-transform"></i>
               </div>
               <div className="md:col-span-2 bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 flex items-center">
                  <div className="w-full">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Search Identity</label>
                    <div className="relative">
                      <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-500"></i>
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by name or email..."
                        className="w-full pl-16 pr-6 py-4 bg-slate-950 rounded-2xl border border-slate-800 text-white outline-none focus:border-indigo-500 transition-all font-bold"
                      />
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-500">User Identity</th>
                    <th className="px-10 py-8 text-[10px) font-black uppercase tracking-widest text-slate-500">Wallet Balance</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Reputation</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className={`hover:bg-slate-800/30 transition-colors group ${u.status === 'banned' ? 'opacity-50' : ''}`}>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black border text-xl shadow-inner transition-all ${u.status === 'banned' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-950 text-indigo-500 border-slate-800'}`}>
                            {u.username.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="font-black text-white text-base tracking-tight">{u.username}</div>
                              {u.status === 'banned' && (
                                <span className="px-2 py-0.5 bg-red-600 text-[8px] font-black text-white rounded uppercase tracking-widest">BANNED</span>
                              )}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-2xl font-black text-white tracking-tighter">{u.coins.toLocaleString()}</div>
                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">Available Coins</div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest border transition-all ${u.status === 'banned' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                          {u.status === 'banned' ? 'Blacklisted' : 'Authorized User'}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => setAdjustingUser(u)}
                            className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/20 shadow-sm flex items-center justify-center"
                            title="Adjust Balance"
                          >
                            <i className="fa-solid fa-wallet text-sm"></i>
                          </button>
                          <button 
                            onClick={() => handleToggleUserBan(u.id)}
                            className={`w-12 h-12 rounded-2xl transition-all border shadow-sm flex items-center justify-center ${
                              u.status === 'banned' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                                : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                            }`}
                            title={u.status === 'banned' ? "Unban User" : "Ban User"}
                          >
                            <i className={`fa-solid ${u.status === 'banned' ? 'fa-user-check' : 'fa-user-slash'}`}></i>
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

        {view === 'transactions' && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h3 className="font-black text-white uppercase tracking-widest text-xs">Real-time Ledger Queue</h3>
              </div>
              <div className="divide-y divide-slate-800/50">
                {transactions.length === 0 ? (
                  <div className="p-40 text-center">
                    <i className="fa-solid fa-receipt text-slate-800 text-7xl mb-8"></i>
                    <p className="text-slate-600 font-black text-xs uppercase tracking-[0.3em]">No incoming logs</p>
                  </div>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="p-10 flex items-center justify-between hover:bg-slate-800/30 transition-all group">
                      <div className="flex items-center gap-8">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl border ${
                          tx.type === 'deposit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          tx.type === 'withdraw' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                            <span className="font-black text-white text-xl capitalize tracking-tight">{tx.type} Request</span>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20">@{tx.username}</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-3">
                            <i className="fa-solid fa-clock opacity-50"></i>
                            {tx.date} • {tx.method} • SEC-ID: {tx.id.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <div className="text-3xl font-black text-white tracking-tighter">{tx.amount.toLocaleString()} <span className="text-xs text-slate-600 uppercase">COINS</span></div>
                          <div className={`text-[9px] font-black uppercase tracking-[0.3em] mt-1.5 ${
                            tx.status === 'success' ? 'text-emerald-500' : 
                            tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                          }`}>{tx.status}</div>
                        </div>
                        {tx.status === 'pending' && (
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleTransactionStatus(tx, 'success')}
                              className="px-8 py-4 bg-emerald-600 text-white text-[10px] font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 uppercase tracking-widest"
                            >
                              Finalize
                            </button>
                            <button 
                              onClick={() => handleTransactionStatus(tx, 'failed')}
                              className="px-8 py-4 bg-red-600 text-white text-[10px] font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 uppercase tracking-widest"
                            >
                              Deny
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
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Marketplace Compliance</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Audit and deploy official campaigns</p>
              </div>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="px-10 py-5 bg-indigo-600 text-white text-[10px] font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-900/40 uppercase tracking-[0.2em] flex items-center gap-3"
              >
                <i className="fa-solid fa-plus"></i>
                Deploy Global Task
              </button>
            </div>

            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-slate-800 bg-slate-950">
                 <h3 className="font-black text-white uppercase tracking-widest text-xs">Active Inventory Audit</h3>
              </div>
              <div className="divide-y divide-slate-800/50">
                {tasks.length === 0 ? (
                  <div className="p-40 text-center">
                    <p className="text-slate-600 font-black text-xs uppercase tracking-[0.3em]">Marketplace is currently empty</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="p-12 flex items-center justify-between hover:bg-slate-800/30 transition-all group">
                      <div className="flex-1">
                         <div className="flex items-center gap-5 mb-3">
                            <h4 className="text-2xl font-black text-white tracking-tight">{task.title}</h4>
                            <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest border ${
                              task.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                              task.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>{task.status}</span>
                            {task.creatorId === 'ADMIN' && (
                              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded-lg uppercase tracking-widest border border-indigo-500/20">SYSTEM OFFICIAL</span>
                            )}
                         </div>
                         <p className="text-base text-slate-500 max-w-2xl line-clamp-2 font-medium leading-relaxed">{task.description}</p>
                         <div className="mt-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest flex flex-wrap items-center gap-6">
                           <span className="flex items-center gap-2"><i className="fa-solid fa-users opacity-50"></i> {task.totalWorkers} Total Slots</span>
                           <span className="flex items-center gap-2"><i className="fa-solid fa-coins opacity-50"></i> {task.reward} Reward</span>
                           <span className="flex items-center gap-2"><i className="fa-solid fa-link opacity-50"></i> {task.link}</span>
                           <span className="flex items-center gap-2"><i className="fa-solid fa-fingerprint opacity-50"></i> {task.id}</span>
                         </div>
                      </div>
                      <div className="flex gap-3 pl-8">
                        {task.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleTaskStatus(task.id, 'active')}
                              className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-900/20 hover:scale-110 transition-transform"
                            >
                              <i className="fa-solid fa-check text-xl"></i>
                            </button>
                            <button 
                              onClick={() => handleTaskStatus(task.id, 'rejected')}
                              className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-900/20 hover:scale-110 transition-transform"
                            >
                              <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-14 h-14 bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl flex items-center justify-center transition-all border border-slate-700"
                        >
                          <i className="fa-solid fa-trash-can text-lg"></i>
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

      {/* Balance Adjustment Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="p-12">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Balance Adjustment</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Target: {adjustingUser.username}</p>
                </div>
                <button onClick={() => setAdjustingUser(null)} className="w-12 h-12 bg-slate-950 text-slate-600 rounded-2xl flex items-center justify-center hover:text-white transition-all border border-slate-800">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="space-y-8">
                <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800">
                   <button 
                    onClick={() => setAdjustmentType('add')}
                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adjustmentType === 'add' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-400'}`}
                   >
                     <i className="fa-solid fa-plus mr-2"></i> Add Coins
                   </button>
                   <button 
                    onClick={() => setAdjustmentType('subtract')}
                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adjustmentType === 'subtract' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-400'}`}
                   >
                     <i className="fa-solid fa-minus mr-2"></i> Deduct Coins
                   </button>
                </div>

                <div className="bg-slate-950 p-8 rounded-[2rem] border border-slate-800">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Coin Amount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={adjustmentAmount}
                      onChange={(e) => setAdjustmentAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent text-4xl font-black text-white outline-none placeholder-slate-800"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-600 font-black text-sm uppercase">Coins</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Balance</div>
                    <div className="text-xl font-black text-white">{adjustingUser.coins.toLocaleString()}</div>
                  </div>
                  <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Projected Balance</div>
                    <div className={`text-xl font-black ${adjustmentType === 'add' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {Math.max(0, adjustingUser.coins + (adjustmentType === 'add' ? (parseInt(adjustmentAmount) || 0) : -(parseInt(adjustmentAmount) || 0))).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleApplyAdjustment}
                  className={`w-full py-6 font-black rounded-2xl transition-all shadow-xl uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 ${
                    adjustmentType === 'add' ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-red-600 text-white shadow-red-900/20'
                  }`}
                >
                  <i className="fa-solid fa-check-circle"></i>
                  Commit System Correction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Task Deployment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-[3.5rem] w-full max-w-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="p-12">
              <div className="flex justify-between items-center mb-12">
                <div>
                   <h3 className="text-3xl font-black text-white tracking-tight">System Campaign Creator</h3>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-2">Deploy top-tier tasks to global pool</p>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="w-14 h-14 bg-slate-950 text-slate-600 rounded-2xl flex items-center justify-center hover:text-white transition-all border border-slate-800 shadow-inner">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleCreateAdminTask} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Campaign Title</label>
                    <input 
                      type="text" 
                      required
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      placeholder="e.g. Subscribe to official telegram and comment"
                      className="w-full px-8 py-5 bg-slate-950 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner placeholder-slate-700"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Destination URL</label>
                    <input 
                      type="url" 
                      required
                      value={newTask.link}
                      onChange={e => setNewTask({...newTask, link: e.target.value})}
                      placeholder="https://t.me/adspredia_official"
                      className="w-full px-8 py-5 bg-slate-950 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner placeholder-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Platform Category</label>
                    <select 
                      value={newTask.type}
                      onChange={e => setNewTask({...newTask, type: e.target.value as TaskType})}
                      className="w-full px-8 py-5 bg-slate-950 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all appearance-none"
                    >
                      {['YouTube', 'Websites', 'Apps', 'Social Media'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px) font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Reward (Coins)</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={newTask.reward}
                        onChange={e => setNewTask({...newTask, reward: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-5 bg-slate-950 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Total Target Slots</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={newTask.totalWorkers}
                        onChange={e => setNewTask({...newTask, totalWorkers: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-5 bg-slate-950 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Instruction Protocol</label>
                    <textarea 
                      required
                      rows={4}
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Specify the exact verification steps..."
                      className="w-full px-8 py-6 bg-slate-950 border border-slate-800 rounded-[2rem] focus:border-indigo-500 outline-none font-bold text-white transition-all shadow-inner leading-relaxed placeholder-slate-700"
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Initial Status</label>
                    <div className="flex gap-4">
                       <button 
                        type="button" 
                        onClick={() => setNewTask({...newTask, status: 'active'})}
                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newTask.status === 'active' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-950 text-slate-500 border-slate-800'}`}
                       >Live Immediately</button>
                       <button 
                        type="button" 
                        onClick={() => setNewTask({...newTask, status: 'pending'})}
                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newTask.status === 'pending' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 text-slate-500 border-slate-800'}`}
                       >Draft / Pending</button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex gap-5">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-6 bg-slate-950 text-slate-500 font-black rounded-2xl hover:bg-slate-800 transition-all uppercase text-[11px] tracking-[0.2em] border border-slate-800">Discard</button>
                  <button type="submit" className="flex-[2] py-6 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-900/40 uppercase text-[11px] tracking-[0.2em]">Deploy System Campaign</button>
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
