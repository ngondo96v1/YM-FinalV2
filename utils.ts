
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
  const startDate = new Date(targetYear, targetMonth - 1, 21, 0, 0, 0);
  const endDate = new Date(targetYear, targetMonth, 27, 23, 59, 59);
  return { startDate, endDate };
};

// Biểu thuế lũy tiến từng phần 2024
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
  const totalAllowances = Number(allowances) || 0;

  const { startDate, endDate } = getPayrollRange(targetYear, targetMonth - 1);
  const relevantDays = days.filter(d => {
    const dDate = new Date(d.date + 'T00:00:00');
    return dDate >= startDate && dDate <= endDate;
  });

  let totalWorkDays = 0;
  let otAmountNormal = 0, otAmountSunday = 0, otAmountHolidayX2 = 0, otAmountHolidayX3 = 0, otAmountNightExtra = 0;
  let otHoursNormal = 0, otHoursSunday = 0, otHoursHolidayX2 = 0, otHoursHolidayX3 = 0, otHoursNightExtra = 0;
  
  let taxExemptOTIncome = 0;

  relevantDays.forEach(day => {
    const dateObj = new Date(day.date + 'T00:00:00');
    const isSunday = dateObj.getDay() === 0;

    // 1. Tính công gốc (8h đầu tiên)
    if (day.leave === LeaveType.PAID) {
      totalWorkDays += 1;
    } else if (day.shift !== ShiftType.NONE) {
      if (day.isHoliday || !isSunday) {
        totalWorkDays += 1;
      }
    }

    // 2. Tính Tăng ca (Phần giờ làm thêm sau 8h công gốc)
    const hours = parseFloat(day.overtimeHours?.toString() || "0") || 0;
    if (hours > 0) {
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
        // NGÀY THƯỜNG (Ca Ngày hoặc Ca Đêm)
        // 8h đầu OT: Hệ số x1.5
        // Giờ OT thứ 9 trở đi: Hệ số x1.8 (1.5 + 0.3 phụ trội đêm)
        const otPhase1 = Math.min(hours, 8); // Giờ OT từ 1-8
        const otPhase2 = Math.max(0, hours - 8); // Giờ OT từ 9 trở đi

        // Cộng dồn giờ
        otHoursNormal += hours;
        
        // Tính tiền Phase 1 (x1.5)
        otAmountNormal += (otPhase1 * hourlyRate * 1.5);
        taxExemptOTIncome += (otPhase1 * hourlyRate * 0.5);

        // Tính tiền Phase 2 (x1.8)
        if (otPhase2 > 0) {
          otHoursNightExtra += otPhase2;
          // Bản chất x1.8 là (x1.5 OT thường + x0.3 Phụ trội đêm)
          otAmountNormal += (otPhase2 * hourlyRate * 1.5);
          otAmountNightExtra += (otPhase2 * hourlyRate * 0.3);
          
          taxExemptOTIncome += (otPhase2 * hourlyRate * 0.5); // Miễn thuế phần 0.5 của x1.5
          taxExemptOTIncome += (otPhase2 * hourlyRate * 0.3); // Miễn thuế phần 0.3 của phụ trội đêm
        }
      }
    }
  });

  const baseIncome = Math.round(totalWorkDays * dailyRate);
  const otIncome = Math.round(otAmountNormal + otAmountSunday + otAmountHolidayX2 + otAmountHolidayX3 + otAmountNightExtra);
  const grossIncome = baseIncome + otIncome + totalAllowances;

  const insSalary = (config.insuranceSalary && config.insuranceSalary > 0) ? config.insuranceSalary : baseSalary;
  const insuranceDeduction = Math.round(insSalary * 0.105);
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
    totalAllowances: Math.round(totalAllowances),
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
