
import React, { useState } from 'react';
import { Task, TaskType } from '../types';

interface TasksProps {
  tasks: Task[];
  onComplete: (taskId: string, timestamp?: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, onComplete }) => {
  const [categoryFilter, setCategoryFilter] = useState<TaskType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'active' | 'pending' | 'All'>('active');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const categories: (TaskType | 'All')[] = ['All', 'YouTube', 'Websites', 'Apps', 'Social Media'];
  const statuses = [
    { id: 'active', label: 'Live Gigs', icon: 'fa-bolt-lightning' },
    { id: 'pending', label: 'Pending Review', icon: 'fa-clock-rotate-left' },
    { id: 'All', label: 'Show All', icon: 'fa-layer-group' }
  ];

  const filteredTasks = tasks.filter(t => {
    const categoryMatch = categoryFilter === 'All' || t.type === categoryFilter;
    const statusMatch = statusFilter === 'All' || t.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  const getIcon = (type: TaskType) => {
    switch(type) {
      case 'YouTube': return 'fa-youtube text-red-600';
      case 'Websites': return 'fa-globe text-indigo-600';
      case 'Apps': return 'fa-mobile-screen text-emerald-600';
      case 'Social Media': return 'fa-share-nodes text-blue-600';
      default: return 'fa-tasks text-slate-600';
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsSubmittingProof(false);
    setIsUploading(false);
  };

  const handleFinalSubmit = () => {
    setIsUploading(true);
    const submissionTimestamp = new Date().toLocaleString();
    
    setTimeout(() => {
      if (selectedTask) {
        onComplete(selectedTask.id, submissionTimestamp);
      }
      handleCloseModal();
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Real-Time Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter">Gig <span className="text-indigo-600">Inventory</span></h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Browse verified micro-tasks. Switch to "Pending Review" to see campaigns currently undergoing platform verification.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2.5 p-1.5 bg-slate-100 rounded-[2rem] border border-slate-200">
            {categories.map(f => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  categoryFilter === f 
                    ? 'bg-white text-indigo-600 shadow-md scale-105' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Status Toggle */}
          <div className="flex gap-2.5 p-1.5 bg-indigo-50 rounded-2xl border border-indigo-100 self-end md:self-start">
            {statuses.map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s.id 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-indigo-400 hover:text-indigo-600'
                }`}
              >
                <i className={`fa-solid ${s.icon}`}></i>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200">
           <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
              <i className="fa-solid fa-wind text-4xl"></i>
           </div>
           <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">No results found</p>
           <p className="text-slate-300 text-sm mt-3 font-medium">Try adjusting your category or status filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map(task => (
            <div key={task.id} className="group relative bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100/10 transition-all duration-500 flex flex-col h-full overflow-hidden">
              
              {/* Category Icon & Reward Badge */}
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-indigo-50 transition-colors duration-500">
                  <i className={`fa-solid ${getIcon(task.type)}`}></i>
                </div>
                <div className="flex flex-col items-end">
                   <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-yellow-300 to-yellow-500 text-slate-900 px-6 py-3 rounded-2xl font-black text-2xl flex items-center shadow-[0_10px_20px_-5px_rgba(234,179,8,0.4)] border-b-4 border-yellow-700 active:translate-y-0.5 transition-transform">
                        <i className="fa-solid fa-coins mr-2.5 text-yellow-800"></i>
                        {task.reward}
                      </div>
                   </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 mr-1">REWARD COINS</span>
                </div>
              </div>

              {/* Task Content */}
              <div className="flex-grow relative z-10">
                <div className="flex items-center gap-2 mb-3">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {task.title}
                  </h3>
                  {task.status === 'pending' && (
                    <span className="flex-shrink-0 px-2 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black rounded uppercase tracking-widest border border-amber-200">
                      PENDING
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-3 mb-8">
                  {task.description}
                </p>
              </div>
              
              {/* Progress & Action */}
              <div className="mt-auto relative z-10 pt-6 border-t border-slate-50">
                 <div className="flex justify-between items-center text-[10px] font-black mb-3 uppercase tracking-widest">
                    <span className="text-slate-400">{task.completedCount} / {task.totalWorkers} Slots Taken</span>
                    <span className={task.completedCount/task.totalWorkers > 0.8 ? 'text-red-500' : 'text-emerald-500'}>
                       {task.status === 'pending' ? 'REVIEWING' : (task.completedCount/task.totalWorkers > 0.8 ? 'LIMIT NEAR' : 'AVAILABLE')}
                    </span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2.5 mb-8 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${task.status === 'pending' ? 'bg-amber-400' : (task.completedCount/task.totalWorkers > 0.8 ? 'bg-red-500' : 'bg-indigo-600')}`}
                      style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}
                    ></div>
                 </div>
                 <button 
                  onClick={() => setSelectedTask(task)}
                  disabled={task.status === 'pending'}
                  className={`w-full py-5 font-black rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 group/btn ${
                    task.status === 'pending' 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-100'
                  }`}
                 >
                  {task.status === 'pending' ? 'Under Review' : 'View Details & Start'}
                  {task.status !== 'pending' && <i className="fa-solid fa-arrow-right-long text-xs group-hover/btn:translate-x-1.5 transition-transform"></i>}
                 </button>
              </div>

              {/* Decorative Background Blob */}
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-100 transition-colors"></div>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl transition-all">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-12">
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 text-3xl shadow-inner">
                    <i className={`fa-solid ${getIcon(selectedTask.type).split(' ')[0]}`}></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">{selectedTask.title}</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[9px] font-black rounded-lg uppercase tracking-widest">{selectedTask.type} Category</span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Access</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              
              {!isSubmittingProof ? (
                <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
                  <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">Campaign Instructions</h4>
                    <p className="text-slate-700 text-base leading-relaxed font-medium">
                      {selectedTask.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                      <div className="relative z-10">
                        <div className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-2">You will earn</div>
                        <div className="text-4xl font-black tracking-tight">{selectedTask.reward} <span className="text-xs text-slate-500 uppercase ml-1">Coins</span></div>
                      </div>
                      <i className="fa-solid fa-coins absolute right-6 bottom-6 text-6xl text-white/5 group-hover:scale-125 transition-transform duration-700"></i>
                    </div>
                    <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 text-emerald-700 relative overflow-hidden group">
                      <div className="relative z-10">
                        <div className="text-[9px] font-black uppercase tracking-widest mb-2">Campaign Status</div>
                        <div className="text-4xl font-black tracking-tight">{selectedTask.status.toUpperCase()}</div>
                      </div>
                      <i className="fa-solid fa-circle-check absolute right-6 bottom-6 text-6xl text-emerald-500/10 group-hover:scale-125 transition-transform duration-700"></i>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <button 
                      onClick={() => setIsSubmittingProof(true)}
                      className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 transform active:scale-[0.98]"
                    >
                      Complete Task & Claim Reward
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">Escrow protection active for this campaign</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                  <div className="bg-yellow-50 p-8 rounded-[2.5rem] flex items-center gap-6 border border-yellow-100">
                    <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex-shrink-0 flex items-center justify-center text-yellow-800 text-xl shadow-lg shadow-yellow-200/50">
                      <i className="fa-solid fa-file-shield"></i>
                    </div>
                    <div>
                       <h5 className="font-black text-yellow-900 text-sm uppercase tracking-widest mb-1">Upload Verification</h5>
                       <p className="text-xs text-yellow-800 font-bold leading-relaxed opacity-80">
                         Please provide a clear screenshot of the completed action. Our automated verification system will process it instantly.
                       </p>
                    </div>
                  </div>

                  <div className="relative border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-indigo-100 transition-all cursor-pointer group">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:shadow-xl transition-all mb-6">
                      <i className="fa-solid fa-upload text-3xl"></i>
                    </div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Drop Screenshot Here</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PNG, JPG or JPEG (Max 5MB)</p>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      onClick={() => setIsSubmittingProof(false)}
                      className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                    >
                      Go Back
                    </button>
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={isUploading}
                      className={`flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl transition-all uppercase tracking-widest text-xs ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'}`}
                    >
                      {isUploading ? (
                        <span className="flex items-center justify-center gap-3">
                          <i className="fa-solid fa-circle-notch fa-spin"></i>
                          Verifying...
                        </span>
                      ) : 'Confirm Submission'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
