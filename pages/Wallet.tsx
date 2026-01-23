
import React, { useState, useRef } from 'react';
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

  // Economic Policy Update: 2,000 Coins = $1.00
  const COIN_RATE = 2000;
  const MIN_DEPOSIT = 2000; 
  const MIN_WITHDRAWAL = 2000;

  const GATEWAY_DETAILS = {
    'Easypaisa': { 
      address: '+92-3338182116', 
      icon: 'fa-mobile-screen-button', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      step: activeTab === 'deposit' ? 'Transfer to this number via Easypaisa, then paste TxID and upload screenshot below.' : 'Enter your 11-digit Easypaisa number and account title below.'
    },
    'USDT': { 
      address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', 
      icon: 'fa-brands fa-ethereum', 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50',
      step: activeTab === 'deposit' ? 'Transfer TRC20 USDT, then paste TxID/Hash and upload screenshot below.' : 'Enter your TRC20 USDT Wallet Address and Full Name below.'
    },
    'Payeer': { 
      address: 'P1061557241', 
      icon: 'fa-wallet', 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      step: activeTab === 'deposit' ? 'Transfer to this Payeer account, then paste Order ID and upload screenshot below.' : 'Enter your Payeer Account ID (PXXXXX) and Name below.'
    }
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
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
          resolve(canvas.toDataURL('image/jpeg', 0.7));
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
      if (file.size > 25 * 1024 * 1024) return alert('File exceeds 25MB limit.');
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
      if (isNaN(val) || val < MIN_DEPOSIT) return alert(`Min deposit: ${MIN_DEPOSIT.toLocaleString()} coins ($1.00)`);
      if (!account) return alert('Transaction Ref / TxID is required.');
      if (!proofImage) return alert('Please upload a screenshot of your payment proof.');
    } else {
      if (isNaN(val) || val < MIN_WITHDRAWAL) return alert(`Min withdrawal: ${MIN_WITHDRAWAL.toLocaleString()} coins ($1.00)`);
      if (val > coins) return alert('Insufficient main balance.');
      if (!withdrawName || !withdrawNumber) return alert('Recipient Name and Account Number/Address are required.');
    }
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    setIsProcessing(true);
    try {
      const finalAccountRef = activeTab === 'withdraw' 
        ? `Name: ${withdrawName} | Account: ${withdrawNumber}` 
        : account;
        
      await onAction(activeTab, parseInt(amount), method, finalAccountRef, proofImage || undefined);
      setAmount('');
      setAccount('');
      setWithdrawName('');
      setWithdrawNumber('');
      setProofImage(null);
      setShowConfirmModal(false);
    } catch (err) {
      alert('Error processing request.');
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
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4">Financial <span className="text-indigo-600">Vault</span></h1>
            <p className="text-slate-500 font-medium text-lg">Manage your liquidity, deposits, and authorized withdrawals.</p>
          </div>
          <button 
            onClick={onRefresh}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm"
          >
            <i className="fa-solid fa-arrows-rotate"></i> Sync Cloud Balance
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Earning Balance (Main)</p>
                  <h2 className="text-5xl font-black tracking-tighter mb-6">{coins.toLocaleString()} <span className="text-xs text-slate-500 font-bold uppercase">Coins</span></h2>
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 inline-block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    ≈ ${(coins / COIN_RATE).toFixed(2)} USD
                  </div>
               </div>
               <i className="fa-solid fa-coins absolute -right-8 -bottom-8 text-9xl text-white/5 rotate-12 transition-transform group-hover:scale-110"></i>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Deposit Balance (Ad Credits)</p>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-6">{depositBalance.toLocaleString()} <span className="text-xs text-slate-400 font-bold uppercase">Coins</span></h2>
                  <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 inline-block text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    Used for Campaigns
                  </div>
               </div>
               <i className="fa-solid fa-bullhorn absolute -right-8 -bottom-8 text-9xl text-slate-50 rotate-12 transition-transform group-hover:scale-110"></i>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-10 md:p-16">
                 <div className="animate-in fade-in duration-500">
                   <div className="flex bg-slate-50 p-2 rounded-[2rem] border border-slate-200 mb-12">
                      <button onClick={() => { setActiveTab('deposit'); setAccount(''); setProofImage(null); }} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-400'}`}>Deposit Funds</button>
                      <button onClick={() => { setActiveTab('withdraw'); setWithdrawName(''); setWithdrawNumber(''); }} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400'}`}>Withdraw Profits</button>
                   </div>

                   <form onSubmit={handleSubmitInitial} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Choose Gateway</label>
                            <div className="grid grid-cols-3 gap-3">
                               {Object.keys(GATEWAY_DETAILS).map(gate => (
                                 <button key={gate} type="button" onClick={() => setMethod(gate)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === gate ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                   <i className={`fa-solid ${(GATEWAY_DETAILS as any)[gate].icon} text-lg`}></i>
                                   <span className="text-[8px] font-black uppercase">{gate}</span>
                                 </button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Amount (Coins)</label>
                            <div className="relative">
                               <input type="number" placeholder={`${MIN_WITHDRAWAL.toLocaleString()}+`} value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-2xl text-slate-900 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner" />
                               <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">≈ ${(parseInt(amount) || 0) / COIN_RATE} USD</span>
                            </div>
                         </div>
                      </div>

                      <div className={`p-8 rounded-[2.5rem] border ${activeTab === 'deposit' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <i className={`fa-solid ${(GATEWAY_DETAILS as any)[method].icon} ${(GATEWAY_DETAILS as any)[method].color}`}></i>
                           {method} {activeTab === 'deposit' ? 'Payment Details' : 'Instructions'}
                         </h4>
                         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1">
                               <p className="text-[11px] font-bold text-slate-500 mb-2">{(GATEWAY_DETAILS as any)[method].step}</p>
                               {activeTab === 'deposit' && (
                                 <div className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-sm break-all font-bold text-slate-700 shadow-inner">{(GATEWAY_DETAILS as any)[method].address}</div>
                               )}
                            </div>
                            {activeTab === 'deposit' && (
                              <button type="button" onClick={() => handleCopy((GATEWAY_DETAILS as any)[method].address)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
                                 <i className="fa-solid fa-copy"></i> {copied ? 'Copied' : 'Copy'}
                              </button>
                            )}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {activeTab === 'withdraw' ? (
                          <>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Account Title (Your Name)</label>
                               <input 
                                 type="text" 
                                 required 
                                 value={withdrawName} 
                                 onChange={e => setWithdrawName(e.target.value)} 
                                 placeholder="e.g. John Doe" 
                                 className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner" 
                               />
                            </div>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Account Number / Address</label>
                               <input 
                                 type="text" 
                                 required 
                                 value={withdrawNumber} 
                                 onChange={e => setWithdrawNumber(e.target.value)} 
                                 placeholder={method === 'Easypaisa' ? "03XX XXXXXXX" : `Enter ${method} ID`} 
                                 className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner" 
                               />
                            </div>
                          </>
                        ) : (
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">TxID / Order ID</label>
                             <input 
                               type="text" 
                               required 
                               value={account} 
                               onChange={e => setAccount(e.target.value)} 
                               placeholder="Paste ID here" 
                               className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner" 
                             />
                          </div>
                        )}

                        {activeTab === 'deposit' && (
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Payment Screenshot Proof</label>
                             <div 
                                onClick={() => !isCompressing && fileInputRef.current?.click()}
                                className={`h-[72px] bg-slate-50 rounded-3xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${isCompressing ? 'opacity-50 cursor-wait' : ''} ${proofImage ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-400'}`}
                             >
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                {isCompressing ? (
                                   <div className="flex items-center gap-3">
                                      <i className="fa-solid fa-circle-notch fa-spin text-indigo-500"></i>
                                      <span className="text-[10px] font-black text-indigo-600 uppercase">Optimizing Proof...</span>
                                   </div>
                                ) : proofImage ? (
                                   <div className="flex items-center gap-3">
                                      <i className="fa-solid fa-circle-check text-emerald-500"></i>
                                      <span className="text-[10px] font-black text-emerald-600 uppercase">Screenshot Optimized</span>
                                      <button type="button" onClick={(e) => { e.stopPropagation(); setProofImage(null); }} className="text-slate-400 hover:text-rose-500 transition-colors ml-4">
                                         <i className="fa-solid fa-trash-can"></i>
                                      </button>
                                   </div>
                                ) : (
                                   <div className="flex items-center gap-3 text-slate-400">
                                      <i className="fa-solid fa-camera"></i>
                                      <span className="text-[10px] font-black uppercase">Upload Image Proof</span>
                                   </div>
                                )}
                             </div>
                             <p className="px-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Supports up to 25MB (Auto-compressed for mobile)</p>
                          </div>
                        )}
                      </div>

                      <button type="submit" disabled={isCompressing} className={`w-full py-8 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 ${activeTab === 'deposit' ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-500' : 'bg-slate-900 shadow-slate-100 hover:bg-indigo-600'} ${isCompressing ? 'opacity-50' : ''}`}>
                        Initialize {activeTab} Request
                      </button>
                   </form>
                 </div>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="p-8 md:p-14 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
             <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase">Vault History</h3>
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit of your financial movements</p>
             </div>
             <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-slate-300 shadow-inner">
                <i className="fa-solid fa-clock-rotate-left text-lg md:text-xl"></i>
             </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <tr>
                      <th className="px-10 py-6">Reference ID</th>
                      <th className="px-6 py-6">Type</th>
                      <th className="px-6 py-6">Method</th>
                      <th className="px-6 py-6">Amount</th>
                      <th className="px-6 py-6">Status</th>
                      <th className="px-10 py-6 text-right">Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {walletHistory.length === 0 ? (
                      <tr>
                         <td colSpan={6} className="px-10 py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                               <i className="fa-solid fa-receipt text-3xl"></i>
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No transactions detected in ledger</p>
                         </td>
                      </tr>
                   ) : (
                      walletHistory.map(tx => (
                         <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6 font-mono text-[10px] text-indigo-600 font-black">{tx.id.toUpperCase()}</td>
                            <td className="px-6 py-6">
                               <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                  {tx.type}
                               </span>
                            </td>
                            <td className="px-6 py-6 text-xs font-black text-slate-600">{tx.method}</td>
                            <td className={`px-6 py-6 font-black text-sm ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                               {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-[9px] opacity-40 uppercase">Coins</span>
                            </td>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'success' ? 'bg-emerald-500' : tx.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'success' ? 'text-emerald-600' : tx.status === 'failed' ? 'text-rose-600' : 'text-amber-600'}`}>
                                     {tx.status}
                                  </span>
                               </div>
                            </td>
                            <td className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</td>
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
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-8 text-center uppercase">Confirm Operation</h3>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 mb-10 space-y-6">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Operation Type</span>
                    <span className="text-slate-900">{activeTab.toUpperCase()}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Value</span>
                    <span className="text-slate-900">{parseInt(amount).toLocaleString()} Coins</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Gateway</span>
                    <span className="text-slate-900">{method}</span>
                 </div>
                 <div className="pt-4 border-t border-slate-200">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{activeTab === 'deposit' ? 'TxID' : 'Account Details'}</p>
                   {activeTab === 'withdraw' ? (
                     <div className="space-y-1">
                        <p className="text-sm font-black text-indigo-600 truncate">Title: {withdrawName}</p>
                        <p className="text-sm font-bold text-slate-700 break-all">ID: {withdrawNumber}</p>
                     </div>
                   ) : (
                     <p className="text-sm font-bold text-indigo-600 break-all">{account}</p>
                   )}
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Adjust</button>
                 <button onClick={confirmAction} disabled={isProcessing} className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95">
                    {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Execute Request'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
