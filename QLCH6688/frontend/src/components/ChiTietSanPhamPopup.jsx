import { useContext, useState } from 'react';
import './ChiTietSanPhamPopup.css';
import { StoreContext } from '../context/StoreContext';
import { icons } from '../assets/products';

const DANG_NHAP = 'Đăng nhập';
const DANG_KY = 'Đăng ký';

const ChiTietSanPhamPopup = ({ setShowChiTietSanPham }) => {
    const { url, setToken } = useContext(StoreContext);

    const [currState, setCurrState] = useState(DANG_NHAP);
    const [data, setData] = useState({
        name: '',
        password: '',
    });

    const onChangeHandler = (event) => {
        // const name = event.target.name;
        // const value = event.target.value;
        // setData((data) => ({ ...data, [name]: value }));
    };

    const onLogin = async (event) => {
        event.preventDefault();
        // let newUrl = url;
        // if (currState === DANG_NHAP) {
        //     newUrl += 'api/user/login';
        // } else {
        //     newUrl += 'api/user/register';
        // }

        // const response = await axios.post(newUrl, data);

        // if (response.data.success) {
        //     setToken(response.data.token);
        //     localStorage.setItem('token', response.data.token);
        //     setShowLogin(false);
        // } else {
        //     console.log('response.data.message: ', response.data.message);
        //     alert('response.data.message: ', response.data.message);
        // }
    };

    // useEffect(() => {
    //     console.log('LoginPopup_data: ', data);
    // }, [data]);
    return (
        <div className="login-popup">
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    {/* <img onClick={() => setShowChiTietSanPham(false)} src={icons.cross_icon} alt="cross icon" /> */}
                    <img onClick={() => setShowChiTietSanPham(false)} src={icons.cross_icon} alt="cross icon" />
                </div>
                <div className="login-popup-inputs">
                    {currState === DANG_KY && (
                        <input
                            name="name"
                            type="text"
                            onChange={onChangeHandler}
                            value={data.name}
                            placeholder="Nhập tên đăng nhập"
                            required
                        />
                    )}
                    <input
                        name="password"
                        onChange={onChangeHandler}
                        value={data.password}
                        type="password"
                        placeholder="Nhập mật khẩu"
                        required
                    />
                </div>
                <button type="submit">{currState === DANG_KY ? 'Tạo tài khoản' : DANG_NHAP}</button>
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>Bằng việc tiếp tục, tôi đồng ý với Điều khoản sử dụng & Chính sách bảo mật.</p>
                </div>
                {currState === DANG_NHAP ? (
                    <p>
                        Tạo một tài khoản mới? <span onClick={() => setCurrState(DANG_KY)}>{DANG_KY} ngay</span>
                    </p>
                ) : (
                    <p>
                        Bạn đã có tài khoản? <span onClick={() => setCurrState(DANG_NHAP)}>{DANG_NHAP} ngay</span>
                    </p>
                )}
            </form>
        </div>
    );
};

export default ChiTietSanPhamPopup;
