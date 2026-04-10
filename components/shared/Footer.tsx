'use client';

import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#130B2C] text-white py-6 px-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left: Powered By */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400">Powered by</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xl font-black text-white leading-none tracking-tight">AKIJ</span>
              <span className="text-[10px] font-bold text-white bg-slate-500 px-1 py-0.5 rounded-xs leading-none">RESOURCE</span>
            </div>
          </div>
        </div>

        {/* Right: Contact Info */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-300">Helpline</span>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Phone size={14} className="text-slate-400" />
              <span>+88 011020202505</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-sm">
            <Mail size={14} className="text-slate-400" />
            <span>support@akij.work</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
