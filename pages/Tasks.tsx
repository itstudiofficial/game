
import React, { useState, useRef, useMemo } from 'react';
import { Task, TaskType, User, Transaction } from '../types';

interface TasksProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  onComplete: (taskId: string, proofImage?: string, timestamp?: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ user, tasks, transactions, onComplete }) => {
  const [activeView, setActiveView] = useState<'Marketplace' | 'My History'>('Marketplace');
  const [categoryFilter, setCategoryFilter] = useState<TaskType | 'All'>('All');
  const [historyFilter, setHistoryFilter] = useState<'Pending' | 'Approved'>('Pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const marketCategories: {id: TaskType | 'All', label: string, icon: string}[] = [
    { id: 'All', label: 'All Tasks', icon: 'fa-layer-group' },
    { id: 'YouTube', label: 'Video Ops', icon: 'fa-youtube' },
    { id: 'Websites', label: 'Web Traffic', icon: 'fa-globe' },
    { id: 'Apps', label: 'App Installs', icon: 'fa-mobile-screen' },
    { id: 'Social Media', label: 'Social Reach', icon: 'fa-share-nodes' }
  ];

  const availableTasks = useMemo(() => {
    // Defensive check to ensure tasks is an array
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    
    return safeTasks.filter(t => {
      if (!t) return false;
      const isSubmitted = user.completedTasks?.includes(t.id);
      if (isSubmitted) return false;
      const categoryMatch = categoryFilter === 'All' || t.type === categoryFilter;
      return categoryMatch && t.status === 'active';
    });
  }, [tasks, user.completedTasks, categoryFilter]);

  const userHistoryItems = useMemo(() => {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    
    return safeTransactions
      .filter(tx => tx && tx.type === 'earn' && tx.userId === user.id)
      .filter(tx => {
        if (historyFilter === 'Pending') return tx.status === 'pending';
        return tx.status === 'success';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, user.id, historyFilter]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(base64Str);
        }
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert("File size exceeds 25MB. Please choose a smaller image.");
        return;
      }
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setPreviewImage(compressed);
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = () => {
    if (!previewImage) return alert("Please upload a screenshot proof first.");
    setIsUploading(true);
    setTimeout(() => {
      if (selectedTask) onComplete(selectedTask.id, previewImage, new Date().toLocaleString());
      handleCloseModal();
    }, 2000);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsSubmittingProof(false);
    setIsUploading(false);
    setIsCompressing(false);
    setPreviewImage(null);
  };

  const getIcon = (type: string) => {
    if (type.includes('YouTube')) return 'fa-youtube text-red-500';
    if (type.includes('Websites')) return 'fa-globe text-indigo-500';
    if (type.includes('Apps')) return 'fa-mobile-screen text-emerald-500';
    if (type.includes('Social Media')) return 'fa-hashtag text-blue-500';
    return 'fa-tasks text-slate-500';
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-slate-200 pb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
                Operational Node: Verified
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                {activeView === 'Marketplace' ? 'Task Marketplace' : 'Audit Protocol'}
              </h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                {activeView === 'Marketplace' 
                  ? 'Discover and execute high-precision micro-tasks to generate daily coin yield.' 
                  : 'Track your verification status and audit history of submitted engagement assets.'}
              </p>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
               <button 
                onClick={() => setActiveView('Marketplace')}
                className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeView === 'Marketplace' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Marketplace
               </button>
               <button 
                onClick={() => setActiveView('My History')}
                className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeView === 'My History' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 My History
               </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
             {activeView === 'Marketplace' ? (
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                  {marketCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        categoryFilter === cat.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <i className={`fa-solid ${cat.icon} text-xs ${categoryFilter === cat.id ? 'opacity-100' : 'opacity-40'}`}></i>
                      {cat.label}
                    </button>
                  ))}
                </div>
             ) : (
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                   <button onClick={() => setHistoryFilter('Pending')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyFilter === 'Pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400'}`}>Pending Audits</button>
                   <button onClick={() => setHistoryFilter('Approved')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyFilter === 'Approved' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>Verified Success</button>
                </div>
             )}
          </div>
        </div>

        {activeView === 'Marketplace' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-700">
            {availableTasks.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
                <i className="fa-solid fa-box-open text-6xl text-slate-100 mb-6"></i>
                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Active Assets in {categoryFilter}</h3>
              </div>
            ) : (
              availableTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  className="group bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <i className={`fa-solid ${getIcon(task.type)}`}></i>
                    </div>
                    <div className="px-5 py-3 bg-slate-900 rounded-[1.25rem] text-white flex items-center gap-3">
                      <i className="fa-solid fa-coins text-yellow-400"></i>
                      <span className="text-xl font-black">{task.reward}</span>
                    </div>
                  </div>
                  <div className="flex-grow mb-8 relative z-10">
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">{task.type} Unit</span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                    <p className="text-slate-400 text-xs font-medium line-clamp-2">{task.description}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 relative z-10">
                    <div className="flex justify-between items-center mb-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                       <span>Quota Fullness</span>
                       <span>{Math.floor((task.completedCount / task.totalWorkers) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                       <div className="h-full bg-indigo-600" style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}></div>
                    </div>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 transition-all">
                      Execute Task
                    </button>
                  </div>
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-700">
             {userHistoryItems.length === 0 ? (
               <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
                  <i className="fa-solid fa-receipt text-6xl text-slate-100 mb-6"></i>
                  <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No {historyFilter} Records Found</h3>
               </div>
             ) : (
               userHistoryItems.map(tx => (
                 <div key={tx.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <i className={`fa-solid ${getIcon(tx.method || '')}`}></i>
                       </div>
                       <div className={`px-4 py-1.5 text-[8px] font-black rounded-lg uppercase tracking-widest border transition-all ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'}`}>
                          {tx.status === 'success' ? 'Verified Success' : 'Audit In-Progress'}
                       </div>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{tx.method?.split('|')[0] || 'Unknown Task'}</h3>
                       <div className="flex items-center justify-between mt-6">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credited Coins</p>
                             <div className="text-3xl font-black text-slate-900">+{tx.amount.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</p>
                             <div className="text-xs font-bold text-slate-500 uppercase">{tx.date.split(',')[0]}</div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ref: {tx.id.toUpperCase()}</span>
                       {tx.proofImage && (
                          <div className="flex items-center gap-2 text-indigo-500">
                             <i className="fa-solid fa-camera text-xs"></i>
                             <span className="text-[9px] font-black uppercase tracking-widest">Snapshot Saved</span>
                          </div>
                       )}
                    </div>
                 </div>
               ))
             )}
          </div>
        )}
      </div>

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
                    onClick={() => !isCompressing && fileInputRef.current?.click()}
                    className={`relative border-2 md:border-4 border-dashed rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[220px] md:min-h-[300px] ${
                      previewImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    } ${isCompressing ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    
                    {isCompressing ? (
                      <div className="flex flex-col items-center gap-4">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl md:text-4xl text-indigo-500"></i>
                        <p className="text-[10px] md:text-xs font-black text-indigo-900 uppercase tracking-widest text-center">Optimizing High-Res Asset...</p>
                      </div>
                    ) : previewImage ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img src={previewImage} alt="Proof" className="w-full h-full object-cover rounded-[1.75rem] md:rounded-[2.75rem]" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                            className="bg-white text-red-500 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-10px] uppercase tracking-widest shadow-xl"
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
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 text-center">Mobiles: Up to 25MB (Auto-compressed)</p>
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
                      disabled={isUploading || isCompressing || !previewImage} 
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
