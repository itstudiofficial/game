
import React from 'react';

const Home: React.FC<{ onStart: (p: string) => void }> = ({ onStart }) => {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden hero-gradient pt-24 pb-32 text-white">
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
      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Empowering Micro-Freelancers Globally</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              CoinTasker Pro was built with a single mission: to provide a bridge between digital advertisers and global talent looking for small ways to earn.
            </p>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Whether you're a student looking for pocket money or a digital marketer needing real engagement, our platform ensures fairness, transparency, and instant results.
            </p>
            <div className="flex space-x-4">
              <div className="bg-indigo-50 p-4 rounded-2xl">
                <div className="text-2xl font-bold text-indigo-600">100%</div>
                <div className="text-xs text-slate-500 uppercase">Transparent</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl">
                <div className="text-2xl font-bold text-emerald-600">Instant</div>
                <div className="text-xs text-slate-500 uppercase">Payouts</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-200 rounded-3xl h-80 flex items-center justify-center overflow-hidden shadow-inner">
             <i className="fa-solid fa-users-viewfinder text-8xl text-slate-400 opacity-50"></i>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-100 py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-16">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <i className="fa-solid fa-bolt text-indigo-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Fast Validation</h3>
              <p className="text-slate-500">Our automated and peer-review systems ensure tasks are validated within minutes.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <i className="fa-solid fa-shield-halved text-emerald-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Secure Escrow</h3>
              <p className="text-slate-500">Coins are held in escrow for every task, ensuring you always get paid for your work.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <i className="fa-solid fa-globe text-yellow-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Global Reach</h3>
              <p className="text-slate-500">Available in over 150 countries with local payment methods like Easypaisa and Binance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
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

      {/* Contact Section */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-indigo-600 rounded-[3rem] p-12 text-white text-center shadow-2xl shadow-indigo-200">
          <h2 className="text-4xl font-bold mb-6">Need Help?</h2>
          <p className="text-indigo-100 mb-10 text-lg">Our support team is available 24/7 to assist with your inquiries, payouts, or task disputes.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="mailto:support@cointasker.pro" className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold hover:bg-indigo-50 transition-all flex items-center">
              <i className="fa-solid fa-envelope mr-2"></i> Email Support
            </a>
            <button className="bg-indigo-500 bg-opacity-30 border border-white border-opacity-30 px-8 py-4 rounded-full font-bold hover:bg-opacity-40 transition-all">
              Live Chat
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
