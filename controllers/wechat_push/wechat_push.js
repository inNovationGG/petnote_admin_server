const {
    wechat_push: WechatPush,
    wechat_push_time: WechatPushTime,
    wechat_labels: WechatLabels
} = require("../../models").customersModels;
const {
    sequelize_customers,
    CityStore,
    GoodsCate
} = require("../../models")
const { Op } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const _ = require('lodash');
const moment = require("moment");
const { isValidDateFormat, isValidTimeFormat } = require("../../utils/commonUtil");

class WechatPushController {
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

    //新增精准推送
    async createWechatPush(ctx) {
        // { //传参
        //     name: "XXX",
        //     status: 0,
        //     startDate: "2024-10-01",
        //     endDate: "2024-10-07",
        //     weekDayPushTime: [{ week: 1, time: "12:00" }, { week: 2, time: "10:00" }], // 星期一12点，星期二10点
        //     cityLabels: "上海,北京",
        //     storeLabels: "1001,1002",
        //     brandLabels: "蓝氏,皇家",
        //     cateLabels: "1001,1002",
        //     skuLabels: "SKU001,SKU002",
        //     lastOrderDay: 7,
        //     lastOrderDayLimit: 7,
        //     content: "AAA",
        //     img: "https://img/",
        //     miniProgramTitle: "小程序标题",
        //     miniProgramImg: "小程序图片地址",
        //     miniProgramUrl: "小程序链接",
        // }
        try {
            const param = ctx.request.body || {};
            const {
                name,
                status = 0,
                startDate,
                endDate,
                weekDayPushTime,
                cityLabels = "",
                storeLabels = "",
                brandLabels = "",
                cateLabels = "",
                skuLabels = "",
                lastOrderDay = 7,
                lastOrderDayLimit = 0,
                content = "",
                img = "",
                miniProgramTitle = "",
                miniProgramImg = "",
                miniProgramUrl = ""
            } = param;
            const requiredParams = ['name', 'startDate', 'endDate', 'lastOrderDay', 'lastOrderDayLimit', 'content'];
            if (requiredParams.some(key => [null, undefined, ""].includes(param[key]))) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
                return ctx.body = { success: false, msg: "在线时间参数错误" }
            }
            if (![0, 1].includes(status)) {
                return ctx.body = { success: false, msg: "生效状态参数错误" };
            }
            if (!(Number.isInteger(lastOrderDay) && lastOrderDay >= 0 && Number.isInteger(lastOrderDayLimit) && lastOrderDayLimit >= 0)) {
                return ctx.body = { success: false, msg: "购买行为参数错误" };
            }
            //验证name是否重复
            const wechatPushInfo = await WechatPush.findAll({
                where: {
                    name: name,
                    is_deleted: 0
                }
            });
            if (wechatPushInfo && wechatPushInfo.length) {
                return ctx.body = { success: false, msg: "精准推送名称不可重复" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                created_by: adminUid,
                updated_by: adminUid,
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            const wechatPushTimeData = [];
            if (!Array.isArray(weekDayPushTime) || !weekDayPushTime.length) {
                return ctx.body = { success: false, msg: "推送时间参数错误" };
            }
            for (const item of weekDayPushTime) {
                const { week, time } = item;
                if (!(Number.isInteger(week) && week >= 1 && week <= 7) || !isValidTimeFormat(time)) {
                    return ctx.body = { success: false, msg: "推送时间参数错误" };
                }
                wechatPushTimeData.push({
                    ...baseField,
                    name: name,
                    week_day: week,
                    push_time: time
                });
            }
            try {
                await sequelize_customers.transaction(async (t) => {
                    //新增精准推送数据
                    await WechatPush.create({
                        ...baseField,
                        name: name,
                        status: status,
                        start_date: startDate,
                        end_date: endDate,
                        city_labels: cityLabels,
                        store_labels: storeLabels,
                        brand_labels: brandLabels,
                        cate_labels: cateLabels,
                        sku_labels: skuLabels,
                        last_order_day: lastOrderDay,
                        last_order_day_limit: lastOrderDayLimit,
                        content: content,
                        img: img,
                        mini_program_title: miniProgramTitle,
                        mini_program_img: miniProgramImg,
                        mini_program_url: miniProgramUrl,
                        is_deleted: 0
                    }, { transaction: t });
                    //新增精准推送推送时间记录
                    await WechatPushTime.bulkCreate(wechatPushTimeData, { transaction: t });
                });
            } catch (error) {
                console.log("createWechatPush Transaction Error", error);
                return ctx.body = { success: false, msg: "createWechatPush Transaction Error", error }
            }
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //编辑精准推送
    async editWechatPush(ctx) {
        try {
            const param = ctx.request.body || {};
            const {
                id,
                name,
                status = 0,
                startDate,
                endDate,
                weekDayPushTime,
                cityLabels = "",
                storeLabels = "",
                brandLabels = "",
                cateLabels = "",
                skuLabels = "",
                lastOrderDay = 7,
                lastOrderDayLimit = 0,
                content = "",
                img = "",
                miniProgramTitle = "",
                miniProgramImg = "",
                miniProgramUrl = ""
            } = param;
            const requiredParams = ['id', 'name', 'startDate', 'endDate', 'lastOrderDay', 'lastOrderDayLimit', 'content'];
            if (requiredParams.some(key => [null, undefined, ""].includes(param[key]))) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
                return ctx.body = { success: false, msg: "在线时间参数错误" }
            }
            if (![0, 1].includes(status)) {
                return ctx.body = { success: false, msg: "生效状态参数错误" };
            }
            if (!(Number.isInteger(lastOrderDay) && lastOrderDay >= 0 && Number.isInteger(lastOrderDayLimit) && lastOrderDayLimit >= 0)) {
                return ctx.body = { success: false, msg: "购买行为参数错误" };
            }
            //验证name是否重复
            const wechatPushInfo = await WechatPush.findAll({
                where: {
                    name: name,
                    id: {
                        [Op.ne]: id
                    },
                    is_deleted: 0
                }
            });
            if (wechatPushInfo && wechatPushInfo.length) {
                return ctx.body = { success: false, msg: "精准推送名称不可重复" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                created_by: adminUid,
                updated_by: adminUid,
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            const wechatPushTimeData = [];
            if (!Array.isArray(weekDayPushTime) || !weekDayPushTime.length) {
                return ctx.body = { success: false, msg: "推送时间参数错误" };
            }
            for (const item of weekDayPushTime) {
                const { week, time } = item;
                if (!(Number.isInteger(week) && week >= 1 && week <= 7) || !isValidTimeFormat(time)) {
                    return ctx.body = { success: false, msg: "推送时间参数错误" };
                }
                wechatPushTimeData.push({
                    ...baseField,
                    name: name,
                    week_day: week,
                    push_time: time
                });
            }
            try {
                await sequelize_customers.transaction(async (t) => {
                    //修改精准推送数据
                    await WechatPush.update(
                        {
                            name: name,
                            status: status,
                            start_date: startDate,
                            end_date: endDate,
                            city_labels: cityLabels,
                            store_labels: storeLabels,
                            brand_labels: brandLabels,
                            cate_labels: cateLabels,
                            sku_labels: skuLabels,
                            last_order_day: lastOrderDay,
                            last_order_day_limit: lastOrderDayLimit,
                            content: content,
                            img: img,
                            mini_program_title: miniProgramTitle,
                            mini_program_img: miniProgramImg,
                            mini_program_url: miniProgramUrl,
                            is_deleted: 0,
                            updated_by: baseField.updated_by,
                            updated_at: baseField.updated_at
                        },
                        {
                            where: {
                                id: id
                            }
                        },
                        { transaction: t }
                    );
                    //删除旧的精准推送时间记录
                    await WechatPushTime.destroy({
                        where: {
                            name: name,
                        },
                    }, { transaction: t });
                    //新增精准推送推送时间记录
                    await WechatPushTime.bulkCreate(wechatPushTimeData, { transaction: t });
                });
            } catch (error) {
                console.log("editWechatPush Transaction Error", error);
                return ctx.body = { success: false, msg: "editWechatPush Transaction Error", error }
            }
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //编辑精准推送的生效状态
    async editStatus(ctx) {
        try {
            const { id, status } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            if (![0, 1].includes(status)) {
                return ctx.body = { success: false, msg: "生效状态参数错误" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                updated_by: adminUid,
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await WechatPush.update(
                {
                    ...baseField,
                    status: status,
                },
                {
                    where: {
                        id: id
                    }
                }
            );
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //精准推送分页查询
    async getWechatPushList(ctx) {
        try {
            const { searchText, startTime, endTime, page = 1, pagesize = 10 } = ctx.request.body || {};
            const currentPage = parseInt(page, 10);
            const currentPagesize = parseInt(pagesize, 10);
            let where = {};
            if (startTime) {
                if (!isValidDateFormat(startTime)) {
                    return ctx.body = { success: false, msg: "开始时间格式不正确" }
                }
                where.start_date = { [Op.gte]: startTime };
            }
            if (endTime) {
                if (!isValidDateFormat(endTime)) {
                    return ctx.body = { success: false, msg: "结束时间格式不正确" }
                }
                where.end_date = { [Op.lte]: endTime };
            }
            if (![null, undefined, ""].includes(searchText)) {
                where.name = { [Op.like]: `%${searchText}%` };
            }
            const cols = ['id', 'name', 'created_at', 'status', 'start_date', 'end_date'];
            const options = {
                attributes: cols,//返回字段
                page: currentPage,//页码
                paginate: currentPagesize,//返回数据条数
                order: [['created_at', 'DESC']],//排序规则
                where: where,//查询条件
            }
            const { docs, pages, total } = await WechatPush.paginate(options)
            if (_.isEmpty(docs)) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
                        ...formatPagination({ total, page: currentPage, pagesize: currentPagesize, pages })
                    }
                }
            }
            const lists = [];
            for (const item of docs) {
                lists.push({
                    id: item.id, //精准推送id
                    name: item.name, //精准推送名称
                    createTime: item.created_at, //创建时间
                    status: item.status, //生效状态
                    usefulTime: `${item.start_date}~${item.end_date}`, //有效期
                });
            }
            ctx.body = {
                success: true,
                data: {
                    data: lists,
                    ...formatPagination({ total, page: currentPage, pagesize: currentPagesize, pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    //查看精准推送详情
    async getWechatPushInfo(ctx) {
        try {
            const { id } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let data = {};
            const res = await WechatPush.findOne({
                where: {
                    id: id
                }
            });
            if (res) {
                data = {
                    id: id,
                    name: res.name,
                    status: res.status,
                    startDate: res.start_date,
                    endDate: res.end_date,
                    cityLabels: res.city_labels,
                    storeLabels: res.store_labels,
                    brandLabels: res.brand_labels,
                    cateLabels: res.cate_labels,
                    skuLabels: res.sku_labels,
                    lastOrderDay: res.last_order_day,
                    lastOrderDayLimit: res.last_order_day_limit,
                    content: res.content,
                    img: res.img,
                    miniProgramTitle: res.mini_program_title,
                    miniProgramImg: res.mini_program_img,
                    miniProgramUrl: res.mini_program_url
                }
                const wechatPushTime = await WechatPushTime.findAll({
                    where: {
                        name: res?.name ?? '',
                    },
                    attributes: ['name', 'week_day', 'push_time']
                });
                if (wechatPushTime && Array.isArray(wechatPushTime) && wechatPushTime.length) {
                    const weekDayPushTime = [];
                    for (const item of wechatPushTime) {
                        weekDayPushTime.push({ week: item.week_day, time: item.push_time });
                    }
                    data.weekDayPushTime = weekDayPushTime;
                }
            }
            ctx.body = {
                success: true,
                data: data
            }
        } catch (error) {
            console.log(error);
        }
    }

    //查看标签，包括城市、分仓、品类、品牌、SKU标签
    async getLabels(ctx) {
        try {
            const cityLabels = []; //城市标签
            const storeLabels = []; //分仓标签
            const cateLabels = []; //二级品类标签
            const brandLabels = []; //品牌标签
            const labels = await WechatLabels.findAll({
                attributes: ['bind_id', 'name', 'type']
            });
            if (labels && Array.isArray(labels) && labels.length) {
                for (const item of labels) {
                    const { bind_id, name, type } = item;
                    // 0-城市，1-分仓，2-二级品类，3-品牌，4-SKU
                    if (type === 0 && name) {
                        cityLabels.push(name);
                    } else if (type === 1 && bind_id && name) {
                        storeLabels.push({
                            id: bind_id,
                            name: name
                        });
                    } else if (type === 2 && bind_id && name) {
                        cateLabels.push({
                            id: bind_id,
                            name: name
                        });
                    } else if (type === 3 && name) {
                        brandLabels.push(name);
                    }
                }
            }
            ctx.body = {
                success: true,
                data: {
                    cityLabels: cityLabels,
                    storeLabels: storeLabels,
                    cateLabels: cateLabels,
                    brandLabels: brandLabels
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = WechatPushController
