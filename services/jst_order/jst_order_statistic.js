const {
    sequelize_shop_tk,
    JstOrder
} = require("../../models");
const { QueryTypes } = require("sequelize");
const moment = require('moment');

async function addMtPhone() {
    let sql = `
        SELECT 
            id, buyer_message, mt_phone 
        FROM 
            jst_order 
        WHERE 
            pay_date IS NOT NULL AND pay_date != '' 
            AND 
            (mt_phone IS NULL OR mt_phone = '') 
            AND 
            (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%')
    `;
    const orders = await sequelize_shop_tk.query(sql, {
        type: QueryTypes.SELECT
    });
    const { default: pLimit } = await import("p-limit");
    const limit = pLimit(50);
    const promises = orders?.map(order =>
        limit(async () => {
            const mtPhone = extractMtPhoneNumber(order.buyer_message);
            if (mtPhone) {
                await JstOrder.update(
                    {
                        mt_phone: mtPhone,
                    },
                    {
                        where: {
                            id: order.id
                        }
                    }
                );
            }
        }),
    );
    await Promise.all(promises);
    console.log("orders: ", 1111);
}

function extractMtPhoneNumber(text) {
    // 定义正则表达式，用于匹配手机号格式（188****7651）
    const phonePattern = /\b\d{3}\*{4}\d{4}\b/g;
    // 使用正则表达式提取符合条件的手机号
    const matches = text.match(phonePattern);
    // 如果找到匹配的手机号，返回结果，否则返回 null
    return matches ? matches[0] : null;
}

function getDateRange(startDate, endDate) {
    const dateArr = [];
    const currentDate = moment(startDate, 'YYYY-MM-DD');
    const lastDate = moment(endDate, 'YYYY-MM-DD');
    // 确保起始日期小于或等于结束日期
    if (!currentDate.isValid() || !lastDate.isValid() || currentDate.isAfter(lastDate)) {
        throw new Error('Invalid date range');
    }
    while (currentDate.isSameOrBefore(lastDate)) {
        dateArr.push(currentDate.format('YYYY-MM-DD'));
        // 将日期增加一个月
        currentDate.add(1, 'months');
        // 只需要每月的第一天，所以将日期重置为当月的第一天
        currentDate.date(1);
    }
    return dateArr;
}

//京东每月新用户复购订单明细(receiver_mobile)
async function jtOrderDetailStatistic(start, end) {
    const originalDate = '2022-05-01';
    let startDate = start || "2024-01-01";
    let endDate = end || "2024-11-01";
    let endDateNextMonth = moment(endDate).add(1, 'months').startOf('month').format('YYYY-MM-DD');//"2024-12-01"
    const dateArr = getDateRange(startDate, endDate);//["2022-05-01", "2022-06-01", ..., "2024-11-01"]
    let newUserOrderDetailEveryMonth = [];
    for (let i = 1; i < dateArr.length - 1; i++) {
        const resultArr = [];
        let sql = `
            WITH NewUsers AS (
                SELECT DISTINCT
                    receiver_mobile 
                FROM 
                    jst_order
                WHERE 
                    created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00'
                    AND (shop_name LIKE '%京东%') 
                    AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
                    AND receiver_mobile NOT IN (
                        SELECT 
                            DISTINCT receiver_mobile 
                        FROM 
                            jst_order 
                        WHERE 
                            created >= '${originalDate} 00:00:00' AND created < '${dateArr[i]} 00:00:00' 
                            AND (shop_name LIKE '%京东%') 
                            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
                    )
            )
            SELECT 
                o.created,
                o.so_id,
                o.receiver_mobile,
                o.paid_amount 
            FROM 
                jst_order o 
            JOIN 
                NewUsers nu 
            ON 
                o.receiver_mobile = nu.receiver_mobile 
            WHERE 
                o.created >= '${dateArr[i]} 00:00:00' 
                AND (o.shop_name LIKE '%京东%') 
                AND (o.receiver_mobile IS NOT NULL AND o.receiver_mobile != '') 
            ORDER BY 
                o.created
        `;
        let res1 = await sequelize_shop_tk.query(sql, {
            type: QueryTypes.SELECT
        });
        if (res1 && res1.length) {
            for (const item of res1) {
                resultArr.push({
                    created: moment(item.created).format('YYYY-MM-DD'),
                    so_id: item.so_id,
                    receiver_mobile: item.receiver_mobile,
                    paid_amount: Number(item?.paid_amount ?? 0),
                    sku_id: item.sku_id,
                    name: item.name,
                    qty: Number(item?.qty ?? 0)
                });
            }
        }
        newUserOrderDetailEveryMonth.push(resultArr);
    }
    // 查询起始时间的用户下单明细（2022-05-01）
    let startDate_order_sql = `
        WITH NewUsers AS (
            SELECT DISTINCT
                receiver_mobile 
            FROM 
                jst_order
            WHERE 
                created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00'
                AND (shop_name LIKE '%京东%')
                AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
                AND receiver_mobile NOT IN (
                    SELECT 
                        DISTINCT receiver_mobile 
                    FROM 
                        jst_order 
                    WHERE 
                        created >= '${originalDate} 00:00:00' AND created < '${dateArr[0]} 00:00:00' 
                        AND (shop_name LIKE '%京东%') 
                        AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
                )
        )
        SELECT 
            o.created,
            o.so_id,
            o.receiver_mobile,
            o.paid_amount,
            oi.sku_id,
            oi.name,
            oi.qty 
        FROM 
            NewUsers nu 
        JOIN 
            jst_order o 
        ON 
            o.receiver_mobile = nu.receiver_mobile 
        JOIN 
            jst_order_item oi 
        ON 
            oi.order_id = o.id 
        WHERE 
            o.created >= '${dateArr[0]} 00:00:00' 
            AND (o.shop_name LIKE '%京东%') 
            AND (o.receiver_mobile IS NOT NULL AND o.receiver_mobile != '') 
        ORDER BY 
            o.created
    `;
    const firstMonthOrderDetail = await sequelize_shop_tk.query(startDate_order_sql, {
        type: QueryTypes.SELECT
    });
    let firstMonthResult = [];
    if (firstMonthOrderDetail && firstMonthOrderDetail.length) {
        for (const item of firstMonthOrderDetail) {
            firstMonthResult.push({
                created: moment(item.created).format('YYYY-MM-DD'),
                so_id: item.so_id,
                receiver_mobile: item.receiver_mobile,
                paid_amount: Number(item?.paid_amount ?? 0),
                sku_id: item.sku_id,
                name: item.name,
                qty: Number(item?.qty ?? 0)
            });
        }
    }
    newUserOrderDetailEveryMonth = [firstMonthResult, ...newUserOrderDetailEveryMonth];
    // 结束时间的新用户订单明细（2024-11-01）
    let endDate_order_sql = `
        WITH NewUsers AS (
            SELECT DISTINCT
                receiver_mobile 
            FROM 
                jst_order
            WHERE 
                created >= '${dateArr[dateArr.length - 1]} 00:00:00' AND created < '${endDateNextMonth} 00:00:00'
                AND (shop_name LIKE '%京东%')
                AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
                AND receiver_mobile NOT IN (
                    SELECT 
                        DISTINCT receiver_mobile 
                    FROM 
                        jst_order 
                    WHERE 
                        created >= '${originalDate} 00:00:00' AND created < '${dateArr[dateArr.length - 1]} 00:00:00' 
                        AND (shop_name LIKE '%京东%') 
                        AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
                )
        )
        SELECT 
            o.created,
            o.so_id,
            o.receiver_mobile,
            o.paid_amount,
            oi.sku_id,
            oi.name,
            oi.qty 
        FROM 
            NewUsers nu 
        JOIN 
            jst_order o 
        ON 
            o.receiver_mobile = nu.receiver_mobile 
        JOIN 
            jst_order_item oi 
        ON 
            oi.order_id = o.id 
        WHERE 
            o.created >= '${dateArr[dateArr.length - 1]} 00:00:00' 
            AND (o.shop_name LIKE '%京东%') 
            AND (o.receiver_mobile IS NOT NULL AND o.receiver_mobile != '') 
        ORDER BY 
            o.created
    `;
    let lastMonthOrderDetail = await sequelize_shop_tk.query(endDate_order_sql, {
        type: QueryTypes.SELECT
    });
    let lastMonthResult = [];
    if (lastMonthOrderDetail && lastMonthOrderDetail.length) {
        for (const item of lastMonthOrderDetail) {
            lastMonthResult.push({
                created: moment(item.created).format('YYYY-MM-DD'),
                so_id: item.so_id,
                receiver_mobile: item.receiver_mobile,
                paid_amount: Number(item?.paid_amount ?? 0),
                sku_id: item.sku_id,
                name: item.name,
                qty: Number(item?.qty ?? 0)
            });
        }
    }
    newUserOrderDetailEveryMonth = [...newUserOrderDetailEveryMonth, lastMonthResult];
    return {
        list: newUserOrderDetailEveryMonth,
        dateRange: dateArr.map(v => moment(v).format("YYYY-MM"))
    }
}

//美团每月新用户复购订单明细（mt_phone, receiver_state, receiver_city, receiver_district）
async function mtOrderDetailStatistic(start, end) {
    const originalDate = '2022-05-01'; //原始日期
    let startDate = start || "2024-07-01";
    let endDate = end || "2024-09-01";
    let endDateNextMonth = moment(endDate).add(1, 'months').startOf('month').format('YYYY-MM-DD');//"2024-12-01"
    const dateArr = getDateRange(startDate, endDate);//["2022-05-01", "2022-06-01", ..., "2024-11-01"]
    let newUserOrderDetailEveryMonth = [];
    //从2022-06 ~ 2024-10的每月新用户下单明细
    for (let i = 1; i < dateArr.length - 1; i++) {
        const resultArr = [];
        let sql = `
            WITH NewUsers AS (
                SELECT DISTINCT
                    mt_phone,
                    receiver_state,
                    receiver_city,
                    receiver_district
                FROM 
                    jst_order
                WHERE 
                    created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00'
                    AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%')
                    AND (mt_phone IS NOT NULL AND mt_phone != '')
                    AND NOT EXISTS (
                        SELECT 
                            1 
                        FROM 
                            jst_order AS prev_order 
                        WHERE 
                            prev_order.created >= '${originalDate} 00:00:00' AND prev_order.created < '${dateArr[i]} 00:00:00' 
                            AND (prev_order.shop_name LIKE '%美团%' OR prev_order.shop_name LIKE '%美图%') 
                            AND (prev_order.mt_phone IS NOT NULL AND prev_order.mt_phone != '') 
                            AND prev_order.mt_phone = jst_order.mt_phone 
                            AND prev_order.receiver_state = jst_order.receiver_state 
                            AND prev_order.receiver_city = jst_order.receiver_city 
                            AND prev_order.receiver_district = jst_order.receiver_district
                    )
            )
            SELECT 
                o.created,
                o.so_id,
                o.mt_phone,
                o.receiver_state,
                o.receiver_city,
                o.receiver_district,
                o.paid_amount,
                oi.sku_id,
                oi.name,
                oi.qty 
            FROM 
                NewUsers nu 
            JOIN 
                jst_order o 
            ON 
                o.mt_phone = nu.mt_phone
                AND o.receiver_state = nu.receiver_state
                AND o.receiver_city = nu.receiver_city
                AND o.receiver_district = nu.receiver_district 
            JOIN 
                jst_order_item oi 
            ON 
                oi.order_id = o.id 
            WHERE 
                o.created >= '${dateArr[i]} 00:00:00' 
                AND (o.shop_name LIKE '%美团%' OR o.shop_name LIKE '%美图%') 
                AND (o.mt_phone IS NOT NULL AND o.mt_phone != '') 
            ORDER BY 
                o.created
        `;
        let res1 = await sequelize_shop_tk.query(sql, {
            type: QueryTypes.SELECT
        });
        if (res1 && res1.length) {
            for (const item of res1) {
                resultArr.push({
                    created: moment(item.created).format('YYYY-MM-DD'),
                    so_id: item.so_id,
                    mt_phone: item.mt_phone,
                    receiver_state: item.receiver_state,
                    receiver_city: item.receiver_city,
                    receiver_district: item.receiver_district,
                    paid_amount: Number(item?.paid_amount ?? 0),
                    sku_id: item.sku_id,
                    name: item.name,
                    qty: Number(item?.qty ?? 0)
                });
            }
        }
        newUserOrderDetailEveryMonth.push(resultArr);
    }
    // 查询起始时间的用户下单明细（2022-05-01）
    let startDate_order_sql = `
        WITH NewUsers AS (
            SELECT DISTINCT
                mt_phone,
                receiver_state,
                receiver_city,
                receiver_district
            FROM 
                jst_order
            WHERE 
                created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00'
                AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%')
                AND (mt_phone IS NOT NULL AND mt_phone != '') 
                AND NOT EXISTS (
                    SELECT 
                        1 
                    FROM 
                        jst_order AS prev_order 
                    WHERE 
                        prev_order.created >= '${originalDate} 00:00:00' AND prev_order.created < '${dateArr[0]} 00:00:00' 
                        AND (prev_order.shop_name LIKE '%美团%' OR prev_order.shop_name LIKE '%美图%') 
                        AND (prev_order.mt_phone IS NOT NULL AND prev_order.mt_phone != '') 
                        AND prev_order.mt_phone = jst_order.mt_phone 
                        AND prev_order.receiver_state = jst_order.receiver_state 
                        AND prev_order.receiver_city = jst_order.receiver_city 
                        AND prev_order.receiver_district = jst_order.receiver_district 
                )
        )
        SELECT 
            o.created,
            o.so_id,
            o.mt_phone,
            o.receiver_state,
            o.receiver_city,
            o.receiver_district,
            o.paid_amount,
            oi.sku_id,
            oi.name,
            oi.qty 
        FROM 
            NewUsers nu 
        JOIN 
            jst_order o 
        ON 
            o.mt_phone = nu.mt_phone
            AND o.receiver_state = nu.receiver_state
            AND o.receiver_city = nu.receiver_city
            AND o.receiver_district = nu.receiver_district 
        JOIN 
            jst_order_item oi 
        ON 
            oi.order_id = o.id 
        WHERE 
            o.created >= '${dateArr[0]} 00:00:00' 
            AND (o.shop_name LIKE '%美团%' OR o.shop_name LIKE '%美图%') 
            AND (o.mt_phone IS NOT NULL AND o.mt_phone != '') 
        ORDER BY 
            o.created
    `;
    const firstMonthOrderDetail = await sequelize_shop_tk.query(startDate_order_sql, {
        type: QueryTypes.SELECT
    });
    let firstMonthResult = [];
    if (firstMonthOrderDetail && firstMonthOrderDetail.length) {
        for (const item of firstMonthOrderDetail) {
            firstMonthResult.push({
                created: moment(item.created).format('YYYY-MM-DD'),
                so_id: item.so_id,
                mt_phone: item.mt_phone,
                receiver_state: item.receiver_state,
                receiver_city: item.receiver_city,
                receiver_district: item.receiver_district,
                paid_amount: Number(item?.paid_amount ?? 0),
                sku_id: item.sku_id,
                name: item.name,
                qty: Number(item?.qty ?? 0)
            });
        }
    }
    newUserOrderDetailEveryMonth = [firstMonthResult, ...newUserOrderDetailEveryMonth];
    // 结束时间的新用户订单明细（2024-11-01）
    let endDate_order_sql = `
        WITH NewUsers AS (
            SELECT DISTINCT
                mt_phone,
                receiver_state,
                receiver_city,
                receiver_district
            FROM 
                jst_order
            WHERE 
                created >= '${dateArr[dateArr.length - 1]} 00:00:00' AND created < '${endDateNextMonth} 00:00:00'
                AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%')
                AND (mt_phone IS NOT NULL AND mt_phone != '') 
                AND NOT EXISTS (
                    SELECT 
                        1 
                    FROM 
                        jst_order AS prev_order 
                    WHERE 
                        prev_order.created >= '${originalDate} 00:00:00' AND prev_order.created < '${dateArr[dateArr.length - 1]} 00:00:00' 
                        AND (prev_order.shop_name LIKE '%美团%' OR prev_order.shop_name LIKE '%美图%') 
                        AND (prev_order.mt_phone IS NOT NULL AND prev_order.mt_phone != '') 
                        AND prev_order.mt_phone = jst_order.mt_phone 
                        AND prev_order.receiver_state = jst_order.receiver_state 
                        AND prev_order.receiver_city = jst_order.receiver_city 
                        AND prev_order.receiver_district = jst_order.receiver_district 
                )
        )
        SELECT 
            o.created,
            o.so_id,
            o.mt_phone,
            o.receiver_state,
            o.receiver_city,
            o.receiver_district,
            o.paid_amount,
            oi.sku_id,
            oi.name,
            oi.qty 
        FROM 
            NewUsers nu 
        JOIN 
            jst_order o 
        ON 
            o.mt_phone = nu.mt_phone
            AND o.receiver_state = nu.receiver_state
            AND o.receiver_city = nu.receiver_city
            AND o.receiver_district = nu.receiver_district 
        JOIN 
            jst_order_item oi 
        ON 
            oi.order_id = o.id 
        WHERE 
            o.created >= '${dateArr[dateArr.length - 1]} 00:00:00' 
            AND (o.shop_name LIKE '%美团%' OR o.shop_name LIKE '%美图%') 
            AND (o.mt_phone IS NOT NULL AND o.mt_phone != '') 
        ORDER BY 
            o.created
    `;
    let lastMonthOrderDetail = await sequelize_shop_tk.query(endDate_order_sql, {
        type: QueryTypes.SELECT
    });
    let lastMonthResult = [];
    if (lastMonthOrderDetail && lastMonthOrderDetail.length) {
        for (const item of lastMonthOrderDetail) {
            lastMonthResult.push({
                created: moment(item.created).format('YYYY-MM-DD'),
                so_id: item.so_id,
                mt_phone: item.mt_phone,
                receiver_state: item.receiver_state,
                receiver_city: item.receiver_city,
                receiver_district: item.receiver_district,
                paid_amount: Number(item?.paid_amount ?? 0),
                sku_id: item.sku_id,
                name: item.name,
                qty: Number(item?.qty ?? 0)
            });
        }
    }
    newUserOrderDetailEveryMonth = [...newUserOrderDetailEveryMonth, lastMonthResult];
    return {
        list: newUserOrderDetailEveryMonth,
        dateRange: dateArr.map(v => moment(v).format("YYYY-MM"))
    }
}

//美团订单统计（mt_phone, receiver_state, receiver_city, receiver_district）
async function mtOrderStatistic(start, end) {
    let originalDate = '2022-05-01'; //原始日期
    let startDate = start || "2022-05-01";
    let endDate = end || "2024-11-01";
    let startDateNextMonth = moment(startDate).add(1, 'months').startOf('month').format('YYYY-MM');
    let endDateMonth = moment(endDate).format('YYYY-MM');
    let endDateNextMonth = moment(endDate).add(1, 'months').startOf('month').format('YYYY-MM-DD');
    const dateArr = getDateRange(startDate, endDate);//["2022-05-01", "2022-06-01", ..., "2024-11-01"]
    let newUserOrderCountEveryMonth = [];
    for (let i = 1; i < dateArr.length - 1; i++) {
        let sql = `
            WITH first_orders AS (  
                SELECT 
                    mt_phone, receiver_state, receiver_city, receiver_district 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                    AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                    AND (mt_phone IS NOT NULL AND mt_phone != '') 
                    AND NOT EXISTS (
                        SELECT 
                            1 
                        FROM 
                            jst_order AS prev_order 
                        WHERE 
                            prev_order.created >= '${originalDate} 00:00:00' AND prev_order.created < '${dateArr[i]} 00:00:00' 
                            AND (prev_order.shop_name LIKE '%美团%' OR prev_order.shop_name LIKE '%美图%') 
                            AND (prev_order.mt_phone IS NOT NULL AND prev_order.mt_phone != '') 
                            AND prev_order.mt_phone = jst_order.mt_phone 
                            AND prev_order.receiver_state = jst_order.receiver_state 
                            AND prev_order.receiver_city = jst_order.receiver_city 
                            AND prev_order.receiver_district = jst_order.receiver_district 
                    )
                GROUP BY 
                    mt_phone, receiver_state, receiver_city, receiver_district
            ),  
            subsequent_orders AS (  
                SELECT 
                    fo.mt_phone, 
                    fo.receiver_state, 
                    fo.receiver_city, 
                    fo.receiver_district, 
                    o.created, 
                    DATE_FORMAT(o.created, '%Y-%m') AS order_month  
                FROM 
                    first_orders fo  
                JOIN 
                    jst_order o 
                ON 
                    fo.mt_phone = o.mt_phone 
                    AND fo.receiver_state = o.receiver_state 
                    AND fo.receiver_city = o.receiver_city 
                    AND fo.receiver_district = o.receiver_district 
                WHERE 
                    o.created >= '${dateArr[i + 1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                    AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                    AND (o.mt_phone IS NOT NULL AND o.mt_phone != '')
            ) 
            SELECT 
                order_month, 
                COUNT(*) AS order_count 
            FROM 
                subsequent_orders 
            WHERE 
                order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
            GROUP BY 
                order_month 
            ORDER BY 
                order_month
        `;
        let res1 = await sequelize_shop_tk.query(sql, { type: QueryTypes.SELECT });
        // 查询从 startDate + 1 ~ endDate - 1 各个月的新用户订单数
        let sql2 = `
            SELECT 
                COUNT(DISTINCT so_id) AS ct 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                AND (mt_phone IS NOT NULL AND mt_phone != '') 
                AND NOT EXISTS (
                    SELECT 
                        1 
                    FROM 
                        jst_order AS prev_order 
                    WHERE 
                        prev_order.created >= '${originalDate} 00:00:00' AND prev_order.created < '${dateArr[i]} 00:00:00' 
                        AND (prev_order.shop_name LIKE '%美团%' OR prev_order.shop_name LIKE '%美图%') 
                        AND (prev_order.mt_phone IS NOT NULL AND prev_order.mt_phone != '') 
                        AND prev_order.mt_phone = jst_order.mt_phone 
                        AND prev_order.receiver_state = jst_order.receiver_state 
                        AND prev_order.receiver_city = jst_order.receiver_city 
                        AND prev_order.receiver_district = jst_order.receiver_district 
                )
        `;
        const res2 = await sequelize_shop_tk.query(sql2, { type: QueryTypes.SELECT });
        res1.unshift({ order_month: moment(dateArr[i]).format("YYYY-MM"), order_count: res2?.[0]?.ct ?? 0 })
        newUserOrderCountEveryMonth.push(res1);
    }
    // 查询startDate的用户下单数
    let startDate_order_sql = `
        SELECT 
            COUNT(DISTINCT so_id) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
            AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
            AND (mt_phone IS NOT NULL AND mt_phone != '')
    `;
    const firstMonthOrderCount = await sequelize_shop_tk.query(startDate_order_sql, { type: QueryTypes.SELECT });
    // 查询startDate的新用户在各个月产生的订单数
    let startDate_next_order_sql = `
        WITH first_orders AS (  
            SELECT 
                mt_phone, receiver_state, receiver_city, receiver_district 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
                AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                AND (mt_phone IS NOT NULL AND mt_phone != '') 
            GROUP BY 
                mt_phone, receiver_state, receiver_city, receiver_district 
        ),
        subsequent_orders AS (
            SELECT 
                fo.mt_phone, 
                fo.receiver_state, 
                fo.receiver_city, 
                fo.receiver_district, 
                o.created, 
                DATE_FORMAT(o.created, '%Y-%m') AS order_month  
            FROM 
                first_orders fo 
            JOIN 
                jst_order o 
            ON 
                fo.mt_phone = o.mt_phone 
                AND fo.receiver_state = o.receiver_state 
                AND fo.receiver_city = o.receiver_city 
                AND fo.receiver_district = o.receiver_district 
            WHERE 
                o.created >= '${dateArr[1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                AND (o.mt_phone IS NOT NULL AND o.mt_phone != '')
        ) 
        SELECT 
            order_month,
            COUNT(*) AS order_count 
        FROM 
            subsequent_orders 
        WHERE 
            order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
        GROUP BY 
            order_month 
        ORDER BY 
            order_month;
    `;
    let firstMonthOrderCountResults = await sequelize_shop_tk.query(startDate_next_order_sql, { type: QueryTypes.SELECT });
    // 查询endDate的新用户订单数
    let endDate_order_sql = `
        SELECT 
            COUNT(DISTINCT so_id) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[dateArr.length - 1]} 00:00:00' AND created < '${endDateNextMonth} 00:00:00' 
            AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
            AND (mt_phone IS NOT NULL AND mt_phone != '') 
            AND NOT EXISTS (
                SELECT 
                    1 
                FROM 
                    jst_order AS prev_order 
                WHERE 
                    prev_order.created >= '${originalDate} 00:00:00' AND prev_order.created < '${dateArr[dateArr.length - 1]} 00:00:00' 
                    AND (prev_order.shop_name LIKE '%美团%' OR prev_order.shop_name LIKE '%美图%') 
                    AND (prev_order.mt_phone IS NOT NULL AND prev_order.mt_phone != '') 
                    AND prev_order.mt_phone = jst_order.mt_phone 
                    AND prev_order.receiver_state = jst_order.receiver_state 
                    AND prev_order.receiver_city = jst_order.receiver_city 
                    AND prev_order.receiver_district = jst_order.receiver_district 
            )
    `;
    let lastMonthOrderCountResults = await sequelize_shop_tk.query(endDate_order_sql, { type: QueryTypes.SELECT });
    firstMonthOrderCountResults.unshift({ order_month: moment(`${startDate}`).format("YYYY-MM"), order_count: firstMonthOrderCount?.[0]?.ct ?? 0 });
    firstMonthOrderCountResults = [firstMonthOrderCountResults];
    lastMonthOrderCountResults = [[{ order_month: moment(`${endDate}`).format("YYYY-MM"), order_count: lastMonthOrderCountResults?.[0]?.ct ?? 0 }]];
    let result = firstMonthOrderCountResults.concat(newUserOrderCountEveryMonth).concat(lastMonthOrderCountResults);
    let finalResult = [];
    for (let i = 0; i < result.length; i++) {
        const data = result[i];
        const orderMonths = data.map(v => v.order_month);
        const dataMap = new Map();
        for (const item of data) {
            dataMap.set(item.order_month, item.order_count);
        }
        const res = {};
        for (let j = 0; j < dateArr.length; j++) {
            const date = moment(dateArr[j]).format("YYYY-MM");
            if (!orderMonths.includes(date)) {
                res[date] = 0;
            } else {
                res[date] = dataMap.get(date);
            }
        }
        finalResult.push(res);
    }
    return {
        list: finalResult,
        dateRange: dateArr.map(v => moment(v).format("YYYY-MM"))
    }
}

//美团订单销售额统计（mt_phone, receiver_state, receiver_city, receiver_district）
async function mtOrderSaleStatistic(start, end) {
    let originalDate = '2022-05-01'; //原始日期
    let startDate = start || "2022-05-01";
    let endDate = end || "2024-11-01";
    let startDateNextMonth = moment(startDate).add(1, 'months').startOf('month').format('YYYY-MM');
    let endDateMonth = moment(endDate).format('YYYY-MM');
    let endDateNextMonth = moment(endDate).add(1, 'months').startOf('month').format('YYYY-MM-DD');
    const dateArr = getDateRange(startDate, endDate);//["2022-05-01", "2022-06-01", ..., "2024-11-01"]
    let newUserOrderCountEveryMonth = [];
    for (let i = 1; i < dateArr.length - 1; i++) {
        let sql = `
            WITH first_orders AS (
                -- 查询某月的新用户  
                SELECT 
                    mt_phone, receiver_state, receiver_city, receiver_district 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                    AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                    AND (mt_phone IS NOT NULL AND mt_phone != '') 
                    AND NOT EXISTS (
                        SELECT 
                            1 
                        FROM 
                            jst_order AS prev_order 
                        WHERE 
                            prev_order.created >= '${originalDate} 00:00:00' AND prev_order.created < '${dateArr[i]} 00:00:00' 
                            AND (prev_order.shop_name LIKE '%美团%' OR prev_order.shop_name LIKE '%美图%') 
                            AND (prev_order.mt_phone IS NOT NULL AND prev_order.mt_phone != '') 
                            AND prev_order.mt_phone = jst_order.mt_phone 
                            AND prev_order.receiver_state = jst_order.receiver_state 
                            AND prev_order.receiver_city = jst_order.receiver_city 
                            AND prev_order.receiver_district = jst_order.receiver_district 
                    )
                GROUP BY 
                    mt_phone, receiver_state, receiver_city, receiver_district
            ),  
            subsequent_orders AS (  
                -- 查询某月新用户在次月 ~ endDate之间的所有订单创建年月、销售额
                SELECT 
                    fo.mt_phone, 
                    fo.receiver_state, 
                    fo.receiver_city, 
                    fo.receiver_district, 
                    o.created, 
                    o.paid_amount, 
                    DATE_FORMAT(o.created, '%Y-%m') AS order_month  
                FROM 
                    first_orders fo 
                JOIN 
                    jst_order o 
                ON 
                    fo.mt_phone = o.mt_phone 
                    AND fo.receiver_state = o.receiver_state 
                    AND fo.receiver_city = o.receiver_city 
                    AND fo.receiver_district = o.receiver_district 
                WHERE 
                    o.created >= '${dateArr[i + 1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                    AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                    AND (o.mt_phone IS NOT NULL AND o.mt_phone != '')
            ) 
            -- 查询某月新用户的各个月总销售额
            SELECT 
                order_month, 
                SUM(paid_amount) AS order_count 
            FROM 
                subsequent_orders 
            WHERE 
                order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
            GROUP BY 
                order_month 
            ORDER BY 
                order_month;
        `;
        let res1 = await sequelize_shop_tk.query(sql, { type: QueryTypes.SELECT });
        // 查询从 startDate + 1 ~ endDate - 1 各个月的新用户销售额
        let sql2 = `
            SELECT 
                SUM(paid_amount) AS ct 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                AND (mt_phone IS NOT NULL AND mt_phone != '') 
                AND NOT EXISTS (
                    SELECT 
                        1 
                    FROM 
                        jst_order AS prev_order 
                    WHERE 
                        prev_order.created >= '${originalDate} 00:00:00' AND prev_order.created < '${dateArr[i]} 00:00:00' 
                        AND (prev_order.shop_name LIKE '%美团%' OR prev_order.shop_name LIKE '%美图%') 
                        AND (prev_order.mt_phone IS NOT NULL AND prev_order.mt_phone != '') 
                        AND prev_order.mt_phone = jst_order.mt_phone 
                        AND prev_order.receiver_state = jst_order.receiver_state 
                        AND prev_order.receiver_city = jst_order.receiver_city 
                        AND prev_order.receiver_district = jst_order.receiver_district 
                )
        `;
        const res2 = await sequelize_shop_tk.query(sql2, { type: QueryTypes.SELECT });
        res1.unshift({ order_month: moment(dateArr[i]).format("YYYY-MM"), order_count: res2?.[0]?.ct ?? 0 })
        newUserOrderCountEveryMonth.push(res1);
    }
    // 查询startDate的新用户销售额
    let startDate_order_sql = `
        SELECT 
            SUM(paid_amount) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
            AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
            AND (mt_phone IS NOT NULL AND mt_phone != '')
    `;
    const firstMonthOrderCount = await sequelize_shop_tk.query(startDate_order_sql, { type: QueryTypes.SELECT });
    // 查询startDate的新用户在各个月产生的销售额
    let startDate_next_order_sql = `
        WITH first_orders AS (  
            SELECT 
                mt_phone, receiver_state, receiver_city, receiver_district 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
                AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                AND (mt_phone IS NOT NULL AND mt_phone != '') 
            GROUP BY 
                mt_phone, receiver_state, receiver_city, receiver_district 
        ),
        subsequent_orders AS (
            SELECT 
                fo.mt_phone, fo.receiver_state, fo.receiver_city, fo.receiver_district, o.created, o.paid_amount, DATE_FORMAT(o.created, '%Y-%m') AS order_month  
            FROM 
                first_orders fo 
            JOIN 
                jst_order o 
            ON 
                fo.mt_phone = o.mt_phone 
                AND fo.receiver_state = o.receiver_state 
                AND fo.receiver_city = o.receiver_city 
                AND fo.receiver_district = o.receiver_district 
            WHERE 
                o.created >= '${dateArr[1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
                AND (o.mt_phone IS NOT NULL AND o.mt_phone != '')
        ) 
        SELECT 
            order_month,
            SUM(paid_amount) AS order_count 
        FROM 
            subsequent_orders 
        WHERE 
            order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
        GROUP BY 
            order_month 
        ORDER BY 
            order_month;
    `;
    let firstMonthOrderCountResults = await sequelize_shop_tk.query(startDate_next_order_sql, { type: QueryTypes.SELECT });
    // endDate的新用户销售额
    let endDate_order_sql = `
        SELECT 
            SUM(paid_amount) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[dateArr.length - 1]} 00:00:00' AND created < '${endDateNextMonth} 00:00:00' 
            AND (shop_name LIKE '%美团%' OR shop_name LIKE '%美图%') 
            AND (mt_phone IS NOT NULL AND mt_phone != '') 
            AND NOT EXISTS (
                SELECT 
                    1 
                FROM 
                    jst_order AS prev_order 
                WHERE 
                    prev_order.created >= '${originalDate} 00:00:00' AND prev_order.created < '${dateArr[dateArr.length - 1]} 00:00:00' 
                    AND (prev_order.shop_name LIKE '%美团%' OR prev_order.shop_name LIKE '%美图%') 
                    AND (prev_order.mt_phone IS NOT NULL AND prev_order.mt_phone != '') 
                    AND prev_order.mt_phone = jst_order.mt_phone 
                    AND prev_order.receiver_state = jst_order.receiver_state 
                    AND prev_order.receiver_city = jst_order.receiver_city 
                    AND prev_order.receiver_district = jst_order.receiver_district 
            )
    `;
    let lastMonthOrderCountResults = await sequelize_shop_tk.query(endDate_order_sql, { type: QueryTypes.SELECT });
    firstMonthOrderCountResults.unshift({ order_month: moment(`${startDate}`).format("YYYY-MM"), order_count: firstMonthOrderCount?.[0]?.ct ?? 0 });
    firstMonthOrderCountResults = [firstMonthOrderCountResults];
    lastMonthOrderCountResults = [[{ order_month: moment(`${endDate}`).format("YYYY-MM"), order_count: lastMonthOrderCountResults?.[0]?.ct ?? 0 }]];
    let result = firstMonthOrderCountResults.concat(newUserOrderCountEveryMonth).concat(lastMonthOrderCountResults);
    let finalResult = [];
    for (let i = 0; i < result.length; i++) {
        const data = result[i];
        const orderMonths = data.map(v => v.order_month);
        const dataMap = new Map();
        for (const item of data) {
            dataMap.set(item.order_month, item.order_count);
        }
        const res = {};
        for (let j = 0; j < dateArr.length; j++) {
            const date = moment(dateArr[j]).format("YYYY-MM");
            if (!orderMonths.includes(date)) {
                res[date] = 0;
            } else {
                res[date] = dataMap.get(date);
            }
        }
        finalResult.push(res);
    }
    return {
        list: finalResult,
        dateRange: dateArr.map(v => moment(v).format("YYYY-MM"))
    }
}

//京东订单统计（receiver_mobile）
async function jdOrderStatistic(start, end) {
    let originalDate = '2022-05-01'; //原始日期
    let startDate = start || "2024-06-01";
    let endDate = end || "2024-11-01";
    let startDateNextMonth = moment(startDate).add(1, 'months').startOf('month').format('YYYY-MM');
    let endDateMonth = moment(endDate).format('YYYY-MM');
    let endDateNextMonth = moment(endDate).add(1, 'months').startOf('month').format('YYYY-MM-DD');
    const dateArr = getDateRange(startDate, endDate);//["2022-05-01", "2022-06-01", ..., "2024-11-01"]
    let newUserOrderCountEveryMonth = [];
    for (let i = 1; i < dateArr.length - 1; i++) {
        let sql = `
            WITH first_orders AS (  
                SELECT 
                    receiver_mobile 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                    AND (shop_name LIKE '%京东%') 
                    AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
                    AND receiver_mobile NOT IN (
                        SELECT 
                            DISTINCT receiver_mobile 
                        FROM 
                            jst_order 
                        WHERE 
                            created >= '${originalDate} 00:00:00' AND created < '${dateArr[i]} 00:00:00' 
                            AND (shop_name LIKE '%京东%') 
                            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
                    )
                GROUP BY 
                    receiver_mobile
            ),  
            subsequent_orders AS (  
                SELECT 
                    fo.receiver_mobile, o.created, DATE_FORMAT(o.created, '%Y-%m') AS order_month  
                FROM 
                    first_orders fo  
                JOIN 
                    jst_order o 
                ON 
                    fo.receiver_mobile = o.receiver_mobile  
                WHERE 
                    o.created >= '${dateArr[i + 1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                    AND (shop_name LIKE '%京东%') 
                    AND (o.receiver_mobile IS NOT NULL AND o.receiver_mobile != '')
            ) 
            SELECT 
                order_month, 
                COUNT(*) AS order_count 
            FROM 
                subsequent_orders 
            WHERE 
                order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
            GROUP BY 
                order_month 
            ORDER BY 
                order_month;
        `;
        let res1 = await sequelize_shop_tk.query(sql, {
            type: QueryTypes.SELECT
        });
        let sql2 = `
            SELECT 
                COUNT(DISTINCT so_id) AS ct 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                AND (shop_name LIKE '%京东%') 
                AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
                AND receiver_mobile NOT IN (
                    SELECT 
                        DISTINCT receiver_mobile 
                    FROM 
                        jst_order 
                    WHERE 
                        created >= '${originalDate} 00:00:00' AND created < '${dateArr[i]} 00:00:00' 
                        AND (shop_name LIKE '%京东%') 
                        AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
                );
        `;
        const res2 = await sequelize_shop_tk.query(sql2, {
            type: QueryTypes.SELECT
        });
        res1.unshift({ order_month: moment(dateArr[i]).format("YYYY-MM"), order_count: res2?.[0]?.ct ?? 0 })
        newUserOrderCountEveryMonth.push(res1);
    }
    // 查询startDate的用户下单数
    let startDate_order_sql = `
        SELECT 
            COUNT(DISTINCT so_id) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
            AND (shop_name LIKE '%京东%') 
            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
    `;
    const firstMonthOrderCount = await sequelize_shop_tk.query(startDate_order_sql, {
        type: QueryTypes.SELECT
    });
    // 查询起始时间的新用户在各个月产生的订单数
    let startDate_next_order_sql = `
        WITH first_orders AS (  
            SELECT 
                receiver_mobile 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
                AND (shop_name LIKE '%京东%') 
                AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
            GROUP BY 
                receiver_mobile
        ),
        subsequent_orders AS (
            SELECT 
                fo.receiver_mobile, o.created, DATE_FORMAT(o.created, '%Y-%m') AS order_month  
            FROM 
                first_orders fo 
            JOIN 
                jst_order o ON fo.receiver_mobile = o.receiver_mobile 
            WHERE 
                o.created >= '${dateArr[1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                AND (shop_name LIKE '%京东%') 
                AND (o.receiver_mobile IS NOT NULL AND o.receiver_mobile != '')
        ) 
        SELECT 
            order_month,
            COUNT(*) AS order_count 
        FROM 
            subsequent_orders 
        WHERE 
            order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
        GROUP BY 
            order_month 
        ORDER BY 
            order_month;
    `;
    let firstMonthOrderCountResults = await sequelize_shop_tk.query(startDate_next_order_sql, {
        type: QueryTypes.SELECT
    });
    // endDate的新用户订单数
    let endDate_order_sql = `
        SELECT 
            COUNT(DISTINCT so_id) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[dateArr.length - 1]} 00:00:00' AND created < '${endDateNextMonth} 00:00:00' 
            AND (shop_name LIKE '%京东%') 
            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
            AND receiver_mobile NOT IN (
                SELECT 
                    DISTINCT receiver_mobile 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${originalDate} 00:00:00' AND created < '${dateArr[dateArr.length - 1]} 00:00:00' 
                    AND (shop_name LIKE '%京东%') 
                    AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
            );
    `;
    let lastMonthOrderCountResults = await sequelize_shop_tk.query(endDate_order_sql, {
        type: QueryTypes.SELECT
    });
    firstMonthOrderCountResults.unshift({ order_month: moment(`${startDate}`).format("YYYY-MM"), order_count: firstMonthOrderCount?.[0]?.ct ?? 0 });
    firstMonthOrderCountResults = [firstMonthOrderCountResults];
    lastMonthOrderCountResults = [[{ order_month: moment(`${endDate}`).format("YYYY-MM"), order_count: lastMonthOrderCountResults?.[0]?.ct ?? 0 }]];
    let result = firstMonthOrderCountResults.concat(newUserOrderCountEveryMonth).concat(lastMonthOrderCountResults);
    let finalResult = [];
    for (let i = 0; i < result.length; i++) {
        const data = result[i];
        const orderMonths = data.map(v => v.order_month);
        const dataMap = new Map();
        for (const item of data) {
            dataMap.set(item.order_month, item.order_count);
        }
        const res = {};
        for (let j = 0; j < dateArr.length; j++) {
            const date = moment(dateArr[j]).format("YYYY-MM");
            if (!orderMonths.includes(date)) {
                res[date] = 0;
            } else {
                res[date] = dataMap.get(date);
            }
        }
        finalResult.push(res);
    }
    return {
        list: finalResult,
        dateRange: dateArr.map(v => moment(v).format("YYYY-MM"))
    }
}

//京东订单销售额统计（receiver_mobile）
async function jdOrderSaleStatistic(start, end) {
    let startDate = start || "2022-05-01";
    let endDate = end || "2024-10-01";
    let startDateNextMonth = moment(startDate).add(1, 'months').startOf('month').format('YYYY-MM');//"2022-06"
    let endDateMonth = moment(endDate).format('YYYY-MM');//"2024-10"
    let endDateNextMonth = moment(endDate).add(1, 'months').startOf('month').format('YYYY-MM-DD');//"2024-11-01"
    const dateArr = getDateRange(startDate, endDate);//["2022-05-01", "2022-06-01", ..., "2024-10-01"]
    let newUserOrderCountEveryMonth = [];
    for (let i = 1; i < dateArr.length - 1; i++) {
        let sql = `
            WITH first_orders AS (  
                SELECT 
                    receiver_mobile 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                    AND (shop_name LIKE '%京东%') 
                    AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
                    AND 
                    receiver_mobile NOT IN (
                        SELECT 
                            DISTINCT receiver_mobile 
                        FROM 
                            jst_order 
                        WHERE 
                            created >= '${startDate} 00:00:00' AND created < '${dateArr[i]} 00:00:00' 
                            AND (shop_name LIKE '%京东%') 
                            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
                    )
                GROUP BY 
                    receiver_mobile
            ),  
            subsequent_orders AS (  
                SELECT 
                    fo.receiver_mobile, o.created, o.paid_amount, DATE_FORMAT(o.created, '%Y-%m') AS order_month  
                FROM 
                    first_orders fo  
                JOIN 
                    jst_order o 
                ON 
                    fo.receiver_mobile = o.receiver_mobile  
                WHERE 
                    o.created >= '${dateArr[i + 1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                    AND (shop_name LIKE '%京东%') 
                    AND (o.receiver_mobile IS NOT NULL AND o.receiver_mobile != '')
            ) 
            SELECT 
                order_month, 
                SUM(paid_amount) AS order_count 
            FROM 
                subsequent_orders 
            WHERE 
                order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
            GROUP BY 
                order_month 
            ORDER BY 
                order_month;
        `;
        let res1 = await sequelize_shop_tk.query(sql, {
            type: QueryTypes.SELECT
        });
        // 查询从2022-06-01 ~ 2024-09-01各个月的新用户订单数
        let sql2 = `
            SELECT 
                SUM(paid_amount) AS ct 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                AND (shop_name LIKE '%京东%') 
                AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
                AND receiver_mobile NOT IN (
                    SELECT 
                        DISTINCT receiver_mobile 
                    FROM 
                        jst_order 
                    WHERE 
                        created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[i]} 00:00:00' 
                        AND (shop_name LIKE '%京东%') 
                        AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
                );
        `;
        const res2 = await sequelize_shop_tk.query(sql2, {
            type: QueryTypes.SELECT
        });
        res1.unshift({ order_month: moment(dateArr[i]).format("YYYY-MM"), order_count: res2?.[0]?.ct ?? 0 })
        newUserOrderCountEveryMonth.push(res1);
    }
    // 查询起始时间的用户下单数（2022-05-01）
    let startDate_order_sql = `
        SELECT 
            SUM(paid_amount) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
            AND (shop_name LIKE '%京东%') 
            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
    `;
    const firstMonthOrderCount = await sequelize_shop_tk.query(startDate_order_sql, {
        type: QueryTypes.SELECT
    });
    console.log('起始时间的用户订单数统计 ===>>>', firstMonthOrderCount);
    // 查询起始时间的新用户在各个月产生的订单数（2022-06-01 ~ 2024-10-01）
    let startDate_next_order_sql = `
        WITH first_orders AS (  
            SELECT 
                receiver_mobile 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
                AND (shop_name LIKE '%京东%') 
                AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
            GROUP BY 
                receiver_mobile
        ),
        subsequent_orders AS (
            SELECT 
                fo.receiver_mobile, o.created, o.paid_amount, DATE_FORMAT(o.created, '%Y-%m') AS order_month  
            FROM 
                first_orders fo 
            JOIN 
                jst_order o ON fo.receiver_mobile = o.receiver_mobile 
            WHERE 
                o.created >= '${dateArr[1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                AND (shop_name LIKE '%京东%') 
                AND (o.receiver_mobile IS NOT NULL AND o.receiver_mobile != '')
        ) 
        SELECT 
            order_month,
            SUM(paid_amount) AS order_count 
        FROM 
            subsequent_orders 
        WHERE 
            order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
        GROUP BY 
            order_month 
        ORDER BY 
            order_month;
    `;
    let firstMonthOrderCountResults = await sequelize_shop_tk.query(startDate_next_order_sql, {
        type: QueryTypes.SELECT
    });
    console.log('起始时间的新用户在各个月产生的订单数 ===>>>', firstMonthOrderCountResults); //2022-06-01 ~ 2024-10-01
    // 结束时间的新用户订单数（2024-10-01）
    let endDate_order_sql = `
        SELECT 
            SUM(paid_amount) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[dateArr.length - 1]} 00:00:00' AND created < '${endDateNextMonth} 00:00:00' 
            AND (shop_name LIKE '%京东%') 
            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
            AND receiver_mobile NOT IN (
                SELECT 
                    DISTINCT receiver_mobile 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[dateArr.length - 1]} 00:00:00' 
                    AND (shop_name LIKE '%京东%') 
                    AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
            );
    `;
    let lastMonthOrderCountResults = await sequelize_shop_tk.query(endDate_order_sql, {
        type: QueryTypes.SELECT
    });
    console.log('结束时间的用户订单数统计 ===>>>', lastMonthOrderCountResults);
    firstMonthOrderCountResults.unshift({ order_month: moment(`${startDate}`).format("YYYY-MM"), order_count: firstMonthOrderCount?.[0]?.ct ?? 0 }); //补全第一条数据
    firstMonthOrderCountResults = [firstMonthOrderCountResults];
    lastMonthOrderCountResults = [[{ order_month: moment(`${endDate}`).format("YYYY-MM"), order_count: lastMonthOrderCountResults?.[0]?.ct ?? 0 }]]; //补全最后一条数据
    let result = firstMonthOrderCountResults.concat(newUserOrderCountEveryMonth).concat(lastMonthOrderCountResults);
    let finalResult = [];
    for (let i = 0; i < result.length; i++) {
        const data = result[i];
        const orderMonths = data.map(v => v.order_month);
        const dataMap = new Map();
        for (const item of data) {
            dataMap.set(item.order_month, item.order_count);
        }
        const res = {};
        for (let j = 0; j < dateArr.length; j++) {
            const date = moment(dateArr[j]).format("YYYY-MM"); // 2022-05 2022-06 2024-10
            if (!orderMonths.includes(date)) {
                res[date] = 0;
            } else {
                res[date] = dataMap.get(date);
            }
        }
        finalResult.push(res);
    }
    return {
        list: finalResult,
        dateRange: dateArr.map(v => moment(v).format("YYYY-MM"))
    }
}

//有赞订单统计（buyer_id）
async function yzOrderStatistic(start, end) {
    let startDate = start || "2022-05-01";
    let endDate = end || "2024-11-01";
    let startDateNextMonth = moment(startDate).add(1, 'months').startOf('month').format('YYYY-MM');//"2022-06"
    let endDateMonth = moment(endDate).format('YYYY-MM');//"2024-10"
    let endDateNextMonth = moment(endDate).add(1, 'months').startOf('month').format('YYYY-MM-DD');//"2024-11-01"
    const dateArr = getDateRange(startDate, endDate);//["2022-05-01", "2022-06-01", ..., "2024-10-01"]
    let newUserOrderCountEveryMonth = [];
    for (let i = 1; i < dateArr.length - 1; i++) {
        let sql = `
            WITH first_orders AS (  
                SELECT 
                    receiver_mobile 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                    AND (shop_name LIKE '%京东%') 
                    AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
                    AND 
                    receiver_mobile NOT IN (
                        SELECT 
                            DISTINCT receiver_mobile 
                        FROM 
                            jst_order 
                        WHERE 
                            created >= '${startDate} 00:00:00' AND created < '${dateArr[i]} 00:00:00' 
                            AND (shop_name LIKE '%京东%') 
                            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
                    )
                GROUP BY 
                    receiver_mobile
            ),  
            subsequent_orders AS (  
                SELECT 
                    fo.receiver_mobile, o.created, DATE_FORMAT(o.created, '%Y-%m') AS order_month  
                FROM 
                    first_orders fo  
                JOIN 
                    jst_order o 
                ON 
                    fo.receiver_mobile = o.receiver_mobile  
                WHERE 
                    o.created >= '${dateArr[i + 1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                    AND (shop_name LIKE '%京东%') 
                    AND (o.receiver_mobile IS NOT NULL AND o.receiver_mobile != '')
            ) 
            SELECT 
                order_month, 
                COUNT(*) AS order_count 
            FROM 
                subsequent_orders 
            WHERE 
                order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
            GROUP BY 
                order_month 
            ORDER BY 
                order_month;
        `;
        let res1 = await sequelize_shop_tk.query(sql, {
            type: QueryTypes.SELECT
        });
        // 查询从2022-06-01 ~ 2024-09-01各个月的新用户订单数
        let sql2 = `
            SELECT 
                COUNT(DISTINCT so_id) AS ct 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                AND (shop_name LIKE '%京东%') 
                AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
                AND receiver_mobile NOT IN (
                    SELECT 
                        DISTINCT receiver_mobile 
                    FROM 
                        jst_order 
                    WHERE 
                        created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[i]} 00:00:00' 
                        AND (shop_name LIKE '%京东%') 
                        AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
                );
        `;
        const res2 = await sequelize_shop_tk.query(sql2, {
            type: QueryTypes.SELECT
        });
        res1.unshift({ order_month: moment(dateArr[i]).format("YYYY-MM"), order_count: res2[0].ct })
        newUserOrderCountEveryMonth.push(res1);
    }
    // 查询起始时间的用户下单数（2022-05-01）
    let startDate_order_sql = `
        SELECT 
            COUNT(DISTINCT so_id) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
            AND (shop_name LIKE '%京东%') 
            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
    `;
    const firstMonthOrderCount = await sequelize_shop_tk.query(startDate_order_sql, {
        type: QueryTypes.SELECT
    });
    console.log('起始时间的用户订单数统计 ===>>>', firstMonthOrderCount);
    // 查询起始时间的新用户在各个月产生的订单数（2022-06-01 ~ 2024-10-01）
    let startDate_next_order_sql = `
        WITH first_orders AS (  
            SELECT 
                receiver_mobile 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
                AND (shop_name LIKE '%京东%') 
                AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
            GROUP BY 
                receiver_mobile
        ),
        subsequent_orders AS (
            SELECT 
                fo.receiver_mobile, o.created, DATE_FORMAT(o.created, '%Y-%m') AS order_month  
            FROM 
                first_orders fo 
            JOIN 
                jst_order o ON fo.receiver_mobile = o.receiver_mobile 
            WHERE 
                o.created >= '${dateArr[1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                AND (shop_name LIKE '%京东%') 
                AND (o.receiver_mobile IS NOT NULL AND o.receiver_mobile != '')
        ) 
        SELECT 
            order_month,
            COUNT(*) AS order_count 
        FROM 
            subsequent_orders 
        WHERE 
            order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
        GROUP BY 
            order_month 
        ORDER BY 
            order_month;
    `;
    let firstMonthOrderCountResults = await sequelize_shop_tk.query(startDate_next_order_sql, {
        type: QueryTypes.SELECT
    });
    console.log('起始时间的新用户在各个月产生的订单数 ===>>>', firstMonthOrderCountResults); //2022-06-01 ~ 2024-10-01
    // 结束时间的新用户订单数（2024-10-01）
    let endDate_order_sql = `
        SELECT 
            COUNT(DISTINCT so_id) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[dateArr.length - 1]} 00:00:00' AND created < '${endDateNextMonth} 00:00:00' 
            AND (shop_name LIKE '%京东%') 
            AND (receiver_mobile IS NOT NULL AND receiver_mobile != '') 
            AND receiver_mobile NOT IN (
                SELECT 
                    DISTINCT receiver_mobile 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[dateArr.length - 1]} 00:00:00' 
                    AND (shop_name LIKE '%京东%') 
                    AND (receiver_mobile IS NOT NULL AND receiver_mobile != '')
            );
    `;
    let lastMonthOrderCountResults = await sequelize_shop_tk.query(endDate_order_sql, {
        type: QueryTypes.SELECT
    });
    console.log('结束时间的用户订单数统计 ===>>>', lastMonthOrderCountResults);
    firstMonthOrderCountResults.unshift({ order_month: moment(`${startDate}`).format("YYYY-MM"), order_count: firstMonthOrderCount[0].ct }); //补全第一条数据
    firstMonthOrderCountResults = [firstMonthOrderCountResults];
    lastMonthOrderCountResults = [[{ order_month: moment(`${endDate}`).format("YYYY-MM"), order_count: lastMonthOrderCountResults[0].ct }]]; //补全最后一条数据
    let result = firstMonthOrderCountResults.concat(newUserOrderCountEveryMonth).concat(lastMonthOrderCountResults);
    let finalResult = [];
    for (let i = 0; i < result.length; i++) {
        const data = result[i];
        const orderMonths = data.map(v => v.order_month);
        const dataMap = new Map();
        for (const item of data) {
            dataMap.set(item.order_month, item.order_count);
        }
        const res = {};
        for (let j = 0; j < dateArr.length; j++) {
            const date = moment(dateArr[j]).format("YYYY-MM"); // 2022-05 2022-06 2024-10
            if (!orderMonths.includes(date)) {
                res[date] = 0;
            } else {
                res[date] = dataMap.get(date);
            }
        }
        finalResult.push(res);
    }
    return {
        list: finalResult,
        dateRange: dateArr.map(v => moment(v).format("YYYY-MM"))
    }
}

//有赞订单销售额统计（buyer_id）
async function yzOrderSaleStatistic(start, end) {
    let startDate = start || "2022-05-01";
    let endDate = end || "2024-10-01";
    let startDateNextMonth = moment(startDate).add(1, 'months').startOf('month').format('YYYY-MM');//"2022-06"
    let endDateMonth = moment(endDate).format('YYYY-MM');//"2024-10"
    let endDateNextMonth = moment(endDate).add(1, 'months').startOf('month').format('YYYY-MM-DD');//"2024-11-01"
    const dateArr = getDateRange(startDate, endDate);//["2022-05-01", "2022-06-01", ..., "2024-10-01"]
    let newUserOrderCountEveryMonth = [];
    for (let i = 1; i < dateArr.length - 1; i++) {
        let sql = `
            WITH first_orders AS (  
                SELECT 
                    buyer_id 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                    AND (shop_name LIKE '%有赞%') 
                    AND (buyer_id IS NOT NULL AND buyer_id != '') 
                    AND 
                    buyer_id NOT IN (
                        SELECT 
                            DISTINCT buyer_id 
                        FROM 
                            jst_order 
                        WHERE 
                            created >= '${startDate} 00:00:00' AND created < '${dateArr[i]} 00:00:00' 
                            AND (shop_name LIKE '%有赞%') 
                            AND (buyer_id IS NOT NULL AND buyer_id != '')
                    )
                GROUP BY 
                    buyer_id
            ),  
            subsequent_orders AS (  
                SELECT 
                    fo.buyer_id, o.created, o.paid_amount, DATE_FORMAT(o.created, '%Y-%m') AS order_month  
                FROM 
                    first_orders fo  
                JOIN 
                    jst_order o 
                ON 
                    fo.buyer_id = o.buyer_id  
                WHERE 
                    o.created >= '${dateArr[i + 1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                    AND (shop_name LIKE '%有赞%') 
                    AND (o.buyer_id IS NOT NULL AND o.buyer_id != '')
            ) 
            SELECT 
                order_month, 
                SUM(paid_amount) AS order_count 
            FROM 
                subsequent_orders 
            WHERE 
                order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
            GROUP BY 
                order_month 
            ORDER BY 
                order_month;
        `;
        let res1 = await sequelize_shop_tk.query(sql, {
            type: QueryTypes.SELECT
        });
        // 查询从2022-06-01 ~ 2024-09-01各个月的新用户订单数
        let sql2 = `
            SELECT 
                SUM(paid_amount) AS ct 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[i]} 00:00:00' AND created < '${dateArr[i + 1]} 00:00:00' 
                AND (shop_name LIKE '%有赞%') 
                AND (buyer_id IS NOT NULL AND buyer_id != '') 
                AND buyer_id NOT IN (
                    SELECT 
                        DISTINCT buyer_id 
                    FROM 
                        jst_order 
                    WHERE 
                        created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[i]} 00:00:00' 
                        AND (shop_name LIKE '%有赞%') 
                        AND (buyer_id IS NOT NULL AND buyer_id != '')
                );
        `;
        const res2 = await sequelize_shop_tk.query(sql2, {
            type: QueryTypes.SELECT
        });
        res1.unshift({ order_month: moment(dateArr[i]).format("YYYY-MM"), order_count: res2?.[0]?.ct ?? 0 })
        newUserOrderCountEveryMonth.push(res1);
    }
    // 查询起始时间的用户下单数（2022-05-01）
    let startDate_order_sql = `
        SELECT 
            SUM(paid_amount) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
            AND (shop_name LIKE '%有赞%') 
            AND (buyer_id IS NOT NULL AND buyer_id != '')
    `;
    const firstMonthOrderCount = await sequelize_shop_tk.query(startDate_order_sql, {
        type: QueryTypes.SELECT
    });
    console.log('起始时间的用户订单数统计 ===>>>', firstMonthOrderCount);
    // 查询起始时间的新用户在各个月产生的订单数（2022-06-01 ~ 2024-10-01）
    let startDate_next_order_sql = `
        WITH first_orders AS (  
            SELECT 
                buyer_id 
            FROM 
                jst_order 
            WHERE 
                created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[1]} 00:00:00' 
                AND (shop_name LIKE '%有赞%') 
                AND (buyer_id IS NOT NULL AND buyer_id != '') 
            GROUP BY 
                buyer_id
        ),
        subsequent_orders AS (
            SELECT 
                fo.buyer_id, o.created, o.paid_amount, DATE_FORMAT(o.created, '%Y-%m') AS order_month  
            FROM 
                first_orders fo 
            JOIN 
                jst_order o ON fo.buyer_id = o.buyer_id 
            WHERE 
                o.created >= '${dateArr[1]} 00:00:00' AND o.created < '${endDateNextMonth} 00:00:00' 
                AND (shop_name LIKE '%有赞%') 
                AND (o.buyer_id IS NOT NULL AND o.buyer_id != '')
        ) 
        SELECT 
            order_month,
            SUM(paid_amount) AS order_count 
        FROM 
            subsequent_orders 
        WHERE 
            order_month BETWEEN '${startDateNextMonth}' AND '${endDateMonth}' 
        GROUP BY 
            order_month 
        ORDER BY 
            order_month;
    `;
    let firstMonthOrderCountResults = await sequelize_shop_tk.query(startDate_next_order_sql, {
        type: QueryTypes.SELECT
    });
    console.log('起始时间的新用户在各个月产生的订单数 ===>>>', firstMonthOrderCountResults); //2022-06-01 ~ 2024-10-01
    // 结束时间的新用户订单数（2024-10-01）
    let endDate_order_sql = `
        SELECT 
            SUM(paid_amount) AS ct 
        FROM 
            jst_order 
        WHERE 
            created >= '${dateArr[dateArr.length - 1]} 00:00:00' AND created < '${endDateNextMonth} 00:00:00' 
            AND (shop_name LIKE '%有赞%') 
            AND (buyer_id IS NOT NULL AND buyer_id != '') 
            AND buyer_id NOT IN (
                SELECT 
                    DISTINCT buyer_id 
                FROM 
                    jst_order 
                WHERE 
                    created >= '${dateArr[0]} 00:00:00' AND created < '${dateArr[dateArr.length - 1]} 00:00:00' 
                    AND (shop_name LIKE '%有赞%') 
                    AND (buyer_id IS NOT NULL AND buyer_id != '')
            );
    `;
    let lastMonthOrderCountResults = await sequelize_shop_tk.query(endDate_order_sql, {
        type: QueryTypes.SELECT
    });
    console.log('结束时间的用户订单数统计 ===>>>', lastMonthOrderCountResults);
    firstMonthOrderCountResults.unshift({ order_month: moment(`${startDate}`).format("YYYY-MM"), order_count: firstMonthOrderCount?.[0]?.ct ?? 0 }); //补全第一条数据
    firstMonthOrderCountResults = [firstMonthOrderCountResults];
    lastMonthOrderCountResults = [[{ order_month: moment(`${endDate}`).format("YYYY-MM"), order_count: lastMonthOrderCountResults?.[0]?.ct ?? 0 }]]; //补全最后一条数据
    let result = firstMonthOrderCountResults.concat(newUserOrderCountEveryMonth).concat(lastMonthOrderCountResults);
    let finalResult = [];
    for (let i = 0; i < result.length; i++) {
        const data = result[i];
        const orderMonths = data.map(v => v.order_month);
        const dataMap = new Map();
        for (const item of data) {
            dataMap.set(item.order_month, item.order_count);
        }
        const res = {};
        for (let j = 0; j < dateArr.length; j++) {
            const date = moment(dateArr[j]).format("YYYY-MM"); // 2022-05 2022-06 2024-10
            if (!orderMonths.includes(date)) {
                res[date] = 0;
            } else {
                res[date] = dataMap.get(date);
            }
        }
        finalResult.push(res);
    }
    return {
        list: finalResult,
        dateRange: dateArr.map(v => moment(v).format("YYYY-MM"))
    }
}

module.exports = {
    addMtPhone, // 补全美团手机号字段
    mtOrderStatistic, // 美团订单统计
    mtOrderSaleStatistic, // 美团订单销售额统计
    jdOrderStatistic, // 京东订单统计
    jdOrderSaleStatistic, // 京东订单销售额统计
    yzOrderSaleStatistic, //有赞订单销售额统计
    mtOrderDetailStatistic, // 美团每月新用户复购订单明细
    jtOrderDetailStatistic, // 京东每月新用户复购订单明细
}
