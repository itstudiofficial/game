
import React, { useState, useEffect } from 'react';
import { User, Task, Transaction, TaskType } from '../types';
import { storage } from '../services/storage';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<'users' | 'transactions' | 'tasks'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New State for Admin Task Creation
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'YouTube' as TaskType,
    reward: 10,
    totalWorkers: 100,
    link: ''
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

  const handleUpdateUserCoins = async (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newCoins = user.coins + amount;
      await storage.updateUserInCloud(userId, { coins: newCoins });
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
      status: 'active'
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
      link: ''
    });
    alert('Global Campaign Deployed Successfully!');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-indigo-500"></i>
      <p className="font-black uppercase tracking-widest text-xs">Accessing Mainframe...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 pb-20">
      <div className="bg-slate-800 border-b border-slate-700 py-6 px-8 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">Admin <span className="text-indigo-400">Hub</span></h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Ads Predia Global Control</p>
            </div>
          </div>
          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-700">
            {['users', 'transactions', 'tasks'].map(v => (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
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
               <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Users</div>
                 <div className="text-4xl font-black text-white">{users.length}</div>
               </div>
               <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Coins</div>
                 <div className="text-4xl font-black text-indigo-400">{users.reduce((acc, curr) => acc + curr.coins, 0).toLocaleString()}</div>
               </div>
            </div>

            <div className="bg-slate-800 rounded-[3rem] border border-slate-700 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">User Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Wallet Balance</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Reputation</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-indigo-500 border border-slate-700">
                            {u.username.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{u.username}</div>
                            <div className="text-[10px] font-bold text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-lg font-black text-white">{u.coins.toLocaleString()}</div>
                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Coins In Vault</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-indigo-500/20">Verified</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateUserCoins(u.id, 1000)}
                            className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                            title="Add 1000 Coins"
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                          <button 
                            className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            title="Ban User"
                          >
                            <i className="fa-solid fa-ban"></i>
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
            <div className="bg-slate-800 rounded-[3rem] border border-slate-700 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-slate-700 flex justify-between items-center bg-slate-900/30">
                <h3 className="font-black text-white uppercase tracking-widest text-xs">Processing Queue</h3>
              </div>
              <div className="divide-y divide-slate-700/50">
                {transactions.length === 0 ? (
                  <div className="p-40 text-center">
                    <i className="fa-solid fa-receipt text-slate-700 text-6xl mb-6"></i>
                    <p className="text-slate-500 font-black text-xs uppercase tracking-widest">No transaction logs</p>
                  </div>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-slate-700/30 transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl border ${
                          tx.type === 'deposit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          tx.type === 'withdraw' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-700 text-slate-400 border-slate-600'
                        }`}>
                          <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-white text-base capitalize">{tx.type}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">{tx.username}</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {tx.date} • {tx.method} • ID: {tx.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-xl font-black text-white">{tx.amount.toLocaleString()} <span className="text-[10px] text-slate-500 uppercase">Coins</span></div>
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${
                            tx.status === 'success' ? 'text-emerald-500' : 
                            tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                          }`}>{tx.status}</div>
                        </div>
                        {tx.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleTransactionStatus(tx, 'success')}
                              className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                            >
                              APPROVE
                            </button>
                            <button 
                              onClick={() => handleTransactionStatus(tx, 'failed')}
                              className="px-6 py-3 bg-red-600 text-white text-[10px] font-black rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                            >
                              REJECT
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
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Marketplace Oversight</h2>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
              >
                DEPLOY GLOBAL CAMPAIGN
              </button>
            </div>

            <div className="bg-slate-800 rounded-[3rem] border border-slate-700 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-slate-700 bg-slate-900/30">
                 <h3 className="font-black text-white uppercase tracking-widest text-xs">Compliance Audit</h3>
              </div>
              <div className="divide-y divide-slate-700/50">
                {tasks.length === 0 ? (
                  <div className="p-40 text-center">
                    <p className="text-slate-500 font-black text-xs uppercase tracking-widest">No tasks submitted</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="p-10 flex items-center justify-between hover:bg-slate-700/30 transition-all group">
                      <div className="flex-1">
                         <div className="flex items-center gap-4 mb-2">
                            <h4 className="text-xl font-black text-white">{task.title}</h4>
                            <span className={`px-2 py-1 text-[8px] font-black rounded uppercase tracking-widest border ${
                              task.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                              task.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>{task.status}</span>
                            {task.creatorId === 'ADMIN' && (
                              <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[8px] font-black rounded uppercase tracking-widest border border-indigo-500/20">System Task</span>
                            )}
                         </div>
                         <p className="text-sm text-slate-500 max-w-2xl line-clamp-1">{task.description}</p>
                         <div className="mt-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-4">
                           <span>Target: {task.totalWorkers} Slots</span>
                           <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                           <span className="truncate">Link: {task.link}</span>
                           <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                           <span>ID: {task.id}</span>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleTaskStatus(task.id, 'active')}
                              className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20"
                            >
                              <i className="fa-solid fa-check"></i>
                            </button>
                            <button 
                              onClick={() => handleTaskStatus(task.id, 'rejected')}
                              className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-12 h-12 bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-all"
                        >
                          <i className="fa-solid fa-trash-can"></i>
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

      {/* Admin Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-800 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                   <h3 className="text-2xl font-black text-white tracking-tight">System Campaign Architect</h3>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Deploy global marketplace tasks</p>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="w-12 h-12 bg-slate-900 text-slate-500 rounded-2xl flex items-center justify-center hover:text-white transition-all">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <form onSubmit={handleCreateAdminTask} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Campaign Title</label>
                    <input 
                      type="text" 
                      required
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      placeholder="e.g. Subscribe to official telegram"
                      className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Destination URL</label>
                    <input 
                      type="url" 
                      required
                      value={newTask.link}
                      onChange={e => setNewTask({...newTask, link: e.target.value})}
                      placeholder="https://t.me/adspredia"
                      className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Reward (Coins)</label>
                    <input 
                      type="number" 
                      required
                      value={newTask.reward}
                      onChange={e => setNewTask({...newTask, reward: parseInt(e.target.value)})}
                      className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Target Slots</label>
                    <input 
                      type="number" 
                      required
                      value={newTask.totalWorkers}
                      onChange={e => setNewTask({...newTask, totalWorkers: parseInt(e.target.value)})}
                      className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Instructions</label>
                    <textarea 
                      required
                      rows={3}
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Describe the steps clearly..."
                      className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-5 bg-slate-900 text-slate-500 font-black rounded-2xl hover:bg-slate-800 transition-all uppercase text-[10px] tracking-widest">Cancel</button>
                  <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 uppercase text-[10px] tracking-widest">DEPLOY SYSTEM CAMPAIGN</button>
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
