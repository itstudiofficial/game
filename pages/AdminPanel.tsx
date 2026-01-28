import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Task, Transaction, TaskType, SEOConfig } from '../types';
import { storage } from '../services/storage';

interface AdminPanelProps {
  initialView?: 'overview' | 'users' | 'history' | 'tasks' | 'finance' | 'reviews' | 'seo' | 'create-task';
}

const CACHE_KEY = 'admin_data_cache';

const AdminPanel: React.FC<AdminPanelProps> = ({ initialView = 'overview' }) => {
  const [view, setView] = useState(initialView);
  
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Correct hydration-safe data loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedUsers = localStorage.getItem(`${CACHE_KEY}_users`);
        const cachedTxs = localStorage.getItem(`${CACHE_KEY}_txs`);
        const cachedTasks = localStorage.getItem(`${CACHE_KEY}_tasks`);
        if (cachedUsers) setUsers(JSON.parse(cachedUsers));
        if (cachedTxs) setTransactions(JSON.parse(cachedTxs));
        if (cachedTasks) setTasks(JSON.parse(cachedTasks));
      } catch (e) {
        console.warn("Cache parsing error", e);
      }
    }
  }, []);

  const refreshActiveData = useCallback(async (forcedView?: string) => {
    const targetView = forcedView || view;
    setIsSyncing(true);
    
    try {
      if (targetView === 'overview' || targetView === 'history' || targetView === 'reviews' || targetView === 'finance' || targetView === 'tasks') {
        const allTxs = await storage.getAllGlobalTransactions();
        const sortedTxs = allTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Update live state with full data (including images)
        setTransactions(sortedTxs);

        // Cache light data only using safeSetItem
        const lightTxs = sortedTxs.slice(0, 100).map(tx => {
          const { proofImage, proofImage2, ...rest } = tx;
          return rest;
        });
        storage.safeSetItem(`${CACHE_KEY}_txs`, JSON.stringify(lightTxs));
      }

      if (targetView === 'overview' || targetView === 'users') {
        const allUsers = await storage.getAllUsers();
        setUsers(allUsers || []);
        storage.safeSetItem(`${CACHE_KEY}_users`, JSON.stringify(allUsers));
      }

      if (targetView === 'overview' || targetView === 'tasks' || targetView === 'create-task') {
        const allTasks = await storage.getTasks();
        setTasks(allTasks || []);
        storage.safeSetItem(`${CACHE_KEY}_tasks`, JSON.stringify(allTasks));
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [view]);

  useEffect(() => {
    refreshActiveData();
  }, [view, refreshActiveData]);

  const stats = useMemo(() => ({
    totalCoins: users.reduce((acc, u) => acc + (Number(u.coins) || 0), 0),
    totalDeposit: users.reduce((acc, u) => acc + (Number(u.depositBalance) || 0), 0),
    pendingTasks: transactions.filter(tx => tx.type === 'earn' && tx.status === 'pending').length,
    pendingFinance: transactions.filter(tx => (tx.type === 'deposit' || tx.type === 'withdraw') && tx.status === 'pending').length,
    pendingTasksCount: tasks.filter(t => t.status === 'pending').length,
  }), [users, transactions, tasks]);

  const filteredUsers = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    if (!s) return users;
    return users.filter(u => 
      u?.username?.toLowerCase().includes(s) || 
      u?.id?.toLowerCase().includes(s)
    );
  }, [users, searchQuery]);

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'users', label: 'Users', icon: 'fa-users' },
    { id: 'reviews', label: 'Reviews', icon: 'fa-camera-retro', badge: stats.pendingTasks },
    { id: 'tasks', label: 'Manage Tasks', icon: 'fa-list-check', badge: stats.pendingTasksCount },
    { id: 'finance', label: 'Finance', icon: 'fa-wallet', badge: stats.pendingFinance },
    { id: 'history', label: 'Logs', icon: 'fa-clock' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-2xl">
                <i className={`fa-solid ${isSyncing ? 'fa-sync fa-spin' : 'fa-user-shield'}`}></i>
             </div>
             <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Admin Hub</h1>
                <div className="flex items-center gap-2 mt-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Authorized Node</span>
                </div>
             </div>
          </div>
          
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar relative z-10">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setView(tab.id as any)} 
                className={`relative flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-slate-900">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {view === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Network Nodes', val: users.length, icon: 'fa-users', col: 'text-indigo-600' },
                { label: 'Audit Queue', val: stats.pendingTasks + stats.pendingFinance, icon: 'fa-clock', col: 'text-amber-500' },
                { label: 'Escrow Vault', val: (stats.totalDeposit || 0).toLocaleString(), icon: 'fa-shield', col: 'text-emerald-600' },
                { label: 'Coins Active', val: (stats.totalCoins || 0).toLocaleString(), icon: 'fa-coins', col: 'text-blue-600' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">{s.label}</p>
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">{s.val}</h4>
                  <i className={`fa-solid ${s.icon} absolute -right-4 -bottom-4 text-7xl opacity-5 ${s.col}`}></i>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'users' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase">Operator Registry</h2>
              <input 
                type="text" 
                placeholder="Search ID/Name..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full sm:w-80 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none" 
              />
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-6">Identity</th>
                    <th className="px-6 py-6">Vaults</th>
                    <th className="px-10 py-6 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-slate-900">{u.username}</p>
                        <p className="text-[10px] text-indigo-400 font-mono">{u.id}</p>
                      </td>
                      <td className="px-6 py-6 font-black text-slate-900">
                        <div className="space-y-1">
                          <p>{u.coins?.toLocaleString() || 0} C (Earn)</p>
                          <p className="text-indigo-500">{u.depositBalance?.toLocaleString() || 0} C (Deposit)</p>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button onClick={() => setEditingUserId(u.id)} className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-600 transition-all">Edit Node</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;