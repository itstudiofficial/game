
import React, { useState } from 'react';
import { Task, TaskType } from '../types';

interface TasksProps {
  tasks: Task[];
  onComplete: (taskId: string, timestamp?: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, onComplete }) => {
  const [categoryFilter, setCategoryFilter] = useState<TaskType | 'All' | 'Pending'>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const categories: {id: TaskType | 'All' | 'Pending', label: string, icon: string}[] = [
    { id: 'All', label: 'All Assets', icon: 'fa-layer-group' },
    { id: 'YouTube', label: 'Video Ops', icon: 'fa-youtube' },
    { id: 'Websites', label: 'Web Traffic', icon: 'fa-globe' },
    { id: 'Apps', label: 'App Installs', icon: 'fa-mobile-screen' },
    { id: 'Social Media', label: 'Social Reach', icon: 'fa-share-nodes' },
    { id: 'Pending', label: 'Pending Assets', icon: 'fa-clock-rotate-left' }
  ];

  const filteredTasks = tasks.filter(t => {
    if (categoryFilter === 'Pending') {
      return t.status === 'pending';
    }
    const categoryMatch = categoryFilter === 'All' || t.type === categoryFilter;
    return categoryMatch && t.status === 'active';
  });

  const getIcon = (type: TaskType) => {
    switch(type) {
      case 'YouTube': return 'fa-youtube text-red-500';
      case 'Websites': return 'fa-globe text-indigo-500';
      case 'Apps': return 'fa-mobile-screen text-emerald-500';
      case 'Social Media': return 'fa-hashtag text-blue-500';
      default: return 'fa-tasks text-slate-500';
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
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        
        {/* Market Header */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
              <span className="flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]"></span>
              </span>
              Real-time Task Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
              Active <span className="text-indigo-600">Inventory</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Monetize your digital engagement. Complete verified micro-tasks and scale your coin vault with guaranteed payouts.
            </p>
          </div>

          <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  categoryFilter === cat.id 
                    ? 'bg-slate-900 text-white shadow-xl' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <i className={`fa-solid ${cat.icon} ${categoryFilter === cat.id ? 'opacity-100' : 'opacity-40'}`}></i>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Grid */}
        {filteredTasks.length === 0 ? (
          <div className="py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-inner">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                <i className="fa-solid fa-box-open text-5xl"></i>
             </div>
             <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Active Deployments</h3>
             <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest mt-2">Check back later or change your category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTask(task)}
                className="group bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden relative"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-50 transition-colors">
                    <i className={`fa-solid ${getIcon(task.type)}`}></i>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                      {task.reward}
                    </div>
                    <div className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">Units Reward</div>
                  </div>
                </div>

                <div className="flex-grow mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-50 space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       Slots: <span className="text-slate-900">{task.completedCount} / {task.totalWorkers}</span>
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                      task.status === 'active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {task.status}
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                        task.status === 'active' ? 'bg-indigo-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}
                    ></div>
                  </div>
                  <button className={`w-full py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    task.status === 'active' ? 'bg-slate-900 group-hover:bg-indigo-600' : 'bg-slate-400 cursor-not-allowed'
                  }`}>
                    {task.status === 'active' ? 'Initialize Protocol' : 'Under Review'}
                  </button>
                </div>
                
                {/* Visual Flair */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Interaction Overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-10 md:p-16">
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white text-2xl shadow-xl">
                      <i className={`fa-solid ${getIcon(selectedTask.type).split(' ')[0]}`}></i>
                   </div>
                   <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{selectedTask.title}</h2>
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded-lg uppercase tracking-widest border border-indigo-100">
                            {selectedTask.type} Unit
                         </span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {selectedTask.id.toUpperCase()}</span>
                      </div>
                   </div>
                </div>
                <button onClick={handleCloseModal} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-slate-900 transition-colors">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              {!isSubmittingProof ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-50 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operational Instructions</h4>
                    <p className="text-slate-700 text-sm md:text-base font-bold leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 bg-slate-900 rounded-[2rem] text-white">
                        <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Asset Value</div>
                        <div className="text-3xl font-black">{selectedTask.reward} <span className="text-[10px] text-slate-500 uppercase">Coins</span></div>
                    </div>
                    <div className={`p-8 rounded-[2rem] border ${
                      selectedTask.status === 'active' ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'
                    }`}>
                        <div className={`text-[8px] font-black uppercase tracking-widest mb-1 ${
                          selectedTask.status === 'active' ? 'text-indigo-600' : 'text-amber-600'
                        }`}>Security Level</div>
                        <div className={`text-3xl font-black ${
                          selectedTask.status === 'active' ? 'text-indigo-900' : 'text-amber-900'
                        }`}>{selectedTask.status.toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href={selectedTask.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex-[2] py-6 text-white font-black rounded-3xl text-xs uppercase tracking-widest text-center shadow-2xl transition-all active:scale-95 ${
                        selectedTask.status === 'active' ? 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-400 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <i className="fa-solid fa-up-right-from-square mr-3"></i> Open Target Asset
                    </a>
                    <button 
                      onClick={() => setIsSubmittingProof(true)}
                      disabled={selectedTask.status !== 'active'}
                      className={`flex-1 py-6 font-black rounded-3xl text-xs uppercase tracking-widest transition-all ${
                        selectedTask.status === 'active' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Next Step
                    </button>
                  </div>
                  <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {selectedTask.status === 'active' ? 'You must complete the action before submitting proof' : 'This task is awaiting administrative activation'}
                  </p>
                </div>
              ) : (
                <div className="space-y-10 animate-in slide-in-from-right-12 duration-500">
                  <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 text-xl shadow-sm">
                      <i className="fa-solid fa-camera"></i>
                    </div>
                    <div>
                      <h5 className="font-black text-amber-900 text-xs uppercase tracking-widest mb-1">Verification Required</h5>
                      <p className="text-[11px] text-amber-800/70 font-bold leading-relaxed">
                        Upload a visual capture of your completed action for our AI validation gateway.
                      </p>
                    </div>
                  </div>

                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                    className={`relative border-4 border-dashed rounded-[3rem] p-16 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm border border-slate-50">
                      <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Drop Snapshot or Tap to Browse</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">PNG, JPG up to 10MB</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setIsSubmittingProof(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Back</button>
                    <button 
                      onClick={handleFinalSubmit} 
                      disabled={isUploading} 
                      className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Synchronizing...
                        </>
                      ) : (
                        <>Submit Proof of Work <i className="fa-solid fa-paper-plane"></i></>
                      )}
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
