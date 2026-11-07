
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
  // Overtime Ngày thường
  otNormalDayHours: number;
  otNormalNightHours: number;
  // Overtime Chủ Nhật
  otSundayDayHours: number;
  otSundayNightHours: number;
  // Overtime Ngày Lễ
  otHolidayDayX2Hours: number;
  otHolidayNightX2Hours: number;
  otHolidayDayX3Hours: number;
  otHolidayNightX3Hours: number;
}

/**
 * Tách giờ làm việc và tính OT ngày / OT đêm theo đúng Bộ luật Lao động Việt Nam 2019:
 * - Khung giờ ban đêm: 22h00 đến 06h00 hôm sau (Điều 106 BLLĐ).
 * - Làm thêm ngày thường: Ban ngày 150% (x1.5), Ban đêm 200% (x2.0 = 150% + 30% + 20%).
 * - Làm thêm Chủ Nhật: Ban ngày 200% (x2.0), Ban đêm 270% (x2.7 = 200% + 30% + 40%).
 * - Làm thêm Ngày Lễ: 8h đầu (Ngày x2.0, Đêm x2.7), Sau 8h (Ngày x3.0, Đêm x3.9 = 300% + 30% + 60%).
 */
export const getWorkHoursDetail = (
  checkInTime?: string,
  checkOutTime?: string,
  isSunday: boolean = false,
  isHoliday: boolean = false,
  manualOT: number = 0,
  shift: ShiftType = ShiftType.NONE
): WorkHoursDetail => {
  let otNormalDayHours = 0;
  let otNormalNightHours = 0;
  let otSundayDayHours = 0;
  let otSundayNightHours = 0;
  let otHolidayDayX2Hours = 0;
  let otHolidayNightX2Hours = 0;
  let otHolidayDayX3Hours = 0;
  let otHolidayNightX3Hours = 0;
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

    let normalDayMin = 0;
    let normalNightMin = 0;
    let sundayDayMin = 0;
    let sundayNightMin = 0;
    let holidayDayX2Min = 0;
    let holidayNightX2Min = 0;
    let holidayDayX3Min = 0;
    let holidayNightX3Min = 0;

    for (let m = start; m < end; m++) {
      const t = m % 1440;
      // Ban đêm: trước 06:00 hoặc từ 22:00 trở đi
      const isNight = t < 360 || t >= 1320;
      const minuteIndex = m - start;

      if (isHoliday) {
        if (minuteIndex < 480) {
          if (isNight) holidayNightX2Min++;
          else holidayDayX2Min++;
        } else {
          if (isNight) holidayNightX3Min++;
          else holidayDayX3Min++;
        }
      } else if (isSunday) {
        if (isNight) sundayNightMin++;
        else sundayDayMin++;
      } else {
        // Ngày thường: 8h đầu (480 phút) là ca chuẩn, sau 8h là làm thêm giờ (OT)
        if (minuteIndex >= 480) {
          if (isNight) normalNightMin++;
          else normalDayMin++;
        }
      }
    }

    otNormalDayHours = normalDayMin / 60;
    otNormalNightHours = normalNightMin / 60;
    otSundayDayHours = sundayDayMin / 60;
    otSundayNightHours = sundayNightMin / 60;
    otHolidayDayX2Hours = holidayDayX2Min / 60;
    otHolidayNightX2Hours = holidayNightX2Min / 60;
    otHolidayDayX3Hours = holidayDayX3Min / 60;
    otHolidayNightX3Hours = holidayNightX3Min / 60;
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
        otHolidayDayX2Hours = Math.min(8, manualOT);
        otHolidayDayX3Hours = Math.max(0, manualOT - 8);
      } else if (isSunday) {
        otSundayDayHours = manualOT;
      } else {
        otNormalDayHours = manualOT;
      }
    }
  }

  return {
    totalHours,
    otNormalDayHours: Math.round(otNormalDayHours * 100) / 100,
    otNormalNightHours: Math.round(otNormalNightHours * 100) / 100,
    otSundayDayHours: Math.round(otSundayDayHours * 100) / 100,
    otSundayNightHours: Math.round(otSundayNightHours * 100) / 100,
    otHolidayDayX2Hours: Math.round(otHolidayDayX2Hours * 100) / 100,
    otHolidayNightX2Hours: Math.round(otHolidayNightX2Hours * 100) / 100,
    otHolidayDayX3Hours: Math.round(otHolidayDayX3Hours * 100) / 100,
    otHolidayNightX3Hours: Math.round(otHolidayNightX3Hours * 100) / 100,
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

  let otHoursNormalDay = 0, otHoursNormalNight = 0;
  let otAmountNormalDay = 0, otAmountNormalNight = 0;

  let otHoursSundayDay = 0, otHoursSundayNight = 0;
  let otAmountSundayDay = 0, otAmountSundayNight = 0;

  let otHoursHolidayDayX2 = 0, otHoursHolidayNightX2 = 0;
  let otAmountHolidayDayX2 = 0, otAmountHolidayNightX2 = 0;

  let otHoursHolidayDayX3 = 0, otHoursHolidayNightX3 = 0;
  let otAmountHolidayDayX3 = 0, otAmountHolidayNightX3 = 0;

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

    // 1. Ngày thường:
    // OT ngày: 150% (x1.5). Miễn thuế: 0.5 x otHourlyRate
    if (detail.otNormalDayHours > 0) {
      const pay = detail.otNormalDayHours * 1.5 * otHourlyRate;
      otHoursNormalDay += detail.otNormalDayHours;
      otAmountNormalDay += pay;
      taxExemptOT += (pay - detail.otNormalDayHours * otHourlyRate);
    }
    // OT đêm: 200% (x2.0 theo Điều 98 BLLĐ). Miễn thuế: 1.0 x otHourlyRate
    if (detail.otNormalNightHours > 0) {
      const pay = detail.otNormalNightHours * 2.0 * otHourlyRate;
      otHoursNormalNight += detail.otNormalNightHours;
      otAmountNormalNight += pay;
      taxExemptOT += (pay - detail.otNormalNightHours * otHourlyRate);
    }

    // 2. Chủ Nhật:
    // OT ngày CN: 200% (x2.0). Miễn thuế: 1.0 x otHourlyRate
    if (detail.otSundayDayHours > 0) {
      const pay = detail.otSundayDayHours * 2.0 * otHourlyRate;
      otHoursSundayDay += detail.otSundayDayHours;
      otAmountSundayDay += pay;
      taxExemptOT += (pay - detail.otSundayDayHours * otHourlyRate);
    }
    // OT đêm CN: 270% (x2.7 theo NĐ 145/2020: 200% + 30% + 40%). Miễn thuế: 1.7 x otHourlyRate
    if (detail.otSundayNightHours > 0) {
      const pay = detail.otSundayNightHours * 2.7 * otHourlyRate;
      otHoursSundayNight += detail.otSundayNightHours;
      otAmountSundayNight += pay;
      taxExemptOT += (pay - detail.otSundayNightHours * otHourlyRate);
    }

    // 3. Ngày Lễ:
    // Ca 8h đầu:
    if (detail.otHolidayDayX2Hours > 0) {
      const pay = detail.otHolidayDayX2Hours * 2.0 * otHourlyRate;
      otHoursHolidayDayX2 += detail.otHolidayDayX2Hours;
      otAmountHolidayDayX2 += pay;
      taxExemptOT += (pay - detail.otHolidayDayX2Hours * otHourlyRate);
    }
    if (detail.otHolidayNightX2Hours > 0) {
      const pay = detail.otHolidayNightX2Hours * 2.7 * otHourlyRate;
      otHoursHolidayNightX2 += detail.otHolidayNightX2Hours;
      otAmountHolidayNightX2 += pay;
      taxExemptOT += (pay - detail.otHolidayNightX2Hours * otHourlyRate);
    }
    // Sau 8h:
    if (detail.otHolidayDayX3Hours > 0) {
      const pay = detail.otHolidayDayX3Hours * 3.0 * otHourlyRate;
      otHoursHolidayDayX3 += detail.otHolidayDayX3Hours;
      otAmountHolidayDayX3 += pay;
      taxExemptOT += (pay - detail.otHolidayDayX3Hours * otHourlyRate);
    }
    if (detail.otHolidayNightX3Hours > 0) {
      const pay = detail.otHolidayNightX3Hours * 3.9 * otHourlyRate;
      otHoursHolidayNightX3 += detail.otHolidayNightX3Hours;
      otAmountHolidayNightX3 += pay;
      taxExemptOT += (pay - detail.otHolidayNightX3Hours * otHourlyRate);
    }
  });

  const otAmountNormal = otAmountNormalDay + otAmountNormalNight;
  const otHoursNormal = otHoursNormalDay + otHoursNormalNight;

  const otAmountSunday = otAmountSundayDay + otAmountSundayNight;
  const otHoursSunday = otHoursSundayDay + otHoursSundayNight;

  const otAmountHolidayX2 = otAmountHolidayDayX2 + otAmountHolidayNightX2;
  const otHoursHolidayX2 = otHoursHolidayDayX2 + otHoursHolidayNightX2;

  const otAmountHolidayX3 = otAmountHolidayDayX3 + otAmountHolidayNightX3;
  const otHoursHolidayX3 = otHoursHolidayDayX3 + otHoursHolidayNightX3;

  const totalOTHours = otHoursNormal + otHoursSunday + otHoursHolidayX2 + otHoursHolidayX3;
  const totalOtIncome = otAmountNormal + otAmountSunday + otAmountHolidayX2 + otAmountHolidayX3;

  // Phụ cấp đi làm ngày Chủ Nhật: 22.000đ / ngày đi làm
  const sundayAllowance = workedSundaysCount * SUNDAY_ALLOWANCE_RATE;

  const baseIncome = totalWorkDays * dailyRate;
  
  let totalAllowances = 0;
  allowancesList.forEach(al => { if (al.isActive) totalAllowances += (Number(al.amount) || 0); });
  // Cộng thêm phụ cấp Chủ Nhật vào tổng phụ cấp
  totalAllowances += sundayAllowance;

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
    totalOTHours: Math.round(totalOTHours * 10) / 10,
    otHoursNormal: Math.round(otHoursNormal * 10) / 10,
    otHoursSunday: Math.round(otHoursSunday * 10) / 10,
    otHoursHolidayX2: Math.round(otHoursHolidayX2 * 10) / 10,
    otHoursHolidayX3: Math.round(otHoursHolidayX3 * 10) / 10,

    otAmountNormal: Math.round(otAmountNormal),
    otAmountSunday: Math.round(otAmountSunday),
    otAmountHolidayX2: Math.round(otAmountHolidayX2),
    otAmountHolidayX3: Math.round(otAmountHolidayX3),

    otHoursNormalDay: Math.round(otHoursNormalDay * 10) / 10,
    otHoursNormalNight: Math.round(otHoursNormalNight * 10) / 10,
    otAmountNormalDay: Math.round(otAmountNormalDay),
    otAmountNormalNight: Math.round(otAmountNormalNight),

    otHoursSundayDay: Math.round(otHoursSundayDay * 10) / 10,
    otHoursSundayNight: Math.round(otHoursSundayNight * 10) / 10,
    otAmountSundayDay: Math.round(otAmountSundayDay),
    otAmountSundayNight: Math.round(otAmountSundayNight),

    otHoursHolidayNightX2: Math.round(otHoursHolidayNightX2 * 10) / 10,
    otHoursHolidayNightX3: Math.round(otHoursHolidayNightX3 * 10) / 10,
    otAmountHolidayNightX2: Math.round(otAmountHolidayNightX2),
    otAmountHolidayNightX3: Math.round(otAmountHolidayNightX3),

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
