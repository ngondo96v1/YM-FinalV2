
import React, { useState } from 'react';
import { PayrollSummary } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  summary: PayrollSummary;
  config: {
    standardWorkDays: number;
  };
}

const StatsSection: React.FC<Props> = ({ summary }) => {
  const [isDetailed, setIsDetailed] = useState(false);

  return (
    <div className="px-5 mt-6 space-y-4">
      {/* Primary Income Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em] mb-1">Tổng Thực Nhận</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">{formatCurrency(summary.netIncome)}</h3>
            </div>
            <div className="w-12 h-12 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center text-orange-500">
              <i className="fa-solid fa-coins text-xl"></i>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-6 border-b border-zinc-800/50">
            <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800/30">
               <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Lương Gross</p>
               <p className="text-sm font-black text-white">{formatCurrency(summary.grossIncome)}</p>
            </div>
            <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800/30">
               <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Khấu trừ (BH+Thuế)</p>
               <p className="text-sm font-black text-rose-500">-{formatCurrency(summary.insuranceDeduction + summary.personalTax)}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsDetailed(!isDetailed)}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-orange-500 transition-colors"
          >
            <span>{isDetailed ? 'Ẩn chi tiết' : 'Xem phân tích chi tiết'}</span>
            <i className={`fa-solid fa-chevron-down transition-transform ${isDetailed ? 'rotate-180' : ''}`}></i>
          </button>

          {isDetailed && (
            <div className="mt-6 space-y-6 pt-6 border-t border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 font-black uppercase">Lương ngày công ({summary.totalWorkDays}N)</span>
                    <span className="text-xs font-black text-white">{formatCurrency(summary.baseIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 font-black uppercase">Tăng ca ({summary.totalOTHours}H)</span>
                    <span className="text-xs font-black text-white">{formatCurrency(summary.otIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 font-black uppercase">Phụ cấp tổng</span>
                    <span className="text-xs font-black text-white">{formatCurrency(summary.totalAllowances)}</span>
                  </div>
                </div>

                <div className="h-px bg-zinc-800/50"></div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[8px] text-orange-500 font-black uppercase tracking-widest">Phân bổ tăng ca</p>
                      <div className="text-[10px] space-y-1">
                        <div className="flex justify-between"><span className="text-zinc-500">Ngày (x1.5):</span> <span className="text-white">{summary.otHoursNormal}h</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500">Đêm (x1.8):</span> <span className="text-white">{summary.otHoursNightExtra}h</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500">CN/Lễ:</span> <span className="text-white">{summary.otHoursSunday + summary.otHoursHolidayX2}h</span></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[8px] text-rose-500 font-black uppercase tracking-widest">Chi tiết thuế</p>
                      <div className="text-[10px] space-y-1">
                        <div className="flex justify-between"><span className="text-zinc-500">TN tính thuế:</span> <span className="text-white">{formatCurrency(summary.taxableIncome)}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500">Thuế tạm tính:</span> <span className="text-rose-500">{formatCurrency(summary.personalTax)}</span></div>
                      </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
