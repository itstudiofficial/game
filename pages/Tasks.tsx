
import React, { useState, useRef, useMemo } from 'react';
import { Task, TaskType, User, Transaction } from '../types';

interface TasksProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  onComplete: (taskId: string, proofImage?: string, proofImage2?: string, timestamp?: string) => Promise<void> | void;
}

const Tasks: React.FC<TasksProps> = ({ user, tasks, transactions, onComplete }) => {
  const [activeView, setActiveView] = useState<'Marketplace' | 'My History'>('Marketplace');
  const [categoryFilter, setCategoryFilter] = useState<TaskType | 'All'>('All');
  const [historyFilter, setHistoryFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState<number | null>(null);
  const [proof1, setProof1] = useState<string | null>(null);
  const [proof2, setProof2] = useState<string | null>(null);
  const [viewingHistoryScreenshots, setViewingHistoryScreenshots] = useState<string[] | null>(null);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const marketCategories: {id: TaskType | 'All', label: string, icon: string}[] = [
    { id: 'All', label: 'All Tasks', icon: 'fa-layer-group' },
    { id: 'YouTube', label: 'Video Ops', icon: 'fa-youtube' },
    { id: 'Websites', label: 'Web Traffic', icon: 'fa-globe' },
    { id: 'Apps', label: 'App Installs', icon: 'fa-mobile-screen' },
    { id: 'Social Media', label: 'Social Reach', icon: 'fa-share-nodes' }
  ];

  const availableTasks = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const today = new Date().toISOString().split('T')[0];
    
    return safeTasks.filter(t => {
      if (!t) return false;
      const isSubmitted = user.completedTasks?.includes(t.id);
      if (isSubmitted) return false;
      if (t.dueDate && t.dueDate < today) return false;
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
        if (historyFilter === 'Rejected') return tx.status === 'failed';
        return tx.status === 'success';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, user.id, historyFilter]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280; 
        const MAX_HEIGHT = 2400; 
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
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to create canvas context'));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = objectUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(slot);
      try {
        const compressed = await compressImage(file);
        if (slot === 1) setProof1(compressed);
        else setProof2(compressed);
      } catch (error) {
        console.error("Compression error:", error);
        alert("Error processing file. Please ensure it is a valid image.");
      } finally {
        setIsCompressing(null);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!proof1 || !proof2) return alert("Please upload both required screenshots for verification.");
    if (!selectedTask) return;

    setIsUploading(true);
    try {
      await onComplete(selectedTask.id, proof1, proof2, new Date().toLocaleString());
      handleCloseModal();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Verification signal failed. Please retry.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsSubmittingProof(false);
    setIsUploading(false);
    setIsCompressing(null);
    setProof1(null);
    setProof2(null);
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
                Node Status: Active
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                {activeView === 'Marketplace' ? 'Task Marketplace' : 'My History'}
              </h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                {activeView === 'Marketplace' 
                  ? 'Identify micro-tasks to generate daily coin yield. Dual-proof verification required.' 
                  : 'Track your verification status and audit history.'}
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
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                   <button onClick={() => setHistoryFilter('Pending')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${historyFilter === 'Pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400'}`}>Pending</button>
                   <button onClick={() => setHistoryFilter('Approved')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${historyFilter === 'Approved' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>Approved</button>
                   <button onClick={() => setHistoryFilter('Rejected')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${historyFilter === 'Rejected' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}>Rejected</button>
                </div>
             )}
          </div>
        </div>

        {activeView === 'Marketplace' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-700">
            {availableTasks.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
                <i className="fa-solid fa-box-open text-6xl text-slate-100 mb-6"></i>
                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Active Tasks</h3>
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
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">{task.type}</span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                    <p className="text-slate-400 text-xs font-medium line-clamp-2">{task.description}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 relative z-10">
                    <div className="flex justify-between items-center mb-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                       <span>Progress</span>
                       <span>{Math.floor((task.completedCount / task.totalWorkers) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                       <div className="h-full bg-indigo-600" style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}></div>
                    </div>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 transition-all">
                      View Task Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-700">
             {userHistoryItems.length === 0 ? (
               <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
                  <i className="fa-solid fa-receipt text-6xl text-slate-100 mb-6"></i>
                  <p className="text-xl font-black text-slate-300 uppercase tracking-widest">No Records Found</p>
               </div>
             ) : (
               userHistoryItems.map(tx => (
                 <div key={tx.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <i className={`fa-solid ${getIcon(tx.method || '')}`}></i>
                       </div>
                       <div className={`px-4 py-1.5 text-[8px] font-black rounded-lg uppercase tracking-widest border transition-all ${
                         tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                         tx.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                         'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                       }`}>
                          {tx.status === 'failed' ? 'rejected' : tx.status}
                       </div>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{tx.method?.split('|')[0] || 'Task'}</h3>
                       <div className="flex items-center justify-between mt-6">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield</p>
                             <div className="text-3xl font-black text-slate-900">+{tx.amount}</div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                             <div className="text-xs font-bold text-slate-500 uppercase">{tx.date.split(',')[0]}</div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {tx.id.substring(0, 8)}</span>
                       <div className="flex gap-4">
                          {(tx.proofImage || tx.proofImage2) && (
                              <button 
                                onClick={() => {
                                  const list = [];
                                  if (tx.proofImage) list.push(tx.proofImage);
                                  if (tx.proofImage2) list.push(tx.proofImage2);
                                  setViewingHistoryScreenshots(list);
                                }}
                                className="text-indigo-500 hover:text-indigo-700 font-black text-[9px] uppercase tracking-widest flex items-center gap-2"
                              >
                                <i className="fa-solid fa-camera"></i> View Proofs
                              </button>
                          )}
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] w-full max-w-5xl shadow-3xl border border-white/20 animate-in zoom-in-95 duration-500 relative max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="p-6 md:p-12">
              <div className="flex justify-between items-start mb-10 sticky top-0 bg-white z-20 py-2">
                <div className="flex items-center gap-4 md:gap-6">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-[1rem] md:rounded-[1.75rem] flex items-center justify-center text-white text-xl md:text-2xl shadow-xl">
                      <i className={`fa-solid ${getIcon(selectedTask.type).split(' ')[0]}`}></i>
                   </div>
                   <div className="min-w-0">
                      <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-1">{selectedTask.title}</h2>
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded-lg uppercase tracking-widest border border-indigo-100">{selectedTask.type}</span>
                      </div>
                   </div>
                </div>
                <button onClick={handleCloseModal} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl flex items-center justify-center hover:text-slate-900 transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              {!isSubmittingProof ? (
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-50 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Instructions</h4>
                    <p className="text-slate-700 text-sm md:text-lg font-bold leading-relaxed whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-8">
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                        <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Reward</div>
                        <div className="text-2xl md:text-4xl font-black">{selectedTask.reward} <span className="text-[10px] text-slate-500 uppercase">Coins</span></div>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                        <div className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-1">Status</div>
                        <div className="text-2xl md:text-4xl font-black text-indigo-900">{selectedTask.status.toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href={selectedTask.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-[2] py-6 bg-indigo-600 text-white font-black rounded-3xl text-[10px] md:text-xs uppercase tracking-[0.3em] text-center shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      <i className="fa-solid fa-up-right-from-square mr-3"></i> Visit Target Link
                    </a>
                    <button 
                      onClick={() => setIsSubmittingProof(true)}
                      className="flex-1 py-6 bg-slate-900 text-white font-black rounded-3xl text-[10px] md:text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transition-all"
                    >
                      Continue to Proof
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-10 animate-in slide-in-from-right-12 duration-500">
                  <div className="bg-amber-50 p-6 md:p-8 rounded-[2.5rem] border border-amber-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 text-2xl shadow-sm shrink-0">
                      <i className="fa-solid fa-camera-retro"></i>
                    </div>
                    <div>
                      <h5 className="font-black text-amber-900 text-sm md:text-base uppercase tracking-widest mb-1">Dual-Proof Protocol</h5>
                      <p className="text-[10px] md:text-[11px] text-amber-800/70 font-bold leading-relaxed max-w-2xl">
                        Submit two high-resolution screenshots verifying completion. 
                        Use the buttons below to select images for each slot. Clear mobile captures preferred.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                     {/* Proof 1 Slot */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-center px-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Proof</label>
                           {proof1 && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><i className="fa-solid fa-circle-check"></i> Loaded</span>}
                        </div>
                        <div className="relative group h-[300px] md:h-[450px] w-full">
                           <div className={`w-full h-full border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all overflow-hidden bg-slate-50 ${
                             proof1 ? 'border-emerald-500' : 'border-slate-200'
                           }`}>
                              {isCompressing === 1 ? (
                                <div className="flex flex-col items-center gap-4">
                                   <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500"></i>
                                   <span className="text-[10px] font-black text-slate-400 uppercase">Processing...</span>
                                </div>
                              ) : proof1 ? (
                                <div className="relative w-full h-full">
                                   <img src={proof1} className="w-full h-full object-cover" alt="Proof 1" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                      <button onClick={() => fileInputRef1.current?.click()} className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                         <i className="fa-solid fa-rotate"></i>
                                      </button>
                                      <button onClick={() => setProof1(null)} className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                         <i className="fa-solid fa-trash"></i>
                                      </button>
                                   </div>
                                </div>
                              ) : (
                                <div className="text-center p-8">
                                  <i className="fa-solid fa-image text-5xl text-slate-200 mb-6 block"></i>
                                  <button 
                                    onClick={() => fileInputRef1.current?.click()}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
                                  >
                                     <i className="fa-solid fa-file-arrow-up"></i>
                                     Choose Screenshot 1
                                  </button>
                                </div>
                              )}
                              <input type="file" ref={fileInputRef1} onChange={(e) => handleFileChange(e, 1)} className="hidden" accept="image/*" />
                           </div>
                        </div>
                     </div>

                     {/* Proof 2 Slot */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-center px-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secondary Proof</label>
                           {proof2 && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><i className="fa-solid fa-circle-check"></i> Loaded</span>}
                        </div>
                        <div className="relative group h-[300px] md:h-[450px] w-full">
                           <div className={`w-full h-full border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all overflow-hidden bg-slate-50 ${
                             proof2 ? 'border-emerald-500' : 'border-slate-200'
                           }`}>
                              {isCompressing === 2 ? (
                                <div className="flex flex-col items-center gap-4">
                                   <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500"></i>
                                   <span className="text-[10px] font-black text-slate-400 uppercase">Processing...</span>
                                </div>
                              ) : proof2 ? (
                                <div className="relative w-full h-full">
                                   <img src={proof2} className="w-full h-full object-cover" alt="Proof 2" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                      <button onClick={() => fileInputRef2.current?.click()} className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                         <i className="fa-solid fa-rotate"></i>
                                      </button>
                                      <button onClick={() => setProof2(null)} className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                         <i className="fa-solid fa-trash"></i>
                                      </button>
                                   </div>
                                </div>
                              ) : (
                                <div className="text-center p-8">
                                  <i className="fa-solid fa-image text-5xl text-slate-200 mb-6 block"></i>
                                  <button 
                                    onClick={() => fileInputRef2.current?.click()}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
                                  >
                                     <i className="fa-solid fa-file-arrow-up"></i>
                                     Choose Screenshot 2
                                  </button>
                                </div>
                              )}
                              <input type="file" ref={fileInputRef2} onChange={(e) => handleFileChange(e, 2)} className="hidden" accept="image/*" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 pt-8 border-t border-slate-100">
                    <button 
                      onClick={() => setIsSubmittingProof(false)} 
                      className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Back to Specs
                    </button>
                    <button 
                      onClick={handleFinalSubmit} 
                      disabled={isUploading || isCompressing !== null || !proof1 || !proof2} 
                      className={`flex-[2] py-6 text-white font-black rounded-3xl text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 ${
                        proof1 && proof2 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Deploying Identity Signal...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane"></i>
                          Initialize Global Audit
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL SCREENSHOT VIEWER (SUPPORT FOR MULTIPLE) */}
      {viewingHistoryScreenshots && (
        <div 
          className="fixed inset-0 z-[2000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setViewingHistoryScreenshots(null)}
        >
           <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-h-full pointer-events-auto overflow-y-auto no-scrollbar py-12">
                 {viewingHistoryScreenshots.map((src, i) => (
                    <div key={i} className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 bg-white/5 p-2 md:p-4">
                       <p className="absolute top-4 left-4 md:top-8 md:left-8 z-10 px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-[8px] md:text-[9px] font-black uppercase text-white border border-white/10">PROOF {i+1}</p>
                       <img src={src} alt={`Proof ${i+1}`} className="w-full h-auto object-contain rounded-[1.5rem] md:rounded-[2rem]" />
                    </div>
                 ))}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setViewingHistoryScreenshots(null); }} 
                className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-xl border border-white/20 pointer-events-auto"
              >
                <i className="fa-solid fa-xmark text-xl md:text-2xl"></i>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
