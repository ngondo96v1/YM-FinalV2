
import React, { useMemo } from 'react';
import { DayData, ShiftType, LeaveType } from '../types';
import { toDateKey, getPayrollRange } from '../utils';

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
    // Chu kỳ 21 tháng n-1 đến 20 tháng n
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
    // Chỉ trả về dữ liệu nếu ngày thuộc phạm vi hiển thị hiện tại
    if (date < startDate || date > endDate) {
      return undefined;
    }
    return daysData.find(d => d.date === key);
  };

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none"></div>
      
      <header className="flex items-center justify-between mb-8 relative z-10">
        <button 
          onClick={() => changeCycle(-1)} 
          className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all border border-zinc-800 text-zinc-400 hover:text-orange-500"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        
        <div className="flex flex-col items-center text-center">
            <button 
              onClick={goTodayCycle}
              className="mb-2 px-4 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:border-orange-500/30 active:scale-95 transition-all"
            >
              Chu kỳ hiện tại
            </button>
            <div>
                <h3 className="font-black text-white text-lg tracking-tight leading-none">Lương Tháng {targetMonth + 1}</h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                    <span className="text-[10px] text-zinc-500 font-bold bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800/50">
                      21/{startDate.getMonth() + 1}
                    </span>
                    <i className="fa-solid fa-arrow-right text-[8px] text-zinc-700"></i>
                    <span className="text-[10px] text-zinc-500 font-bold bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800/50">
                      20/{endDate.getMonth() + 1}
                    </span>
                </div>
            </div>
        </div>

        <button 
          onClick={() => changeCycle(1)} 
          className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all border border-zinc-800 text-zinc-400 hover:text-orange-500"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </header>

      <div className="grid grid-cols-7 gap-1 mb-4 border-b border-zinc-800/30 pb-3 relative z-10">
        {weekDays.map(d => (
          <div key={d} className={`text-center text-[10px] font-black tracking-widest ${d === 'CN' ? 'text-red-500/50' : 'text-zinc-600'}`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2.5 max-h-[460px] overflow-y-auto no-scrollbar pr-1 pb-4 relative z-10">
        {calendarDays.map((date, idx) => {
          if (!date) return (
            <div key={`empty-${idx}`} className="aspect-square flex items-center justify-center opacity-20">
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
            </div>
          );
          
          const status = getDayStatus(date);
          const isToday = new Date().toDateString() === date.toDateString();
          const isSunday = date.getDay() === 0;
          
          return (
            <div 
              key={date.getTime()}
              onClick={() => onDayClick(date)}
              className={`
                aspect-square rounded-[1.2rem] flex flex-col items-center justify-center cursor-pointer transition-all relative group/day
                ${isToday ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-500/20' : 'bg-zinc-950/50 border border-zinc-800 hover:bg-zinc-800 hover:scale-105'}
              `}
            >
              <div className="flex flex-col items-center leading-none">
                  <span className={`text-[11px] font-black tracking-tighter ${isToday ? 'text-zinc-950' : isSunday ? 'text-red-500' : 'text-zinc-300'}`}>
                    {date.getDate()}
                  </span>
                  <span className={`text-[6px] font-black uppercase mt-0.5 ${isToday ? 'text-zinc-900' : 'text-zinc-600'}`}>T{date.getMonth() + 1}</span>
              </div>
              
              <div className="flex gap-[2px] mt-1.5 h-[4px]">
                {status?.shift === ShiftType.DAY && <div className="w-1 h-1 rounded-full bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.8)]"></div>}
                {status?.shift === ShiftType.NIGHT && <div className="w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_5px_rgba(129,140,248,0.8)]"></div>}
                {status?.leave === LeaveType.PAID && <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>}
                {status?.leave === LeaveType.SICK && <div className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>}
              </div>

              {status && status.overtimeHours > 0 && (
                <div className={`absolute -top-1 -right-1 px-1 rounded-md text-[7px] font-black leading-none py-0.5 border shadow-sm ${isToday ? 'bg-zinc-950 text-orange-400 border-zinc-800' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                  +{status.overtimeHours}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex justify-center flex-wrap gap-x-5 gap-y-3 pt-6 border-t border-zinc-800/50 relative z-10">
        {[
            { color: 'bg-orange-500', label: 'Ngày' },
            { color: 'bg-indigo-400', label: 'Đêm' },
            { color: 'bg-green-500', label: 'Phép' },
            { color: 'bg-red-500', label: 'Bệnh' },
            { color: 'bg-amber-400', label: 'T.Ca' }
        ].map(item => (
            <div key={item.label} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm`}></div>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{item.label}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
