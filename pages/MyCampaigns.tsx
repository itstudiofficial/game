
import React, { useState } from 'react';
import { User, Task, Transaction } from '../types';

interface MyCampaignsProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
  onNavigate?: (page: string) => void;
}

const MyCampaigns: React.FC<MyCampaignsProps> = ({ user, tasks, transactions, onDeleteTask, onUpdateTask, onNavigate }) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  
  // Robust filtering: combine local user created list with task creatorId check
  const userTasks = tasks.filter(t => 
    t.creatorId === user.id || (user.createdTasks && user.createdTasks.includes(t.id))
  );
  
  const filteredTasks = userTasks.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const getLastSubmissionDate = (taskId: string) => {
    // Find latest "earn" transaction for this task across global history
    const taskTxs = transactions
      .filter(tx => tx.taskId === taskId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (taskTxs.length === 0) return 'No Submissions Yet';
    return taskTxs[0].date;
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onUpdateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        totalWorkers: editingTask.totalWorkers,
        dueDate: editingTask.dueDate
      });
      setEditingTask(null);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
              <i className="fa-solid fa-bullhorn"></i>
              Active Management Hub
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
              My <span className="text-indigo-600">Campaigns</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Oversee your deployed marketing sequences, track real-time engagement, and manage your active ad spend.
            </p>
          </div>

          {/* Status Switcher */}
          <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All', icon: 'fa-layer-group' },
              { id: 'pending', label: 'Pending', icon: 'fa-clock' },
              { id: 'active', label: 'Active', icon: 'fa-circle-check' },
              { id: 'rejected', label: 'Rejected', icon: 'fa-circle-xmark' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  statusFilter === tab.id 
                    ? 'bg-slate-900 text-white shadow-xl' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <i className={`fa-solid ${tab.icon} ${statusFilter === tab.id ? 'opacity-100' : 'opacity-40'}`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign List Area */}
        <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              Deployment List
            </h3>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Authorized Items: {filteredTasks.length}
            </div>
          </div>
          
          <div className="divide-y divide-slate-50">
            {filteredTasks.length === 0 ? (
              <div className="py-40 text-center animate-in fade-in duration-500 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-200">
                  <i className={`fa-solid ${statusFilter === 'pending' ? 'fa-hourglass-half' : 'fa-bullhorn'} text-5xl`}></i>
                </div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  No {statusFilter !== 'all' ? statusFilter : ''} Assets Found
                </h4>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 mb-8">
                  The registry is empty for this filter.
                </p>
                {onNavigate && (
                   <button 
                    onClick={() => onNavigate('create')}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                   >
                     Deploy New Campaign
                   </button>
                )}
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 hover:bg-slate-50/80 transition-all group animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border shadow-sm ${
                        task.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : task.status === 'rejected'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">UID: {task.id.toUpperCase()}</span>
                      <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">{task.type}</span>
                      {task.createdAt && (
                        <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                          <i className="fa-solid fa-clock"></i> Launched At: {task.createdAt}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-indigo-600 transition-colors truncate">{task.title}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                       <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                             <i className="fa-solid fa-signal"></i> Latest Submission Signal
                          </p>
                          <p className="text-[12px] font-black text-slate-900 font-mono">
                             {getLastSubmissionDate(task.id)}
                          </p>
                       </div>
                       
                       {task.dueDate && (
                          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                               <i className="fa-solid fa-calendar-xmark"></i> Deployment Expiry
                            </p>
                            <p className="text-[12px] font-black text-slate-900 font-mono">
                               {task.dueDate}
                            </p>
                          </div>
                       )}
                    </div>
                    
                    <div className="mt-6">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Progress Metrics</span>
                          <span className="text-[10px] font-black text-slate-900 tabular-nums">
                            {Math.round((task.completedCount / task.totalWorkers) * 100)}%
                          </span>
                       </div>
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full transition-all duration-1000 ${task.status === 'active' ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}
                          ></div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10 w-full lg:w-auto border-t lg:border-t-0 pt-8 lg:pt-0">
                    <div className="text-center px-4">
                      <p className="text-3xl font-black text-slate-900 tabular-nums leading-none mb-2">{task.completedCount}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Submissions</p>
                    </div>
                    <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>
                    <div className="text-center px-4">
                      <p className="text-3xl font-black text-slate-400 tabular-nums leading-none mb-2">{task.totalWorkers}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Goal</p>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      <button 
                        onClick={() => setEditingTask(task)}
                        className="w-12 h-12 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Edit Specs"
                      >
                        <i className="fa-solid fa-sliders"></i>
                      </button>
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="w-12 h-12 rounded-xl bg-white border border-slate-100 text-rose-300 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Terminate Asset"
                      >
                        <i className="fa-solid fa-ban"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RE-USING EDIT MODAL */}
        {editingTask && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Campaign Sync Hub</h3>
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Worker Cap</label>
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
                     Update Campaign Parameters
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns;
