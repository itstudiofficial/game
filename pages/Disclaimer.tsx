
import React from 'react';

const Disclaimer: React.FC = () => {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-sm">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-8 uppercase">Disclaimer</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Network Transparency Protocol</p>
          
          <div className="prose prose-slate max-w-none space-y-10">
            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">1. No Earnings Guarantee</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Ads Predia is a performance-based marketplace. There is no guarantee of specific income. Your earnings depend entirely on the number and quality of tasks completed and successfully verified by the system and campaign creators.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">2. Not Financial Advice</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Content on this platform, including withdrawal methods via cryptocurrency or other gateways, is for informational purposes only. It does not constitute financial or investment advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">3. Third-Party Links</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Tasks in the Marketplace often direct users to third-party websites or apps. Ads Predia does not endorse, control, or take responsibility for the content, privacy policies, or security of any third-party asset.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">4. Platform Availability</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We strive for 100% uptime, but we do not guarantee uninterrupted access to the network. Periodic maintenance or unforeseen technical issues may affect access to your account or task marketplace.
              </p>
            </section>

            <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                <i className="fa-solid fa-circle-info"></i>
              </div>
              <p className="text-xs font-bold text-amber-900 leading-relaxed">
                By using Ads Predia, you acknowledge that you are using the platform at your own risk and responsibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
