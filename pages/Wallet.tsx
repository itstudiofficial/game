
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';

interface WalletProps {
  coins: number;
  onAction: (type: 'deposit' | 'withdraw', amount: number, method: string) => void;
  transactions: Transaction[];
}

const Wallet: React.FC<WalletProps> = ({ coins, onAction, transactions }) => {
  const [view, setView] = useState<'transact' | 'history'>('transact');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Easypaisa');
  const [account, setAccount] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const COIN_RATE = 3000;
  const MIN_DEPOSIT = 3000; 
  const MIN_WITHDRAWAL = 3000;

  const GATEWAY_DETAILS = {
    'Easypaisa': { 
      address: '+92-3338182116', 
      name: 'Ehtesham U.',
      icon: 'fa-mobile-screen-button', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      step: 'Send payment via App, then paste TxID/Ref below.' 
    },
    'USDT': { 
      address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', 
      name: 'Network Vault (TRC20)',
      icon: 'fa-brands fa-ethereum', 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50',
      step: 'Use TRC20 network. Verification takes 5-15 mins.' 
    },
    'Payeer': { 
      address: 'P1061557241', 
      name: 'AdsPredia Global',
      icon: 'fa-wallet', 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      step: 'Transfer to Payeer Account, then input order ID.' 
    }
  };

  const handleCopy = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitInitial = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);
    if (activeTab === 'deposit') {
      if (isNaN(val) || val < MIN_DEPOSIT) return alert(`Min deposit: ${MIN_DEPOSIT.toLocaleString()} coins`);
      if (!account) return alert('Transaction Reference / TxID is required for verification.');
    } else {
      if (isNaN(val) || val < MIN_WITHDRAWAL) return alert(`Min withdrawal: ${MIN_WITHDRAWAL.toLocaleString()} coins`);
      if (val > coins) return alert('Insufficient Vault Balance for this withdrawal.');
      if (!account) return alert('Recipient Account/Wallet address is required.');
    }
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    setIsProcessing(true);
    try {
      await onAction(activeTab, parseInt(amount), method);
      setAmount('');
      setAccount('');
      setShowConfirmModal(false);
      setView('history'); 
    } catch (err) {
      alert('Network synchronization failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredHistory = transactions.filter(tx => {
    const typeMatch = historyFilter === 'all' || tx.type === historyFilter;
    const queryMatch = (tx.id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       tx.method?.toLowerCase().includes(searchQuery.toLowerCase()));
    return typeMatch && queryMatch;
  });

  const currentGateway = GATEWAY_DETAILS[method as keyof typeof GATEWAY_DETAILS];
  const conversionValue = amount ? (parseInt(amount) / COIN_RATE).toFixed(2) : "0.00";

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 space-y-8 md:space-y-12">
        
        {/* Main Vault Header */}
        <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 text-white shadow-3xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 border border-white/10 mb-6 md:mb-8">
                <i className="fa-solid fa-vault"></i>
                Authorized Asset Hub
              </div>
              <div className="flex flex-col sm:flex-row items-center lg:items-baseline gap-4 md:gap-6 mb-8 md:mb-10">
                <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none tabular-nums">
                  {coins.toLocaleString()}
                </h2>
                <span className="text-sm md:text-xl font-black text-slate-500 uppercase tracking-widest">Global Units</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-center lg:justify-start">
                 <div className="bg-white/5 px-6 md:px-10 py-3 md:py-5 rounded-2xl md:rounded-[2rem] text-xl md:text-3xl font-black border border-white/10 backdrop-blur-3xl shadow-2xl flex items-center gap-3 md:gap-4">
                    <span className="text-indigo-400">$</span>
                    {(coins / COIN_RATE).toFixed(2)}
                    <span className="text-[8px] md:text-[10px] opacity-30 uppercase tracking-widest font-black">USD VAL</span>
                 </div>
                 <div className="hidden sm:block h-12 w-px bg-white/10"></div>
                 <div className="text-left hidden sm:block">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Exchange Protocol</p>
                    <p className="text-xs font-black text-indigo-400">3,000 : 1.00 USD</p>
                 </div>
              </div>
            </div>

            <div className="w-full lg:w-auto flex bg-white/5 p-1.5 md:p-2 rounded-2xl md:rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-inner">
              <button 
                onClick={() => setView('transact')}
                className={`flex-1 lg:flex-none lg:px-16 py-4 md:py-6 rounded-xl md:rounded-[2rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${view === 'transact' ? 'bg-white text-slate-900 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
              >
                Transaction Hub
              </button>
              <button 
                onClick={() => setView('history')}
                className={`flex-1 lg:flex-none lg:px-16 py-4 md:py-6 rounded-xl md:rounded-[2rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${view === 'history' ? 'bg-white text-slate-900 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
              >
                History Log
              </button>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/4 -translate-y-1/4"></div>
          <i className="fa-solid fa-shield-halved absolute -right-20 -bottom-20 text-[20rem] md:text-[35rem] text-white/5 pointer-events-none -rotate-12 group-hover:scale-110 transition-transform duration-[2000ms]"></i>
        </div>

        {view === 'transact' ? (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
              {/* Tab Toggle */}
              <div className="flex p-2 md:p-3 bg-slate-50 m-6 md:m-16 rounded-[2rem] md:rounded-[3rem] border border-slate-200/50 shadow-inner">
                <button 
                  onClick={() => { setActiveTab('deposit'); setAmount(''); setAccount(''); }}
                  className={`flex-1 py-4 md:py-6 text-[9px] md:text-[11px] font-black rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 ${activeTab === 'deposit' ? 'bg-white text-emerald-600 shadow-2xl ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-800'}`}
                >
                  <i className="fa-solid fa-circle-arrow-down"></i> Deposit
                </button>
                <button 
                  onClick={() => { setActiveTab('withdraw'); setAmount(''); setAccount(''); }}
                  className={`flex-1 py-4 md:py-6 text-[9px] md:text-[11px] font-black rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 ${activeTab === 'withdraw' ? 'bg-white text-indigo-600 shadow-2xl ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-800'}`}
                >
                  <i className="fa-solid fa-circle-arrow-up"></i> Withdraw
                </button>
              </div>

              <div className="px-6 md:px-24 pb-16 md:pb-24 space-y-12 md:space-y-16">
                {/* Method Selection */}
                <div>
                  <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 md:mb-10 text-center">Select Network Gateway</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
                    {Object.keys(GATEWAY_DETAILS).map(m => {
                      const gateway = GATEWAY_DETAILS[m as keyof typeof GATEWAY_DETAILS];
                      const isActive = method === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`group p-6 md:p-10 rounded-3xl md:rounded-[3rem] border-2 transition-all duration-500 flex flex-row sm:flex-col items-center gap-4 md:gap-6 ${
                            isActive ? 'border-indigo-600 bg-indigo-50 shadow-xl' : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl md:text-3xl transition-all duration-500 shrink-0 ${isActive ? 'bg-white shadow-lg scale-110' : 'bg-white/80'}`}>
                            <i className={`fa-solid ${gateway.icon} ${isActive ? gateway.color : 'text-slate-300'}`}></i>
                          </div>
                          <div className="text-left sm:text-center">
                            <span className={`block text-[11px] md:text-[13px] font-black uppercase tracking-tight ${isActive ? 'text-indigo-900' : 'text-slate-500'}`}>{m}</span>
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">{isActive ? 'Network Selected' : 'Available'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Gateway Details Card - Only for Deposit */}
                {activeTab === 'deposit' && (
                  <div className="bg-slate-900 p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] text-white relative overflow-hidden group shadow-2xl">
                    <div className="relative z-10 space-y-8 md:space-y-10">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Official Payment Node</p>
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                          <div className="flex-1">
                            <span className="text-xl md:text-4xl font-black text-white font-mono tracking-tight break-all">
                              {currentGateway.address}
                            </span>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Account Name: <span className="text-white">{currentGateway.name}</span></p>
                          </div>
                          <button 
                            onClick={() => handleCopy(currentGateway.address)} 
                            className="w-14 h-14 md:w-16 md:h-16 bg-white text-indigo-600 rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all active:scale-90 shrink-0"
                          >
                            <i className={`fa-solid ${copied ? 'fa-check-double' : 'fa-copy'} text-lg md:text-xl`}></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 md:gap-6 p-5 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 backdrop-blur-md">
                         <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg">
                           <i className="fa-solid fa-circle-info"></i>
                         </div>
                         <p className="text-[10px] md:text-xs font-bold text-slate-400 leading-relaxed italic">
                           {currentGateway.step}
                         </p>
                      </div>
                    </div>
                    <i className={`fa-solid ${currentGateway.icon} text-[10rem] md:text-[15rem] absolute -right-12 -bottom-12 text-white/5 -rotate-12`}></i>
                  </div>
                )}

                {/* Main Transaction Form */}
                <form onSubmit={handleSubmitInitial} className="space-y-8 md:space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="space-y-4">
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                        Amount to {activeTab}
                      </label>
                      <div className="relative group">
                        <input 
                          type="number" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)} 
                          className="w-full px-8 md:px-10 py-6 md:py-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl md:rounded-[2.5rem] font-black text-2xl md:text-4xl text-slate-800 shadow-inner outline-none transition-all" 
                          placeholder="0" 
                          required
                        />
                        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                           <span className="text-[8px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest">≈ ${conversionValue}</span>
                           <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-1">COINS</span>
                        </div>
                      </div>
                      <div className="flex justify-between px-4">
                        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Min: {activeTab === 'deposit' ? MIN_DEPOSIT : MIN_WITHDRAWAL}</p>
                        {activeTab === 'withdraw' && (
                          <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${coins < parseInt(amount || '0') ? 'text-red-500' : 'text-emerald-500'}`}>
                            Bal: {coins.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                        {activeTab === 'deposit' ? 'TxID / Reference' : 'Account Details'}
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={account} 
                          onChange={(e) => setAccount(e.target.value)} 
                          className="w-full px-8 md:px-10 py-6 md:py-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl md:rounded-[2.5rem] font-black text-base md:text-lg text-slate-700 shadow-inner outline-none transition-all" 
                          placeholder={activeTab === 'deposit' ? 'Paste Ref ID here' : 'Wallet/Account No.'} 
                          required
                        />
                        <div className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-slate-200">
                          <i className={`fa-solid ${activeTab === 'deposit' ? 'fa-fingerprint' : 'fa-id-card'}`}></i>
                        </div>
                      </div>
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 italic">
                        {activeTab === 'deposit' ? 'Verify TxID from receipt.' : 'Ensure accuracy for payout.'}
                      </p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className={`w-full py-8 md:py-10 text-white font-black rounded-2xl md:rounded-[3rem] transition-all shadow-2xl flex items-center justify-center gap-4 md:gap-6 uppercase tracking-[0.4em] text-[10px] md:text-xs active:scale-[0.98] ${
                      activeTab === 'deposit' ? 'bg-slate-900 hover:bg-emerald-600 shadow-emerald-100' : 'bg-slate-900 hover:bg-indigo-600 shadow-indigo-100'
                    }`}
                  >
                    {activeTab === 'deposit' ? 'Deposit now' : 'Withdraw now'}
                    <i className={`fa-solid ${activeTab === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-12 duration-700">
            <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-8 md:p-12 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-center bg-slate-50/40 gap-6 md:gap-8 sticky top-0 z-10 backdrop-blur-md">
                <div className="text-center xl:text-left">
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl md:text-3xl">All Income History</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Verified network synchronization logs</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full xl:w-auto items-center">
                  <div className="relative w-full md:w-80">
                    <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Search ID or Gateway..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
                    />
                  </div>
                  <div className="flex bg-white p-1.5 md:p-2 rounded-2xl md:rounded-[2rem] border border-slate-200 shrink-0 shadow-sm">
                    {['all', 'deposit', 'withdraw'].map(f => (
                      <button
                        key={f}
                        onClick={() => setHistoryFilter(f as any)}
                        className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${historyFilter === f ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-slate-50 max-h-[60vh] md:max-h-none overflow-y-auto custom-scrollbar">
                {filteredHistory.length === 0 ? (
                  <div className="py-20 md:py-40 text-center">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
                      <i className="fa-solid fa-receipt text-slate-200 text-3xl md:text-5xl"></i>
                    </div>
                    <p className="text-slate-300 font-black text-[9px] md:text-xs uppercase tracking-[0.4em]">Empty synchronization log</p>
                  </div>
                ) : (
                  filteredHistory.map(tx => (
                    <div key={tx.id} className="p-6 md:p-12 flex items-center justify-between hover:bg-slate-50 transition-all group gap-4">
                      <div className="flex items-center gap-4 md:gap-10">
                        <div className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center border-2 transition-transform group-hover:scale-110 shadow-sm shrink-0 ${
                          tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-arrow-down-long' : 'fa-arrow-up-long'} text-lg md:text-2xl`}></i>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-6 mb-1 md:mb-3">
                             <span className="font-black text-slate-900 text-base md:text-2xl tracking-tighter capitalize truncate">{tx.type} Request</span>
                             <span className={`px-2 py-0.5 md:px-3 md:py-1 text-[7px] md:text-[8px] font-black rounded-lg uppercase tracking-widest border shrink-0 ${
                               tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                             }`}>
                               {tx.status}
                             </span>
                          </div>
                          <div className="text-[8px] md:text-[11px] text-slate-400 font-black uppercase tracking-widest flex flex-wrap items-center gap-2 md:gap-4">
                             <span className="flex items-center gap-1.5 md:gap-2"><i className="fa-solid fa-clock opacity-50"></i> {tx.date.split(',')[0]}</span>
                             <span className="hidden sm:block w-1 h-1 bg-slate-200 rounded-full"></span>
                             <span className="font-mono text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded">[{tx.method || 'N/A'}]</span>
                             <span className="w-1 h-1 bg-slate-200 rounded-full hidden md:block"></span>
                             <span className="text-[8px] md:text-[9px] opacity-40 hidden md:block">#{tx.id.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`font-black text-xl md:text-4xl tracking-tighter ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                        </div>
                        <div className="text-[7px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">UNITS</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Overlay */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-3xl animate-in zoom-in-95 duration-500 border border-slate-200/50">
            <div className="p-8 md:p-20">
              <div className="flex items-center gap-6 md:gap-8 mb-10 md:mb-16">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-slate-900 rounded-2xl md:rounded-[2.25rem] flex items-center justify-center text-white text-2xl md:text-3xl shadow-3xl">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                   <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Operational Audit</h3>
                   <p className="text-[9px] md:text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] mt-2">Verify Request Specs</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200/60 mb-10 md:mb-16 space-y-6 md:space-y-8">
                  <div className="flex justify-between items-center pb-6 md:pb-8 border-b border-slate-200">
                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Type</span>
                    <span className={`text-[10px] md:text-sm font-black uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 rounded-xl border ${activeTab === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{activeTab}</span>
                  </div>
                  <div className="flex justify-between items-start pb-6 md:pb-8 border-b border-slate-200">
                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Value</span>
                    <div className="text-right">
                       <span className="text-2xl md:text-4xl font-black text-slate-900 block leading-none tabular-nums">{parseInt(amount).toLocaleString()}</span>
                       <span className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase mt-2 block tracking-widest">≈ ${conversionValue} USD</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Account</span>
                    <span className="text-[10px] md:text-xs font-black text-slate-800 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 break-all font-mono">{account}</span>
                  </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <button 
                  onClick={() => setShowConfirmModal(false)} 
                  className="flex-1 py-5 md:py-7 bg-slate-100 text-slate-500 font-black rounded-2xl md:rounded-3xl text-[10px] md:text-xs uppercase tracking-[0.3em] hover:bg-slate-200 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={confirmAction} 
                  disabled={isProcessing} 
                  className={`flex-[2] py-5 md:py-7 text-white font-black rounded-2xl md:rounded-3xl text-[10px] md:text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 md:gap-4 ${activeTab === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-indigo-600'}`}
                >
                  {isProcessing ? (
                    <>
                       <i className="fa-solid fa-spinner fa-spin"></i> SYNCING...
                    </>
                  ) : `Authorize ${activeTab}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Wallet;
