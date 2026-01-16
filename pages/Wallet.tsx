
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 5000 Coins = 2 USD => 2500 Coins = 1 USD
  const COIN_RATE = 2500;
  const MIN_DEPOSIT = 500;
  const MIN_WITHDRAWAL = 3000;

  const GATEWAY_DETAILS = {
    'Easypaisa': { 
      address: '+92-3338182116', 
      label: 'Easypaisa Number', 
      name: 'Ads Predia Official',
      icon: 'fa-mobile-screen',
      color: 'text-emerald-500',
      step: 'Send money to this number via Easypaisa App first.'
    },
    'USDT': { 
      address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', 
      label: 'TRC20 Wallet Address', 
      name: 'Tether TRC20',
      icon: 'fa-brands fa-ethereum',
      color: 'text-indigo-500',
      step: 'Transfer USDT (TRC20) to this address from your exchange.'
    },
    'Payeer': { 
      address: 'P1061557241', 
      label: 'Payeer Account ID', 
      name: 'Global Payeer',
      icon: 'fa-wallet',
      color: 'text-blue-500',
      step: 'Send the amount to this Payeer account first.'
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
      if (isNaN(val) || val < MIN_DEPOSIT) return alert(`Minimum deposit is ${MIN_DEPOSIT} coins`);
      if (!account) return alert('Please complete the payment first and enter your Transaction ID!');
      setShowConfirmModal(true);
    } else {
      if (isNaN(val) || val < MIN_WITHDRAWAL) return alert(`Minimum withdrawal is ${MIN_WITHDRAWAL} coins`);
      if (val > coins) return alert('Insufficient balance in your vault');
      if (!account) return alert('Please enter your receiving account/wallet ID');
      confirmAction();
    }
  };

  const confirmAction = () => {
    onAction(activeTab, parseInt(amount), method);
    setAmount('');
    setAccount('');
    setShowConfirmModal(false);
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
               <div className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Exchange: {COIN_RATE}/$</div>
            </div>
          </div>
          <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md text-center md:text-left min-w-[200px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Transfer Limits</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-indigo-200 uppercase">Min Deposit</span>
                <span className="font-black text-sm">{MIN_DEPOSIT}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-indigo-200 uppercase">Min Withdraw</span>
                <span className="font-black text-sm">{MIN_WITHDRAWAL}</span>
              </div>
            </div>
          </div>
        </div>
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
            WITHDRAWAL
          </button>
        </div>

        <div className="p-12 pt-6">
          {activeTab === 'deposit' && (
            <div className="mb-10 bg-red-50 border border-red-100 p-6 rounded-[2rem] animate-pulse">
              <div className="flex items-center gap-4 text-red-600 mb-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span className="text-xs font-black uppercase tracking-widest">Mandatory Requirement</span>
              </div>
              <p className="text-[11px] font-bold text-red-700 leading-relaxed">
                You MUST send the payment to our official address below BEFORE submitting this form. Submitting without payment will lead to a permanent account ban.
              </p>
            </div>
          )}

          <div className="mb-12">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Select Gateway</label>
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

          {activeTab === 'deposit' && (
            <div className="mb-10 p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem]">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Step 1: Copy Official Address</div>
              <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 mb-4 group">
                <div className="font-mono text-sm font-black text-slate-700 break-all">{currentGateway.address}</div>
                <button 
                  onClick={() => handleCopy(currentGateway.address)}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                </button>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <i className="fa-solid fa-circle-info"></i>
                {currentGateway.step}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitInitial} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  Coin Amount ({activeTab === 'deposit' ? `Min ${MIN_DEPOSIT}` : `Min ${MIN_WITHDRAWAL}`})
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
                  {activeTab === 'deposit' ? 'Step 2: Enter Transaction ID' : `Receive at ${method} ID`}
                </label>
                <input 
                  type="text" 
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder={activeTab === 'deposit' ? 'Paste Proof ID here' : 'Enter your account ID'} 
                  className="w-full px-8 py-6 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 font-bold text-lg shadow-inner"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-7 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 transform active:scale-[0.98]"
            >
              {activeTab === 'deposit' ? 'I HAVE PAID - SUBMIT PROOF' : 'CONFIRM WITHDRAWAL'}
              <i className="fa-solid fa-arrow-right-arrow-left"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 text-xl">
                  <i className="fa-solid fa-shield-heart"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">One Last Check</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Verification Required</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
                  <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Did you really pay?</h4>
                  <p className="text-xs font-bold text-red-800 leading-relaxed">
                    By clicking confirm, you legally testify that you have sent ${(parseInt(amount) / COIN_RATE).toFixed(2)} USD to our {method} address.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Coins to add</div>
                    <div className="text-2xl font-black">{parseInt(amount).toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TRX Proof</div>
                    <div className="text-sm font-black truncate">{account}</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                >
                  I Haven't Paid
                </button>
                <button 
                  onClick={confirmAction}
                  className="flex-2 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
                >
                  Confirm Payment
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
