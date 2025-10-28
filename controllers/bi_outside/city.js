const { sequelize_shop_tk } = require("../../models");
const { QueryTypes } = require("sequelize");
const moment = require("moment");
const {
    CITY_TYPE,
    CITY_TYPE_MAP,
    PROFIT_COMES_FIRST,
    GROW_COMES_FIRST,
    PROFIT_COMES_FIRST_DESCRIPTION,
    GROW_COMES_FIRST_DESCRIPTION
} = require("../../constants/bi_outside");
const excelUtils = require("../../utils/excelUtil");
const { isValidDateFormat } = require("../../utils/commonUtil");

class CityController {
    //工厂方法，用于创建中间件
    createMiddleware(methodName) {
        if (!this[methodName]) {
            throw new Error(`Method ${methodName} does not exist.`);
        }
        //返回一个中间件函数
        return async (ctx, next) => {
            //直接调用类方法，并将ctx作为参数传递
            await this[methodName].call(this, ctx);
            //继续执行下一个中间件
            await next();
        };
    }

    //获取城市分类
    async getCityType(ctx) {
        try {
            ctx.body = {
                success: true,
                data: CITY_TYPE
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getCityStatistic(param) {
        try {
            let { startTime, endTime, cityType, channel } = param || {};
            if (!startTime || !endTime) {
                return { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            // 计算天数差
            const daysDiff = moment(endTime).diff(moment(startTime), 'days') + 1;
            let cond = `order_createtime BETWEEN '${startTime}' AND '${endTime}'`;
            if (cityType) {
                if (![1, 2].includes(cityType)) {
                    return { success: false, msg: "城市类型传参不正确" }
                }
                const cityList = CITY_TYPE_MAP?.get(cityType)?.city || [];
                if (!cityList.length) {
                    return { success: false, msg: "城市类型配置异常" }
                }
                let citys = cityList.map((item) => `'${item}'`).join(",") || null;
                cond += ` AND city IN (${citys})`;
            }
            if (channel) {
                if (!Array.isArray(channel)) {
                    return { success: false, msg: "销售渠道参数格式不正确" }
                }
                if (channel.length) {
                    let channels = channel.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND channel IN (${channels})`;
                }
            }
            // 按城市分组
            let city_group_sql = `
                SELECT 
                    city, -- 城市
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) AS price, -- 实收(含税_含5%)
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit, -- 毛利额
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END)) AS profitRate, -- 毛利率
                    COUNT(DISTINCT platform_order_id) AS orderCount, -- 订单数
                    COUNT(DISTINCT platform_order_id) / ${daysDiff} AS dailyOrderCount, -- 日均订单数
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / COUNT(DISTINCT platform_order_id)) AS singleOrderPrice, -- 客单价 
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) / 
                    COUNT(DISTINCT platform_order_id)) AS singleOrderProfit, -- 单均利润 
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice, -- 件单价 
                    COUNT(DISTINCT store_id) AS storeCount -- 分仓数 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    city 
                ORDER BY 
                    price DESC 
            `;
            let [baseResult] = await Promise.all([
                sequelize_shop_tk.query(city_group_sql, { type: QueryTypes.SELECT }),
            ]);
            let totalPrice = 0; // 所有城市的实收(含税_含5%)之和
            let totalCost = 0; // 所有城市的成本(未税)之和
            let totalGoodsCount = 0; // 所有城市的商品件数
            let totalOrderCount = 0; // 所有城市的订单数
            let totalRevenue = 0; // 所有城市的revenue(未税_含5%)之和，用来计算Revenue-占比
            let totalProfit = 0; // 所有城市的profit之和，用来计算毛利额-占比
            let totalStoreCount = 0; // 所有城市总仓数
            if (!baseResult || !Array.isArray(baseResult) || !baseResult.length) {
                return {
                    success: true,
                    data: {
                        listData: [],
                        totalData: {},
                    }
                }
            }
            for (const item of baseResult) {
                totalPrice += item.price; //总实收(含税_含5%)
                totalRevenue += item.revenue; //总Revenue(未税_含5%)
                totalCost += item.cost; //总成本(未税)
                totalProfit += (item.revenue - item.cost); //总毛利额
                totalGoodsCount += item.goodsCount; //总件数
                totalOrderCount += item.orderCount; //总订单数
                totalStoreCount += item.storeCount; //总仓数
            }
            const listData = [];
            for (const item of baseResult) {
                const totalRevenueRate = totalRevenue ? Number(((item.revenue / totalRevenue) || 0).toFixed(4)) : 0;
                const totalProfitRate = totalProfit ? Number(((item.profit / totalProfit) || 0).toFixed(4)) : 0;
                listData.push({
                    city: item.city, //城市
                    price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                    revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                    cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                    profit: Number((item.profit || 0).toFixed(2)), //毛利额
                    goodsCount: item.goodsCount, //件数
                    profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                    orderCount: item.orderCount, //订单数
                    dailyOrderCount: Math.round(item.dailyOrderCount), //日均订单数
                    singleOrderPrice: Number((item.singleOrderPrice || 0).toFixed(2)), //客单价
                    singleOrderProfit: Number((item.singleOrderProfit || 0).toFixed(2)), //单均利润
                    singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)), //件单价
                    totalRevenueRate: totalRevenueRate, //Revenue-占比
                    totalProfitRate: totalProfitRate, //毛利额-占比
                    storeCount: item.storeCount //分仓数
                });
            }
            const totalData = {
                price: Number((totalPrice || 0).toFixed(2)), //实收(含税_含5%)
                revenue: Number((totalRevenue || 0).toFixed(2)), //Revenue(未税_含5%)
                cost: Number((totalCost || 0).toFixed(2)), //成本(未税)
                profit: Number((totalProfit || 0).toFixed(2)), //毛利额
                goodsCount: totalGoodsCount, //件数
                profitRate: totalRevenue ? Number((((totalRevenue - totalCost) / totalRevenue) || 0).toFixed(4)) : 0, //毛利率
                orderCount: totalOrderCount, //订单数
                dailyOrderCount: Math.round(totalOrderCount / daysDiff), //日均订单数
                singleOrderPrice: totalOrderCount ? Number(((totalPrice / totalOrderCount) || 0).toFixed(2)) : 0, //客单价
                singleOrderProfit: totalOrderCount ? Number(((totalProfit / totalOrderCount) || 0).toFixed(2)) : 0, //单均利润
                singleGoodsPrice: totalGoodsCount ? Number(((totalPrice / totalGoodsCount) || 0).toFixed(2)) : 0, //件单价
                totalRevenueRate: listData.reduce((sum, item) => sum + item.totalRevenueRate, 0), //Revenue-占比
                totalProfitRate: listData.reduce((sum, item) => sum + item.totalProfitRate, 0), //毛利额-占比
                storeCount: totalStoreCount //分仓数
            }
            return {
                success: true,
                data: {
                    listData: listData,
                    totalData: totalData,
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    // 查询城市报表
    async getLists(ctx) {
        try {
            // { //参数
            //     startTime: "2024-01-01",
            //     endTime: "2024-02-02",
            //     cityType: 1, //1-毛利优先，增长次之,2-增长优先，毛利次之
            //     channel: ["美团","饿了么","有赞小程序"]
            // }
            let { startTime, endTime, cityType, channel } = ctx.request.body || {};
            const res = await this.getCityStatistic({ startTime, endTime, cityType, channel });
            ctx.body = res;
        } catch (error) {
            console.log(error);
        }
    }

    async exportData(ctx) {
        try {
            let { startTime, endTime, cityType, channel } = ctx.request.body || {};
            const res = await this.getCityStatistic({ startTime, endTime, cityType, channel });
            if (!res.success) {
                return ctx.body = res;
            }
            if (res.success) {
                if (!res?.data?.listData?.length) {
                    return ctx.body = { success: false, msg: "没有数据可导出" }
                }
                let listData = res.data.listData;
                let totalData = {
                    city: '总计',
                    ...(res?.data?.totalData || {})
                }
                let list = listData.concat([totalData]);
                for (const item of list) {
                    if (PROFIT_COMES_FIRST.includes(item.city)) {
                        item.cityType = PROFIT_COMES_FIRST_DESCRIPTION;
                    } else if (GROW_COMES_FIRST.includes(item.city)) {
                        item.cityType = GROW_COMES_FIRST_DESCRIPTION;
                    } else {
                        item.cityType = '';
                    }
                }
                let columns = [
                    { header: '城市类型', key: 'cityType' },
                    { header: '城市', key: 'city' },
                    { header: '实收(含税_含5%)', key: 'price' },
                    { header: 'Revenue(未税_含5%)', key: 'revenue' },
                    { header: '成本(未税)', key: 'cost' },
                    { header: '毛利额', key: 'profit' },
                    { header: '件数', key: 'goodsCount' },
                    { header: '毛利率', key: 'profitRate' },
                    { header: '订单数', key: 'orderCount' },
                    { header: '日均订单数', key: 'dailyOrderCount' },
                    { header: '客单价', key: 'singleOrderPrice' },
                    { header: '单均利润', key: 'singleOrderProfit' },
                    { header: '件单价', key: 'singleGoodsPrice' },
                    { header: 'Revenue-占比', key: 'totalRevenueRate' },
                    { header: '毛利额-占比', key: 'totalProfitRate' },
                    { header: '分仓数', key: 'storeCount' }
                ];
                if (!list.length) {
                    return ctx.body = { success: false, msg: "没有数据可导出" }
                }
                const { buffer, headers } = await excelUtils.exportExcel(list, columns, "城市报表");
                ctx.set(headers);
                ctx.body = {
                    success: true,
                    data: buffer
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = CityController
