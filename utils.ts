
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
  // Chu kỳ lương tháng N: từ ngày 21 tháng N-1 đến ngày 20 tháng N
  // targetMonth 1-indexed (1-12)
  const startDate = new Date(targetYear, targetMonth - 2, 21, 0, 0, 0);
  const endDate = new Date(targetYear, targetMonth - 1, 20, 23, 59, 59);
  return { startDate, endDate };
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
  const standardDays = Number(config.standardWorkDays) || 26;
  const dailyRate = standardDays > 0 ? baseSalary / standardDays : 0;
  const hourlyRate = dailyRate / 8;
  const totalManualAllowances = Number(allowances) || 0;

  const { startDate, endDate } = getPayrollRange(targetYear, targetMonth);
  
  // LỌC CHẶT CHẼ: Chỉ tính toán những ngày nằm trong đúng chu kỳ 21 -> 20
  const relevantDays = days.filter(d => {
    const dDate = new Date(d.date + 'T00:00:00');
    return dDate >= startDate && dDate <= endDate;
  });

  let totalWorkDays = 0;
  let otAmountNormal = 0, otAmountSunday = 0, otAmountHolidayX2 = 0, otAmountHolidayX3 = 0, otAmountNightExtra = 0;
  let otHoursNormal = 0, otHoursSunday = 0, otHoursHolidayX2 = 0, otHoursHolidayX3 = 0, otHoursNightExtra = 0;
  let taxExemptOTIncome = 0;
  let sundayOTAllowance = 0; // Phụ cấp 22k cho mỗi ngày Chủ Nhật có tăng ca

  relevantDays.forEach(day => {
    const dateObj = new Date(day.date + 'T00:00:00');
    const isSunday = dateObj.getDay() === 0;

    if (day.leave === LeaveType.PAID) {
      totalWorkDays += 1;
    } else if (day.shift !== ShiftType.NONE) {
      if (day.isHoliday || !isSunday) {
        totalWorkDays += 1;
      }
    }

    const hours = parseFloat(day.overtimeHours?.toString() || "0") || 0;
    if (hours > 0) {
      // Nếu là Chủ Nhật và có phát sinh giờ tăng ca thì cộng thêm 22.000đ phụ cấp
      if (isSunday && !day.isHoliday) {
        sundayOTAllowance += 22000;
      }

      if (day.isHoliday) {
        const first8 = Math.min(hours, 8);
        const extra = Math.max(0, hours - 8);
        otHoursHolidayX2 += first8;
        otHoursHolidayX3 += extra;
        otAmountHolidayX2 += (first8 * hourlyRate * 2.0);
        otAmountHolidayX3 += (extra * hourlyRate * 3.0);
        taxExemptOTIncome += (first8 * hourlyRate * 1.0);
        taxExemptOTIncome += (extra * hourlyRate * 2.0);
      } else if (isSunday) {
        otHoursSunday += hours;
        otAmountSunday += (hours * hourlyRate * 2.0);
        taxExemptOTIncome += (hours * hourlyRate * 1.0);
      } else {
        const otPhase1 = Math.min(hours, 8); 
        const otPhase2 = Math.max(0, hours - 8);
        otHoursNormal += hours;
        otAmountNormal += (otPhase1 * hourlyRate * 1.5);
        taxExemptOTIncome += (otPhase1 * hourlyRate * 0.5);
        if (otPhase2 > 0) {
          otHoursNightExtra += otPhase2;
          otAmountNormal += (otPhase2 * hourlyRate * 1.5);
          otAmountNightExtra += (otPhase2 * hourlyRate * 0.3);
          taxExemptOTIncome += (otPhase2 * hourlyRate * 0.5);
          taxExemptOTIncome += (otPhase2 * hourlyRate * 0.3);
        }
      }
    }
  });

  const baseIncome = Math.round(totalWorkDays * dailyRate);
  const otIncome = Math.round(otAmountNormal + otAmountSunday + otAmountHolidayX2 + otAmountHolidayX3 + otAmountNightExtra);
  // Tổng phụ cấp bao gồm phụ cấp nhập tay + phụ cấp Chủ Nhật tự động
  const totalAllowances = Math.round(totalManualAllowances + sundayOTAllowance);
  const grossIncome = baseIncome + otIncome + totalAllowances;

  const insuranceBase = Number(config.insuranceSalary) || baseSalary;
  const insuranceDeduction = Math.round(insuranceBase * 0.105);
  
  const incomeForTaxCalculation = grossIncome - insuranceDeduction - taxExemptOTIncome;
  const taxableIncome = Math.max(0, incomeForTaxCalculation - 11000000);
  const personalTax = Math.round(calculatePIT(taxableIncome));
  const netIncome = grossIncome - insuranceDeduction - personalTax;

  return {
    totalWorkDays: Number(totalWorkDays.toFixed(2)),
    totalOTHours: Number((otHoursNormal + otHoursSunday + otHoursHolidayX2 + otHoursHolidayX3).toFixed(2)),
    otHoursNormal, otHoursSunday, otHoursHolidayX2, otHoursHolidayX3, otHoursNightExtra,
    otAmountNormal: Math.round(otAmountNormal),
    otAmountSunday: Math.round(otAmountSunday),
    otAmountHolidayX2: Math.round(otAmountHolidayX2),
    otAmountHolidayX3: Math.round(otAmountHolidayX3),
    otAmountNightExtra: Math.round(otAmountNightExtra),
    totalAllowances,
    otIncome: Math.round(otIncome),
    baseIncome: Math.round(baseIncome),
    grossIncome: Math.round(grossIncome),
    insuranceDeduction: Math.round(insuranceDeduction),
    taxableIncome: Math.round(taxableIncome),
    personalTax: Math.round(personalTax),
    netIncome: Math.round(netIncome),
    dailyRate: Math.round(dailyRate),
    hourlyRate: Math.round(hourlyRate)
  };
};
