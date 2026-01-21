
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import CreateTask from './pages/CreateTask';
import Wallet from './pages/Wallet';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SpinWheel from './pages/SpinWheel';
import Referrals from './pages/Referrals'; 
import AdminPanel from './pages/AdminPanel';
import Features from './pages/Features';
import Contact from './pages/Contact';
import MyCampaigns from './pages/MyCampaigns';
import ProfileSettings from './pages/ProfileSettings';
import { User, Task, Transaction } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User>(storage.getUser());
  const [tasks, setTasks] = useState<Task[]>(storage.getTasks());
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());
  const [sessionConflict, setSessionConflict] = useState(false);

  // Apply SEO Config on mount
  useEffect(() => {
    const applySEO = async () => {
      const seo = await storage.getSEOConfig();
      document.title = seo.siteTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', seo.metaDescription);
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) metaKeywords.setAttribute('content', seo.keywords);
    };
    applySEO();
  }, []);

  // Capture Referral from URL - Supports both 'id' and 'ref'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('id') || params.get('ref');
    if (refCode) {
      sessionStorage.setItem('pending_referral', refCode.toUpperCase());
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogout = useCallback(() => {
    const guestUser: User = {
      id: storage.getUserId(),
      username: 'Guest',
      email: '',
      coins: 0,
      depositBalance: 0,
      completedTasks: [],
      createdTasks: [],
      claimedReferrals: [],
      isLoggedIn: false
    };
    setUser(guestUser);
    setCurrentPage('home');
    localStorage.removeItem('ct_user_session_id');
    localStorage.removeItem('ct_user');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const refreshUserBalance = useCallback(async (userId?: string) => {
    const idToSync = userId || user.id;
    if (user.isLoggedIn || userId) {
      const cloudUser = await storage.syncUserFromCloud(idToSync);
      if (cloudUser) {
        const localSessionId = localStorage.getItem('ct_user_session_id');
        if (cloudUser.currentSessionId && localSessionId && cloudUser.currentSessionId !== localSessionId) {
          setSessionConflict(true);
          handleLogout();
          return;
        }
        setUser(cloudUser);
      }
    }
  }, [user.id, user.isLoggedIn, handleLogout]);

  useEffect(() => {
    if (user.isLoggedIn) {
      refreshUserBalance();
      const interval = setInterval(refreshUserBalance, 15000); 
      return () => clearInterval(interval);
    }
  }, [user.isLoggedIn, refreshUserBalance]);

  useEffect(() => {
    storage.setUser(user);
  }, [user]);

  useEffect(() => {
    storage.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });
  }, []);

  const handleLogin = async (userData: { id: string; username: string; email: string; isLoggedIn: boolean; isAdmin?: boolean; referredBy?: string }) => {
    const newSessionId = Math.random().toString(36).substr(2, 9);
    const cloudUser = await storage.syncUserFromCloud(userData.id);
    
    const updatedUser: User = {
      id: userData.id,
      username: cloudUser?.username || userData.username,
      email: userData.email,
      isLoggedIn: true,
      currentSessionId: newSessionId,
      isAdmin: userData.isAdmin || cloudUser?.isAdmin || false,
      coins: cloudUser?.coins ?? 0,
      depositBalance: cloudUser?.depositBalance ?? 0,
      referredBy: userData.referredBy || cloudUser?.referredBy || '',
      completedTasks: cloudUser?.completedTasks || [],
      createdTasks: cloudUser?.createdTasks || [],
      claimedReferrals: cloudUser?.claimedReferrals || []
    };
    
    localStorage.setItem('ct_user_session_id', newSessionId);
    setUser(updatedUser);
    await storage.setUser(updatedUser);
    
    setCurrentPage(updatedUser.isAdmin ? 'admin-overview' : 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTaskCompletion = (taskId: string, proofImage?: string, submissionTimestamp?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newTx: Transaction = {
      id: `SUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId: user.id,
      username: user.username,
      amount: task.reward,
      type: 'earn',
      status: 'pending',
      method: `Proof: ${task.type}`,
      proofImage: proofImage,
      date: submissionTimestamp || new Date().toLocaleString()
    };

    const updatedUser = {
      ...user,
      completedTasks: [...(user.completedTasks || []), taskId]
    };
    
    setUser(updatedUser);
    storage.addTransaction(newTx);
    setTransactions(prev => [newTx, ...prev]);
    alert(`Verification submission received. Admin will process shortly.`);
  };

  const handleCreateTask = async (taskData: any) => {
    const totalCost = taskData.reward * taskData.totalWorkers;
    if (user.depositBalance < totalCost) return alert('Insufficient Deposit Balance.');

    const newTask: Task = {
      id: `TASK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      ...taskData,
      creatorId: user.id,
      completedCount: 0,
      status: 'pending'
    };

    const updatedUser: User = {
      ...user,
      depositBalance: user.depositBalance - totalCost,
      createdTasks: [...(user.createdTasks || []), newTask.id]
    };

    const updatedTasks = [...tasks, newTask];
    
    setUser(updatedUser);
    setTasks(updatedTasks);
    
    await storage.setUser(updatedUser);
    storage.setTasks(updatedTasks);
    
    alert('Campaign submitted for review!');
    navigateTo('my-campaigns');
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to terminate this campaign? No refunds for remaining quota.')) return;
    
    await storage.deleteTaskFromCloud(taskId);
    const updatedUser: User = {
      ...user,
      createdTasks: (user.createdTasks || []).filter(id => id !== taskId)
    };
    setUser(updatedUser);
    await storage.setUser(updatedUser);
    alert('Campaign deleted.');
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    await storage.updateTaskInCloud(taskId, updates);
    alert('Campaign updated.');
  };

  const handleReferralClaim = async (referredUserId: string) => {
    if (user.claimedReferrals?.includes(referredUserId)) return;

    const reward = 50;
    const newTx: Transaction = {
      id: `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId: user.id,
      username: user.username,
      amount: reward,
      type: 'referral_claim',
      status: 'success',
      method: `Referral Bonus: Partner ${referredUserId}`,
      date: new Date().toLocaleString()
    };

    const updatedUser: User = {
      ...user,
      coins: (user.coins || 0) + reward,
      claimedReferrals: [...(user.claimedReferrals || []), referredUserId]
    };

    setUser(updatedUser);
    await storage.setUser(updatedUser);
    await storage.addTransaction(newTx);
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleSpinReward = async (reward: number, cost: number) => {
    if (!user.isLoggedIn) return;
    
    const newTx: Transaction = {
      id: `SPIN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId: user.id,
      username: user.username,
      amount: reward,
      type: 'spin',
      status: 'success',
      method: `Daily Spin Reward`,
      date: new Date().toLocaleString()
    };

    const updatedUser: User = {
      ...user,
      coins: (user.coins || 0) + reward - cost
    };

    setUser(updatedUser);
    await storage.setUser(updatedUser);
    await storage.addTransaction(newTx);
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleWalletAction = async (type: 'deposit' | 'withdraw', amount: number, method: string, accountRef?: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: amount,
      type: type,
      method: method,
      account: accountRef,
      status: 'pending',
      date: new Date().toLocaleString()
    };
    if (type === 'withdraw') {
      if (amount < 5000) return alert('Min withdrawal: 5,000 coins.');
      if (user.coins < amount) return alert('Insufficient vault balance.');
      const updatedUser = { ...user, coins: user.coins - amount };
      setUser(updatedUser);
      await storage.setUser(updatedUser);
    }
    storage.addTransaction(newTx);
    setTransactions(prev => [newTx, ...prev]);
    alert(`${type.toUpperCase()} request initialized.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentPage={currentPage} setCurrentPage={navigateTo} user={user} onLogout={handleLogout} />
      
      {sessionConflict && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 text-center">
          <div className="bg-white p-12 rounded-[3rem] max-w-md border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl">
                <i className="fa-solid fa-triangle-exclamation"></i>
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 leading-none">Access Terminated</h2>
             <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
               Your account was recently accessed from another location. For vault safety, this current session has been locked.
             </p>
             <button onClick={() => { setSessionConflict(false); setCurrentPage('login'); }} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">
                Reconnect Session
             </button>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {currentPage === 'home' && <Home onStart={navigateTo} isLoggedIn={user.isLoggedIn} />}
        {currentPage === 'features' && <Features />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'tasks' && <Tasks tasks={tasks.filter(t => t.status === 'active')} onComplete={handleTaskCompletion} />}
        {currentPage === 'create' && <CreateTask onCreate={handleCreateTask} userDepositBalance={user.depositBalance} navigateTo={navigateTo} />}
        {currentPage === 'wallet' && <Wallet coins={user.coins} depositBalance={user.depositBalance} onAction={handleWalletAction} transactions={transactions} onRefresh={() => refreshUserBalance()} />}
        {currentPage === 'dashboard' && user.isLoggedIn && <Dashboard user={user} tasks={tasks} transactions={transactions} onDeleteTask={() => {}} onUpdateTask={() => {}} />}
        {currentPage === 'login' && <Login onLogin={handleLogin} />}
        {currentPage === 'spin' && user.isLoggedIn && <SpinWheel userCoins={user.coins} onSpin={handleSpinReward} transactions={transactions} />}
        {currentPage === 'referrals' && user.isLoggedIn && <Referrals user={user} onClaim={handleReferralClaim} />}
        {currentPage === 'my-campaigns' && user.isLoggedIn && <MyCampaigns user={user} tasks={tasks} onDeleteTask={handleDeleteTask} onUpdateTask={handleUpdateTask} onNavigate={navigateTo} />}
        {currentPage === 'profile' && user.isLoggedIn && <ProfileSettings user={user} />}
        {currentPage.startsWith('admin') && user.isAdmin && <AdminPanel initialView={currentPage.split('-')[1] as any} />}
      </main>
      <Footer setCurrentPage={navigateTo} isLoggedIn={user.isLoggedIn} />
    </div>
  );
};

export default App;
