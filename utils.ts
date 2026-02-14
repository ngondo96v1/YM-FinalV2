
import { DayData, SalaryConfig, PayrollSummary, ShiftType, LeaveType, Allowance } from './types';

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
  "01-09": "Quốc Khánh (Nghỉ thêm)",
  "03-09": "Quốc Khánh (Nghỉ bù/thêm)"
};

const MOVABLE_HOLIDAYS: Record<string, string> = {
  "2024-02-08": "Nghỉ Tết Giáp Thìn",
  "2024-02-09": "30 Tết Giáp Thìn",
  "2024-02-10": "Mùng 1 Tết Giáp Thìn",
  "2024-02-11": "Mùng 2 Tết Giáp Thìn",
  "2024-02-12": "Mùng 3 Tết Giáp Thìn",
  "2024-02-13": "Nghỉ Tết Giáp Thìn",
  "2024-02-14": "Nghỉ Tết Giáp Thìn",
  "2024-04-18": "Giỗ tổ Hùng Vương",
  "2025-01-26": "Nghỉ Tết Ất Tỵ",
  "2025-01-27": "Nghỉ Tết Ất Tỵ",
  "2025-01-28": "Giao thừa Ất Tỵ",
  "2025-01-29": "Mùng 1 Tết Ất Tỵ",
  "2025-01-30": "Mùng 2 Tết Ất Tỵ",
  "2025-01-31": "Mùng 3 Tết Ất Tỵ",
  "2025-02-01": "Nghỉ Tết Ất Tỵ",
  "2025-02-02": "Nghỉ Tết Ất Tỵ",
  "2025-04-07": "Giỗ tổ Hùng Vương"
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
  allowancesList: Allowance[],
  targetMonth: number,
  targetYear: number
): PayrollSummary => {
  const baseSalary = Number(config.baseSalary) || 0;
  const insuranceSalary = Number(config.insuranceSalary) || baseSalary;
  const standardDays = Number(config.standardWorkDays) || 26;
  const dependentCount = Number(config.dependents) || 0;

  const dailyRate = standardDays > 0 ? baseSalary / standardDays : 0;
  const otDailyRate = standardDays > 0 ? insuranceSalary / standardDays : 0;
  const otHourlyRate = otDailyRate / 8;

  const { startDate, endDate } = getPayrollRange(targetYear, targetMonth);
  const relevantDays = days.filter(d => {
    const dDate = new Date(d.date + 'T00:00:00');
    return dDate >= startDate && dDate <= endDate;
  });

  let totalWorkDays = 0;
  let usedAnnualLeave = 0, usedSickLeave = 0, usedTetLeave = 0;
  let otAmountNormal = 0, otAmountSunday = 0, otAmountHolidayX2 = 0, otAmountHolidayX3 = 0;
  let otHoursNormal = 0, otHoursSunday = 0, otHoursHolidayX2 = 0, otHoursHolidayX3 = 0;
  let taxExemptOT = 0;

  relevantDays.forEach(day => {
    const dDate = new Date(day.date + 'T00:00:00');
    const isSunday = dDate.getDay() === 0;
    const isHoliday = !!getHolidayName(dDate) || day.isHoliday;

    if (!isSunday) {
      if (day.leave === LeaveType.PAID) { usedAnnualLeave++; totalWorkDays++; }
      else if (day.leave === LeaveType.SICK) { usedSickLeave++; }
      else if (day.leave === LeaveType.TET || isHoliday) { if (day.leave === LeaveType.TET) usedTetLeave++; totalWorkDays++; }
      else if (day.shift !== ShiftType.NONE) { totalWorkDays++; }
    }

    let totalWorkedHours = 0;
    if (day.checkInTime && day.checkOutTime && day.shift !== ShiftType.NONE) {
      const [h1, m1] = day.checkInTime.split(':').map(Number);
      const [h2, m2] = day.checkOutTime.split(':').map(Number);
      let start = h1 * 60 + m1;
      let end = h2 * 60 + m2;
      if (end <= start) end += 24 * 60;
      totalWorkedHours = (end - start) / 60;
    } else {
      // FIX: Đối với Chủ Nhật/Ngày Lễ, overtimeHours lưu trữ TỔNG giờ làm.
      // Đối với ngày thường, overtimeHours là giờ làm THÊM ngoài 8 tiếng chính.
      if (isSunday || isHoliday) {
        totalWorkedHours = day.overtimeHours || 0;
      } else {
        totalWorkedHours = (day.shift !== ShiftType.NONE ? 8 : 0) + (day.overtimeHours || 0);
      }
    }

    if (totalWorkedHours > 0) {
      if (isHoliday) {
        const h8 = Math.min(8, totalWorkedHours);
        const hOT = Math.max(0, totalWorkedHours - 8);
        const payX2 = h8 * 2.0 * otHourlyRate;
        const payX3 = hOT * 3.0 * otHourlyRate;
        otAmountHolidayX2 += payX2;
        otHoursHolidayX2 += h8;
        otAmountHolidayX3 += payX3;
        otHoursHolidayX3 += hOT;
        taxExemptOT += (payX2 + payX3);
      } else if (isSunday) {
        // Chủ nhật tính theo tổng giờ làm là OT x2.0
        const pay = totalWorkedHours * 2.0 * otHourlyRate;
        otAmountSunday += pay;
        otHoursSunday += totalWorkedHours;
        taxExemptOT += (pay - totalWorkedHours * otHourlyRate);
      } else {
        const otHours = Math.max(0, totalWorkedHours - 8);
        if (otHours > 0) {
          const pay = otHours * 1.5 * otHourlyRate;
          otAmountNormal += pay;
          otHoursNormal += otHours;
          taxExemptOT += (pay - otHours * otHourlyRate);
        }
      }
    }
  });

  const baseIncome = totalWorkDays * dailyRate;
  const totalOtIncome = otAmountNormal + otAmountSunday + otAmountHolidayX2 + otAmountHolidayX3;
  
  let totalAllowances = 0;
  allowancesList.forEach(al => { if (al.isActive) totalAllowances += (Number(al.amount) || 0); });

  const grossIncome = baseIncome + totalOtIncome + totalAllowances;
  const insuranceDeduction = insuranceSalary * 0.105;
  const personalRelief = 11000000;
  const dependentRelief = dependentCount * 4400000;

  const taxableIncomeBase = grossIncome - insuranceDeduction - taxExemptOT;
  const finalTaxableIncome = Math.max(0, taxableIncomeBase - personalRelief - dependentRelief);

  const personalTax = calculatePIT(finalTaxableIncome);
  const netIncome = grossIncome - insuranceDeduction - personalTax;

  return {
    totalWorkDays,
    totalOTHours: otHoursNormal + otHoursSunday + otHoursHolidayX2 + otHoursHolidayX3,
    otHoursNormal, otHoursSunday, otHoursHolidayX2, otHoursHolidayX3,
    otAmountNormal: Math.round(otAmountNormal),
    otAmountSunday: Math.round(otAmountSunday),
    otAmountHolidayX2: Math.round(otAmountHolidayX2),
    otAmountHolidayX3: Math.round(otAmountHolidayX3),
    totalAllowances,
    otIncome: Math.round(totalOtIncome),
    baseIncome: Math.round(baseIncome),
    grossIncome: Math.round(grossIncome),
    insuranceDeduction: Math.round(insuranceDeduction),
    taxExemptIncome: Math.round(taxExemptOT), 
    taxableIncome: Math.round(finalTaxableIncome),
    personalTax: Math.round(personalTax),
    totalDeductions: Math.round(insuranceDeduction + personalTax),
    netIncome: Math.round(netIncome),
    dailyRate: Math.round(dailyRate),
    hourlyRate: Math.round(otHourlyRate),
    usedAnnualLeave, usedSickLeave, usedTetLeave,
    personalRelief, dependentRelief
  };
};
