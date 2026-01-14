
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
  baseSalary: number; // Lương cơ bản để tính đơn giá ngày/giờ
  standardWorkDays: number;
  insuranceSalary?: number; // Lương đóng bảo hiểm (để tính 10.5%)
}

export interface PayrollSummary {
  totalWorkDays: number;
  totalOTHours: number;
  otHoursNormal: number;
  otHoursSunday: number;
  otHoursHolidayX2: number;
  otHoursHolidayX3: number;
  otHoursNightExtra: number; 
  otAmountNormal: number;
  otAmountSunday: number;
  otAmountHolidayX2: number;
  otAmountHolidayX3: number;
  otAmountNightExtra: number; 
  totalAllowances: number;
  otIncome: number;
  baseIncome: number;
  grossIncome: number; 
  insuranceDeduction: number; 
  taxableIncome: number; 
  personalTax: number; 
  netIncome: number; 
  dailyRate: number;
  hourlyRate: number;
}
