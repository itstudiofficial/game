
import React from 'react';
import Logo from './Logo';

interface FooterProps {
  setCurrentPage: (page: string) => void;
  isLoggedIn: boolean;
}

const Footer: React.FC<FooterProps> = ({ setCurrentPage, isLoggedIn }) => {
  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <div className="flex items-center mb-6 cursor-pointer" onClick={() => handleNavClick('home')}>
              <Logo className="h-10 w-10 mr-3" />
              <span className="text-2xl font-black text-white tracking-tighter">Ads<span className="text-indigo-400">Predia</span></span>
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
              <li><button onClick={() => handleNavClick('tasks')} className="hover:text-indigo-400 transition-colors text-left">Browse Tasks</button></li>
              <li><button onClick={() => handleNavClick('spin')} className="hover:text-indigo-400 transition-colors text-left">Daily Lucky Spin</button></li>
              <li><button onClick={() => handleNavClick('referrals')} className="hover:text-indigo-400 transition-colors text-left">Affiliate Program</button></li>
              <li><button onClick={() => handleNavClick('wallet')} className="hover:text-indigo-400 transition-colors text-left">Wallet / Payout</button></li>
            </ul>
          </div>

          {/* Advertising Column */}
          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Advertising</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><button onClick={() => handleNavClick('create')} className="hover:text-indigo-400 transition-colors text-left">Create Campaign</button></li>
              <li><button onClick={() => handleNavClick('bulk-pricing')} className="hover:text-indigo-400 transition-colors text-left">Bulk Pricing</button></li>
              <li><button onClick={() => handleNavClick('targeting-guide')} className="hover:text-indigo-400 transition-colors text-left">Targeting Guide</button></li>
              <li><button onClick={() => handleNavClick('case-studies')} className="hover:text-indigo-400 transition-colors text-left">Case Studies</button></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><button onClick={() => handleNavClick('contact')} className="hover:text-indigo-400 transition-colors text-left">Contact Us</button></li>
              <li><button onClick={() => handleNavClick('features')} className="hover:text-indigo-400 transition-colors text-left">Features</button></li>
              <li><button onClick={() => handleNavClick('api-docs')} className="hover:text-indigo-400 transition-colors text-left">API Docs</button></li>
              <li><button onClick={() => handleNavClick('payment-faq')} className="hover:text-indigo-400 transition-colors text-left">Payment FAQ</button></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Legal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><button onClick={() => handleNavClick('privacy-policy')} className="hover:text-indigo-400 transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => handleNavClick('terms-conditions')} className="hover:text-indigo-400 transition-colors text-left">Term & Conditions</button></li>
              <li><button onClick={() => handleNavClick('disclaimer')} className="hover:text-indigo-400 transition-colors text-left">Disclaimer</button></li>
              <li><button onClick={() => handleNavClick('refund-policy')} className="hover:text-indigo-400 transition-colors text-left">Refund Policy</button></li>
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
          <p>&copy; 2025 ADSPREDIA MICRO-TASKING</p>
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
