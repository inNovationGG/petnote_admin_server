const { sequelize_shop_tk } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const moment = require("moment");
const { isValidDateFormat } = require("../../utils/commonUtil");
const ExcelJS = require("exceljs");

class BrandController {
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
            //     brand: ['皮皮淘','蓝氏'], //品牌
            //     city: ['上海','北京'], //城市
            //     store: ['1001','1002'], //分仓
            //     channel: ["美团","饿了么","有赞小程序"], //销售渠道
            //     page: 1,
            //     pagesize: 10,
            //     sort: [{ field: 'price', order: 'DESC' }], //排序规则
            // }
            let { startTime, endTime, brand, city, store, channel, sort, page = 1, pagesize = 10 } = ctx.request.body || {};
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
            if (brand) {
                if (!Array.isArray(brand)) {
                    return ctx.body = { success: false, msg: "品牌参数格式不正确" }
                }
                if (brand.length) {
                    let brands = brand.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND brand IN (${brands})`;
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
                        brand: 'brand',
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
            // 按品牌、城市、分仓三个维度分组
            let brand_city_store_group_sql = `
                SELECT 
                    brand, -- 品牌
                    city, -- 城市
                    store_name AS store, -- 分仓
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
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    brand, city, store_name 
                ORDER BY 
                    ${orderCond}
            `;
            let paginate_sql = `${brand_city_store_group_sql} LIMIT ${skip}, ${currentPagesize}`;
            let total_sql = `SELECT COUNT(*) AS ct FROM (${brand_city_store_group_sql}) AS a`;
            // 按品牌、城市两个维度分组
            let brand_city_group_sql = `
                SELECT 
                    brand, -- 品牌
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
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    brand, city 
                ORDER BY 
                    ${orderCond}
            `;
            // 按品牌、城市两个维度分组
            let brand_group_sql = `
                SELECT 
                    brand, -- 品牌
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
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    brand 
                ORDER BY 
                    ${orderCond}
            `;
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
            let [brandCityStoreResult, totalNum, storeResult, cityResult] = await Promise.all([
                sequelize_shop_tk.query(paginate_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(total_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(store_group_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(city_group_sql, { type: QueryTypes.SELECT }),
            ]);
            if (!brandCityStoreResult || !Array.isArray(brandCityStoreResult) && !brandCityStoreResult.length) {
                return ctx.body = {
                    success: true,
                    data: {
                        listData: [],
                        ...formatPagination({ total: 0, page: currentPage, limit: currentPagesize, pages: 0 })
                    }
                }
            }
            let total = totalNum?.[0]?.ct ?? 0; //总数据量
            let pages = Math.ceil(total / currentPagesize); //总页数
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
            if (!city && !store) {
                // 城市选择全部，分仓选择全部（需要处理分页）
                let [brandResult] = await Promise.all([
                    sequelize_shop_tk.query(brand_group_sql, { type: QueryTypes.SELECT }),
                ]);
                for (const item of brandResult) {
                    listData.push({
                        brand: item.brand, //品牌
                        city: '全部', //城市
                        store: '全部', //分仓
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
                total = listData.length; //总数据量
                pages = Math.ceil(total / currentPagesize); //总页数
                listData = listData.slice(skip, skip + currentPagesize); //模拟分页
            } else if (city && !store) {
                // 分仓选择全部（需要处理分页）
                let [brandCityResult] = await Promise.all([
                    sequelize_shop_tk.query(brand_city_group_sql, { type: QueryTypes.SELECT }),
                ]);
                for (const item of brandCityResult) {
                    const storeTotalRevenue = cityMap.get(item.city).revenue;
                    const storeTotalProfit = cityMap.get(item.city).profit;
                    listData.push({
                        brand: item.brand, //品牌
                        city: item.city, //城市
                        store: '全部', //分仓
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
                total = listData.length; //总数据量
                pages = Math.ceil(total / currentPagesize); //总页数
                listData = listData.slice(skip, skip + currentPagesize); //模拟分页
            } else {
                // 明细数据（默认分页）
                for (const item of brandCityStoreResult) {
                    const storeTotalRevenue = storeMap.get(item.store).revenue;
                    const storeTotalProfit = storeMap.get(item.store).profit;
                    listData.push({
                        brand: item.brand, //品牌
                        city: item.city, //城市
                        store: item.store, //分仓
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

    async exportData(ctx) {
        try {
            let { startTime, endTime, brand, city, store, channel, sort } = ctx.request.body || {};
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            // 计算天数差
            const daysDiff = moment(endTime).diff(moment(startTime), 'days') + 1;
            let cond = `order_createtime BETWEEN '${startTime}' AND '${endTime}'`;
            if (brand) {
                if (!Array.isArray(brand)) {
                    return ctx.body = { success: false, msg: "品牌参数格式不正确" }
                }
                if (brand.length) {
                    let brands = brand.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND brand IN (${brands})`;
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
                        brand: 'brand',
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
            // 按品牌、城市、分仓三个维度分组
            let brand_city_store_group_sql = `
                SELECT 
                    brand, -- 品牌
                    city, -- 城市
                    store_name AS store, -- 分仓
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
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    brand, city, store_name 
                ORDER BY 
                    ${orderCond}
            `;
            // 按品牌、城市两个维度分组
            let brand_city_group_sql = `
                SELECT 
                    brand, -- 品牌
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
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    brand, city 
                ORDER BY 
                    ${orderCond}
            `;
            // 按品牌、城市两个维度分组
            let brand_group_sql = `
                SELECT 
                    brand, -- 品牌
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
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    brand 
                ORDER BY 
                    ${orderCond}
            `;
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
            let [brandCityStoreResult, storeResult, cityResult] = await Promise.all([
                sequelize_shop_tk.query(brand_city_store_group_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(store_group_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(city_group_sql, { type: QueryTypes.SELECT }),
            ]);
            if (!brandCityStoreResult || !Array.isArray(brandCityStoreResult) || !brandCityStoreResult.length) {
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
            for (const item of brandCityStoreResult) {
                const storeTotalRevenue = storeMap.get(item.store).revenue;
                const storeTotalProfit = storeMap.get(item.store).profit;
                listData.push({
                    brand: item.brand, // 品牌
                    city: item.city, //城市
                    store: item.store, //分仓
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
            let totalData = []; // 城市或者分仓选择全部时的导出数据
            if (!city && !store) {
                // 城市选择全部，分仓选择全部
                let [brandResult] = await Promise.all([
                    sequelize_shop_tk.query(brand_group_sql, { type: QueryTypes.SELECT }),
                ]);
                for (const item of brandResult) {
                    totalData.push({
                        brand: item.brand, // 品牌
                        city: '全部', //城市
                        store: '全部', //分仓
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        dailyOrderCount: Math.round(item.dailyOrderCount), //日均订单数
                        singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)) || '错误！！！', //件单价
                        totalRevenueRate: totalRevenue ? Number(((item.revenue / totalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                        totalProfitRate: totalProfit ? Number(((item.profit / totalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                    });
                }
            } else if (city && !store) {
                // 分仓选择全部
                let [brandCityResult] = await Promise.all([
                    sequelize_shop_tk.query(brand_city_group_sql, { type: QueryTypes.SELECT }),
                ]);
                for (const item of brandCityResult) {
                    const storeTotalRevenue = cityMap.get(item.city).revenue;
                    const storeTotalProfit = cityMap.get(item.city).profit;
                    totalData.push({
                        brand: item.brand, // 品牌
                        city: item.city, //城市
                        store: '全部', //分仓
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
            } else {
                totalData = listData;
            }
            let columns = [
                { header: '品牌', key: 'brand' },
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
                'Content-Disposition': `attachment; filename=${encodeURIComponent('品牌报表')}`
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

module.exports = BrandController
