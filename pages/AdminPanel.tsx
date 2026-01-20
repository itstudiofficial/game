
import React, { useState, useEffect } from 'react';
import { User, Task, Transaction, TaskType } from '../types';
import { storage } from '../services/storage';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<'users' | 'history' | 'tasks' | 'finance'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

  const [selectedProof, setSelectedProof] = useState<{taskId: string, username: string, proofImg: string} | null>(null);

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
    alert('Campaign created and deployed successfully.');
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
    await storage.updateGlobalTransaction(tx.id, { status });
    
    if (tx.type === 'deposit' && status === 'success') {
      const user = users.find(u => u.id === tx.userId);
      if (user) {
        await storage.updateUserInCloud(tx.userId, { coins: user.coins + tx.amount });
      }
    }
    // If withdrawal fails, refund the user
    if (tx.type === 'withdraw' && status === 'failed') {
      const user = users.find(u => u.id === tx.userId);
      if (user) {
        await storage.updateUserInCloud(tx.userId, { coins: user.coins + tx.amount });
      }
    }
    
    fetchData();
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

  const pendingFinance = transactions.filter(tx => tx.status === 'pending' && (tx.type === 'deposit' || tx.type === 'withdraw'));
  const totalCoins = users.reduce((acc, curr) => acc + curr.coins, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-indigo-200 animate-pulse">
          <i className="fa-solid fa-shield-halved text-5xl text-indigo-600"></i>
        </div>
        <p className="font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Initializing Admin Dashboard</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 pt-32 pb-20 font-medium">
      
      {/* Admin Branding Header */}
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <div className="bg-white rounded-[3.5rem] p-8 md:p-10 border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
          <div className="flex items-center gap-8 relative z-10">
             <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl">
                <i className="fa-solid fa-gauge-high"></i>
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Admin <span className="text-indigo-600">Dashboard</span></h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Network Control & Financial Oversight</p>
             </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'users', label: 'All Users', icon: 'fa-users' },
              { id: 'history', label: 'Income History', icon: 'fa-receipt' },
              { id: 'tasks', label: 'All Campaigns', icon: 'fa-bullhorn' },
              { id: 'finance', label: 'Financial Ops', icon: 'fa-wallet' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                <i className={`fa-solid ${tab.icon} ${view === tab.id ? 'opacity-100' : 'opacity-40'}`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {view === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-10">
            {/* User Directory */}
            <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl">User Directory</h3>
                  <div className="relative w-full md:w-96">
                    <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="w-full bg-white border border-slate-200 pl-14 pr-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-400"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
               </div>
               <div className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-slate-50/50">
                       <div className="flex items-center gap-6 flex-1">
                          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black">{u.username.charAt(0)}</div>
                          <div>
                             <h4 className="font-black text-slate-900 text-xl tracking-tight">{u.username}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-12 text-center">
                          <div>
                             <div className="text-2xl font-black text-slate-900 tabular-nums">{u.coins.toLocaleString()}</div>
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Balance</div>
                          </div>
                          <button onClick={() => setAdjustingUser(u)} className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">Adjust Balance</button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="animate-in fade-in slide-in-from-right-6 duration-500">
             <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl">Income History</h3>
                </div>
                <div className="divide-y divide-slate-100">
                   {transactions.map(tx => (
                     <div key={tx.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl border ${tx.type === 'earn' || tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                             <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-lg tracking-tight">{tx.type.toUpperCase()}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.username} • {tx.date}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`text-2xl font-black ${tx.type === 'earn' || tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                             {tx.type === 'earn' || tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                           </p>
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{tx.status}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {view === 'tasks' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-12">
            <div className="bg-slate-900 p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
               <div>
                  <h3 className="font-black text-white uppercase tracking-tighter text-3xl">All Campaigns</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Management of global task streams</p>
               </div>
               <button 
                onClick={() => setIsCreatingTask(true)}
                className="px-10 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-3"
               >
                 <i className="fa-solid fa-plus-circle"></i> Create Campaign
               </button>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-sm">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Active Campaign Inventory</h4>
               </div>
               <div className="divide-y divide-slate-100">
                  {tasks.map(task => (
                    <div key={task.id} className="p-8 flex flex-col lg:flex-row justify-between items-center gap-8">
                       <div className="flex-1">
                          <h5 className="font-black text-slate-900 text-xl tracking-tight mb-2">{task.title}</h5>
                          <div className="flex items-center gap-4">
                             <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${task.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{task.status}</span>
                             <span className="text-[9px] font-black text-slate-400 uppercase">ID: {task.id}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-12 text-center">
                          <div>
                             <div className="text-2xl font-black text-slate-900">{task.reward}</div>
                             <div className="text-[8px] font-black text-slate-400 uppercase">Reward</div>
                          </div>
                          <div>
                             <div className="text-2xl font-black text-slate-900">{task.completedCount} / {task.totalWorkers}</div>
                             <div className="text-[8px] font-black text-slate-400 uppercase">Progress</div>
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
          <div className="animate-in fade-in slide-in-from-right-6 duration-500 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {/* Deposit Management */}
               <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-slate-100 bg-emerald-50/30 flex justify-between items-center">
                     <h3 className="font-black text-emerald-900 uppercase tracking-tighter text-2xl">Deposit Requests</h3>
                     <i className="fa-solid fa-circle-arrow-down text-emerald-500 text-2xl"></i>
                  </div>
                  <div className="divide-y divide-slate-50">
                     {transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').length === 0 ? (
                        <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No Pending Deposits</div>
                     ) : (
                        transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending').map(tx => (
                          <div key={tx.id} className="p-8 space-y-4">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="font-black text-slate-900 text-lg tracking-tight">{tx.username}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-2xl font-black text-emerald-500">+{tx.amount.toLocaleString()}</p>
                                   <p className="text-[9px] font-black text-slate-300 uppercase">{tx.method}</p>
                                </div>
                             </div>
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[10px] font-mono break-all text-slate-600">
                                Ref/TxID: {tx.id}
                             </div>
                             <div className="flex gap-4">
                                <button onClick={() => handleTransactionStatus(tx, 'success')} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 shadow-lg shadow-emerald-100 transition-all">Approve</button>
                                <button onClick={() => handleTransactionStatus(tx, 'failed')} className="flex-1 py-4 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Reject</button>
                             </div>
                          </div>
                        ))
                     )}
                  </div>
               </div>

               {/* Withdrawal Management */}
               <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-slate-100 bg-indigo-50/30 flex justify-between items-center">
                     <h3 className="font-black text-indigo-900 uppercase tracking-tighter text-2xl">Withdrawal Requests</h3>
                     <i className="fa-solid fa-circle-arrow-up text-indigo-500 text-2xl"></i>
                  </div>
                  <div className="divide-y divide-slate-50">
                     {transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending').length === 0 ? (
                        <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No Pending Withdrawals</div>
                     ) : (
                        transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending').map(tx => (
                          <div key={tx.id} className="p-8 space-y-4">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="font-black text-slate-900 text-lg tracking-tight">{tx.username}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-2xl font-black text-indigo-500">-{tx.amount.toLocaleString()}</p>
                                   <p className="text-[9px] font-black text-slate-300 uppercase">{tx.method}</p>
                                </div>
                             </div>
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[10px] font-mono break-all text-slate-600">
                                Destination Account: {tx.id}
                             </div>
                             <div className="flex gap-4">
                                <button onClick={() => handleTransactionStatus(tx, 'success')} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-500 shadow-lg shadow-indigo-100 transition-all">Authorize</button>
                                <button onClick={() => handleTransactionStatus(tx, 'failed')} className="flex-1 py-4 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Reject</button>
                             </div>
                          </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl border border-slate-200">
              <h3 className="text-2xl font-black text-slate-900 text-center mb-8">Balance Adjustment</h3>
              <div className="space-y-8">
                 <div className="flex bg-slate-100 p-2 rounded-2xl border border-slate-200">
                    <button onClick={() => setAdjustmentType('add')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${adjustmentType === 'add' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Inject Coins</button>
                    <button onClick={() => setAdjustmentType('subtract')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${adjustmentType === 'subtract' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Subtract</button>
                 </div>
                 <input 
                   type="number" 
                   value={adjustmentAmount} 
                   onChange={(e) => setAdjustmentAmount(e.target.value)} 
                   placeholder="Amount..." 
                   className="w-full bg-slate-50 border border-slate-200 px-8 py-6 rounded-2xl font-black text-4xl text-center outline-none"
                 />
                 <div className="flex gap-4">
                    <button onClick={() => setAdjustingUser(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest">Cancel</button>
                    <button onClick={handleApplyAdjustment} className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl">Apply Sync</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreatingTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
           <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl border border-slate-200 my-auto">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Create Campaign</h3>
                 <button onClick={() => setIsCreatingTask(false)} className="w-12 h-12 bg-slate-50 rounded-xl text-slate-300 hover:text-slate-900"><i className="fa-solid fa-xmark text-2xl"></i></button>
              </div>
              <form onSubmit={handleCreateCampaign} className="p-10 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Title</label>
                    <input required type="text" value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-8 py-4 rounded-2xl font-black text-slate-800 outline-none" placeholder="e.g. Visit Website and Click Ads" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Link</label>
                       <input required type="url" value={newTaskData.link} onChange={e => setNewTaskData({...newTaskData, link: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-8 py-4 rounded-2xl font-black text-slate-800 outline-none" placeholder="https://..." />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Modality</label>
                       <select value={newTaskData.type} onChange={e => setNewTaskData({...newTaskData, type: e.target.value as TaskType})} className="w-full bg-slate-50 border border-slate-200 px-8 py-4 rounded-2xl font-black text-slate-800 outline-none appearance-none">
                          <option value="YouTube">YouTube</option>
                          <option value="Websites">Websites</option>
                          <option value="Apps">Apps</option>
                          <option value="Social Media">Social Media</option>
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Reward</label>
                       <input required type="number" value={newTaskData.reward} onChange={e => setNewTaskData({...newTaskData, reward: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 px-8 py-4 rounded-2xl font-black text-slate-800 outline-none" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Worker Limit</label>
                       <input required type="number" value={newTaskData.totalWorkers} onChange={e => setNewTaskData({...newTaskData, totalWorkers: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 px-8 py-4 rounded-2xl font-black text-slate-800 outline-none" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Instructions</label>
                    <textarea required rows={4} value={newTaskData.description} onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-8 py-4 rounded-2xl font-black text-slate-800 outline-none resize-none" placeholder="Explain the steps clearly..."></textarea>
                 </div>
                 <button type="submit" className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Deploy Campaign</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
