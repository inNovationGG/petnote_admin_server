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