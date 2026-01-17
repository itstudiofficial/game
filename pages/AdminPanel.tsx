
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
          <i className="fa-solid fa-coins text-indigo-500 text-2xl animate-pulse"></i>
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
            <div className="flex items-center bg-slate-950/50 p-2 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fa-solid fa-coins text-base"></i>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-black text-white tracking-tight leading-none">Ads<span className="text-indigo-400">Predia</span></h1>
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Admin Console</p>
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
        {/* Rest of Admin Panel implementation... */}
        {view === 'users' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
             {/* Population, Liquidity, Security Cards... */}
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
                 <i className="fa-solid fa-user-group absolute -right-6 -bottom-6 text-8xl text-white/5 group-hover:text-indigo-500/10 transition-all duration-500"></i>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden group hover:border-indigo-500/50 transition-all cursor-default">
                 <div className="relative z-10">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Network Liquidity</div>
                    <div className="text-5xl font-black text-indigo-400 tracking-tighter mb-2">{totalCoins.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase">Coins Allocated</div>
                 </div>
                 <i className="fa-solid fa-coins absolute -right-6 -bottom-6 text-8xl text-white/5 group-hover:text-indigo-500/10 transition-all duration-500"></i>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
