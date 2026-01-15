
import React, { useState, useCallback } from 'react';
import { SalaryConfig, PayrollSummary } from '../types';
import { formatCurrency, formatInputNumber, parseInputNumber } from '../utils';

interface Props {
  config: SalaryConfig;
  summary: PayrollSummary;
  onUpdate: (field: keyof SalaryConfig, value: number) => void;
  user: { name: string } | null;
  onLogout: () => void;
}

const SalaryHeader: React.FC<Props> = ({ config, summary, onUpdate, user, onLogout }) => {
  const [isEditing, setIsEditing] = useState<keyof SalaryConfig | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const startEdit = useCallback((field: keyof SalaryConfig) => {
    setIsEditing(field);
    const currentValue = config[field];
    const initialValue = currentValue !== undefined ? currentValue.toString() : "";
    setTempValue(field.includes('Salary') ? formatInputNumber(initialValue) : initialValue);
  }, [config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isEditing?.includes('Salary')) {
      setTempValue(formatInputNumber(val));
    } else {
      setTempValue(val.replace(/[^-0-9.]/g, ''));
    }
  };

  const handleSave = () => {
    if (isEditing) {
      const isCurrencyField = isEditing.includes('Salary');
      const val = isCurrencyField ? parseInputNumber(tempValue) : parseFloat(tempValue) || 0;
      onUpdate(isEditing, val);
      setIsEditing(null);
    }
  };

  return (
    <div className="bg-zinc-950/90 backdrop-blur-2xl pt-12 pb-6 px-5 rounded-b-[3rem] shadow-2xl border-b border-zinc-800/50 sticky top-0 z-50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <i className="fa-solid fa-wallet text-zinc-950 text-xl"></i>
            </div>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tighter">YM <span className="text-orange-500">Money</span></h1>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] -mt-1">Salary Calendar</p>
            </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {user && (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)} 
                className="flex items-center space-x-2 bg-zinc-900 py-1.5 pl-1.5 pr-3 rounded-2xl border border-zinc-800 active:scale-95 transition-all"
              >
                <div className="w-7 h-7 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-xl flex items-center justify-center text-xs font-black text-zinc-950">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate max-w-[90px]">{user.name}</span>
              </button>
              
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-[100]" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 z-[101]">
                    <button 
                      type="button"
                      onClick={() => { setShowProfileMenu(false); onLogout(); }} 
                      className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors text-left"
                    >
                      <i className="fa-solid fa-right-from-bracket text-xs"></i>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Đăng xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Lương Cơ Bản */}
        <div onClick={() => startEdit('baseSalary')} className={`p-4 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-24 ${isEditing === 'baseSalary' ? 'bg-zinc-800 border-orange-500/50 shadow-lg shadow-orange-500/5' : 'bg-zinc-900 border-zinc-800'}`}>
          <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Lương Cơ Bản</p>
          {isEditing === 'baseSalary' ? (
            <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={handleInputChange} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="w-full bg-transparent text-lg font-black text-orange-500 outline-none" />
          ) : (
            <p className="text-lg font-black text-white truncate">{formatCurrency(config.baseSalary || 0)}</p>
          )}
        </div>
        {/* Lương đóng BHXH */}
        <div onClick={() => startEdit('insuranceSalary')} className={`p-4 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-24 ${isEditing === 'insuranceSalary' ? 'bg-zinc-800 border-indigo-500/50 shadow-lg shadow-indigo-500/5' : 'bg-zinc-900 border-zinc-800'}`}>
          <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Lương đóng BHXH</p>
          {isEditing === 'insuranceSalary' ? (
            <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={handleInputChange} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="w-full bg-transparent text-lg font-black text-indigo-400 outline-none" />
          ) : (
            <p className="text-lg font-black text-white truncate">{formatCurrency(config.insuranceSalary || 0)}</p>
          )}
        </div>
      </div>

      {/* Ngày Công Chuẩn (Hệ số tính lương cho tháng này) */}
      <div 
        onClick={() => startEdit('standardWorkDays')} 
        className={`p-4 rounded-3xl border transition-all cursor-pointer group flex items-center justify-between mb-3 ${isEditing === 'standardWorkDays' ? 'bg-zinc-800 border-orange-500/50 shadow-lg shadow-orange-500/5' : 'bg-zinc-900 border-zinc-800 shadow-inner'}`}
      >
        <div>
          <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Ngày Công Chuẩn (Hợp đồng)</p>
          {isEditing === 'standardWorkDays' ? (
            <div className="flex items-center space-x-2">
              <input autoFocus type="text" inputMode="numeric" value={tempValue} onChange={handleInputChange} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="w-20 bg-transparent text-xl font-black text-orange-500 outline-none border-b border-orange-500/30" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Công</span>
            </div>
          ) : (
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-black text-white">{config.standardWorkDays}</span>
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Ngày/Chu kỳ</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isEditing === 'standardWorkDays' ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-950 text-zinc-700'}`}>
          <i className="fa-solid fa-calculator text-xs"></i>
        </div>
      </div>

      {/* Thống kê nhanh từ lịch */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center border-r border-zinc-800">
           <p className="text-[7px] text-zinc-500 font-black uppercase tracking-tighter mb-1">Công Thực Tế</p>
           <span className="text-sm font-black text-white">{summary.totalWorkDays}</span>
        </div>
        <div className="flex flex-col items-center justify-center border-r border-zinc-800">
           <p className="text-[7px] text-zinc-500 font-black uppercase tracking-tighter mb-1">Phép Năm</p>
           <span className="text-sm font-black text-green-500">{summary.usedAnnualLeave}</span>
        </div>
        <div className="flex flex-col items-center justify-center">
           <p className="text-[7px] text-zinc-500 font-black uppercase tracking-tighter mb-1">Phép Bệnh</p>
           <span className="text-sm font-black text-rose-500">{summary.usedSickLeave}</span>
        </div>
      </div>
    </div>
  );
};

export default SalaryHeader;
