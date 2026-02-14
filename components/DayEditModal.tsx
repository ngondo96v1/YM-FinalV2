
import React, { useState, useEffect } from 'react';
import { DayData, ShiftType, LeaveType } from '../types';
import { getHolidayName } from '../utils';

interface Props {
  day: DayData;
  onClose: () => void;
  onSave: (data: DayData) => void;
}

const DayEditModal: React.FC<Props> = ({ day, onClose, onSave }) => {
  const dateObj = new Date(day.date + 'T00:00:00');
  const holidayName = getHolidayName(dateObj);
  const isSunday = dateObj.getDay() === 0;

  const [data, setData] = useState<DayData>(() => {
    let initialData = { ...day };
    const isNewDay = !day.checkInTime && day.leave === LeaveType.NONE;
    if (holidayName && !day.isHoliday && isNewDay) {
        initialData.isHoliday = true;
    }
    if (isSunday) {
        initialData.leave = LeaveType.NONE;
    }
    return initialData;
  });

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '30'];

  const dateFormatted = dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });

  const calculateOT = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return 0;
    const [h1, m1] = checkIn.split(':').map(Number);
    const [h2, m2] = checkOut.split(':').map(Number);
    let start = h1 * 60 + m1;
    let end = h2 * 60 + m2;
    if (end <= start) end += 24 * 60;
    const total = (end - start) / 60;
    
    if (isSunday || data.isHoliday) return total;
    return Math.max(0, total - 8);
  };

  const handleSelectShift = (type: ShiftType) => {
    let checkIn = "";
    let checkOut = "";
    if (type === ShiftType.DAY) { checkIn = "06:30"; checkOut = "14:30"; }
    else if (type === ShiftType.NIGHT) { checkIn = "14:30"; checkOut = "22:30"; }

    const ot = calculateOT(checkIn, checkOut);

    setData(prev => ({
      ...prev,
      shift: type,
      checkInTime: checkIn,
      checkOutTime: checkOut,
      leave: type !== ShiftType.NONE ? LeaveType.NONE : prev.leave,
      overtimeHours: ot
    }));
  };

  const handleTimeChange = (type: 'in' | 'out', val: string) => {
    setData(prev => {
      const nextIn = type === 'in' ? val : (prev.checkInTime || "00:00");
      const nextOut = type === 'out' ? val : (prev.checkOutTime || "00:00");
      const ot = calculateOT(nextIn, nextOut);
      return {
        ...prev,
        [type === 'in' ? 'checkInTime' : 'checkOutTime']: val,
        overtimeHours: ot
      };
    });
  };

  const handleSelectLeave = (type: LeaveType) => {
    if (isSunday) return;
    setData(prev => {
        const isSame = prev.leave === type;
        const newLeave = isSame ? LeaveType.NONE : type;
        return {
            ...prev,
            leave: newLeave,
            shift: ShiftType.NONE,
            checkInTime: "",
            checkOutTime: "",
            overtimeHours: 0,
            isHoliday: newLeave === LeaveType.TET ? false : prev.isHoliday 
        };
    });
  };

  const currentOT = data.overtimeHours || 0;
  // Số giờ làm thực tế để hiển thị nhãn
  const displayTotal = isSunday || data.isHoliday ? currentOT : (data.shift !== ShiftType.NONE ? 8 : 0) + currentOT;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-[#0c0c0e] w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 border-t sm:border border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8 sm:hidden opacity-50"></div>
        
        <header className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {data.isHoliday && (
                <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-3">
                    <i className="fa-solid fa-star text-[8px] text-red-500 animate-pulse"></i>
                    <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">{holidayName || 'NGÀY LỄ'}</span>
                </div>
            )}
            <h2 className={`text-2xl font-black tracking-tighter ${isSunday ? 'text-red-500' : 'text-white'}`}>{dateFormatted}</h2>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">
               {displayTotal > 0 ? (isSunday ? `Tăng ca Chủ Nhật: ${currentOT}h` : `Tổng làm việc: ${displayTotal}h (OT: ${currentOT}h)`) : 'Chưa có giờ làm'}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div className="space-y-6 overflow-y-auto max-h-[75vh] no-scrollbar pb-10">
          <section>
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Ca làm việc</p>
              {data.shift !== ShiftType.NONE && (
                 <span className="text-[9px] text-orange-500 font-black uppercase">Đã chọn ca</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: ShiftType.DAY, label: 'Sáng', icon: 'fa-sun', desc: '06:30-14:30' },
                { type: ShiftType.NIGHT, label: 'Đêm', icon: 'fa-moon', desc: '14:30-22:30' },
                { type: ShiftType.NONE, label: 'Nghỉ', icon: 'fa-couch', desc: 'Ko làm' }
              ].map(opt => (
                <button 
                  key={opt.type}
                  onClick={() => handleSelectShift(opt.type)}
                  className={`p-4 rounded-3xl flex flex-col items-center gap-1 border transition-all ${data.shift === opt.type ? 'bg-orange-500 border-white/20 text-zinc-950 scale-105 shadow-xl' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                >
                  <i className={`fa-solid ${opt.icon} text-sm`}></i>
                  <span className="text-[9px] font-black uppercase">{opt.label}</span>
                  <span className="text-[7px] font-bold opacity-60">{opt.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {(data.shift !== ShiftType.NONE || isSunday) && (
            <section className="bg-zinc-950 border border-zinc-800 p-6 rounded-[2.5rem] space-y-6">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Giờ Vào & Ra {isSunday && '(Tính OT x2)'}</p>
                   {!isSunday && (
                      <button onClick={() => { const newH = !data.isHoliday; setData(d => ({ ...d, isHoliday: newH, overtimeHours: calculateOT(data.checkInTime, data.checkOutTime) })); }} className={`w-10 h-6 rounded-full relative transition-all ${data.isHoliday ? 'bg-red-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.isHoliday ? 'left-5' : 'left-1'}`}></div>
                      </button>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <p className="text-[8px] text-zinc-600 font-black uppercase text-center">Giờ Vào</p>
                      <div className="flex gap-1 justify-center">
                         <select 
                            value={data.checkInTime?.split(':')[0] || "00"} 
                            onChange={(e) => handleTimeChange('in', `${e.target.value}:${data.checkInTime?.split(':')[1] || "00"}`)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-3 text-white text-lg font-black outline-none focus:border-orange-500 appearance-none text-center min-w-[60px]"
                         >
                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                         </select>
                         <select 
                            value={data.checkInTime?.split(':')[1] || "00"} 
                            onChange={(e) => handleTimeChange('in', `${data.checkInTime?.split(':')[0] || "00"}:${e.target.value}`)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-3 text-white text-lg font-black outline-none focus:border-orange-500 appearance-none text-center min-w-[60px]"
                         >
                            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <p className="text-[8px] text-zinc-600 font-black uppercase text-center">Giờ Ra</p>
                      <div className="flex gap-1 justify-center">
                         <select 
                            value={data.checkOutTime?.split(':')[0] || "00"} 
                            onChange={(e) => handleTimeChange('out', `${e.target.value}:${data.checkInTime?.split(':')[1] || "00"}`)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-3 text-white text-lg font-black outline-none focus:border-orange-500 appearance-none text-center min-w-[60px]"
                         >
                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                         </select>
                         <select 
                            value={data.checkOutTime?.split(':')[1] || "00"} 
                            onChange={(e) => handleTimeChange('out', `${data.checkOutTime?.split(':')[0] || "00"}:${e.target.value}`)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-3 text-white text-lg font-black outline-none focus:border-orange-500 appearance-none text-center min-w-[60px]"
                         >
                            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                      </div>
                   </div>
                </div>
            </section>
          )}

          {!isSunday && (
            <section className="grid grid-cols-3 gap-2">
                {[
                    { type: LeaveType.PAID, label: 'Phép Năm', color: 'bg-green-600', icon: 'fa-calendar-check' },
                    { type: LeaveType.SICK, label: 'Bệnh', color: 'bg-rose-600', icon: 'fa-briefcase-medical' },
                    { type: LeaveType.TET, label: 'Tết', color: 'bg-red-600', icon: 'fa-fire' }
                ].map(opt => (
                    <button key={opt.type} onClick={() => handleSelectLeave(opt.type)} className={`p-4 rounded-3xl border flex flex-col items-center justify-center gap-1 transition-all ${data.leave === opt.type ? `${opt.color} border-white/20 text-white` : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
                        <i className={`fa-solid ${opt.icon} text-xs`}></i>
                        <span className="text-[8px] font-black uppercase">{opt.label}</span>
                    </button>
                ))}
            </section>
          )}

          <div className="flex gap-4 pt-2">
             <button onClick={onClose} className="flex-1 py-4 rounded-[1.8rem] font-black text-zinc-600 text-[10px] uppercase tracking-widest">Hủy</button>
             <button onClick={() => onSave(data)} className="flex-[2] py-4 rounded-[1.8rem] bg-orange-500 text-zinc-950 font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-transform">Lưu dữ liệu</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayEditModal;
