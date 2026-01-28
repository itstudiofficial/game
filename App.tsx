import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { User, Task, Transaction } from './types';
import { storage } from './services/storage';
import AdminPanel from './pages/AdminPanel';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Tasks = lazy(() => import('./pages/Tasks'));
const MathSolver = lazy(() => import('./pages/MathSolver'));
const CreateTask = lazy(() => import('./pages/CreateTask'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const SpinWheel = lazy(() => import('./pages/SpinWheel'));
const Referrals = lazy(() => import('./pages/Referrals'));
const Features = lazy(() => import('./pages/Features'));
const Contact = lazy(() => import('./pages/Contact'));
const MyCampaigns = lazy(() => import('./pages/MyCampaigns'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));

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

  useEffect(() => {
    const initApp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const referralId = urlParams.get('id');
      if (referralId) {
        sessionStorage.setItem('pending_referral', referralId);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      try {
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
        console.error("Sync error:", error);
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
        setUser(cloudUser);
        const userTxs = await storage.getUserTransactions(idToSync);
        setTransactions(userTxs);
      }
    }
  }, [user.id, user.isLoggedIn]);

  const handleLogin = async (userData: any) => {
    const newSessionId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem('ct_user_session_id', newSessionId);
    const cloudUser = await storage.syncUserFromCloud(userData.id);
    const updatedUser: User = {
      ...userData,
      isLoggedIn: true,
      currentSessionId: newSessionId,
      coins: cloudUser?.coins ?? 0,
      depositBalance: cloudUser?.depositBalance ?? 0,
    };
    setUser(updatedUser);
    await storage.setUser(updatedUser);
    setCurrentPage(updatedUser.isAdmin ? 'admin-overview' : 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTaskComplete = async (taskId: string, p1?: string, p2?: string, ts?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const tx: Transaction = {
      id: `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now()}`,
      userId: user.id,
      taskId: taskId, 
      amount: task.reward,
      type: 'earn',
      method: `${task.title} | ${task.type}`,
      proofImage: p1,
      proofImage2: p2,
      status: 'pending',
      date: ts || new Date().toLocaleString()
    };
    await storage.addTransaction(tx);
    const updatedUser = { ...user, completedTasks: [...(user.completedTasks || []), taskId] };
    setUser(updatedUser);
    await storage.setUser(updatedUser);
  };

  const handleWalletAction = async (type: 'deposit' | 'withdraw', amt: number, meth: string, acc?: string, proof?: string) => {
    const tx: Transaction = {
      id: `FIN-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now()}`,
      userId: user.id,
      amount: amt,
      type: type,
      method: meth,
      account: acc,
      proofImage: proof,
      status: 'pending',
      date: new Date().toLocaleString()
    };
    if (type === 'withdraw') {
      const updatedUser = { ...user, coins: user.coins - amt };
      await storage.setUser(updatedUser);
      setUser(updatedUser);
    }
    await storage.addTransaction(tx);
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
          <div className="bg-white p-12 rounded-[3rem] max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Access Terminated</h2>
             <p className="text-slate-500 font-bold text-sm mb-8">Dual session detected.</p>
             <button onClick={() => { setSessionConflict(false); setCurrentPage('login'); }} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase">Reconnect</button>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          {currentPage === 'home' && <Home onStart={navigateTo} isLoggedIn={user.isLoggedIn} />}
          {currentPage === 'features' && <Features />}
          {currentPage === 'contact' && <Contact />}
          {currentPage === 'tasks' && <Tasks user={user} tasks={tasks} transactions={transactions} onComplete={handleTaskComplete} />}
          {currentPage === 'math-solver' && user.isLoggedIn && <MathSolver user={user} onSolve={(reward, isLast) => refreshUserBalance()} transactions={transactions} />}
          {currentPage === 'create' && <CreateTask tasks={tasks} user={user} onDeleteTask={async (tid) => { await storage.deleteTaskFromCloud(tid); }} onUpdateTask={async (tid, data) => { await storage.updateTaskInCloud(tid, data); }} onCreate={async (data) => {
            const newTask: Task = { id: `TASK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, ...data, creatorId: user.id, completedCount: 0, status: 'pending', createdAt: new Date().toLocaleString() };
            const updatedUser = { ...user, depositBalance: user.depositBalance - (data.reward * data.totalWorkers), createdTasks: [...(user.createdTasks || []), newTask.id] };
            setUser(updatedUser);
            await storage.setUser(updatedUser);
            storage.setTasks([...tasks, newTask]);
            navigateTo('my-campaigns');
          }} userDepositBalance={user.depositBalance} navigateTo={navigateTo} />}
          {currentPage === 'wallet' && <Wallet coins={user.coins} depositBalance={user.depositBalance} onAction={handleWalletAction} transactions={transactions} onRefresh={() => refreshUserBalance()} />}
          {currentPage === 'dashboard' && user.isLoggedIn && <Dashboard user={user} tasks={tasks} transactions={transactions} onDeleteTask={() => {}} onUpdateTask={() => {}} />}
          {currentPage === 'login' && <Login onLogin={handleLogin} />}
          {currentPage === 'spin' && user.isLoggedIn && <SpinWheel userCoins={user.coins} onSpin={(w, c) => { setUser({...user, coins: user.coins + w - c}); }} transactions={transactions} />}
          {currentPage === 'referrals' && user.isLoggedIn && <Referrals user={user} onClaim={() => refreshUserBalance()} />}
          {currentPage === 'my-campaigns' && user.isLoggedIn && <MyCampaigns user={user} tasks={tasks} transactions={transactions} onDeleteTask={async (tid) => { await storage.deleteTaskFromCloud(tid); }} onUpdateTask={async (tid, data) => { await storage.updateTaskInCloud(tid, data); }} onNavigate={navigateTo} />}
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