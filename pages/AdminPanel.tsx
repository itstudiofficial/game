
import React, { useState, useEffect } from 'react';
import { User, Task, Transaction, TaskType } from '../types';
import { storage } from '../services/storage';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<'overview' | 'users' | 'history' | 'tasks' | 'finance' | 'reviews'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

  const MASTER_ADMIN_EMAIL = 'ehtesham@gmail.com';

  const fetchData = async () => {
    setLoading(true);
    try {
      const u = await storage.getAllUsers();
      const uniqueUsers = Array.from(new Map(u.map(user => [user.id, user])).values());
      const t = await storage.getAllGlobalTransactions();
      const tasksData = storage.getTasks();
      
      setUsers(uniqueUsers);
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

  const totalCoinsInCirculation = users.reduce((acc, u) => acc + (u.coins || 0), 0);
  const totalDepositBalance = users.reduce((acc, u) => acc + (u.depositBalance || 0), 0);
  const pendingAudits = transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length;

  const handleAuditSubmission = async (tx: Transaction, status: 'success' | 'failed') => {
    try {
      await storage.updateGlobalTransaction(tx.id, { status });
      if (status === 'success') {
        const targetUser = users.find(u => u.id === tx.userId);
        if (targetUser) {
          const newCoins = (targetUser.coins || 0) + tx.amount;
          await storage.updateUserInCloud(tx.userId, { coins: newCoins });
          alert(`Submission Approved. ${tx.amount} coins credited.`);
        }
      }
      await fetchData();
    } catch (err) {
      console.error("Audit update failed", err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black uppercase tracking-[0.3em] text-slate-400">Syncing Admin Hub...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-medium">
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-500/20">
                <i className="fa-solid fa-user-shield"></i>
             </div>
             <div>
                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Command <span className="text-indigo-400">Center</span></h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-3">Active Session: Admin Root</p>
             </div>
          </div>

          <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/10 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
              { id: 'users', label: 'Users', icon: 'fa-users' },
              { id: 'reviews', label: 'Reviews', icon: 'fa-camera-retro' },
              { id: 'tasks', label: 'Tasks', icon: 'fa-list-check' },
              { id: 'finance', label: 'Finance', icon: 'fa-wallet' },
              { id: 'history', label: 'Logs', icon: 'fa-clock' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id as any)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${view === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {view === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-in fade-in duration-700">
             {[
               { label: 'Active Network Nodes', val: users.length, color: 'bg-indigo-600' },
               { label: 'Verification Queue', val: pendingAudits, color: 'bg-rose-600' },
               { label: 'Campaign Escrow', val: totalDepositBalance.toLocaleString(), color: 'bg-emerald-600' },
               { label: 'Total Supply', val: totalCoinsInCirculation.toLocaleString(), color: 'bg-amber-600' }
             ].map((s, i) => (
               <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{s.label}</p>
                 <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{s.val}</h4>
               </div>
             ))}
           </div>
        )}

        {view === 'reviews' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-4">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Visual Verification Desk</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Audit user task snapshots for authenticity</p>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               {transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length === 0 ? (
                 <div className="col-span-full py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 text-center">
                    <i className="fa-solid fa-circle-check text-6xl text-emerald-100 mb-8"></i>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Verification queue is clear.</p>
                 </div>
               ) : (
                 transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').map(tx => (
                   <div key={tx.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all group">
                      <div 
                        onClick={() => tx.proofImage && setSelectedScreenshot(tx.proofImage)} 
                        className="w-full md:w-56 h-72 bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden cursor-zoom-in relative"
                      >
                         {tx.proofImage ? (
                           <img src={tx.proofImage} alt="Task Proof" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                             <i className="fa-solid fa-image-slash text-4xl mb-4"></i>
                             <span className="text-[8px] font-black uppercase">Broken Asset</span>
                           </div>
                         )}
                         <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <i className="fa-solid fa-expand text-white text-3xl"></i>
                         </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                         <div className="space-y-6">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{tx.username}</h4>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SUBMITTED: {tx.date}</p>
                               </div>
                               <div className="text-right">
                                  <div className="text-3xl font-black text-indigo-600 tabular-nums">{tx.amount}</div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Potential Credit</p>
                               </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Proof Metadata:</span>
                               <p className="text-sm font-bold text-slate-700">{tx.method || 'General Task Evidence'}</p>
                            </div>
                         </div>
                         <div className="flex gap-4 mt-8">
                            <button 
                              onClick={() => handleAuditSubmission(tx, 'success')} 
                              className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-100 transition-all"
                            >
                              Verify & Pay
                            </button>
                            <button 
                              onClick={() => handleAuditSubmission(tx, 'failed')} 
                              className="flex-1 py-5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white border border-rose-100 transition-all"
                            >
                              Deny
                            </button>
                         </div>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        )}

        {/* Other views omitted for brevity as they remain consistent with the single session implementation */}
      </div>

      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-[2000] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setSelectedScreenshot(null)}
        >
           <div className="relative max-w-6xl max-h-[90vh]">
              <img src={selectedScreenshot} alt="Full Resolution Proof" className="w-full h-full object-contain rounded-3xl border border-white/10 shadow-3xl" />
              <button 
                onClick={() => setSelectedScreenshot(null)} 
                className="absolute -top-12 right-0 text-white text-4xl hover:text-indigo-400 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
