const { ScoreGoods, ScoreGoodsCate, YouzanTicket } = require("../../models");
const { Op } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const _ = require('lodash');
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const {
    GOODS_STATUS
} = require("../../constants/scoreGoods");
const getRedisInstance = require("../../config/redisClient");
const redis = getRedisInstance();
const { getYouzanTicketInfo } = require("../../services/youzanService");

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

    //新增商品分类
    async createGoodsCate(ctx) {
        // { //传参
        //     goodsCateId: "1",
        //     goodsCatePid: "",
        //     goodsCateType: "商品分类类别（0-一级分类，1-二级分类，2-宠本本周边，3-适用范围标签，4-属性标签，5-其他）",
        //     goodsCateName: "同城达专用/全国通用/优惠券/配送优惠券/商品兑换券/宠本本周边/新品/畅销/限量款",
        //     sort: 0,
        // }
        try {
            let { goodsCateId, goodsCatePid = '', goodsCateType, goodsCateName, sort } = ctx.request.body || {};
            await ScoreGoodsCate.create({
                goods_cate_id: goodsCateId,
                goods_cate_pid: goodsCatePid,
                goods_cate_type: goodsCateType,
                goods_cate_name: goodsCateName,
                sort: sort,
                is_deleted: 0
            });
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //新增商品
    async createGoods(ctx) {
        // {
        //     goods_id: uuidv4(), //商品id，唯一值
        //     real_goods_id: "实际商品ID",
        //     goods_name: "商品名称",
        //     goods_img: "商品展示图",
        //     goods_cate: "商品一级分类ID(多个用逗号分隔)",
        //     goods_second_cate: "商品二级分类ID（多个用逗号分隔）",
        //     goods_use_range: "商品适用范围（0-同城达专用，1-全国通用）",
        //     goods_field: "商品属性（0-新品，1-畅销，2-限量款）",
        //     online_inventory: 100, //线上库存
        //     total_inventory: 200, //总库存（查询有赞实际库存）
        //     price: 1000, //兑换所需积分数
        //     sort: 0, //展示顺序
        //     goods_begin_time: 0, //商品有效期开始时间
        //     goods_end_time: 0, //商品有效期结束时间
        //     goods_begin_date: "", //商品有效期开始日期
        //     goods_end_date: "", //商品有效期结束日期
        //     cycle_type: 0, //0-不循环，1-日循环，2-月循环
        //     cycle_date: "09:00:00",//"线上循环时间（HH:mm:ss）"
        //     cycle_day: 10//"线上循环日（月循环时用于表示每月的第几天）"
        //     cycle_action_type: 0,
        //     cycle_action_effect: 0,
        //     cycle_action_effect_value: 100, //每次循环新增的线上库存数量
        //     is_exchange_limit: 1, //是否有兑换次数限制0-无限制，1-有限制
        //     exchange_level_limit: 0, //兑换所需等级，预留
        //     exchange_date_limit: 2, //"兑换周期类型（0-分钟，1-小时，2-天，3-周，4-月，5-季度，6-年，7-一辈子（暂时只有天、月、一辈子三种）"
        //     exchange_times_limit: 100, //兑换次数限制
        //     is_hidden: 0, //是否隐藏款，0-否，1-是
        //     is_grow: 1, //是否可膨胀，0-否，1-是，隐藏款不可膨胀
        //     grow_goods_id: "goods_id", //膨胀后的商品ID
        //     is_deleted: 0,
        //     goods_status: 0, //0-上架，1-隐藏，2-线上售罄，3-下架
        //     city_description: "", //适用城市（富文本）
        //     exchange_description: "", //兑换方式（富文本）
        //     rule_description: "", //规则（富文本）
        //     detail_description: "", //商品详情（富文本）
        // }
        try {
            const param = ctx.request.body || {};
            const {
                name,
                img,
                cate,
                secondCate,
                useRange,
                label,
                realGoodsId,
                onlineInventory,
                totalInventory = 0,
                price,
                sort = 0,
                beginTime = 0,
                endTime = 0,
                beginDate = "",
                endDate = "",
                cycleType = 0,
                cycleDate = "",
                cycleDay = 0,
                cycleActionEffectValue = 0,
                isExchangeLimit = 0,
                exchangeDateLimit = 2,
                exchangeTimesLimit = 0,
                isHidden = 0,
                isGrow = 1,
                growGoodsId = "",
                goodsStatus = 0,
                cityDescription = "",
                exchangeDescription = "",
                ruleDescription = "",
                detailDescription = ""
            } = param;
            const requiredParams = [
                'name',
                'img',
                'cate',
                'secondCate',
                'useRange',
                'label',
                'realGoodsId',
                'onlineInventory',
                'price'
            ];
            if (requiredParams.some(key => [null, undefined, ""].includes(param[key]))) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            //验证name是否重复
            const goodsInfo = await ScoreGoods.findAll({
                where: {
                    goods_name: name,
                    is_deleted: 0
                }
            });
            if (goodsInfo && goodsInfo.length) {
                return ctx.body = { success: false, msg: "商品名不可重复" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                goods_id: uuidv4(),
                cycle_action_type: 0, //默认操作为新增
                cycle_action_effect: 0, //默认影响线上库存
                exchange_level_limit: 0, //兑换所需等级，预留
                is_deleted: 0,
                create_by: adminUid,
                update_by: adminUid,
                created: Math.floor(Date.now() / 1000),
                updated: Math.floor(Date.now() / 1000),
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                created_y: Number(moment().format("YYYY")),
                created_ym: Number(moment().format("YYYYMM")),
                created_ymd: Number(moment().format("YYYYMMDD")),
            };
            await ScoreGoods.create({
                ...baseField,
                real_goods_id: realGoodsId,
                goods_name: name,
                goods_img: img,
                goods_cate: cate,
                goods_second_cate: secondCate,
                goods_use_range: useRange,
                goods_field: label,
                online_inventory: onlineInventory,
                total_inventory: totalInventory,
                price: price,
                sort: sort,
                goods_begin_time: beginTime,
                goods_end_time: endTime,
                goods_begin_date: beginDate,
                goods_end_date: endDate,
                cycle_type: cycleType,
                cycle_date: cycleDate,
                cycle_day: cycleDay,
                cycle_action_effect_value: cycleActionEffectValue,
                is_exchange_limit: isExchangeLimit,
                exchange_date_limit: exchangeDateLimit,
                exchange_times_limit: exchangeTimesLimit,
                is_hidden: isHidden,
                is_grow: isGrow,
                grow_goods_id: growGoodsId,
                goods_status: goodsStatus,
                city_description: cityDescription,
                exchange_description: exchangeDescription,
                rule_description: ruleDescription,
                detail_description: detailDescription,
            });
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //编辑商品
    async editGoods(ctx) {
        try {
            const param = ctx.request.body || {};
            const {
                id,
                name,
                img,
                cate,
                secondCate,
                useRange,
                label,
                realGoodsId,
                onlineInventory,
                totalInventory,
                price,
                sort = 0,
                beginTime = 0,
                endTime = 0,
                beginDate = "",
                endDate = "",
                cycleType = 0,
                cycleDate = "",
                cycleDay = 0,
                cycleActionEffectValue = 0,
                isExchangeLimit = 0,
                exchangeDateLimit = 2,
                exchangeTimesLimit = 0,
                isHidden = 0,
                isGrow = 1,
                growGoodsId = "",
                goodsStatus = 0,
                cityDescription = "",
                exchangeDescription = "",
                ruleDescription = "",
                detailDescription = ""
            } = param;
            const requiredParams = [
                'id',
                'name',
                'img',
                'cate',
                'secondCate',
                'useRange',
                'label',
                'realGoodsId',
                'onlineInventory',
                'price'
            ];
            if (requiredParams.some(key => [null, undefined, ""].includes(param[key]))) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            //验证name是否重复
            const goodsInfo = await ScoreGoods.findAll({
                where: {
                    goods_name: name,
                    goods_id: {
                        [Op.ne]: id
                    },
                    is_deleted: 0
                }
            });
            if (goodsInfo && goodsInfo.length) {
                return ctx.body = { success: false, msg: "商品名不可重复" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                cycle_action_type: 0, //默认操作为新增
                cycle_action_effect: 0, //默认影响线上库存
                exchange_level_limit: 0, //兑换所需等级，预留
                is_deleted: 0,
                update_by: adminUid,
                updated: Math.floor(Date.now() / 1000),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await ScoreGoods.update(
                {
                    ...baseField,
                    real_goods_id: realGoodsId,
                    goods_name: name,
                    goods_img: img,
                    goods_cate: cate,
                    goods_second_cate: secondCate,
                    goods_use_range: useRange,
                    goods_field: label,
                    online_inventory: onlineInventory,
                    total_inventory: totalInventory,
                    price: price,
                    sort: sort,
                    goods_begin_time: beginTime,
                    goods_end_time: endTime,
                    goods_begin_date: beginDate,
                    goods_end_date: endDate,
                    cycle_type: cycleType,
                    cycle_date: cycleDate,
                    cycle_day: cycleDay,
                    cycle_action_effect_value: cycleActionEffectValue,
                    is_exchange_limit: isExchangeLimit,
                    exchange_date_limit: exchangeDateLimit,
                    exchange_times_limit: exchangeTimesLimit,
                    is_hidden: isHidden,
                    is_grow: isGrow,
                    grow_goods_id: growGoodsId,
                    goods_status: goodsStatus,
                    city_description: cityDescription,
                    exchange_description: exchangeDescription,
                    rule_description: ruleDescription,
                    detail_description: detailDescription,
                },
                {
                    where: {
                        goods_id: id
                    }
                }
            );
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    // 编辑商品状态（上架/下架）
    async editStatus(ctx) {
        try {
            const { id, status } = ctx.request.body || {};
            if (!id || status == null) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            if (!Object.values(GOODS_STATUS).includes(status)) {
                return ctx.body = { success: false, msg: "商品状态参数错误" }
            }
            // 商品上架需要校验是否有总库存和商品有效期是否到期
            if (status === GOODS_STATUS.UP) {
                let inventory = 0; //商品实际总库存
                const goodsInfo = await ScoreGoods.findOne({
                    where: {
                        goods_id: id,
                    },
                    attributes: ['real_goods_id', 'goods_end_time']
                });
                const realGoodsId = goodsInfo?.real_goods_id || "";
                if (realGoodsId) {
                    let totalInventory = await redis.hGet(`vip_goods:${realGoodsId}`, "qty");
                    if (totalInventory === null) {
                        const result = await getYouzanTicketInfo(realGoodsId);
                        if (!result.success) {
                            return ctx.body = { success: false, msg: "商品不存在不可上架" }
                        }
                        const { status = 0, qty = 0 } = result.data;
                        await redis.hSet(`vip_goods:${realGoodsId}`, "status", status);
                        await redis.hSet(`vip_goods:${realGoodsId}`, "qty", qty);
                        totalInventory = qty;
                    }
                    inventory = totalInventory;
                }
                if (inventory <= 0) {
                    return ctx.body = { success: false, msg: "无总库存不可上架" }
                }
                const goodsEndTime = goodsInfo?.goods_end_time || 0;
                // 判断商品是否到期，到期不可上架
                if (goodsEndTime !== 0 && Date.now() / 1000 >= goodsEndTime) {
                    return ctx.body = { success: false, msg: "商品到期不可上架，请先修改有效期" }
                }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                update_by: adminUid,
                updated: Math.floor(Date.now() / 1000),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await ScoreGoods.update(
                {
                    ...baseField,
                    goods_status: status,
                },
                {
                    where: {
                        goods_id: id
                    }
                }
            );
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //商品分页查询
    async getGoodsList(ctx) {
        try {
            const { searchText, page = 1, pagesize = 10 } = ctx.request.body || {};
            const where = {};
            if (![null, undefined, ""].includes(searchText)) {
                where.goods_name = { [Op.like]: `%${searchText}%` };
            }
            const cols = [
                'goods_id', 'goods_name', 'goods_cate', 'goods_second_cate',
                'real_goods_id',
                'online_inventory', 'total_inventory',
                'price', 'sort',
                'goods_begin_date', 'goods_end_date',
                'cycle_type',
                'is_exchange_limit', 'exchange_date_limit', 'exchange_times_limit',
                'goods_status'
            ];
            const options = {
                attributes: cols,//返回字段
                page: page,//页码
                paginate: pagesize,//返回数据条数
                order: [['goods_cate', 'ASC'], ['sort', 'ASC']],//排序规则
                where: where,//查询条件
            }
            const { docs, pages, total } = await ScoreGoods.paginate(options)
            if (_.isEmpty(docs)) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
                        ...formatPagination({ total, page, pagesize, pages })
                    }
                }
            }
            const lists = [];
            for (const item of docs) {
                let totalInventory = await redis.hGet(`vip_goods:${item.real_goods_id}`, "qty");
                if (totalInventory === null) {
                    const result = await getYouzanTicketInfo(item.real_goods_id);
                    if (!result.success) {
                        totalInventory = 0;
                    } else {
                        const { status = 0, qty = 0 } = result.data;
                        await redis.hSet(`vip_goods:${item.real_goods_id}`, "status", status);
                        await redis.hSet(`vip_goods:${item.real_goods_id}`, "qty", qty);
                        totalInventory = qty;
                    }
                }
                lists.push({
                    goodsId: item.goods_id, // 商品ID
                    goodsName: item.goods_name, // 商品名称
                    goodsCate: item.goods_cate, // 商品一级分类
                    goodsSecondCate: item.goods_second_cate, // 商品二级分类
                    sort: item.sort, // 商品展示顺序
                    price: item.price, // 积分数量
                    goodsBeginDate: item.goods_begin_date, // 商品有效期开始时间，若为空则代表长期有效
                    goodsEndDate: item.goods_end_date, // 商品有效期结束时间，若为空则代表长期有效
                    totalInventory: totalInventory, // 有赞商品库存
                    onlineInventory: item.online_inventory, // 商品线上库存
                    cycleType: item.cycle_type, // 线上循环类型
                    isExchangeLimit: item.is_exchange_limit, // 是否兑换限制
                    exchangeDateLimit: item.exchange_date_limit, // 兑换周期限制
                    exchangeTimesLimit: item.exchange_times_limit, // 兑换次数限制
                    goodsStatus: item.goods_status // 商品状态
                });
            }
            ctx.body = {
                success: true,
                data: {
                    data: lists,
                    ...formatPagination({ total, page, pagesize, pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    //查询商品详情
    async getGoodsInfo(ctx) {
        // { //传参
        //     id: "商品ID",
        // }
        try {
            const { id } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            const goodsInfo = await ScoreGoods.findOne({
                where: {
                    goods_id: id
                }
            });
            ctx.body = {
                success: true,
                data: goodsInfo
            }
        } catch (error) {
            console.log(error);
        }
    }

    //获取所有商品
    async getAllGoods(ctx) {
        try {
            const goodsInfo = await ScoreGoods.findAll({
                where: {
                    is_deleted: 0
                },
                attributes: ['goods_id', 'goods_name']
            });
            ctx.body = {
                success: true,
                data: goodsInfo
            }
        } catch (error) {
            console.log(error);
        }
    }

    //校验商品在一级分类下的sort是否已经存在
    async validateSort(ctx) {
        try {
            let { goodsId, sort, cate } = ctx.request.body || {};
            if (!sort || !cate) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            if (typeof cate === 'number') {
                cate = cate + '';
            }
            const whereCondition = {
                goods_cate: cate
            }
            if (goodsId) {
                whereCondition.goods_id = { [Op.ne]: goodsId }
            }
            const goodsInfo = await ScoreGoods.findAll({
                where: whereCondition,
                attributes: ['sort'],
                order: [['sort', 'ASC']],
            });
            if (goodsInfo && goodsInfo.length) {
                const sortList = goodsInfo.map(item => item.sort);
                if (sortList.includes(sort)) {
                    return ctx.body = {
                        success: false,
                        msg: "展示顺序不可重复"
                    }
                }
            }
            ctx.body = { success: true, data: true }
        } catch (error) {
            console.log(error);
        }
    }

    //查询有赞优惠券列表
    async getRealTickets(ctx) {
        try {
            const { searchText } = ctx.request.body || {};
            let whereCondition = {};
            if (![null, undefined, ""].includes(searchText)) {
                whereCondition = {
                    [Op.or]: [
                        { activity_id: searchText },
                        { activity_name: { [Op.like]: `%${searchText}%` } }
                    ]
                }
            }
            // 活动状态（1-未开始，2-进行中，3-已结束，4-已失效，5-审核中）
            const tickets = await YouzanTicket.findAll({
                where: {
                    ...whereCondition,
                    status: { [Op.in]: [1, 2, 5] }
                },
                attributes: ['activity_id', 'activity_name']
            });
            const list = [];
            if (tickets && tickets.length) {
                for (const item of tickets) {
                    list.push({
                        id: item.activity_id,
                        name: item.activity_name
                    });
                }
            }
            ctx.body = {
                success: true,
                data: list
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = GoodsController
