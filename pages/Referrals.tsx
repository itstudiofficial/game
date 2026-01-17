
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface ReferralsProps {
  user: User;
}

const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'banners'>('network');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const referralLink = `https://adspredia.site/ref/${user.id.toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bannerTemplates = [
    { 
      id: 1, 
      name: 'Modern Hero', 
      width: 1200,
      height: 630,
      bg: '#4F46E5', 
      textColor: '#FFFFFF',
      text: 'Earn Daily with Micro-Tasks',
      desc: 'Join the global elite network of earners.'
    },
    { 
      id: 2, 
      name: 'Vertical Sidebar', 
      width: 300,
      height: 600,
      bg: '#0F172A', 
      textColor: '#FFFFFF',
      text: 'Ads Predia',
      desc: 'The Future of Freelancing'
    },
    { 
      id: 3, 
      name: 'Yellow Flash', 
      width: 728,
      height: 90,
      bg: '#FACC15', 
      textColor: '#0F172A',
      text: 'Win up to 100 Coins Daily!',
      desc: 'Free Spin inside'
    }
  ];

  const downloadBanner = (template: typeof bannerTemplates[0]) => {
    setIsGenerating(template.id);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = template.width;
    canvas.height = template.height;

    // Background
    ctx.fillStyle = template.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Circle
    ctx.beginPath();
    ctx.arc(canvas.width, canvas.height, canvas.width * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();

    // Text rendering logic based on size
    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'center';
    
    if (template.height > 200) {
      // Large Banners
      ctx.font = `black ${Math.floor(canvas.width * 0.06)}px Inter, sans-serif`;
      ctx.fillText(template.text, canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.font = `bold ${Math.floor(canvas.width * 0.03)}px Inter, sans-serif`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(template.desc, canvas.width / 2, canvas.height / 2 + 40);
      
      // Referral ID Box
      ctx.globalAlpha = 1;
      const boxW = 300;
      const boxH = 60;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.roundRect((canvas.width - boxW) / 2, canvas.height - 120, boxW, boxH, 12);
      ctx.fill();
      
      ctx.fillStyle = template.textColor;
      ctx.font = 'black 18px Inter, sans-serif';
      ctx.fillText(`REF CODE: ${user.id}`, canvas.width / 2, canvas.height - 82);
    } else {
      // Horizontal Banner (Leaderboard)
      ctx.textAlign = 'left';
      ctx.font = 'black 28px Inter, sans-serif';
      ctx.fillText(template.text, 40, 45);
      
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.globalAlpha = 0.7;
      ctx.fillText(template.desc, 40, 70);
      
      ctx.globalAlpha = 1;
      ctx.textAlign = 'right';
      ctx.font = 'black 16px Inter, sans-serif';
      ctx.fillText(`USE CODE: ${user.id}`, canvas.width - 40, canvas.height / 2 + 5);
    }

    // Process Download
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `AdsPredia_Banner_${template.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsGenerating(null);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hidden Canvas for generation */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100 shadow-sm">
          Partnership Program
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Global <span className="text-indigo-600">Network</span></h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">Grow your affiliate army. Earn 10% commission on every task completed by your referrals, for life.</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'network' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className="fa-solid fa-network-wired"></i>
            Network Stats
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'banners' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className="fa-solid fa-palette"></i>
            Banner Creator
          </button>
        </div>
      </div>

      {activeTab === 'network' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-8 bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Your Unique Referral Link</h3>
              <div className="flex flex-col md:flex-row gap-4 items-center mb-10">
                <div className="flex-1 w-full p-6 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-slate-700 text-sm font-black break-all">
                  {referralLink}
                </div>
                <button 
                  onClick={handleCopy}
                  className={`w-full md:w-auto px-10 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
                  }`}
                >
                  <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  {copied ? 'Copied Link' : 'Copy Link'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                  <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total Partners</div>
                  <div className="text-4xl font-black text-indigo-900">0</div>
                </div>
                <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
                  <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Lifetime Coins</div>
                  <div className="text-4xl font-black text-emerald-900">0</div>
                </div>
                <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100">
                  <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">Active Bonus</div>
                  <div className="text-4xl font-black text-amber-900">10%</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                  <div className="relative z-10">
                    <h3 className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-8">Earning Potential</h3>
                    <p className="text-2xl font-black tracking-tight leading-snug">Earn more by doing less.</p>
                    <p className="text-sm text-indigo-100/70 mt-4 leading-relaxed">Our multi-tier system ensures that you earn commission from every task your friends complete. There is no limit to your partnership growth.</p>
                  </div>
                  <i className="fa-solid fa-users absolute -right-4 -bottom-4 text-9xl text-white/10"></i>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'banners' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {bannerTemplates.map(template => (
              <div key={template.id} className="group relative bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all">
                <div 
                  className="h-64 p-8 flex flex-col justify-center items-center text-center overflow-hidden relative"
                  style={{ backgroundColor: template.bg, color: template.textColor }}
                >
                   <h4 className="text-2xl font-black tracking-tighter mb-4 relative z-10">
                    {template.text}
                   </h4>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-8 relative z-10">
                    {template.desc}
                   </p>
                   <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-[8px] font-black tracking-widest relative z-10 border border-white/10">
                      REF CODE: {user.id}
                   </div>
                   {/* Visual accent */}
                   <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h5 className="font-black text-slate-900">{template.name}</h5>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{template.width}x{template.height} px</span>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                      <i className="fa-solid fa-expand"></i>
                    </div>
                  </div>
                  <button 
                    onClick={() => downloadBanner(template)}
                    disabled={isGenerating !== null}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isGenerating === template.id ? (
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-download"></i>
                    )}
                    {isGenerating === template.id ? 'Generating PNG...' : 'Download PNG'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-3xl font-black mb-6">Promote adspredia.site</h3>
              <p className="text-slate-400 leading-relaxed mb-8">All generated banners contain your unique referral ID baked into the image. When a user clicks your content and signs up, they are automatically linked to your account.</p>
              <div className="flex gap-4">
                <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest">PNG Support</div>
                <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest">Embedded ID</div>
              </div>
            </div>
            <i className="fa-solid fa-images absolute top-1/2 right-12 -translate-y-1/2 text-[15rem] text-white/5"></i>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;
