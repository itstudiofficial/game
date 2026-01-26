
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
  const [account, setAccount] = useState(''); // Used for Deposit TxID
  const [withdrawName, setWithdrawName] = useState(''); // New field for Withdraw
  const [withdrawNumber, setWithdrawNumber] = useState(''); // New field for Withdraw
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const WITHDRAW_RATE = 3000; 
  const DEPOSIT_RATE = 2500;  
  const MIN_DEPOSIT = 5000; 
  const MIN_WITHDRAWAL = 3000;

  const PKR_RATE = 280;
  const EUR_RATE = 0.92;
  const GBP_RATE = 0.79;

  const totalWorthUSD = coins / WITHDRAW_RATE;

  const currencyValuations = [
    { label: 'US Dollar', code: 'USD', value: totalWorthUSD.toFixed(2), icon: 'fa-dollar-sign', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Pakistani Rupee', code: 'PKR', value: (totalWorthUSD * PKR_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 }), icon: 'fa-rupee-sign', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Tether Crypto', code: 'USDT', value: totalWorthUSD.toFixed(2), icon: 'fa-brands fa-ethereum', color: 'text-teal-500', bg: 'bg-teal-50' },
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
    'Bank Account': { 
      address: 'Bank: Meezan | Acc: 02120104812345', 
      icon: 'fa-building-columns', 
      color: 'text-slate-700', 
      bg: 'bg-slate-100',
      step: activeTab === 'deposit' ? 'Transfer to Bank Account, then paste TxID and select screenshot below.' : 'Enter Bank Name, Account Number, and Title.'
    },
    'USDT': { 
      address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', 
      icon: 'fa-brands fa-ethereum', 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50',
      step: activeTab === 'deposit' ? 'Transfer TRC20 USDT, then paste TxID and select screenshot below.' : 'Enter Wallet Address and Full Name.'
    },
    'Payeer': { 
      address: 'P1061557241', 
      icon: 'fa-wallet', 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      step: activeTab === 'deposit' ? 'Transfer to Payeer account, then paste ID and select screenshot below.' : 'Enter Payeer Account ID (PXXXXX).'
    }
  };

  const availableMethods = useMemo(() => {
    const all = Object.keys(GATEWAY_DETAILS);
    if (activeTab === 'deposit') return all.filter(m => m !== 'JazzCash' && m !== 'Bank Account');
    return all;
  }, [activeTab]);

  const handleTabChange = (tab: 'deposit' | 'withdraw') => {
    setActiveTab(tab);
    setAmount('');
    setAccount('');
    setProofImage(null);
    if (tab === 'deposit' && (method === 'JazzCash' || method === 'Bank Account')) setMethod('Easypaisa');
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        } else {
          resolve(base64Str);
        }
      };
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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setProofImage(compressed);
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitInitial = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);
    if (activeTab === 'deposit') {
      if (isNaN(val) || val < MIN_DEPOSIT) return alert(`Min deposit: ${MIN_DEPOSIT.toLocaleString()} coins`);
      if (!account) return alert('Transaction ID is required.');
      if (!proofImage) return alert('Payment proof screenshot is required.');
    } else {
      if (isNaN(val) || val < MIN_WITHDRAWAL) return alert(`Min withdrawal: ${MIN_WITHDRAWAL.toLocaleString()} coins`);
      if (val > coins) return alert('Insufficient balance.');
      if (!withdrawName || !withdrawNumber) return alert('Account details required.');
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
      setShowConfirmModal(false);
    } catch (err) {
      alert('Operation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const walletHistory = transactions
    .filter(tx => tx.type === 'deposit' || tx.type === 'withdraw')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4">Financial <span className="text-indigo-600">Hub</span></h1>
            <p className="text-slate-500 font-medium text-lg">Manage your liquidity and authorized transfers.</p>
          </div>
          <button onClick={onRefresh} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm">
            <i className="fa-solid fa-sync"></i> Refresh Balance
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-3xl relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Earning Balance</p>
                <div className="flex items-baseline gap-4 mb-6">
                   <h2 className="text-6xl font-black tracking-tighter">{coins.toLocaleString()}</h2>
                   <span className="text-xs text-slate-500 font-bold uppercase">Coins</span>
                </div>
                <div className="px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 inline-block text-[11px] font-black uppercase tracking-widest text-slate-300">
                  ≈ ${(coins / WITHDRAW_RATE).toFixed(2)} USD
                </div>
             </div>
             <i className="fa-solid fa-coins absolute -right-12 -bottom-12 text-[15rem] text-white/5 rotate-12 transition-transform"></i>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Ad Credits</p>
                <div className="flex items-baseline gap-4 mb-6">
                   <h2 className="text-6xl font-black text-slate-900 tracking-tighter">{depositBalance.toLocaleString()}</h2>
                   <span className="text-xs text-slate-400 font-bold uppercase">Coins</span>
                </div>
                <div className="px-5 py-2.5 bg-indigo-50 rounded-2xl border border-indigo-100 inline-block text-[11px] font-black uppercase tracking-widest text-indigo-600">
                  Secured Funds
                </div>
             </div>
             <i className="fa-solid fa-bullhorn absolute -right-12 -bottom-12 text-[15rem] text-slate-50 rotate-12 transition-transform"></i>
          </div>
        </div>

        <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden mb-12">
           <div className="p-8 md:p-16">
               <div className="flex bg-slate-100 p-2 rounded-[2rem] border border-slate-200 mb-12">
                  <button onClick={() => handleTabChange('deposit')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-400'}`}>Deposit</button>
                  <button onClick={() => handleTabChange('withdraw')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400'}`}>Withdraw</button>
               </div>

               <form onSubmit={handleSubmitInitial} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Method</label>
                        <div className="grid grid-cols-3 gap-3">
                           {availableMethods.map(gate => (
                             <button key={gate} type="button" onClick={() => setMethod(gate)} className={`py-5 px-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${method === gate ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-100 text-slate-400'}`}>
                               <i className={`fa-solid ${(GATEWAY_DETAILS as any)[gate].icon} text-xl`}></i>
                               <span className="text-[8px] font-black uppercase">{gate}</span>
                             </button>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Amount (Coins)</label>
                        <input type="number" placeholder="Enter coin value..." value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-3xl text-slate-900 shadow-inner" />
                     </div>
                  </div>

                  <div className={`p-8 rounded-[2.5rem] border ${activeTab === 'deposit' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                     <p className="text-[11px] font-bold text-slate-500 mb-4">{(GATEWAY_DETAILS as any)[method].step}</p>
                     {activeTab === 'deposit' && (
                       <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 p-5 bg-white rounded-2xl border border-slate-200 font-mono text-sm break-all font-bold text-slate-700 shadow-inner">{(GATEWAY_DETAILS as any)[method].address}</div>
                          <button type="button" onClick={() => handleCopy((GATEWAY_DETAILS as any)[method].address)} className="px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                             <i className="fa-solid fa-copy"></i> {copied ? 'Copied' : 'Copy Address'}
                          </button>
                       </div>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {activeTab === 'withdraw' ? (
                      <>
                        <input type="text" placeholder="Account Name" value={withdrawName} onChange={e => setWithdrawName(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 shadow-inner" />
                        <input type="text" placeholder="Account ID / Number" value={withdrawNumber} onChange={e => setWithdrawNumber(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 shadow-inner" />
                      </>
                    ) : (
                      <>
                        <input type="text" placeholder="Paste Transaction ID (TxID)" value={account} onChange={e => setAccount(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 shadow-inner" />
                        <div className="relative">
                           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                           <button 
                             type="button"
                             onClick={() => fileInputRef.current?.click()}
                             className={`w-full py-6 bg-white border-2 border-dashed rounded-3xl flex items-center justify-center gap-4 transition-all ${proofImage ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600' : 'border-slate-200 text-slate-400 hover:border-indigo-400'}`}
                           >
                              {isCompressing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className={`fa-solid ${proofImage ? 'fa-check-circle' : 'fa-camera-retro'}`}></i>}
                              <span className="text-[10px] font-black uppercase tracking-widest">{proofImage ? 'Screenshot Selected' : 'Upload Proof Screenshot'}</span>
                              {proofImage && <i className="fa-solid fa-trash-can ml-4 text-rose-400 hover:text-rose-600" onClick={(e) => { e.stopPropagation(); setProofImage(null); }}></i>}
                           </button>
                        </div>
                      </>
                    )}
                  </div>

                  <button type="submit" className={`w-full py-8 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all ${activeTab === 'deposit' ? 'bg-emerald-600' : 'bg-slate-900'} active:scale-95`}>
                    Execute {activeTab} Process
                  </button>
               </form>
           </div>
        </div>

        <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30">
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Transaction Ledger</h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                   <tr><th className="px-10 py-6">ID</th><th className="px-6 py-6">Type</th><th className="px-6 py-6">Volume</th><th className="px-6 py-6">State</th><th className="px-10 py-6 text-right">Timestamp</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {walletHistory.length === 0 ? (
                      <tr><td colSpan={5} className="px-10 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No entries</td></tr>
                   ) : (
                      walletHistory.map(tx => (
                         <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="px-10 py-6 font-mono text-[10px] font-black text-indigo-600">{tx.id.substring(0, 8).toUpperCase()}</td>
                            <td className="px-6 py-6"><span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase border ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{tx.type}</span></td>
                            <td className={`px-6 py-6 font-black ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.type === 'deposit' ? '+' : '-'}{tx.amount}</td>
                            <td className="px-6 py-6"><span className={`text-[9px] font-black uppercase ${tx.status === 'success' ? 'text-emerald-600' : 'text-amber-500'}`}>{tx.status}</span></td>
                            <td className="px-10 py-6 text-right text-[10px] font-black text-slate-400">{tx.date.split(',')[0]}</td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-8 text-center uppercase">Authorize Move</h3>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 mb-10 space-y-4">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase"><span>Value</span><span className="text-slate-900">{amount} Coins</span></div>
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase"><span>Gateway</span><span className="text-slate-900">{method}</span></div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[10px] uppercase hover:bg-slate-200 transition-all">Adjust</button>
                 <button onClick={confirmAction} disabled={isProcessing} className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase shadow-xl hover:bg-indigo-600 transition-all">
                    {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Confirm'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
