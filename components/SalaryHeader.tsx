
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
  const [showTaxSection, setShowTaxSection] = useState(false);

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

      <div className={`bg-gradient-to-br from-zinc-900 to-zinc-950 border rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group transition-all duration-700 ${hasHolidayOT ? 'border-amber-500/40 gold-shimmer shadow-red-900/10' : 'border-zinc-800'}`}>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${hasHolidayOT ? 'text-amber-500' : 'text-orange-500'}`}>Thực nhận dự kiến</p>
            <div className="px-2 py-1 rounded-lg border bg-zinc-950/80 border-zinc-800/50">
               <span className="text-[9px] font-black uppercase text-green-500">{summary.totalWorkDays} CÔNG</span>
            </div>
          </div>
          
          <h3 className="text-4xl font-black tracking-tighter mb-8 text-white">{formatCurrency(summary.netIncome)}</h3>

          <div className="grid grid-cols-4 gap-1 pt-4 border-t border-zinc-800/50">
            {[
               { key: 'baseSalary', label: 'Lương cơ bản', format: true },
               { key: 'standardWorkDays', label: 'Ngày chuẩn', format: false },
               { key: 'insuranceSalary', label: 'Lương BH', format: true },
               { key: 'dependents', label: 'N.Phụ thuộc', format: false }
            ].map((field) => (
              <div key={field.key} onClick={() => startEdit(field.key as keyof SalaryConfig)} className="cursor-pointer group/item px-1 text-center">
                 <p className="text-[7px] text-zinc-500 font-black uppercase tracking-widest mb-1 group-hover/item:text-orange-500">{field.label}</p>
                 {isEditing === field.key ? (
                   <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={(e) => setTempValue(field.format ? formatInputNumber(e.target.value) : e.target.value)} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="bg-transparent text-[10px] font-black text-white outline-none w-full border-b border-orange-500 text-center" />
                 ) : (
                   <p className="text-[10px] font-black text-white truncate">{field.format ? formatCurrency(config[field.key as keyof SalaryConfig] as number) : config[field.key as keyof SalaryConfig]}</p>
                 )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button onClick={() => setIsDetailed(!isDetailed)} className="flex items-center justify-center space-x-2 py-2.5 rounded-2xl border border-dashed text-zinc-500 border-zinc-800 transition-all hover:bg-zinc-800/20 active:scale-95">
                <span className="text-[8px] font-black uppercase tracking-widest">{isDetailed ? 'Ẩn tăng ca' : 'Chi tiết OT'}</span>
                <i className={`fa-solid fa-chevron-down text-[6px] transition-transform duration-500 ${isDetailed ? 'rotate-180' : ''}`}></i>
            </button>
            <button onClick={() => setShowTaxSection(!showTaxSection)} className={`flex items-center justify-center space-x-2 py-2.5 rounded-2xl border border-dashed transition-all active:scale-95 ${showTaxSection ? 'text-rose-500 border-rose-500/30 bg-rose-500/5' : 'text-zinc-500 border-zinc-800'}`}>
                <span className="text-[8px] font-black uppercase tracking-widest">{showTaxSection ? 'Ẩn thuế & BH' : 'Xem thuế & BH'}</span>
                <i className={`fa-solid fa-shield-halved text-[7px] transition-all ${showTaxSection ? 'scale-110 opacity-100' : 'opacity-40'}`}></i>
            </button>
          </div>

          {(isDetailed || showTaxSection) && (
            <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                {isDetailed && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                                <p className="text-[9px] text-white font-black uppercase tracking-widest">Thống kê tăng ca</p>
                            </div>
                            <span className="text-[11px] text-amber-500 font-black">{formatCurrency(summary.otIncome)}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pl-1">
                            {[
                                { label: 'Ngày thường (x1.5)', hours: summary.otHoursNormal, amount: summary.otAmountNormal, color: 'border-zinc-800/50', icon: 'fa-calendar-day' },
                                { label: 'Chủ nhật (x2.0)', hours: summary.otHoursSunday, amount: summary.otAmountSunday, color: 'border-rose-900/30', icon: 'fa-calendar-check', textColor: 'text-rose-400' },
                                { label: 'Lễ (8h - x2.0)', hours: summary.otHoursHolidayX2, amount: summary.otAmountHolidayX2, color: 'border-amber-900/30', icon: 'fa-star', textColor: 'text-amber-500' },
                                { label: 'Lễ (Sau 8h - x3.0)', hours: summary.otHoursHolidayX3, amount: summary.otAmountHolidayX3, color: 'border-amber-900/50', icon: 'fa-bolt', textColor: 'text-amber-400' },
                            ].map((item, idx) => (
                                <div key={idx} className={`bg-zinc-950/40 p-3 rounded-2xl border ${item.color} flex flex-col justify-between h-full`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <i className={`fa-solid ${item.icon} text-[10px] opacity-30`}></i>
                                        <span className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">{item.hours} GIỜ</span>
                                    </div>
                                    <div>
                                        <p className={`text-[8px] font-black uppercase mb-0.5 leading-tight ${item.textColor || 'text-zinc-500'}`}>{item.label}</p>
                                        <p className="text-[10px] text-white font-black">{formatCurrency(item.amount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showTaxSection && (
                    <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                                <p className="text-[9px] text-white font-black uppercase tracking-widest">Khấu trừ & Thuế</p>
                            </div>
                            <span className="text-[11px] text-rose-500 font-black">-{formatCurrency(summary.insuranceDeduction + summary.personalTax)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pl-1">
                            <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/30">
                                <p className="text-[7px] text-zinc-600 font-black uppercase mb-1">BHXH (10.5%)</p>
                                <p className="text-[11px] text-rose-500 font-black">-{formatCurrency(summary.insuranceDeduction)}</p>
                            </div>
                            <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/30">
                                <p className="text-[7px] text-zinc-600 font-black uppercase mb-1">Thuế TNCN</p>
                                <p className="text-[11px] text-rose-500 font-black">-{formatCurrency(summary.personalTax)}</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50 flex justify-between items-center">
                            <p className="text-[7px] text-zinc-500 font-black uppercase tracking-widest">Thu nhập miễn thuế (OT phụ trội)</p>
                            <span className="text-[9px] text-green-500 font-black">{formatCurrency(summary.taxExemptIncome)}</span>
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryHeader;
