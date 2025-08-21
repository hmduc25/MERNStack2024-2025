/**
 * Tạo danh sách các mức tiền gợi ý để khách hàng thanh toán bằng tiền mặt.
 * @param {number} totalDue - Tổng số tiền khách hàng phải trả.
 * @returns {number[]} - Mảng các số tiền gợi ý.
 */
export const getPaymentSuggestions = (totalDue) => {
    if (totalDue <= 0) {
        return [];
    }

    const denominations = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
    const resultSuggestions = new Set();

    // Gợi ý đầu tiên là số tiền chính xác cần thanh toán
    resultSuggestions.add(totalDue);

    let foundCount = 0;

    // Lặp qua các mệnh giá để tìm 3 gợi ý lớn hơn
    for (const denom of denominations) {
        if (foundCount >= 3) break;

        // Tính toán gợi ý bằng cách làm tròn totalDue lên mệnh giá gần nhất
        const newSuggestion = Math.ceil(totalDue / denom) * denom;

        if (newSuggestion > totalDue && !resultSuggestions.has(newSuggestion) && newSuggestion <= 10000000) {
            resultSuggestions.add(newSuggestion);
            foundCount++;
        }
    }

    // Nếu vẫn không đủ 3 gợi ý, thêm các mệnh giá lớn hơn trực tiếp
    let lastDenominationIndex = denominations.findIndex((d) => d > totalDue);
    if (lastDenominationIndex === -1) {
        lastDenominationIndex = denominations.length;
    }

    while (resultSuggestions.size < 4 && lastDenominationIndex < denominations.length) {
        const nextDenom = denominations[lastDenominationIndex];
        if (!resultSuggestions.has(nextDenom) && nextDenom <= 10000000) {
            resultSuggestions.add(nextDenom);
        }
        lastDenominationIndex++;
    }

    return Array.from(resultSuggestions).sort((a, b) => a - b);
};
