
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
  };

  const handleOpenEdit = (allowance: Allowance) => {
    setEditingAllowance(allowance);
    setNameInput(allowance.name);
    setAmountInput(formatInputNumber(allowance.amount.toString()));
    setShowForm(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountInput(formatInputNumber(e.target.value));
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
    <div className="px-4 mt-8">
      {/* Header / Toggle Button */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer
          ${isExpanded ? 'bg-zinc-900 border-zinc-800 rounded-b-none' : 'bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900'}
        `}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeCount > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-500'}`}>
            <i className="fa-solid fa-hand-holding-heart text-xs"></i>
          </div>
          <div>
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Phụ cấp</h2>
            {!isExpanded && (
               <p className="text-[10px] font-bold text-zinc-600 uppercase">
                {activeCount} đang bật • <span className="text-orange-500/80">{formatCurrency(activeTotal)}</span>
               </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
           {isExpanded && (
             <button 
                onClick={(e) => { e.stopPropagation(); onSetAll(true); }}
                className="text-[9px] bg-zinc-800 text-zinc-400 font-black px-2 py-1 rounded hover:text-white uppercase tracking-tighter"
              >
                Bật hết
              </button>
           )}
           <i className={`fa-solid fa-chevron-down text-zinc-600 text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`
        overflow-hidden transition-all duration-300 border-x border-b border-zinc-800 rounded-b-2xl bg-zinc-900/30
        ${isExpanded ? 'max-h-[1000px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0 border-none'}
      `}>
        <div className="flex justify-end mb-4">
            {!showForm && (
              <button 
                  onClick={handleOpenAdd}
                  className="text-[10px] bg-orange-500 text-zinc-950 font-black px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-lg shadow-orange-500/10 active:scale-95 transition-transform"
              >
                  <i className="fa-solid fa-plus"></i>
                  <span>THÊM MỚI</span>
              </button>
            )}
        </div>

        {showForm && (
          <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded-2xl mb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">
                  {editingAllowance ? 'Sửa phụ cấp' : 'Thêm phụ cấp'}
                </span>
             </div>
             <input 
               placeholder="Tên phụ cấp (Vd: Xăng xe)"
               value={nameInput}
               onChange={e => setNameInput(e.target.value)}
               className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none transition-colors"
             />
             <input 
               type="text"
               inputMode="numeric"
               placeholder="Số tiền (VND)"
               value={amountInput}
               onChange={handleAmountChange}
               className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none transition-colors"
             />
             <div className="flex gap-2">
               <button 
                onClick={() => { setShowForm(false); setEditingAllowance(null); }} 
                className="flex-1 bg-zinc-800 py-3 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest"
               >
                 Huỷ
               </button>
               <button onClick={handleSave} className="flex-1 bg-orange-500 py-3 rounded-xl text-[10px] font-black text-zinc-950 uppercase tracking-widest">
                 Lưu lại
               </button>
             </div>
          </div>
        )}

        <div className="space-y-2">
          {allowances.length === 0 ? (
            <p className="text-center py-6 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Chưa có phụ cấp nào</p>
          ) : (
            allowances.map(a => (
              <div key={a.id} className="bg-zinc-900/50 border border-zinc-800/50 p-3 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => onToggle(a.id)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${a.isActive ? 'bg-orange-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${a.isActive ? 'left-5' : 'left-1'}`}></div>
                  </button>
                  <div className="cursor-pointer" onClick={() => handleOpenEdit(a)}>
                    <p className={`text-sm font-bold transition-colors ${a.isActive ? 'text-white' : 'text-zinc-500'}`}>{a.name}</p>
                    <p className={`text-[10px] font-black ${a.isActive ? 'text-orange-500/80' : 'text-zinc-600'}`}>{formatCurrency(a.amount)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(a)}
                    className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:text-orange-500 transition-colors"
                    title="Sửa"
                  >
                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                  <button 
                    onClick={() => onRemove(a.id)}
                    className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:text-red-500 transition-colors"
                    title="Xoá"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllowanceSection;
