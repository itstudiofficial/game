
import React, { useState, useMemo } from 'react';
import { TaskType, Task, User } from '../types';

interface CreateTaskProps {
  tasks: Task[];
  user: User;
  onDeleteTask: (id: string) => Promise<void>;
  onUpdateTask: (id: string, data: Partial<Task>) => Promise<void>;
  onCreate: (task: { 
    title: string; 
    type: TaskType; 
    reward: number; 
    totalWorkers: number; 
    description: string;
    link?: string;
    dueDate?: string;
  }) => void;
  userDepositBalance?: number; 
  navigateTo: (page: string) => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ tasks, user, onDeleteTask, onUpdateTask, onCreate, userDepositBalance = 0, navigateTo }) => {
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    type: 'YouTube' as TaskType,
    reward: 10,
    totalWorkers: 10,
    description: '',
    dueDate: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Economic Policy
  const COIN_RATE = 2500;
  const totalCost = formData.reward * formData.totalWorkers;
  const isBalanceEnough = userDepositBalance >= totalCost;

  const categories: {id: TaskType, icon: string}[] = [
    { id: 'YouTube', icon: 'fa-youtube' },
    { id: 'Websites', icon: 'fa-globe' },
    { id: 'Apps', icon: 'fa-mobile-screen' },
    { id: 'Social Media', icon: 'fa-share-nodes' }
  ];

  // Recently Created by this user
  const recentUserTasks = useMemo(() => {
    return tasks
      .filter(t => t.creatorId === user.id)
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 3);
  }, [tasks, user.id]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanceEnough) return alert('Insufficient Deposit Balance. Campaigns can only be launched from deposited funds.');
    if (!formData.title || !formData.description || !formData.link) {
      return alert('Operational parameters incomplete. Title, Link, and Instructions are required.');
    }
    if (formData.reward < 5) return alert('Minimum reward per user is 5 coins to ensure engagement quality.');
    
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    setIsDeploying(true);
    setTimeout(() => {
      onCreate(formData);
      setFormData({ title: '', link: '', type: 'YouTube', reward: 10, totalWorkers: 10, description: '', dueDate: '' });
      setShowConfirmModal(false);
      setIsDeploying(false);
    }, 1500);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      await onUpdateTask(editingTask.id, editingTask);
      setEditingTask(null);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 space-y-20">
        
        {/* Main Form Section */}
        <section>
          <div className="mb-12 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
              <i className="fa-solid fa-satellite-dish"></i>
              Global Deployment Hub
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
              Launch <span className="text-indigo-600">Campaign</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Initialize high-precision micro-tasks. Note: Only <b>Deposit Balance</b> can be used for advertising.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100 p-10 md:p-16">
                <form onSubmit={handleInitialSubmit} className="space-y-12">
                  
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 gap-10">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Campaign Identity (Title)</label>
                        <input 
                          type="text" 
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          placeholder="e.g. Subscribe to official network channel" 
                          className="w-full px-10 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl focus:ring-4 focus:ring-indigo-600/5 font-black text-slate-800 shadow-inner outline-none transition-all placeholder:text-slate-300"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Destination Resource (Target URL)</label>
                        <div className="relative group">
                          <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                            <i className="fa-solid fa-link"></i>
                          </div>
                          <input 
                            type="url" 
                            value={formData.link}
                            onChange={e => setFormData({...formData, link: e.target.value})}
                            placeholder="https://www.youtube.com/watch?v=..." 
                            className="w-full pl-16 pr-10 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl focus:ring-4 focus:ring-indigo-600/5 font-black text-slate-800 shadow-inner outline-none transition-all placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Modality</label>
                      <div className="relative">
                        <select 
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value as TaskType})}
                          className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl font-black text-slate-800 shadow-inner appearance-none outline-none cursor-pointer"
                        >
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-xs"></i>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Campaign Expiry (Due Date - Optional)</label>
                      <input 
                        type="date" 
                        value={formData.dueDate}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl font-black text-slate-800 shadow-inner outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Reward / User</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="5"
                          value={formData.reward}
                          onChange={e => setFormData({...formData, reward: parseInt(e.target.value) || 0})}
                          className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl font-black text-slate-800 shadow-inner outline-none"
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">Coins</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Total Slot Quota</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="1"
                          value={formData.totalWorkers}
                          onChange={e => setFormData({...formData, totalWorkers: parseInt(e.target.value) || 0})}
                          className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl font-black text-slate-800 shadow-inner outline-none"
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">Users</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Operational Protocol (Instructions)</label>
                    <textarea 
                      rows={6}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Provide explicit instructions..." 
                      className="w-full px-10 py-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2.5rem] font-black text-slate-800 leading-relaxed shadow-inner outline-none transition-all placeholder:text-slate-300"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={!isBalanceEnough}
                    className={`w-full py-8 text-white font-black rounded-[2.5rem] transition-all shadow-2xl flex items-center justify-center gap-6 uppercase tracking-[0.4em] text-xs transform active:scale-[0.98] ${
                      isBalanceEnough ? 'bg-slate-900 hover:bg-indigo-600 shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isBalanceEnough ? 'Launch Campaign Now' : 'Deposit Funds Required'}
                    <i className="fa-solid fa-paper-plane text-sm"></i>
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8 sticky top-28">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-10">Escrow Analysis</h3>
                  <div className="space-y-8 mb-12">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Reward per user</span>
                      <span className="text-white">{formData.reward.toLocaleString()} <span className="text-[8px] opacity-40">Coins</span></span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Target userbase</span>
                      <span className="text-white">{formData.totalWorkers.toLocaleString()} <span className="text-[8px] opacity-40">Slots</span></span>
                    </div>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div className="pt-2">
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">Projected Campaign Cost</p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-6xl font-black tracking-tighter leading-none">{totalCost.toLocaleString()}</span>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Coins</span>
                      </div>
                    </div>
                  </div>
                </div>
                <i className="fa-solid fa-vault absolute -right-12 -bottom-12 text-[15rem] text-white/5 rotate-12 pointer-events-none"></i>
              </div>
            </div>
          </div>
        </section>

        {/* Recently Launched Section */}
        <section className="animate-in fade-in duration-700">
          <div className="flex items-center justify-between mb-8 px-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-sm shadow-lg">
                   <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Recent Deployments</h2>
             </div>
             <button onClick={() => navigateTo('my-campaigns')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">Manage All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentUserTasks.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                 <i className="fa-solid fa-box-open text-5xl text-slate-100 mb-4"></i>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No recently launched tasks</p>
              </div>
            ) : (
              recentUserTasks.map(t => (
                <div key={t.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                         <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded-lg uppercase tracking-widest mb-2 block w-fit">{t.type}</span>
                         <h3 className="text-lg font-black text-slate-900 truncate max-w-[200px]">{t.title}</h3>
                      </div>
                      <div className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border transition-all ${
                        t.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                      }`}>
                        {t.status}
                      </div>
                   </div>
                   
                   <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Worker Quota</p>
                        <p className="text-xl font-black text-slate-900 tabular-nums">{t.completedCount} / {t.totalWorkers}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Value</p>
                        <p className="text-xl font-black text-indigo-600 tabular-nums">{t.reward} <span className="text-[8px]">Coins</span></p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setEditingTask(t)}
                        className="py-3.5 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                         <i className="fa-solid fa-pen-to-square"></i> Edit Specs
                      </button>
                      <button 
                        onClick={() => { if(confirm('Are you sure you want to terminate this deployment?')) onDeleteTask(t.id); }}
                        className="py-3.5 bg-rose-50 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                         <i className="fa-solid fa-trash-can"></i> Terminate
                      </button>
                   </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* RE-USING EDIT MODAL LOGIC FOR BETTER UX */}
      {editingTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Quick Edit Node</h3>
                 <button onClick={() => setEditingTask(null)} className="w-12 h-12 bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                   <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-10 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Campaign Title</label>
                    <input 
                      type="text" 
                      value={editingTask.title} 
                      onChange={e => setEditingTask({...editingTask, title: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Quota Cap</label>
                    <input 
                      type="number" 
                      value={editingTask.totalWorkers} 
                      onChange={e => setEditingTask({...editingTask, totalWorkers: parseInt(e.target.value)})} 
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Expiry Date</label>
                    <input 
                      type="date" 
                      value={editingTask.dueDate || ''} 
                      onChange={e => setEditingTask({...editingTask, dueDate: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <button 
                  type="submit" 
                  className="w-full py-7 bg-slate-900 text-white font-black rounded-3xl uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-3xl"
                 >
                   Save and Propagate
                 </button>
              </form>
           </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[4rem] w-full max-w-xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-12 md:p-16">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white text-2xl shadow-xl">
                  <i className="fa-solid fa-file-signature"></i>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Operational Audit</h3>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Reviewing Final Deployment Metrics</p>
                </div>
              </div>

              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200/60 mb-12 space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-slate-200/60">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Due Date</span>
                   <span className="text-sm font-black text-slate-900">{formData.dueDate || 'Infinite'}</span>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-slate-200/60">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Escrow Total</span>
                   <div className="text-right">
                      <span className="text-xl font-black text-slate-900 block leading-none">{totalCost.toLocaleString()} Coins</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase">≈ ${(totalCost / COIN_RATE).toFixed(2)} USD</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Adjust</button>
                <button 
                  onClick={handleFinalConfirm}
                  disabled={isDeploying}
                  className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-[11px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isDeploying ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Execute Launch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTask;
