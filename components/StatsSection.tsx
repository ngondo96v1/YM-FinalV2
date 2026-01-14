
import React, { useState } from 'react';
import { PayrollSummary } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  summary: PayrollSummary;
}

const StatsSection: React.FC<Props> = ({ summary }) => {
  const [isDetailed, setIsDetailed] = useState(false);

  return (
    <div className="px-5 mt-6 space-y-5">
      {/* Net Income Display */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-8 rounded-[3rem] shadow-2xl border border-zinc-800 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/5 rounded-full blur-[60px]"></div>
        
        <div className="relative z-10 text-center">
            <div className="inline-flex items-center space-x-2 mb-3 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                <i className="fa-solid fa-hand-holding-dollar text-[10px] text-orange-500"></i>
                <p className="text-orange-500 font-black text-[9px] uppercase tracking-widest">Thực nhận (Net)</p>
            </div>
            <h3 className="text-5xl font-black text-white tracking-tighter mb-1 animate-in fade-in zoom-in duration-500">{formatCurrency(summary.netIncome)}</h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Sau khi trừ BH & Thuế</p>
            
            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-6">
               <div className="flex flex-col">
                  <span className="text-zinc-600 text-[8px] uppercase font-black mb-1">Tổng lương</span>
                  <span className="text-white text-xs font-black">{formatCurrency(summary.grossIncome)}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-zinc-600 text-[8px] uppercase font-black mb-1">Bảo hiểm (10.5%)</span>
                  <span className="text-rose-500 text-xs font-black">-{formatCurrency(summary.insuranceDeduction)}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-zinc-600 text-[8px] uppercase font-black mb-1">Thuế TNCN *</span>
                  <span className="text-rose-500 text-xs font-black">-{formatCurrency(summary.personalTax)}</span>
               </div>
            </div>
            <p className="text-[7px] text-zinc-700 font-bold uppercase mt-3 tracking-widest">(*) Đã trừ phần tăng ca miễn thuế cho công nhân</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-5 rounded-[2rem] border border-zinc-800 flex items-center space-x-4">
           <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
             <i className="fa-solid fa-calendar-day text-lg"></i>
           </div>
           <div>
             <p className="text-zinc-500 text-[9px] uppercase font-black tracking-wider">Tổng công</p>
             <p className="text-white font-black text-xl">{summary.totalWorkDays}<span className="text-zinc-600 text-[11px] font-bold ml-1 uppercase">N</span></p>
           </div>
        </div>
        
        <div className="bg-zinc-900 p-5 rounded-[2rem] border border-zinc-800 flex items-center space-x-4">
           <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
             <i className="fa-solid fa-bolt text-lg"></i>
           </div>
           <div>
             <p className="text-zinc-500 text-[9px] uppercase font-black tracking-wider">Tăng ca</p>
             <p className="text-white font-black text-xl">{summary.totalOTHours}<span className="text-zinc-600 text-[11px] font-bold ml-1 uppercase">H</span></p>
           </div>
        </div>
      </div>

      {/* Detailed View Toggle */}
      <div className={`bg-zinc-900 rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isDetailed ? 'border-orange-500/30' : 'border-zinc-800'}`}>
          <button onClick={() => setIsDetailed(!isDetailed)} className="w-full p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isDetailed ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}>
                  <i className="fa-solid fa-receipt text-lg"></i>
              </div>
              <div className="text-left">
                  <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest">Phân tích lương</p>
                  <p className="text-white font-black text-lg uppercase">Chi tiết thu nhập</p>
              </div>
            </div>
            <i className={`fa-solid fa-chevron-down text-zinc-600 transition-transform ${isDetailed ? 'rotate-180' : ''}`}></i>
          </button>
          
          <div className={`transition-all duration-500 ${isDetailed ? 'max-h-[2000px] opacity-100 p-6 pt-0' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-6">
                <div className="h-px bg-zinc-800/50"></div>
                
                <div className="space-y-3">
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest px-1">Lương & Phụ cấp</p>
                    <div className="grid gap-2">
                        <div className="flex justify-between p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                            <span className="text-[11px] text-zinc-400 font-black uppercase">Lương ngày công ({summary.totalWorkDays}N)</span>
                            <span className="text-sm font-black text-white">{formatCurrency(summary.baseIncome)}</span>
                        </div>
                        <div className="flex justify-between p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                            <span className="text-[11px] text-zinc-400 font-black uppercase">Phụ cấp tổng</span>
                            <span className="text-sm font-black text-white">{formatCurrency(summary.totalAllowances)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Chi tiết tăng ca</p>
                        <span className="text-[10px] font-black text-orange-500">{formatCurrency(summary.otIncome)}</span>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex justify-between p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                            <div className="flex flex-col">
                                <span className="text-[11px] text-zinc-400 font-black uppercase">Ngày thường (x1.5)</span>
                                <span className="text-[9px] text-zinc-600 font-bold uppercase">{summary.otHoursNormal} giờ</span>
                            </div>
                            <span className="text-sm font-black text-white">{formatCurrency(summary.otAmountNormal)}</span>
                        </div>

                        <div className={`flex justify-between p-4 rounded-2xl border transition-all ${summary.otHoursNightExtra > 0 ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'bg-zinc-950/40 border-zinc-800 opacity-60'}`}>
                            <div className="flex flex-col">
                                <span className={`text-[11px] font-black uppercase ${summary.otHoursNightExtra > 0 ? 'text-indigo-400' : 'text-zinc-500'}`}>
                                  <i className="fa-solid fa-moon mr-1"></i> Tăng ca đêm (x1.8)
                                </span>
                                <span className="text-[9px] text-zinc-600 font-bold uppercase">{summary.otHoursNightExtra} giờ (Vượt mức x0.3)</span>
                            </div>
                            <span className={`text-sm font-black ${summary.otHoursNightExtra > 0 ? 'text-indigo-400' : 'text-zinc-700'}`}>{formatCurrency(summary.otAmountNightExtra)}</span>
                        </div>
                        
                        <div className="flex justify-between p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                            <div className="flex flex-col">
                                <span className="text-[11px] text-zinc-400 font-black uppercase">Chủ nhật (x2.0)</span>
                                <span className="text-[9px] text-zinc-600 font-bold uppercase">{summary.otHoursSunday} giờ</span>
                            </div>
                            <span className="text-sm font-black text-white">{formatCurrency(summary.otAmountSunday)}</span>
                        </div>

                        <div className="flex justify-between p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                            <div className="flex flex-col">
                                <span className="text-[11px] text-zinc-400 font-black uppercase">Lễ/Tết - 8h đầu (x2.0)</span>
                                <span className="text-[9px] text-zinc-600 font-bold uppercase">{summary.otHoursHolidayX2} giờ</span>
                            </div>
                            <span className="text-sm font-black text-white">{formatCurrency(summary.otAmountHolidayX2)}</span>
                        </div>

                        <div className="flex justify-between p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                            <div className="flex flex-col">
                                <span className="text-[11px] text-zinc-400 font-black uppercase">Lễ/Tết - Ngoài 8h (x3.0)</span>
                                <span className="text-[9px] text-zinc-600 font-bold uppercase">{summary.otHoursHolidayX3} giờ</span>
                            </div>
                            <span className="text-sm font-black text-white">{formatCurrency(summary.otAmountHolidayX3)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] text-rose-500/80 font-black uppercase tracking-widest px-1">Khấu trừ</p>
                    <div className="grid gap-2">
                        <div className="flex justify-between p-4 bg-zinc-950/40 rounded-2xl border border-rose-500/10">
                            <span className="text-[11px] text-zinc-500 font-black uppercase">Bảo hiểm (10.5%)</span>
                            <span className="text-sm font-black text-rose-500">-{formatCurrency(summary.insuranceDeduction)}</span>
                        </div>
                        <div className="flex justify-between p-4 bg-zinc-950/40 rounded-2xl border border-rose-500/10">
                            <span className="text-[11px] text-zinc-500 font-black uppercase">Thuế TNCN tạm tính</span>
                            <span className="text-sm font-black text-rose-500">-{formatCurrency(summary.personalTax)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-500 p-5 rounded-[2rem] flex justify-between items-center shadow-xl shadow-orange-500/10">
                    <span className="text-[10px] text-zinc-950 font-black uppercase tracking-[0.2em]">Net Thực nhận</span>
                    <span className="text-xl font-black text-zinc-950">{formatCurrency(summary.netIncome)}</span>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default StatsSection;
