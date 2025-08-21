// src/hooks/useDebounce.js
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for debouncing a value.
 * @param {*} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {*} The debounced value.
 */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const handler = useRef(); // Sử dụng useRef để lưu timer

    useEffect(() => {
        // Xóa timer cũ nếu có để reset thời gian chờ
        if (handler.current) {
            clearTimeout(handler.current);
        }

        // Thiết lập timer mới và lưu vào useRef
        handler.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function: Hàm này sẽ chạy khi component unmount
        // hoặc khi dependencies (value, delay) thay đổi.
        return () => {
            clearTimeout(handler.current);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
