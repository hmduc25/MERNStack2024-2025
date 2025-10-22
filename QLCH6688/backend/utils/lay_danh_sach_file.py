import os
import csv
from datetime import datetime

# Lấy đường dẫn của thư mục hiện tại (nơi script đang chạy)
thu_muc_hien_tai = os.getcwd()

# Tạo tên file output TXT dựa trên thời gian hiện tại để tránh ghi đè
thoi_gian = datetime.now().strftime("%Y%m%d_%H%M%S")
ten_file_output = f"danh_sach_file_{thoi_gian}.txt"

# Mở file TXT để ghi dữ liệu
try:
    with open(ten_file_output, 'w', encoding='utf-8') as f:
        # Ghi tiêu đề
        f.write("--- Danh sách Tên File và Đuôi File trong thư mục hiện tại ---\n")
        f.write(f"Đường dẫn thư mục: {thu_muc_hien_tai}\n")
        f.write("-" * 50 + "\n")
        f.write(f"{'Tên File (Không đuôi)':<40} | {'Đuôi File':<10}\n")
        f.write("-" * 50 + "\n")

        # Lặp qua tất cả các mục trong thư mục hiện tại
        for ten_day_du in os.listdir(thu_muc_hien_tai):
            # Kiểm tra xem có phải là file không (bỏ qua thư mục)
            if os.path.isfile(os.path.join(thu_muc_hien_tai, ten_day_du)):
                
                # Tách tên file và đuôi file
                # os.path.splitext() trả về một tuple: (tên_file_không_đuôi, .đuôi_file)
                ten_file_khong_duoi, duoi_file_day_du = os.path.splitext(ten_day_du)
                
                # Xóa dấu chấm (.) ở đầu đuôi file nếu có
                duoi_file = duoi_file_day_du.lstrip('.')

                # In ra console (tùy chọn)
                print(f"File: {ten_file_khong_duoi:<38} | Đuôi: {duoi_file:<8}")

                # Ghi vào file TXT
                f.write(f"{ten_file_khong_duoi:<40} | {duoi_file:<10}\n")
            
        f.write("-" * 50 + "\n")
        print(f"\n✅ Đã hoàn thành! Kết quả được lưu vào file: {ten_file_output}")

except Exception as e:
    print(f"❌ Đã xảy ra lỗi: {e}")