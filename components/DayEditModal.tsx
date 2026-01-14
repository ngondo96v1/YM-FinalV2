
import React, { useState, useEffect } from 'react';
import { DayData, ShiftType, LeaveType } from '../types';

interface Props {
  day: DayData;
  onClose: () => void;
  onSave: (data: DayData) => void;
}

const DayEditModal: React.FC<Props> = ({ day, onClose, onSave }) => {
  const [data, setData] = useState<DayData>(() => {
    if (day.shift === ShiftType.NONE && day.leave === LeaveType.NONE && day.overtimeHours === 0) {
      return { ...day, shift: ShiftType.DAY };
    }
    return { ...day };
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
    setData(prev => ({ ...prev, overtimeHours: Math.max(0, prev.overtimeHours + val) }));
  };

  const getOTDescription = () => {
    if (data.isHoliday) return "Ngày Lễ (8h đầu x2.0, sau 8h x3.0)";
    if (isSunday) return "Chủ Nhật (Hệ số x2.0)";
    
    if (data.shift === ShiftType.NIGHT && data.overtimeHours > 8) {
      return "Ca Đêm (Giờ vượt +30% = x1.8)";
    }
    return "Ngày Thường (Hệ số x1.5)";
  };

  const isNightExtraActive = !data.isHoliday && !isSunday && data.shift === ShiftType.NIGHT && data.overtimeHours > 8;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-zinc-900 w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 border-t sm:border border-zinc-800 shadow-2xl shadow-orange-500/5 animate-in slide-in-from-bottom-20 duration-500"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8 sm:hidden opacity-50"></div>
        
        <header className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em] mb-1">Chỉnh sửa công</p>
            <h2 className="text-3xl font-black text-white first-letter:uppercase tracking-tighter">{dateFormatted}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-90"
          >
            <i className="fa-solid fa-xmark text-zinc-400 text-lg"></i>
          </button>
        </header>

        <div className="space-y-8 overflow-y-auto max-h-[65vh] no-scrollbar pb-6 px-1">
          <section>
            <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest mb-4 px-1 flex items-center">
                <i className="fa-solid fa-clock-rotate-left mr-2 opacity-50"></i> CHỌN CA LÀM
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: ShiftType.DAY, label: 'Ca Ngày', icon: 'fa-sun', color: 'bg-orange-500' },
                { type: ShiftType.NIGHT, label: 'Ca Đêm', icon: 'fa-moon', color: 'bg-indigo-500' },
                { type: ShiftType.NONE, label: 'Nghỉ', icon: 'fa-couch', color: 'bg-zinc-700' }
              ].map(opt => (
                <button 
                  key={opt.type}
                  onClick={() => setData(prev => ({ ...prev, shift: opt.type, leave: LeaveType.NONE }))}
                  className={`
                    group p-5 rounded-[2rem] flex flex-col items-center justify-center gap-3 border transition-all duration-300
                    ${data.shift === opt.type 
                        ? `${opt.color} border-white/20 text-zinc-950 scale-105 shadow-xl` 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'}
                  `}
                >
                  <i className={`fa-solid ${opt.icon} text-xl group-active:scale-125 transition-transform`}></i>
                  <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest mb-4 px-1 flex items-center">
                <i className="fa-solid fa-umbrella-beach mr-2 opacity-50"></i> TRẠNG THÁI NGHỈ
            </p>
            <div className="flex gap-3">
              {[
                  { type: LeaveType.PAID, label: 'Phép năm', icon: 'fa-plane', color: 'bg-green-600' },
                  { type: LeaveType.SICK, label: 'Nghỉ bệnh', icon: 'fa-heart-pulse', color: 'bg-rose-600' }
              ].map(opt => (
                <button 
                    key={opt.type}
                    onClick={() => setData(prev => ({ 
                        ...prev, 
                        leave: prev.leave === opt.type ? LeaveType.NONE : opt.type, 
                        shift: ShiftType.NONE 
                    }))}
                    className={`
                    flex-1 p-5 rounded-[2rem] flex items-center justify-center gap-3 border transition-all duration-300
                    ${data.leave === opt.type 
                        ? `${opt.color} border-white/20 text-white shadow-xl` 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'}
                    `}
                >
                    <i className={`fa-solid ${opt.icon} text-sm`}></i>
                    <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={`bg-zinc-950 border p-8 rounded-[2.5rem] shadow-inner relative overflow-hidden group transition-colors duration-500 ${isNightExtraActive ? 'border-indigo-500/40' : 'border-zinc-800'}`}>
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent ${isNightExtraActive ? 'via-indigo-500/40' : ''}`}></div>
             
             <div className="flex items-center justify-between mb-8">
               <div>
                  <p className="text-[11px] text-zinc-400 font-black uppercase tracking-widest mb-0.5">Giờ Tăng Ca</p>
                  <div className="flex items-center space-x-2">
                     <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter transition-colors ${isNightExtraActive ? 'bg-indigo-500 text-white' : data.isHoliday ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500'}`}>
                        {getOTDescription()}
                     </span>
                  </div>
               </div>
               <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-black transition-colors ${data.isHoliday ? 'text-orange-500' : 'text-zinc-600'}`}>NGÀY LỄ</span>
                  <button 
                    onClick={handleToggleHoliday}
                    className={`w-11 h-6 rounded-full relative transition-all duration-300 shadow-inner ${data.isHoliday ? 'bg-orange-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${data.isHoliday ? 'left-6 shadow-md' : 'left-1 opacity-50'}`}></div>
                  </button>
               </div>
             </div>
             
             <div className="flex items-center gap-6">
                <button 
                  onClick={() => adjustOT(-0.5)}
                  className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white active:scale-90 transition-all hover:border-zinc-700"
                >
                  <i className="fa-solid fa-minus text-xl"></i>
                </button>
                <div className="flex-1 flex flex-col items-center">
                   <div className="flex items-baseline space-x-1">
                       <input 
                        type="number"
                        step="0.5"
                        min="0"
                        value={data.overtimeHours === 0 ? "" : data.overtimeHours}
                        placeholder="0"
                        onChange={handleManualOTChange}
                        className={`w-20 bg-transparent text-center text-5xl font-black outline-none placeholder:text-zinc-900 transition-all ${isNightExtraActive ? 'text-indigo-400' : 'text-white focus:text-orange-500'}`}
                       />
                       <span className={`text-xl font-black uppercase tracking-tighter ${isNightExtraActive ? 'text-indigo-900' : 'text-zinc-800'}`}>H</span>
                   </div>
                   <p className="text-[10px] text-zinc-600 font-black uppercase mt-1 tracking-widest opacity-50">Tổng giờ</p>
                </div>
                <button 
                  onClick={() => adjustOT(0.5)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center active:scale-90 shadow-xl transition-all hover:scale-105 ${isNightExtraActive ? 'bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-orange-500 text-zinc-950 shadow-orange-500/20'}`}
                >
                  <i className="fa-solid fa-plus text-xl"></i>
                </button>
             </div>

             {isNightExtraActive && (
               <div className="mt-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-in fade-in zoom-in duration-300">
                  <p className="text-[9px] text-indigo-400 font-black uppercase text-center tracking-widest">
                    <i className="fa-solid fa-circle-info mr-1"></i> Đã áp dụng hệ số +0.3 (Tổng x1.8) cho phần vượt 8h ca đêm
                  </p>
               </div>
             )}
          </section>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-zinc-900 pb-2">
             <button 
               onClick={onClose}
               className="flex-1 py-5 rounded-[2rem] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-[0.2em] text-[10px] active:scale-95"
             >
               Hủy bỏ
             </button>
             <button 
               onClick={() => onSave(data)}
               className="flex-[2] py-5 rounded-[2rem] bg-orange-500 text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-orange-500/10 active:scale-95 transition-all hover:brightness-110"
             >
               Lưu Chấm Công
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayEditModal;
