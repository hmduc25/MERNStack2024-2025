import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home/Home';
import Sale from './pages/Sale/Sale';
import Inventory from './pages/Inventory/Inventory';
import Revenue from './pages/Revenue/Revenue';
import BillLookup from './pages/BillLookup/BillLookup';
import Products from './pages/Products/Products';
import AddProduct from './pages/AddProduct/AddProduct';
import Notes from './pages/Notes/Notes';
import Navbar from './components/Navbar/Navbar';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import ChiTietSanPhamPopup from './components/ChiTietSanPhamPopup';

const App = () => {
    // const [showLogin, setShowLogin] = useState(false);
    // const [showChiTietSanPham, setShowChiTietSanPham] = useState(true);

    return (
        <>
            {/* {showLogin && <LoginPopup setShowLogin={setShowLogin} />} */}
            {/* {showChiTietSanPham && <ChiTietSanPhamPopup setShowChiTietSanPham={setShowChiTietSanPham} />} */}
            <div className="app">
                {/* <Navbar setShowLogin={setShowLogin} /> */}
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/sanpham" element={<Products />} />
                    <Route path="/tonkho" element={<Inventory />} />
                    <Route path="/doanhthu" element={<Revenue />} />
                    <Route path="/tracuuhoadon" element={<BillLookup />} />
                    <Route path="/sanpham/themmoisanpham" element={<AddProduct />} />
                    <Route path="/sanpham/ghichu" element={<Notes />} />
                    <Route path="/sanpham/chitietsanpham/:id" element={<ProductDetail />} />
                    <Route path="/banhang" element={<Sale />} />
                </Routes>
            </div>
            {/* <Footer /> */}
        </>
    );
};

export default App;
