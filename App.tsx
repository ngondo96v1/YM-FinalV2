
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
  toDateKey,
  getHolidayName
} from './utils';
import Calendar from './components/Calendar';
import DayEditModal from './components/DayEditModal';
import AllowanceSection from './components/AllowanceSection';
import SalaryHeader from './components/SalaryHeader';
import AuthModal from './components/AuthModal';

const STORAGE_KEY = 'ym_final_v1_data_prod';
const USER_KEY = 'ym_final_v1_user_prod';

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    const d = new Date();
    if (d.getDate() > 20) return new Date(d.getFullYear(), d.getMonth() + 1, 1);
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
    insuranceSalary: 0,
    totalAnnualLeave: 12,
    totalSickLeave: 0
  });
  
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeHoliday, setActiveHoliday] = useState<string | null>(null);

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

    const holiday = getHolidayName(new Date());
    if (holiday) setActiveHoliday(holiday);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ salaryConfig, allowances, daysData }));
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
      shift: ShiftType.DAY, 
      leave: LeaveType.NONE,
      overtimeHours: 0,
      isHoliday: false
    });
    setIsEditModalOpen(true);
  }, [daysData]);

  const handleSaveDay = useCallback((updated: DayData) => {
    setDaysData(prev => {
      const filtered = prev.filter(d => d.date !== updated.date);
      return [...filtered, updated];
    });
    setIsEditModalOpen(false);
  }, []);

  const handleUpdateSalary = useCallback((field: keyof SalaryConfig, value: number) => {
    setSalaryConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm("Đăng xuất? Dữ liệu vẫn được lưu tại trình duyệt này.")) {
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
    link.download = `YM-Backup-${new Date().toLocaleDateString('vi-VN')}.json`;
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
          setSalaryConfig(json.salaryConfig);
          setAllowances(json.allowances || []);
          setDaysData(json.daysData);
          alert("Nhập liệu thành công!");
        }
      } catch (err) { alert("Lỗi định dạng file!"); }
    };
    reader.readAsText(file);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <AuthModal onClose={() => {}} onLogin={(name) => {
          const newUser = { name };
          localStorage.setItem(USER_KEY, JSON.stringify(newUser));
          setUser(newUser);
        }} isForced={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-zinc-950 flex flex-col pb-20 relative overflow-x-hidden no-scrollbar">
      {/* Holiday Splash Alert - Tinh chỉnh bớt chói */}
      {activeHoliday && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 w-full max-w-sm text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-600 to-red-600"></div>
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-amber-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-red-900/20">
                        <i className="fa-solid fa-flag text-2xl text-white"></i>
                    </div>
                </div>
                <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.4em] mb-2">Chúc mừng ngày lễ</p>
                <h2 className="text-2xl font-black text-white mb-2 uppercase leading-tight tracking-tight">{activeHoliday}</h2>
                <button 
                    onClick={() => setActiveHoliday(null)}
                    className="mt-10 w-full py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:border-amber-500/20 transition-all active:scale-95"
                >
                    Đóng thông báo
                </button>
            </div>
        </div>
      )}

      <SalaryHeader 
        config={salaryConfig} 
        summary={summary}
        onUpdate={handleUpdateSalary} 
        user={user}
        onLogout={handleLogout}
        onExport={handleExportData}
        onImport={() => fileInputRef.current?.click()}
      />
      
      <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />

      <main className="px-5 space-y-8 mt-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
             <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Bảng công chu kỳ</h2>
             <div className="w-12 h-px bg-zinc-800 flex-1 ml-4 opacity-30"></div>
          </div>
          <Calendar 
            viewDate={currentViewDate} 
            onViewDateChange={setCurrentViewDate}
            onDayClick={handleDayClick}
            daysData={daysData}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 px-1">
             <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Tiền phụ cấp hàng tháng</h2>
             <div className="w-12 h-px bg-zinc-800 flex-1 ml-4 opacity-30"></div>
          </div>
          <AllowanceSection 
            allowances={allowances} 
            onToggle={(id) => setAllowances(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a))}
            onAdd={(name, amount) => setAllowances(prev => [...prev, { id: Date.now().toString(), name, amount, isActive: true }])}
            onEdit={(updated) => setAllowances(prev => prev.map(a => a.id === updated.id ? updated : a))}
            onRemove={(id) => setAllowances(prev => prev.filter(a => a.id !== id))}
            onSetAll={(val) => setAllowances(prev => prev.map(a => ({ ...a, isActive: val })))}
          />
        </section>
      </main>

      <footer className="mt-auto py-12 text-center opacity-30">
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.4em]">YM Money &bull; Smart Salary Tracker &bull; V1.0</p>
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
