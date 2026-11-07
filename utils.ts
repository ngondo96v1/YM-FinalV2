
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

export const SUNDAY_ALLOWANCE_RATE = 22000;

export interface WorkHoursDetail {
  totalHours: number;
  // Số giờ làm trong khung giờ đêm (22h00 - 06h00) hưởng phụ cấp +30%
  nightHours: number;
  // Overtime Ngày thường (150%)
  otNormalHours: number;
  // Overtime Chủ Nhật (200%)
  otSundayHours: number;
  // Overtime Ngày Lễ
  otHolidayX2Hours: number;
  otHolidayX3Hours: number;
}

/**
 * Tách giờ làm việc và tính OT ngày thường (150%), Chủ Nhật (200%), Ngày Lễ (200%/300%)
 * và phụ cấp làm việc ban đêm (30% cho mọi giờ rơi vào khung 22h00 – 06h00).
 */
export const getWorkHoursDetail = (
  checkInTime?: string,
  checkOutTime?: string,
  isSunday: boolean = false,
  isHoliday: boolean = false,
  manualOT: number = 0,
  shift: ShiftType = ShiftType.NONE
): WorkHoursDetail => {
  let nightHours = 0;
  let otNormalHours = 0;
  let otSundayHours = 0;
  let otHolidayX2Hours = 0;
  let otHolidayX3Hours = 0;
  let totalHours = 0;

  const hasCheckTimes = !!(checkInTime && checkOutTime && (shift !== ShiftType.NONE || isSunday));

  if (hasCheckTimes && checkInTime && checkOutTime) {
    const [h1, m1] = checkInTime.split(':').map(Number);
    const [h2, m2] = checkOutTime.split(':').map(Number);
    let start = h1 * 60 + m1;
    let end = h2 * 60 + m2;
    if (end <= start) end += 24 * 60;
    
    const totalMinutes = end - start;
    totalHours = totalMinutes / 60;

    let nightMinutes = 0;

    for (let m = start; m < end; m++) {
      const t = m % 1440;
      // Khung giờ ban đêm: từ 22:00 hôm trước đến 06:00 sáng hôm sau
      if (t < 360 || t >= 1320) {
        nightMinutes++;
      }
    }

    nightHours = nightMinutes / 60;

    if (isHoliday) {
      const h8Min = Math.min(480, totalMinutes);
      const hOTMin = Math.max(0, totalMinutes - 480);
      otHolidayX2Hours = h8Min / 60;
      otHolidayX3Hours = hOTMin / 60;
    } else if (isSunday) {
      otSundayHours = totalMinutes / 60;
    } else {
      // Ngày thường: 8h đầu là ca chuẩn, sau 8h là giờ tăng ca (150%)
      const otMin = Math.max(0, totalMinutes - 480);
      otNormalHours = otMin / 60;
    }
  } else {
    // Fallback khi chỉ nhập OT thủ công
    if (shift !== ShiftType.NONE || isSunday) {
      if (isSunday || isHoliday) {
        totalHours = manualOT || 0;
      } else {
        totalHours = (shift !== ShiftType.NONE ? 8 : 0) + (manualOT || 0);
      }
    }

    if (manualOT > 0) {
      if (isHoliday) {
        otHolidayX2Hours = Math.min(8, manualOT);
        otHolidayX3Hours = Math.max(0, manualOT - 8);
      } else if (isSunday) {
        otSundayHours = manualOT;
      } else {
        otNormalHours = manualOT;
      }
    }
  }

  return {
    totalHours,
    nightHours: Math.round(nightHours * 100) / 100,
    otNormalHours: Math.round(otNormalHours * 100) / 100,
    otSundayHours: Math.round(otSundayHours * 100) / 100,
    otHolidayX2Hours: Math.round(otHolidayX2Hours * 100) / 100,
    otHolidayX3Hours: Math.round(otHolidayX3Hours * 100) / 100,
  };
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
  let workedSundaysCount = 0;

  let totalNormalOTHours = 0;
  let totalSundayOTHours = 0;
  let totalHolidayX2Hours = 0;
  let totalHolidayX3Hours = 0;
  let totalNightHours = 0;

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

    // Nếu Chủ Nhật chọn "Nghỉ (Ko làm)" (ShiftType.NONE) thì không tính công và không tính OT
    if (isSunday && day.shift === ShiftType.NONE) {
      return;
    }

    const detail = getWorkHoursDetail(
      day.checkInTime,
      day.checkOutTime,
      isSunday,
      isHoliday,
      day.overtimeHours,
      day.shift
    );

    // Kiểm tra đi làm Chủ Nhật: nếu có giờ làm thực tế và không phải nghỉ
    if (isSunday && detail.totalHours > 0) {
      workedSundaysCount++;
    }

    totalNormalOTHours += detail.otNormalHours;
    totalSundayOTHours += detail.otSundayHours;
    totalHolidayX2Hours += detail.otHolidayX2Hours;
    totalHolidayX3Hours += detail.otHolidayX3Hours;
    totalNightHours += detail.nightHours;
  });

  // 1. Tiền tăng ca (OT):
  // Ngày thường 150% (x1.5):
  const otAmountNormal = totalNormalOTHours * 1.5 * otHourlyRate;
  // Chủ nhật 200% (x2.0):
  const otAmountSunday = totalSundayOTHours * 2.0 * otHourlyRate;
  // Ngày lễ 8h đầu 200% (x2.0):
  const otAmountHolidayX2 = totalHolidayX2Hours * 2.0 * otHourlyRate;
  // Ngày lễ sau 8h 300% (x3.0):
  const otAmountHolidayX3 = totalHolidayX3Hours * 3.0 * otHourlyRate;

  const totalOTHours = totalNormalOTHours + totalSundayOTHours + totalHolidayX2Hours + totalHolidayX3Hours;
  const totalOtIncome = otAmountNormal + otAmountSunday + otAmountHolidayX2 + otAmountHolidayX3;

  // 2. Phụ cấp ca đêm (30% tiền lương giờ cho mọi giờ làm trong khung 22h - 6h):
  const nightShiftAllowance = totalNightHours * 0.3 * otHourlyRate;

  // 3. Phụ cấp đi làm ngày Chủ Nhật: 22.000đ / ngày đi làm
  const sundayAllowance = workedSundaysCount * SUNDAY_ALLOWANCE_RATE;

  // 4. Miễn thuế TNCN theo Thông tư 111/2013/TT-BTC:
  // Phần OT vượt mức 100%:
  taxExemptOT += (totalNormalOTHours * 0.5 * otHourlyRate);
  taxExemptOT += (totalSundayOTHours * 1.0 * otHourlyRate);
  taxExemptOT += (totalHolidayX2Hours * 1.0 * otHourlyRate);
  taxExemptOT += (totalHolidayX3Hours * 2.0 * otHourlyRate);
  // Toàn bộ phụ cấp đêm 30% được miễn thuế:
  taxExemptOT += nightShiftAllowance;

  const baseIncome = totalWorkDays * dailyRate;
  
  let totalAllowances = 0;
  allowancesList.forEach(al => { if (al.isActive) totalAllowances += (Number(al.amount) || 0); });
  // Cộng thêm phụ cấp Chủ Nhật vào tổng phụ cấp
  totalAllowances += sundayAllowance;

  const grossIncome = baseIncome + totalOtIncome + totalAllowances + nightShiftAllowance;
  const insuranceDeduction = insuranceSalary * 0.105;
  const personalRelief = 11000000;
  const dependentRelief = dependentCount * 4400000;

  const taxableIncomeBase = grossIncome - insuranceDeduction - taxExemptOT;
  const finalTaxableIncome = Math.max(0, taxableIncomeBase - personalRelief - dependentRelief);

  const personalTax = calculatePIT(finalTaxableIncome);
  const netIncome = grossIncome - insuranceDeduction - personalTax;

  return {
    totalWorkDays,
    totalOTHours: Math.round(totalOTHours * 10) / 10,
    otHoursNormal: Math.round(totalNormalOTHours * 10) / 10,
    otHoursSunday: Math.round(totalSundayOTHours * 10) / 10,
    otHoursHolidayX2: Math.round(totalHolidayX2Hours * 10) / 10,
    otHoursHolidayX3: Math.round(totalHolidayX3Hours * 10) / 10,

    otAmountNormal: Math.round(otAmountNormal),
    otAmountSunday: Math.round(otAmountSunday),
    otAmountHolidayX2: Math.round(otAmountHolidayX2),
    otAmountHolidayX3: Math.round(otAmountHolidayX3),

    totalNightHours: Math.round(totalNightHours * 10) / 10,
    nightShiftAllowance: Math.round(nightShiftAllowance),

    workedSundaysCount,
    sundayAllowance,

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

