
import React, { useState } from 'react';
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
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Easypaisa');
  const [account, setAccount] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Policy: 3,000 Coins = $1.00
  const COIN_RATE = 3000;
  const MIN_DEPOSIT = 6000; // Increased to reflect new rate
  const MIN_WITHDRAWAL = 3000;

  const GATEWAY_DETAILS = {
    'Easypaisa': { 
      address: '+92-3338182116', 
      icon: 'fa-mobile-screen-button', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      step: 'Initiate transfer via App first.' 
    },
    'USDT': { 
      address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', 
      icon: 'fa-brands fa-ethereum', 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50',
      step: 'Use TRC20 network only.' 
    },
    'Payeer': { 
      address: 'P1061557241', 
      icon: 'fa-wallet', 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      step: 'Send to Payeer Account first.' 
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitInitial = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);
    if (activeTab === 'deposit') {
      if (isNaN(val) || val < MIN_DEPOSIT) return alert(`Min deposit: ${MIN_DEPOSIT} coins`);
      if (!account) return alert('Reference/Tx ID Required');
    } else {
      if (isNaN(val) || val < MIN_WITHDRAWAL) return alert(`Min withdrawal: ${MIN_WITHDRAWAL} coins`);
      if (val > coins) return alert('Insufficient Vault Balance');
      if (!account) return alert('Receiving Account Required');
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
      alert('Network synchronization failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredHistory = transactions.filter(tx => {
    if (historyFilter === 'all') return tx.type === 'deposit' || tx.type === 'withdraw';
    return tx.type === historyFilter;
  });

  const currentGateway = GATEWAY_DETAILS[method as keyof typeof GATEWAY_DETAILS];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-12">
        
        <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white shadow-3xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 border border-white/10 mb-8">
                <i className="fa-solid fa-vault"></i>
                Authorized Asset Hub
              </div>
              <div className="flex flex-col sm:flex-row items-center lg:items-baseline gap-6 mb-10">
                <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none tabular-nums">
                  {coins.toLocaleString()}
                </h2>
                <span className="text-xl font-black text-slate-500 uppercase tracking-widest">Global Units</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                 <div className="bg-white/5 px-10 py-5 rounded-[2rem] text-3xl font-black border border-white/10 backdrop-blur-3xl shadow-2xl flex items-center gap-4">
                    <span className="text-indigo-400">$</span>
                    {(coins / COIN_RATE).toFixed(2)}
                    <span className="text-[10px] opacity-30 uppercase tracking-widest font-black">USD VAL</span>
                 </div>
                 <div className="hidden sm:block h-12 w-px bg-white/10"></div>
                 <div className="text-left hidden sm:block">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Exchange Protocol</p>
                    <p className="text-xs font-black text-indigo-400">3,000 : 1.00 USD</p>
                 </div>
              </div>
            </div>

            <div className="w-full lg:w-auto flex bg-white/5 p-2 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-inner">
              <button 
                onClick={() => setView('transact')}
                className={`flex-1 lg:flex-none lg:px-16 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${view === 'transact' ? 'bg-white text-slate-900 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
              >
                Transaction Hub
              </button>
              <button 
                onClick={() => setView('history')}
                className={`flex-1 lg:flex-none lg:px-16 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${view === 'history' ? 'bg-white text-slate-900 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
              >
                History Log
              </button>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/4 -translate-y-1/4"></div>
          <i className="fa-solid fa-coins absolute -right-20 -bottom-20 text-[35rem] text-white/5 pointer-events-none -rotate-12 group-hover:scale-110 transition-transform duration-[2000ms]"></i>
        </div>

        {view === 'transact' ? (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex p-3 bg-slate-50 m-8 md:m-16 rounded-[3rem] border border-slate-200/50 shadow-inner">
                <button 
                  onClick={() => setActiveTab('deposit')}
                  className={`flex-1 py-6 text-[11px] font-black rounded-[2.5rem] transition-all duration-500 uppercase tracking-[0.2em] ${activeTab === 'deposit' ? 'bg-white text-indigo-600 shadow-2xl ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-800'}`}
                >
                  <i className="fa-solid fa-plus-circle mr-3"></i> Deposit
                </button>
                <button 
                  onClick={() => setActiveTab('withdraw')}
                  className={`flex-1 py-6 text-[11px] font-black rounded-[2.5rem] transition-all duration-500 uppercase tracking-[0.2em] ${activeTab === 'withdraw' ? 'bg-white text-indigo-600 shadow-2xl ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-800'}`}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket mr-3"></i> Withdraw
                </button>
              </div>

              <div className="px-8 md:px-24 pb-24 space-y-20">
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 text-center">Network Protocol Selection</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {Object.keys(GATEWAY_DETAILS).map(m => {
                      const gateway = GATEWAY_DETAILS[m as keyof typeof GATEWAY_DETAILS];
                      const isActive = method === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`group p-10 rounded-[3rem] border-2 transition-all duration-500 flex flex-col items-center gap-8 ${
                            isActive ? 'border-indigo-600 bg-indigo-50/40 shadow-3xl shadow-indigo-100/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl transition-all duration-500 ${isActive ? 'bg-white shadow-2xl scale-110' : 'bg-white/80'}`}>
                            <i className={`fa-solid ${gateway.icon} ${isActive ? gateway.color : 'text-slate-300'}`}></i>
                          </div>
                          <span className={`text-[13px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-indigo-900' : 'text-slate-500'}`}>{m}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-900 p-12 md:p-16 rounded-[4rem] text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Target Node Address</p>
                      <div className="flex items-center gap-8">
                        <span className="text-2xl md:text-4xl font-black text-white font-mono tracking-tight break-all">
                          {currentGateway.address}
                        </span>
                        <button 
                          onClick={() => handleCopy(currentGateway.address)} 
                          className="w-16 h-16 bg-white text-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                        >
                          <i className={`fa-solid ${copied ? 'fa-check-double' : 'fa-copy'} text-xl`}></i>
                        </button>
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                         <span className="flex h-3 w-3 relative">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                         </span>
                         <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{currentGateway.step}</p>
                      </div>
                    </div>
                    <i className={`fa-solid ${currentGateway.icon} text-[15rem] absolute -right-16 -bottom-16 text-white/5 -rotate-12`}></i>
                  </div>
                </div>

                <form onSubmit={handleSubmitInitial} className="space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Allocation Quantity</label>
                      <div className="relative group">
                        <input 
                          type="number" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)} 
                          className="w-full px-12 py-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2.5rem] focus:ring-8 focus:ring-indigo-600/5 font-black text-4xl text-slate-800 shadow-inner transition-all outline-none" 
                          placeholder="0000" 
                        />
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">UNITS</div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Threshold: {activeTab === 'deposit' ? MIN_DEPOSIT : MIN_WITHDRAWAL} Min</p>
                    </div>
                    <div className="space-y-6">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">
                        {activeTab === 'deposit' ? 'Verification Code (TX ID)' : 'Receiving Node ID'}
                      </label>
                      <input 
                        type="text" 
                        value={account} 
                        onChange={(e) => setAccount(e.target.value)} 
                        className="w-full px-12 py-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2.5rem] focus:ring-8 focus:ring-indigo-600/5 font-black text-lg text-slate-700 shadow-inner transition-all outline-none" 
                        placeholder={activeTab === 'deposit' ? 'Paste Hash Here' : 'e.g. Wallet Address'} 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-10 bg-slate-900 text-white font-black rounded-[3rem] hover:bg-indigo-600 transition-all shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] uppercase tracking-[0.5em] text-xs transform active:scale-[0.98] flex items-center justify-center gap-6"
                  >
                    Execute Protocol Sequence
                    <i className="fa-solid fa-arrow-right-long text-sm"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-12 duration-700">
            <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-12 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/40 gap-8">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-3xl">Asset Audit Ledger</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Verified synchronization of all network transfers</p>
                </div>
                <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200">
                  {['all', 'deposit', 'withdraw'].map(f => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f as any)}
                      className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${historyFilter === f ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="divide-y divide-slate-50">
                {filteredHistory.length === 0 ? (
                  <div className="p-40 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <i className="fa-solid fa-receipt text-slate-200 text-5xl"></i>
                    </div>
                    <p className="text-slate-300 font-black text-xs uppercase tracking-[0.4em]">Empty synchronization log</p>
                  </div>
                ) : (
                  filteredHistory.map(tx => (
                    <div key={tx.id} className="p-12 flex items-center justify-between hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-10">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-transform group-hover:scale-110 shadow-sm ${
                          tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-arrow-down-long' : 'fa-arrow-up-long'} text-2xl`}></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-6 mb-3">
                             <span className="font-black text-slate-900 text-2xl tracking-tighter capitalize">{tx.type} Request</span>
                             <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${
                               tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                             }`}>
                               {tx.status}
                             </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-6">
                             <span className="flex items-center gap-2"><i className="fa-solid fa-clock opacity-50"></i> {tx.date.split(',')[0]}</span>
                             <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                             <span className="flex items-center gap-2"><i className="fa-solid fa-shield opacity-50"></i> {tx.id.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-4xl tracking-tighter ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">NETWORK UNITS</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-500 border border-slate-200/50">
            <div className="p-14 md:p-20">
              <div className="flex items-center gap-8 mb-16">
                <div className="w-20 h-20 bg-slate-900 rounded-[2.25rem] flex items-center justify-center text-white text-3xl shadow-3xl">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                   <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Security Approval</h3>
                   <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-2">Authenticating Sync Sequence</p>
                </div>
              </div>

              <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-200/60 mb-16 space-y-8">
                  <div className="flex justify-between items-center pb-8 border-b border-slate-200">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Operation Type</span>
                    <span className="text-sm font-black text-slate-900 uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm">{activeTab}</span>
                  </div>
                  <div className="flex justify-between items-start pb-8 border-b border-slate-200">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Unit Valuation</span>
                    <div className="text-right">
                       <span className="text-4xl font-black text-slate-900 block leading-none tabular-nums">{parseInt(amount).toLocaleString()}</span>
                       <span className="text-[10px] font-black text-indigo-600 uppercase mt-2 block tracking-widest">≈ ${(parseInt(amount) / COIN_RATE).toFixed(2)} USD</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Network Gateway</span>
                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">{method}</span>
                  </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => setShowConfirmModal(false)} 
                  className="flex-1 py-7 bg-slate-100 text-slate-500 font-black rounded-3xl text-xs uppercase tracking-[0.3em] hover:bg-slate-200 transition-all"
                >
                  Terminate
                </button>
                <button 
                  onClick={confirmAction} 
                  disabled={isProcessing} 
                  className="flex-[2] py-7 bg-slate-900 text-white font-black rounded-3xl text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  {isProcessing ? (
                    <>
                       <i className="fa-solid fa-spinner fa-spin"></i> AUTHENTICATING...
                    </>
                  ) : 'Authorize Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
