const {
    youzan_orders: YouzanOrders
} = require("../../models").customersModels;
const moment = require("moment");
const schedule = require('node-schedule');
const { getYouzanOrders, batchYouzanDecrypt } = require("../../services/youzanService");

async function getYouzanOrderList() {
    const result = await getYouzanOrders('2024-10-01 00:00:00', '2024-10-31 23:59:59');
    // console.log('1111111111111111111111111111111111', result.full_order_info_list[0]);
    const addressInfo = result.full_order_info_list[0].full_order_info.address_info;
    const buyer_info = result.full_order_info_list[0].full_order_info.buyer_info;
    const order_extra = result.full_order_info_list[0].full_order_info.order_info.order_extra;
    const order_tags = result.full_order_info_list[0].full_order_info.order_info.order_tags;
    const order = result.full_order_info_list[0].full_order_info.orders;
    const { delivery_address, receiver_name, receiver_tel } = addressInfo;
    const { buyer_phone, fans_nickname } = buyer_info;
    const sources = [delivery_address, receiver_name, receiver_tel, buyer_phone, fans_nickname];
    const decryptRes = await batchYouzanDecrypt(sources);
    // console.log('22222222222222222222222222222', decryptRes);
    // console.log('33333333333333333333333333333', order_extra);
    // console.log('44444444444444444444444444444', order_tags);
    for (let i = 0; i < order.length; i++) {
        console.log(`${i + 1} ===>>>>>>`, order[i]);
    }
    // console.log('55555555555555555555555555555', order);
}

async function syncYouzanOrders() {
    console.log('Begin Run syncYouzanOrders Schedule Job');
    try {
        const dateArr = [
            // ['2023-11-01 00:00:00', '2023-11-30 23:59:59'],
            // ['2023-12-01 00:00:00', '2023-12-31 23:59:59'],
            // ['2024-01-01 00:00:00', '2024-01-31 23:59:59'],
            // ['2024-02-01 00:00:00', '2024-02-29 23:59:59'],
            // ['2024-03-01 00:00:00', '2024-03-31 23:59:59'],
            // ['2024-04-01 00:00:00', '2024-04-30 23:59:59'],
            // ['2024-05-01 00:00:00', '2024-05-31 23:59:59'],
            // ['2024-06-01 00:00:00', '2024-06-30 23:59:59'],
            // ['2024-07-01 00:00:00', '2024-07-31 23:59:59'],
            // ['2024-08-01 00:00:00', '2024-08-31 23:59:59'],
            // ['2024-09-01 00:00:00', '2024-09-30 23:59:59'],
            // ['2024-10-01 00:00:00', '2024-10-31 23:59:59'],
            ['2024-11-07 12:00:00', '2024-11-08 11:59:59'],
        ];
        const dataList = [];
        for (let i = 0; i < dateArr.length; i++) {
            const startTime = dateArr[i][0];
            const endTime = dateArr[i][1];
            const result = await getYouzanOrders(startTime, endTime);
            const pages = Math.ceil((result?.total_results ?? 0) / 100);
            let pageno = 1;
            let orderInfoList = [];
            for (let attempt = 0; attempt < pages; attempt++) {
                try {
                    const result = await getYouzanOrders(startTime, endTime, pageno);
                    const fullOrderInfoList = result?.full_order_info_list ?? [];
                    if (fullOrderInfoList.length > 0) {
                        orderInfoList = orderInfoList.concat(fullOrderInfoList);
                        pageno++;
                    } else {
                        break;
                    }
                } catch (error) {
                    console.error(`Error fetching orders for page ${pageno}:`, error);
                    break;
                }
            }
            if (!orderInfoList.length) {
                continue;
            }
            for (let j = 0; j < orderInfoList.length; j++) {
                const orders = orderInfoList[j]?.full_order_info?.orders ?? [];
                if (!orders.length) {
                    continue;
                }
                const remarkInfo = orderInfoList[j]?.full_order_info?.remark_info ?? {};
                const addressInfo = orderInfoList[j]?.full_order_info?.address_info ?? {};
                const buyerInfo = orderInfoList[j]?.full_order_info?.buyer_info ?? {};
                const sourceInfo = orderInfoList[j]?.full_order_info?.source_info ?? {};
                const orderInfo = orderInfoList[j]?.full_order_info?.order_info ?? {};
                // 需要解密的一些字段
                const receiverData = {
                    receiver_name: addressInfo?.receiver_name ?? '',
                    receiver_tel: addressInfo?.receiver_tel ?? '',
                    self_fetch_info: addressInfo?.self_fetch_info ?? '',
                    delivery_address: addressInfo?.delivery_address ?? ''
                };
                const buyerData = {
                    fans_nickname: buyerInfo?.fans_nickname ?? '',
                    buyer_phone: buyerInfo?.buyer_phone ?? '',
                    buyer_name: orderInfo?.order_extra?.buyer_name ?? ''
                };
                const allData = { ...receiverData, ...buyerData };
                const sources = Object.values(allData).filter(value => value !== '');
                const decryptRes = await batchYouzanDecrypt(sources);
                for (let k = 0; k < orders.length; k++) {
                    dataList.push({
                        order_number: orderInfo?.tid ?? '',
                        order_status: orderInfo?.status ?? '',
                        order_creation_time: orderInfo?.created ?? '',
                        pay_time: orderInfo?.pay_time ?? '',
                        receiver_name: decryptRes[addressInfo?.receiver_name ?? ''] ?? '', //解密
                        receiver_tel: decryptRes[addressInfo?.receiver_tel ?? ''] ?? '', //解密
                        self_fetch_info: decryptRes[addressInfo?.self_fetch_info ?? ''] ?? '', //解密
                        delivery_province: addressInfo?.delivery_province ?? '',
                        delivery_city: addressInfo?.delivery_city ?? '',
                        delivery_district: addressInfo?.delivery_district ?? '',
                        delivery_postal_code: addressInfo?.delivery_postal_code ?? '',
                        delivery_address: decryptRes[addressInfo?.delivery_address ?? ''] ?? '', //解密
                        outer_sku_id: orders[k]?.outer_sku_id ?? '',
                        item_type: orders[k]?.item_type ?? '',
                        num: orders[k]?.num ?? '',
                        sku_no: orders[k]?.sku_no ?? '',
                        goods_id: '',
                        title: orders[k]?.title ?? '',
                        t_cate_name: '',
                        t_cate_id: '',
                        s_cate_name: '',
                        s_cate_id: '',
                        f_cate_name: '',
                        f_cate_id: '',
                        brand: '',
                        goods_extra: orders[k]?.goods_extra ?? '',
                        is_refund: orderInfo?.order_tags?.is_refund ? 1 : 0,
                        is_points_order: orderInfo?.order_extra?.is_points_order ? 1 : 0,
                        buyer_name: decryptRes[orderInfo?.order_extra?.buyer_name ?? ''] ?? '', //解密
                        expired_time: orderInfo?.expired_time ?? '',
                        refund_state: orderInfo?.refund_state ?? '',
                        shop_display_no: orderInfo?.shop_display_no ?? '',
                        node_kdt_id: orderInfo?.node_kdt_id ?? '',
                        success_time: orderInfo?.success_time ?? '',
                        status_str: orderInfo?.status_str ?? '',
                        update_time: orderInfo?.update_time ?? '',
                        root_kdt_id: orderInfo?.root_kdt_id ?? '',
                        express_type: orderInfo?.express_type ?? '',
                        order_type: orderInfo?.type ?? '',
                        shop_name: orderInfo?.shop_name ?? '',
                        store_id: '',
                        book_key: sourceInfo?.book_key ?? '',
                        buyer_message: remarkInfo?.buyer_message ?? '',
                        yz_open_id: buyerInfo?.yz_open_id ?? '',
                        fans_nickname: decryptRes[buyerInfo?.fans_nickname ?? ''] ?? '', //解密
                        buyer_phone: decryptRes[buyerInfo?.buyer_phone ?? ''] ?? '', //解密
                        outer_user_id: buyerInfo?.outer_user_id ?? '',
                        user_ids: ''
                    });
                }
            }
            await YouzanOrders.bulkCreate(dataList);
        }
    } catch (error) {
        console.log('syncYouzanOrders Error ===>>>', error);
    }
    console.log('End Run syncYouzanOrders Schedule Job');
}

// 每6个小时同步一次有赞订单（0点，6点，12点，18点）
async function syncYouzanOrdersEverySixHours() {
    console.log('Begin Run syncYouzanOrdersEverySixHours Schedule Job');
    try {
        // const startTime = moment().subtract(6, 'hours').format("YYYY-MM-DD HH:mm:ss"); // 6个小时前的日期
        // const endTime = moment().subtract(1, 'seconds').format("YYYY-MM-DD HH:mm:ss"); // 1秒前的日期
        // 2024-11-13 06:00:00 ~ 2024-11-13 17:59:59 订单数据缺失，待补充
        const startTime = '2024-11-13 06:00:00';
        const endTime = '2024-11-13 17:59:59';
        console.log('sixHoursAgo ===>>>', startTime);
        console.log('oneSecondsAgo ===>>>', endTime);
        const dataList = [];
        const result = await getYouzanOrders(startTime, endTime);
        const pages = Math.ceil((result?.total_results ?? 0) / 100);
        let pageno = 1;
        let orderInfoList = [];
        for (let attempt = 0; attempt < pages; attempt++) {
            try {
                const result = await getYouzanOrders(startTime, endTime, pageno);
                const fullOrderInfoList = result?.full_order_info_list ?? [];
                if (fullOrderInfoList.length > 0) {
                    orderInfoList = orderInfoList.concat(fullOrderInfoList);
                    pageno++;
                } else {
                    break;
                }
            } catch (error) {
                console.error(`Error fetching orders for page ${pageno}:`, error);
                break;
            }
        }
        if (!orderInfoList.length) {
            return;
        }
        for (let j = 0; j < orderInfoList.length; j++) {
            const orders = orderInfoList[j]?.full_order_info?.orders ?? [];
            if (!orders.length) {
                continue;
            }
            const remarkInfo = orderInfoList[j]?.full_order_info?.remark_info ?? {};
            const addressInfo = orderInfoList[j]?.full_order_info?.address_info ?? {};
            const buyerInfo = orderInfoList[j]?.full_order_info?.buyer_info ?? {};
            const sourceInfo = orderInfoList[j]?.full_order_info?.source_info ?? {};
            const orderInfo = orderInfoList[j]?.full_order_info?.order_info ?? {};
            // 需要解密的一些字段
            const receiverData = {
                receiver_name: addressInfo?.receiver_name ?? '',
                receiver_tel: addressInfo?.receiver_tel ?? '',
                self_fetch_info: addressInfo?.self_fetch_info ?? '',
                delivery_address: addressInfo?.delivery_address ?? ''
            };
            const buyerData = {
                fans_nickname: buyerInfo?.fans_nickname ?? '',
                buyer_phone: buyerInfo?.buyer_phone ?? '',
                buyer_name: orderInfo?.order_extra?.buyer_name ?? ''
            };
            const allData = { ...receiverData, ...buyerData };
            const sources = Object.values(allData).filter(value => value !== '');
            const decryptRes = await batchYouzanDecrypt(sources);
            for (let k = 0; k < orders.length; k++) {
                dataList.push({
                    order_number: orderInfo?.tid ?? '',
                    order_status: orderInfo?.status ?? '',
                    order_creation_time: orderInfo?.created ?? '',
                    pay_time: orderInfo?.pay_time ?? '',
                    receiver_name: decryptRes[addressInfo?.receiver_name ?? ''] ?? '', //解密
                    receiver_tel: decryptRes[addressInfo?.receiver_tel ?? ''] ?? '', //解密
                    self_fetch_info: decryptRes[addressInfo?.self_fetch_info ?? ''] ?? '', //解密
                    delivery_province: addressInfo?.delivery_province ?? '',
                    delivery_city: addressInfo?.delivery_city ?? '',
                    delivery_district: addressInfo?.delivery_district ?? '',
                    delivery_postal_code: addressInfo?.delivery_postal_code ?? '',
                    delivery_address: decryptRes[addressInfo?.delivery_address ?? ''] ?? '', //解密
                    outer_sku_id: orders[k]?.outer_sku_id ?? '',
                    item_type: orders[k]?.item_type ?? '',
                    num: orders[k]?.num ?? '',
                    sku_no: orders[k]?.sku_no ?? '',
                    goods_id: '',
                    title: orders[k]?.title ?? '',
                    t_cate_name: '',
                    t_cate_id: '',
                    s_cate_name: '',
                    s_cate_id: '',
                    f_cate_name: '',
                    f_cate_id: '',
                    brand: '',
                    goods_extra: orders[k]?.goods_extra ?? '',
                    is_refund: orderInfo?.order_tags?.is_refund ? 1 : 0,
                    is_points_order: orderInfo?.order_extra?.is_points_order ? 1 : 0,
                    buyer_name: decryptRes[orderInfo?.order_extra?.buyer_name ?? ''] ?? '', //解密
                    expired_time: orderInfo?.expired_time ?? '',
                    refund_state: orderInfo?.refund_state ?? '',
                    shop_display_no: orderInfo?.shop_display_no ?? '',
                    node_kdt_id: orderInfo?.node_kdt_id ?? '',
                    success_time: orderInfo?.success_time ?? '',
                    status_str: orderInfo?.status_str ?? '',
                    update_time: orderInfo?.update_time ?? '',
                    root_kdt_id: orderInfo?.root_kdt_id ?? '',
                    express_type: orderInfo?.express_type ?? '',
                    order_type: orderInfo?.type ?? '',
                    shop_name: orderInfo?.shop_name ?? '',
                    store_id: '',
                    book_key: sourceInfo?.book_key ?? '',
                    buyer_message: remarkInfo?.buyer_message ?? '',
                    yz_open_id: buyerInfo?.yz_open_id ?? '',
                    fans_nickname: decryptRes[buyerInfo?.fans_nickname ?? ''] ?? '', //解密
                    buyer_phone: decryptRes[buyerInfo?.buyer_phone ?? ''] ?? '', //解密
                    outer_user_id: buyerInfo?.outer_user_id ?? '',
                    user_ids: ''
                });
            }
        }
        await YouzanOrders.bulkCreate(dataList);
    } catch (error) {
        console.log('syncYouzanOrdersEverySixHours Error ===>>>', error);
    }
    console.log('End Run syncYouzanOrdersEverySixHours Schedule Job');
}

// module.exports = () => {
//     // 每6小时同步一次有赞订单
//     const time = "0 */6 * * *";
//     schedule.scheduleJob(time, function (fireDate) {
//         console.log('syncYouzanOrdersEverySixHours was supposed to run at ' + fireDate + ', but actually ran at ' + moment().format('YYYY-MM-DD HH:mm:ss'));
//         syncYouzanOrdersEverySixHours();
//     });
// }

module.exports = () => {
    syncYouzanOrdersEverySixHours();
}
