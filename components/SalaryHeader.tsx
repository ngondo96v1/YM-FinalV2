
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

const SalaryHeader: React.FC<Props> = ({ config, summary, onUpdate, user, onLogout, onExport, onImport }) => {
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

  return (
    <div className="bg-zinc-950 pt-12 pb-6 px-5 rounded-b-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-b border-zinc-800/50 sticky top-0 z-50">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <i className="fa-solid fa-wallet text-zinc-950 text-xl"></i>
            </div>
            <div>
                <h1 className="text-xl font-black text-white tracking-tighter uppercase">YM <span className="text-orange-500">Money</span></h1>
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

      {/* Main Income Dashboard */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em]">Thực nhận dự kiến</p>
            <div className="bg-zinc-950/80 px-2 py-1 rounded-lg border border-zinc-800/50 flex items-center space-x-1">
              <span className="text-[9px] font-black text-green-500 uppercase">{summary.totalWorkDays} CÔNG</span>
            </div>
          </div>
          
          <h3 className="text-4xl font-black text-white tracking-tighter mb-6">{formatCurrency(summary.netIncome)}</h3>

          {/* Core Configuration - Gộp Lương cơ bản và BHXH */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-800/50">
            <div onClick={() => startEdit('baseSalary')} className="cursor-pointer group/item">
               <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1 group-hover/item:text-orange-500 transition-colors">Lương cơ bản <i className="fa-solid fa-pen text-[6px]"></i></p>
               {isEditing === 'baseSalary' ? (
                 <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={(e) => setTempValue(formatInputNumber(e.target.value))} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="bg-transparent text-sm font-black text-white outline-none w-full border-b border-orange-500/50" />
               ) : (
                 <p className="text-sm font-black text-white">{formatCurrency(config.baseSalary)}</p>
               )}
            </div>
            <div onClick={() => startEdit('insuranceSalary')} className="cursor-pointer group/item text-right">
               <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1 group-hover/item:text-orange-500 transition-colors"><i className="fa-solid fa-pen text-[6px] mr-1"></i> Lương BHXH</p>
               {isEditing === 'insuranceSalary' ? (
                 <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={(e) => setTempValue(formatInputNumber(e.target.value))} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="bg-transparent text-sm font-black text-white outline-none w-full text-right border-b border-orange-500/50" />
               ) : (
                 <p className="text-sm font-black text-white">{formatCurrency(config.insuranceSalary || 0)}</p>
               )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-b border-zinc-800/50">
            <div onClick={() => startEdit('standardWorkDays')} className="cursor-pointer group/item">
               <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1 group-hover/item:text-orange-500 transition-colors">Công chuẩn <i className="fa-solid fa-pen text-[6px]"></i></p>
               {isEditing === 'standardWorkDays' ? (
                 <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="bg-transparent text-sm font-black text-white outline-none w-full border-b border-orange-500/50" />
               ) : (
                 <p className="text-sm font-black text-white">{config.standardWorkDays} NGÀY</p>
               )}
            </div>
            <div className="text-right">
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Nghỉ phép/Bệnh</p>
                <div className="flex justify-end space-x-2">
                   <span className="text-[10px] font-black text-green-500">{summary.usedAnnualLeave} Phép</span>
                   <span className="text-[10px] font-black text-rose-500">{summary.usedSickLeave} Bệnh</span>
                </div>
            </div>
          </div>

          <button 
            onClick={() => setIsDetailed(!isDetailed)}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-1 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-orange-500 transition-colors"
          >
            <span>{isDetailed ? 'Thu gọn' : 'Phân tích chi tiết thu nhập'}</span>
            <i className={`fa-solid fa-chevron-down text-[7px] transition-transform ${isDetailed ? 'rotate-180' : ''}`}></i>
          </button>

          {isDetailed && (
            <div className="mt-6 space-y-4 pt-4 border-t border-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800/30">
                      <p className="text-[7px] text-zinc-500 font-black uppercase mb-1">Giá trị 1 công</p>
                      <p className="text-[11px] font-black text-zinc-300">{formatCurrency(summary.dailyRate)}</p>
                   </div>
                   <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800/30">
                      <p className="text-[7px] text-zinc-500 font-black uppercase mb-1">Giá trị 1h OT</p>
                      <p className="text-[11px] font-black text-zinc-300">{formatCurrency(summary.hourlyRate)}</p>
                   </div>
                </div>

                {/* Phần chi tiết tăng ca đã sửa tên và định dạng */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                   <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-800/30 text-center">
                      <p className="text-[6px] text-zinc-600 font-black uppercase mb-0.5">Ngày thường</p>
                      <p className="text-[10px] font-black text-white">{summary.otHoursNormal}h</p>
                   </div>
                   <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-800/30 text-center">
                      <p className="text-[6px] text-zinc-600 font-black uppercase mb-0.5">Chủ nhật</p>
                      <p className="text-[10px] font-black text-orange-500">{summary.otHoursSunday}h</p>
                   </div>
                   <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-800/30 text-center">
                      <p className="text-[6px] text-zinc-600 font-black uppercase mb-0.5">Lễ (x2/x3)</p>
                      <p className="text-[10px] font-black text-indigo-400">
                        {summary.otHoursHolidayX2}/{summary.otHoursHolidayX3}
                      </p>
                   </div>
                   <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-800/30 text-center">
                      <p className="text-[6px] text-zinc-600 font-black uppercase mb-0.5">Phụ cấp Đêm</p>
                      <p className="text-[10px] font-black text-zinc-300">{summary.otHoursNightExtra}h</p>
                   </div>
                </div>
                
                <div className="space-y-2 px-1 border-t border-zinc-800/30 pt-4">
                   <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Lương ngày công:</span><span className="text-white">{formatCurrency(summary.baseIncome)}</span></div>
                   <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Tiền tăng ca:</span><span className="text-white">{formatCurrency(summary.otIncome)}</span></div>
                   <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Tổng phụ cấp:</span><span className="text-white">{formatCurrency(summary.totalAllowances)}</span></div>
                   <div className="flex justify-between text-[10px] font-bold pt-2 border-t border-zinc-800/30">
                      <span className="text-rose-500">BHXH (10.5%):</span>
                      <span className="text-rose-500">-{formatCurrency(summary.insuranceDeduction)}</span>
                   </div>
                   {summary.personalTax > 0 && (
                     <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-rose-500">Thuế TNCN:</span>
                        <span className="text-rose-500">-{formatCurrency(summary.personalTax)}</span>
                     </div>
                   )}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryHeader;
