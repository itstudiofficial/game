
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';

interface WalletProps {
  coins: number;
  depositBalance?: number;
  onAction: (type: 'deposit' | 'withdraw', amount: number, method: string) => void;
  transactions: Transaction[];
}

const Wallet: React.FC<WalletProps> = ({ coins, depositBalance = 0, onAction, transactions }) => {
  const [view, setView] = useState<'transact' | 'history'>('transact');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Easypaisa');
  const [account, setAccount] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // UPDATED ECONOMIC SYSTEM: 5,000 Coins = $1.00
  const COIN_RATE = 5000;
  const MIN_DEPOSIT = 5000; 
  const MIN_WITHDRAWAL = 5000;

  const GATEWAY_DETAILS = {
    'Easypaisa': { 
      address: '+92-3338182116', 
      icon: 'fa-mobile-screen-button', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      step: 'Send payment via App, then paste TxID/Ref below.' 
    },
    'USDT': { 
      address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', 
      icon: 'fa-brands fa-ethereum', 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50',
      step: 'Use TRC20 network. Verification takes 5-15 mins.' 
    },
    'Payeer': { 
      address: 'P1061557241', 
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
      if (isNaN(val) || val < MIN_DEPOSIT) return alert(`Min deposit: ${MIN_DEPOSIT.toLocaleString()} coins ($1.00)`);
      if (!account) return alert('Transaction Reference / TxID is required for verification.');
    } else {
      if (isNaN(val) || val < MIN_WITHDRAWAL) return alert(`Min withdrawal: ${MIN_WITHDRAWAL.toLocaleString()} coins ($1.00)`);
      if (val > coins) return alert('Insufficient Earning Balance for this withdrawal.');
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

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="mb-16">
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4">Financial <span className="text-indigo-600">Vault</span></h1>
          <p className="text-slate-500 font-medium text-lg">Manage your liquidity, deposits, and authorized withdrawals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Balance Cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Earning Balance</p>
                  <h2 className="text-5xl font-black tracking-tighter mb-6">{coins.toLocaleString()} <span className="text-xs text-slate-500 font-bold uppercase">Coins</span></h2>
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 inline-block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    ≈ ${(coins / COIN_RATE).toFixed(2)} USD
                  </div>
               </div>
               <i className="fa-solid fa-coins absolute -right-8 -bottom-8 text-9xl text-white/5 rotate-12"></i>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Deposit Balance (Ad Funds)</p>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-6">{depositBalance.toLocaleString()} <span className="text-xs text-slate-400 font-bold uppercase">Coins</span></h2>
                  <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 inline-block text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    Reserved for Campaigns
                  </div>
               </div>
               <i className="fa-solid fa-bullhorn absolute -right-8 -bottom-8 text-9xl text-slate-50 rotate-12"></i>
            </div>
          </div>

          {/* Interaction Area */}
          <div className="lg:col-span-8 bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex border-b border-slate-100">
                <button onClick={() => setView('transact')} className={`flex-1 py-8 font-black text-[10px] uppercase tracking-widest transition-all ${view === 'transact' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50/50 text-slate-400'}`}>Transact</button>
                <button onClick={() => setView('history')} className={`flex-1 py-8 font-black text-[10px] uppercase tracking-widest transition-all ${view === 'history' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50/50 text-slate-400'}`}>History</button>
             </div>

             <div className="p-10 md:p-16">
               {view === 'transact' ? (
                 <div className="animate-in fade-in duration-500">
                   <div className="flex bg-slate-50 p-2 rounded-[2rem] border border-slate-200 mb-12">
                      <button onClick={() => setActiveTab('deposit')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-400'}`}>Deposit</button>
                      <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400'}`}>Withdraw</button>
                   </div>

                   <form onSubmit={handleSubmitInitial} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Transfer Method</label>
                            <div className="grid grid-cols-3 gap-3">
                               {Object.keys(GATEWAY_DETAILS).map(gate => (
                                 <button key={gate} type="button" onClick={() => setMethod(gate)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === gate ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                   <i className={`fa-solid ${(GATEWAY_DETAILS as any)[gate].icon} text-lg`}></i>
                                   <span className="text-[8px] font-black uppercase">{gate}</span>
                                 </button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Amount (Coins)</label>
                            <div className="relative">
                               <input type="number" placeholder="Min 5,000" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-2xl text-slate-900 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner" />
                               <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">≈ ${(parseInt(amount) || 0) / COIN_RATE} USD</span>
                            </div>
                         </div>
                      </div>

                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <i className={`fa-solid ${(GATEWAY_DETAILS as any)[method].icon} ${(GATEWAY_DETAILS as any)[method].color}`}></i>
                           {method} Gateway Details
                         </h4>
                         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1">
                               <p className="text-[11px] font-bold text-slate-500 mb-2">{(GATEWAY_DETAILS as any)[method].step}</p>
                               <div className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-sm break-all font-bold text-slate-700">{(GATEWAY_DETAILS as any)[method].address}</div>
                            </div>
                            <button type="button" onClick={() => handleCopy((GATEWAY_DETAILS as any)[method].address)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">
                               {copied ? 'Copied!' : 'Copy Address'}
                            </button>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{activeTab === 'deposit' ? 'Ref ID / TxID' : 'Recipient Wallet/Account'}</label>
                         <input type="text" required value={account} onChange={e => setAccount(e.target.value)} placeholder={activeTab === 'deposit' ? "Paste Transaction Hash here" : "Enter your account details"} className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner" />
                      </div>

                      <button type="submit" className={`w-full py-8 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 ${activeTab === 'deposit' ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-500' : 'bg-slate-900 shadow-slate-100 hover:bg-indigo-600'}`}>
                        Initialize {activeTab} Request
                      </button>
                   </form>
                 </div>
               ) : (
                 <div className="space-y-4 animate-in slide-in-from-right-8 duration-500">
                    {transactions.length === 0 ? (
                      <div className="py-20 text-center">
                         <i className="fa-solid fa-receipt text-5xl text-slate-100 mb-6"></i>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No activity found</p>
                      </div>
                    ) : (
                      transactions.map(tx => (
                        <div key={tx.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-circle-arrow-down' : 'fa-circle-arrow-up'}`}></i>
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 text-lg tracking-tight uppercase">{tx.type}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xl font-black text-slate-900">{tx.amount.toLocaleString()} <span className="text-[10px] opacity-40">Coins</span></p>
                              <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{tx.status}</span>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-8 text-center uppercase">Audit Request</h3>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 mb-10 space-y-6">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Operation</span>
                    <span className="text-slate-900">{activeTab}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Amount</span>
                    <span className="text-slate-900">{parseInt(amount).toLocaleString()} Coins</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Gateway</span>
                    <span className="text-slate-900">{method}</span>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                 <button onClick={confirmAction} disabled={isProcessing} className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                    {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Confirm Transaction'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
