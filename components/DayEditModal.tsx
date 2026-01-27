
import React, { useState } from 'react';
import { DayData, ShiftType, LeaveType } from '../types';
import { getHolidayName } from '../utils';

interface Props {
  day: DayData;
  onClose: () => void;
  onSave: (data: DayData) => void;
}

const DayEditModal: React.FC<Props> = ({ day, onClose, onSave }) => {
  const holidayName = getHolidayName(new Date(day.date + 'T00:00:00'));

  const [data, setData] = useState<DayData>(() => {
    let initialData = { ...day };
    const isNewDay = day.overtimeHours === 0 && day.leave === LeaveType.NONE;
    if (holidayName && !day.isHoliday && isNewDay) {
        initialData.isHoliday = true;
    }
    return initialData;
  });

  const dateObj = new Date(day.date + 'T00:00:00');
  const dateFormatted = dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });
  const isSunday = dateObj.getDay() === 0;

  const handleToggleHoliday = () => setData(prev => ({ ...prev, isHoliday: !prev.isHoliday }));

  const handleManualOTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setData(prev => ({ ...prev, overtimeHours: isNaN(val) ? 0 : val }));
  };

  const adjustOT = (val: number) => {
    // Bước nhảy mặc định là 0.5 (tương ứng 30 phút)
    setData(prev => ({ ...prev, overtimeHours: Math.max(0, prev.overtimeHours + val) }));
  };

  const baseHours = (!isSunday && data.shift !== ShiftType.NONE) ? 8 : 0;
  const totalHours = isSunday ? data.overtimeHours : (baseHours + data.overtimeHours);
  const isSurplus = totalHours > 16; 

  const getOTMultiplierText = () => {
    if (data.isHoliday) return `Hệ số Lễ: x2.0 / x3.0${isSurplus ? " + Đêm" : ""}`;
    if (isSunday) return `Hệ số CN: x2.0${isSurplus ? " | x2.3" : ""}`;
    if (isSurplus) return `Vượt 16h: +0.3 Phí Đêm`;
    return "Hệ số OT: x1.5";
  };

  const handleSelectShift = (type: ShiftType) => {
    setData(prev => ({
      ...prev,
      shift: type,
      leave: type !== ShiftType.NONE ? LeaveType.NONE : prev.leave,
      overtimeHours: type === ShiftType.NONE ? 0 : prev.overtimeHours 
    }));
  };

  const handleSelectLeave = (type: LeaveType) => {
    setData(prev => {
        const isSame = prev.leave === type;
        const newLeave = isSame ? LeaveType.NONE : type;
        return {
            ...prev,
            leave: newLeave,
            shift: ShiftType.NONE,
            overtimeHours: 0,
            isHoliday: newLeave === LeaveType.TET ? false : prev.isHoliday 
        };
    });
  };

  const isWorking = isSunday ? true : (data.shift !== ShiftType.NONE || data.overtimeHours > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-[#0c0c0e] w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 border-t sm:border border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-20 duration-500 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8 sm:hidden opacity-50"></div>
        
        <header className="flex justify-between items-start mb-8">
          <div className="flex-1">
            {data.isHoliday && (
                <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-3">
                    <i className="fa-solid fa-star text-[8px] text-red-500 animate-pulse"></i>
                    <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">{holidayName || 'NGÀY LỄ'}</span>
                </div>
            )}
            <h2 className={`text-3xl font-black tracking-tighter ${isSunday ? 'text-red-500' : 'text-white'}`}>{dateFormatted}</h2>
            <div className="flex items-center space-x-2 mt-1">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{isSunday ? 'Ngày nghỉ Chủ Nhật' : 'Tổng làm việc:'}</span>
                <span className={`text-[10px] font-black uppercase ${isSurplus ? (isSunday ? 'text-red-500' : 'text-orange-500') : 'text-zinc-400'}`}>
                  {totalHours} Giờ
                </span>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div className="space-y-8 overflow-y-auto max-h-[70vh] no-scrollbar pb-10">
          {!isSunday && (
            <section>
              <p className="text-[11px] text-zinc-600 font-black uppercase tracking-widest mb-4">Ca làm việc chính</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: ShiftType.DAY, label: 'Sáng', icon: 'fa-sun', color: 'bg-orange-500' },
                  { type: ShiftType.NIGHT, label: 'Đêm', icon: 'fa-moon', color: 'bg-indigo-600' },
                  { type: ShiftType.NONE, label: 'Nghỉ', icon: 'fa-couch', color: 'bg-zinc-800' }
                ].map(opt => (
                  <button 
                    key={opt.type}
                    onClick={() => handleSelectShift(opt.type)}
                    className={`p-5 rounded-[2rem] flex flex-col items-center gap-3 border transition-all ${data.shift === opt.type ? `${opt.color} border-white/20 text-white scale-105 shadow-xl` : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                  >
                    <i className={`fa-solid ${opt.icon} text-lg`}></i>
                    <span className="text-[9px] font-black uppercase">{opt.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {isWorking && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] shadow-inner relative overflow-hidden">
                    {isSurplus && (
                      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full animate-pulse opacity-20 ${isSunday ? 'bg-red-500' : (data.shift === ShiftType.DAY ? 'bg-orange-500' : 'bg-indigo-500')}`}></div>
                    )}

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest mb-1">{isSunday ? 'Tổng giờ làm Chủ Nhật' : 'Giờ tăng ca thêm'}</p>
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${isSurplus ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                {getOTMultiplierText()}
                            </span>
                        </div>
                        {!isSunday && (
                          <div className="flex items-center space-x-3">
                              <button onClick={handleToggleHoliday} title="Ghi chú ngày lễ" className={`w-11 h-6 rounded-full relative transition-all ${data.isHoliday ? 'bg-red-600' : 'bg-zinc-800'}`}>
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.isHoliday ? 'left-6' : 'left-1'}`}></div>
                              </button>
                          </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button onClick={() => adjustOT(-0.5)} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white active:scale-90">
                            <i className="fa-solid fa-minus text-xs"></i>
                        </button>
                        <div className="flex-1 flex flex-col items-center">
                            <div className="flex items-baseline space-x-1">
                                <input 
                                    type="number" step="0.5" min="0" value={data.overtimeHours || ""} placeholder="0"
                                    onChange={handleManualOTChange}
                                    className={`w-28 bg-transparent text-center text-6xl font-black outline-none transition-all 
                                      ${isSurplus ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-white'}`}
                                />
                                <span className="text-xl font-black text-zinc-800">H</span>
                            </div>
                            {isSurplus && <p className="text-[8px] font-black text-red-500 uppercase mt-2 tracking-widest animate-pulse">Mốc đêm: Sau 22:30 (+0.3)</p>}
                        </div>
                        <button onClick={() => adjustOT(0.5)} className={`w-14 h-14 rounded-2xl flex items-center justify-center active:scale-90 shadow-lg ${isSunday ? 'bg-red-500 text-white' : (data.shift === ShiftType.DAY ? 'bg-orange-500 text-zinc-950' : 'bg-indigo-600 text-white')}`}>
                            <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                    </div>
                </div>
            </section>
          )}

          {(!isWorking || isSunday) && (
            <section className="grid grid-cols-3 gap-3">
                {[
                    { type: LeaveType.PAID, label: 'Phép Năm', color: 'bg-green-600', icon: 'fa-calendar-check' },
                    { type: LeaveType.SICK, label: 'Bệnh', color: 'bg-rose-600', icon: 'fa-briefcase-medical' },
                    { type: LeaveType.TET, label: 'Tết', color: 'bg-red-600', icon: 'fa-fire' }
                ].map(opt => (
                    <button key={opt.type} onClick={() => handleSelectLeave(opt.type)} className={`p-4 rounded-[1.8rem] border flex flex-col items-center justify-center gap-2 transition-all ${data.leave === opt.type ? `${opt.color} border-white/20 text-white` : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
                        <i className={`fa-solid ${opt.icon}`}></i>
                        <span className="text-[8px] font-black uppercase">{opt.label}</span>
                    </button>
                ))}
            </section>
          )}

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-[#0c0c0e] pb-2">
             <button onClick={onClose} className="flex-1 py-5 rounded-[2rem] font-black text-zinc-500 text-[10px] uppercase tracking-widest">Hủy</button>
             <button onClick={() => onSave(data)} className="flex-[2] py-5 rounded-[2rem] bg-orange-500 text-zinc-950 font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-transform">Lưu dữ liệu</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayEditModal;
