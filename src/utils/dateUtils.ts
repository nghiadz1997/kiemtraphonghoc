// Tiện ích xử lý Ngày & Giờ chuẩn hóa tiếng Việt

export const VIETNAMESE_DAYS = [
  'CHỦ NHẬT',
  'THỨ HAI',
  'THỨ BA',
  'THỨ TƯ',
  'THỨ NĂM',
  'THỨ SÁU',
  'THỨ BẢY'
];

export const VIETNAMESE_DAYS_SHORT = [
  'CN',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7'
];

/**
 * Lấy thứ tiếng Việt dạng in hoa đầy đủ (VD: THỨ BẢY, CHỦ NHẬT)
 */
export function getVietnameseDayOfWeek(date: Date = new Date()): string {
  return VIETNAMESE_DAYS[date.getDay()];
}

/**
 * Định dạng ngày dạng DD/MM/YYYY
 */
export function formatDateVN(dateInput: Date | string | number): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng giờ dạng HH:mm
 */
export function formatTimeVN(dateInput: Date | string | number): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Định dạng Ngày Giờ dạng: HH:mm DD/MM/YYYY
 */
export function formatDateTimeVN(dateInput: Date | string | number): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return `${formatTimeVN(d)} ${formatDateVN(d)}`;
}

/**
 * Định dạng ngày để lưu vào input type="date" (YYYY-MM-DD)
 */
export function toInputDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Định dạng ngày giờ để lưu vào input type="datetime-local" (YYYY-MM-DDTHH:mm)
 */
export function toInputDateTime(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Kiểm tra xem 1 ngày có phải là HÔM NAY không
 */
export function isToday(dateInput: Date | string | number): boolean {
  const d = new Date(dateInput);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/**
 * Kiểm tra xem 1 ngày có phải là NGÀY MAI không
 */
export function isTomorrow(dateInput: Date | string | number): boolean {
  const d = new Date(dateInput);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Tính toán khoảng cách thời gian còn lại (Countdown)
 * Trả về { minutesLeft, label, isUnder30m, isUnder10m, isPassed }
 */
export function getRemainingTime(targetDateTime: string | Date): {
  minutesLeft: number;
  secondsLeft: number;
  countdownText: string;
  isUnder30m: boolean;
  isUnder10m: boolean;
  isPassed: boolean;
} {
  const target = new Date(targetDateTime).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return {
      minutesLeft: 0,
      secondsLeft: 0,
      countdownText: 'Đã bắt đầu',
      isUnder30m: false,
      isUnder10m: false,
      isPassed: true
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  let countdownText = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    countdownText = `${days} ngày ${remHours} giờ`;
  } else if (hours > 0) {
    countdownText = `${hours} giờ ${minutes} phút`;
  } else {
    countdownText = `${minutes} phút ${seconds} giây`;
  }

  return {
    minutesLeft: totalMinutes,
    secondsLeft: totalSeconds,
    countdownText,
    isUnder30m: totalMinutes <= 30,
    isUnder10m: totalMinutes <= 10,
    isPassed: false
  };
}

/**
 * Phân chia ca trong ngày: Sáng, Trưa, Chiều, Tối
 */
export type DayTimeSlot = 'sang' | 'trua' | 'chieu' | 'toi';

export function getTimeSlot(dateInput: Date | string | number): DayTimeSlot {
  const d = new Date(dateInput);
  const hour = d.getHours();

  if (hour >= 4 && hour < 12) return 'sang';
  if (hour >= 12 && hour < 14) return 'trua';
  if (hour >= 14 && hour < 18) return 'chieu';
  return 'toi';
}

export const TIME_SLOT_LABELS: Record<DayTimeSlot, { title: string; range: string; icon: string; color: string }> = {
  sang: { title: 'SÁNG', range: '04:00 - 11:59', icon: 'Sunrise', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  trua: { title: 'TRƯA', range: '12:00 - 13:59', icon: 'Sun', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  chieu: { title: 'CHIỀU', range: '14:00 - 17:59', icon: 'Sunset', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  toi: { title: 'TỐI', range: '18:00 - 23:59', icon: 'Moon', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
};

/**
 * Kiểm tra xem 2 khoảng thời gian có bị giao nhau / trùng nhau không
 */
export function areTimeIntervalsOverlapping(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date
): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA < eB && sB < eA;
}
