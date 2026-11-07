
import React, { useMemo } from 'react';
import { DayData, ShiftType, LeaveType } from '../types';
import { toDateKey, getPayrollRange, getHolidayName, getWorkHoursDetail } from '../utils';

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

  const cycleDateRangeStr = useMemo(() => {
    const sD = String(startDate.getDate()).padStart(2, '0');
    const sM = String(startDate.getMonth() + 1).padStart(2, '0');
    const eD = String(endDate.getDate()).padStart(2, '0');
    const eM = String(endDate.getMonth() + 1).padStart(2, '0');
    const eY = endDate.getFullYear();
    return `${sD}/${sM} – ${eD}/${eM}/${eY}`;
  }, [startDate, endDate]);

  const cycleHolidays = useMemo(() => {
    const map = new Map<string, { date: Date; name: string; formattedDate: string }>();
    calendarDays.forEach(d => {
      if (!d) return;
      const hName = getHolidayName(d);
      if (hName) {
        const key = toDateKey(d);
        if (!map.has(key)) {
          map.set(key, {
            date: d,
            name: hName,
            formattedDate: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
          });
        }
      }
    });
    return Array.from(map.values());
  }, [calendarDays]);

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
            <button onClick={goTodayCycle} className="mb-1.5 inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[8px] font-black text-orange-500 uppercase tracking-widest active:scale-95 transition-transform">
              Chu kỳ hiện tại
            </button>
            <h3 className="font-black text-white text-base tracking-tight leading-none uppercase">Tháng {targetMonth + 1}</h3>
            <p className="text-[8px] text-zinc-500 font-bold tracking-wider mt-1">{cycleDateRangeStr}</p>
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
          if (isSunday && status?.shift === ShiftType.NONE) {
            otDisplayHours = 0;
          } else if (status?.checkInTime && status?.checkOutTime) {
            const detail = getWorkHoursDetail(
              status.checkInTime,
              status.checkOutTime,
              isSunday,
              isHoliday,
              status.overtimeHours,
              status.shift
            );
            const totalOT = detail.otNormalHours + detail.otSundayHours + detail.otHolidayX2Hours + detail.otHolidayX3Hours;
            otDisplayHours = Math.round(totalOT * 10) / 10;
          } else {
            otDisplayHours = status?.overtimeHours || 0;
          }
          
          return (
            <div 
              key={date.getTime()}
              onClick={() => onDayClick(date)}
              title={holidayName ? `${holidayName} (${date.toLocaleDateString('vi-VN')})` : undefined}
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
                     <div className="flex flex-col items-center mt-0.5">
                       <i className="fa-solid fa-crown text-[6px] text-yellow-500 opacity-90 animate-soft-pulse"></i>
                       <span className="text-[5px] font-black text-amber-400 max-w-[34px] truncate leading-none mt-[1px]">LỄ</span>
                     </div>
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

      {/* Danh sách ngày Lễ trong chu kỳ hiển thị tên cụ thể */}
      {cycleHolidays.length > 0 && (
        <div className="mt-6 pt-5 border-t border-zinc-800/60 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-gift text-red-500 text-[11px]"></i>
              <p className="text-[9px] font-black uppercase text-white tracking-widest">
                Ngày Lễ trong chu kỳ ({cycleHolidays.length})
              </p>
            </div>
            <span className="text-[7.5px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Hưởng 100% lương / OT x2.0
            </span>
          </div>
          <div className="space-y-1.5">
            {cycleHolidays.map((h, i) => (
              <div 
                key={i} 
                onClick={() => onDayClick(h.date)}
                className="flex items-center justify-between bg-zinc-950/80 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-red-500/40 p-3 rounded-2xl cursor-pointer transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center space-x-3">
                  <div className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-[10px] tracking-wider text-center min-w-[48px]">
                    {h.formattedDate}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white group-hover:text-amber-400 transition-colors">{h.name}</p>
                    <p className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-tight">Ngày lễ theo quy định Nhà nước</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-zinc-500 group-hover:text-white transition-colors">
                  <span className="text-[8px] font-black uppercase tracking-wider">Xem</span>
                  <i className="fa-solid fa-chevron-right text-[7px]"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
