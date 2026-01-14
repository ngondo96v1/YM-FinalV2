
export enum ShiftType {
  NONE = 'NONE',
  DAY = 'DAY',
  NIGHT = 'NIGHT'
}

export enum LeaveType {
  NONE = 'NONE',
  PAID = 'PAID', // Phép năm
  SICK = 'SICK'  // Nghỉ bệnh
}

export interface DayData {
  date: string; // ISO string YYYY-MM-DD
  shift: ShiftType;
  leave: LeaveType;
  overtimeHours: number;
  isHoliday: boolean;
  notes?: string;
}

export interface Allowance {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
}

export interface SalaryConfig {
  baseSalary: number;
  standardWorkDays: number;
  insuranceSalary?: number; // Lương đóng bảo hiểm (nếu khác lương cơ bản)
}

export interface PayrollSummary {
  totalWorkDays: number;
  totalOTHours: number;
  otHoursNormal: number;
  otHoursSunday: number;
  otHoursHolidayX2: number;
  otHoursHolidayX3: number;
  otHoursNightExtra: number; // Số giờ tăng ca đêm (sau 8h ca đêm)
  otAmountNormal: number;
  otAmountSunday: number;
  otAmountHolidayX2: number;
  otAmountHolidayX3: number;
  otAmountNightExtra: number; // Tiền tăng ca đêm (x1.8)
  totalAllowances: number;
  otIncome: number;
  baseIncome: number;
  grossIncome: number; // Tổng thu nhập trước thuế/bh
  insuranceDeduction: number; // Khoản trừ bảo hiểm (10.5%)
  taxableIncome: number; // Thu nhập tính thuế
  personalTax: number; // Thuế TNCN
  netIncome: number; // Thực nhận cuối cùng
  dailyRate: number;
  hourlyRate: number;
}
