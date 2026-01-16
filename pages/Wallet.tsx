
import React, { useState } from 'react';

interface WalletProps {
  coins: number;
  onAction: (type: 'deposit' | 'withdraw', amount: number, method: string) => void;
}

const Wallet: React.FC<WalletProps> = ({ coins, onAction }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Binance');
  const [account, setAccount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);
    if (isNaN(val) || val < 100) return alert('Minimum amount is 100 coins');
    if (activeTab === 'withdraw' && val > coins) return alert('Insufficient balance');
    if (!account) return alert('Please enter account details');
    
    onAction(activeTab, val, method);
    setAmount('');
    setAccount('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 mb-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-indigo-100 font-bold mb-2 opacity-70 uppercase tracking-widest text-[10px]">Current Earning Balance</p>
            <div className="text-6xl font-black flex items-center">
              <i className="fa-solid fa-coins mr-4 text-yellow-400"></i>
              {coins}
            </div>
            <div className="mt-6 flex items-center space-x-3">
               <div className="bg-white bg-opacity-15 px-4 py-2 rounded-xl text-sm font-bold border border-white border-opacity-10 backdrop-blur-md">
                  Est. ${(coins / 1000).toFixed(2)} USD
               </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-3xl border border-white border-opacity-10 backdrop-blur-md">
            <h4 className="text-xs font-black uppercase mb-3 opacity-60">Status</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="font-bold">Verified Account</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex p-2 bg-slate-50 m-4 rounded-[1.5rem]">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-4 text-sm font-black rounded-2xl transition-all ${activeTab === 'deposit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            DEPOSIT
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-4 text-sm font-black rounded-2xl transition-all ${activeTab === 'withdraw' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            WITHDRAW
          </button>
        </div>

        <div className="p-10 pt-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Transfer Method</label>
              <div className="grid grid-cols-3 gap-4">
                {['Binance', 'Easypaisa', 'Payeer'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                      method === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <i className={`fa-solid ${m === 'Binance' ? 'fa-bitcoin' : m === 'Easypaisa' ? 'fa-mobile-screen' : 'fa-wallet'} text-2xl`}></i>
                    <span className="text-[10px] font-black uppercase">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Amount (Coins)</label>
                <div className="relative">
                   <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min 100" 
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.25rem] focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">C</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{method} ID / Phone</label>
                <input 
                  type="text" 
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="ID or Phone Number" 
                  className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.25rem] focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-6 bg-indigo-600 text-white font-black rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transform active:scale-[0.98]"
            >
              {activeTab === 'deposit' ? 'GENERATE DEPOSIT REQUEST' : 'PROCESS WITHDRAWAL'}
              <i className="fa-solid fa-arrow-right-long"></i>
            </button>
          </form>

          <div className="mt-10 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Important Notice</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              * Withdrawal requests are audited manually and processed within 24-48 business hours. 
              * Deposits via Easypaisa may take up to 2 hours to reflect in your balance. 
              * Fees: Binance (0%), Easypaisa (2%), Payeer (1%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
