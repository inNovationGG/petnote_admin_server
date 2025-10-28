/* eslint-disable no-unused-vars */
const {
    Note,
    NotePet,
    User,
    NoteImage,
    Messages,
    PetAdminUser,
    sequelize_pet
} = require("../../models");
const { Op } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const _ = require('lodash');
const { errorCodes, errorMessages } = require("../../constants/code");
const rpcService = require("../../services/rpcService");

class NoteController {
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

    //获取待审核列表
    async getAuditNoteList(ctx) {
        try {
            let { flag = 1, from_type, search_name, start_time, end_time, page = 1, pagesize = 10 } = ctx.request.body || {};
            let limit = parseInt(pagesize, 10);
            let cond = {
                is_deleted: 0
            };
            let order = [['id', 'DESC']];//排序规则
            if (flag == 1) {//待审核
                cond.status = 12;
                order = [['updated', 'DESC']];
            } else if (flag == 2) {//已审核
                cond.status = {
                    [Op.in]: [0, 1]
                }
                order = [['updated', 'DESC']];
                cond.from_source = 1;
                if (from_type == 1) {
                    cond.from_uid = {
                        [Op.gt]: 0
                    }
                } else if (from_type == 2) {
                    cond.from_uid = 0
                }
            }
            let userCond = {};
            if (![null, undefined, ""].includes(search_name)) {
                userCond.mini_nick_name = {
                    [Op.like]: `%${search_name}%`
                };
                let users = await User.findAll({
                    where: {
                        ...userCond
                    },
                    attributes: ['uid']
                });
                if (!users || !users.length) {
                    return ctx.body = {
                        success: true,
                        data: {
                            data: [],
                            ...formatPagination({ total: 0, page, limit, pages: 0 })
                        }
                    }
                }
                let userIds = users.map(item => item.uid);
                cond.uid = {
                    [Op.in]: userIds
                }
            }
            if (![null, undefined, ""].includes(start_time)) {
                cond.updated = {
                    [Op.gte]: Math.floor(new Date(start_time).getTime() / 1000)
                }
            }
            if (![null, undefined, ""].includes(end_time)) {
                let startTimeStamp = Math.floor(new Date(start_time).getTime() / 1000);
                let endTimeStamp = Math.floor(new Date(end_time).getTime() / 1000);
                if (cond.updated) {//是否已经设置开始时间
                    cond.updated = {
                        [Op.between]: [startTimeStamp, endTimeStamp]
                    }
                } else {
                    cond.updated = {
                        [Op.lte]: endTimeStamp
                    }
                }
            }
            let cols = ['id', 'uid', 'note_time', 'created', 'updated', 'status', 'desc_audit_ext', 'from_source', 'from_uid'];
            let options = {
                attributes: cols,//返回字段
                page: page,//页码
                paginate: limit,//返回数据条数
                order: [['updated', 'DESC']],//排序规则
                where: cond,//查询条件
            }
            let { docs, pages, total } = await Note.paginate(options);
            if (_.isEmpty(docs)) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
                        ...formatPagination({ total, page, limit, pages })
                    }
                }
            }
            let notes = JSON.parse(JSON.stringify(docs));
            let fromUids = notes.map(item => item.from_uid);
            let uniqueFromUids = [...new Set(fromUids)];
            let adminUsers = {};//pet_admin.user：后台用户
            if (uniqueFromUids && uniqueFromUids.length) {
                let adminUser_result = await PetAdminUser.findAll({
                    where: {
                        uid: {
                            [Op.in]: uniqueFromUids
                        }
                    }
                });
                adminUsers = adminUser_result.reduce((acc, user) => {
                    acc[user.uid] = user;
                    return acc;
                }, {});
            }
            let uids = notes.map(item => item.uid);
            let uniqueUids = [...new Set(uids)];
            let users = {};//pet.user：用户
            if (uniqueUids && uniqueUids.length) {
                let user_result = await User.findAll({
                    where: {
                        uid: {
                            [Op.in]: uniqueUids
                        }
                    },
                    attributes: ['uid', 'nick_name', 'mini_nick_name']
                });
                users = user_result.reduce((acc, user) => {
                    acc[user.uid] = user;
                    return acc;
                }, {});
            }
            let nids = notes.map(item => item.id);
            let uniqueNids = [...new Set(nids)];
            let noteImages = {};//图片：key:nid，value:noteImage[]
            if (uniqueNids && uniqueNids.length) {
                let noteImage_result = await NoteImage.findAll({
                    where: {
                        nid: {
                            [Op.in]: uniqueNids
                        },
                        is_deleted: 0
                    },
                    attributes: ['id', 'nid', 'type', 'status']
                });
                for (let item of noteImage_result) {
                    if (!noteImages[item.nid]) {
                        noteImages[item.nid] = [item];
                    } else {
                        noteImages[item.nid].push(item);
                    }
                }
            }
            for (let item of notes) {
                const { id, from_uid, uid, desc_audit_ext } = item;
                item.admin_user = adminUsers[from_uid] || "";
                item.user = users[uid] || "";
                item.audit_reason = [];
                if (flag == 1) {//待审核
                    // 阿里审核操作的解析  
                    if (desc_audit_ext) {
                        const descAuditExt = typeof desc_audit_ext !== "object" ? JSON.parse(desc_audit_ext) : desc_audit_ext;
                        if (descAuditExt.status == 1) {
                            item.audit_reason.push({
                                flag: 1,
                                name: "文本"
                            });
                        }
                    }
                    if (noteImages[id]) {
                        let imgFlag = false;
                        let videoFlag = false;
                        noteImages[id].forEach(s => {
                            if (s.status == 1) {//status：0-正常，1-异常违规
                                if (s.type == 0) {//type：0-图片，1-视频
                                    imgFlag = true;
                                } else if (s.type == 1) {
                                    videoFlag = true;
                                }
                            }
                        });
                        if (imgFlag) {
                            item.audit_reason.push({
                                flag: 2,
                                name: "图片"
                            });
                        }
                        if (videoFlag) {
                            item.audit_reason.push({
                                flag: 3,
                                name: "视频"
                            });
                        }
                    }
                }
            }
            ctx.body = {
                success: true,
                data: {
                    data: notes,
                    ...formatPagination({ total, page, limit, pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //获取已审核列表
    async getReviewNoteList(ctx) {
        try {
            let { flag = 2, from_type, search_name, start_time, end_time, page = 1, pagesize = 10 } = ctx.request.body || {};
            let limit = parseInt(pagesize, 10);
            let cond = {
                is_deleted: 0
            };
            let order = [['id', 'DESC']];//排序规则
            if (flag == 1) {//待审核
                cond.status = 12;
                order = [['updated', 'DESC']];
            } else if (flag == 2) {//已审核
                cond.status = {
                    [Op.in]: [0, 1]
                }
                order = [['updated', 'DESC']];
                cond.from_source = 1;
                if (from_type == 1) {
                    cond.from_uid = {
                        [Op.gt]: 0
                    }
                } else if (from_type == 2) {
                    cond.from_uid = 0
                }
            }
            let userCond = {};
            if (![null, undefined, ""].includes(search_name)) {
                userCond.mini_nick_name = {
                    [Op.like]: `%${search_name}%`
                };
                let users = await User.findAll({
                    where: {
                        ...userCond
                    },
                    attributes: ['uid']
                });
                if (!users || !users.length) {
                    return ctx.body = {
                        success: true,
                        data: {
                            data: [],
                            ...formatPagination({ total: 0, page, limit, pages: 0 })
                        }
                    }
                }
                let userIds = users.map(item => item.uid);
                cond.uid = {
                    [Op.in]: userIds
                }
            }
            if (![null, undefined, ""].includes(start_time)) {
                cond.updated = {
                    [Op.gte]: Math.floor(new Date(start_time).getTime() / 1000)
                }
            }
            if (![null, undefined, ""].includes(end_time)) {
                let startTimeStamp = Math.floor(new Date(start_time).getTime() / 1000);
                let endTimeStamp = Math.floor(new Date(end_time).getTime() / 1000);
                if (cond.updated) {//是否已经设置开始时间
                    cond.updated = {
                        [Op.between]: [startTimeStamp, endTimeStamp]
                    }
                } else {
                    cond.updated = {
                        [Op.lte]: endTimeStamp
                    }
                }
            }
            let cols = ['id', 'uid', 'note_time', 'created', 'updated', 'status', 'desc_audit_ext', 'from_source', 'from_uid'];
            let options = {
                attributes: cols,//返回字段
                page: page,//页码
                paginate: limit,//返回数据条数
                order: [['updated', 'DESC']],//排序规则
                where: cond,//查询条件
            }
            let { docs, pages, total } = await Note.paginate(options);
            if (_.isEmpty(docs)) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
                        ...formatPagination({ total, page, limit, pages })
                    }
                }
            }
            let notes = JSON.parse(JSON.stringify(docs));
            let fromUids = notes.map(item => item.from_uid);
            let uniqueFromUids = [...new Set(fromUids)];
            let adminUsers = {};//pet_admin.user：后台用户
            if (uniqueFromUids && uniqueFromUids.length) {
                let adminUser_result = await PetAdminUser.findAll({
                    where: {
                        uid: {
                            [Op.in]: uniqueFromUids
                        }
                    }
                });
                adminUsers = adminUser_result.reduce((acc, user) => {
                    acc[user.uid] = user;
                    return acc;
                }, {});
            }
            let uids = notes.map(item => item.uid);
            let uniqueUids = [...new Set(uids)];
            let users = {};//pet.user：用户
            if (uniqueUids && uniqueUids.length) {
                let user_result = await User.findAll({
                    where: {
                        uid: {
                            [Op.in]: uniqueUids
                        }
                    },
                    attributes: ['uid', 'nick_name', 'mini_nick_name']
                });
                users = user_result.reduce((acc, user) => {
                    acc[user.uid] = user;
                    return acc;
                }, {});
            }
            let nids = notes.map(item => item.id);
            let uniqueNids = [...new Set(nids)];
            let noteImages = {};//图片：key:nid，value:noteImage[]
            if (uniqueNids && uniqueNids.length) {
                let noteImage_result = await NoteImage.findAll({
                    where: {
                        nid: {
                            [Op.in]: uniqueNids
                        },
                        is_deleted: 0
                    },
                    attributes: ['id', 'nid', 'type', 'status']
                });
                for (let item of noteImage_result) {
                    if (!noteImages[item.nid]) {
                        noteImages[item.nid] = [item];
                    } else {
                        noteImages[item.nid].push(item);
                    }
                }
            }
            for (let item of notes) {
                const { id, from_uid, uid, desc_audit_ext } = item;
                item.admin_user = adminUsers[from_uid] || "";
                item.user = users[uid] || "";
                item.audit_reason = [];
                if (flag == 1) {//待审核
                    // 阿里审核操作的解析  
                    if (desc_audit_ext) {
                        const descAuditExt = typeof desc_audit_ext !== "object" ? JSON.parse(desc_audit_ext) : desc_audit_ext;
                        if (descAuditExt.status == 1) {
                            item.audit_reason.push({
                                flag: 1,
                                name: "文本"
                            });
                        }
                    }
                    if (noteImages[id]) {
                        let imgFlag = false;
                        let videoFlag = false;
                        noteImages[id].forEach(s => {
                            if (s.status == 1) {//status：0-正常，1-异常违规
                                if (s.type == 0) {//type：0-图片，1-视频
                                    imgFlag = true;
                                } else if (s.type == 1) {
                                    videoFlag = true;
                                }
                            }
                        });
                        if (imgFlag) {
                            item.audit_reason.push({
                                flag: 2,
                                name: "图片"
                            });
                        }
                        if (videoFlag) {
                            item.audit_reason.push({
                                flag: 3,
                                name: "视频"
                            });
                        }
                    }
                }
            }
            ctx.body = {
                success: true,
                data: {
                    data: notes,
                    ...formatPagination({ total, page, limit, pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //人工审核下一个
    async auditNext(ctx) {
        try {
            let { id, start_time, end_time } = ctx.request.body || {};
            if ([null, undefined, ""].includes(id) || !start_time || !end_time) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            //status：0-正常，1-失败，10-待审核，11-阿里审核中，12-人工审核
            let allNotes = await Note.findAll({
                where: {
                    status: 12,
                    is_deleted: 0,
                    updated_at: {
                        [Op.between]: [start_time, end_time]
                    }
                },
                attributes: ["id", "status"],
                order: [['updated', 'DESC']],
            });
            if (!allNotes || !allNotes.length) {
                return ctx.body = {
                    success: true,
                    data: null
                }
            }
            let notes = JSON.parse(JSON.stringify(allNotes));
            let nextNote = null;
            for (let i = 0; i < notes.length; i++) {
                if (notes[i].id == id && i < notes.length - 1) {
                    nextNote = notes[i + 1];
                }
            }
            ctx.body = {
                success: true,
                data: nextNote
            }
        } catch (error) {
            console.log(error);
        }
    }
    //审核状态
    async auditStatus(ctx) {
        try {
            //id：记录id
            //mark：备注
            // status：0-正常，1-失败，10-待审核，11-阿里审核中，12-人工审核
            let { id, status, mark } = ctx.request.body || {};
            if ([null, undefined, ""].includes(id) || [null, undefined, ""].includes(status)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            const uid = ctx.state.user?.uid;
            let note = await Note.findOne({
                where: {
                    id: id,
                    is_deleted: 0,
                },
                attributes: ["id", "uid", "status"]
            });
            if (!note || !note.id || note.status != 12) {
                return ctx.body = { success: false, code: errorCodes.NOTE_NOT_AUDIT_ERROR, msg: errorMessages[errorCodes.NOTE_NOT_AUDIT_ERROR] }
            }
            if (status != 0 && status != 1) {
                return ctx.body = { success: false, code: errorCodes.NOTE_AUDIT_STATUS_ERROR, msg: errorMessages[errorCodes.NOTE_AUDIT_STATUS_ERROR] }
            }
            let nowTime = Math.floor(Date.now() / 1000);
            let fromSource = 1;//来源：0-小程序 1-后台审核
            try {
                const result = await sequelize_pet.transaction(async (t) => {
                    //更新note表
                    let noteUpdatedCount = await Note.update(
                        {
                            status: status,
                            mark: mark,
                            from_source: fromSource,
                            from_uid: uid
                        },
                        {
                            where: {
                                id: id
                            }
                        },
                        { transaction: t }
                    )
                    if (!noteUpdatedCount || noteUpdatedCount[0] != 1) {
                        throw new Error("记录审核状态修改失败");
                    }
                    //更新notePet表的记录状态
                    let notePetUpdatedCount = await NotePet.update(
                        {
                            status: status
                        },
                        {
                            where: {
                                nid: id
                            }
                        },
                        { transaction: t }
                    );
                    if (!notePetUpdatedCount || notePetUpdatedCount[0] != 1) {
                        throw new Error("宠物记录审核状态修改失败");
                    }
                    if (status == 0 || status == 1) {
                        let desc = status == 1 ? "记录审核失败" : "记录审核成功";
                        let messages = {
                            for_uid: note.uid,//操作用户id
                            to_uid: note.uid,//接受用户id
                            note_id: id,//记录id
                            reply_uid: 0,//被回复的用户id
                            comment_id: 0,//评论id
                            msg_type: 10,//消息类型：1：评论，2 点赞 , 0 未知 10-记录审核
                            desc: desc,//记录描述
                            content: mark,//回复/评论内容
                            from_source: fromSource,//来源：0-小程序 1-后台系统
                            from_uid: uid,//来源uid
                            status: status,//状态 0-成功 1-失败
                            created: nowTime,
                            updated: nowTime
                        };
                        //添加消息
                        await Messages.create({ ...messages }, { transaction: t });
                        //写入新消息数量到缓存
                        await this.setUserNewMessageCount(note.uid);
                    }
                });
            } catch (error) {
                console.log("auditStatus Transaction Error", error);
                return ctx.body = { success: false, msg: "auditStatus Transaction Error", error }
            }
            ctx.body = { success: true, data: null }
        } catch (error) {
            console.log(error);
        }
    }
    //获取审核记录
    async getAuditNote(ctx) {
        try {
            let { id } = ctx.request.body || {};
            if ([null, undefined, ""].includes(id)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let noteResult = await Note.findOne({
                where: {
                    id: id
                },
                attributes: ['id', 'uid', 'desc', 'note_time', 'created', 'updated', 'status', 'task_id', 'desc_audit_ext', 'from_source', 'from_uid']
            });
            if (!noteResult) {
                return ctx.body = { success: false, msg: "记录不存在" }
            }
            let note = JSON.parse(JSON.stringify(noteResult));
            let user = await User.findOne({
                where: {
                    uid: note.uid
                },
                attributes: ['uid', 'nick_name', 'mini_nick_name']
            });
            note.user = user;
            note.admin_user = {};
            if (![null, undefined, ""].includes(note.from_uid)) {
                let adminUser_result = await PetAdminUser.findOne({
                    where: {
                        uid: note.from_uid
                    }
                });
                note.admin_user = adminUser_result || {};
            }
            let descExt = [];
            let txtFlag = 0;
            if (note.desc_audit_ext) {
                let descAuditExt = typeof note.desc_audit_ext !== "object" ? JSON.parse(note.desc_audit_ext) : note.desc_audit_ext;
                if (descAuditExt.results) {
                    //阿里审核扩展
                    for (let item of descAuditExt.results) {
                        let f = 0;
                        if (item.label !== "normal") {
                            f = 1;
                            txtFlag = 1;
                        }
                        descExt.push({
                            status: f,
                            scene: item.scene || "",
                            label_result: item.label_result || ""
                        });
                    }
                }
                note.desc_audit_ext = descExt;
                note.desc_status = txtFlag;
            }
            //获取图片集合
            let noteImage_result = await NoteImage.findAll({
                where: {
                    nid: id,
                    is_deleted: 0
                },
                attributes: ['id', 'nid', 'url', 'type', 'status', 'task_id', 'audit_ext']
            });
            if (noteImage_result && noteImage_result.length) {
                let noteImages = JSON.parse(JSON.stringify(noteImage_result));
                let imgs = [];
                let videos = [];
                for (let item of noteImages) {
                    let ext = [];
                    if (item.audit_ext) {
                        //阿里审核扩展
                        let auditExt = typeof item.audit_ext !== "object" ? JSON.parse(item.audit_ext) : item.audit_ext;
                        if (auditExt.results) {
                            for (let res of auditExt.results) {
                                let f = 0;
                                if (res.label !== "normal") {
                                    f = 1;
                                }
                                ext.push({
                                    status: f,
                                    scene: res.scene || "",
                                    label_result: res.label_result || ""
                                });
                            }
                        }
                    }
                    item.audit_ext = ext;
                    if (item.type == 0) {
                        imgs.push(item);
                    } else if (item.type == 1) {
                        videos.push(item);
                    }
                }
                note.note_image = imgs;
                note.note_video = videos;
            }
            ctx.body = {
                success: true,
                data: note
            }
        } catch (error) {
            console.log(error);
        }
    }
    //复审状态
    async reviewStatus(ctx) {
        try {
            //id：记录id
            //mark：备注
            // status：0-正常，1-失败，10-待审核，11-阿里审核中，12-人工审核
            let { id, status, mark } = ctx.request.body || {};
            if ([null, undefined, ""].includes(id) || [null, undefined, ""].includes(status)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            const uid = ctx.state.user?.uid;
            let note = await Note.findOne({
                where: {
                    id: id,
                    is_deleted: 0,
                },
                attributes: ["id", "uid", "status"]
            });
            if (!note || !note.id) {
                return ctx.body = { success: false, code: errorCodes.NOTE_NOT_EXIST, msg: errorMessages[errorCodes.NOTE_NOT_EXIST] }
            }
            if (![0, 1, 10, "0", "1", "10"].includes(status)) {
                return ctx.body = { success: false, code: errorCodes.NOTE_AUDIT_STATUS_ERROR, msg: errorMessages[errorCodes.NOTE_AUDIT_STATUS_ERROR] }
            }
            let nowTime = Math.floor(Date.now() / 1000);
            let fromSource = 1;//来源：0-小程序 1-后台审核
            try {
                const result = await sequelize_pet.transaction(async (t) => {
                    //更新note表
                    let noteUpdatedCount = await Note.update(
                        {
                            status: status,
                            mark: mark,
                            from_source: fromSource,
                            from_uid: uid
                        },
                        {
                            where: {
                                id: id
                            }
                        },
                        { transaction: t }
                    )
                    if (!noteUpdatedCount || noteUpdatedCount[0] != 1) {
                        throw new Error("记录审核状态修改失败");
                    }
                    //更新notePet表的记录状态
                    let notePetUpdatedCount = await NotePet.update(
                        {
                            status: status
                        },
                        {
                            where: {
                                nid: id
                            }
                        },
                        { transaction: t }
                    );
                    if (!notePetUpdatedCount || notePetUpdatedCount[0] != 1) {
                        throw new Error("宠物记录审核状态修改失败");
                    }
                    //对审核失败操作
                    if (status == 1) {
                        let desc = "记录审核失败";
                        let messages = {
                            for_uid: note.uid,//操作用户id
                            to_uid: note.uid,//接受用户id
                            note_id: id,//记录id
                            reply_uid: 0,//被回复的用户id
                            comment_id: 0,//评论id
                            msg_type: 10,//消息类型：1-评论，2-点赞 , 0-未知 10-记录审核
                            desc: desc,//记录描述
                            content: mark,//回复/评论内容
                            from_source: fromSource,//来源：0-小程序 1-后台系统
                            from_uid: uid,//来源uid
                            status: status,//状态 0-成功 1-失败
                            created: nowTime,
                            updated: nowTime
                        };
                        //添加消息
                        await Messages.create({ ...messages }, { transaction: t });
                        //写入新消息数量到缓存
                        await this.setUserNewMessageCount(note.uid);
                    }
                });
            } catch (error) {
                console.log("reviewStatus Transaction Error", error);
                return ctx.body = { success: false, msg: "reviewStatus Transaction Error", error }
            }
            ctx.body = { success: true, data: null }
        } catch (error) {
            console.log(error);
        }
    }

    // 调用 pet 服务接口，记录消息数量至redis
    async setUserNewMessageCount(key) {
        try {
            // RPC 调用，调用宠本本服务端内部接口，记录消息数量
            const url = `${process.env.PET_API_HOST}/api/v1/openapi/inside/petadmin/user/setmessage`;
            const rpcRes = await rpcService.request(url, { key });
            const rpcResData = rpcRes?.data || null;
            if (rpcRes.code !== 200) {
                return { success: false, msg: "新增用户消息错误", code: errorCodes.PET_EDIT_ERROR }
            }
            return rpcResData;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

module.exports = NoteController
