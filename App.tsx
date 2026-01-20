
import React, { useState, useEffect } from 'react';
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
import { User, Task, Transaction, TaskType } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User>(storage.getUser());
  const [tasks, setTasks] = useState<Task[]>(storage.getTasks());
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());
  const [infoModal, setInfoModal] = useState<{title: string, content: React.ReactNode} | null>(null);

  // Referral detection
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/ref/')) {
      const refId = path.split('/ref/')[1].toUpperCase();
      sessionStorage.setItem('pending_referral', refId);
      // Redirect to home or login to clear URL bar but keep context
      window.history.replaceState({}, '', '/');
      setCurrentPage('login');
    }
  }, []);

  useEffect(() => {
    storage.setUser(user);
  }, [user]);

  useEffect(() => {
    storage.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });
  }, []);

  const handleLogin = (userData: { username: string; email?: string; isLoggedIn: boolean, isAdmin?: boolean }) => {
    const pendingRef = sessionStorage.getItem('pending_referral');
    
    const updatedUser = {
      ...user,
      ...userData,
      isLoggedIn: true,
      coins: user.isLoggedIn ? user.coins : 0,
      referredBy: !user.isLoggedIn && pendingRef ? pendingRef : user.referredBy
    };

    if (pendingRef) sessionStorage.removeItem('pending_referral');

    setUser(updatedUser);
    setCurrentPage(userData.isAdmin ? 'admin' : 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    const guestUser = {
      ...user,
      username: 'Guest',
      isLoggedIn: false,
      isAdmin: false,
      coins: 0,
      completedTasks: [],
      createdTasks: []
    };
    setUser(guestUser);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showInfoPage = (id: string) => {
    const infoPages: Record<string, {title: string, content: React.ReactNode}> = {
      'terms': {
        title: 'Terms of Use',
        content: <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>By using Ads Predia, you agree to comply with our global micro-tasking standards.</p>
          <p>1. Self-referral and multiple accounts are strictly prohibited.</p>
          <p>2. Proof of completion must be authentic and verifiable.</p>
          <p>3. Advertisers must maintain a sufficient coin balance for escrow.</p>
        </div>
      },
      'privacy': {
        title: 'Privacy Policy',
        content: <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>We take your digital privacy seriously.</p>
          <p>1. We never share your email with third-party advertisers.</p>
          <p>2. Payment gateway details are processed via secure encrypted tunnels.</p>
          <p>3. Proof screenshots are deleted from our servers after verification.</p>
        </div>
      }
    };
    if (infoPages[id]) setInfoModal(infoPages[id]);
  };

  const navigateTo = (page: string) => {
    const mainPages = ['home', 'tasks', 'create', 'spin', 'referrals', 'wallet', 'dashboard', 'login', 'admin', 'features', 'contact'];
    if (mainPages.includes(page)) {
      setCurrentPage(page);
    } else {
      showInfoPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeTask = (taskId: string, submissionTime?: string) => {
    if (!user.isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'active') return;
    if (user.completedTasks.includes(taskId)) {
      alert('Task already completed!');
      return;
    }

    const updatedUser = {
      ...user,
      coins: user.coins + task.reward,
      completedTasks: [...user.completedTasks, taskId]
    };
    setUser(updatedUser);

    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, completedCount: t.completedCount + 1 } : t
    );
    setTasks(updatedTasks);
    storage.setTasks(updatedTasks);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: task.reward,
      type: 'earn',
      status: 'success',
      date: submissionTime || new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);

    alert(`Success! You earned ${task.reward} coins.`);
  };

  const handleSpin = (reward: number, cost: number) => {
    const updatedUser = {
      ...user,
      coins: user.coins - cost + reward
    };
    setUser(updatedUser);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: reward - cost,
      type: 'spin',
      status: 'success',
      date: new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
  };

  const createTask = (taskData: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string, link?: string }) => {
    const totalCost = taskData.reward * taskData.totalWorkers;
    if (totalCost > user.coins) {
      alert('Insufficient balance. Please deposit coins first!');
      setCurrentPage('wallet');
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData,
      creatorId: user.id,
      completedCount: 0,
      status: 'pending'
    };

    const updatedUser = {
      ...user,
      coins: user.coins - totalCost,
      createdTasks: [...user.createdTasks, newTask.id]
    };
    setUser(updatedUser);
    
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    storage.setTasks(updatedTasks);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: totalCost,
      type: 'spend',
      status: 'success',
      date: new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);

    alert('Campaign created! Status: PENDING review.');
    setCurrentPage('dashboard');
  };

  const handleWalletAction = (type: 'deposit' | 'withdraw', amount: number, method: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: amount,
      type: type,
      method: method,
      status: 'pending',
      date: new Date().toLocaleString()
    };
    
    if (type === 'withdraw') {
      if (amount < 3000) return alert('Minimum withdrawal is 3000 coins');
      setUser({ ...user, coins: user.coins - amount });
    }

    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    alert(`${type.toUpperCase()} request for ${amount} coins submitted.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentPage={currentPage} setCurrentPage={navigateTo} user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        {currentPage === 'home' && <Home onStart={navigateTo} isLoggedIn={user.isLoggedIn} />}
        {currentPage === 'features' && <Features />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'tasks' && <Tasks tasks={tasks.filter(t => t.status === 'active')} onComplete={completeTask} />}
        {currentPage === 'create' && <CreateTask onCreate={createTask} userCoins={user.coins} navigateTo={navigateTo} />}
        {currentPage === 'spin' && <SpinWheel userCoins={user.coins} onSpin={handleSpin} transactions={transactions} />}
        {currentPage === 'referrals' && <Referrals user={user} />}
        {currentPage === 'wallet' && <Wallet coins={user.coins} onAction={handleWalletAction} transactions={transactions} />}
        {currentPage === 'dashboard' && (
          user.isLoggedIn 
          ? <Dashboard user={user} tasks={tasks} transactions={transactions} onDeleteTask={(id) => {}} onUpdateTask={(id, data) => {}} />
          : <Login onLogin={handleLogin} />
        )}
        {currentPage === 'login' && <Login onLogin={handleLogin} />}
        {currentPage === 'admin' && user.isAdmin && <AdminPanel />}
      </main>
      <Footer setCurrentPage={navigateTo} isLoggedIn={user.isLoggedIn} />

      {infoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">{infoModal.title}</h3>
                <button onClick={() => setInfoModal(null)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <i className="fa-solid fa-xmark"></i>
                </button>
             </div>
             <div className="p-10">{infoModal.content}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
