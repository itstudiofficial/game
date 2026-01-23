
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-sm">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-8 uppercase">Privacy Policy</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Effective Date: January 1, 2025</p>
          
          <div className="prose prose-slate max-w-none space-y-10">
            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">1. Data Collection</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Ads Predia collects essential information to facilitate our micro-tasking network. This includes your email address, chosen username, and transaction history. We do not store sensitive financial credentials on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">2. Usage of Information</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Your data is primarily used to track task completion, manage your coin vault, and ensure network security. We may use your email to send critical account updates or withdrawal confirmations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">3. AI Proof Verification</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Visual proof (screenshots) submitted during task completion are processed by our automated verification nodes. These images are stored securely and used only for audit purposes by the platform and the campaign creator.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">4. Cookie Protocol</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We use secure, functional cookies to maintain your active session and protect against unauthorized access. These are essential for the operation of the Ads Predia marketplace.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">5. Third-Party Disclosure</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We do not sell your personal information. Data may be shared with payment gateways (e.g., Payeer, Binance) only as necessary to process your withdrawal requests.
              </p>
            </section>

            <section className="p-8 bg-indigo-50 rounded-2xl border border-indigo-100">
              <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-2">Security Note</h3>
              <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                Our platform utilizes industry-standard encryption protocols. However, no digital transmission is 100% secure. We encourage users to use unique passwords for their Ads Predia account.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
