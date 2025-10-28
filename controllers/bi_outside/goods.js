const { sequelize_shop_tk } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const { isValidDateFormat } = require("../../utils/commonUtil");
const ExcelJS = require("exceljs");

class GoodsController {
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
            //     skuId: ['10','11'], //商品编号数组
            //     skuName: ['猫粮ABC','猫砂XYZ'], //商品名称数组
            //     city: ['上海','北京'], //城市
            //     store: ['1001','1002'], //分仓
            //     channel: ["美团","饿了么","有赞小程序"], //销售渠道
            //     page: 1,
            //     pagesize: 10,
            //     sort: [{ field: 'price', order: 'DESC' }], //排序规则
            // }
            let { startTime, endTime, skuId, skuName, city, store, channel, sort, page = 1, pagesize = 10 } = ctx.request.body || {};
            const currentPage = parseInt(page, 10);
            const currentPagesize = parseInt(pagesize, 10);
            const skip = (currentPage - 1) * currentPagesize;
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            let cond = `order_createtime BETWEEN '${startTime}' AND '${endTime}'`;
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
            if (skuId) {
                if (!Array.isArray(skuId)) {
                    return ctx.body = { success: false, msg: "商品编号参数格式不正确" }
                }
                if (skuId.length) {
                    let skuId_cond = `(`;
                    for (let i = 0; i < skuId.length; i++) {
                        if (i < skuId.length - 1) {
                            skuId_cond += ` goods_id LIKE '%${skuId[i]}%' OR`;
                            continue;
                        }
                        skuId_cond += ` goods_id LIKE '%${skuId[i]}%' )`;
                    }
                    cond += ` AND ${skuId_cond}`;
                }
            }
            if (skuName) {
                if (!Array.isArray(skuName)) {
                    return ctx.body = { success: false, msg: "商品名称参数格式不正确" }
                }
                if (skuName.length) {
                    let skuName_cond = `(`;
                    for (let i = 0; i < skuName.length; i++) {
                        if (i < skuName.length - 1) {
                            skuName_cond += ` goods_name LIKE '%${skuName[i]}%' OR`;
                            continue;
                        }
                        skuName_cond += ` goods_name LIKE '%${skuName[i]}%' )`;
                    }
                    cond += ` AND ${skuName_cond}`;
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
                        skuId: 'goods_id',
                        skuName: 'goods_name',
                        city: 'city',
                        store: 'store_name',
                        price: 'price',
                        revenue: 'revenue',
                        cost: 'cost',
                        profit: 'profit',
                        goodsCount: 'goodsCount',
                        profitRate: 'profitRate',
                        orderCount: 'orderCount',
                        singleOrderProfit: 'singleOrderProfit',
                        singleGoodsPrice: 'singleGoodsPrice'
                    };
                    if (!field || !order || !fields[field] || !['DESC', 'desc', 'ASC', 'asc'].includes(order)) {
                        return ctx.body = { success: false, msg: "排序参数不正确" }
                    }
                    orderCond = ` ${fields[field]} ${order}`;
                }
            }
            // 按商品id，商品名称，城市，分仓四个维度分组
            let goods_city_store_group_sql = `
                SELECT 
                    goods_id AS skuId, -- 商品编号
                    goods_name AS skuName, -- 商品名称
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
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    COUNT(DISTINCT platform_order_id)) AS singleOrderProfit, -- 单均利润
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    goods_id, goods_name, city, store_name 
                ORDER BY 
                    ${orderCond}
            `;
            let paginate_sql = `${goods_city_store_group_sql} LIMIT ${skip}, ${currentPagesize}`;
            let total_sql = `SELECT COUNT(*) AS ct FROM (${goods_city_store_group_sql}) AS a`;
            // 按商品id，商品名称，城市三个维度分组
            let goods_city_group_sql = `
                SELECT 
                    goods_id AS skuId, -- 商品编号
                    goods_name AS skuName, -- 商品名称
                    city, -- 城市
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) AS price, -- 实收(含税_含5%)
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit, -- 毛利额
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END)) AS profitRate, -- 毛利率
                    COUNT(DISTINCT platform_order_id) AS orderCount, -- 订单数
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    COUNT(DISTINCT platform_order_id)) AS singleOrderProfit, -- 单均利润
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    goods_id, goods_name, city 
                ORDER BY 
                    ${orderCond}
            `;
            // 按商品id，商品名称两个维度分组
            let goods_group_sql = `
                SELECT 
                    goods_id AS skuId, -- 商品编号
                    goods_name AS skuName, -- 商品名称
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) AS price, -- 实收(含税_含5%)
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit, -- 毛利额
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END)) AS profitRate, -- 毛利率
                    COUNT(DISTINCT platform_order_id) AS orderCount, -- 订单数
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    COUNT(DISTINCT platform_order_id)) AS singleOrderProfit, -- 单均利润
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    goods_id, goods_name 
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
                let [goodsResult] = await Promise.all([
                    sequelize_shop_tk.query(goods_group_sql, { type: QueryTypes.SELECT }),
                ]);
                for (const item of goodsResult) {
                    listData.push({
                        skuId: item.skuId, //商品编号
                        skuName: item.skuName, //SKU
                        city: '全部', //城市
                        store: '全部', //分仓名称
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        singleOrderProfit: item.orderCount ? Number(((item.profit / item.orderCount) || 0).toFixed(2)) : 0, //单均利润
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
                let [goodsCityResult] = await Promise.all([
                    sequelize_shop_tk.query(goods_city_group_sql, { type: QueryTypes.SELECT }),
                ]);
                for (const item of goodsCityResult) {
                    const storeTotalRevenue = cityMap.get(item.city).revenue;
                    const storeTotalProfit = cityMap.get(item.city).profit;
                    listData.push({
                        skuId: item.skuId, //商品编号
                        skuName: item.skuName, //SKU
                        city: item.city, //城市
                        store: '全部', //分仓名称
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        singleOrderProfit: item.orderCount ? Number(((item.profit / item.orderCount) || 0).toFixed(2)) : 0, //单均利润
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
                for (const item of result) {
                    const storeTotalRevenue = storeMap.get(item.store).revenue;
                    const storeTotalProfit = storeMap.get(item.store).profit;
                    listData.push({
                        skuId: item.skuId, //商品编号
                        skuName: item.skuName, //SKU
                        city: item.city, //城市
                        store: item.store, //分仓名称
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        singleOrderProfit: item.orderCount ? Number(((item.profit / item.orderCount) || 0).toFixed(2)) : 0, //单均利润
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
            let { startTime, endTime, skuId, skuName, city, store, channel, sort } = ctx.request.body || {};
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            let cond = `order_createtime BETWEEN '${startTime}' AND '${endTime}'`;
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
            if (skuId) {
                if (!Array.isArray(skuId)) {
                    return ctx.body = { success: false, msg: "商品编号参数格式不正确" }
                }
                if (skuId.length) {
                    let skuId_cond = `(`;
                    for (let i = 0; i < skuId.length; i++) {
                        if (i < skuId.length - 1) {
                            skuId_cond += ` goods_id LIKE '%${skuId[i]}%' OR`;
                            continue;
                        }
                        skuId_cond += ` goods_id LIKE '%${skuId[i]}%' )`;
                    }
                    cond += ` AND ${skuId_cond}`;
                }
            }
            if (skuName) {
                if (!Array.isArray(skuName)) {
                    return ctx.body = { success: false, msg: "商品名称参数格式不正确" }
                }
                if (skuName.length) {
                    let skuName_cond = `(`;
                    for (let i = 0; i < skuName.length; i++) {
                        if (i < skuName.length - 1) {
                            skuName_cond += ` goods_name LIKE '%${skuName[i]}%' OR`;
                            continue;
                        }
                        skuName_cond += ` goods_name LIKE '%${skuName[i]}%' )`;
                    }
                    cond += ` AND ${skuName_cond}`;
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
                        skuId: 'goods_id',
                        skuName: 'goods_name',
                        city: 'city',
                        store: 'store_name',
                        price: 'price',
                        revenue: 'revenue',
                        cost: 'cost',
                        profit: 'profit',
                        goodsCount: 'goodsCount',
                        profitRate: 'profitRate',
                        orderCount: 'orderCount',
                        singleOrderProfit: 'singleOrderProfit',
                        singleGoodsPrice: 'singleGoodsPrice'
                    };
                    if (!field || !order || !fields[field] || !['DESC', 'desc', 'ASC', 'asc'].includes(order)) {
                        return ctx.body = { success: false, msg: "排序参数不正确" }
                    }
                    orderCond = ` ${fields[field]} ${order}`;
                }
            }
            // 按商品id，商品名称，城市，分仓四个维度分组
            let goods_city_store_group_sql = `
                SELECT 
                    goods_id AS skuId, -- 商品编号
                    goods_name AS skuName, -- 商品名称
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
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    COUNT(DISTINCT platform_order_id)) AS singleOrderProfit, -- 单均利润
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    goods_id, goods_name, city, store_name 
                ORDER BY 
                    ${orderCond}
            `;
            // 按商品id，商品名称，城市三个维度分组
            let goods_city_group_sql = `
                SELECT 
                    goods_id AS skuId, -- 商品编号
                    goods_name AS skuName, -- 商品名称
                    city, -- 城市
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) AS price, -- 实收(含税_含5%)
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit, -- 毛利额
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END)) AS profitRate, -- 毛利率
                    COUNT(DISTINCT platform_order_id) AS orderCount, -- 订单数
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    COUNT(DISTINCT platform_order_id)) AS singleOrderProfit, -- 单均利润
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    goods_id, goods_name, city 
                ORDER BY 
                    ${orderCond}
            `;
            // 按商品id，商品名称两个维度分组
            let goods_group_sql = `
                SELECT 
                    goods_id AS skuId, -- 商品编号
                    goods_name AS skuName, -- 商品名称
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) AS price, -- 实收(含税_含5%)
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) AS profit, -- 毛利额
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END)) AS profitRate, -- 毛利率
                    COUNT(DISTINCT platform_order_id) AS orderCount, -- 订单数
                    ((SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 / (1 + tax_percent / 100) ELSE total_price / 0.957 / (1 + tax_percent / 100) END) - SUM(total_cost)) /   
                    COUNT(DISTINCT platform_order_id)) AS singleOrderProfit, -- 单均利润
                    (SUM(CASE WHEN channel = '有赞小程序' THEN total_price / 0.994 ELSE total_price / 0.957 END) / SUM(audit_output_count)) AS singleGoodsPrice -- 件单价 
                FROM 
                    tax 
                WHERE 
                    ${cond} 
                GROUP BY 
                    goods_id, goods_name 
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
            let [result, storeResult, cityResult] = await Promise.all([
                sequelize_shop_tk.query(goods_city_store_group_sql, { type: QueryTypes.SELECT }),
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
                const storeTotalRevenue = storeMap.get(item.store).revenue;
                const storeTotalProfit = storeMap.get(item.store).profit;
                listData.push({
                    skuId: item.skuId, //商品编号
                    skuName: item.skuName, //SKU
                    city: item.city, //城市
                    store: item.store, //分仓名称
                    price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                    revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                    cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                    profit: Number((item.profit || 0).toFixed(2)), //毛利额
                    goodsCount: item.goodsCount, //件数
                    profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                    orderCount: item.orderCount, //订单数
                    singleOrderProfit: item.orderCount ? Number(((item.profit / item.orderCount) || 0).toFixed(2)) : 0, //单均利润
                    singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)) || '错误！！！', //件单价
                    totalRevenueRate: storeTotalRevenue ? Number(((item.revenue / storeTotalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                    totalProfitRate: storeTotalProfit ? Number(((item.profit / storeTotalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                });
            }
            let totalData = []; // 城市或者分仓选择全部时的导出数据
            if (!city && !store) {
                // 城市选择全部，分仓选择全部
                let [goodsResult] = await Promise.all([
                    sequelize_shop_tk.query(goods_group_sql, { type: QueryTypes.SELECT }),
                ]);
                for (const item of goodsResult) {
                    totalData.push({
                        skuId: item.skuId, //商品编号
                        skuName: item.skuName, //SKU
                        city: '全部', //城市
                        store: '全部', //分仓名称
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        singleOrderProfit: item.orderCount ? Number(((item.profit / item.orderCount) || 0).toFixed(2)) : 0, //单均利润
                        singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)) || '错误！！！', //件单价
                        totalRevenueRate: totalRevenue ? Number(((item.revenue / totalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                        totalProfitRate: totalProfit ? Number(((item.profit / totalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                    });
                }
            } else if (city && !store) {
                // 分仓选择全部
                let [goodsCityResult] = await Promise.all([
                    sequelize_shop_tk.query(goods_city_group_sql, { type: QueryTypes.SELECT }),
                ]);
                for (const item of goodsCityResult) {
                    const storeTotalRevenue = cityMap.get(item.city).revenue;
                    const storeTotalProfit = cityMap.get(item.city).profit;
                    totalData.push({
                        skuId: item.skuId, //商品编号
                        skuName: item.skuName, //SKU
                        city: item.city, //城市
                        store: '全部', //分仓名称
                        price: Number((item.price || 0).toFixed(2)), //实收(含税_含5%)
                        revenue: Number((item.revenue || 0).toFixed(2)), //Revenue(未税_含5%)
                        cost: Number((item.cost || 0).toFixed(2)), //成本(未税)
                        profit: Number((item.profit || 0).toFixed(2)), //毛利额
                        goodsCount: item.goodsCount, //件数
                        profitRate: Number((item.profitRate || 0).toFixed(4)), //毛利率
                        orderCount: item.orderCount, //订单数
                        singleOrderProfit: item.orderCount ? Number(((item.profit / item.orderCount) || 0).toFixed(2)) : 0, //单均利润
                        singleGoodsPrice: Number((item.singleGoodsPrice || 0).toFixed(2)) || '错误！！！', //件单价
                        totalRevenueRate: storeTotalRevenue ? Number(((item.revenue / storeTotalRevenue) || 0).toFixed(4)) : 0, //Revenue-占比
                        totalProfitRate: storeTotalProfit ? Number(((item.profit / storeTotalProfit) || 0).toFixed(4)) : 0, //毛利额-占比
                    });
                }
            } else {
                totalData = listData;
            }
            let columns = [
                { header: '商品编号', key: 'skuId' },
                { header: 'SKU', key: 'skuName' },
                { header: '城市', key: 'city' },
                { header: '分仓名称', key: 'store' },
                { header: '实收(含税_含5%)', key: 'price' },
                { header: 'Revenue(未税_含5%)', key: 'revenue' },
                { header: '成本(未税)', key: 'cost' },
                { header: '毛利额', key: 'profit' },
                { header: '件数', key: 'goodsCount' },
                { header: '毛利率', key: 'profitRate' },
                { header: '订单数', key: 'orderCount' },
                { header: '单均利润', key: 'singleOrderProfit' },
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
                'Content-Disposition': `attachment; filename=${encodeURIComponent('分品报表')}`
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

module.exports = GoodsController
