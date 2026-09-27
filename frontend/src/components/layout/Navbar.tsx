import { Calendar, User } from 'lucide-react';

interface NavbarProps {
  conflictCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ conflictCount: _conflictCount }) => {
  return (
    <header className="h-20 border-b border-slate-200 bg-white text-slate-900 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs relative overflow-hidden">
      {/* Visible Railway Train Image Layer spanning across header with clear visibility */}
      <div 
        className="absolute inset-0 bg-[url('/images/railway_header_bg.png')] bg-cover bg-right bg-no-repeat opacity-90 pointer-events-none"
        aria-hidden="true"
      />
      {/* Light gradient on left only to keep title readable while keeping train image vibrant on right */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Indian Railways Official Branding */}
      <div className="relative z-10 flex items-center space-x-3.5">
        {/* Indian Railways Circular Emblem Logo */}
        <div className="h-12 w-12 rounded-full bg-[#b91c1c] border-2 border-amber-400 flex flex-col items-center justify-center text-white shadow-sm shrink-0">
          <span className="text-[10px] font-extrabold tracking-tighter leading-none">RAIL</span>
          <span className="text-[8px] font-bold text-amber-300 leading-none">भारतीय रेल</span>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span className="font-black text-lg text-[#0f172a] tracking-tight">Resilience SIH-2026</span>
          </div>
          <p className="text-xs text-slate-600 font-semibold tracking-tight">
            AI-Powered Maintenance Block Planner
          </p>
        </div>
      </div>

      {/* Right Control Room Widgets */}
      <div className="relative z-10 flex items-center space-x-3">
        {/* AI Engine Status Widget */}
        <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-xl px-3.5 py-2 flex items-center space-x-2.5 text-xs shadow-sm backdrop-blur-md">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <div>
            <div className="text-[11px] font-bold text-emerald-800 leading-none">AI Scheduling Engine</div>
            <div className="text-[10px] font-extrabold text-emerald-600 font-mono leading-none mt-0.5">ONLINE</div>
          </div>
        </div>

        {/* Date & Time Widget */}
        <div className="bg-white/90 border border-slate-200/90 rounded-xl px-3.5 py-2 flex items-center space-x-2.5 text-xs shadow-sm backdrop-blur-md text-slate-800">
          <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
          <div className="font-mono">
            <div className="text-[11px] font-bold text-slate-600 leading-none">Thu, 28 Sept 2026</div>
            <div className="text-[11px] font-extrabold text-slate-900 leading-none mt-0.5">10:24:18 AM</div>
          </div>
        </div>

        {/* User / Division Profile Widget */}
        <div className="bg-white/90 border border-slate-200/90 rounded-xl px-3.5 py-2 flex items-center space-x-2.5 text-xs shadow-sm backdrop-blur-md text-slate-800">
          <div className="h-7 w-7 rounded-full bg-[#0a192f] text-white flex items-center justify-center shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-900 leading-none">Operations</div>
            <div className="text-[10px] font-semibold text-slate-500 leading-none mt-0.5">North Central Railway</div>
          </div>
        </div>
      </div>
    </header>
  );
};
