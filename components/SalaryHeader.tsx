
import React, { useState, useCallback } from 'react';
import { SalaryConfig, PayrollSummary } from '../types';
import { formatCurrency, formatInputNumber, parseInputNumber } from '../utils';

interface Props {
  config: SalaryConfig;
  summary: PayrollSummary;
  onUpdate: (field: keyof SalaryConfig, value: number) => void;
  user: { name: string } | null;
  onLogout: () => void;
  onExport: () => void;
  onImport: () => void;
}

const SalaryHeader: React.FC<Props> = ({ 
  config, summary, onUpdate, user, onLogout, onExport, onImport
}) => {
  const [isEditing, setIsEditing] = useState<keyof SalaryConfig | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDetailed, setIsDetailed] = useState(false);

  const startEdit = useCallback((field: keyof SalaryConfig) => {
    setIsEditing(field);
    const currentValue = config[field];
    const initialValue = currentValue !== undefined ? currentValue.toString() : "";
    setTempValue(field.includes('Salary') ? formatInputNumber(initialValue) : initialValue);
  }, [config]);

  const handleSave = () => {
    if (isEditing) {
      const isCurrencyField = isEditing.includes('Salary');
      const val = isCurrencyField ? parseInputNumber(tempValue) : parseFloat(tempValue) || 0;
      onUpdate(isEditing, val);
      setIsEditing(null);
    }
  };

  const hasHolidayOT = summary.otHoursHolidayX2 > 0 || summary.otHoursHolidayX3 > 0 || summary.usedTetLeave > 0;

  return (
    <div className="bg-zinc-950 pt-12 pb-6 px-5 rounded-b-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-b border-zinc-800/50 sticky top-0 z-50 glass-header">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all ${hasHolidayOT ? 'bg-gradient-to-br from-red-600 to-amber-600 shadow-red-500/30' : 'bg-orange-500 shadow-orange-500/20'}`}>
                <i className="fa-solid fa-wallet text-zinc-950 text-xl"></i>
            </div>
            <div>
                <h1 className="text-xl font-black text-white tracking-tighter uppercase">YM <span className={`${hasHolidayOT ? 'text-amber-500 text-glow-vivid' : 'text-orange-500'}`}>Money</span></h1>
            </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className="w-10 h-10 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center text-orange-500 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-bars-staggered"></i>
          </button>
          
          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowProfileMenu(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 z-[101] overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800/50 mb-1">
                  <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Tài khoản</p>
                  <p className="text-xs font-black text-white truncate">{user?.name}</p>
                </div>
                <button onClick={() => { setShowProfileMenu(false); onImport(); }} className="w-full flex items-center space-x-3 p-3 text-zinc-400 hover:bg-zinc-800 rounded-xl transition-colors text-left">
                  <i className="fa-solid fa-file-import text-[10px]"></i>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Nhập Dữ Liệu</span>
                </button>
                <button onClick={() => { setShowProfileMenu(false); onExport(); }} className="w-full flex items-center space-x-3 p-3 text-zinc-400 hover:bg-zinc-800 rounded-xl transition-colors text-left">
                  <i className="fa-solid fa-file-export text-[10px]"></i>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Xuất Backup</span>
                </button>
                <button onClick={onLogout} className="w-full flex items-center space-x-3 p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-left mt-1 border-t border-zinc-800/50">
                  <i className="fa-solid fa-power-off text-[10px]"></i>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Dashboard Card */}
      <div className={`bg-gradient-to-br from-zinc-900 to-zinc-950 border rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group transition-all duration-700 ${hasHolidayOT ? 'border-amber-500/40 gold-shimmer shadow-red-900/10' : 'border-zinc-800'}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full ${hasHolidayOT ? 'bg-red-500/15' : 'bg-orange-500/5'}`}></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${hasHolidayOT ? 'text-amber-500' : 'text-orange-500'}`}>
              Thực nhận dự kiến
            </p>
            <div className="flex items-center space-x-1.5">
              <div className={`px-2 py-1 rounded-lg border flex items-center space-x-1 ${hasHolidayOT ? 'bg-red-600/30 border-red-500/40' : 'bg-zinc-950/80 border-zinc-800/50'}`}>
                <span className={`text-[9px] font-black uppercase ${hasHolidayOT ? 'text-yellow-400' : 'text-green-500'}`}>{summary.totalWorkDays} CÔNG</span>
              </div>
            </div>
          </div>
          
          <h3 className={`text-4xl font-black tracking-tighter mb-8 ${hasHolidayOT ? 'text-white text-glow-vivid' : 'text-white'}`}>{formatCurrency(summary.netIncome)}</h3>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-1 pt-4 border-t border-zinc-800/50">
            <div onClick={() => startEdit('baseSalary')} className="cursor-pointer group/item px-1">
               <p className="text-[7px] text-zinc-500 font-black uppercase tracking-widest mb-1 group-hover/item:text-orange-500 transition-colors">Lương cơ bản</p>
               {isEditing === 'baseSalary' ? (
                 <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={(e) => setTempValue(formatInputNumber(e.target.value))} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="bg-transparent text-[11px] font-black text-white outline-none w-full border-b border-orange-500" />
               ) : (
                 <p className="text-[11px] font-black text-white truncate">{formatCurrency(config.baseSalary)}</p>
               )}
            </div>
            
            <div onClick={() => startEdit('standardWorkDays')} className="cursor-pointer group/item text-center border-x border-zinc-800/30 px-1">
               <p className="text-[7px] text-zinc-500 font-black uppercase tracking-widest mb-1 group-hover/item:text-orange-500 transition-colors">Công chuẩn</p>
               {isEditing === 'standardWorkDays' ? (
                 <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="bg-transparent text-[11px] font-black text-white outline-none w-full text-center border-b border-orange-500" />
               ) : (
                 <p className="text-[11px] font-black text-white">{config.standardWorkDays} Ngày</p>
               )}
            </div>

            <div onClick={() => startEdit('insuranceSalary')} className="cursor-pointer group/item text-right px-1">
               <p className="text-[7px] text-zinc-500 font-black uppercase tracking-widest mb-1 group-hover/item:text-orange-500 transition-colors">Lương BHXH</p>
               {isEditing === 'insuranceSalary' ? (
                 <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={(e) => setTempValue(formatInputNumber(e.target.value))} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="bg-transparent text-[11px] font-black text-white outline-none w-full text-right border-b border-orange-500" />
               ) : (
                 <p className="text-[11px] font-black text-white truncate">{formatCurrency(config.insuranceSalary || 0)}</p>
               )}
            </div>
          </div>

          <button 
            onClick={() => setIsDetailed(!isDetailed)}
            className={`w-full mt-6 flex items-center justify-center space-x-2 py-2 rounded-2xl border border-dashed transition-all ${isDetailed ? 'bg-zinc-800/50 border-zinc-700' : 'bg-transparent border-zinc-800 hover:border-zinc-700'} ${hasHolidayOT ? 'text-amber-500 border-amber-500/20' : 'text-zinc-500'}`}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isDetailed ? 'Thu gọn bảng kê' : 'Xem chi tiết lương & OT'}</span>
            <i className={`fa-solid fa-chevron-down text-[7px] transition-transform duration-500 ${isDetailed ? 'rotate-180' : ''}`}></i>
          </button>

          {/* Detailed Breakdown - TỐI ƯU GỌN GÀNG */}
          {isDetailed && (
            <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                
                {/* Section 1: Thu nhập chính */}
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                        <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Thu nhập chính</p>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/30">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">Lương công nhật ({summary.totalWorkDays} công)</span>
                            <span className="text-[11px] text-white font-black">{formatCurrency(summary.baseIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/30">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">Tổng phụ cấp tháng</span>
                            <span className="text-[11px] text-green-500 font-black">+{formatCurrency(summary.totalAllowances)}</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Tăng ca (OT) */}
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="w-1 h-3 bg-orange-500 rounded-full"></div>
                        <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Thống kê tăng ca (OT)</p>
                    </div>
                    <div className="bg-zinc-950/40 rounded-2xl border border-zinc-800/30 overflow-hidden">
                        <div className="p-4 border-b border-zinc-800/30 flex justify-between items-center">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">Tiền OT tạm tính</span>
                            <span className="text-[13px] text-orange-500 font-black">+{formatCurrency(summary.otIncome)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-zinc-800/20">
                            <div className="p-3 bg-[#0c0c0e]">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[7px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded-md font-black">x1.5</span>
                                    <span className="text-[8px] text-zinc-600 font-bold uppercase">Thường</span>
                                </div>
                                <p className="text-[12px] font-black text-white">{summary.otHoursNormal}h</p>
                            </div>
                            <div className="p-3 bg-[#0c0c0e]">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[7px] px-1.5 py-0.5 bg-red-950/50 text-red-500 rounded-md font-black">x2.0</span>
                                    <span className="text-[8px] text-zinc-600 font-bold uppercase">Chủ nhật</span>
                                </div>
                                <p className="text-[12px] font-black text-white">{summary.otHoursSunday}h</p>
                            </div>
                            <div className="p-3 bg-[#0c0c0e]">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[7px] px-1.5 py-0.5 bg-amber-950/50 text-amber-500 rounded-md font-black">x2.0</span>
                                    <span className="text-[8px] text-zinc-600 font-bold uppercase">Lễ đầu</span>
                                </div>
                                <p className="text-[12px] font-black text-white">{summary.otHoursHolidayX2}h</p>
                            </div>
                            <div className="p-3 bg-[#0c0c0e]">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[7px] px-1.5 py-0.5 bg-red-900 text-white rounded-md font-black">x3.0</span>
                                    <span className="text-[8px] text-zinc-600 font-bold uppercase">Lễ sau</span>
                                </div>
                                <p className="text-[12px] font-black text-white">{summary.otHoursHolidayX3}h</p>
                            </div>
                        </div>
                        <div className="p-3 bg-indigo-500/5 flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[7px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-md font-black">+0.3</span>
                                <span className="text-[8px] text-zinc-500 font-bold uppercase">Phụ trội đêm (>{summary.otHoursNightExtra}h)</span>
                            </div>
                            <span className="text-[10px] text-indigo-400 font-black">{formatCurrency(summary.otAmountNightExtra)}</span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Khấu trừ */}
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="w-1 h-3 bg-rose-500 rounded-full"></div>
                        <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Khấu trừ & Thuế</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-rose-500/5 p-3 rounded-2xl border border-rose-500/10">
                            <p className="text-[8px] text-rose-500/70 font-black uppercase mb-1">BHXH (10.5%)</p>
                            <p className="text-[11px] font-black text-rose-500">-{formatCurrency(summary.insuranceDeduction)}</p>
                        </div>
                        <div className="bg-rose-500/5 p-3 rounded-2xl border border-rose-500/10">
                            <p className="text-[8px] text-rose-500/70 font-black uppercase mb-1">Thuế TNCN</p>
                            <p className="text-[11px] font-black text-rose-500">-{formatCurrency(summary.personalTax)}</p>
                        </div>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="flex justify-around items-center pt-2 opacity-50">
                    <div className="text-center">
                        <p className="text-[7px] text-zinc-600 font-black uppercase">1 Công</p>
                        <p className="text-[9px] text-zinc-400 font-black">{formatCurrency(summary.dailyRate)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[7px] text-zinc-600 font-black uppercase">1 Giờ OT</p>
                        <p className="text-[9px] text-zinc-400 font-black">{formatCurrency(summary.hourlyRate)}</p>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryHeader;
