
import { DayData, SalaryConfig, PayrollSummary, ShiftType, LeaveType } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Math.round(amount));
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

/**
 * Lấy chính xác chu kỳ lương:
 * Từ 21 tháng trước (targetMonth - 1) đến 27 tháng này (targetMonth)
 */
export const getPayrollRange = (targetYear: number, targetMonth: number) => {
  const startDate = new Date(targetYear, targetMonth - 1, 21, 0, 0, 0);
  const endDate = new Date(targetYear, targetMonth, 27, 23, 59, 59);
  return { startDate, endDate };
};

export const calculatePayroll = (
  days: DayData[],
  config: SalaryConfig,
  allowances: number,
  targetMonth: number,
  targetYear: number
): PayrollSummary => {
  const { startDate, endDate } = getPayrollRange(targetYear, targetMonth);

  const dailyRate = config.standardWorkDays > 0 ? config.baseSalary / config.standardWorkDays : 0;
  const hourlyRate = dailyRate / 8;

  const relevantDays = days.filter(d => {
    const dDate = new Date(d.date + 'T00:00:00');
    return dDate >= startDate && dDate <= endDate;
  });

  let totalWorkDays = 0;
  let totalOTHours = 0;
  let otAmountNormal = 0, otAmountSunday = 0, otAmountHolidayX2 = 0, otAmountHolidayX3 = 0;
  let otHoursNormal = 0, otHoursSunday = 0, otHoursHolidayX2 = 0, otHoursHolidayX3 = 0;

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

    if (day.overtimeHours > 0) {
      totalOTHours += day.overtimeHours;
      if (day.isHoliday) {
        const first8 = Math.min(day.overtimeHours, 8);
        const extra = Math.max(0, day.overtimeHours - 8);
        otHoursHolidayX2 += first8;
        otHoursHolidayX3 += extra;
        otAmountHolidayX2 += (first8 * hourlyRate * 2);
        otAmountHolidayX3 += (extra * hourlyRate * 3);
      } else if (isSunday) {
        otHoursSunday += day.overtimeHours;
        otAmountSunday += (day.overtimeHours * hourlyRate * 2.0);
      } else {
        otHoursNormal += day.overtimeHours;
        otAmountNormal += (day.overtimeHours * hourlyRate * 1.5);
      }
    }
  });

  const baseIncome = Math.round(totalWorkDays * dailyRate);
  const otIncome = Math.round(otAmountNormal + otAmountSunday + otAmountHolidayX2 + otAmountHolidayX3);
  const totalIncome = baseIncome + otIncome + Math.round(allowances);

  return {
    totalWorkDays,
    totalOTHours,
    otHoursNormal, otHoursSunday, otHoursHolidayX2, otHoursHolidayX3,
    otAmountNormal: Math.round(otAmountNormal),
    otAmountSunday: Math.round(otAmountSunday),
    otAmountHolidayX2: Math.round(otAmountHolidayX2),
    otAmountHolidayX3: Math.round(otAmountHolidayX3),
    totalAllowances: Math.round(allowances),
    otIncome,
    baseIncome,
    totalIncome,
    dailyRate: Math.round(dailyRate),
    hourlyRate: Math.round(hourlyRate)
  };
};
