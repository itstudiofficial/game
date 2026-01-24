
import React from 'react';

const TermsConditions: React.FC = () => {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-sm">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-8 uppercase">Terms & Conditions</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Last Updated: January 1, 2025</p>
          
          <div className="prose prose-slate max-w-none space-y-10">
            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                By accessing or using the Ads Predia platform, you agree to be bound by these Terms and Conditions. If you do not agree to all terms, you must cease use of the network immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">2. User Conduct & Integrity</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Users must provide genuine engagement. Any attempt to use bots, scripts, multiple accounts, or fraudulent proof of work will result in immediate termination of the account and forfeiture of all accumulated coins.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">3. Financial Protocol</h2>
              <ul className="list-disc pl-5 text-slate-600 space-y-3 font-medium">
                <li>Coins have no real-world value outside of the Ads Predia marketplace and withdrawal system.</li>
                <li>The minimum withdrawal threshold is 3,000 coins (equivalent to $1.00 USD).</li>
                <li>The minimum deposit threshold is 5,000 coins (equivalent to $2.00 USD).</li>
                <li>Deposits used for advertising campaigns are non-refundable once the campaign has been initialized.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">4. Affiliate Program</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                The affiliate program is designed for genuine user growth. Self-referral via multiple accounts is strictly prohibited and monitored by our identity nodes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">5. Limitation of Liability</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Ads Predia acts as a marketplace. We are not responsible for the content of advertising campaigns created by users. We reserve the right to remove any task that violates global safety standards.
              </p>
            </section>

            <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Termination Authority</h3>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                Ads Predia reserves the right to suspend or terminate access to any user at our sole discretion, without prior notice, if these terms are violated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
