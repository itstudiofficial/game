
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <div className="flex items-center mb-6">
              <i className="fa-solid fa-coins text-indigo-400 text-2xl mr-2"></i>
              <span className="text-2xl font-black text-white tracking-tighter">Ads <span className="text-indigo-400">Predia</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-8 max-w-sm">
              Empowering the digital economy through transparent micro-tasking. The global bridge between performance marketing and crowd-sourced talent.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'telegram', 'discord'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all border border-slate-700 hover:border-indigo-500"
                >
                  <i className={`fa-brands fa-${social}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Earning</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Browse Tasks</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Daily Lucky Spin</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Reward Tiers</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Affiliate Program</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Leaderboard</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Advertising</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Create Campaign</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Bulk Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Targeting Guide</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Agency Portal</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Ticket Support</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Payment FAQ</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Discord Server</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Legal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Fraud Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="py-10 border-t border-slate-800 border-b mb-10">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Our Payment Partners:</p>
            <div className="flex flex-wrap items-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2"><i className="fa-brands fa-bitcoin text-xl"></i> <span className="text-xs font-bold">Binance</span></div>
              <div className="flex items-center gap-2"><i className="fa-solid fa-building-columns text-xl"></i> <span className="text-xs font-bold">Easypaisa</span></div>
              <div className="flex items-center gap-2"><i className="fa-solid fa-wallet text-xl"></i> <span className="text-xs font-bold">Payeer</span></div>
              <div className="flex items-center gap-2"><i className="fa-brands fa-cc-visa text-xl"></i> <span className="text-xs font-bold">Visa</span></div>
              <div className="flex items-center gap-2"><i className="fa-brands fa-ethereum text-xl"></i> <span className="text-xs font-bold">Polygon</span></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <p>&copy; 2024 ADS PREDIA MICRO-TASKING LTD. REG #8472910</p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Systems Operational
            </div>
            <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <i className="fa-solid fa-globe"></i>
              English (US)
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;