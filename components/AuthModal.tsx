
import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onLogin: (name: string) => void;
  isForced?: boolean;
}

const AuthModal: React.FC<Props> = ({ onClose, onLogin, isForced = false }) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép nhập số
    if (value.length <= 10) {
      setPhone(value);
      setShowTooltip(value.length > 0 && value.length < 10);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setShowTooltip(true);
      return;
    }
    // Giả lập xử lý đăng nhập/đăng ký
    const displayName = isLoginTab ? "User " + phone.slice(-4) : name;
    onLogin(displayName);
    onClose();
  };

  const isInvalid = phone.length > 0 && phone.length < 10;

  return (
    <div className={`${isForced ? '' : 'fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-200'}`} onClick={!isForced ? onClose : undefined}>
      <div 
        className={`bg-zinc-900 w-full max-w-md ${isForced ? 'rounded-[2.5rem]' : 'rounded-t-[2.5rem] sm:rounded-[2.5rem]'} p-8 border border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-10 duration-300`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-4">
                <i className="fa-solid fa-wallet text-3xl text-zinc-950"></i>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">YM <span className="text-orange-500">Final V1</span></h1>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.3em] mt-1">Salary Calendar</p>
        </div>
        
        <div className="flex bg-zinc-800/50 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => setIsLoginTab(true)}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLoginTab ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20' : 'text-zinc-500'}`}
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => setIsLoginTab(false)}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLoginTab ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20' : 'text-zinc-500'}`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
              <label className="text-[10px] text-zinc-500 font-black uppercase px-1">Họ và tên</label>
              <input 
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-sm text-white focus:border-orange-500 outline-none transition-all placeholder:text-zinc-600 shadow-inner"
              />
            </div>
          )}

          <div className="space-y-1 relative">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] text-zinc-500 font-black uppercase">Số điện thoại</label>
              <span className={`text-[9px] font-bold ${phone.length === 10 ? 'text-green-500' : 'text-zinc-600'}`}>
                {phone.length}/10
              </span>
            </div>
            <input 
              required
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="09xx xxx xxx"
              className={`w-full bg-zinc-800 border ${isInvalid ? 'border-amber-500/50' : 'border-zinc-700'} rounded-2xl p-4 text-sm text-white focus:border-orange-500 outline-none transition-all placeholder:text-zinc-600 shadow-inner`}
            />
            {showTooltip && (
              <div className="absolute -top-8 right-0 bg-amber-500 text-zinc-950 text-[9px] font-black px-2 py-1 rounded-lg animate-in fade-in zoom-in duration-200 shadow-lg after:content-[''] after:absolute after:top-full after:right-4 after:border-4 after:border-transparent after:border-t-amber-500">
                SỐ ĐIỆN THOẠI PHẢI ĐỦ 10 SỐ
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-black uppercase px-1">Mật khẩu</label>
            <input 
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-sm text-white focus:border-orange-500 outline-none transition-all placeholder:text-zinc-600 shadow-inner"
            />
          </div>

          <button 
            type="submit"
            disabled={phone.length !== 10}
            className={`w-full py-5 mt-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl ${phone.length === 10 ? 'bg-orange-500 text-zinc-950 shadow-orange-500/20 active:scale-[0.98]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
          >
            {isLoginTab ? 'Vào Dashboard' : 'Tạo tài khoản'}
          </button>

          {!isForced && (
            <button 
                type="button"
                onClick={onClose}
                className="w-full py-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors"
            >
                Để sau
            </button>
          )}
        </form>

        <div className="mt-8 text-center">
            <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">
                YM Final V1 &bull; Personal Salary Management
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
