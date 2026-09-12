"use client";

import { useEffect, useState, useRef } from "react";
import { EventItem } from "@/types";
import { notificationService } from "@/services/notificationService";
import { useToast } from "./useToast";

export function useNotificationWatcher(events: EventItem[]) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const alertedEventIds = useRef<Set<string>>(new Set());
  const { info } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported("Notification" in window && "serviceWorker" in navigator);
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }
      // Đăng ký Service Worker
      notificationService.registerServiceWorker();
    }
  }, []);

  const requestPermission = async () => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    return result;
  };

  const sendTestNotification = async () => {
    const currentPerm = await requestPermission();
    if (currentPerm === "granted") {
      await notificationService.showNotification("🎉 Thông báo hoạt động tốt!", {
        body: "Ứng dụng CongiVec đã kết nối thành công với hệ thống thông báo trên điện thoại của bạn.",
        tag: "test_notification"
      });
      info("Đã gửi thông báo thử nghiệm", "Kiểm tra màn hình hoặc thanh thông báo");
    }
  };

  // Quét định kỳ mỗi 30 giây để kiểm tra sự kiện sắp diễn ra
  useEffect(() => {
    if (!events || events.length === 0) return;

    const checkUpcoming = () => {
      const now = Date.now();
      const defaultMinutes = 15; // Mặc định 15 phút hoặc đọc từ local settings

      let customMinutes = defaultMinutes;
      if (typeof window !== "undefined") {
        const savedMins = localStorage.getItem("congivec_default_reminder");
        if (savedMins) customMinutes = parseInt(savedMins, 10) || defaultMinutes;
      }

      events.forEach((ev) => {
        const startTime = new Date(ev.startDateTime).getTime();
        const diffMs = startTime - now;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        // Nếu sự kiện sắp diễn ra trong khoảng từ 0 đến customMinutes phút
        if (diffMinutes >= 0 && diffMinutes <= customMinutes) {
          const alertKey = `${ev.id}_${Math.floor(diffMinutes / 5)}`; // Tránh gửi trùng lặp
          if (!alertedEventIds.current.has(alertKey)) {
            alertedEventIds.current.add(alertKey);

            // Gửi thông báo native/PWA
            notificationService.sendUpcomingEventAlert(ev, Math.max(1, diffMinutes));

            // Hiển thị toast trong ứng dụng
            info(
              `⏰ Sắp diễn ra: ${ev.title}`,
              `Bắt đầu sau ${diffMinutes} phút ${ev.location ? `tại ${ev.location}` : ""}`
            );
          }
        }
      });
    };

    // Kiểm tra ngay lập tức khi danh sách sự kiện thay đổi
    checkUpcoming();

    const interval = setInterval(checkUpcoming, 30000);
    return () => clearInterval(interval);
  }, [events, info]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendTestNotification
  };
}
