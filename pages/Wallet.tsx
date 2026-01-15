
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
    if (isNaN(val) || val <= 0) return alert('Enter valid amount');
    if (activeTab === 'withdraw' && val > coins) return alert('Insufficient balance');
    
    onAction(activeTab, val, method);
    setAmount('');
    setAccount('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-indigo-600 rounded-3xl p-8 mb-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-indigo-100 font-medium mb-2 opacity-80 uppercase tracking-widest text-xs">Total Balance</p>
          <div className="text-5xl font-bold flex items-center">
            <i className="fa-solid fa-coins mr-3 text-yellow-400"></i>
            {coins} <span className="text-xl ml-2 font-normal text-indigo-100">Coins</span>
          </div>
          <div className="mt-8 flex space-x-2">
             <div className="bg-white bg-opacity-10 px-4 py-2 rounded-lg text-sm border border-white border-opacity-10">
                ~ ${(coins / 1000).toFixed(2)} USD
             </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-50">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-5 text-sm font-bold transition-all ${activeTab === 'deposit' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 bg-opacity-30' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Deposit Coins
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-5 text-sm font-bold transition-all ${activeTab === 'withdraw' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 bg-opacity-30' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Withdraw Coins
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Method</label>
              <div className="grid grid-cols-3 gap-4">
                {['Binance', 'Easypaisa', 'Payeer'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-2 ${
                      method === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-indigo-200'
                    }`}
                  >
                    <i className={`fa-solid ${m === 'Binance' ? 'fa-bitcoin' : m === 'Easypaisa' ? 'fa-mobile-screen' : 'fa-wallet'} text-xl`}></i>
                    <span className="text-xs font-bold">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Amount (Coins)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1000" 
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{method} Address / Account</label>
              <input 
                type="text" 
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="Enter your account details" 
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
            >
              {activeTab === 'deposit' ? 'Proceed to Deposit' : 'Confirm Withdrawal'}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-slate-400 italic">
            * Processed within 24-48 hours. Minimum 1000 coins for withdrawal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
