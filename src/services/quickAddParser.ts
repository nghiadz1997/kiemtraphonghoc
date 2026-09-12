import { EventType, PriorityLevel } from "@/types";
import { toInputDate } from "@/utils/dateUtils";

export interface ParsedQuickAdd {
  rawText: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: EventType;
  priority: PriorityLevel;
  location?: string;
  confidence: number; // 0 to 1
}

export function parseQuickAddVietnamese(input: string): ParsedQuickAdd {
  const text = input.trim();
  const lower = text.toLowerCase();

  const now = new Date();
  let targetDate = new Date(now);
  let startHour = 9;
  let startMinute = 0;
  let durationMinutes = 60;
  let detectedType: EventType = "personal";
  let detectedPriority: PriorityLevel = "normal";
  let detectedLocation = "";

  // 1. Phân loại loại sự kiện
  if (lower.includes("họp") || lower.includes("meeting")) {
    detectedType = "meeting";
  } else if (lower.includes("học") || lower.includes("lớp") || lower.includes("bài tập") || lower.includes("ôn thi")) {
    detectedType = "study";
  } else if (lower.includes("deadline") || lower.includes("hạn chót") || lower.includes("nộp")) {
    detectedType = "deadline";
  } else if (lower.includes("online") || lower.includes("zoom") || lower.includes("meet")) {
    detectedType = "online";
  } else if (lower.includes("báo cáo") || lower.includes("công việc") || lower.includes("dự án") || lower.includes("kiểm tra")) {
    detectedType = "work";
  }

  // 2. Độ ưu tiên
  if (lower.includes("gấp") || lower.includes("khẩn cấp") || lower.includes("urgent")) {
    detectedPriority = "urgent";
  } else if (lower.includes("quan trọng")) {
    detectedPriority = "high";
  }

  // 3. Phân tích Ngày
  let matchedDateStr = "";

  if (lower.includes("ngày mai") || lower.includes("mai")) {
    targetDate.setDate(now.getDate() + 1);
    matchedDateStr = "ngày mai";
  } else if (lower.includes("ngày kia") || lower.includes("mốt")) {
    targetDate.setDate(now.getDate() + 2);
    matchedDateStr = "ngày kia";
  } else if (lower.includes("hôm nay") || lower.includes("nay")) {
    // targetDate is today
    matchedDateStr = "hôm nay";
  } else {
    // Kiểm tra "thứ 2", "thứ hai", ... "chủ nhật"
    const dayKeywords: Record<string, number> = {
      "thứ 2": 1, "thứ hai": 1, "t2": 1,
      "thứ 3": 2, "thứ ba": 2, "t3": 2,
      "thứ 4": 3, "thứ tư": 3, "t4": 3,
      "thứ 5": 4, "thứ năm": 4, "t5": 4,
      "thứ 6": 5, "thứ sáu": 5, "t6": 5,
      "thứ 7": 6, "thứ bảy": 6, "t7": 6,
      "chủ nhật": 0, "cn": 0
    };

    for (const [kw, dayIndex] of Object.entries(dayKeywords)) {
      if (new RegExp(`\\b${kw}\\b`, "i").test(lower)) {
        const currentDay = now.getDay();
        let daysUntil = dayIndex - currentDay;
        if (daysUntil <= 0) daysUntil += 7; // sang tuần tới
        targetDate.setDate(now.getDate() + daysUntil);
        matchedDateStr = kw;
        break;
      }
    }

    // Kiểm tra định dạng ngày cụ thể DD/MM hoặc DD/MM/YYYY
    const dateMatch = lower.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?\b/);
    if (dateMatch) {
      const d = parseInt(dateMatch[1], 10);
      const m = parseInt(dateMatch[2], 10) - 1;
      const y = dateMatch[3] ? parseInt(dateMatch[3], 10) : now.getFullYear();
      targetDate = new Date(y, m, d);
      matchedDateStr = dateMatch[0];
    }
  }

  // 4. Phân tích Giờ
  // Hỗ trợ: "8h", "8h30", "08:00", "8 giờ", "8 giờ 30", "14h", "15:00"
  const timeRegex = /\b(\d{1,2})(?:h| giờ|:)(\d{2})?(?:\s*(sáng|chiều|tối))?\b/i;
  const timeMatch = lower.match(timeRegex);

  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3]?.toLowerCase();

    if (period === "chiều" || period === "tối") {
      if (h < 12) h += 12;
    } else if (period === "sáng" && h === 12) {
      h = 0;
    }

    if (h >= 0 && h < 24) startHour = h;
    if (m >= 0 && m < 60) startMinute = m;
  }

  // 5. Phân tích Địa điểm
  const locationMatch = text.match(/(?:ở|tại|phòng|tại phòng|qua)\s+([A-Za-z0-9\.\-\s]+?)(?:ngày|lúc|\d+h|$)/i);
  if (locationMatch && locationMatch[1]) {
    detectedLocation = locationMatch[1].trim();
  }

  // 6. Trích xuất Tiêu đề sạch sẽ (Loại bỏ bớt từ khóa ngày, giờ)
  let cleanTitle = text;
  if (timeMatch) {
    cleanTitle = cleanTitle.replace(timeMatch[0], "");
  }
  if (matchedDateStr) {
    cleanTitle = cleanTitle.replace(new RegExp(matchedDateStr, "gi"), "");
  }
  // Loại bỏ các từ phụ thừa
  cleanTitle = cleanTitle
    .replace(/\b(vào lúc|lúc|ngày|vào ngày)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanTitle) {
    cleanTitle = text;
  }

  // Viết hoa chữ cái đầu tiêu đề
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  // Tính giờ kết thúc
  const endTotalMinutes = startHour * 60 + startMinute + durationMinutes;
  const endHour = Math.floor(endTotalMinutes / 60) % 24;
  const endMinute = endTotalMinutes % 60;

  const startFormatted = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
  const endFormatted = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

  return {
    rawText: text,
    title: cleanTitle,
    date: toInputDate(targetDate),
    startTime: startFormatted,
    endTime: endFormatted,
    type: detectedType,
    priority: detectedPriority,
    location: detectedLocation || (detectedType === "online" ? "Google Meet" : undefined),
    confidence: timeMatch || matchedDateStr ? 0.9 : 0.6
  };
}
