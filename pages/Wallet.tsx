
import React, { useState, useRef, useMemo } from 'react';
import { Transaction } from '../types';

interface WalletProps {
  coins: number;
  depositBalance?: number;
  onAction: (type: 'deposit' | 'withdraw', amount: number, method: string, accountRef?: string, proofImage?: string) => void;
  transactions: Transaction[];
  onRefresh?: () => void;
}

const Wallet: React.FC<WalletProps> = ({ coins, depositBalance = 0, onAction, transactions, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Easypaisa');
  const [account, setAccount] = useState(''); 
  const [withdrawName, setWithdrawName] = useState(''); 
  const [withdrawNumber, setWithdrawNumber] = useState(''); 
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Updated Exchange Rates
  const WITHDRAW_RATE = 3000; // 3000 Coins = $1
  const DEPOSIT_RATE = 3000;  // 6000 Coins = $2 ($1 per 3000 coins)
  const MIN_DEPOSIT = 6000;   // Set to 6000 as per prompt logic
  const MIN_WITHDRAWAL = 3000;

  // External conversion multipliers (simulated live rates)
  const PKR_RATE = 280;
  const EUR_RATE = 0.92;
  const GBP_RATE = 0.79;

  const totalWorthUSD = coins / WITHDRAW_RATE;

  const currencyValuations = [
    { label: 'US Dollar', code: 'USD', value: totalWorthUSD.toFixed(2), icon: 'fa-dollar-sign', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Pakistani Rupee', code: 'PKR', value: (totalWorthUSD * PKR_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 }), icon: 'fa-rupee-sign', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Tether (TRC20)', code: 'USDT', value: totalWorthUSD.toFixed(2), icon: 'fa-brands fa-ethereum', color: 'text-teal-500', bg: 'bg-teal-50' },
    { label: 'Euro', code: 'EUR', value: (totalWorthUSD * EUR_RATE).toFixed(2), icon: 'fa-euro-sign', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'British Pound', code: 'GBP', value: (totalWorthUSD * GBP_RATE).toFixed(2), icon: 'fa-sterling-sign', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const GATEWAY_DETAILS = {
    'Easypaisa': { 
      address: '+92-3338182116', 
      icon: 'fa-mobile-screen-button', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      step: activeTab === 'deposit' ? 'Transfer via Easypaisa, then paste TxID and select screenshot below.' : 'Enter your Easypaisa number and account title.'
    },
    'JazzCash': { 
      address: '+92-3338182116', 
      icon: 'fa-mobile-retro', 
      color: 'text-rose-500', 
      bg: 'bg-rose-50',
      step: activeTab === 'deposit' ? 'Transfer via JazzCash, then paste TxID and select screenshot below.' : 'Enter your JazzCash number and account title.'
    },
    'Payeer': { 
      address: 'P1061557241', 
      icon: 'fa-wallet', 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      step: activeTab === 'deposit' ? 'Transfer to Payeer account, then paste ID and select screenshot below.' : 'Enter Payeer Account ID (PXXXXX).'
    },
    'USDT': { 
      address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', 
      icon: 'fa-brands fa-ethereum', 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50',
      step: activeTab === 'deposit' ? 'Transfer TRC20 USDT, then paste TxID and select screenshot below.' : 'Enter Wallet Address and Full Name.'
    },
    'Bank Account': { 
      address: 'Bank: Meezan | Acc: 02120104812345', 
      icon: 'fa-building-columns', 
      color: 'text-slate-700', 
      bg: 'bg-slate-100',
      step: activeTab === 'deposit' ? 'Transfer to Bank Account, then paste TxID and select screenshot below.' : 'Enter Bank Name, Account Number, and Title.'
    }
  };

  const availableMethods = useMemo(() => {
    const all = Object.keys(GATEWAY_DETAILS);
    if (activeTab === 'deposit') return all.filter(m => m !== 'JazzCash' && m !== 'Bank Account');
    return all;
  }, [activeTab]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280; 
        const MAX_HEIGHT = 2400;
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
        else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } else { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to create canvas context')); }
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
      img.src = objectUrl;
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setProofImage(compressed);
      } catch (error) {
        console.error("Compression error:", error);
        alert("Error processing file. Please ensure it is a valid image.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmitInitial = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);
    if (activeTab === 'deposit') {
      if (isNaN(val) || val < MIN_DEPOSIT) return alert(`Minimum deposit amount: ${MIN_DEPOSIT.toLocaleString()} coins ($2.00)`);
      if (!account) return alert('Transaction ID (TxID) is required.');
      if (!proofImage) return alert('Payment proof screenshot is required.');
    } else {
      if (isNaN(val) || val < MIN_WITHDRAWAL) return alert(`Minimum withdrawal amount: ${MIN_WITHDRAWAL.toLocaleString()} coins ($1.00)`);
      if (val > coins) return alert('Insufficient balance in your earning vault.');
      if (!withdrawName || !withdrawNumber) return alert('Complete account details are required.');
    }
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    setIsProcessing(true);
    try {
      const finalAccountRef = activeTab === 'withdraw' ? `${withdrawName} | ${withdrawNumber}` : account;
      await onAction(activeTab, parseInt(amount), method, finalAccountRef, proofImage || undefined);
      setAmount('');
      setAccount('');
      setProofImage(null);
      setWithdrawName('');
      setWithdrawNumber('');
      setShowConfirmModal(false);
    } catch (err) {
      alert('Network operation failed. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const walletHistory = transactions
    .filter(tx => tx.type === 'deposit' || tx.type === 'withdraw')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
              <i className="fa-solid fa-building-columns"></i>
              Financial Operations Center
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
              Wallet <span className="text-indigo-600">& Vault</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
              Manage your liquidity, audit your earnings, and fund your marketing campaigns through our secure gateway.
            </p>
          </div>
          <button onClick={onRefresh} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-4 shadow-sm active:scale-95">
            <i className="fa-solid fa-sync"></i> Refresh Balance
          </button>
        </div>

        {/* Global Exchange Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group shadow-2xl">
              <div className="relative z-10 flex flex-col justify-between h-full">
                 <div>
                    <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Withdrawal Protocol</h3>
                    <div className="flex items-center gap-6">
                       <div className="text-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-3xl font-black text-white">3,000</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase">Coins</p>
                       </div>
                       <i className="fa-solid fa-equals text-indigo-500 text-xl"></i>
                       <div className="text-center px-6 py-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/40">
                          <p className="text-3xl font-black text-white">$1.00</p>
                          <p className="text-[9px] font-black text-indigo-200 uppercase">USD Rate</p>
                       </div>
                    </div>
                 </div>
                 <p className="mt-10 text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                   Minimum withdrawal: 1 Node ($1.00). Coins are converted to your preferred gateway currency at verified global rates.
                 </p>
              </div>
              <i className="fa-solid fa-arrow-up-from-bracket absolute -right-12 -bottom-12 text-[15rem] text-white/5 -rotate-12 transition-transform group-hover:scale-110 duration-700"></i>
           </div>

           <div className="bg-white rounded-[3rem] p-10 border border-slate-200 relative overflow-hidden group shadow-sm">
              <div className="relative z-10 flex flex-col justify-between h-full">
                 <div>
                    <h3 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Deposit Protocol</h3>
                    <div className="flex items-center gap-6">
                       <div className="text-center px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-3xl font-black text-slate-900">6,000</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Coins</p>
                       </div>
                       <i className="fa-solid fa-equals text-slate-200 text-xl"></i>
                       <div className="text-center px-6 py-4 bg-slate-900 rounded-2xl shadow-xl">
                          <p className="text-3xl font-black text-white">$2.00</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase">USD Rate</p>
                       </div>
                    </div>
                 </div>
                 <p className="mt-10 text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">
                   Minimum deposit: 2 Nodes ($2.00). Ad credits are synchronized instantly upon TxID verification.
                 </p>
              </div>
              <i className="fa-solid fa-bullhorn absolute -right-12 -bottom-12 text-[15rem] text-slate-50 rotate-12 transition-transform group-hover:scale-110 duration-700"></i>
           </div>
        </div>

        {/* Balance Displays */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-slate-900 p-12 md:p-16 rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Main Earning Vault</p>
                  <div className="flex items-baseline gap-4 mb-8">
                    <h2 className="text-7xl md:text-8xl font-black tracking-tighter tabular-nums">{coins.toLocaleString()}</h2>
                    <span className="text-xl font-bold text-slate-500 uppercase tracking-widest">Coins</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                     <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-sm font-black shadow-inner flex items-center gap-3">
                       <i className="fa-solid fa-dollar-sign text-emerald-400"></i>
                       {(coins / WITHDRAW_RATE).toFixed(2)} <span className="opacity-40 text-[10px]">USD</span>
                     </div>
                     <div className="px-6 py-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                        Status: Operational
                     </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md text-center">
                     <p className="text-[8px] font-black uppercase text-slate-500 mb-3 tracking-widest">Tasks Finalized</p>
                     <p className="text-3xl font-black">{transactions.filter(t => t.type === 'earn' && t.status === 'success').length}</p>
                  </div>
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md text-center">
                     <p className="text-[8px] font-black uppercase text-slate-500 mb-3 tracking-widest">Deposit Bal</p>
                     <p className="text-3xl font-black tabular-nums">{depositBalance.toLocaleString()}</p>
                  </div>
                </div>
             </div>
             <i className="fa-solid fa-vault absolute -right-20 -bottom-20 text-[30rem] text-white/5 -rotate-12 pointer-events-none"></i>
          </div>

          <div className="lg:col-span-4 bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Currency Matrix</h3>
                <div className="space-y-6">
                   {currencyValuations.map(cur => (
                     <div key={cur.code} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 ${cur.bg} ${cur.color} rounded-xl flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                              <i className={`fa-solid ${cur.icon}`}></i>
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900 tracking-tight">{cur.label}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cur.code}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-base font-black text-slate-900 tabular-nums">{cur.value}</p>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified Rate</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Transaction Terminal */}
        <div className="bg-white rounded-[5rem] border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-8 md:p-16">
               <div className="flex bg-slate-100 p-2 rounded-[2.5rem] border border-slate-200 mb-16 max-w-2xl mx-auto">
                  <button 
                    onClick={() => setActiveTab('deposit')} 
                    className={`flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all ${activeTab === 'deposit' ? 'bg-white text-emerald-600 shadow-2xl' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Deposit Credits
                  </button>
                  <button 
                    onClick={() => setActiveTab('withdraw')} 
                    className={`flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all ${activeTab === 'withdraw' ? 'bg-white text-indigo-600 shadow-2xl' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Withdraw Yield
                  </button>
               </div>

               <form onSubmit={handleSubmitInitial} className="max-w-5xl mx-auto space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block">1. Select Settlement Node (Method)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {availableMethods.map(gate => (
                             <button 
                               key={gate} 
                               type="button" 
                               onClick={() => setMethod(gate)} 
                               className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${method === gate ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xl' : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}
                             >
                               <i className={`fa-solid ${(GATEWAY_DETAILS as any)[gate].icon} text-2xl`}></i>
                               <span className="text-[9px] font-black uppercase tracking-widest">{gate}</span>
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block">2. Input Unit Volume (Coins)</label>
                        <div className="relative">
                           <input 
                             type="number" 
                             placeholder="0.00" 
                             value={amount} 
                             onChange={e => setAmount(e.target.value)} 
                             className="w-full px-10 py-8 bg-slate-50 border-none rounded-[2.5rem] font-black text-5xl text-slate-900 shadow-inner outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-200" 
                           />
                           <div className="absolute right-10 top-1/2 -translate-y-1/2 text-right">
                              <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Estimated Value</span>
                              <span className="text-xl font-black text-indigo-600">
                                 ${(parseInt(amount || '0') / WITHDRAW_RATE).toFixed(2)}
                              </span>
                           </div>
                        </div>
                        <div className="px-6 flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                           <span className="text-slate-400">Min {activeTab}: {activeTab === 'deposit' ? '6,000' : '3,000'} Units</span>
                           <span className="text-indigo-600">Node Sync Active</span>
                        </div>
                     </div>
                  </div>

                  <div className={`p-10 rounded-[3rem] border transition-all duration-500 ${activeTab === 'deposit' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                     <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-xl ${activeTab === 'deposit' ? 'bg-emerald-600 text-white' : 'bg-white text-indigo-600 border border-slate-100'}`}>
                           <i className={`fa-solid ${(GATEWAY_DETAILS as any)[method].icon}`}></i>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                           <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">{(GATEWAY_DETAILS as any)[method].address}</h4>
                           <p className="text-[11px] font-bold text-slate-500 leading-relaxed max-w-xl">{(GATEWAY_DETAILS as any)[method].step}</p>
                        </div>
                        {activeTab === 'deposit' && (
                           <button 
                             type="button" 
                             onClick={() => handleCopy((GATEWAY_DETAILS as any)[method].address)} 
                             className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
                           >
                              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                              {copied ? 'Address Copied' : 'Copy Network ID'}
                           </button>
                        )}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {activeTab === 'withdraw' ? (
                      <>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Account Holder Identity</label>
                           <input type="text" placeholder="e.g. John Doe" value={withdrawName} onChange={e => setWithdrawName(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-900 shadow-inner focus:bg-white transition-all outline-none" />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Gateway Account # / ID</label>
                           <input type="text" placeholder="e.g. +923001234567" value={withdrawNumber} onChange={e => setWithdrawNumber(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-900 shadow-inner focus:bg-white transition-all outline-none" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Transaction Identification (TxID)</label>
                           <input type="text" placeholder="Paste unique TxID here..." value={account} onChange={e => setAccount(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-900 shadow-inner focus:bg-white transition-all outline-none" />
                        </div>
                        <div className="space-y-4 flex flex-col justify-end">
                           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                           <button 
                             type="button"
                             onClick={() => fileInputRef.current?.click()}
                             className={`w-full py-6 rounded-[2rem] border-2 border-dashed flex items-center justify-center gap-4 transition-all ${proofImage ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600' : 'border-slate-200 bg-slate-50/30 text-slate-400 hover:border-indigo-400'}`}
                           >
                              {isCompressing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className={`fa-solid ${proofImage ? 'fa-check-circle' : 'fa-camera-retro'}`}></i>}
                              <span className="text-[10px] font-black uppercase tracking-widest">{proofImage ? 'Proof Synchronized' : 'Attach Proof Screenshot'}</span>
                              {proofImage && <i className="fa-solid fa-trash-can ml-4 text-rose-400 hover:text-rose-600" onClick={(e) => { e.stopPropagation(); setProofImage(null); }}></i>}
                           </button>
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className={`w-full py-10 text-white rounded-[3rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl transition-all relative overflow-hidden active:scale-[0.98] ${activeTab === 'deposit' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-slate-900 shadow-slate-100'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                    <span className="relative z-10 flex items-center justify-center gap-4">
                       Execute {activeTab} protocol
                       <i className="fa-solid fa-arrow-right"></i>
                    </span>
                  </button>
               </form>
           </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
             <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Global Ledger</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Audit of authorized financial sequences</p>
             </div>
             <i className="fa-solid fa-receipt text-slate-100 text-4xl"></i>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                   <tr>
                     <th className="px-10 py-6">Identity</th>
                     <th className="px-6 py-6">Operation</th>
                     <th className="px-6 py-6">Unit Volume</th>
                     <th className="px-6 py-6">Verification</th>
                     <th className="px-10 py-6 text-right">Timestamp</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {walletHistory.length === 0 ? (
                      <tr><td colSpan={5} className="px-10 py-32 text-center">
                         <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-100">
                            <i className="fa-solid fa-ghost text-3xl"></i>
                         </div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No transaction records found</p>
                      </td></tr>
                   ) : (
                      walletHistory.map(tx => (
                         <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6 font-mono text-[10px] font-black text-indigo-400">{tx.id.substring(0, 10).toUpperCase()}</td>
                            <td className="px-6 py-6">
                               <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase border shadow-sm ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                  {tx.type}
                               </span>
                            </td>
                            <td className={`px-6 py-6 font-black text-base ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                               {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-[9px] opacity-40">COINS</span>
                            </td>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'success' ? 'bg-emerald-500' : tx.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                  <span className={`text-[9px] font-black uppercase ${tx.status === 'success' ? 'text-emerald-600' : tx.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}`}>{tx.status}</span>
                               </div>
                            </td>
                            <td className="px-10 py-6 text-right text-[10px] font-black text-slate-400 tabular-nums">{tx.date}</td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] w-full max-w-xl p-12 md:p-16 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="relative z-10">
                 <div className="w-20 h-20 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white text-3xl shadow-xl mx-auto mb-10">
                    <i className="fa-solid fa-file-signature"></i>
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-10 text-center uppercase">Authorize Transmission</h3>
                 <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200 mb-12 space-y-6 shadow-inner">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Operation Type</span>
                       <span className={`px-3 py-1 rounded-lg ${activeTab === 'deposit' ? 'text-emerald-600 bg-emerald-100/50' : 'text-indigo-600 bg-indigo-100/50'}`}>{activeTab}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Unit Volume</span>
                       <span className="text-slate-900 font-black text-xl">{amount} Coins</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Gateway Hub</span>
                       <span className="text-slate-900">{method}</span>
                    </div>
                    <div className="h-px bg-slate-200 w-full"></div>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Value</span>
                       <span className="text-2xl font-black text-emerald-600">${(parseInt(amount) / WITHDRAW_RATE).toFixed(2)} USD</span>
                    </div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Re-adjust</button>
                    <button onClick={confirmAction} disabled={isProcessing} className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 active:scale-95">
                       {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-shield-check"></i> Commit Authorization</>}
                    </button>
                 </div>
              </div>
              <i className="fa-solid fa-fingerprint absolute -right-12 -top-12 text-[15rem] text-slate-50 pointer-events-none opacity-50"></i>
           </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Wallet;
