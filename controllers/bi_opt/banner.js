/* eslint-disable no-unused-vars */
const { Banner, PetAdminUser } = require("../../models");
const { Op } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const _ = require('lodash');
const moment = require("moment");

class BannerController {
    // 查询banner列表
    async getLists(ctx) {
        try {
            let { type, tag, start_time, end_time, page = 1, pagesize = 10 } = ctx.request.body || {};
            let limit = parseInt(pagesize, 10);
            let where = {};
            if (type !== undefined && type !== null && type !== "") {
                where.type = type;
            }
            if (tag !== undefined && tag !== null && tag !== "") {
                where.tag = tag;
            }
            if (start_time !== undefined && start_time !== null && start_time !== "") {
                where.start_time = { [Op.gte]: start_time };
            }
            if (end_time !== undefined && end_time !== null && end_time !== "") {
                where.end_time = { [Op.lte]: end_time };
            }
            let cols = ['id', 'title', 'pic', 'description', 'type', 'tag', 'url_type', 'url', 'time_type', 'start_time', 'end_time',
                'sort', 'data_tracking', 'status', 'is_deleted', 'created_at', 'created_by', 'updated_at', 'updated_by', 'created'];
            let options = {
                attributes: cols,//返回字段
                page: page,//页码
                paginate: limit,//返回数据条数
                order: [['id', 'DESC']],//排序规则
                where: where,//查询条件
            }
            let { docs, pages, total } = await Banner.paginate(options)
            if (_.isEmpty(docs)) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
                        ...formatPagination({ total, page, limit, pages })
                    }
                }
            }
            let _docs = JSON.parse(JSON.stringify(docs));
            let uids = _docs.reduce((result, item) => {
                let { created_by, updated_by } = item;
                if (created_by && !result.includes(created_by)) {
                    result.push(created_by);
                }
                if (updated_by && !result.includes(updated_by)) {
                    result.push(updated_by);
                }
                return result;
            }, []);
            let users = await PetAdminUser.findAll({
                where: {
                    uid: {
                        [Op.in]: uids
                    }
                },
                attributes: ['uid', 'username', 'truename']
            });
            let userInfoMap = new Map();
            for (let user of users) {
                userInfoMap.set(user.uid, { uid: user.uid, username: user.username, truename: user.truename });
            }
            for (let item of _docs) {
                if (new Date() < new Date(item.end_time)) {
                    item.custom_status = 1;//进行中
                } else {
                    item.custom_status = 2;//已过期
                }
                let creatorInfo = userInfoMap.get(item.created_by);
                let updaterInfo = userInfoMap.get(item.updated_by);
                if (creatorInfo) {
                    item.created_user = {
                        uid: creatorInfo.uid,
                        username: creatorInfo.username,
                        truename: creatorInfo.truename
                    };
                } else {
                    item.created_user = {
                        uid: 0,
                        username: "",
                        truename: ""
                    };
                }
                if (updaterInfo) {
                    item.updated_user = {
                        uid: updaterInfo.uid,
                        username: updaterInfo.username,
                        truename: updaterInfo.truename
                    };
                } else {
                    item.updated_user = {
                        uid: 0,
                        username: "",
                        truename: ""
                    };
                }
            }
            ctx.body = {
                success: true,
                data: {
                    data: _docs,
                    ...formatPagination({ total, page, limit, pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    // 删除指定banner
    async delInfo(ctx) {
        try {
            let { id } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            const uid = ctx.state.user?.uid;
            await Banner.update(
                {
                    is_deleted: 1,
                    updated_by: uid,
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
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
    // 新增/修改banner
    async createOrUpdateBanner(ctx) {
        // {
        //     "title": "哈哈哈0527",
        //     "pic": "https://petnote-bbl-testing.oss-cn-shanghai.aliyuncs.com/plan/2024-05-27/3db1c0e5cc4ba99d46c0187001e9e538.jpg",
        //     "description": "",
        //     "type": 3,
        //     "tag": "SCREEN_INDEX",
        //     "url_type": 1,
        //     "url": "",
        //     "time_type": 2,
        //     "start_time": "2024-05-01 00:00:00",
        //     "end_time": "2024-05-31 00:00:00",
        //     "sort": 1,
        //     "data_tracking": ""
        // }
        try {
            let param = ctx.request.body || {};
            let { id, title, pic, description = "", type = 1, tag, url_type = 0, url = "", time_type = 1, start_time, end_time, sort = 1, data_tracking = "", status = 1 } = param;
            // if (!(title && start_time && end_time && sort && pic && tag && type && url_type && time_type)) {
            //     return ctx.body = { success: false, msg: "参数缺失" };
            // }
            const requiredParams = [
                'title',
                'start_time',
                'end_time',
                'sort',
                'pic',
                'tag',
                'type',
                'url_type',
                'time_type'
            ];
            if (requiredParams.some(key => [null, undefined, ""].includes(param[key]))) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            const uid = ctx.state.user?.uid;
            if (!id) {//新增banner
                await Banner.create({
                    ...param,
                    created_by: uid,
                    created: Math.floor(Date.now() / 1000),
                    created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                });
                ctx.body = { success: true, data: true }
            } else {
                let { id, ...restOfFields } = param;
                await Banner.update(
                    {
                        ...restOfFields,
                        updated_by: uid,
                        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                    },
                    {
                        where: {
                            id: id
                        }
                    }
                );
                ctx.body = { success: true, data: true }
            }
        } catch (error) {
            console.log(error);
        }
    }
    // 获取指定banner信息
    async getInfo(ctx) {
        try {
            let { id } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            let banner = await Banner.findByPk(id);
            ctx.body = { success: true, data: banner };
        } catch (error) {
            console.log(error);
        }
    }
    // 修改指定banner的status（1-在线，2-失效）
    async updateStatusById(ctx) {
        try {
            let { id, status } = ctx.request.body || {};
            if (!(id && status)) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            await Banner.update(
                {
                    status: status,
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
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
}

module.exports = BannerController
