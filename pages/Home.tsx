
import React from 'react';

const Home: React.FC<{ onStart: (p: string) => void }> = ({ onStart }) => {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient pt-24 pb-32 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
              Turn Your Spare Time Into <span className="text-yellow-400">Crypto Coins</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-12 font-light">
              Complete simple micro-tasks like social media follows, video watching, and web visits to earn real rewards instantly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => onStart('tasks')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl"
              >
                Start Earning Now
              </button>
              <button 
                onClick={() => onStart('create')}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-500 bg-opacity-30 border border-white border-opacity-30 rounded-full font-bold text-lg hover:bg-opacity-40 transition-all"
              >
                Create a Task
              </button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-300 opacity-10 rounded-full blur-3xl"></div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Simple three-step process to start earning or promoting your business today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: 'fa-user-plus', title: 'Register Account', desc: 'Create your free account in seconds and get bonus coins to start.' },
            { icon: 'fa-list-check', title: 'Complete Tasks', desc: 'Choose from hundreds of tasks in categories like Social, Video, or Web.' },
            { icon: 'fa-wallet', title: 'Withdraw Earnings', desc: 'Once you hit the minimum limit, withdraw to Binance, Payeer or Easypaisa.' }
          ].map((step, i) => (
            <div key={i} className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 card-hover">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className={`fa-solid ${step.icon} text-2xl text-indigo-600`}></i>
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">50K+</div>
              <div className="text-slate-500 text-sm uppercase tracking-wider">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">250K+</div>
              <div className="text-slate-500 text-sm uppercase tracking-wider">Tasks Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">1M+</div>
              <div className="text-slate-500 text-sm uppercase tracking-wider">Coins Paid Out</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">4.9/5</div>
              <div className="text-slate-500 text-sm uppercase tracking-wider">User Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
