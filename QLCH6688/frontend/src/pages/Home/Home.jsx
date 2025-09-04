import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { MdPointOfSale, MdOutlineInventory, MdAttachMoney, MdReceipt, MdNoteAdd } from 'react-icons/md';
import './Home.css';
import { greetings } from './greetings';

const Home = () => {
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('');
    const [randomGreeting, setRandomGreeting] = useState('');

    useEffect(() => {
        const getGreetingByTime = () => {
            const currentHour = new Date().getHours();
            let greetingText;
            if (currentHour >= 5 && currentHour < 10) {
                greetingText = 'sáng';
            } else if (currentHour >= 10 && currentHour < 14) {
                greetingText = 'trưa';
            } else if (currentHour >= 14 && currentHour < 18) {
                greetingText = 'chiều';
            } else if (currentHour >= 18 && currentHour < 22) {
                greetingText = 'tối';
            } else {
                greetingText = 'đêm';
            }
            return `Xin chào buổi ${greetingText}!`;
        };

        const getRandomGreeting = () => {
            const randomIndex = Math.floor(Math.random() * greetings.length);
            return greetings[randomIndex];
        };

        setGreeting(getGreetingByTime());
        setRandomGreeting(getRandomGreeting());
    }, []);

    const homeClasses = classNames('home', {});

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className={homeClasses}>
            <h1 className="home__title">{greeting}</h1>
            <p className="home__subtitle">{randomGreeting}</p>
            <hr className="home__divider" />
            <div className="home__links-container">
                <div className="home__link-item" onClick={() => handleNavigate('/banhang')}>
                    <MdPointOfSale className="home__icon" />
                    <h3 className="home__link-heading">Bán hàng</h3>
                </div>
                <div className="home__link-item" onClick={() => handleNavigate('/sanpham')}>
                    <MdOutlineInventory className="home__icon" />
                    <h3 className="home__link-heading">Hàng hóa</h3>
                </div>
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
