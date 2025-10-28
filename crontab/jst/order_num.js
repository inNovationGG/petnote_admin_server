const {
    sequelize_shop_tk,
    JstOrderNum
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const Decimal = require('decimal.js');

//统计昨天的小程序销售报表数据（不区分分仓），并添加到jst_order_num表中
async function addJstOrderNumToDatabase() {
    console.log('Begin Run jst_order_num Schedule Job');
    try {
        const list = [];
        let base_sql = `
            SELECT  
                DATE(o.created) AS created,
                t.channel AS channel,
                CASE 
                    WHEN o.labels LIKE '%自提%' THEN '自提订单' 
                    ELSE '外卖订单' 
                END AS orderType, 
                COUNT(DISTINCT o.so_id) AS orderCount,
                SUM(CAST(o.paid_amount AS DECIMAL(10, 2))) AS saleAmount,
                SUM(t.cost_with_tax) AS totalCost 
            FROM 
                jst_order o 
            INNER JOIN 
                (
                    SELECT 
                        platform_order_id, 
                        channel, 
                        SUM(CAST(total_cost_with_tax AS DECIMAL(10, 2))) AS cost_with_tax 
                    FROM 
                        tax 
                    GROUP BY 
                        platform_order_id, channel
                ) AS t 
            ON 
                o.so_id = t.platform_order_id 
            WHERE 
                o.status NOT IN ('Delete', 'Cancelled') 
            GROUP BY 
                DATE(o.created),
                t.channel,
                orderType 
            ORDER BY 
                created,
                t.channel,
                orderType`;
        const result = await sequelize_shop_tk.query(base_sql, {
            type: QueryTypes.SELECT
        });
        if (result && result.length) {
            for (const item of result) {
                const { created, channel, orderType, orderCount, saleAmount, totalCost } = item;
                // Decimal不接受null和undefined
                if (saleAmount == null || totalCost == null) continue;
                const _saleAmount = new Decimal(saleAmount);
                const _totalCost = new Decimal(totalCost);
                // 计算毛利率
                const rate = ((_saleAmount.minus(_totalCost)).div(_saleAmount)).times(100).toFixed(2);
                list.push({
                    created: created, //日期
                    channel: channel, //渠道
                    order_type: orderType, //订单类型
                    order_count: orderCount, //订单数
                    sale_amount: saleAmount, //实收
                    total_cost: totalCost, //商品成本（含税）
                    rate: rate + "%", //毛利率
                });
            }
            await JstOrderNum.destroy({
                truncate: true
            });
            await JstOrderNum.bulkCreate(list);
        }
    } catch (error) {
        console.log('addDataToDatabase Error ===>>>', error);
    }
    console.log('End Run jst_order_num Schedule Job');
}

module.exports = {
    addJstOrderNumToDatabase
}
