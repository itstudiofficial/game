
import React, { useState, useRef } from 'react';
import { Task, TaskType, User } from '../types';

interface TasksProps {
  user: User;
  tasks: Task[];
  onComplete: (taskId: string, proofImage?: string, timestamp?: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ user, tasks, onComplete }) => {
  const [categoryFilter, setCategoryFilter] = useState<TaskType | 'All' | 'Pending' | 'Completed' | 'Rejected'>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: {id: TaskType | 'All' | 'Pending' | 'Completed' | 'Rejected', label: string, icon: string}[] = [
    { id: 'All', label: 'All Tasks', icon: 'fa-layer-group' },
    { id: 'YouTube', label: 'Video Ops', icon: 'fa-youtube' },
    { id: 'Websites', label: 'Web Traffic', icon: 'fa-globe' },
    { id: 'Apps', label: 'App Installs', icon: 'fa-mobile-screen' },
    { id: 'Social Media', label: 'Social Reach', icon: 'fa-share-nodes' },
    { id: 'Pending', label: 'Pending Audit', icon: 'fa-clock-rotate-left' },
    { id: 'Completed', label: 'Completed', icon: 'fa-check-double' }
  ];

  const filteredTasks = tasks.filter(t => {
    const isSubmitted = user.completedTasks?.includes(t.id);
    
    // Logic for Pending Filter: Show tasks user has submitted
    if (categoryFilter === 'Pending') {
      return isSubmitted && t.status !== 'completed';
    }
    
    // Logic for Completed Filter: Show tasks user has successfully finished (global task status completed)
    if (categoryFilter === 'Completed') {
      return isSubmitted && t.status === 'completed';
    }
    
    // Default Logic: Hide already submitted tasks from the general browsing pool
    if (isSubmitted) return false;

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
    setPreviewImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = () => {
    if (!previewImage) {
      alert("Please upload a screenshot proof first.");
      return;
    }
    setIsUploading(true);
    const submissionTimestamp = new Date().toLocaleString();
    
    setTimeout(() => {
      if (selectedTask) {
        onComplete(selectedTask.id, previewImage, submissionTimestamp);
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
              {categoryFilter === 'Pending' ? 'My Audits' : 'Active Tasks'}
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              {categoryFilter === 'Pending' 
                ? 'Review your submitted tasks that are currently undergoing manual verification.' 
                : 'Monetize your digital engagement. Complete verified micro-tasks and scale your coin vault.'}
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
             <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No {categoryFilter} Assets Found</h3>
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
                {/* Visual Flair Background */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700"></div>

                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-xl group-hover:bg-indigo-50 transition-colors border border-slate-100">
                    <i className={`fa-solid ${getIcon(task.type)}`}></i>
                  </div>
                  
                  {/* High Visibility Reward Module */}
                  <div className="flex flex-col items-end">
                    <div className="px-5 py-3 bg-slate-900 rounded-[1.25rem] shadow-xl group-hover:bg-indigo-600 transition-all group-hover:scale-110 duration-500 flex items-center gap-3 border border-slate-800 group-hover:border-indigo-500">
                      <i className="fa-solid fa-coins text-yellow-400 text-xs animate-pulse"></i>
                      <span className="text-xl font-black text-white tabular-nums tracking-tighter">
                        {task.reward}
                      </span>
                    </div>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 mr-1">Unit Value</span>
                  </div>
                </div>

                <div className="flex-grow mb-8 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100">
                      {task.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-50 space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       Fleet: <span className="text-slate-900">{task.completedCount} / {task.totalWorkers}</span>
                    </div>
                    <div className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm ${
                      task.status === 'active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                      task.status === 'completed' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {task.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 shadow-sm ${
                        task.status === 'active' ? 'bg-indigo-600' : 
                        task.status === 'completed' ? 'bg-emerald-500' :
                        'bg-amber-500'
                      }`}
                      style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}
                    ></div>
                  </div>
                  <button className={`w-full py-5 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                    task.status === 'active' ? 'bg-slate-900 group-hover:bg-indigo-600 shadow-slate-200 group-hover:shadow-indigo-200' : 'bg-slate-400 cursor-not-allowed'
                  }`}>
                    {user.completedTasks?.includes(task.id) ? 'Audit In Progress' : 'Execute Task'} <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Interaction Overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] w-full max-w-2xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500 my-auto">
            <div className="p-6 md:p-16">
              <div className="flex justify-between items-start mb-8 md:mb-12">
                <div className="flex items-center gap-4 md:gap-6">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-[1.25rem] md:rounded-[1.75rem] flex items-center justify-center text-white text-xl md:text-2xl shadow-xl shrink-0">
                      <i className={`fa-solid ${getIcon(selectedTask.type).split(' ')[0]}`}></i>
                   </div>
                   <div>
                      <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 line-clamp-1">{selectedTask.title}</h2>
                      <div className="flex items-center gap-2 md:gap-3">
                         <span className="px-2 py-0.5 md:px-3 md:py-1 bg-indigo-50 text-indigo-600 text-[7px] md:text-[8px] font-black rounded-lg uppercase tracking-widest border border-indigo-100">
                            {selectedTask.type} Unit
                         </span>
                         <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {selectedTask.id.toUpperCase()}</span>
                      </div>
                   </div>
                </div>
                <button onClick={handleCloseModal} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl flex items-center justify-center hover:text-slate-900 transition-colors shrink-0">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              {!isSubmittingProof ? (
                <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-50 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-inner">
                    <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Operational Instructions</h4>
                    <p className="text-slate-700 text-sm md:text-base font-bold leading-relaxed whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="p-5 md:p-8 bg-slate-900 rounded-[1.75rem] md:rounded-[2rem] text-white">
                        <div className="text-[7px] md:text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Asset Value</div>
                        <div className="text-xl md:text-3xl font-black">{selectedTask.reward} <span className="text-[8px] md:text-[10px] text-slate-500 uppercase">Coins</span></div>
                    </div>
                    <div className={`p-5 md:p-8 rounded-[1.75rem] md:rounded-[2rem] border ${
                      selectedTask.status === 'active' ? 'bg-indigo-50 border-indigo-100' : 
                      selectedTask.status === 'completed' ? 'bg-emerald-50 border-emerald-100' :
                      'bg-amber-50 border-amber-100'
                    }`}>
                        <div className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest mb-1 ${
                          selectedTask.status === 'active' ? 'text-indigo-600' : 
                          selectedTask.status === 'completed' ? 'text-emerald-600' :
                          'text-amber-600'
                        }`}>Security Level</div>
                        <div className={`text-xl md:text-3xl font-black ${
                          selectedTask.status === 'active' ? 'text-indigo-900' : 
                          selectedTask.status === 'completed' ? 'text-emerald-900' :
                          'text-amber-900'
                        }`}>{selectedTask.status.toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href={selectedTask.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex-[2] py-5 md:py-6 text-white font-black rounded-2xl md:rounded-3xl text-[10px] md:text-xs uppercase tracking-widest text-center shadow-2xl transition-all active:scale-95 ${
                        selectedTask.status === 'active' ? 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-400 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <i className="fa-solid fa-up-right-from-square mr-2 md:mr-3"></i> Open Target Asset
                    </a>
                    <button 
                      onClick={() => setIsSubmittingProof(true)}
                      disabled={selectedTask.status !== 'active' || user.completedTasks?.includes(selectedTask.id)}
                      className={`flex-1 py-5 md:py-6 font-black rounded-2xl md:rounded-3xl text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                        selectedTask.status === 'active' && !user.completedTasks?.includes(selectedTask.id) ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {user.completedTasks?.includes(selectedTask.id) ? 'Already Submitted' : 'Start Verification'}
                    </button>
                  </div>
                  <p className="text-center text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {selectedTask.status === 'active' ? 'You must complete the action before submitting proof' : 'This task entry is archived.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-10 animate-in slide-in-from-right-12 duration-500">
                  <div className="bg-amber-50 p-5 md:p-8 rounded-[1.75rem] md:rounded-[2.5rem] border border-amber-100 flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-amber-500 text-xl shadow-sm shrink-0">
                      <i className="fa-solid fa-camera"></i>
                    </div>
                    <div>
                      <h5 className="font-black text-amber-900 text-[10px] md:text-xs uppercase tracking-widest mb-1">Verification Required</h5>
                      <p className="text-[10px] md:text-[11px] text-amber-800/70 font-bold leading-relaxed">
                        Upload a visual capture of your completed action for validation.
                      </p>
                    </div>
                  </div>

                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { 
                      e.preventDefault(); 
                      setDragActive(false); 
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setPreviewImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 md:border-4 border-dashed rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden min-h-[220px] md:min-h-[300px] ${
                      dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    {previewImage ? (
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
                        <img src={previewImage} alt="Proof Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                            className="bg-white text-red-500 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl"
                          >
                            Remove Snapshot
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center text-slate-300 mb-4 md:mb-6 shadow-sm border border-slate-50">
                          <i className="fa-solid fa-cloud-arrow-up text-2xl md:text-3xl"></i>
                        </div>
                        <p className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest text-center">Drop Snapshot or Tap to Browse</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <button 
                      onClick={() => setIsSubmittingProof(false)} 
                      className="order-2 sm:order-1 flex-1 py-5 md:py-6 bg-slate-100 text-slate-500 font-black rounded-2xl md:rounded-3xl text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleFinalSubmit} 
                      disabled={isUploading || !previewImage} 
                      className={`order-1 sm:order-2 flex-[2] py-5 md:py-6 text-white font-black rounded-2xl md:rounded-3xl text-[10px] md:text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 disabled:opacity-50 ${
                        previewImage ? 'bg-slate-900 hover:bg-indigo-600' : 'bg-slate-300 cursor-not-allowed'
                      }`}
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
