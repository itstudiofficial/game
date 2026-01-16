
import React from 'react';

const Home: React.FC<{ onStart: (p: string) => void, isLoggedIn: boolean }> = ({ onStart, isLoggedIn }) => {
  return (
    <div className="space-y-0 pb-0">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden hero-gradient pt-24 pb-32 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Visual Logo Integration */}
            <div className="mb-10 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 transition-transform duration-700"></div>
                <div className="relative w-28 h-28 md:w-40 md:h-40 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center p-4">
                   {/* This represents the visual logo uploaded by the user */}
                   <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                     <path d="M20 80 L50 20 L80 80 M45 40 L65 40" stroke="#00A9CE" strokeWidth="8" fill="none" strokeLinecap="round"/>
                     <path d="M50 20 Q80 20 80 50 Q80 80 50 80" stroke="#003865" strokeWidth="12" fill="none" strokeLinecap="round"/>
                   </svg>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="flex h-2 w-2 rounded-full bg-yellow-400"></span>
              New: Spin the wheel and win up to 60 coins daily!
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
              The Future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Micro-Earning</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
              Join the world's most trusted micro-task marketplace. Advertisers get real engagement, and workers get instant payouts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => onStart(isLoggedIn ? 'tasks' : 'login')}
                className="group relative w-full sm:w-auto px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-white/20 transition-all flex items-center justify-center overflow-hidden"
              >
                <span className="relative z-10">Get Started Now</span>
                <i className="fa-solid fa-arrow-right ml-2 transition-transform"></i>
              </button>
              <button 
                onClick={() => onStart(isLoggedIn ? 'create' : 'login')}
                className="w-full sm:w-auto px-10 py-5 bg-indigo-500/20 border-2 border-white/30 rounded-2xl font-black text-lg hover:bg-indigo-500/40 transition-all backdrop-blur-sm"
              >
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4"></div>
      </section>

      <div className="bg-white border-b border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Trusted by Global Advertisers & 50,000+ Users</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <i className="fa-brands fa-google text-3xl"></i>
             <i className="fa-brands fa-youtube text-3xl"></i>
             <i className="fa-brands fa-facebook text-3xl"></i>
             <i className="fa-brands fa-twitter text-3xl"></i>
             <i className="fa-brands fa-tiktok text-3xl"></i>
             <i className="fa-brands fa-instagram text-3xl"></i>
          </div>
        </div>
      </div>

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {[
            { label: 'Registered Users', val: '52,400+', icon: 'fa-users', color: 'indigo' },
            { label: 'Total Tasks Done', val: '1.2M+', icon: 'fa-check-to-slot', color: 'emerald' },
            { label: 'Coins Distributed', val: '8.5M', icon: 'fa-coins', color: 'yellow' },
            { label: 'Daily Payouts', val: '$2,500', icon: 'fa-receipt', color: 'blue' }
          ].map((stat, i) => (
            <div key={i} className="text-center group p-6 hover:bg-slate-50 rounded-[2rem] transition-all">
              <div className={`w-16 h-16 mx-auto mb-6 bg-${stat.color}-50 rounded-2xl flex items-center justify-center text-${stat.color}-600 text-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">{stat.val}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Why Choose Ads Predia?</h2>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 card-hover">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl mb-8 shadow-lg shadow-indigo-100">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Instant Verification</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Our AI-driven proof verification system checks your submissions in real-time, reducing wait times to minutes instead of days.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 card-hover">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl mb-8 shadow-lg shadow-emerald-100">
                <i className="fa-solid fa-lock"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Escrow Protection</h3>
              <p className="text-slate-500 leading-relaxed font-medium">For every task created, coins are locked in escrow. This ensures workers are guaranteed payment upon successful completion.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 card-hover">
              <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center text-white text-xl mb-8 shadow-lg shadow-yellow-100">
                <i className="fa-solid fa-earth-americas"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Global Reach</h3>
              <p className="text-slate-500 leading-relaxed font-medium">We support international payment gateways including Binance Pay, Payeer, and regional favorites like Easypaisa for local users.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Earning Opportunities</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Multiple ways to grow your coin balance every single day. Choose what you love doing.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'Video Engagement', icon: 'fa-youtube', color: 'bg-red-50 text-red-600', count: '450+ Active Tasks' },
              { name: 'Website Visits', icon: 'fa-globe', color: 'bg-indigo-50 text-indigo-600', count: '1.2k+ Active Tasks' },
              { name: 'App Testing', icon: 'fa-mobile-screen', color: 'bg-emerald-50 text-emerald-600', count: '80+ Active Tasks' },
              { name: 'Social Shares', icon: 'fa-share-nodes', color: 'bg-blue-50 text-blue-600', count: '300+ Active Tasks' }
            ].map((cat, i) => (
              <div key={i} className="p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group">
                <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 text-xl group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${cat.icon}`}></i>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{cat.name}</h4>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 md:mx-10 my-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Success Stories</h2>
            <p className="text-slate-400 font-medium">Hear from our community of earners and advertisers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { user: 'Sarah M.', role: 'Content Creator', text: 'Ads Predia helped me grow my YouTube channel from 0 to 10k subscribers in 3 months with real engagement.', avatar: 'S' },
              { user: 'Ahmed K.', role: 'Freelancer', text: 'I withdraw about $50 every week just by doing simple tasks during my transit. The instant Easypaisa payout is a lifesaver.', avatar: 'A' },
              { user: 'David L.', role: 'App Developer', text: 'The app testing feedback I got here was invaluable. High-quality users and very affordable campaigns.', avatar: 'D' }
            ].map((t, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-lg">{t.avatar}</div>
                  <div>
                    <div className="font-bold">{t.user}</div>
                    <div className="text-xs text-indigo-400 font-black uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed italic">"{t.text}"</p>
                <div className="mt-6 flex gap-1 text-yellow-400 text-xs">
                  {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
      </section>

      <section id="contact" className="max-w-5xl mx-auto px-4 py-24 scroll-mt-20">
        <div className="bg-indigo-600 rounded-[3rem] p-12 text-white text-center shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6">Start Your Journey Today</h2>
            <p className="text-indigo-100 mb-12 text-lg font-medium max-w-2xl mx-auto">Join the fastest growing micro-freelancing community. Whether you want to earn or advertise, we have you covered.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => onStart(isLoggedIn ? 'tasks' : 'login')}
                className="w-full sm:w-auto px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:bg-indigo-50 shadow-xl transition-all"
              >
                Create Free Account
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-indigo-500/30 border-2 border-white/30 rounded-2xl font-black text-lg hover:bg-indigo-500/40 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
