const { PetAdminUser, ScoreTask, SurpriseTicket, LotteryText, sequelize_pet } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const _ = require('lodash');
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const { TASK_TYPE, SURPRISE_TICKET_STATUS, TASK_TEMPLATE, validateTemplate, TASK_KEY } = require("../../constants/task");
const { getYouzanTicketInfo } = require("../../services/youzanService");

class TaskController {
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

    async getPetAdmin(uids) {
        const userList = await PetAdminUser.findAll({
            where: {
                uid: {
                    [Op.in]: [...new Set(uids)]
                }
            },
            attributes: ["uid", "username"],
        });
        const userInfoMap = new Map();
        if (userList && userList.length) {
            for (const user of userList) {
                const { uid, username } = user;
                userInfoMap.set(uid, username);
            }
        }
        return userInfoMap;
    }

    //新增任务
    async createTask(ctx) {
        // { //传参
        //     taskType: 0, //0-消费送积分，1-新用户任务，2-每日任务，3-连续签到任务，4-其他任务
        //     taskKey: "CUSTOM", //任务的key
        //     taskDescription: "自定义文案", //任务描述（"首次宠本本第三方平台消费订单兑换积分"）
        //     sort: 0, //排序
        //     configData: "{"baseScore": 10,"extraScore": 10}", //任务规则
        // }
        try {
            let { taskType, taskKey, taskDescription, sort, configData } = ctx.request.body || {};
            if (!taskDescription || [null, undefined, ""].includes(sort) || !configData || [null, undefined, ""].includes(taskType)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            if (typeof configData !== 'string') {
                configData = JSON.stringify(configData);
            }
            //校验configData参数格式
            const paramTemplate = TASK_TEMPLATE[taskType] || TASK_TEMPLATE[taskKey] || null;
            if (paramTemplate) {
                const validResult = validateTemplate(JSON.parse(configData), paramTemplate);
                if (validResult !== true) {
                    return ctx.body = { success: false, msg: "配置格式错误", data: validResult }
                }
            }
            //验证task_description是否重复
            const taskInfo = await ScoreTask.findAll({
                where: {
                    task_description: taskDescription
                }
            });
            if (taskInfo && taskInfo.length) {
                return ctx.body = { success: false, msg: "任务描述不可重复" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                task_id: uuidv4(),
                task_type: 0, //0-消费送积分，1-新用户任务，2-每日任务，3-连续签到任务，4-其他任务
                is_time_limit: 0, //任务是否有有效期，0-否，1-是
                begin_time: 0, //任务有效期开始时间
                end_time: 0, //任务有效期结束时间
                task_key: "CUSTOM", //任务的key
                task_description: "", //任务描述（"首次 宠本本第三方平台消费订单兑换积分"）
                is_deleted: 0, //0-未删除，1-已删除
                sort: 0, //排序，默认0，表示第一个
                config_data: "",
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
            await ScoreTask.create({
                ...baseField,
                task_type: taskType,
                task_key: taskKey || `CUSTOM_${taskType}_${Math.floor(Date.now() / 1000)}`,
                task_description: taskDescription,
                sort: sort,
                config_data: configData,
            });
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //编辑任务
    async editTask(ctx) {
        // { //传参
        //     taskId: "xxxxxx", //任务ID
        //     taskType: 0, //0-消费送积分，1-新用户任务，2-每日任务，3-连续签到任务，4-其他任务
        //     taskKey: "CUSTOM", //任务的key
        //     taskDescription: "自定义文案", //任务描述（"首次宠本本第三方平台消费订单兑换积分"）
        //     sort: 0, //排序
        //     configData: "{"baseScore": 10,"extraScore": 10}", //任务规则
        // }
        try {
            let { taskId, taskType = 0, taskKey = '', taskDescription = '', sort = 0, configData, is_deleted = 0 } = ctx.request.body || {};
            if (!taskId || !taskKey || !taskDescription || !configData || [null, undefined, ""].includes(taskType)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            if (typeof sort !== 'number' || sort < 0 || ![0, 1].includes(is_deleted)) {
                return ctx.body = { success: false, msg: "参数错误" }
            }
            if (typeof configData !== 'string') {
                configData = JSON.stringify(configData);
            }
            //校验configData参数格式
            const paramTemplate = TASK_TEMPLATE[taskType] || TASK_TEMPLATE[taskKey] || null;
            if (paramTemplate) {
                const validResult = validateTemplate(JSON.parse(configData), paramTemplate);
                if (validResult !== true) {
                    return ctx.body = { success: false, msg: "配置格式错误", data: validResult }
                }
            }
            //验证task_description是否重复
            const taskInfo = await ScoreTask.findAll({
                where: {
                    task_description: taskDescription,
                    task_id: {
                        [Op.ne]: taskId
                    }
                }
            });
            if (taskInfo && taskInfo.length) {
                return ctx.body = { success: false, msg: "任务描述不可重复" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                sort: 0, //排序，默认0，表示第一个
                update_by: adminUid,
                updated: Math.floor(Date.now() / 1000),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await ScoreTask.update(
                {
                    ...baseField,
                    task_description: taskDescription,
                    sort: sort,
                    config_data: configData,
                    is_deleted: is_deleted
                },
                {
                    where: {
                        task_id: taskId,
                    }
                }
            );
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //删除任务
    async deleteTask(ctx) {
        // { //传参
        //     taskId: "xxxxxx", //任务ID
        // }
        try {
            let { taskId } = ctx.request.body || {};
            if (!taskId) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                update_by: adminUid,
                updated: Math.floor(Date.now() / 1000),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await ScoreTask.update(
                {
                    ...baseField,
                    is_deleted: 1
                },
                {
                    where: {
                        task_id: taskId,
                    }
                }
            );
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //新增惊喜奖励优惠券
    async createSurpriseTicket(ctx) {
        // { //传参
        //     ticket_id: "有赞的优惠券ID", //需要对接有赞，校验优惠券是否存在/是否有库存/...
        //     date: "2024-01-01",
        //     text: "今天天气好",
        //     status: "0", //生效状态，0-生效，1-失效
        //     is_deleted: 0, //是否删除，0-未删除，1-已删除
        //     create_by: adminUid,
        //     update_by: adminUid,
        //     created: Math.floor(Date.now() / 1000),
        //     updated: Math.floor(Date.now() / 1000),
        //     created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        //     updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        // }
        try {
            const { ticketId, date, text } = ctx.request.body || {};
            if (!ticketId || !date || !text) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            // 校验ticketId有效性
            const result = await getYouzanTicketInfo(ticketId);
            if (!result.success) {
                return ctx.body = { success: false, msg: "未查询到优惠券id" }
            }
            const { status } = result.data;
            if (status !== 0) {
                return ctx.body = { success: false, msg: "优惠券不可用" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                status: 0, //0-生效，1-失效
                is_deleted: 0, //0-未删除，1-已删除
                create_by: adminUid,
                update_by: adminUid,
                created: Math.floor(Date.now() / 1000),
                updated: Math.floor(Date.now() / 1000),
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await SurpriseTicket.create({
                ...baseField,
                ticket_id: ticketId,
                date: date,
                text: text
            });
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //根据id编辑惊喜奖励优惠券
    async editSurpriseTicket(ctx) {
        // { //传参
        //     id: 1001, //surprise_ticket表主键
        //     ticket_id: "有赞的优惠券ID", //需要对接有赞，校验优惠券是否存在/是否有库存/...
        //     date: "2024-01-01",
        //     text: "今天天气好",
        //     status: "0", //生效状态，0-生效，1-失效
        //     is_deleted: 0, //是否删除，0-未删除，1-已删除
        // }
        try {
            let { id, ticketId, date, text, status = 0, is_deleted = 0 } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            if (![0, 1].includes(status) || ![0, 1].includes(is_deleted)) {
                return ctx.body = { success: false, msg: "参数错误" }
            }
            const updateField = {};
            if (ticketId) {
                // 校验ticketId有效性
                const result = await getYouzanTicketInfo(ticketId);
                if (!result.success) {
                    return ctx.body = { success: false, msg: "未查询到优惠券id" }
                }
                const { status } = result.data;
                if (status !== 0) {
                    return ctx.body = { success: false, msg: "优惠券不可用" }
                }
                updateField.ticket_id = ticketId;
            }
            if (date) {
                updateField.date = date;
            }
            if (text) {
                updateField.text = text;
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                update_by: adminUid,
                updated: Math.floor(Date.now() / 1000),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await SurpriseTicket.update(
                {
                    ...baseField,
                    ...updateField,
                    status: status,
                    is_deleted: is_deleted
                },
                {
                    where: {
                        id: id,
                    }
                }
            );
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //新增签运文案
    async createLotteryText(ctx) {
        // { //传参
        //     type: "大吉",
        //     text: "今天天气好"
        // }
        try {
            const { type, text } = ctx.request.body || {};
            if (!type || !text) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                is_deleted: 0, //0-未删除，1-已删除
                create_by: adminUid,
                update_by: adminUid,
                created: Math.floor(Date.now() / 1000),
                updated: Math.floor(Date.now() / 1000),
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await LotteryText.create({
                ...baseField,
                type: type,
                text: text
            });
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //编辑签运文案
    async editLotteryText(ctx) {
        // { //传参
        //     id: 1001, //lottery_text表主键
        //     text: "今天天气好"
        // }
        try {
            let { id, text } = ctx.request.body || {};
            if (!id || !text) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            const updateField = {
                text: text
            };
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                update_by: adminUid,
                updated: Math.floor(Date.now() / 1000),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await LotteryText.update(
                {
                    ...baseField,
                    ...updateField
                },
                {
                    where: {
                        id: id,
                    }
                }
            );
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //删除签运文案
    async delLotteryText(ctx) {
        // { //传参
        //     id: 1001, //lottery_text表主键
        // }
        try {
            let { id } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            const adminUid = ctx.state.user?.uid;
            const baseField = {
                update_by: adminUid,
                updated: Math.floor(Date.now() / 1000),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await LotteryText.update(
                {
                    ...baseField,
                    is_deleted: 1
                },
                {
                    where: {
                        id: id,
                    }
                }
            );
            ctx.body = { success: true, data: true };
        } catch (error) {
            console.log(error);
        }
    }

    //查询消费送积分规则
    async getConsumeRule(ctx) {
        try {
            const list = [];
            const consumeRuleInfo = await ScoreTask.findAll({
                where: {
                    task_type: TASK_TYPE.CONSUME_TASK,
                    is_deleted: 0
                },
                order: [
                    ['sort', 'ASC']
                ],
            });
            if (consumeRuleInfo && consumeRuleInfo.length) {
                const uids = consumeRuleInfo.map(v => v.update_by);
                const petAdminMap = await this.getPetAdmin(uids);
                for (const item of consumeRuleInfo) {
                    let configData = item.config_data || { rate: 1 }; //默认消费转换倍率为1，不限制兑换频次
                    list.push({
                        taskId: item.task_id,
                        taskType: item.task_type,
                        taskKey: item.task_key,
                        key: item.task_description,
                        sort: item.sort,
                        value: configData,
                        updatePerson: petAdminMap.get(item.update_by) || "",
                        updateTime: item.updated_at
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

    //查询新用户任务规则
    async getNewUserRule(ctx) {
        try {
            const list = [];
            const newUserRuleInfo = await ScoreTask.findAll({
                where: {
                    task_type: TASK_TYPE.NEWUSER_TASK,
                    is_deleted: 0
                },
                order: [
                    ['sort', 'ASC']
                ],
            });
            if (newUserRuleInfo && newUserRuleInfo.length) {
                const uids = newUserRuleInfo.map(v => v.update_by);
                const petAdminMap = await this.getPetAdmin(uids);
                for (const item of newUserRuleInfo) {
                    let configData = item.config_data || { score: 0 }; //完成任务可获得积分数量
                    list.push({
                        taskId: item.task_id,
                        taskType: item.task_type,
                        taskKey: item.task_key,
                        key: item.task_description,
                        sort: item.sort,
                        value: configData,
                        updatePerson: petAdminMap.get(item.update_by) || "",
                        updateTime: item.updated_at
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

    //查询每日任务规则
    async getDailyRule(ctx) {
        try {
            const list = [];
            const dailyRuleInfo = await ScoreTask.findAll({
                where: {
                    task_type: TASK_TYPE.DAILY_TASK,
                    is_deleted: 0
                },
                order: [
                    ['sort', 'ASC']
                ],
            });
            if (dailyRuleInfo && dailyRuleInfo.length) {
                const uids = dailyRuleInfo.map(v => v.update_by);
                const petAdminMap = await this.getPetAdmin(uids);
                for (const item of dailyRuleInfo) {
                    let configData = item.config_data || { score: 5, unit: 'day', limit: 2 }; //默认每天最多兑换2次，每次5个积分 
                    list.push({
                        taskId: item.task_id,
                        taskType: item.task_type,
                        taskKey: item.task_key,
                        key: item.task_description,
                        sort: item.sort,
                        value: configData,
                        updatePerson: petAdminMap.get(item.update_by) || "",
                        updateTime: item.updated_at
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

    //查询连续签到设置
    async getSignRule(ctx) {
        try {
            const list = [];
            const signRuleInfo = await ScoreTask.findAll({
                where: {
                    task_type: TASK_TYPE.SIGN_TASK,
                    is_deleted: 0
                },
                order: [
                    ['sort', 'ASC']
                ],
            });
            if (signRuleInfo && signRuleInfo.length) {
                const uids = signRuleInfo.map(v => v.update_by);
                const petAdminMap = await this.getPetAdmin(uids);
                for (const item of signRuleInfo) {
                    let configData = item.config_data || { baseScore: 0, extraScore: 0 }; //默认基础奖励10积分，首次额外奖励10积分
                    if (configData && typeof configData === 'string') {
                        configData = JSON.parse(configData);
                    }
                    list.push({
                        taskId: item.task_id,
                        taskType: item.task_type,
                        taskKey: item.task_key,
                        key: item.task_description,
                        sort: item.sort,
                        baseScore: configData.baseScore || 0,
                        extraScore: configData.extraScore || 0,
                        updatePerson: petAdminMap.get(item.update_by) || "",
                        updateTime: item.updated_at
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

    //查询惊喜奖励设置
    async getSurpriseRule(ctx) {
        try {
            const { page = 1, pagesize = 10 } = ctx.request.body || {};
            let result = {};
            const surpriseRuleInfo = await ScoreTask.findOne({
                where: {
                    task_type: TASK_TYPE.OTHER_TASK,
                    task_key: TASK_KEY.SURPRISE,
                    is_deleted: 0
                },
            });
            if (surpriseRuleInfo) {
                let configData = surpriseRuleInfo.config_data || { min: 1, max: 10 }; //惊喜奖励保底，默认最低奖励1积分，最高奖励10积分
                if (configData && typeof configData === 'string') {
                    configData = JSON.parse(configData);
                }
                result = {
                    taskId: surpriseRuleInfo.task_id,
                    taskType: surpriseRuleInfo.task_type,
                    taskKey: surpriseRuleInfo.task_key,
                    key: surpriseRuleInfo.task_description,
                    sort: surpriseRuleInfo.sort,
                    min: configData.min || 0,
                    max: configData.max || 0,
                };
                // { // ticket's data structure
                //     id: 1,
                //     ticket_id: "xxmlmalalaskg",
                //     date: "2024-01-01",
                //     text: "今天天气好",
                //     status: "0",
                //     is_deleted: 0,
                //     create_by: adminUid,
                //     update_by: adminUid,
                //     created: Math.floor(Date.now() / 1000),
                //     updated: Math.floor(Date.now() / 1000),
                //     created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                //     updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                // }
                const options = {
                    page: page,
                    paginate: pagesize,
                    order: [['date', 'ASC']],
                    where: { is_deleted: 0 },
                }
                const { docs, pages, total } = await SurpriseTicket.paginate(options)
                if (_.isEmpty(docs)) {
                    result.ticket = {
                        data: [],
                        ...formatPagination({ total, page, pagesize, pages })
                    }
                }
                const uids = docs.map(v => v.update_by);
                const petAdminMap = await this.getPetAdmin(uids);
                const tickets = [];
                for (const item of docs) {
                    tickets.push({
                        id: item.id,
                        date: item.date,
                        ticketId: item.ticket_id,
                        text: item.text,
                        status: SURPRISE_TICKET_STATUS[item.status],
                        updatePerson: petAdminMap.get(item.update_by) || "",
                        updateTime: item.updated_at
                    });
                }
                result.ticket = {
                    data: tickets,
                    ...formatPagination({ total, page, pagesize, pages })
                }
            }
            ctx.body = {
                success: true,
                data: result
            }
        } catch (error) {
            console.log(error);
        }
    }

    //查询抽签文案设置
    async getLotteryText(ctx) {
        try {
            const { page = 1, pagesize = 10 } = ctx.request.body || {};
            let result = {};
            const luckTextInfo = await ScoreTask.findOne({
                where: {
                    task_type: TASK_TYPE.OTHER_TASK,
                    task_key: TASK_KEY.LUCK_TEXT,
                    is_deleted: 0
                }
            });
            if (luckTextInfo) {
                const uids = [luckTextInfo.update_by];
                const petAdminMap = await this.getPetAdmin(uids);
                let configData = luckTextInfo.config_data || { luck_list: [] }; //默认签运列表是空数组
                if (configData && typeof configData === 'string') {
                    configData = JSON.parse(configData);
                }
                result = {
                    taskId: luckTextInfo.task_id,
                    taskType: luckTextInfo.task_type,
                    taskKey: luckTextInfo.task_key,
                    key: luckTextInfo.task_description,
                    sort: luckTextInfo.sort,
                    value: configData?.luck_list || [],
                    updatePerson: petAdminMap.get(luckTextInfo.update_by) || "",
                    updateTime: luckTextInfo.updated_at
                };
                // { // lotteryText's data structure
                //     id: 1,
                //     type: "大吉",
                //     text: "今天天气好",
                //     is_deleted: 0,
                //     create_by: adminUid,
                //     update_by: adminUid,
                //     created: Math.floor(Date.now() / 1000),
                //     updated: Math.floor(Date.now() / 1000),
                //     created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                //     updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                // }
                const options = {
                    page: page,
                    paginate: pagesize,
                    order: [['id', 'ASC']],
                    where: { is_deleted: 0 },
                }
                const { docs, pages, total } = await LotteryText.paginate(options)
                if (_.isEmpty(docs)) {
                    result.list = {
                        data: [],
                        ...formatPagination({ total, page, pagesize, pages })
                    }
                }
                const list = [];
                for (const item of docs) {
                    list.push({
                        id: item.id,
                        type: item.type,
                        text: item.text
                    });
                }
                result.list = {
                    data: list,
                    ...formatPagination({ total, page, pagesize, pages })
                }
            }
            ctx.body = {
                success: true,
                data: result
            }
        } catch (error) {
            console.log(error);
        }
    }

    //查询现有的抽签文案类型
    async getLotteryType(ctx) {
        try {
            let base_sql = `SELECT DISTINCT type FROM lottery_text WHERE is_deleted = 0`;
            const result = await sequelize_pet.query(base_sql, {
                type: QueryTypes.SELECT
            });
            let lotteryTypes = [];
            if (result && result.length) {
                lotteryTypes = result.map(item => item.type);
            }
            ctx.body = {
                success: true,
                data: lotteryTypes
            }
        } catch (error) {
            console.log(error);
        }
    }

    //查看每日获取积分上限
    async getScoreLimit(ctx) {
        try {
            let result = {};
            const scoreLimit = await ScoreTask.findOne({
                where: {
                    task_type: TASK_TYPE.OTHER_TASK,
                    task_key: TASK_KEY.SCORE_LIMIT,
                    is_deleted: 0
                }
            });
            if (scoreLimit) {
                const uids = [scoreLimit.update_by];
                const petAdminMap = await this.getPetAdmin(uids);
                let configData = scoreLimit.config_data || { score: 1000 }; //默认每日获取积分上限是1000
                if (configData && typeof configData === 'string') {
                    configData = JSON.parse(configData);
                }
                result = {
                    taskId: scoreLimit.task_id,
                    taskType: scoreLimit.task_type,
                    taskKey: scoreLimit.task_key,
                    key: scoreLimit.task_description,
                    sort: scoreLimit.sort,
                    value: configData?.score || 0,
                    updatePerson: petAdminMap.get(scoreLimit.update_by) || "",
                    updateTime: scoreLimit.updated_at
                };
            }
            ctx.body = {
                success: true,
                data: result
            }
        } catch (error) {
            console.log(error);
        }
    }

    //查看屯罐计划玩法规则
    async getCollectText(ctx) {
        try {
            let result = {};
            const collectText = await ScoreTask.findOne({
                where: {
                    task_type: TASK_TYPE.OTHER_TASK,
                    task_key: TASK_KEY.COLLECT_TEXT,
                    is_deleted: 0
                }
            });
            if (collectText) {
                const uids = [collectText.update_by];
                const petAdminMap = await this.getPetAdmin(uids);
                let configData = collectText.config_data || { text: "" }; //默认屯罐计划玩法规则为空
                if (configData && typeof configData === 'string') {
                    configData = JSON.parse(configData);
                }
                result = {
                    taskId: collectText.task_id,
                    taskType: collectText.task_type,
                    taskKey: collectText.task_key,
                    key: collectText.task_description,
                    sort: collectText.sort,
                    value: configData?.text || "",
                    updatePerson: petAdminMap.get(collectText.update_by) || "",
                    updateTime: collectText.updated_at
                };
            }
            ctx.body = {
                success: true,
                data: result
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = TaskController
