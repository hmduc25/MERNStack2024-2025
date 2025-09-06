export const categoryTranslations = {
    dientu: 'Điện tử',
    thoitrang: 'Thời trang',
    giadung: 'Gia dụng',
    thucpham: 'Thực phẩm',
    mypham: 'Mỹ phẩm',
    thuocla: 'Thuốc lá',
    sua: 'Sữa',
    keocaosu: 'Kẹo cao su',
    nuocngot: 'Nước ngọt',
    thucphamanlien: 'Thực phẩm ăn liền',
    caphe: 'Cà phê',
    mitom: 'Mì tôm',
    pho: 'Phở',
    bun: 'Bún',
    chao: 'Cháo',
    mien: 'Miến',
    giavi: 'Gia vị',
    nuocmam: 'Nước mắm',
    thucphamdonghop: 'Thực phẩm đóng hộp',
    dauan: 'Dầu ăn',
    dodungnhabep: 'Đồ dùng nhà bếp',
    nguyenlieu: 'Nguyên liệu',
    banhkeo: 'Bánh, kẹo',
    thach: 'Thạch',
};

/**
 * Hàm dịch category key sang tên tiếng Việt
 * @param {string} key - Tên key category (ví dụ: 'keocaosu')
 * @returns {string} - Tên category đã dịch hoặc key ban đầu nếu không tìm thấy
 */
export const translateCategory = (key) => {
    // Trả về giá trị đã dịch nếu có, ngược lại trả về key ban đầu
    return categoryTranslations[key] || key;
};
