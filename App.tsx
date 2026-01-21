
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
import { User, Task, Transaction, TaskType } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User>(storage.getUser());
  const [tasks, setTasks] = useState<Task[]>(storage.getTasks());
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());

  const refreshUserBalance = useCallback(async () => {
    if (user.isLoggedIn) {
      const updatedUser = await storage.syncUserFromCloud(user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  }, [user.id, user.isLoggedIn]);

  // Poll for balance updates every 30 seconds when logged in
  useEffect(() => {
    if (user.isLoggedIn) {
      refreshUserBalance();
      const interval = setInterval(refreshUserBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [user.isLoggedIn, refreshUserBalance]);

  useEffect(() => {
    const handleUrlReferral = () => {
      const search = window.location.search;
      const urlParams = new URLSearchParams(search);
      const refId = (urlParams.get('ref') || '').toUpperCase().trim();

      if (refId && refId.length > 0 && refId !== 'UNDEFINED' && refId !== 'NULL') {
        sessionStorage.setItem('pending_referral', refId);
        window.history.replaceState({}, '', window.location.origin);
        if (!storage.getUser().isLoggedIn) {
          setCurrentPage('login');
        }
      }
    };
    handleUrlReferral();
  }, []);

  useEffect(() => {
    storage.setUser(user);
  }, [user]);

  useEffect(() => {
    storage.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });
  }, []);

  const handleLogin = async (userData: { username: string; email?: string; isLoggedIn: boolean, isAdmin?: boolean, referredBy?: string }) => {
    const cloudUser = await storage.syncUserFromCloud(userData.email?.split('@')[0] || userData.username);
    
    const updatedUser: User = {
      ...user,
      ...userData,
      isLoggedIn: true,
      coins: cloudUser?.coins ?? user.coins,
      depositBalance: cloudUser?.depositBalance ?? user.depositBalance,
      referredBy: (userData.referredBy || '').toUpperCase().trim(),
      completedTasks: cloudUser?.completedTasks || [],
      createdTasks: cloudUser?.createdTasks || [],
      claimedReferrals: cloudUser?.claimedReferrals || []
    };
    
    setUser(updatedUser);
    setCurrentPage(userData.isAdmin ? 'admin' : 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createTask = (taskData: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string, link?: string }) => {
    const totalCost = taskData.reward * taskData.totalWorkers;
    if (totalCost > (user.depositBalance || 0)) {
      alert('Insufficient deposit balance. Please add funds to your Ad Vault first!');
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
      depositBalance: (user.depositBalance || 0) - totalCost,
      createdTasks: [...(user.createdTasks || []), newTask.id]
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
    alert('Campaign launched! Status: PENDING review.');
    setCurrentPage('my-campaigns');
  };

  const handleTaskCompletion = (taskId: string, submissionTimestamp?: string) => {
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
      date: submissionTimestamp || new Date().toLocaleString()
    };

    const updatedUser = {
      ...user,
      completedTasks: [...(user.completedTasks || []), taskId]
    };
    
    setUser(updatedUser);
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    alert(`Submission received. Our audit team will verify your proof shortly.`);
  };

  const handleClaimReferral = (referredUserId: string) => {
    const REFERRAL_REWARD = 50;
    const newTx: Transaction = {
      id: `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId: user.id,
      username: user.username,
      amount: REFERRAL_REWARD,
      type: 'referral_claim',
      status: 'success',
      method: `Partner Claim: ${referredUserId}`,
      date: new Date().toLocaleString()
    };
    const updatedUser = {
      ...user,
      coins: user.coins + REFERRAL_REWARD,
      claimedReferrals: [...(user.claimedReferrals || []), referredUserId]
    };
    setUser(updatedUser);
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    storage.setUser(updatedUser);
  };

  const handleWalletAction = async (type: 'deposit' | 'withdraw', amount: number, method: string) => {
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
      if (amount < 5000) return alert('Minimum withdrawal is 5,000 coins ($1.00)');
      if (user.coins < amount) return alert('Insufficient earning balance.');
      const updatedUser = { ...user, coins: user.coins - amount };
      setUser(updatedUser);
      await storage.setUser(updatedUser);
    }
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    alert(`${type.toUpperCase()} request for ${amount} coins submitted.`);
  };

  const handleSpinResult = (reward: number, cost: number) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: reward,
      type: 'spin',
      status: 'success',
      date: new Date().toLocaleString()
    };
    const updatedUser = { ...user, coins: user.coins + reward };
    setUser(updatedUser);
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    storage.setUser(updatedUser);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentPage={currentPage} setCurrentPage={navigateTo} user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        {currentPage === 'home' && <Home onStart={navigateTo} isLoggedIn={user.isLoggedIn} />}
        {currentPage === 'features' && <Features />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'tasks' && <Tasks tasks={tasks.filter(t => t.status === 'active')} onComplete={handleTaskCompletion} />}
        {currentPage === 'create' && <CreateTask onCreate={createTask} userDepositBalance={user.depositBalance} navigateTo={navigateTo} />}
        {currentPage === 'wallet' && <Wallet coins={user.coins} depositBalance={user.depositBalance} onAction={handleWalletAction} transactions={transactions} onRefresh={refreshUserBalance} />}
        {currentPage === 'dashboard' && user.isLoggedIn && <Dashboard user={user} tasks={tasks} transactions={transactions} onDeleteTask={() => {}} onUpdateTask={() => {}} />}
        {currentPage === 'login' && <Login onLogin={handleLogin} />}
        {currentPage === 'spin' && user.isLoggedIn && <SpinWheel userCoins={user.coins} onSpin={handleSpinResult} transactions={transactions} />}
        {currentPage === 'referrals' && user.isLoggedIn && <Referrals user={user} onClaim={handleClaimReferral} />}
        {currentPage === 'my-campaigns' && user.isLoggedIn && <MyCampaigns user={user} tasks={tasks} onDeleteTask={() => {}} onUpdateTask={() => {}} />}
        {currentPage === 'profile' && user.isLoggedIn && <ProfileSettings user={user} />}
        {currentPage === 'admin' && user.isAdmin && <AdminPanel />}
      </main>
      <Footer setCurrentPage={navigateTo} isLoggedIn={user.isLoggedIn} />
    </div>
  );
};

export default App;
