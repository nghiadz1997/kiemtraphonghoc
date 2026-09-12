import { EventItem } from "@/types";
import { formatTimeVN } from "@/utils/dateUtils";

export const notificationService = {
  // Đăng ký Service Worker cho PWA
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return null;
    }
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      console.log("Service Worker đã đăng ký thành công:", reg.scope);
      return reg;
    } catch (err) {
      console.warn("Lỗi đăng ký Service Worker:", err);
      return null;
    }
  },

  // Yêu cầu quyền gửi thông báo trình duyệt / PWA
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn("Lỗi yêu cầu quyền thông báo:", err);
      return Notification.permission;
    }
  },

  // Phát âm thanh chuông báo tinh tế bằng Web Audio API (không cần tải file mp3 ngoài)
  playNotificationSound(): void {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Âm điệu thanh thoát 2 nốt (D5 -> A5)
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(587.33, now, 0.2);       // Nốt Re (D5)
      playTone(880.0, now + 0.12, 0.4);  // Nốt La (A5)
    } catch (e) {
      console.warn("Audio warning:", e);
    }
  },

  // Rung điện thoại (cho Android / mobile hỗ trợ)
  vibrate(pattern: number[] = [200, 100, 200]): void {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        //
      }
    }
  },

  // Hiển thị thông báo Native / PWA trên điện thoại và máy tính
  async showNotification(title: string, options?: NotificationOptions & { url?: string }): Promise<void> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    // Luôn phát âm thanh và rung
    this.playNotificationSound();
    this.vibrate([200, 100, 250]);

    if (Notification.permission === "granted") {
      const mergedOptions: any = {
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        vibrate: [200, 100, 200, 100, 250],
        requireInteraction: true,
        ...options
      };

      try {
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification) {
            await reg.showNotification(title, mergedOptions);
            return;
          }
        }
        new Notification(title, mergedOptions);
      } catch (err) {
        console.warn("Lỗi gửi thông báo:", err);
      }
    }
  },

  // Gửi thông báo sắp đến lịch
  sendUpcomingEventAlert(event: EventItem, minutesBefore: number): void {
    const timeStr = formatTimeVN(event.startDateTime);
    const title = `⏰ Sắp diễn ra: ${event.title}`;
    const locationPart = event.location ? ` tại ${event.location}` : "";
    const body = `Bắt đầu lúc ${timeStr}${locationPart}. Còn ${minutesBefore} phút nữa!`;

    this.showNotification(title, {
      body,
      tag: `event_alert_${event.id}_${minutesBefore}`,
      url: `/dashboard`
    });
  }
};
