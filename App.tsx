
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  DayData, 
  SalaryConfig, 
  Allowance, 
  ShiftType, 
  LeaveType 
} from './types';
import { 
  calculatePayroll, 
  toDateKey 
} from './utils';
import Calendar from './components/Calendar';
import DayEditModal from './components/DayEditModal';
import AllowanceSection from './components/AllowanceSection';
import StatsSection from './components/StatsSection';
import SalaryHeader from './components/SalaryHeader';
import AuthModal from './components/AuthModal';

const STORAGE_KEY = 'ym_final_v1_data_prod';
const USER_KEY = 'ym_final_v1_user_prod';

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State quản lý ngày đang xem trên lịch
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    const d = new Date();
    if (d.getDate() > 27) return new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  
  const [user, setUser] = useState<{ name: string } | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  const [salaryConfig, setSalaryConfig] = useState<SalaryConfig>({
    baseSalary: 0,
    standardWorkDays: 26,
    insuranceSalary: 0
  });
  
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.salaryConfig) setSalaryConfig(parsed.salaryConfig);
        if (parsed.allowances) setAllowances(parsed.allowances);
        if (parsed.daysData) setDaysData(parsed.daysData);
      } catch (e) {
        console.error("Data restore failed:", e);
      }
    }
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      const dataToSave = { salaryConfig, allowances, daysData };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [salaryConfig, allowances, daysData, isDataLoaded]);

  const activeAllowancesTotal = useMemo(() => 
    allowances.reduce((acc, curr) => curr.isActive ? acc + (Number(curr.amount) || 0) : acc, 0)
  , [allowances]);

  const summary = useMemo(() => {
    return calculatePayroll(
      daysData, 
      salaryConfig, 
      activeAllowancesTotal, 
      currentViewDate.getMonth() + 1, 
      currentViewDate.getFullYear()
    );
  }, [daysData, salaryConfig, activeAllowancesTotal, currentViewDate]);

  const handleDayClick = useCallback((date: Date) => {
    const dateStr = toDateKey(date);
    const existing = daysData.find(d => d.date === dateStr);
    setSelectedDay(existing || {
      date: dateStr,
      shift: ShiftType.NONE,
      leave: LeaveType.NONE,
      overtimeHours: 0,
      isHoliday: false
    });
    setIsEditModalOpen(true);
  }, [daysData]);

  const handleSaveDay = useCallback((updated: DayData) => {
    setDaysData(prev => {
      const filtered = prev.filter(d => d.date !== updated.date);
      if (updated.shift === ShiftType.NONE && 
          updated.leave === LeaveType.NONE && 
          updated.overtimeHours === 0 && 
          !updated.notes && !updated.isHoliday) {
        return filtered;
      }
      return [...filtered, updated];
    });
    setIsEditModalOpen(false);
  }, []);

  const handleUpdateSalary = useCallback((field: keyof SalaryConfig, value: number) => {
    setSalaryConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLogin = (name: string) => {
    const newUser = { name };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleLogout = useCallback(() => {
    if (window.confirm("Dữ liệu chấm công của bạn vẫn sẽ được lưu tại trình duyệt này. Bạn có muốn đăng xuất?")) {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  const handleExportData = () => {
    const dataStr = JSON.stringify({ salaryConfig, allowances, daysData }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ym-money-backup-${new Date().toLocaleDateString('vi-VN')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.salaryConfig && json.daysData) {
          if (window.confirm("Dữ liệu mới sẽ ghi đè lên dữ liệu hiện tại. Bạn chắc chắn chứ?")) {
            setSalaryConfig(json.salaryConfig);
            setAllowances(json.allowances || []);
            setDaysData(json.daysData);
            alert("Đồng bộ dữ liệu thành công!");
          }
        } else {
          alert("File không đúng định dạng sao lưu của YM Money.");
        }
      } catch (err) {
        alert("Lỗi khi đọc file. Vui lòng thử lại.");
      }
    };
    reader.readAsText(file);
    // Reset input value to allow selecting the same file again if needed
    e.target.value = "";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <AuthModal onClose={() => {}} onLogin={handleLogin} isForced={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-zinc-950 flex flex-col pb-24 relative overflow-x-hidden">
      <SalaryHeader 
        config={salaryConfig} 
        onUpdate={handleUpdateSalary} 
        user={user}
        onAuthClick={() => {}} 
        onLogout={handleLogout}
      />
      
      <main className="animate-in fade-in slide-in-from-bottom-5 duration-700">
        <StatsSection summary={summary} />
        
        <div className="px-5 mt-8 space-y-4">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-sm font-black text-zinc-600 uppercase tracking-[0.2em]">Lịch Chấm Công</h2>
             <div className="w-12 h-px bg-zinc-800 flex-1 ml-4 opacity-30"></div>
          </div>
          <Calendar 
            viewDate={currentViewDate} 
            onViewDateChange={setCurrentViewDate}
            onDayClick={handleDayClick}
            daysData={daysData}
          />
        </div>

        <AllowanceSection 
          allowances={allowances} 
          onToggle={(id) => setAllowances(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a))}
          onAdd={(name, amount) => setAllowances(prev => [...prev, { id: Date.now().toString(), name, amount, isActive: true }])}
          onEdit={(updated) => setAllowances(prev => prev.map(a => a.id === updated.id ? updated : a))}
          onRemove={(id) => setAllowances(prev => prev.filter(a => a.id !== id))}
          onSetAll={(val) => setAllowances(prev => prev.map(a => ({ ...a, isActive: val })))}
        />

        <div className="px-5 mt-10 grid grid-cols-2 gap-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportData} 
              accept=".json" 
              className="hidden" 
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center space-x-3 group active:scale-95 transition-all"
            >
                <i className="fa-solid fa-cloud-arrow-up text-zinc-600 group-hover:text-blue-500"></i>
                <span className="text-[10px] font-black text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest">Nhập Dữ liệu</span>
            </button>
            <button 
                onClick={handleExportData}
                className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center space-x-3 group active:scale-95 transition-all"
            >
                <i className="fa-solid fa-cloud-arrow-down text-zinc-600 group-hover:text-orange-500"></i>
                <span className="text-[10px] font-black text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest">Sao lưu JSON</span>
            </button>
        </div>
      </main>

      <footer className="mt-12 px-8 py-10 border-t border-zinc-900 text-center space-y-4 opacity-40 safe-pb">
        <div className="flex justify-center space-x-6 text-zinc-600">
            <i className="fa-solid fa-shield-halved text-lg"></i>
            <i className="fa-solid fa-lock text-lg"></i>
            <i className="fa-solid fa-bolt-lightning text-lg"></i>
        </div>
        <div>
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">YM Money &bull; Personal Salary</p>
            <p className="text-zinc-700 text-[8px] font-bold mt-1 tracking-widest uppercase">Privacy First &bull; No Backend &copy; 2024</p>
        </div>
      </footer>

      {isEditModalOpen && selectedDay && (
        <DayEditModal 
          day={selectedDay}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveDay}
        />
      )}
    </div>
  );
};

export default App;
