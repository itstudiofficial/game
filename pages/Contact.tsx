
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5">
          <h2 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Support Channels</h2>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-8 leading-none">
            Get In <span className="text-indigo-600">Touch</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12">
            Have questions about payouts, campaign targeting, or enterprise bulk pricing? Our global support team is ready to assist you.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Identity</p>
                <p className="text-base font-black text-slate-800">adspredia@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                <i className="fa-brands fa-facebook"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Facebook Node</p>
                <p className="text-base font-black text-slate-800">AdsPredia Official</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-rose-200 transition-all group">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 text-lg group-hover:bg-rose-600 group-hover:text-white transition-all">
                <i className="fa-brands fa-instagram"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Instagram Feed</p>
                <p className="text-base font-black text-slate-800">@adspredia_official</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <i className="fa-brands fa-telegram"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Telegram Signal</p>
                <p className="text-base font-black text-slate-800">@adspredia_official</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-headset"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Help Desk</p>
                <p className="text-base font-black text-slate-800">Open 24/7 Support Ticket</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-[3.5rem] p-12 md:p-16 border border-slate-100 shadow-2xl shadow-indigo-100/50">
            {submitted ? (
              <div className="text-center py-20 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                  <i className="fa-solid fa-check"></i>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Transmission Received</h3>
                <p className="text-slate-500 font-medium">Thank you for reaching out. A platform representative will respond within 24 operational hours.</p>
                <button onClick={() => setSubmitted(false)} className="mt-10 text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Full Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Email Identity</label>
                    <input required type="email" placeholder="adspredia@gmail.com" className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 shadow-inner" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Inquiry Department</label>
                  <select className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 shadow-inner appearance-none">
                    <option>Campaign Support</option>
                    <option>Withdrawal Issues</option>
                    <option>Partnership/Affiliate</option>
                    <option>Security & Fraud</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Your Message</label>
                  <textarea required rows={5} placeholder="Describe your request in detail..." className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 leading-relaxed shadow-inner"></textarea>
                </div>
                <button type="submit" className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs">
                  Send Inquiry
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
