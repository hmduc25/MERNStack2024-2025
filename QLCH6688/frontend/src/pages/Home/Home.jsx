import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    return (
        <div style={{ textAlign: 'center', minHeight: 800 }}>
            <p>Home</p>
            <hr />
            <h3>
                <Link to="/banhang">Bán hàng</Link>
            </h3>
            <hr />
            <h3>
                <Link to="/sanpham">Sản phẩm</Link>
            </h3>
            <hr />
        </div>
    );
};

export default Home;
