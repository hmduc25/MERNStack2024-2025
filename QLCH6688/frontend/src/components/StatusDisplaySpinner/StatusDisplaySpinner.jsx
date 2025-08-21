import React from 'react';
import { motion } from 'framer-motion';
import './StatusDisplaySpinner.css';

const StatusDisplaySpinner = ({ isLoading, error, loadingText = 'Đang tải dữ liệu...' }) => {
    if (isLoading) {
        return (
            <motion.div
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="loading-spinner"></div>
                <p>{loadingText}</p>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="error-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <p>Có lỗi xảy ra: {error}</p>
                <button onClick={() => window.location.reload()}>Thử lại</button>
            </motion.div>
        );
    }

    return null;
};

export default StatusDisplaySpinner;
