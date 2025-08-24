// File: invoicesData.js

export const invoicesData = [
    {
        _id: {
            $oid: '68a83a2d86261146c18ea09e',
        },
        invoiceCode: 'HD202508220001',
        invoiceDate: {
            $date: '2025-08-22T09:36:45.178Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 200000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 200000,
        },
        items: [
            {
                productId: {
                    $oid: '6795e18711581ca2b44ebe86',
                },
                productName: 'Nước rửa chén, bát POLAR BEAR (960ml)',
                quantity: 3,
                unitPrice: 42000,
                totalPrice: 126000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6795e18711581ca2b44ebe87',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 3,
                        _id: {
                            $oid: '68a83a2d86261146c18ea0a0',
                        },
                    },
                ],
                _id: {
                    $oid: '68a83a2d86261146c18ea09f',
                },
            },
            {
                productId: {
                    $oid: '675e62dcfd34b6d08c994af2',
                },
                productName: 'Cá hộp, Cá Ngừ Sốt Dầu VISSAN (170g)',
                quantity: 2,
                unitPrice: 37000,
                totalPrice: 74000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '675e62dcfd34b6d08c994af3',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 2,
                        _id: {
                            $oid: '68a83a2d86261146c18ea0a2',
                        },
                    },
                ],
                _id: {
                    $oid: '68a83a2d86261146c18ea0a1',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-22T09:36:45.226Z',
        },
        updatedAt: {
            $date: '2025-08-22T09:36:45.226Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a8a73f86261146c18ea4c3',
        },
        invoiceCode: 'HD202508230001',
        invoiceDate: {
            $date: '2025-08-22T17:22:07.459Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 250000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 250000,
        },
        items: [
            {
                productId: {
                    $oid: '6767e66a42196dd482ebdb14',
                },
                productName: 'Bánh Custas Kem Trứng Orion Hộp (282g - 12gói x 23,5g)',
                quantity: 5,
                unitPrice: 50000,
                totalPrice: 250000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6767e66a42196dd482ebdb15',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 5,
                        _id: {
                            $oid: '68a8a73f86261146c18ea4c5',
                        },
                    },
                ],
                _id: {
                    $oid: '68a8a73f86261146c18ea4c4',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-22T17:22:07.474Z',
        },
        updatedAt: {
            $date: '2025-08-22T17:22:07.474Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a8a77986261146c18ea4cf',
        },
        invoiceCode: 'HD202508230002',
        invoiceDate: {
            $date: '2025-08-22T17:23:05.816Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 54000,
        paymentDetails: {
            method: 'Chuyển khoản',
            soTienDaNhan: 60000,
        },
        items: [
            {
                productId: {
                    $oid: '6746cd5ac8891dc803c976db',
                },
                productName: 'Thuốc lá sài gòn đen (melon)',
                quantity: 1,
                unitPrice: 18000,
                totalPrice: 18000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6746cd5ac8891dc803c976dc',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 1,
                        _id: {
                            $oid: '68a8a77986261146c18ea4d1',
                        },
                    },
                ],
                _id: {
                    $oid: '68a8a77986261146c18ea4d0',
                },
            },
            {
                productId: {
                    $oid: '6746ec4dc8891dc803c978f4',
                },
                productName: 'Mì tôm kokomi 90, kokomi đại (90g)',
                quantity: 9,
                unitPrice: 4000,
                totalPrice: 36000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6765574884a715c428beba79',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 9,
                        _id: {
                            $oid: '68a8a77986261146c18ea4d3',
                        },
                    },
                ],
                _id: {
                    $oid: '68a8a77986261146c18ea4d2',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-22T17:23:05.841Z',
        },
        updatedAt: {
            $date: '2025-08-22T18:32:35.233Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a8b7ec2c53ade2804a8a4b',
        },
        invoiceCode: 'HD202508230003',
        invoiceDate: {
            $date: '2025-08-22T18:33:16.699Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 108000,
        paymentDetails: {
            method: 'Chuyển khoản',
            soTienDaNhan: 108000,
        },
        items: [
            {
                productId: {
                    $oid: '674432a2352db71e5139d9f3',
                },
                productName: 'Kẹo nhai wrigleys doublemint (80g)',
                quantity: 3,
                unitPrice: 36000,
                totalPrice: 108000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '674432a2352db71e5139d9f4',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 3,
                        _id: {
                            $oid: '68a8b7ec2c53ade2804a8a4d',
                        },
                    },
                ],
                _id: {
                    $oid: '68a8b7ec2c53ade2804a8a4c',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-22T18:33:16.756Z',
        },
        updatedAt: {
            $date: '2025-08-22T18:33:53.725Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a8b7f72c53ade2804a8a53',
        },
        invoiceCode: 'HD202508230004',
        invoiceDate: {
            $date: '2025-08-22T18:33:27.187Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 201000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 201000,
        },
        items: [
            {
                productId: {
                    $oid: '6766a9b5eccbdf3c0acb2991',
                },
                productName: 'Mì chính, bột ngọt AJINOMOTO gói (1kg)',
                quantity: 3,
                unitPrice: 67000,
                totalPrice: 201000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6766a9b5eccbdf3c0acb2992',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 3,
                        _id: {
                            $oid: '68a8b7f72c53ade2804a8a55',
                        },
                    },
                ],
                _id: {
                    $oid: '68a8b7f72c53ade2804a8a54',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-22T18:33:27.215Z',
        },
        updatedAt: {
            $date: '2025-08-22T18:33:59.355Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a8b8302c53ade2804a8be4',
        },
        invoiceCode: 'HD202508230005',
        invoiceDate: {
            $date: '2025-08-22T18:34:24.291Z',
        },
        status: 'pending',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 90000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 90000,
        },
        items: [
            {
                productId: {
                    $oid: '6746e8dac8891dc803c978aa',
                },
                productName: 'Mì tôm kokomi bé hương vị mì tôm chua cay (65g)',
                quantity: 30,
                unitPrice: 3000,
                totalPrice: 90000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6765571284a715c428beb950',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 30,
                        _id: {
                            $oid: '68a8b8302c53ade2804a8be6',
                        },
                    },
                ],
                _id: {
                    $oid: '68a8b8302c53ade2804a8be5',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-22T18:34:24.307Z',
        },
        updatedAt: {
            $date: '2025-08-22T18:34:24.307Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a8b8622c53ade2804a8d52',
        },
        invoiceCode: 'HD202508230006',
        invoiceDate: {
            $date: '2025-08-22T18:35:14.053Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 104000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 500000,
        },
        items: [
            {
                productId: {
                    $oid: '6746caafc8891dc803c976bc',
                },
                productName: 'Thuốc lá thăng long dẹp',
                quantity: 8,
                unitPrice: 13000,
                totalPrice: 104000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6746caafc8891dc803c976bd',
                        },
                        batchNumber: 'BATCH001',
                        soldQuantity: 8,
                        _id: {
                            $oid: '68a8b8622c53ade2804a8d54',
                        },
                    },
                ],
                _id: {
                    $oid: '68a8b8622c53ade2804a8d53',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-22T18:35:14.068Z',
        },
        updatedAt: {
            $date: '2025-08-22T18:35:59.250Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a9547d6dcf8d5e5f2b5d51',
        },
        invoiceCode: 'HD202508230007',
        invoiceDate: {
            $date: '2025-08-23T05:41:17.834Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 20000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 20000,
        },
        items: [
            {
                productId: {
                    $oid: '67445b42352db71e5139da81',
                },
                productName: 'Thuốc lá gold lion',
                quantity: 2,
                unitPrice: 10000,
                totalPrice: 20000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6747de7cc8891dc803c97da3',
                        },
                        batchNumber: 'BATCH002',
                        soldQuantity: 2,
                        _id: {
                            $oid: '68a9547d6dcf8d5e5f2b5d53',
                        },
                    },
                ],
                _id: {
                    $oid: '68a9547d6dcf8d5e5f2b5d52',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-23T05:41:17.875Z',
        },
        updatedAt: {
            $date: '2025-08-23T05:41:17.875Z',
        },
        __v: 0,
    },
    {
        _id: {
            $oid: '68a9547d6dcf8d5e5f2b5d51',
        },
        invoiceCode: 'HD202508230007',
        invoiceDate: {
            $date: '2025-08-23T05:41:17.834Z',
        },
        status: 'completed',
        customerName: 'Khách lẻ',
        cashier: {
            id: {
                $oid: '67462c8a77a41c1f4e5a9c0c',
            },
            name: 'Min',
        },
        totalAmount: 20000,
        paymentDetails: {
            method: 'Tiền mặt',
            soTienDaNhan: 20000,
        },
        items: [
            {
                productId: {
                    $oid: '67445b42352db71e5139da81',
                },
                productName: 'Thuốc lá gold lion',
                quantity: 2,
                unitPrice: 10000,
                totalPrice: 20000,
                batchInfo: [
                    {
                        batchId: {
                            $oid: '6747de7cc8891dc803c97da3',
                        },
                        batchNumber: 'BATCH002',
                        soldQuantity: 2,
                        _id: {
                            $oid: '68a9547d6dcf8d5e5f2b5d53',
                        },
                    },
                ],
                _id: {
                    $oid: '68a9547d6dcf8d5e5f2b5d52',
                },
            },
        ],
        discounts: 0,
        createdAt: {
            $date: '2025-08-23T05:41:17.875Z',
        },
        updatedAt: {
            $date: '2025-08-23T05:41:17.875Z',
        },
        __v: 0,
    },
];
