import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { StoreContext } from '../../context/StoreContext';
// import userIcon from '../../assets/user_icon.png';

// Dữ liệu menu item tập trung, dễ quản lý
const menuItems = [
    { path: '/', name: 'Trang chủ' },
    { path: '/sanpham', name: 'Hàng hóa' },
    { path: '/tonkho', name: 'Tồn kho' },
    { path: '/doanhthu', name: 'Doanh thu' },
    { path: '/tracuuhoadon', name: 'Tra cứu hóa đơn' },
    { path: '/banhang', name: 'Bán hàng' },
];

const UserProfileDropdown = ({ logout, navigate }) => (
    <div className="navbar-profile">
        {/* <img src={userIcon} alt="Profile" className="profile-icon" /> */}
        <ul className="navbar-profile-dropdown">
            <li onClick={() => navigate('/myorders')}>Đơn hàng của tôi</li>
            <hr />
            <li onClick={logout}>Đăng xuất</li>
        </ul>
    </div>
);

const Navbar = () => {
    const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isLinkActive = (path) => {
        return location.pathname === path;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken('');
        navigate('/');
    };

    return (
        <div className="navbar">
            <Link to="/" className="logo-link"></Link>
            <ul className="navbar-menu">
                {menuItems.map((item) => (
                    <li key={item.path}>
                        <Link to={item.path} className={isLinkActive(item.path) ? 'active' : ''}>
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
            <div className="navbar-right">
                {/* <div className="navbar-search-icon">
                    <Link to="/gio-hang"></Link>
                    <div className={getTotalCartAmount() === 0 ? '' : 'dot'}></div>
                </div> */}

                {!token ? (
                    <button onClick={() => navigate('/login')}>Đăng nhập</button>
                ) : (
                    <UserProfileDropdown logout={logout} navigate={navigate} />
                )}
            </div>
        </div>
    );
};

export default Navbar;
