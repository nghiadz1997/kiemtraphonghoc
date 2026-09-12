export function getFirebaseErrorMessage(error: unknown): string {
  if (!error) return "Đã xảy ra lỗi không xác định";

  const err = error as { code?: string; message?: string };
  const code = err.code || "";

  switch (code) {
    case "auth/operation-not-allowed":
      return "Tính năng Đăng nhập bằng Google chưa được BẬT trên Firebase Console. Vui lòng vào Firebase Console > Authentication > Sign-in method > Google và bật (Enable) lên.";
    case "auth/unauthorized-domain":
      return "Tên miền hiện tại (Domain) chưa được cấp phép trong Firebase Console. Vui lòng vào Firebase Console > Authentication > Settings > Authorized Domains và thêm 'localhost' hoặc IP truy cập.";
    case "auth/popup-blocked":
      return "Trình duyệt đã chặn cửa sổ Pop-up Google. Vui lòng bấm vào icon góc phải thanh địa chỉ duyệt web và chọn 'Luôn cho phép cửa sổ bật lên (Allow popups)'.";
    case "auth/popup-closed-by-user":
      return "Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.";
    case "auth/cancelled-popup-request":
      return "Yêu cầu đăng nhập trước đó đã bị hủy.";
    case "auth/user-disabled":
      return "Tài khoản này đã bị vô hiệu hóa bởi quản trị viên.";
    case "auth/invalid-email":
      return "Địa chỉ email không đúng định dạng.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không chính xác.";
    case "auth/email-already-in-use":
      return "Email này đã được đăng ký tài khoản trước đó.";
    case "auth/weak-password":
      return "Mật khẩu quá yếu (tối thiểu 6 ký tự).";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền Internet hoặc tạm tắt các tiện ích AdBlock.";
    default:
      if (err.message) {
        if (err.message.includes("operation-not-allowed")) {
          return "Google Sign-in chưa được BẬT trong Firebase Console > Authentication > Sign-in method.";
        }
        if (err.message.includes("unauthorized-domain")) {
          return "Tên miền chưa được cấp quyền trong Firebase Console > Authentication > Settings > Authorized Domains.";
        }
        return err.message;
      }
      return "Lỗi xác thực Firebase. Vui lòng thử lại sau.";
  }
}
