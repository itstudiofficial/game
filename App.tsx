
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { User, Task, Transaction } from './types';
import { storage } from './services/storage';
import AdminPanel from './pages/AdminPanel';

// Lazy load pages with explicit extensions for browser ESM resolution
const Home = lazy(() => import('./pages/Home.tsx'));
const Tasks = lazy(() => import('./pages/Tasks.tsx'));
const MathSolver = lazy(() => import('./pages/MathSolver.tsx'));
const CreateTask = lazy(() => import('./pages/CreateTask.tsx'));
const Wallet = lazy(() => import('./pages/Wallet.tsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const SpinWheel = lazy(() => import('./pages/SpinWheel.tsx'));
const Referrals = lazy(() => import('./pages/Referrals.tsx'));
const Features = lazy(() => import('./pages/Features.tsx'));
const Contact = lazy(() => import('./pages/Contact.tsx'));
const MyCampaigns = lazy(() => import('./pages/MyCampaigns.tsx'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings.tsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.tsx'));
const TermsConditions = lazy(() => import('./pages/TermsConditions.tsx'));
const Disclaimer = lazy(() => import('./pages/Disclaimer.tsx'));

// Optimized for fast loading: Removed heavy animations and text
const PageLoader = () => (
  <div className="min-h-[40vh] w-full flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User>(storage.getUser());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());
  const [sessionConflict, setSessionConflict] = useState(false);

  // Referral URL Handling & Background Data Load
  useEffect(() => {
    const initApp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const referralId = urlParams.get('id');
      if (referralId) {
        sessionStorage.setItem('pending_referral', referralId);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      try {
        // Load tasks in background
        storage.getTasks().then(initialTasks => setTasks(initialTasks));
        
        if (user.isLoggedIn) {
          const cloudUser = await storage.syncUserFromCloud(user.id);
          if (cloudUser) {
            const localSessionId = localStorage.getItem('ct_user_session_id');
            if (cloudUser.currentSessionId && localSessionId && cloudUser.currentSessionId !== localSessionId) {
              setSessionConflict(true);
              handleLogout();
              return;
            }
            setUser(cloudUser);
            storage.getUserTransactions(user.id).then(userTxs => setTransactions(userTxs));
          }
        }
        
        const seo = await storage.getSEOConfig();
        document.title = seo.siteTitle;
      } catch (error) {
        console.error("Data background sync error:", error);
      }
    };
    initApp();
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
        const userTxs = await storage.getUserTransactions(idToSync);
        setTransactions(userTxs);
      }
    }
  }, [user.id, user.isLoggedIn, handleLogout]);

  useEffect(() => {
    if (user.isLoggedIn) {
      const interval = setInterval(refreshUserBalance, 30000); 
      return () => clearInterval(interval);
    }
  }, [user.isLoggedIn, refreshUserBalance]);

  useEffect(() => {
    // Immediate local storage sync
    storage.setUser(user);
  }, [user]);

  useEffect(() => {
    storage.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });
  }, []);

  const handleLogin = async (userData: { id: string; username: string; email: string; isLoggedIn: boolean; isAdmin?: boolean; referredBy?: string }) => {
    const newSessionId = Math.random().toString(36).substr(2, 9);
    localStorage.removeItem('ct_user');
    localStorage.setItem('ct_user_session_id', newSessionId);
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
      claimedReferrals: cloudUser?.claimedReferrals || [],
      lastMathTimestamp: cloudUser?.lastMathTimestamp || 0
    };
    setUser(updatedUser);
    await storage.setUser(updatedUser);
    setCurrentPage(updatedUser.isAdmin ? 'admin-overview' : 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTaskComplete = async (taskId: string, proofImage?: string, proofImage2?: string, timestamp?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const tx: Transaction = {
      id: `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now()}`,
      userId: user.id,
      taskId: taskId, 
      username: user.username,
      amount: task.reward,
      type: 'earn',
      method: `${task.title} | ${task.type}`,
      proofImage,
      proofImage2,
      status: 'pending',
      date: timestamp || new Date().toLocaleString() // Use LocalString for date and time
    };
    await storage.addTransaction(tx);
    const updatedCompletedTasks = Array.from(new Set([...(user.completedTasks || []), taskId]));
    const updatedUser = { ...user, completedTasks: updatedCompletedTasks };
    setUser(updatedUser);
    await storage.setUser(updatedUser);
    await refreshUserBalance();
  };

  const handleWalletAction = async (type: 'deposit' | 'withdraw', amt: number, meth: string, acc?: string, proof?: string) => {
    const tx: Transaction = {
      id: `FIN-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now()}`,
      userId: user.id,
      username: user.username,
      amount: amt,
      type: type,
      method: meth,
      account: acc,
      proofImage: proof,
      status: 'pending',
      date: new Date().toLocaleString() // Use LocalString for date and time
    };
    if (type === 'withdraw') {
      const updatedUser = { ...user, coins: user.coins - amt };
      await storage.setUser(updatedUser);
      setUser(updatedUser);
    }
    await storage.addTransaction(tx);
    await refreshUserBalance();
  };

  const handleSpinResult = async (win: number, cost: number) => {
    const updatedUser = { ...user, coins: user.coins + win - cost };
    setUser(updatedUser);
    await storage.setUser(updatedUser);
    const tx: Transaction = {
      id: `SPN-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now()}`,
      userId: user.id,
      username: user.username,
      amount: win,
      type: 'spin',
      method: 'Lucky Wheel Spin',
      status: 'success',
      date: new Date().toLocaleString() // Use LocalString for date and time
    };
    await storage.addTransaction(tx);
    await refreshUserBalance();
  };

  const handleReferralClaim = async (partnerId: string) => {
    const updatedUser = { 
      ...user, 
      coins: user.coins + 100, 
      claimedReferrals: [...(user.claimedReferrals || []), partnerId] 
    };
    setUser(updatedUser);
    await storage.setUser(updatedUser);
    const tx: Transaction = {
      id: `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now()}`,
      userId: user.id,
      username: user.username,
      amount: 100,
      type: 'referral_claim',
      method: `Referral Bonus: Node ${partnerId}`,
      status: 'success',
      date: new Date().toLocaleString() // Use LocalString for date and time
    };
    await storage.addTransaction(tx);
    await refreshUserBalance();
  };

  const handleMathSolve = async (reward: number, isLast: boolean) => {
    const updates: Partial<User> = { coins: user.coins + reward };
    if (isLast) updates.lastMathTimestamp = Date.now();
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await storage.setUser(updatedUser);
    const tx: Transaction = {
      id: `MTH-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now()}`,
      userId: user.id,
      username: user.username,
      amount: reward,
      type: 'math_reward',
      method: `Math Problem Solved${isLast ? ' (Sequence Complete)' : ''}`,
      status: 'success',
      date: new Date().toLocaleString() // Use LocalString for date and time
    };
    await storage.addTransaction(tx);
    const userTxs = await storage.getUserTransactions(user.id);
    setTransactions(userTxs);
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
               Your account was recently accessed from another location.
             </p>
             <button onClick={() => { setSessionConflict(false); setCurrentPage('login'); }} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">
                Reconnect Session
             </button>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          {currentPage === 'home' && <Home onStart={navigateTo} isLoggedIn={user.isLoggedIn} />}
          {currentPage === 'features' && <Features />}
          {currentPage === 'contact' && <Contact />}
          {currentPage === 'tasks' && <Tasks user={user} tasks={tasks} transactions={transactions} onComplete={handleTaskComplete} />}
          {currentPage === 'math-solver' && user.isLoggedIn && <MathSolver user={user} onSolve={handleMathSolve} transactions={transactions} />}
          {currentPage === 'create' && <CreateTask tasks={tasks} user={user} onDeleteTask={async (tid) => {
            await storage.deleteTaskFromCloud(tid);
            await refreshUserBalance();
          }} onUpdateTask={async (tid, data) => {
            await storage.updateTaskInCloud(tid, data);
            await refreshUserBalance();
          }} onCreate={async (data) => {
            const totalCost = data.reward * data.totalWorkers;
            const newTask: Task = {
              id: `TASK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              ...data,
              creatorId: user.id,
              completedCount: 0,
              status: 'pending',
              createdAt: new Date().toLocaleString() // Set creation date and time
            };
            const updatedUser = { ...user, depositBalance: user.depositBalance - totalCost, createdTasks: [...(user.createdTasks || []), newTask.id] };
            const updatedTasks = [...tasks, newTask];
            setUser(updatedUser);
            setTasks(updatedTasks);
            await storage.setUser(updatedUser);
            storage.setTasks(updatedTasks);
            navigateTo('my-campaigns');
          }} userDepositBalance={user.depositBalance} navigateTo={navigateTo} />}
          {currentPage === 'wallet' && <Wallet coins={user.coins} depositBalance={user.depositBalance} onAction={handleWalletAction} transactions={transactions} onRefresh={() => refreshUserBalance()} />}
          {currentPage === 'dashboard' && user.isLoggedIn && <Dashboard user={user} tasks={tasks} transactions={transactions} onDeleteTask={() => {}} onUpdateTask={() => {}} />}
          {currentPage === 'login' && <Login onLogin={handleLogin} />}
          {currentPage === 'spin' && user.isLoggedIn && <SpinWheel userCoins={user.coins} onSpin={handleSpinResult} transactions={transactions} />}
          {currentPage === 'referrals' && user.isLoggedIn && <Referrals user={user} onClaim={handleReferralClaim} />}
          {currentPage === 'my-campaigns' && user.isLoggedIn && <MyCampaigns user={user} tasks={tasks} transactions={transactions} onDeleteTask={async (tid) => {
            await storage.deleteTaskFromCloud(tid);
            await refreshUserBalance();
          }} onUpdateTask={async (tid, data) => {
            await storage.updateTaskInCloud(tid, data);
            await refreshUserBalance();
          }} onNavigate={navigateTo} />}
          {currentPage === 'profile' && user.isLoggedIn && <ProfileSettings user={user} />}
          {currentPage === 'privacy-policy' && <PrivacyPolicy />}
          {currentPage === 'terms-conditions' && <TermsConditions />}
          {currentPage === 'disclaimer' && <Disclaimer />}
          {currentPage.startsWith('admin-') && user.isAdmin && <AdminPanel initialView={currentPage.slice(6) as any} />}
        </Suspense>
      </main>
      <Footer setCurrentPage={navigateTo} isLoggedIn={user.isLoggedIn} />
    </div>
  );
};

export default App;
