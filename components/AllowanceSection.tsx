
import React, { useState, useMemo } from 'react';
import { Allowance } from '../types';
import { formatCurrency, formatInputNumber, parseInputNumber } from '../utils';

interface Props {
  allowances: Allowance[];
  onToggle: (id: string) => void;
  onAdd: (name: string, amount: number) => void;
  onEdit: (allowance: Allowance) => void;
  onRemove: (id: string) => void;
  onSetAll: (val: boolean) => void;
}

const AllowanceSection: React.FC<Props> = ({ allowances, onToggle, onAdd, onEdit, onRemove, onSetAll }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<Allowance | null>(null);
  
  const [nameInput, setNameInput] = useState("");
  const [amountInput, setAmountInput] = useState("");

  const activeCount = useMemo(() => allowances.filter(a => a.isActive).length, [allowances]);
  const activeTotal = useMemo(() => 
    allowances.reduce((acc, curr) => curr.isActive ? acc + curr.amount : acc, 0)
  , [allowances]);

  const handleOpenAdd = () => {
    setEditingAllowance(null);
    setNameInput("");
    setAmountInput("");
    setShowForm(true);
    setIsExpanded(true);
  };

  const handleOpenEdit = (allowance: Allowance) => {
    setEditingAllowance(allowance);
    setNameInput(allowance.name);
    setAmountInput(formatInputNumber(allowance.amount.toString()));
    setShowForm(true);
    setIsExpanded(true);
  };

  const handleSave = () => {
    if (nameInput && amountInput) {
      const amount = parseInputNumber(amountInput);
      if (editingAllowance) {
        onEdit({ ...editingAllowance, name: nameInput, amount });
      } else {
        onAdd(nameInput, amount);
      }
      setShowForm(false);
      setNameInput("");
      setAmountInput("");
      setEditingAllowance(null);
    }
  };

  return (
    <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/50 overflow-hidden">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-zinc-900/60 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeCount > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-500'}`}>
            <i className="fa-solid fa-gift text-xl"></i>
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Phụ cấp hàng tháng</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
              {activeCount > 0 ? `${activeCount} ĐANG BẬT • ` : 'CHƯA CÓ PHỤ CẤP • '}
              <span className="text-orange-500/80">{formatCurrency(activeTotal)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <button 
              onClick={(e) => { e.stopPropagation(); handleOpenAdd(); }}
              className="w-10 h-10 bg-zinc-800 hover:bg-orange-500 hover:text-zinc-950 rounded-xl flex items-center justify-center text-zinc-400 transition-all active:scale-90"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
           <i className={`fa-solid fa-chevron-down text-zinc-600 text-xs transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}></i>
        </div>
      </div>

      {/* List */}
      <div className={`
        overflow-hidden transition-all duration-500 ease-in-out
        ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}
      `}>
        <div className="px-6 pb-6 space-y-3">
          {showForm && (
            <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-[2rem] space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
               <input 
                 autoFocus
                 placeholder="Tên phụ cấp (Vd: Xăng xe)"
                 value={nameInput}
                 onChange={e => setNameInput(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:border-orange-500 outline-none transition-colors"
               />
               <input 
                 type="text"
                 inputMode="numeric"
                 placeholder="Số tiền (VND)"
                 value={amountInput}
                 onChange={e => setAmountInput(formatInputNumber(e.target.value))}
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:border-orange-500 outline-none transition-colors"
               />
               <div className="flex gap-3">
                 <button onClick={() => setShowForm(false)} className="flex-1 bg-zinc-800 py-4 rounded-2xl text-[10px] font-black text-zinc-500 uppercase tracking-widest active:scale-95 transition-transform">Hủy</button>
                 <button onClick={handleSave} className="flex-1 bg-orange-500 py-4 rounded-2xl text-[10px] font-black text-zinc-950 uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-orange-500/20">Lưu lại</button>
               </div>
            </div>
          )}

          <div className="space-y-2">
            {allowances.length === 0 && !showForm ? (
              <div className="text-center py-8">
                 <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em]">Danh sách trống</p>
              </div>
            ) : (
              allowances.map(a => (
                <div key={a.id} className="bg-zinc-900/60 border border-zinc-800/60 p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => onToggle(a.id)}
                      className={`w-10 h-6 rounded-full transition-all relative ${a.isActive ? 'bg-orange-500' : 'bg-zinc-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${a.isActive ? 'left-5' : 'left-1'}`}></div>
                    </button>
                    <div className="cursor-pointer" onClick={() => handleOpenEdit(a)}>
                      <p className={`text-xs font-black transition-colors ${a.isActive ? 'text-white' : 'text-zinc-500'}`}>{a.name}</p>
                      <p className={`text-[10px] font-black ${a.isActive ? 'text-orange-500' : 'text-zinc-600'}`}>{formatCurrency(a.amount)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(a)} className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-orange-500"><i className="fa-solid fa-pen-to-square text-[10px]"></i></button>
                    <button onClick={() => onRemove(a.id)} className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-500"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {allowances.length > 0 && (
             <div className="flex justify-center pt-2">
                <button onClick={() => onSetAll(!allowances.every(a => a.isActive))} className="text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">
                   {allowances.every(a => a.isActive) ? 'Tắt tất cả' : 'Bật tất cả'}
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllowanceSection;
