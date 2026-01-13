
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
      {/* Total Income Display */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-8 rounded-[3rem] shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-[60px] group-hover:scale-125 transition-transform duration-1000"></div>
        <div className="absolute left-[-20%] bottom-[-30%] w-60 h-60 bg-zinc-950/20 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2 opacity-90">
                <i className="fa-solid fa-coins text-[10px] text-orange-100"></i>
                <p className="text-orange-500 font-black text-[10px] bg-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">Dự kiến tháng này</p>
            </div>
            <h3 className="text-5xl font-black text-white tracking-tighter drop-shadow-sm">{formatCurrency(summary.totalIncome)}</h3>
            
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
               <div className="flex flex-col">
                  <span className="text-orange-100 text-[9px] uppercase font-black opacity-70 mb-1">Lương theo công ({summary.totalWorkDays})</span>
                  <span className="text-white text-base font-black">{formatCurrency(summary.baseIncome)}</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-orange-100 text-[9px] uppercase font-black opacity-70 mb-1">Tổng phụ cấp</span>
                  <span className="text-white text-base font-black">{formatCurrency(summary.totalAllowances)}</span>
               </div>
            </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-5 rounded-[2rem] border border-zinc-800 flex items-center space-x-4 shadow-lg hover:border-zinc-700 transition-all">
           <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
             <i className="fa-solid fa-calendar-day text-lg"></i>
           </div>
           <div>
             <p className="text-zinc-500 text-[9px] uppercase font-black tracking-wider">Tổng công</p>
             <p className="text-white font-black text-xl">{summary.totalWorkDays}<span className="text-zinc-600 text-[11px] font-bold ml-1 uppercase">Ngày</span></p>
           </div>
        </div>
        
        <div className="bg-zinc-900 p-5 rounded-[2rem] border border-zinc-800 flex items-center space-x-4 shadow-lg hover:border-zinc-700 transition-all">
           <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20">
             <i className="fa-solid fa-bolt text-lg"></i>
           </div>
           <div>
             <p className="text-zinc-500 text-[9px] uppercase font-black tracking-wider">Tăng ca</p>
             <p className="text-white font-black text-xl">{summary.totalOTHours}<span className="text-zinc-600 text-[11px] font-bold ml-1 uppercase">Giờ</span></p>
           </div>
        </div>
      </div>

      {/* Detailed Toggle */}
      <div 
        className={`bg-zinc-900 rounded-[2.5rem] border transition-all duration-500 overflow-hidden shadow-xl ${isDetailed ? 'border-orange-500/30' : 'border-zinc-800'}`}
      >
          <button 
            onClick={() => setIsDetailed(!isDetailed)}
            className="w-full p-6 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isDetailed ? 'bg-orange-500 border-orange-400 text-zinc-950 scale-110 shadow-lg shadow-orange-500/20' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                  <i className="fa-solid fa-chart-pie text-lg"></i>
              </div>
              <div className="text-left">
                  <p className="text-zinc-500 text-[9px] uppercase font-black tracking-[0.2em]">Báo cáo lương</p>
                  <p className="text-white font-black text-lg tracking-tight uppercase">Thống kê chi tiết</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-600 transition-all duration-500 ${isDetailed ? 'rotate-180 bg-orange-500/10 text-orange-500' : ''}`}>
               <i className="fa-solid fa-chevron-down text-[10px]"></i>
            </div>
          </button>
          
          <div className={`transition-all duration-500 ease-in-out ${isDetailed ? 'max-h-[800px] opacity-100 p-6 pt-0' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-6">
                <div className="h-px bg-zinc-800/50"></div>

                <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="space-y-1">
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Đơn giá ngày</p>
                        <p className="text-sm font-black text-white">{formatCurrency(summary.dailyRate)}</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-800"></div>
                    <div className="space-y-1 text-right">
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Đơn giá giờ</p>
                        <p className="text-sm font-black text-white">{formatCurrency(summary.hourlyRate)}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.1em] px-1">Chi tiết tiền tăng ca</p>
                    <div className="grid gap-3">
                        {[
                            { label: 'Ngày thường', factor: 'x1.5', hours: summary.otHoursNormal, amount: summary.otAmountNormal, color: 'border-orange-500/20' },
                            { label: 'Chủ nhật', factor: 'x2.0', hours: summary.otHoursSunday, amount: summary.otAmountSunday, color: 'border-blue-500/20' },
                            { label: 'Lễ (≤ 8h)', factor: 'x2.0', hours: summary.otHoursHolidayX2, amount: summary.otAmountHolidayX2, color: 'border-green-500/20' },
                            { label: 'Lễ (> 8h)', factor: 'x3.0', hours: summary.otHoursHolidayX3, amount: summary.otAmountHolidayX3, color: 'border-red-500/20' }
                        ].map((item, idx) => (
                            <div key={idx} className={`flex justify-between items-center p-4 bg-zinc-950/40 rounded-2xl border ${item.color} shadow-sm group hover:scale-[1.02] transition-transform`}>
                                <div className="space-y-0.5">
                                    <p className="text-[11px] text-white font-black uppercase">{item.label} <span className="text-orange-500 ml-1">{item.factor}</span></p>
                                    <p className="text-[10px] text-zinc-600 font-bold">{item.hours} giờ</p>
                                </div>
                                <span className="text-base font-black text-white">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-orange-500/5 p-5 rounded-[2rem] border border-orange-500/20 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-orange-500/60 font-black uppercase tracking-[0.2em] mb-1">Tổng cộng tăng ca</p>
                        <p className="text-xl font-black text-white">{formatCurrency(summary.otIncome)}</p>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-dots text-orange-500 text-2xl opacity-40"></i>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default StatsSection;
