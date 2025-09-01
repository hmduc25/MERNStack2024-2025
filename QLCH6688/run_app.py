import os
import subprocess
import psutil
import sys
import time
from filelock import FileLock
from colorama import init, Fore, Style

# Khoi tao colorama de ho tro mau sac tren Windows
init(autoreset=True)

# Dinh nghia cac duong dan va lenh
# Su dung duong dan tuong doi de tranh loi khi di chuyen file
# PyInstaller se dong goi script vao file exe, vi the os.getcwd() se tra ve thu muc chua file exe
THU_MUC_DU_AN = os.path.dirname(os.path.abspath(sys.executable if getattr(sys, 'frozen', False) else __file__))
THU_MUC_BACKEND = os.path.join(THU_MUC_DU_AN, "backend")
THU_MUC_FRONTEND = os.path.join(THU_MUC_DU_AN, "frontend")
FILE_LOCK = os.path.join(THU_MUC_DU_AN, "app.lock")

# Kiem tra su ton tai cua cac thu muc
if not os.path.exists(THU_MUC_BACKEND) or not os.path.exists(THU_MUC_FRONTEND):
    print(f"{Fore.RED}{Style.BRIGHT}Loi: Khong tim thay thu muc 'backend' hoac 'frontend'.")
    print(f"{Fore.YELLOW}Vui long dat file executable vao thu muc goc cua du an (ngang hang voi 'backend' va 'frontend').")
    input("Nhan Enter de thoat...")
    sys.exit(1)

LENH_SERVER = "npm run server"
LENH_DEV = "npm run dev"

# Dinh danh cac tien trinh theo ten lenh
PROCESS_NAMES = {
    'node': ['npm', 'server', 'vite'],
}

def clear_screen():
    """Xoa man hinh terminal."""
    os.system('cls' if os.name == 'nt' else 'clear')

def show_loading(message, duration=3):
    """Hieu ung loading don gian."""
    for i in range(duration * 10):
        sys.stdout.write(f"\r{message}" + "." * (i % 4) + "   ")
        sys.stdout.flush()
        time.sleep(0.1)
    print("\n")

def kiem_tra_tien_trinh_dang_chay(process_name_keywords):
    """
    Kiem tra xem co tien trinh nao chua tu khoa trong ten khong.
    Tra ve danh sach cac PID cua cac tien trinh tim thay.
    """
    pids = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = proc.cmdline()
            for keyword in process_name_keywords:
                if any(keyword in arg for arg in cmdline):
                    pids.append(proc.pid)
                    break
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return list(set(pids))

def ket_thuc_tien_trinh(pid):
    """Ket thuc mot tien trinh bang PID."""
    try:
        p = psutil.Process(pid)
        p.terminate()
        print(f"{Fore.RED}Da ket thuc tien trinh PID {pid}.")
    except psutil.NoSuchProcess:
        print(f"{Fore.YELLOW}Tien trinh PID {pid} khong ton tai.")
    except psutil.AccessDenied:
        print(f"{Fore.RED}Khong co quyen ket thuc tien trinh PID {pid}.")

def khoi_dong_he_thong():
    """Khoi dong Backend va Frontend an cac terminal rieng biet."""
    print(f"{Fore.YELLOW}He thong chua khoi dong. Dang tien hanh khoi dong...")
    
    # Khoi dong Backend (an cua so terminal)
    subprocess.Popen(
        f'cd /d "{THU_MUC_BACKEND}" && {LENH_SERVER}',
        shell=True,
        creationflags=subprocess.CREATE_NO_WINDOW
    )
    print(f"{Fore.GREEN}Da khoi dong Backend.")
    
    # Khoi dong Frontend (an cua so terminal)
    subprocess.Popen(
        f'cd /d "{THU_MUC_FRONTEND}" && {LENH_DEV}',
        shell=True,
        creationflags=subprocess.CREATE_NO_WINDOW
    )
    print(f"{Fore.GREEN}Da khoi dong Frontend.")

def hien_thi_menu_va_xu_ly():
    """Hien thi menu va xu ly lua chon cua nguoi dung."""
    while True:
        print(f"\n{Fore.CYAN}--- MENU LUA CHON ---")
        print(f"{Fore.YELLOW}1. Dong toan bo he thong (Backend va Frontend)")
        print(f"{Fore.YELLOW}2. Thoat chuong trinh hien tai")
        
        lua_chon = input(f"{Fore.WHITE}Nhap lua chon cua ban (1 hoac 2): ").strip()

        if lua_chon == '1':
            print(f"{Fore.RED}Dang dong toan bo he thong...")
            pids_can_ket_thuc = kiem_tra_tien_trinh_dang_chay(list(PROCESS_NAMES.values())[0])
            if not pids_can_ket_thuc:
                print(f"{Fore.YELLOW}Khong tim thay tien trinh he thong de dong.")
            else:
                for pid in pids_can_ket_thuc:
                    ket_thuc_tien_trinh(pid)
            print(f"{Fore.GREEN}Da dong he thong.")
            break
        elif lua_chon == '2':
            print(f"{Fore.WHITE}Thoat chuong trinh. Cac tien trinh he thong van hoat dong binh thuong.")
            break
        else:
            print(f"{Fore.RED}Lua chon khong hop le. Vui long nhap lai.")

def main():
    """Ham chinh de thuc thi cac tac vu."""
    clear_screen()
    print(f"{Fore.MAGENTA}{Style.BRIGHT}Kiem tra trang thai he thong MERN Stack...")
    
    lock = FileLock(FILE_LOCK)
    
    try:
        with lock.acquire(timeout=0):
            print(f"{Fore.GREEN}Khong tim thay phien ban script nao dang chay.")
            
            pids_dang_chay = kiem_tra_tien_trinh_dang_chay(list(PROCESS_NAMES.values())[0])

            if not pids_dang_chay:
                khoi_dong_he_thong()
                show_loading(f"{Fore.CYAN}Dang cho he thong khoi dong", duration=5)
                print(f"{Fore.GREEN}{Style.BRIGHT}HE THONG DA DUOC KHOI DONG THANH CONG! TRUY CAP NGAY (http://localhost:5173/)")
                hien_thi_menu_va_xu_ly()
            else:
                print(f"{Fore.YELLOW}He thong da khoi dong tu truoc.")
                hien_thi_menu_va_xu_ly()

    except TimeoutError:
        print(f"{Fore.RED}{Style.BRIGHT}Mot phien ban cua script da duoc khoi dong. Vui long dong phien ban cu de tiep tuc.")
        input("Nhan Enter de thoat...")
        sys.exit(1)

if __name__ == "__main__":
    main()