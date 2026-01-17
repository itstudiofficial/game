
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
import { User, Task, Transaction, TaskType } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User>(storage.getUser());
  const [tasks, setTasks] = useState<Task[]>(storage.getTasks());
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());
  const [infoModal, setInfoModal] = useState<{title: string, content: React.ReactNode} | null>(null);

  useEffect(() => {
    storage.setUser(user);
  }, [user]);

  useEffect(() => {
    storage.setTasks(tasks);
  }, [tasks]);

  const handleLogin = (userData: { username: string; email?: string; isLoggedIn: boolean }) => {
    const updatedUser = {
      ...user,
      ...userData,
      isLoggedIn: true,
      coins: user.isLoggedIn ? user.coins : 0
    };
    setUser(updatedUser);
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    const guestUser = {
      ...user,
      username: 'Guest',
      isLoggedIn: false,
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
        content: (
          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <p className="font-bold text-slate-900">Last Updated: March 2024</p>
            <section>
              <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-2">1. User Agreement</h4>
              <p>By accessing Ads Predia, you agree to provide truthful information. Multiple accounts are strictly prohibited and will lead to an immediate ban without payout.</p>
            </section>
            <section>
              <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-2">2. Earning & Tasks</h4>
              <p>Rewards are distributed based on employer satisfaction. Proof of work must be clear and unedited. Attempts to deceive the system using AI-generated proof will result in account closure.</p>
            </section>
            <section>
              <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-2">3. Financial Policy</h4>
              <p>Withdrawals are processed within 24-72 hours. Users are responsible for providing correct wallet/account IDs.</p>
            </section>
          </div>
        )
      },
      'privacy': {
        title: 'Privacy Policy',
        content: (
          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <p>Your data security is our priority. We collect only what is necessary:</p>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-900">Identity:</strong> Email and username for account management.</li>
              <li><strong className="text-slate-900">Security:</strong> IP address to prevent multi-account fraud.</li>
              <li><strong className="text-slate-900">Financials:</strong> Transaction history and payout addresses.</li>
            </ul>
            <p>We do not share your personal data with advertisers. They only see your proof of work and public username.</p>
          </div>
        )
      },
      'fraud-policy': {
        title: 'Fraud Policy',
        content: (
          <div className="space-y-4">
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 mb-4">
              <h4 className="text-red-700 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <i className="fa-solid fa-shield-virus"></i> Zero Tolerance
              </h4>
              <p className="text-red-600 text-xs font-bold leading-relaxed">Any attempt to manipulate task counts, use VPNs, or submit fake screenshots will result in a permanent ban and forfeiture of all coins.</p>
            </div>
            <p className="text-slate-500 text-sm italic">Our AI monitors every submission for authenticity.</p>
          </div>
        )
      },
      'refund-policy': {
        title: 'Refund Policy',
        content: (
          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">For Advertisers</h4>
            <p>Funds moved to the "Campaign Vault" are non-refundable once the campaign has started. If a campaign is paused or deleted, unspent coins are returned to your main balance.</p>
            <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">For Earners</h4>
            <p>Once coins are earned and confirmed, they can be withdrawn. We do not offer "refunds" for coins spent on the Lucky Spin or other internal features.</p>
          </div>
        )
      },
      'help-center': {
        title: 'Help Center',
        content: (
          <div className="grid grid-cols-1 gap-4">
            {[
              { q: 'How do I earn coins?', a: 'Browse the Tasks page, pick a gig, follow instructions, and upload proof.' },
              { q: 'What is the minimum withdrawal?', a: 'The current minimum is 3,000 coins.' },
              { q: 'My task was rejected, why?', a: 'Usually due to incorrect proof or failure to follow instructions. Contact the advertiser if you disagree.' }
            ].map((faq, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-2xl">
                <h5 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-2">{faq.q}</h5>
                <p className="text-xs text-slate-500 font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        )
      },
      'ticket-support': {
        title: 'Direct Support',
        content: (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 text-3xl mx-auto">
              <i className="fa-solid fa-headset"></i>
            </div>
            <p className="text-sm text-slate-600">Need help with a payment or account issue?</p>
            <button 
              onClick={() => { alert('Support system busy. Please email support@adspredia.site'); setInfoModal(null); }}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
            >
              Open Support Ticket
            </button>
          </div>
        )
      },
      'payment-faq': {
        title: 'Payment FAQ',
        content: (
          <div className="space-y-4">
             <div className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
               <i className="fa-solid fa-circle-check text-emerald-600 mt-1"></i>
               <p className="text-xs font-bold text-emerald-800">Withdrawals are processed manually for security every 24 hours.</p>
             </div>
             <p className="text-sm text-slate-600 font-medium">Supported Methods: Easypaisa, Payeer, USDT (Binance), and local bank transfers.</p>
          </div>
        )
      },
      'api-docs': {
        title: 'Developer API',
        content: (
          <div className="space-y-4 text-center">
            <i className="fa-solid fa-code text-5xl text-slate-200 mb-4"></i>
            <p className="text-sm text-slate-500 font-medium">Our API for bulk advertising and automated task placement is coming in Q3 2024. Stay tuned!</p>
          </div>
        )
      }
    };

    if (infoPages[id]) {
      setInfoModal(infoPages[id]);
    }
  };

  const navigateTo = (page: string) => {
    const mainPages = ['home', 'tasks', 'create', 'spin', 'referrals', 'wallet', 'dashboard', 'login'];
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

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
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
      amount: reward - cost,
      type: 'spin',
      status: 'success',
      date: new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
  };

  const createTask = (taskData: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string }) => {
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
    setTasks([newTask, ...tasks]);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
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

  const deleteTask = (taskId: string) => {
    if (!window.confirm('Are you sure? Deleted campaigns will be permanently removed.')) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setUser(prev => ({
      ...prev,
      createdTasks: prev.createdTasks.filter(id => id !== taskId)
    }));
  };

  const updateTask = (taskId: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...data } : t));
    alert('Campaign updated successfully.');
  };

  const handleWalletAction = (type: 'deposit' | 'withdraw', amount: number, method: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
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
        {currentPage === 'tasks' && <Tasks tasks={tasks.filter(t => t.status === 'active')} onComplete={completeTask} />}
        {currentPage === 'create' && <CreateTask onCreate={createTask} userCoins={user.coins} navigateTo={navigateTo} />}
        {currentPage === 'spin' && <SpinWheel userCoins={user.coins} onSpin={handleSpin} transactions={transactions} />}
        {currentPage === 'referrals' && <Referrals user={user} />}
        {currentPage === 'wallet' && <Wallet coins={user.coins} onAction={handleWalletAction} />}
        {currentPage === 'dashboard' && (
          user.isLoggedIn 
          ? <Dashboard user={user} tasks={tasks} transactions={transactions} onDeleteTask={deleteTask} onUpdateTask={updateTask} />
          : <Login onLogin={handleLogin} />
        )}
        {currentPage === 'login' && <Login onLogin={handleLogin} />}
      </main>
      <Footer setCurrentPage={navigateTo} isLoggedIn={user.isLoggedIn} />

      {/* Dynamic Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{infoModal.title}</h3>
                <button onClick={() => setInfoModal(null)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
             </div>
             <div className="p-10 max-h-[70vh] overflow-y-auto">
                {infoModal.content}
             </div>
             <div className="px-10 py-6 bg-slate-50 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ads Predia Official Documentation</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
