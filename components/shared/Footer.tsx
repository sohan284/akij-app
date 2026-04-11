'use client';

import { Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import logoFooter from '@/app/assets/logoFooter.png';

export default function Footer() {
  return (
    <footer className="bg-[#130B2C] text-white py-6 px-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left: Powered By */}
        <div className="flex items-center gap-2">
          <span className="text-sm lg:text-[20px] font-medium text-slate-400">Powered by</span>
          <Image
            src={logoFooter}
            alt="Akij Resource"
            width={116}
            height={32}
            className="h-6 lg:h-8  w-auto object-contain"
          />
        </div>

        {/* Right: Contact Info */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-300">Helpline</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <Phone size={14} className="text-slate-400" />
              <span>+88 011020202505</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5">
            <Mail size={14} className="text-slate-400" />
            <span>support@akij.work</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
