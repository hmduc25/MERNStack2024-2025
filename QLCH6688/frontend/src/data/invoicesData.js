// File: invoicesData.js

export const invoicesData = [
    {
        _id: {
            $oid: '68a1ae99a65c82ac4190341b',
        },
        invoiceCode: 'HD202508170001',
        invoiceDate: {
            $date: '2025-08-17T10:27:37.924Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 131000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 131000,
        },
        items: [
            {
                productId: {
                    $oid: '6746d20bc8891dc803c97755',
                },
                productName: 'Thuốc lá con ngựa trắng',
                quantity: 3,
                unitPrice: 25000,
                totalPrice: 75000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6746d33bc8891dc803c9778d',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 3,
                        _id: {
                            $oid: '68a1ae99a65c82ac4190341d',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1ae99a65c82ac4190341c',
                },
            },
            {
                productId: {
                    $oid: '67470366c8891dc803c97b19',
                },
                productName: 'Mì tôm cung đình khoai tây hương vị sườn heo hầm măng (79g)',
                quantity: 7,
                unitPrice: 8000,
                totalPrice: 56000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '67470366c8891dc803c97b1a',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 7,
                        _id: {
                            $oid: '68a1ae99a65c82ac4190341f',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1ae99a65c82ac4190341e',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-17T10:27:37.962Z',
        },
        updatedAt: {
            $date: '2025-08-17T10:27:37.962Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a1b08697591e5b405f67ee',
        },
        invoiceCode: 'HD202508170002',
        invoiceDate: {
            $date: '2025-08-17T10:35:50.171Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 8000,
        paymentDetails: {
            method: 'Chuyển khoản',
            soTienDaNhan: 10000,
        },
        items: [
            {
                productId: {
                    $oid: '67470366c8891dc803c97b19',
                },
                productName: 'Mì tôm cung đình khoai tây hương vị sườn heo hầm măng (79g)',
                quantity: 1,
                unitPrice: 8000,
                totalPrice: 8000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '67470366c8891dc803c97b1a',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 1,
                        _id: {
                            $oid: '68a1b08697591e5b405f67f0',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1b08697591e5b405f67ef',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-17T10:35:50.219Z',
        },
        updatedAt: {
            $date: '2025-08-17T10:35:50.219Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a1b0f297591e5b405f67f6',
        },
        invoiceCode: 'HD202508170003',
        invoiceDate: {
            $date: '2025-08-17T10:37:38.607Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 75000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 75000,
        },
        items: [
            {
                productId: {
                    $oid: '6746d20bc8891dc803c97755',
                },
                productName: 'Thuốc lá con ngựa trắng',
                quantity: 3,
                unitPrice: 25000,
                totalPrice: 75000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6746d33bc8891dc803c9778d',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 3,
                        _id: {
                            $oid: '68a1b0f297591e5b405f67f8',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1b0f297591e5b405f67f7',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-17T10:37:38.658Z',
        },
        updatedAt: {
            $date: '2025-08-17T10:37:38.658Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a1b11997591e5b405f67fe',
        },
        invoiceCode: 'HD202508170004',
        invoiceDate: {
            $date: '2025-08-17T10:38:17.450Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 72000,
        paymentDetails: {
            method: 'Chuyển khoản',
            soTienDaNhan: 80000,
        },
        items: [
            {
                productId: {
                    $oid: '674c0d9fa5b2800db671994f',
                },
                productName: 'Mì Ly Modern Lẩu Thái Tôm Mì Ly, Mì Hộp (65g)',
                quantity: 8,
                unitPrice: 9000,
                totalPrice: 72000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '674c0d9fa5b2800db6719950',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 8,
                        _id: {
                            $oid: '68a1b11997591e5b405f6800',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1b11997591e5b405f67ff',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-17T10:38:17.485Z',
        },
        updatedAt: {
            $date: '2025-08-17T10:38:17.485Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a1b313e2cc54416a5cf9e9',
        },
        invoiceCode: 'HD202508170005',
        invoiceDate: {
            $date: '2025-08-17T10:46:43.953Z',
        },
        status: 'pending',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 180000,
        paymentDetails: {
            method: 'Chuyển khoản',
            soTienDaNhan: 300000,
        },
        items: [
            {
                productId: {
                    $oid: '674432a2352db71e5139d9f3',
                },
                productName: 'Kẹo nhai wrigleys doublemint (80g)',
                quantity: 5,
                unitPrice: 36000,
                totalPrice: 180000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '674432a2352db71e5139d9f4',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 5,
                        _id: {
                            $oid: '68a1b313e2cc54416a5cf9eb',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1b313e2cc54416a5cf9ea',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-17T10:46:44.042Z',
        },
        updatedAt: {
            $date: '2025-08-17T10:46:44.042Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a1d278e2cc54416a5cfc96',
        },
        invoiceCode: 'HD202508170006',
        invoiceDate: {
            $date: '2025-08-17T13:00:40.365Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 80000,
        paymentDetails: {
            method: 'Chuyển khoản',
            soTienDaNhan: 500000,
        },
        items: [
            {
                productId: {
                    $oid: '6747eb51c8891dc803c98307',
                },
                productName: 'Mì trộn cung đình Kool hương vị Spaghetti (105g)',
                quantity: 5,
                unitPrice: 8000,
                totalPrice: 40000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6747eb51c8891dc803c98308',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 5,
                        _id: {
                            $oid: '68a1d278e2cc54416a5cfc98',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1d278e2cc54416a5cfc97',
                },
            },
            {
                productId: {
                    $oid: '67470366c8891dc803c97b19',
                },
                productName: 'Mì tôm cung đình khoai tây hương vị sườn heo hầm măng (79g)',
                quantity: 5,
                unitPrice: 8000,
                totalPrice: 40000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '67470366c8891dc803c97b1a',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 5,
                        _id: {
                            $oid: '68a1d278e2cc54416a5cfc9a',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1d278e2cc54416a5cfc99',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-17T13:00:40.395Z',
        },
        updatedAt: {
            $date: '2025-08-17T13:00:40.395Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a1d3d7e2cc54416a5cfe0c',
        },
        invoiceCode: 'HD202508170007',
        invoiceDate: {
            $date: '2025-08-17T13:06:31.179Z',
        },
        status: 'pending',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 184000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 200000,
        },
        items: [
            {
                productId: {
                    $oid: '67810b507ce00548d23f1ffe',
                },
                productName: 'Lốc 4 Hộp Sữa YO Mocha Vị Cam Mộc Châu (110ml)',
                quantity: 10,
                unitPrice: 16000,
                totalPrice: 160000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '67810b507ce00548d23f1fff',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 10,
                        _id: {
                            $oid: '68a1d3d7e2cc54416a5cfe0e',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1d3d7e2cc54416a5cfe0d',
                },
            },
            {
                productId: {
                    $oid: '6747063ac8891dc803c97c03',
                },
                productName: 'Mì tôm cung đình khoai tây hương vị sườn hầm ngũ quả (80g)',
                quantity: 3,
                unitPrice: 8000,
                totalPrice: 24000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6747063ac8891dc803c97c04',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 3,
                        _id: {
                            $oid: '68a1d3d7e2cc54416a5cfe10',
                        },
                    },
                ],
                _id: {
                    $oid: '68a1d3d7e2cc54416a5cfe0f',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-17T13:06:31.229Z',
        },
        updatedAt: {
            $date: '2025-08-17T13:06:31.229Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a2157de2cc54416a5d0a19',
        },
        invoiceCode: 'HD202508180001',
        invoiceDate: {
            $date: '2025-08-17T17:46:37.464Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 430000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 580000,
        },
        items: [
            {
                productId: {
                    $oid: '6743de16352db71e5139d942',
                },
                productName: 'Thuốc lá vina bé',
                quantity: 11,
                unitPrice: 10000,
                totalPrice: 110000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6743de16352db71e5139d943',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 11,
                        _id: {
                            $oid: '68a2157de2cc54416a5d0a1b',
                        },
                    },
                ],
                _id: {
                    $oid: '68a2157de2cc54416a5d0a1a',
                },
            },
            {
                productId: {
                    $oid: '67442adf352db71e5139d9db',
                },
                productName: 'Thuốc lá sài gòn xanh',
                quantity: 4,
                unitPrice: 12000,
                totalPrice: 48000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6745a41eca3bf67212d52c7b',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 4,
                        _id: {
                            $oid: '68a2157de2cc54416a5d0a1d',
                        },
                    },
                ],
                _id: {
                    $oid: '68a2157de2cc54416a5d0a1c',
                },
            },
            {
                productId: {
                    $oid: '67445b42352db71e5139da81',
                },
                productName: 'Thuốc lá gold lion',
                quantity: 4,
                unitPrice: 10000,
                totalPrice: 40000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6747de7cc8891dc803c97da3',
                        },
                        batchNumber: 'BATCH002',
                        soldQuantity: 4,
                        _id: {
                            $oid: '68a2157de2cc54416a5d0a1f',
                        },
                    },
                ],
                _id: {
                    $oid: '68a2157de2cc54416a5d0a1e',
                },
            },
            {
                productId: {
                    $oid: '6744310c352db71e5139d9ee',
                },
                productName: 'Kẹo sing-gum doublemint (58,4g)',
                quantity: 6,
                unitPrice: 25000,
                totalPrice: 150000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6744310c352db71e5139d9ef',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 6,
                        _id: {
                            $oid: '68a2157de2cc54416a5d0a21',
                        },
                    },
                ],
                _id: {
                    $oid: '68a2157de2cc54416a5d0a20',
                },
            },
            {
                productId: {
                    $oid: '6746d06fc8891dc803c9771a',
                },
                productName: 'Thuốc lá Souvenir',
                quantity: 4,
                unitPrice: 8000,
                totalPrice: 32000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6746d0bcc8891dc803c9773f',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 4,
                        _id: {
                            $oid: '68a2157de2cc54416a5d0a23',
                        },
                    },
                ],
                _id: {
                    $oid: '68a2157de2cc54416a5d0a22',
                },
            },
            {
                productId: {
                    $oid: '6746e8dac8891dc803c978aa',
                },
                productName: 'Mì tôm kokomi bé hương vị mì tôm chua cay (65g)',
                quantity: 2,
                unitPrice: 3000,
                totalPrice: 6000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6765571284a715c428beb950',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 2,
                        _id: {
                            $oid: '68a2157de2cc54416a5d0a25',
                        },
                    },
                ],
                _id: {
                    $oid: '68a2157de2cc54416a5d0a24',
                },
            },
            {
                productId: {
                    $oid: '674700ebc8891dc803c97a90',
                },
                productName: 'Mì tôm hảo hảo xào hương vị tôm xào chua ngọt (75g)',
                quantity: 3,
                unitPrice: 4000,
                totalPrice: 12000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '674700ebc8891dc803c97a91',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 3,
                        _id: {
                            $oid: '68a2157de2cc54416a5d0a27',
                        },
                    },
                ],
                _id: {
                    $oid: '68a2157de2cc54416a5d0a26',
                },
            },
            {
                productId: {
                    $oid: '67480295c8891dc803c98dfd',
                },
                productName: 'Mỳ bò cay VIFON (105g)',
                quantity: 2,
                unitPrice: 12000,
                totalPrice: 24000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '67480295c8891dc803c98dfe',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 2,
                        _id: {
                            $oid: '68a2157de2cc54416a5d0a29',
                        },
                    },
                ],
                _id: {
                    $oid: '68a2157de2cc54416a5d0a28',
                },
            },
            {
                productId: {
                    $oid: '6747ed6dc8891dc803c984a4',
                },
                productName: 'Mì trộn cung đình Kool hương vị BBQ sườn nướng (99g)',
                quantity: 1,
                unitPrice: 8000,
                totalPrice: 8000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6747ed6dc8891dc803c984a5',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 1,
                        _id: {
                            $oid: '68a2157de2cc54416a5d0a2b',
                        },
                    },
                ],
                _id: {
                    $oid: '68a2157de2cc54416a5d0a2a',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-17T17:46:37.510Z',
        },
        updatedAt: {
            $date: '2025-08-17T17:46:37.510Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a21934e2cc54416a5d0a34',
        },
        invoiceCode: 'HD202508180002',
        invoiceDate: {
            $date: '2025-08-17T18:02:28.508Z',
        },
        status: 'pending',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 205000,
        paymentDetails: {
            method: 'Chuyển khoản',
            soTienDaNhan: 210000,
        },
        items: [
            {
                productId: {
                    $oid: '6743de16352db71e5139d942',
                },
                productName: 'Thuốc lá vina bé',
                quantity: 16,
                unitPrice: 10000,
                totalPrice: 160000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6743de16352db71e5139d943',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 16,
                        _id: {
                            $oid: '68a21934e2cc54416a5d0a36',
                        },
                    },
                ],
                _id: {
                    $oid: '68a21934e2cc54416a5d0a35',
                },
            },
            {
                productId: {
                    $oid: '676e9da1c10bfb1465f0a6ce',
                },
                productName: 'Kẹo Béo Cứng Alpenliebe Kẹo Hương Dâu Kem gói (115,5g)',
                quantity: 3,
                unitPrice: 15000,
                totalPrice: 45000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '676e9dc7c10bfb1465f0aa22',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 3,
                        _id: {
                            $oid: '68a21934e2cc54416a5d0a38',
                        },
                    },
                ],
                _id: {
                    $oid: '68a21934e2cc54416a5d0a37',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-17T18:02:28.533Z',
        },
        updatedAt: {
            $date: '2025-08-17T18:02:28.533Z',
        },
        __v: 0,
    },
];
