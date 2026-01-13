
import React, { useState, useCallback } from 'react';
import { SalaryConfig } from '../types';
import { formatCurrency, formatInputNumber, parseInputNumber } from '../utils';

interface Props {
  config: SalaryConfig;
  onUpdate: (field: keyof SalaryConfig, value: number) => void;
  user: { name: string } | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

const SalaryHeader: React.FC<Props> = ({ config, onUpdate, user, onAuthClick, onLogout }) => {
  const [isEditing, setIsEditing] = useState<keyof SalaryConfig | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const startEdit = useCallback((field: keyof SalaryConfig) => {
    setIsEditing(field);
    const initialValue = config[field].toString();
    setTempValue(field === 'baseSalary' ? formatInputNumber(initialValue) : initialValue);
  }, [config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isEditing === 'baseSalary') {
      setTempValue(formatInputNumber(val));
    } else {
      setTempValue(val.replace(/[^-0-9.]/g, ''));
    }
  };

  const handleSave = () => {
    if (isEditing) {
      const val = isEditing === 'baseSalary' ? parseInputNumber(tempValue) : parseFloat(tempValue) || 0;
      onUpdate(isEditing, val);
      setIsEditing(null);
    }
  };

  return (
    <div className="bg-zinc-950/80 backdrop-blur-xl pt-10 pb-6 px-5 rounded-b-[2.5rem] shadow-2xl border-b border-zinc-800/50 sticky top-0 z-50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                <i className="fa-solid fa-wallet text-zinc-950 text-xl"></i>
            </div>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tighter">YM <span className="text-orange-500">Final V1</span></h1>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] -mt-1">Salary Calendar</p>
            </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {user && (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-zinc-900 py-1.5 pl-1.5 pr-3 rounded-2xl border border-zinc-800 active:scale-95 transition-all hover:border-zinc-700"
              >
                <div className="w-7 h-7 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-xl flex items-center justify-center text-xs font-black text-zinc-950 shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate max-w-[90px]">{user.name}</span>
              </button>
              
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-zinc-800 mb-1">
                        <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Tài khoản</p>
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    </div>
                    <button 
                      onClick={() => { onLogout(); setShowProfileMenu(false); }}
                      className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors group"
                    >
                      <i className="fa-solid fa-right-from-bracket text-xs group-hover:translate-x-0.5 transition-transform"></i>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Đăng xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => startEdit('baseSalary')}
          className={`p-4 rounded-[2rem] border transition-all cursor-pointer group flex flex-col justify-between min-h-[90px] ${isEditing === 'baseSalary' ? 'bg-zinc-800 border-orange-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'}`}
        >
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Lương cơ bản</p>
            <i className="fa-solid fa-pen text-[8px] text-zinc-700 group-hover:text-orange-500 transition-colors"></i>
          </div>
          {isEditing === 'baseSalary' ? (
            <input 
              autoFocus
              type="text"
              inputMode="numeric"
              value={tempValue}
              onChange={handleInputChange}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-transparent text-xl font-black text-orange-500 outline-none mt-1"
            />
          ) : (
            <p className="text-xl font-black text-white group-hover:text-orange-500 transition-colors truncate">{formatCurrency(config.baseSalary)}</p>
          )}
        </div>

        <div 
          onClick={() => startEdit('standardWorkDays')}
          className={`p-4 rounded-[2rem] border transition-all cursor-pointer group flex flex-col justify-between min-h-[90px] ${isEditing === 'standardWorkDays' ? 'bg-zinc-800 border-orange-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'}`}
        >
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Công chuẩn</p>
            <i className="fa-solid fa-circle-check text-[8px] text-zinc-700 group-hover:text-orange-500 transition-colors"></i>
          </div>
          {isEditing === 'standardWorkDays' ? (
            <input 
              autoFocus
              type="text"
              inputMode="numeric"
              value={tempValue}
              onChange={handleInputChange}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-transparent text-xl font-black text-orange-500 outline-none mt-1"
            />
          ) : (
            <p className="text-xl font-black text-white group-hover:text-orange-500 transition-colors">
              {config.standardWorkDays} <span className="text-[10px] font-bold text-zinc-600">NGÀY</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryHeader;
