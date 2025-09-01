import os
import subprocess
import psutil
from filelock import FileLock
import sys

# Dinh nghia cac duong dan va lenh
THU_MUC_DU_AN = r"E:\MyProjects\QLCH6688"
THU_MUC_BACKEND = os.path.join(THU_MUC_DU_AN, "backend")
THU_MUC_FRONTEND = os.path.join(THU_MUC_DU_AN, "frontend")
LENH_SERVER = "npm run server"
LENH_DEV = "npm run dev"
FILE_LOCK = os.path.join(THU_MUC_DU_AN, "app.lock")

# Dinh danh cac tien trinh theo ten lenh
PROCESS_NAMES = {
    'node': ['npm', 'server', 'vite'],
}

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
        p.terminate()  # co the dung p.kill() de ket thuc cuong buc hon
        print(f"Da ket thuc tien trinh PID {pid}.")
    except psutil.NoSuchProcess:
        print(f"Tien trinh PID {pid} khong ton tai.")
    except psutil.AccessDenied:
        print(f"Khong co quyen ket thuc tien trinh PID {pid}.")

def khoi_dong_he_thong():
    """Khoi dong Backend va Frontend trong cac terminal rieng biet."""
    print("He thong chua khoi dong. Dang tien hanh khoi dong...")
    
    # Khoi dong Backend
    subprocess.Popen(
        f'start cmd /k "cd /d "{THU_MUC_BACKEND}" && {LENH_SERVER}"',
        shell=True
    )
    print("Da khoi dong Backend.")
    
    # Khoi dong Frontend
    subprocess.Popen(
        f'start cmd /k "cd /d "{THU_MUC_FRONTEND}" && {LENH_DEV}"',
        shell=True
    )
    print("Da khoi dong Frontend.")

def hien_thi_menu_va_xu_ly():
    """Hien thi menu va xu ly lua chon cua nguoi dung."""
    while True:
        print("\n--- MENU LUA CHON ---")
        print("1. Dong toan bo he thong (Backend va Frontend)")
        print("2. Thoat chuong trinh hien tai (cac tien trinh khac van hoat dong)")
        
        lua_chon = input("Nhap lua chon cua ban (1 hoac 2): ").strip()

        if lua_chon == '1':
            print("Dang dong toan bo he thong...")
            pids_can_ket_thuc = kiem_tra_tien_trinh_dang_chay(list(PROCESS_NAMES.values())[0])
            if not pids_can_ket_thuc:
                print("Khong tim thay tien trinh he thong de dong.")
            else:
                for pid in pids_can_ket_thuc:
                    ket_thuc_tien_trinh(pid)
            print("Da dong he thong.")
            break
        elif lua_chon == '2':
            print("Thoat chuong trinh. Cac tien trinh he thong van hoat dong binh thuong.")
            break
        else:
            print("Lua chon khong hop le. Vui long nhap lai.")

def main():
    """Ham chinh de thuc thi cac tac vu."""
    lock = FileLock(FILE_LOCK)
    
    try:
        with lock.acquire(timeout=0):
            # Neu acquire thanh cong, tuc la chua co script nao chay
            print("Khong tim thay phien ban script nao dang chay.")
            pids_dang_chay = kiem_tra_tien_trinh_dang_chay(list(PROCESS_NAMES.values())[0])

            if not pids_dang_chay:
                khoi_dong_he_thong()
                # Doi de he thong khoi dong xong
                input("Nhan Enter de hien thi menu...")
                hien_thi_menu_va_xu_ly()
            else:
                print("He thong da khoi dong tu truoc.")
                hien_thi_menu_va_xu_ly()

    except TimeoutError:
        print("Mot phien ban cua script da duoc khoi dong. Vui long dong phien ban cu de tiep tuc.")
        # Thong bao va thoat, khong lam gi ca
        sys.exit(1)

if __name__ == "__main__":
    main()