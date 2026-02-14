
import React, { useMemo } from 'react';
import { DayData, ShiftType, LeaveType } from '../types';
import { toDateKey, getPayrollRange, getHolidayName } from '../utils';

interface Props {
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  daysData: DayData[];
}

const Calendar: React.FC<Props> = ({ viewDate, onViewDateChange, onDayClick, daysData }) => {
  const targetYear = viewDate.getFullYear();
  const targetMonth = viewDate.getMonth();

  const { calendarDays, startDate, endDate } = useMemo(() => {
    const range = getPayrollRange(targetYear, targetMonth + 1);
    const start = range.startDate;
    const end = range.endDate;
    
    const days: (Date | null)[] = [];
    const startDayOfWeek = start.getDay(); 
    const paddingCount = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    for (let i = 0; i < paddingCount; i++) {
      days.push(null);
    }
    
    let curr = new Date(start);
    while (curr <= end) {
      days.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    
    return { calendarDays: days, startDate: start, endDate: end };
  }, [targetYear, targetMonth]);

  const changeCycle = (offset: number) => {
    const nextDate = new Date(targetYear, targetMonth + offset, 1);
    onViewDateChange(nextDate);
  };

  const goTodayCycle = () => {
    const today = new Date();
    if (today.getDate() > 20) {
      onViewDateChange(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    } else {
      onViewDateChange(new Date(today.getFullYear(), today.getMonth(), 1));
    }
  };

  const getDayStatus = (date: Date) => {
    const key = toDateKey(date);
    return daysData.find(d => d.date === key);
  };

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="bg-[#0c0c0e] rounded-[3rem] p-6 border border-zinc-800/50 shadow-2xl relative overflow-hidden">
      <header className="flex items-center justify-between mb-8 relative z-10 px-2">
        <button 
          onClick={() => changeCycle(-1)} 
          className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 border border-zinc-800 text-zinc-500 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-chevron-left text-[10px]"></i>
        </button>
        
        <div className="text-center">
            <button onClick={goTodayCycle} className="mb-2 inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[8px] font-black text-orange-500 uppercase tracking-widest active:scale-95 transition-transform">
              Chu kỳ hiện tại
            </button>
            <h3 className="font-black text-white text-base tracking-tight leading-none uppercase">Tháng {targetMonth + 1}</h3>
        </div>

        <button 
          onClick={() => changeCycle(1)} 
          className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 border border-zinc-800 text-zinc-500 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-chevron-right text-[10px]"></i>
        </button>
      </header>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map(d => (
          <div key={d} className={`text-center text-[10px] font-black tracking-widest ${d === 'CN' ? 'text-red-500' : 'text-zinc-700'}`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 mb-8">
        {calendarDays.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="aspect-square opacity-0" />;
          
          const status = getDayStatus(date);
          const isToday = new Date().toDateString() === date.toDateString();
          const isSunday = date.getDay() === 0;
          const holidayName = getHolidayName(date);
          const isHoliday = !!holidayName || !!status?.isHoliday;
          
          let otDisplayHours = 0;
          if (status?.checkInTime && status?.checkOutTime) {
            const [h1, m1] = status.checkInTime.split(':').map(Number);
            const [h2, m2] = status.checkOutTime.split(':').map(Number);
            let start = h1 * 60 + m1;
            let end = h2 * 60 + m2;
            if (end <= start) end += 24 * 60;
            const total = (end - start) / 60;
            
            if (isHoliday) {
              otDisplayHours = total;
            } else if (isSunday) {
              otDisplayHours = total; // Chủ nhật toàn bộ giờ là OT
            } else {
              otDisplayHours = Math.max(0, total - 8);
            }
          } else {
            otDisplayHours = status?.overtimeHours || 0;
          }
          
          return (
            <div 
              key={date.getTime()}
              onClick={() => onDayClick(date)}
              className={`
                aspect-square rounded-full flex flex-col items-center justify-center cursor-pointer transition-all relative group
                ${isToday ? 'bg-orange-500 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-110 z-20' : 
                  isHoliday ? 'holiday-border-animate scale-105 border border-red-500/30' :
                  'bg-zinc-950 border border-zinc-800/80 hover:bg-zinc-800'}
              `}
            >
              {otDisplayHours > 0 && (
                <div className={`absolute -top-1 -right-1 z-30 px-1.5 py-0.5 rounded-md text-[7px] font-black shadow-lg animate-in zoom-in duration-300 ${status?.isHoliday || holidayName ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-orange-500 border border-zinc-700'}`}>
                   {otDisplayHours}
                </div>
              )}

              {isHoliday && !isToday && (
                <div className="absolute inset-0 bg-red-600/10 rounded-full blur-[4px]"></div>
              )}
              
              <div className="flex flex-col items-center leading-none z-10 relative">
                  <span className={`text-[12px] font-black tracking-tighter ${isToday ? 'text-zinc-950' : isHoliday ? 'text-white scale-110' : isSunday ? 'text-red-500' : 'text-zinc-300'}`}>
                    {date.getDate()}
                  </span>
                  
                  {isHoliday ? (
                     <i className="fa-solid fa-crown text-[6px] text-yellow-500 mt-0.5 opacity-80 animate-soft-pulse"></i>
                  ) : (
                     <span className={`text-[6px] font-bold uppercase mt-0.5 ${isToday ? 'text-zinc-900/40' : (isSunday) ? 'text-red-500/40' : 'text-zinc-700'}`}>
                       T{date.getMonth() + 1}
                     </span>
                  )}
              </div>
              
              <div className="flex gap-[2px] mt-1 h-[3px] z-10 relative items-center justify-center">
                {status?.shift === ShiftType.DAY && <div className="w-[3px] h-[3px] rounded-full bg-orange-500"></div>}
                {status?.shift === ShiftType.NIGHT && <div className="w-[3px] h-[3px] rounded-full bg-indigo-500"></div>}
                {!isSunday && status?.leave === LeaveType.PAID && <div className="w-[3.5px] h-[3.5px] rounded-full bg-green-500"></div>}
                {!isSunday && status?.leave === LeaveType.SICK && <div className="w-[3.5px] h-[3.5px] rounded-full bg-rose-500"></div>}
                {!isSunday && status?.leave === LeaveType.TET && <div className="w-[4px] h-[4px] rounded-full bg-red-500 animate-pulse"></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-zinc-800/50 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-1">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Sáng</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Đêm</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Phép</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Bệnh</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Tết</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
