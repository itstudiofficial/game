
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-6">
              <i className="fa-solid fa-coins text-indigo-400 text-2xl mr-2"></i>
              <span className="text-xl font-bold text-white">Ads <span className="text-indigo-400">Predia</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              The leading micro-freelancing platform for advertisers and workers. Grow your digital presence or earn by completing simple tasks.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">For Workers</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Browse Tasks</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Earn Coins</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Withdrawal Guide</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Support Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">For Advertisers</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Create Task</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Deposit Coins</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing Details</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">API for Developers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Newsletter</h4>
            <p className="text-sm mb-4">Get updates on new high-paying tasks.</p>
            <div className="flex">
              <input type="email" placeholder="Email address" className="bg-slate-800 border-none rounded-l-md px-4 py-2 w-full focus:ring-1 focus:ring-indigo-400 text-white" />
              <button className="bg-indigo-600 text-white rounded-r-md px-4 py-2 hover:bg-indigo-700 transition-colors"><i className="fa-solid fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
          <p>&copy; 2024 Ads Predia. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
