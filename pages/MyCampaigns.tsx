
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
  const userTasks = tasks.filter(t => user.createdTasks.includes(t.id));

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

        <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Campaign Inventory</h3>
          </div>
          
          <div className="divide-y divide-slate-50">
            {userTasks.length === 0 ? (
              <div className="py-40 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <i className="fa-solid fa-bullhorn text-5xl"></i>
                </div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Active Campaigns</h4>
              </div>
            ) : (
              userTasks.map(task => (
                <div key={task.id} className="p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 hover:bg-slate-50 transition-all group">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`px-2 py-1 text-[7px] font-black rounded uppercase tracking-widest border ${
                        task.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>{task.status}</span>
                      <span className="text-[9px] font-black text-slate-300 uppercase">ID: {task.id}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{task.title}</h4>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">{task.description}</p>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">{task.completedCount} / {task.totalWorkers}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Slots Used</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setEditingTask(task)}
                        className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="w-12 h-12 rounded-xl bg-slate-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
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
      </div>

      {editingTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Edit Campaign</h3>
                 <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-900"><i className="fa-solid fa-xmark text-2xl"></i></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Campaign Title</label>
                    <input type="text" value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-800" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Worker Quota</label>
                    <input type="number" value={editingTask.totalWorkers} onChange={e => setEditingTask({...editingTask, totalWorkers: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-800" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Instructions</label>
                    <textarea rows={4} value={editingTask.description} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-800 resize-none" />
                 </div>
                 <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all">Update Sequence</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyCampaigns;
