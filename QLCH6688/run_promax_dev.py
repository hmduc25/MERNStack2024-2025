#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script khởi động môi trường phát triển (dev) cho MERN Stack.
Mô tả:
- Kiểm tra và khởi động Backend và Frontend.
- Tích hợp ghi log chi tiết vào file.
- Hỗ trợ tiếng Việt và các biểu tượng sinh động.
- Ngăn chặn việc chạy nhiều phiên bản cùng lúc.
"""

import os
import subprocess
import psutil
import sys
import time
from filelock import FileLock
from colorama import init, Fore, Style
import logging
from pathlib import Path

# Khởi tạo colorama để sử dụng màu trên terminal
init(autoreset=True)

# Cấu hình logging
LOG_FILE = Path('run_app_for_dev.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

# Định nghĩa các đường dẫn và lệnh
DUONG_DAN_SCRIPT = Path(os.path.dirname(os.path.abspath(sys.executable if getattr(sys, 'frozen', False) else __file__)))
THU_MUC_BACKEND = DUONG_DAN_SCRIPT / "backend"
THU_MUC_FRONTEND = DUONG_DAN_SCRIPT / "frontend"
FILE_LOCK = DUONG_DAN_SCRIPT / "app.lock"

LENH_SERVER = "npm run server"
LENH_DEV = "npm run dev"

# Xác định các tiến trình cần kiểm tra
PROCESS_NAMES = ['node', 'npm']
KEYWORD_BACKEND = "npm run server"
KEYWORD_FRONTEND = "npm run dev"

def clear_screen():
    """Xóa màn hình terminal."""
    os.system('cls' if os.name == 'nt' else 'clear')

def show_loading(message, duration=3):
    """Hiệu ứng loading đơn giản."""
    for i in range(duration * 10):
        sys.stdout.write(f"\r{message}" + "." * (i % 4) + "    ")
        sys.stdout.flush()
        time.sleep(0.1)
    print("\n")

def kiem_tra_tien_trinh_dang_chay():
    """
    Kiểm tra các tiến trình backend và frontend đang chạy.
    Trả về một tuple chứa (list_pids_backend, list_pids_frontend).
    """
    pids_backend = []
    pids_frontend = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = " ".join(proc.cmdline())
            if KEYWORD_BACKEND in cmdline:
                pids_backend.append(proc.pid)
            if KEYWORD_FRONTEND in cmdline:
                pids_frontend.append(proc.pid)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return pids_backend, pids_frontend

def ket_thuc_tien_trinh(pid):
    """Kết thúc một tiến trình dựa trên PID."""
    try:
        p = psutil.Process(pid)
        p.terminate()
        logging.info(f"Đã kết thúc tiến trình PID {pid}.")
    except psutil.NoSuchProcess:
        logging.warning(f"Tiến trình PID {pid} không tồn tại.")
    except psutil.AccessDenied:
        logging.error(f"Không có quyền kết thúc tiến trình PID {pid}.")
        print(f"{Fore.RED}❌ Lỗi: Không có quyền kết thúc tiến trình PID {pid}.")

def khoi_dong_he_thong():
    """Khởi động Backend và Frontend trong các cửa sổ terminal mới."""
    print(f"{Fore.YELLOW}💡 Hệ thống chưa khởi động. Đang tiến hành khởi động...")
    logging.info("Bắt đầu khởi động hệ thống...")

    # Khởi động Backend
    try:
        subprocess.Popen(
            f'start cmd /k "cd /d "{THU_MUC_BACKEND}" && {LENH_SERVER}"',
            shell=True
        )
        print(f"{Fore.GREEN}✅ Đã khởi động Backend.")
        logging.info("Đã khởi động Backend thành công.")
    except Exception as e:
        print(f"{Fore.RED}❌ Lỗi khi khởi động Backend: {e}")
        logging.error(f"Lỗi khi khởi động Backend: {e}")

    # Khởi động Frontend
    try:
        subprocess.Popen(
            f'start cmd /k "cd /d "{THU_MUC_FRONTEND}" && {LENH_DEV}"',
            shell=True
        )
        print(f"{Fore.GREEN}✅ Đã khởi động Frontend.")
        logging.info("Đã khởi động Frontend thành công.")
    except Exception as e:
        print(f"{Fore.RED}❌ Lỗi khi khởi động Frontend: {e}")
        logging.error(f"Lỗi khi khởi động Frontend: {e}")


def hien_thi_menu_va_xu_ly():
    """Hiển thị menu và xử lý lựa chọn của người dùng."""
    while True:
        print(f"\n{Fore.CYAN}--- MENU LỰA CHỌN ---")
        print(f"{Fore.YELLOW}1. ⛔️ Dừng toàn bộ hệ thống (Backend và Frontend)")
        print(f"{Fore.YELLOW}2. 🚪 Thoát chương trình hiện tại (ĐỂ HỆ THỐNG VẪN CHẠY)")

        lua_chon = input(f"{Fore.WHITE}👉 Nhập lựa chọn của bạn (1 hoặc 2): ").strip()

        if lua_chon == '1':
            logging.info("Người dùng chọn dừng toàn bộ hệ thống.")
            print(f"{Fore.RED}⛔️ Đang dừng toàn bộ hệ thống...")
            pids_backend, pids_frontend = kiem_tra_tien_trinh_dang_chay()
            
            pids_can_ket_thuc = pids_backend + pids_frontend
            if not pids_can_ket_thuc:
                print(f"{Fore.YELLOW}⚠️ Không tìm thấy tiến trình nào để dừng.")
                logging.warning("Không có tiến trình nào để dừng.")
            else:
                for pid in pids_can_ket_thuc:
                    ket_thuc_tien_trinh(pid)
            
            print(f"{Fore.GREEN}✅ Đã dừng hệ thống thành công.")
            break
        elif lua_chon == '2':
            logging.info("Người dùng chọn thoát script.")
            print(f"{Fore.WHITE}🚪 Thoát chương trình. Các tiến trình hệ thống vẫn hoat động bình thường.")
            break
        else:
            print(f"{Fore.RED}❌ Lựa chọn không hợp lệ. Vui lòng nhập lại.")

def main():
    """Hàm chính để thực thi các tác vụ."""
    clear_screen()
    print(f"{Fore.MAGENTA}{Style.BRIGHT}🚀 Kiểm tra trạng thái hệ thống MERN Stack...")
    logging.info("Bắt đầu kiểm tra trạng thái hệ thống.")

    # Kiểm tra sự tồn tại của các thư mục dự án
    if not THU_MUC_BACKEND.exists() or not THU_MUC_FRONTEND.exists():
        logging.error("Không tìm thấy thư mục 'backend' hoặc 'frontend'.")
        print(f"{Fore.RED}{Style.BRIGHT}❌ Lỗi: Không tìm thấy thư mục 'backend' hoặc 'frontend'.")
        print(f"{Fore.YELLOW}💡 Vui lòng đặt file executable vào thư mục gốc của dự án (ngang hàng với 'backend' và 'frontend').")
        input("Nhấn Enter để thoát...")
        sys.exit(1)

    lock = FileLock(FILE_LOCK)
    
    try:
        with lock.acquire(timeout=0):
            logging.info("Khóa file được lấy thành công. Không có phiên bản nào đang chạy.")
            print(f"{Fore.GREEN}✅ Không tìm thấy phiên bản script nào đang chạy.")
            
            pids_backend, pids_frontend = kiem_tra_tien_trinh_dang_chay()

            if not pids_backend and not pids_frontend:
                khoi_dong_he_thong()
                show_loading(f"{Fore.CYAN}⏰ Đang chờ hệ thống khởi động", duration=5)
                print(f"{Fore.GREEN}{Style.BRIGHT}✅ HỆ THỐNG ĐÃ ĐƯỢC KHỞI ĐỘNG THÀNH CÔNG! TRUY CẬP NGAY (http://localhost:5173/)")
                logging.info("Hệ thống đã được khởi động thành công.")
                hien_thi_menu_va_xu_ly()
            else:
                logging.info("Phát hiện hệ thống đã khởi động.")
                print(f"{Fore.YELLOW}⚠️ Hệ thống đã khởi động từ trước. Các tiến trình đang chạy: {len(pids_backend)} Backend, {len(pids_frontend)} Frontend.")
                hien_thi_menu_va_xu_ly()

    except TimeoutError:
        logging.warning("Phát hiện một phiên bản script đã được khởi động. Khóa file không lấy được.")
        print(f"{Fore.RED}{Style.BRIGHT}❌ Lỗi: Một phiên bản của script đã được khởi động. Vui lòng đóng phiên bản cũ để tiếp tục.")
        input("Nhấn Enter để thoát...")
        sys.exit(1)
    except Exception as e:
        logging.error(f"Lỗi không mong muốn: {e}", exc_info=True)
        print(f"{Fore.RED}❌ Lỗi không mong muốn: {e}")
        input("Nhấn Enter để thoát...")
        sys.exit(1)

if __name__ == "__main__":
    main()
