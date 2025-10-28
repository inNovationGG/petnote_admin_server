const { User, Score, ScoreLog, sequelize_pet } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const _ = require('lodash');
const moment = require("moment");
const { SCORE_LOG_TYPE, SCORE_LOG_CHILD_TYPE } = require("../../constants/scoreLog");

class ScoreController {
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

    // 分页查询积分列表
    async getScoreList(ctx) {
        // { //传参
        //     searchText: "xxxxxx", //搜索内容
        //     page: 1,
        //     pagesize: 10,
        // }
        // { //返回结果
        //     "code": 200,
        //     "msg": "",
        //     "data": {
        //         "data": [ //列表数据
        //             {
        //                 "uid": "BWSS019992", //用户ID
        //                 "nickName": "Jack", //用户昵称
        //                 "phoneNumber": "12345678901", //手机号
        //                 "fishCount": 99, //小鱼干
        //                 "canCount": 10, //罐罐数量
        //                 "score": 1099, //总积分
        //             },
        //             //...其他用户的积分数据
        //         ],
        //         "totalCount": 1,
        //         "totalPage": 1,
        //         "currentPage": 1,
        //         "currentPageSize": 10
        //     }
        // }
        try {
            const { searchText, page = 1, pagesize = 10 } = ctx.request.body || {};
            const currentPage = parseInt(page, 10);
            const currentPagesize = parseInt(pagesize, 10);
            const skip = (currentPage - 1) * currentPagesize;
            let cond = `1 = 1`;
            if (![null, undefined, ""].includes(searchText)) {
                const users = await User.findAll({
                    where: {
                        [Op.or]: [
                            { uid: searchText },
                            { mini_nick_name: searchText },
                            { phone: searchText },
                        ]
                    },
                    attributes: ['uid']
                });
                if (users && users.length) {
                    cond += ` AND uid IN (${users.map(v => v.uid)})`
                }
            }
            let base_sql = `SELECT * FROM (SELECT uid, SUM(score) as score FROM score WHERE ${cond} GROUP BY uid ORDER BY score DESC) AS a`;
            let paginate_sql = `${base_sql} LIMIT ${skip}, ${currentPagesize}`;
            const result = await sequelize_pet.query(paginate_sql, {
                type: QueryTypes.SELECT
            });
            if (!result || !result.length) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
                        ...formatPagination({ total: 0, page: currentPage, limit: currentPagesize, pages: 0 })
                    }
                }
            }
            // 查总数据量
            let total_sql = `SELECT COUNT(*) AS ct FROM (${base_sql}) AS b`;
            const totalNum = await sequelize_pet.query(total_sql, {
                type: QueryTypes.SELECT
            });
            const total = totalNum?.[0]?.ct ?? 0;
            const pages = Math.ceil(total / currentPagesize);
            const lists = [];
            const userInfoMap = new Map();
            const userIds = result.map(v => v.uid);
            const userList = await User.findAll({
                where: {
                    uid: {
                        [Op.in]: userIds
                    }
                },
                attributes: ['uid', 'mini_nick_name', 'phone']
            });
            if (userList && userList.length) {
                for (const user of userList) {
                    const { uid, mini_nick_name, phone } = user;
                    userInfoMap.set(uid, { nickName: mini_nick_name, phoneNumber: phone });
                }
            }
            for (const item of result) {
                const { uid, score } = item;
                const nickName = userInfoMap.get(uid)?.nickName || '';
                const phoneNumber = userInfoMap.get(uid)?.phoneNumber || '';
                lists.push({
                    uid,
                    nickName,
                    phoneNumber,
                    fishCount: Number(score % 100),
                    canCount: Math.floor(score / 100),
                    score
                });
            }
            ctx.body = {
                success: true,
                data: {
                    data: lists,
                    ...formatPagination({ total: total, page: currentPage, limit: currentPagesize, pages: pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    // 调整积分
    async updateScore(ctx) {
        // { //传参
        //     uid: [1001, 1002], //用户id数组
        //     type: 0-新增，1-减少,
        //     score: 100, //增加或扣减的积分数量
        //     reason: "批量新增积分", //原因
        // }
        try {
            const { uids = [], type, reason, score } = ctx.request.body || {};
            if (!Array.isArray(uids) || !uids.length || ![0, 1].includes(type) || [null, undefined, ""].includes(reason) || !(Number.isInteger(score) && score > 0)) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            const adminUid = ctx.state.user?.uid;
            //新增积分记录时的通用属性
            const addBaseField = {
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
            //编辑记录时的通用属性
            const editBaseField = {
                update_by: adminUid,
                updated: Math.floor(Date.now() / 1000),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            //积分日志表通用属性
            const scoreLogField = {
                uid: adminUid,
                task_id: "",
                goods_id: "",
                type: SCORE_LOG_TYPE.INCREMENT, //0-增加，1-减少
                child_type: SCORE_LOG_CHILD_TYPE.INCRE_ADMIN, //5-管理员添加，9-管理员扣减
                score: score, //增加或减少的积分数量
                create_by: adminUid,
                created: Math.floor(Date.now() / 1000),
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                created_y: Number(moment().format("YYYY")),
                created_ym: Number(moment().format("YYYYMM")),
                created_ymd: Number(moment().format("YYYYMMDD")),
            }
            const inTime = Number(moment().format("YYYYMM")); //积分获取年月
            const outTime = Number(moment().add(1, 'years').format('YYYYMM')); //积分到期年月
            let existUids = []; //score表中存在积分记录的uid
            let nonExistUids = []; //score表中不存在积分记录的uid
            const userScoreMap = new Map(); //key: uid, value: [{ score_id, score }]
            const users = await Score.findAll({
                where: {
                    uid: {
                        [Op.in]: uids
                    }
                },
                order: [
                    ['uid', 'ASC'],
                    ['in_time', 'ASC'],
                ],
                attributes: ['uid', 'score_id', 'score']
            });
            let scoreIds = [];
            const incrementUpdateUids = []; //增加积分时，已经存在当前年月的积分记录，执行修改逻辑
            const incrementAddScores = []; //增加积分时，没有当前年月的积分记录，执行新增逻辑
            const incrementScoreLog = []; //积分增加的日志
            const decrementScoreLog = []; //积分扣减的日志
            if (users && users.length) {
                scoreIds = users.map(v => v.score_id);
                for (const user of users) {
                    const { uid, score_id, score } = user;
                    if (!userScoreMap.has(uid)) {
                        const scoreInfo = [{ score_id, score }];
                        userScoreMap.set(uid, scoreInfo);
                    } else {
                        const scoreInfo = userScoreMap.get(uid);
                        scoreInfo.push({ score_id, score });
                        userScoreMap.set(uid, scoreInfo);
                    }
                    if (!existUids.includes(uid)) {
                        existUids.push(uid);
                    }
                    if (score_id === `${uid}:${inTime}`) {
                        incrementUpdateUids.push(uid);
                    }
                }
            }
            for (const item of uids) {
                incrementScoreLog.push({
                    ...scoreLogField,
                    uid: item,
                    create_by: item
                });
                decrementScoreLog.push({
                    ...scoreLogField,
                    uid: item,
                    type: SCORE_LOG_TYPE.DECREMENT, //0-增加，1-减少
                    child_type: SCORE_LOG_CHILD_TYPE.DECRE_ADMIN, //5-管理员添加，9-管理员扣减
                    create_by: item
                });
                if (!scoreIds.includes(`${item}:${inTime}`)) {
                    incrementAddScores.push({
                        ...addBaseField,
                        score_id: `${item}:${inTime}`,
                        uid: item,
                        score: score,
                        in_time: inTime,
                        out_time: outTime,
                        reason: reason,
                    });
                }
            }
            nonExistUids = uids.filter(item => !existUids.includes(item));
            console.log('existUids ===>>>', existUids);
            console.log('nonExistUids ===>>>', nonExistUids);
            console.log('incrementUpdateUids ===>>>', incrementUpdateUids);
            //新增/扣除完成后需要添加记录至日志表
            try {
                await sequelize_pet.transaction(async (t) => {
                    if (type === 0) {
                        //增加积分，如果score表中没有某个uid当前月份的记录，则执行create逻辑，加积分算作当前月得到的积分
                        //修改已有的积分记录，增加score数量的积分
                        await Score.update(
                            {
                                score: sequelize_pet.literal(`score + ${score}`),
                                reason: reason,
                                ...editBaseField
                            },
                            {
                                where: {
                                    in_time: inTime,
                                    uid: {
                                        [Op.in]: incrementUpdateUids
                                    }
                                }
                            },
                            { transaction: t }
                        );
                        await Score.bulkCreate(incrementAddScores, { transaction: t });
                        //添加日志到score_log表中
                        await ScoreLog.bulkCreate(incrementScoreLog, { transaction: t });
                    } else {
                        //减少积分，如果score表中没有某个uid的记录，则提示未查询到用户，优先扣除最早获得的积分，最多扣到0
                        //如果存在未知用户，则返回失败和未知的用户id
                        if (nonExistUids.length) {
                            return ctx.body = { success: false, msg: "批量扣积分失败", data: nonExistUids }
                        }
                        const scoreConsumed = score; //需要消耗的积分数量
                        const updateToZeroIds = []; //用来存储需要清零的积分ID
                        const scoreUpdateList = []; //需要做减法的积分ID和积分数量 [{score_id, score}]
                        for (const item of uids) {
                            const scoreInfo = userScoreMap.get(item);
                            if (scoreInfo && scoreInfo.length) {
                                let minusId = ""; //需要做减法的积分ID
                                let minusScore = 0; //需要减去的积分值
                                let totalScore = 0; //积分累计
                                for (let i = 0; i < scoreInfo.length; i++) {
                                    const score = scoreInfo[i].score;
                                    const scoreId = scoreInfo[i].score_id;
                                    totalScore += score;
                                    //判断当前累计积分是否足够消耗
                                    if (totalScore >= scoreConsumed) {
                                        minusId = scoreId;
                                        minusScore = scoreConsumed - (totalScore - score);
                                        scoreUpdateList.push({
                                            score_id: minusId,
                                            score: minusScore
                                        });
                                        break;
                                    }
                                    updateToZeroIds.push(scoreId);
                                }
                            }
                        }
                        //需要清零的积分记录，执行修改逻辑
                        if (updateToZeroIds.length) {
                            await Score.update(
                                {
                                    score: 0,
                                    reason: reason,
                                    ...editBaseField
                                },
                                {
                                    where: {
                                        score_id: {
                                            [Op.in]: updateToZeroIds
                                        }
                                    }
                                },
                                { transaction: t }
                            );
                        }
                        //需要做减法的积分记录，执行修改逻辑
                        if (scoreUpdateList.length) {
                            for (const item of scoreUpdateList) {
                                const { score_id, score } = item;
                                await Score.update(
                                    {
                                        score: sequelize_pet.literal(`score - ${score}`),
                                        reason: reason,
                                        ...editBaseField
                                    },
                                    {
                                        where: {
                                            score_id: score_id,
                                        }
                                    },
                                    { transaction: t }
                                );
                            }
                        }
                        //添加日志到score_log表
                        if (updateToZeroIds.length || scoreUpdateList.length) {
                            await ScoreLog.bulkCreate(decrementScoreLog, { transaction: t });
                        }
                    }
                });
            } catch (error) {
                console.log("updateScore Transaction Error", error);
                return ctx.body = { success: false, msg: "updateScore Transaction Error", error }
            }
            ctx.body = { success: true, data: true }
        } catch (error) {
            console.log(error);
        }
    }

    //根据手机号验证用户是否存在
    async validateUserByPhone(ctx) {
        try {
            const { phones = [] } = ctx.request.body || {};
            if (!phones.length) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let existPhone = []; //真实存在的用户phone
            let existUids = []; //真实存在的用户uids
            let nonExistPhone = []; //不存在的用户
            const users = await User.findAll({
                where: {
                    phone: {
                        [Op.in]: phones
                    }
                },
                attributes: ['uid', 'phone']
            });
            if (users && users.length) {
                existPhone = users.map(item => item.phone);
                existUids = users.map(item => item.uid);
                nonExistPhone = phones.filter(item => !existPhone.includes(item));
            }
            ctx.body = {
                success: true,
                data: {
                    existUids: existUids,
                    nonExistPhone: nonExistPhone
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = ScoreController
