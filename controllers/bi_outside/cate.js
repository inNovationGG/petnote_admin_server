const { sequelize_shop_tk } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const moment = require("moment");
const { isValidDateFormat } = require("../../utils/commonUtil");
const ExcelJS = require("exceljs");

class CateController {
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

    async getLists(ctx) {
        try {
            // { //参数
            //     startTime: "2024-01-01",
            //     endTime: "2024-02-02",
            //     fcate: ['10','20'], //一级品类数组
            //     scate: ['1001','1002'], //二级品类数组
            //     tcate: ['1001001','1001002'], //三级品类数组
            //     city: ['上海','北京'], //城市
            //     store: ['1001','1002'], //分仓
            //     channel: ["美团","饿了么","有赞小程序"], //销售渠道
            //     page: 1,
            //     pagesize: 10,
            //     sort: [{ field: 'price', order: 'DESC' }], //排序规则
            // }
            let { startTime, endTime, fcate, scate, tcate, city, store, channel, sort, page = 1, pagesize = 10 } = ctx.request.body || {};
            const currentPage = parseInt(page, 10);
            const currentPagesize = parseInt(pagesize, 10);
            const skip = (currentPage - 1) * currentPagesize;
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            // 计算天数差
            const daysDiff = moment(endTime).diff(moment(startTime), 'days') + 1;
            let cond = `order_createtime BETWEEN '${startTime}' AND '${endTime}'`;
            if (fcate) {
                if (!Array.isArray(fcate)) {
                    return ctx.body = { success: false, msg: "一级品类参数格式不正确" }
                }
                if (fcate.length) {
                    let fcates = fcate.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND f_cate_id IN (${fcates})`;
                }
            }
            if (scate) {
                if (!Array.isArray(scate)) {
                    return ctx.body = { success: false, msg: "二级品类参数格式不正确" }
                }
                if (scate.length) {
                    let scates = scate.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND s_cate_id IN (${scates})`;
                }
            }
            if (tcate) {
                if (!Array.isArray(tcate)) {
                    return ctx.body = { success: false, msg: "三级品类参数格式不正确" }
                }
                if (tcate.length) {
                    let tcates = tcate.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND t_cate_id IN (${tcates})`;
                }
            }
            if (city) {
                if (!Array.isArray(city)) {
                    return ctx.body = { success: false, msg: "城市参数格式不正确" }
                }
                if (city.length) {
                    let citys = city.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND city IN (${citys})`;
                }
            }
            if (store) {
                if (!Array.isArray(store)) {
                    return ctx.body = { success: false, msg: "分仓参数格式不正确" }
                }
                if (store.length) {
                    let stores = store.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND store_id IN (${stores})`;
                }
            }
            if (channel) {
                if (!Array.isArray(channel)) {
                    return ctx.body = { success: false, msg: "销售渠道参数格式不正确" }
                }
                if (channel.length) {
                    let channels = channel.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND channel IN (${channels})`;
                }
            }
            let orderCond = ` price DESC`;
            if (sort) {
                if (!Array.isArray(sort)) {
                    return ctx.body = { success: false, msg: "排序参数格式不正确" }
                }
                if (sort.length) {
                    const { field, order } = sort[0];
                    const fields = {
                        fcateName: 'f_cate_name',
                        scateName: 's_cate_name',
                        tcateName: 't_cate_name',
                        city: 'city',
                        store: 'store_name',
                        price: 'price',
                        revenue: 'revenue',
                        cost: 'cost',
                        profit: 'profit',
                        goodsCount: 'goodsCount',
                        profitRate: 'profitRate',
                        orderCount: 'orderCount',
                        dailyOrderCount: 'dailyOrderCount',
                        singleGoodsPrice: 'singleGoodsPrice'
                    };
                    if (!field || !order || !fields[field] || !['DESC', 'desc', 'ASC', 'asc'].includes(order)) {
                        return ctx.body = { success: false, msg: "排序参数不正确" }
                    }
                    orderCond = ` ${fields[field]} ${order}`;
                }
            }
            const baseField = `
                SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) AS price, -- 实收(含税_含5%)
                SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                SUM(total_cost) AS cost, -- 成本(未税)
                (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit, -- 毛利额
                SUM(audit_output_count) AS goodsCount, -- 件数
                ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END)) AS profitRate, -- 毛利率
                COUNT(DISTINCT platform_order_id) AS orderCount, -- 订单数
                COUNT(DISTINCT platform_order_id) / ${daysDiff} AS dailyOrderCount, -- 日均订单数
                (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价
            `;
            const groupByField = this.handleGroupByField({ scate, tcate, city, store });
            const sql = await this.handleSql({
                cond,
                orderCond,
                groupByField,
                baseField
            });
            let paginate_sql = `${sql} LIMIT ${skip}, ${currentPagesize}`;
            let total_sql = `SELECT COUNT(*) AS ct FROM (${sql}) AS a`;
            // 按分仓分组
            let store_group_sql = `
                SELECT 
                    store_name AS store, -- 分仓
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit -- 毛利额  
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    store_name 
            `;
            // 按城市分组
            let city_group_sql = `
                SELECT 
                    city, -- 城市
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit -- 毛利额  
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    city 
            `;
            let [result, totalNum, storeResult, cityResult] = await Promise.all([
                sequelize_shop_tk.query(paginate_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(total_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(store_group_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(city_group_sql, { type: QueryTypes.SELECT }),
            ]);
            if (!result || !Array.isArray(result) && !result.length) {
                return ctx.body = {
                    success: true,
                    data: {
                        listData: [],
                        ...formatPagination({ total: 0, page: currentPage, limit: currentPagesize, pages: 0 })
                    }
                }
            }
            const total = totalNum?.[0]?.ct ?? 0; //总数据量
            const pages = Math.ceil(total / currentPagesize); //总页数
            const storeMap = new Map();
            const cityMap = new Map();
            let totalProfit = 0; // 所有城市总profit
            let totalRevenue = 0; // 所有城市总revenue
            if (storeResult && Array.isArray(storeResult) && storeResult.length) {
                for (const item of storeResult) {
                    const { store, revenue, profit } = item;
                    storeMap.set(store, { revenue, profit });
                }
            }
            if (cityResult && Array.isArray(cityResult) && cityResult.length) {
                for (const item of cityResult) {
                    const { city, revenue, profit } = item;
                    cityMap.set(city, { revenue, profit });
                    totalProfit += profit;
                    totalRevenue += revenue;
                }
            }
            let listData = [];
            const resultKeys = Object.keys(result[0]);
            if (resultKeys.includes("store_name")) {
                //分仓不为全部
                for (const item of result) {
                    const storeTotalRevenue = storeMap.get(item.store_name).revenue;
                    const storeTotalProfit = storeMap.get(item.store_name).profit;
                    listData.push({
                        fcateName: item.f_cate_name, //一级品类
                        scateName: resultKeys.includes("s_cate_name") ? item.s_cate_name : "全部", //二级品类
                        tcateName: resultKeys.includes("t_cate_name") ? item.t_cate_name : "全部", //三级品类
                        city: resultKeys.includes("city") ? item.city : "全部", //城市
                        store: item.store_name, //分仓
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        dailyOrderCount: Math.round(item.dailyOrderCount), //日均订单数
                        singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)), //件单价
                        totalRevenueRate: storeTotalRevenue ? Number(((item.revenue / storeTotalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                        totalProfitRate: storeTotalProfit ? Number(((item.profit / storeTotalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                    });
                }
            } else if (resultKeys.includes("city")) {
                //城市不为全部
                for (const item of result) {
                    const storeTotalRevenue = cityMap.get(item.city).revenue;
                    const storeTotalProfit = cityMap.get(item.city).profit;
                    listData.push({
                        fcateName: item.f_cate_name, //一级品类
                        scateName: resultKeys.includes("s_cate_name") ? item.s_cate_name : "全部", //二级品类
                        tcateName: resultKeys.includes("t_cate_name") ? item.t_cate_name : "全部", //三级品类
                        city: item.city, //城市
                        store: resultKeys.includes("store_name") ? item.store_name : "全部", //分仓
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        dailyOrderCount: Math.round(item.dailyOrderCount), //日均订单数
                        singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)), //件单价
                        totalRevenueRate: storeTotalRevenue ? Number(((item.revenue / storeTotalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                        totalProfitRate: storeTotalProfit ? Number(((item.profit / storeTotalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                    });
                }
            } else {
                // 城市、分仓都为全部
                for (const item of result) {
                    listData.push({
                        fcateName: item.f_cate_name, //一级品类
                        scateName: resultKeys.includes("s_cate_name") ? item.s_cate_name : "全部", //二级品类
                        tcateName: resultKeys.includes("t_cate_name") ? item.t_cate_name : "全部", //三级品类
                        city: "全部", //城市
                        store: "全部", //分仓
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        dailyOrderCount: Math.round(item.dailyOrderCount), //日均订单数
                        singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)), //件单价
                        totalRevenueRate: totalRevenue ? Number(((item.revenue / totalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                        totalProfitRate: totalProfit ? Number(((item.profit / totalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                    });
                }
            }
            ctx.body = {
                success: true,
                data: {
                    listData: listData,
                    ...formatPagination({ total: total, page: currentPage, limit: currentPagesize, pages: pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    //组装SQL的分组参数
    handleGroupByField(param) {
        try {
            let { scate, tcate, city, store } = param || {};
            let groupByField = `f_cate_name`; //默认按照一级品类分组
            if (scate) {
                groupByField += `,s_cate_name`;
            }
            if (tcate) {
                groupByField += `,t_cate_name`;
            }
            if (city) {
                groupByField += `,city`;
            }
            if (store) {
                groupByField += `,store_name`;
            }
            return groupByField;
        } catch (error) {
            console.log(error);
        }
    }

    //组装SQL
    async handleSql(param) {
        try {
            const { cond, orderCond, groupByField, baseField } = param || {};
            const sql = `
                SELECT 
                    ${groupByField}, ${baseField} 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    ${groupByField} 
                ORDER BY 
                    ${orderCond}
            `;
            return sql;
        } catch (error) {
            console.log(error);
        }
    }

    async exportData(ctx) {
        try {
            let { startTime, endTime, fcate, scate, tcate, city, store, channel, sort } = ctx.request.body || {};
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            // 计算天数差
            const daysDiff = moment(endTime).diff(moment(startTime), 'days') + 1;
            let cond = `order_createtime BETWEEN '${startTime}' AND '${endTime}'`;
            if (fcate) {
                if (!Array.isArray(fcate)) {
                    return ctx.body = { success: false, msg: "一级品类参数格式不正确" }
                }
                if (fcate.length) {
                    let fcates = fcate.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND f_cate_id IN (${fcates})`;
                }
            }
            if (scate) {
                if (!Array.isArray(scate)) {
                    return ctx.body = { success: false, msg: "二级品类参数格式不正确" }
                }
                if (scate.length) {
                    let scates = scate.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND s_cate_id IN (${scates})`;
                }
            }
            if (tcate) {
                if (!Array.isArray(tcate)) {
                    return ctx.body = { success: false, msg: "三级品类参数格式不正确" }
                }
                if (tcate.length) {
                    let tcates = tcate.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND t_cate_id IN (${tcates})`;
                }
            }
            if (city) {
                if (!Array.isArray(city)) {
                    return ctx.body = { success: false, msg: "城市参数格式不正确" }
                }
                if (city.length) {
                    let citys = city.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND city IN (${citys})`;
                }
            }
            if (store) {
                if (!Array.isArray(store)) {
                    return ctx.body = { success: false, msg: "分仓参数格式不正确" }
                }
                if (store.length) {
                    let stores = store.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND store_id IN (${stores})`;
                }
            }
            if (channel) {
                if (!Array.isArray(channel)) {
                    return ctx.body = { success: false, msg: "销售渠道参数格式不正确" }
                }
                if (channel.length) {
                    let channels = channel.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND channel IN (${channels})`;
                }
            }
            let orderCond = ` price DESC`;
            if (sort) {
                if (!Array.isArray(sort)) {
                    return ctx.body = { success: false, msg: "排序参数格式不正确" }
                }
                if (sort.length) {
                    const { field, order } = sort[0];
                    const fields = {
                        fcateName: 'f_cate_name',
                        scateName: 's_cate_name',
                        tcateName: 't_cate_name',
                        city: 'city',
                        store: 'store_name',
                        price: 'price',
                        revenue: 'revenue',
                        cost: 'cost',
                        profit: 'profit',
                        goodsCount: 'goodsCount',
                        profitRate: 'profitRate',
                        orderCount: 'orderCount',
                        dailyOrderCount: 'dailyOrderCount',
                        singleGoodsPrice: 'singleGoodsPrice'
                    };
                    if (!field || !order || !fields[field] || !['DESC', 'desc', 'ASC', 'asc'].includes(order)) {
                        return ctx.body = { success: false, msg: "排序参数不正确" }
                    }
                    orderCond = ` ${fields[field]} ${order}`;
                }
            }
            const baseField = `
                SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) AS price, -- 实收(含税_含5%)
                SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                SUM(total_cost) AS cost, -- 成本(未税)
                (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit, -- 毛利额
                SUM(audit_output_count) AS goodsCount, -- 件数
                ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END)) AS profitRate, -- 毛利率
                COUNT(DISTINCT platform_order_id) AS orderCount, -- 订单数
                COUNT(DISTINCT platform_order_id) / ${daysDiff} AS dailyOrderCount, -- 日均订单数
                (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价
            `;
            // 按一级品类、二级品类、三级品类、城市、分仓五个维度分组
            let fcate_scate_tcate_city_store_group_sql = `
                SELECT 
                    f_cate_name, -- 一级品类
                    s_cate_name, -- 二级品类
                    t_cate_name, -- 三级品类
                    city, -- 城市
                    store_name, -- 分仓
                    ${baseField} 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    f_cate_name, s_cate_name, t_cate_name, city, store_name 
                ORDER BY 
                    price DESC 
            `;
            const groupByField = this.handleGroupByField({ scate, tcate, city, store });
            const sql = await this.handleSql({
                cond,
                orderCond,
                groupByField,
                baseField
            });
            // 按分仓分组
            let store_group_sql = `
                SELECT 
                    store_name AS store, -- 分仓
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit -- 毛利额  
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    store_name 
            `;
            // 按城市分组
            let city_group_sql = `
                SELECT 
                    city, -- 城市
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit -- 毛利额  
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    city 
            `;
            let [result, totalResult, storeResult, cityResult] = await Promise.all([
                sequelize_shop_tk.query(fcate_scate_tcate_city_store_group_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(store_group_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(city_group_sql, { type: QueryTypes.SELECT }),
            ]);
            if (!result || !Array.isArray(result) || !result.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const storeMap = new Map();
            const cityMap = new Map();
            let totalProfit = 0; // 所有城市总profit
            let totalRevenue = 0; // 所有城市总revenue
            if (storeResult && Array.isArray(storeResult) && storeResult.length) {
                for (const item of storeResult) {
                    const { store, revenue, profit } = item;
                    storeMap.set(store, { revenue, profit });
                }
            }
            if (cityResult && Array.isArray(cityResult) && cityResult.length) {
                for (const item of cityResult) {
                    const { city, revenue, profit } = item;
                    cityMap.set(city, { revenue, profit });
                    totalProfit += profit;
                    totalRevenue += revenue;
                }
            }
            let listData = [];
            for (const item of result) {
                const storeTotalRevenue = storeMap.get(item.store_name).revenue;
                const storeTotalProfit = storeMap.get(item.store_name).profit;
                listData.push({
                    fcateName: item.f_cate_name, //一级品类
                    scateName: item.s_cate_name, //二级品类
                    tcateName: item.t_cate_name, //三级品类
                    city: item.city, //城市
                    store: item.store_name, //分仓
                    price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                    revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                    cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                    profit: Number((item.profit || 0).toFixed(2)), //毛利额
                    goodsCount: item.goodsCount, //件数
                    profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                    orderCount: item.orderCount, //订单数
                    dailyOrderCount: Math.round(item.dailyOrderCount), //日均订单数
                    singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)) || '错误！！！', //件单价
                    totalRevenueRate: storeTotalRevenue ? Number(((item.revenue / storeTotalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                    totalProfitRate: storeTotalProfit ? Number(((item.profit / storeTotalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                });
            }
            let totalData = [];
            const resultKeys = Object.keys(totalResult[0]);
            if (resultKeys.includes("store_name")) {
                //分仓不为全部
                for (const item of totalResult) {
                    const storeTotalRevenue = storeMap.get(item.store_name).revenue;
                    const storeTotalProfit = storeMap.get(item.store_name).profit;
                    totalData.push({
                        fcateName: item.f_cate_name, //一级品类
                        scateName: resultKeys.includes("s_cate_name") ? item.s_cate_name : "全部", //二级品类
                        tcateName: resultKeys.includes("t_cate_name") ? item.t_cate_name : "全部", //三级品类
                        city: resultKeys.includes("city") ? item.city : "全部", //城市
                        store: item.store_name, //分仓
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        dailyOrderCount: Math.round(item.dailyOrderCount), //日均订单数
                        singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)), //件单价
                        totalRevenueRate: storeTotalRevenue ? Number(((item.revenue / storeTotalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                        totalProfitRate: storeTotalProfit ? Number(((item.profit / storeTotalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                    });
                }
            } else if (resultKeys.includes("city")) {
                //城市不为全部
                for (const item of totalResult) {
                    const storeTotalRevenue = cityMap.get(item.city).revenue;
                    const storeTotalProfit = cityMap.get(item.city).profit;
                    totalData.push({
                        fcateName: item.f_cate_name, //一级品类
                        scateName: resultKeys.includes("s_cate_name") ? item.s_cate_name : "全部", //二级品类
                        tcateName: resultKeys.includes("t_cate_name") ? item.t_cate_name : "全部", //三级品类
                        city: item.city, //城市
                        store: resultKeys.includes("store_name") ? item.store_name : "全部", //分仓
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        dailyOrderCount: Math.round(item.dailyOrderCount), //日均订单数
                        singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)), //件单价
                        totalRevenueRate: storeTotalRevenue ? Number(((item.revenue / storeTotalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                        totalProfitRate: storeTotalProfit ? Number(((item.profit / storeTotalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                    });
                }
            } else {
                // 城市、分仓都为全部
                for (const item of totalResult) {
                    totalData.push({
                        fcateName: item.f_cate_name, //一级品类
                        scateName: resultKeys.includes("s_cate_name") ? item.s_cate_name : "全部", //二级品类
                        tcateName: resultKeys.includes("t_cate_name") ? item.t_cate_name : "全部", //三级品类
                        city: "全部", //城市
                        store: "全部", //分仓
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        dailyOrderCount: Math.round(item.dailyOrderCount), //日均订单数
                        singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)), //件单价
                        totalRevenueRate: totalRevenue ? Number(((item.revenue / totalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                        totalProfitRate: totalProfit ? Number(((item.profit / totalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                    });
                }
            }
            let columns = [
                { header: '一级品类', key: 'fcateName' },
                { header: '二级品类', key: 'scateName' },
                { header: '三级品类', key: 'tcateName' },
                { header: '城市', key: 'city' },
                { header: '分仓', key: 'store' },
                { header: '实收(含税_含5%)', key: 'price' },
                { header: 'Revenue(未税_含5%)', key: 'revenue' },
                { header: '成本(未税)', key: 'cost' },
                { header: '毛利额', key: 'profit' },
                { header: '件数', key: 'goodsCount' },
                { header: '毛利率', key: 'profitRate' },
                { header: '订单数', key: 'orderCount' },
                { header: '日均订单数', key: 'dailyOrderCount' },
                { header: '件单价', key: 'singleGoodsPrice' },
                { header: 'Revenue-占比', key: 'totalRevenueRate' },
                { header: '毛利额-占比', key: 'totalProfitRate' }
            ];
            if (!listData.length || !totalData.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('全部');
            worksheet.columns = columns.map(col => ({
                header: col.header,
                key: col.key,
            }));
            totalData.forEach(row => {
                worksheet.addRow(row);
            });
            const worksheet2 = workbook.addWorksheet('明细');
            worksheet2.columns = columns.map(col => ({
                header: col.header,
                key: col.key,
            }));
            listData.forEach(row => {
                worksheet2.addRow(row);
            });
            // 将工作簿写入到内存中  
            const buffer = await workbook.xlsx.writeBuffer();
            ctx.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=${encodeURIComponent('分品类报表')}`
            });
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = CateController
