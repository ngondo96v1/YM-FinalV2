
import { DayData, SalaryConfig, PayrollSummary, ShiftType, LeaveType } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Math.round(amount || 0));
};

export const formatInputNumber = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseInputNumber = (val: string): number => {
  const cleanStr = val.replace(/\./g, '');
  return parseInt(cleanStr, 10) || 0;
};

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getPayrollRange = (targetYear: number, targetMonth: number) => {
  const startDate = new Date(targetYear, targetMonth - 2, 21, 0, 0, 0);
  const endDate = new Date(targetYear, targetMonth - 1, 20, 23, 59, 59);
  return { startDate, endDate };
};

const FIXED_HOLIDAYS: Record<string, string> = {
  "01-01": "Tết Dương Lịch",
  "30-04": "Giải Phóng Miền Nam",
  "01-05": "Quốc Tế Lao Động",
  "02-09": "Quốc Khánh",
  "25-12": "Giáng Sinh"
};

const MOVABLE_HOLIDAYS: Record<string, string> = {
  "2024-02-09": "30 Tết Giáp Thìn",
  "2024-02-10": "Mùng 1 Tết Giáp Thìn",
  "2024-02-11": "Mùng 2 Tết Giáp Thìn",
  "2024-02-12": "Mùng 3 Tết Giáp Thìn",
  "2024-04-18": "Giỗ tổ Hùng Vương",
  "2025-01-28": "Giao thừa Ất Tỵ",
  "2025-01-29": "Mùng 1 Tết Ất Tỵ",
  "2025-01-30": "Mùng 2 Tết Ất Tỵ",
  "2025-01-31": "Mùng 3 Tết Ất Tỵ"
};

export const getHolidayName = (date: Date): string | null => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const fixedKey = `${day}-${month}`;
  const fullKey = toDateKey(date);
  return FIXED_HOLIDAYS[fixedKey] || MOVABLE_HOLIDAYS[fullKey] || null;
};

const calculatePIT = (taxableAmount: number): number => {
  if (taxableAmount <= 0) return 0;
  if (taxableAmount <= 5000000) return taxableAmount * 0.05;
  if (taxableAmount <= 10000000) return taxableAmount * 0.1 - 250000;
  if (taxableAmount <= 18000000) return taxableAmount * 0.15 - 750000;
  if (taxableAmount <= 32000000) return taxableAmount * 0.2 - 1650000;
  if (taxableAmount <= 52000000) return taxableAmount * 0.25 - 3250000;
  if (taxableAmount <= 80000000) return taxableAmount * 0.3 - 5850000;
  return taxableAmount * 0.35 - 9850000;
};

export const calculatePayroll = (
  days: DayData[],
  config: SalaryConfig,
  allowances: number,
  targetMonth: number,
  targetYear: number
): PayrollSummary => {
  const baseSalary = Number(config.baseSalary) || 0;
  const insuranceSalary = Number(config.insuranceSalary) || baseSalary;
  const standardDays = Number(config.standardWorkDays) || 26;

  const dailyRate = standardDays > 0 ? baseSalary / standardDays : 0;
  const otDailyRate = standardDays > 0 ? insuranceSalary / standardDays : 0;
  const otHourlyRate = otDailyRate / 8;

  const { startDate, endDate } = getPayrollRange(targetYear, targetMonth);
  const relevantDays = days.filter(d => {
    const dDate = new Date(d.date + 'T00:00:00');
    return dDate >= startDate && dDate <= endDate;
  });

  let totalWorkDays = 0;
  let usedAnnualLeave = 0;
  let usedSickLeave = 0;
  let usedTetLeave = 0;

  relevantDays.forEach(day => {
    const dDate = new Date(day.date + 'T00:00:00');
    const isSunday = dDate.getDay() === 0;
    const isPublicHoliday = !!getHolidayName(dDate) || day.isHoliday;

    if (isSunday) return;

    if (day.leave === LeaveType.PAID) {
      usedAnnualLeave++;
      totalWorkDays++;
    } else if (day.leave === LeaveType.SICK) {
      usedSickLeave++;
    } else if (day.leave === LeaveType.TET || isPublicHoliday) {
      if (day.leave === LeaveType.TET) usedTetLeave++;
      totalWorkDays++;
    } else if (day.shift !== ShiftType.NONE) {
      totalWorkDays++;
    }
  });

  let otIncome = 0;
  let nightPremiumIncome = 0;
  let otHoursNormal = 0, otHoursSunday = 0, otHoursHolidayX2 = 0, otHoursHolidayX3 = 0, otHoursNightExtra = 0;

  relevantDays.forEach(day => {
    const dDate = new Date(day.date + 'T00:00:00');
    const isSunday = dDate.getDay() === 0;
    const isHoliday = !!getHolidayName(dDate) || day.isHoliday;
    
    const baseHours = (day.shift !== ShiftType.NONE && !isSunday) ? 8 : 0;
    const hoursInput = Number(day.overtimeHours) || 0;

    if (isSunday && hoursInput > 0) {
        // Chủ Nhật: 16h đầu x2.0, sau 16h x2.3
        const normalHours = Math.min(hoursInput, 16);
        const extraNightHours = Math.max(0, hoursInput - 16);
        
        otIncome += (normalHours * 2.0 * otHourlyRate);
        otIncome += (extraNightHours * 2.3 * otHourlyRate);
        
        otHoursSunday += hoursInput;
        if (extraNightHours > 0) {
            otHoursNightExtra += extraNightHours;
            nightPremiumIncome += (extraNightHours * 0.3 * otHourlyRate);
        }
    } else if (!isSunday && hoursInput > 0) {
        // Ngày thường hoặc ngày Lễ
        // 1. Phân bổ OT theo định mức (8h đầu/sau 8h cho ngày Lễ)
        if (isHoliday) {
            const hX2 = Math.min(hoursInput, 8);
            const hX3 = Math.max(0, hoursInput - 8);
            otIncome += (hX2 * 2.0 * otHourlyRate) + (hX3 * 3.0 * otHourlyRate);
            otHoursHolidayX2 += hX2;
            otHoursHolidayX3 += hX3;
        } else {
            otIncome += (hoursInput * 1.5 * otHourlyRate);
            otHoursNormal += hoursInput;
        }

        // 2. Tính phí đêm (+0.3) nếu TỔNG giờ làm (Base + OT) vượt 16
        const totalDayHours = baseHours + hoursInput;
        const nightHours = Math.max(0, totalDayHours - 16);
        if (nightHours > 0) {
            otIncome += (nightHours * 0.3 * otHourlyRate);
            otHoursNightExtra += nightHours;
            nightPremiumIncome += (nightHours * 0.3 * otHourlyRate);
        }
    }
  });

  const baseIncome = totalWorkDays * dailyRate;
  const grossIncome = baseIncome + otIncome + allowances;
  const insuranceDeduction = insuranceSalary * 0.105;
  const taxableIncome = Math.max(0, grossIncome - insuranceDeduction - 11000000);
  const personalTax = calculatePIT(taxableIncome);
  const netIncome = grossIncome - insuranceDeduction - personalTax;

  return {
    totalWorkDays,
    totalOTHours: otHoursNormal + otHoursSunday + otHoursHolidayX2 + otHoursHolidayX3,
    otHoursNormal, otHoursSunday, otHoursHolidayX2, otHoursHolidayX3, otHoursNightExtra,
    otAmountNormal: 0, otAmountSunday: 0, otAmountHolidayX2: 0, otAmountHolidayX3: 0, 
    otAmountNightExtra: Math.round(nightPremiumIncome),
    totalAllowances: allowances,
    otIncome: Math.round(otIncome),
    baseIncome: Math.round(baseIncome),
    grossIncome: Math.round(grossIncome),
    insuranceDeduction: Math.round(insuranceDeduction),
    taxableIncome: Math.round(taxableIncome),
    personalTax: Math.round(personalTax),
    netIncome: Math.round(netIncome),
    dailyRate: Math.round(dailyRate),
    hourlyRate: Math.round(otHourlyRate),
    usedAnnualLeave, usedSickLeave, usedTetLeave
  };
};
