
import React, { useState } from 'react';
import { User, Task } from '../types';

interface MyCampaignsProps {
  user: User;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
}

const MyCampaigns: React.FC<MyCampaignsProps> = ({ user, tasks, onDeleteTask, onUpdateTask }) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active'>('all');
  
  const userTasks = tasks.filter(t => user.createdTasks.includes(t.id));
  
  const filteredTasks = userTasks.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onUpdateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        totalWorkers: editingTask.totalWorkers
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
              Oversee your deployed marketing sequences and track engagement progress in real-time.
            </p>
          </div>

          {/* High-End Status Switcher */}
          <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm">
            {[
              { id: 'all', label: 'All Campaigns', icon: 'fa-layer-group' },
              { id: 'pending', label: 'Pending Review', icon: 'fa-clock' },
              { id: 'active', label: 'Approved & Active', icon: 'fa-circle-check' }
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
        <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              Inventory: <span className="text-indigo-600">{statusFilter.toUpperCase()}</span>
            </h3>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Total: {filteredTasks.length}
            </div>
          </div>
          
          <div className="divide-y divide-slate-50">
            {filteredTasks.length === 0 ? (
              <div className="py-40 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <i className={`fa-solid ${statusFilter === 'pending' ? 'fa-hourglass-half' : 'fa-bullhorn'} text-5xl`}></i>
                </div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  No {statusFilter !== 'all' ? statusFilter : ''} Campaigns Found
                </h4>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">
                  Launch a new sequence to see it here.
                </p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 hover:bg-slate-50/80 transition-all group animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border shadow-sm ${
                        task.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20' 
                          : 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20'
                      }`}>
                        {task.status === 'active' ? 'APPROVED & ACTIVE' : 'PENDING REVIEW'}
                      </span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">UID: {task.id.toUpperCase()}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                    <p className="text-sm text-slate-500 font-medium line-clamp-1 max-w-2xl">{task.description}</p>
                    
                    {task.status === 'pending' && (
                       <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-amber-600/60 uppercase tracking-widest">
                          <i className="fa-solid fa-circle-info"></i>
                          Our team is currently verifying your campaign target and reward escrow.
                       </div>
                    )}
                  </div>

                  <div className="flex items-center gap-12 w-full lg:w-auto border-t lg:border-t-0 pt-8 lg:pt-0">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900 tabular-nums">{task.completedCount} / {task.totalWorkers}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Quota Progress</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setEditingTask(task)}
                        className="w-14 h-14 rounded-2xl bg-white border border-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Edit Campaign"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="w-14 h-14 rounded-2xl bg-white border border-slate-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Delete Campaign"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Support Callout */}
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
           <div className="relative z-10">
              <h4 className="text-xl font-black mb-2 tracking-tight">Need higher limits?</h4>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Contact our account managers for Enterprise bulk campaign pricing.</p>
           </div>
           <button className="relative z-10 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
              Contact Support
           </button>
           <i className="fa-solid fa-headset absolute -right-10 -bottom-10 text-9xl text-white/5 -rotate-12"></i>
        </div>
      </div>

      {editingTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200/50">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Edit Deployment Specs</h3>
                 <button onClick={() => setEditingTask(null)} className="w-10 h-10 bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                   <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-10 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Campaign Title</label>
                    <input 
                      type="text" 
                      value={editingTask.title} 
                      onChange={e => setEditingTask({...editingTask, title: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Target Worker Quota</label>
                    <input 
                      type="number" 
                      value={editingTask.totalWorkers} 
                      onChange={e => setEditingTask({...editingTask, totalWorkers: parseInt(e.target.value)})} 
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl font-bold text-slate-800 outline-none shadow-inner" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Operational Instructions</label>
                    <textarea 
                      rows={4} 
                      value={editingTask.description} 
                      onChange={e => setEditingTask({...editingTask, description: e.target.value})} 
                      className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2rem] font-bold text-slate-800 outline-none shadow-inner resize-none leading-relaxed" 
                    />
                 </div>
                 <button 
                  type="submit" 
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95"
                 >
                   Sync Changes to Hub
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyCampaigns;
