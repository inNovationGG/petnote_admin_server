/* eslint-disable no-unused-vars */
const { sequelize_shop_tk } = require("../../models");
const { Op, QueryTypes } = require("sequelize");

class BaseController {
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
    
    // 查询城市
    async getCitys(ctx) {
        try {
            let citys = [];
            let sql = `SELECT DISTINCT city FROM city_store`;
            const result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && result.length) {
                citys = result.map(v => v.city);
            }
            ctx.body = { success: true, data: citys }
        } catch (error) {
            console.log('getCitys error ===>>>', error);
        }
    }

    // 查询分仓
    async getStores(ctx) {
        try {
            const { city } = ctx.request.body || {};
            let stores = [];
            let cond = `store_id IS NOT NULL AND store_id != '' AND store_name IS NOT NULL AND store_name != ''`;
            if (city) {
                if (!Array.isArray(city)) {
                    return ctx.body = { success: false, msg: "城市参数格式不正确" }
                }
                if (city.length) {
                    let citys = city.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND city IN (${citys})`;
                }
            }
            let sql = `SELECT DISTINCT store_id, store_name FROM city_store WHERE ${cond}`;
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && Array.isArray(result) && result.length) {
                for (let item of result) {
                    stores.push({
                        id: item.store_id,
                        name: item.store_name
                    });
                }
            }
            ctx.body = { success: true, data: stores }
        } catch (error) {
            console.log('getStores error ===>>>', error);
        }
    }

    // 查询销售渠道
    async getChannels(ctx) {
        try {
            let channels = [];
            let sql = `SELECT DISTINCT channel FROM tax WHERE channel IS NOT NULL AND channel != ''`;
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && result.length) {
                channels = result.map(v => v.channel);
            }
            ctx.body = { success: true, data: channels }
        } catch (error) {
            console.log('getChannels error ===>>>', error);
        }
    }

    // 查询品牌
    async getBrands(ctx) {
        try {
            let brands = [];
            let sql = `SELECT DISTINCT brand FROM tax WHERE brand IS NOT NULL AND brand != ''`;
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && result.length) {
                brands = result.map(v => v.brand);
            }
            ctx.body = { success: true, data: brands }
        } catch (error) {
            console.log('getBrands error ===>>>', error);
        }
    }

    // 查询一级分类
    async getFcates(ctx) {
        try {
            let fcates = [];
            let cond = `f_cate_id IS NOT NULL AND f_cate_id != '' AND f_cate_name IS NOT NULL AND f_cate_name != ''`;
            let sql = `SELECT DISTINCT f_cate_id, f_cate_name FROM goods_cate WHERE ${cond}`;
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && Array.isArray(result) && result.length) {
                for (let item of result) {
                    fcates.push({
                        id: item.f_cate_id,
                        name: item.f_cate_name
                    });
                }
            }
            ctx.body = { success: true, data: fcates }
        } catch (error) {
            console.log('getFcates error ===>>>', error);
        }
    }

    // 查询二级分类
    async getScates(ctx) {
        try {
            const { fcate } = ctx.request.body || {};
            let scates = [];
            let cond = `s_cate_id IS NOT NULL AND s_cate_id != '' AND s_cate_name IS NOT NULL AND s_cate_name != ''`;
            if (fcate) {
                if (!Array.isArray(fcate)) {
                    return ctx.body = { success: false, msg: "一级品类参数格式不正确" }
                }
                if (fcate.length) {
                    let fcates = fcate.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND f_cate_id IN (${fcates})`;
                }
            }
            let sql = `SELECT DISTINCT s_cate_id, s_cate_name FROM goods_cate WHERE ${cond}`;
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && Array.isArray(result) && result.length) {
                for (let item of result) {
                    scates.push({
                        id: item.s_cate_id,
                        name: item.s_cate_name
                    });
                }
            }
            ctx.body = { success: true, data: scates }
        } catch (error) {
            console.log('getScates error ===>>>', error);
        }
    }

    // 查询三级分类
    async getTcates(ctx) {
        try {
            const { fcate, scate } = ctx.request.body || {};
            let tcates = [];
            let cond = `t_cate_id IS NOT NULL AND t_cate_id != '' AND t_cate_name IS NOT NULL AND t_cate_name != ''`;
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
            let sql = `SELECT DISTINCT t_cate_id, t_cate_name FROM goods_cate WHERE ${cond}`;
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && Array.isArray(result) && result.length) {
                for (let item of result) {
                    tcates.push({
                        id: item.t_cate_id,
                        name: item.t_cate_name
                    });
                }
            }
            ctx.body = { success: true, data: tcates }
        } catch (error) {
            console.log('getTcates error ===>>>', error);
        }
    }
}

module.exports = BaseController
