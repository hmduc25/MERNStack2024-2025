import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { MdPointOfSale, MdOutlineInventory, MdAttachMoney, MdReceipt, MdNoteAdd } from 'react-icons/md'; // 1. Thêm icons mới
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const homeClasses = classNames('home', {});

    // 2. Tạo hàm xử lý khi nhấp vào khối div
    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className={homeClasses}>
            <h1 className="home__title">Chào Mừng Đến Với Ứng Dụng Quản Lý Bán Hàng</h1>
            <p className="home__subtitle">Lựa chọn một chức năng dưới đây:</p>
            <hr className="home__divider" />

            <div className="home__links-container">
                {/* 3. Sử dụng div có thể nhấp được thay vì Link */}
                <div className="home__link-item" onClick={() => handleNavigate('/banhang')}>
                    <MdPointOfSale className="home__icon" />
                    <h3 className="home__link-heading">Bán hàng</h3>
                </div>

                <div className="home__link-item" onClick={() => handleNavigate('/sanpham')}>
                    <MdOutlineInventory className="home__icon" />
                    <h3 className="home__link-heading">Hàng hóa</h3>
                </div>

                {/* 4. Thêm các khối chức năng mới */}
                <div className="home__link-item" onClick={() => handleNavigate('/tonkho')}>
                    <MdOutlineInventory className="home__icon" />
                    <h3 className="home__link-heading">Tồn kho</h3>
                </div>

                <div className="home__link-item" onClick={() => handleNavigate('/sanpham/ghichu')}>
                    <MdNoteAdd className="home__icon" />
                    <h3 className="home__link-heading">Ghi chú</h3>
                </div>

                <div className="home__link-item" onClick={() => handleNavigate('/doanhthu')}>
                    <MdAttachMoney className="home__icon" />
                    <h3 className="home__link-heading">Doanh thu</h3>
                </div>

                <div className="home__link-item" onClick={() => handleNavigate('/tracuuhoadon')}>
                    <MdReceipt className="home__icon" />
                    <h3 className="home__link-heading">Hóa đơn</h3>
                </div>
            </div>
        </div>
    );
};

export default Home;
