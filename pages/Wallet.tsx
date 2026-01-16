
import React, { useState } from 'react';

interface WalletProps {
  coins: number;
  onAction: (type: 'deposit' | 'withdraw', amount: number, method: string) => void;
}

const Wallet: React.FC<WalletProps> = ({ coins, onAction }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Easypaisa');
  const [account, setAccount] = useState('');
  const [copied, setCopied] = useState(false);

  const COIN_RATE = 3000;
  const MIN_DEPOSIT = 500;
  const MIN_WITHDRAWAL = 1000;

  const GATEWAY_DETAILS = {
    'Easypaisa': { 
      address: '+92-3338182116', 
      label: 'Easypaisa Number', 
      name: 'Ads Predia Official',
      icon: 'fa-mobile-screen',
      color: 'text-emerald-500'
    },
    'USDT': { 
      address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', 
      label: 'TRC20 Wallet Address', 
      name: 'Tether TRC20',
      icon: 'fa-brands fa-ethereum',
      color: 'text-indigo-500'
    },
    'Payeer': { 
      address: 'P1061557241', 
      label: 'Payeer Account ID', 
      name: 'Global Payeer',
      icon: 'fa-wallet',
      color: 'text-blue-500'
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);
    
    if (activeTab === 'deposit') {
      if (isNaN(val) || val < MIN_DEPOSIT) return alert(`Minimum deposit is ${MIN_DEPOSIT} coins`);
    } else {
      if (isNaN(val) || val < MIN_WITHDRAWAL) return alert(`Minimum withdrawal is ${MIN_WITHDRAWAL} coins`);
      if (val > coins) return alert('Insufficient balance');
    }

    if (!account) return alert('Please enter your transaction proof or account detail');
    
    onAction(activeTab, val, method);
    setAmount('');
    setAccount('');
  };

  const currentGateway = GATEWAY_DETAILS[method as keyof typeof GATEWAY_DETAILS];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Wallet Summary Card */}
      <div className="bg-indigo-600 rounded-[3rem] p-12 mb-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex-1">
            <p className="text-indigo-100 font-black mb-4 opacity-80 uppercase tracking-[0.3em] text-[10px]">Financial Liquidity</p>
            <div className="flex items-baseline gap-4">
              <div className="text-7xl font-black tracking-tighter">
                {coins.toLocaleString()}
              </div>
              <div className="text-xl font-bold text-indigo-200 opacity-60">COINS</div>
            </div>
            <div className="mt-8 flex items-center space-x-3">
               <div className="bg-white/10 px-6 py-3 rounded-2xl text-lg font-black border border-white/10 backdrop-blur-xl shadow-lg">
                  ≈ ${(coins / COIN_RATE).toFixed(2)} USD
               </div>
               <div className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Rate: {COIN_RATE}/$</div>
            </div>
          </div>
          <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md text-center md:text-left min-w-[200px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Transfer Limits</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-indigo-200">Min Deposit:</span>
                <span className="font-black text-sm">{MIN_DEPOSIT}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-indigo-200">Min Withdraw:</span>
                <span className="font-black text-sm">{MIN_WITHDRAWAL}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex p-3 bg-slate-100 m-6 rounded-[2rem] shadow-inner">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-5 text-xs font-black rounded-2xl transition-all tracking-widest ${activeTab === 'deposit' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            DEPOSIT FUNDS
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-5 text-xs font-black rounded-2xl transition-all tracking-widest ${activeTab === 'withdraw' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            WITHDRAW COINS
          </button>
        </div>

        <div className="p-12 pt-6">
          <div className="mb-12">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Select Payment Gateway</label>
            <div className="grid grid-cols-3 gap-6">
              {Object.keys(GATEWAY_DETAILS).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-4 group ${
                    method === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${method === m ? 'bg-white shadow-sm' : 'bg-white/50'}`}>
                    <i className={`fa-solid ${GATEWAY_DETAILS[m as keyof typeof GATEWAY_DETAILS].icon} ${method === m ? GATEWAY_DETAILS[m as keyof typeof GATEWAY_DETAILS].color : ''}`}></i>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'deposit' && currentGateway && (
            <div className="mb-12 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                       <i className="fa-solid fa-circle-info"></i>
                    </div>
                    <h5 className="font-black text-sm uppercase tracking-widest">Official Receiver</h5>
                 </div>
                 
                 <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex items-center justify-between group">
                    <div>
                       <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{currentGateway.label}</div>
                       <div className="text-lg font-black tracking-tight font-mono">{currentGateway.address}</div>
                    </div>
                    <button 
                      onClick={() => handleCopy(currentGateway.address)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {copied ? 'COPIED!' : 'COPY'}
                    </button>
                 </div>
               </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  Amount ({activeTab === 'deposit' ? `Min ${MIN_DEPOSIT}` : `Min ${MIN_WITHDRAWAL}`})
                </label>
                <div className="relative group">
                   <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={activeTab === 'deposit' ? `Min ${MIN_DEPOSIT}` : `Min ${MIN_WITHDRAWAL}`} 
                    className="w-full px-8 py-6 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 font-black text-2xl shadow-inner transition-all"
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm">COINS</div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  {activeTab === 'deposit' ? 'Transaction Proof / TRX ID' : `${method} Address`}
                </label>
                <input 
                  type="text" 
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder={activeTab === 'deposit' ? 'Paste Proof ID' : 'Enter account ID'} 
                  className="w-full px-8 py-6 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 font-bold text-lg shadow-inner"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-7 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 transform active:scale-[0.98]"
            >
              {activeTab === 'deposit' ? 'VERIFY DEPOSIT' : 'CONFIRM WITHDRAWAL'}
              <i className="fa-solid fa-arrow-right-arrow-left"></i>
            </button>
          </form>

          <div className="mt-12 p-10 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 flex gap-6 items-start">
            <div className="w-12 h-12 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center text-indigo-600 shadow-sm">
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2">Policy Summary</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Minimum Deposit: <span className="text-indigo-600 font-bold">{MIN_DEPOSIT} Coins</span>. <br/>
                Minimum Withdrawal: <span className="text-indigo-600 font-bold">{MIN_WITHDRAWAL} Coins</span>. <br/>
                Manual verification takes 1-12 hours. Ensure all payment details match your submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
