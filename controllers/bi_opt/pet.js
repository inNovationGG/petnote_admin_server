/* eslint-disable no-unused-vars */
const {
    sequelize_pet,
    Pet,
    PetCate,
    PetAdminUser,
    UserBreeder,
    NotePet,
    SchedulePet
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const _ = require('lodash');
const { errorCodes, errorMessages } = require("../../constants/code");
const moment = require("moment");
const rpcService = require("../../services/rpcService");

class PetController {
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

    //获取宠物列表
    async petLists(ctx) {
        try {
            //id-宠物ID，uid-用户ID，nick_name-宠物昵称
            let { id, uid, nick_name, page = 1, pagesize = 10 } = ctx.request.body || {};
            let limit = parseInt(pagesize, 10);
            let where = {
                is_deleted: 0,//0-未删除，1-已删除，默认查询未删除的宠物
            };
            if (id !== undefined && id !== null && id !== "") {
                where.id = id;
            }
            if (uid !== undefined && uid !== null && id !== "") {
                where.uid = uid;
            }
            if (nick_name !== undefined && nick_name !== null && nick_name !== "") {
                where.nick_name = { [Op.like]: `%${nick_name}%` };
            }
            let cols = ['id', 'uid', 'nick_name', 'top_cate_id', 'cate_id', 'gender', 'birthday', 'homeday',
                'weight', 'weight_unit_id', 'kc_status', 'is_die', 'die_time', 'head_img'];
            let options = {
                attributes: cols,//返回字段
                page: page,//页码
                paginate: limit,//返回数据条数
                order: [['id', 'DESC']],//排序规则
                where: where,//查询条件
            }
            let { docs, pages, total } = await Pet.paginate(options)
            if (_.isEmpty(docs)) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
                        ...formatPagination({ total, page, limit, pages })
                    }
                }
            }
            //需要到pet_cate表查询每一条数据的品种id和品种名称name
            let pets = JSON.parse(JSON.stringify(docs));
            let cateIds = pets.reduce((result, item) => {
                if (!result.includes(item.cate_id)) {
                    result.push(item.cate_id);
                }
                return result;
            }, []);
            //根据cateIds查询pet_cate宠物品种表
            let petCates = await PetCate.findAll({
                where: {
                    id: {
                        [Op.in]: cateIds
                    }
                },
                attributes: ['id', 'name']
            });
            let petCateInfoMap = new Map();
            if (petCates && petCates.length) {
                for (let item of petCates) {
                    petCateInfoMap.set(item.id, item.name);
                }
            }
            for (let item of pets) {
                let petCateName = petCateInfoMap.get(item.cate_id);
                if (!petCateName) continue;
                item.cate_data = {
                    id: item.cate_id,
                    name: petCateName
                }
            }
            ctx.body = {
                success: true,
                data: {
                    data: pets,
                    ...formatPagination({ total, page, limit, pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //删除宠物档案
    async delPet(ctx) {
        try {
            let { pet_id } = ctx.request.body || {};
            if (!pet_id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let petInfo = await Pet.findOne({
                where: { id: pet_id, is_deleted: 0 },
                attributes: ['id']
            });
            if (!petInfo) {
                return ctx.body = { success: false, msg: "宠物删除失败-不存在或者已删除", code: errorCodes.PET_DELETED_ERROR }
            }
            try {
                await sequelize_pet.transaction(async (t) => {
                    let updatedCount = await Pet.update(
                        {
                            is_deleted: 1,
                            updated: Math.floor(Date.now() / 1000),
                            updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                        },
                        {
                            where: {
                                id: pet_id
                            }
                        },
                        { transaction: t }
                    );
                    if (!updatedCount || updatedCount[0] !== 1) {
                        throw new Error("宠物删档失败-删除失败");
                    }
                    //更新note_pet
                    await NotePet.update(
                        {
                            is_deleted_pet: 1,
                            updated: Math.floor(Date.now() / 1000)
                        },
                        {
                            where: {
                                pet_id: pet_id
                            }
                        },
                        { transaction: t }
                    );
                    //更新schedule_pet
                    await SchedulePet.update(
                        {
                            is_deleted_pet: 1,
                            updated: Math.floor(Date.now() / 1000)
                        },
                        {
                            where: {
                                pet_id: pet_id
                            }
                        },
                        { transaction: t }
                    );
                });
            } catch (error) {
                console.log("Transaction Error", error);
                return ctx.body = { success: false, msg: "Transaction Error", error }
            }
            ctx.body = {
                success: true,
                data: true
            }
        } catch (error) {
            console.log(error);
        }
    }
    //删除档案恢复
    async petDeletedRecover(ctx) {
        try {
            let { pet_id } = ctx.request.body || {};
            if (!pet_id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let pet = await Pet.findByPk(pet_id);
            if (!pet || pet.is_deleted !== 1) {
                return ctx.body = { success: false, msg: "宠物删档恢复失败-不存在或者未删除", code: errorCodes.PET_DELETED_RECOVER_ERROR }
            }
            try {
                await sequelize_pet.transaction(async (t) => {
                    let updatedCount = await Pet.update(
                        {
                            is_deleted: 0,
                            updated: Math.floor(Date.now() / 1000),
                            updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                        },
                        {
                            where: {
                                id: pet_id
                            }
                        },
                        { transaction: t }
                    );
                    if (!updatedCount || updatedCount[0] !== 1) {
                        throw new Error("宠物删档恢复失败-更新失败");
                    }
                    //更新note_pet
                    await NotePet.update(
                        {
                            is_deleted_pet: 0,
                            updated: Math.floor(Date.now() / 1000)
                        },
                        {
                            where: {
                                pet_id: pet_id
                            }
                        },
                        { transaction: t }
                    );
                    //更新schedule_pet
                    await SchedulePet.update(
                        {
                            is_deleted_pet: 0,
                            updated: Math.floor(Date.now() / 1000)
                        },
                        {
                            where: {
                                pet_id: pet_id
                            }
                        },
                        { transaction: t }
                    );
                });
            } catch (error) {
                console.log("Transaction Error", error);
                return ctx.body = { success: false, msg: "Transaction Error", error }
            }
            ctx.body = {
                success: true,
                data: true
            }
        } catch (error) {
            console.log(error);
        }
    }
    //修改宠物信息
    async petEdit(ctx) {
        try {
            let { id, nick_name, top_cate_id, cate_id, gender, kc_status, weight, weight_unit_id, birthday, homeday } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let petCateResult = await PetCate.findOne({
                where: { id: cate_id, pid: top_cate_id },
                attributes: ['id']
            });
            if (!petCateResult || !petCateResult.id) {
                return ctx.body = { success: false, msg: "宠物品种不存在", code: errorCodes.PET_EDIT_ERROR }
            }
            birthday = birthday ? Math.floor(new Date(birthday).getTime() / 1000) : 0;
            homeday = homeday ? Math.floor(new Date(homeday).getTime() / 1000) : 0;
            if (homeday < birthday) {
                return ctx.body = { success: false, msg: "宠物到家日期不能小于出生日期", code: errorCodes.PET_EDIT_ERROR }
            }
            weight = weight ? weight : 0;
            weight_unit_id = weight_unit_id ? weight_unit_id : 0;
            if (weight_unit_id == 17) {//体重单位是kg时，weight值需要乘1000
                weight = weight * 1000;
            }
            let updateBody = {
                nick_name: nick_name,
                top_cate_id: top_cate_id,
                cate_id: cate_id,
                gender: gender,
                kc_status: kc_status,
                weight: weight,
                weight_unit_id: weight_unit_id,
                birthday: birthday,
                homeday: homeday
            }
            await Pet.update(
                {
                    ...updateBody,
                    updated: Math.floor(Date.now() / 1000),
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                },
                {
                    where: {
                        id: id
                    }
                }
            );
            ctx.body = {
                success: true,
                data: 1
            }
        } catch (error) {
            console.log(error);
        }
    }
    //获取宠物详情
    async petInfo(ctx) {
        try {
            let { id } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            let cols = ['id', 'nick_name', 'uid', 'top_cate_id', 'cate_id', 'gender', 'birthday', 'homeday',
                'weight', 'weight_unit_id', 'kc_status', 'is_die', 'die_time', 'head_img', 'is_deleted'];
            let petResult = await Pet.findOne({
                where: { id: id },
                attributes: cols
            });
            if (!petResult) {
                return ctx.body = { success: false, data: null }
            }
            let petInfo = petResult.toJSON();
            if (petInfo && petInfo.cate_id) {
                let petCateResult = await PetCate.findOne({
                    where: { id: petInfo.cate_id },
                    attributes: ['id', 'name']
                });
                if (petCateResult) {
                    petInfo.cate_data = {
                        id: petCateResult.id || 0,
                        name: petCateResult.name || null
                    }
                }
            }
            petInfo.user_breeder_data = [];//共养人列表
            //根据宠物id查询user_breeder表，获取共养人信息
            if (petInfo && petInfo.id) {
                let breeder_sql = `
                    SELECT 
                        ub.id, u.uid, u.nick_name, u.mini_nick_name 
                    FROM   
                        user_breeder ub 
                    LEFT JOIN 
                        user u 
                    ON 
                        ub.uid = u.uid 
                    WHERE   
                        ub.pet_id = :petId 
                        AND 
                        ub.is_deleted = 0 
                        AND 
                        ub.breeder_type = 1`;
                let breederResults = await sequelize_pet.query(breeder_sql, {
                    replacements: { petId: petInfo.id },
                    type: QueryTypes.SELECT
                });
                petInfo.user_breeder_data = breederResults;
            }
            ctx.body = {
                success: true,
                data: petInfo
            }
        } catch (error) {
            console.log(error);
        }
    }
    //从宠星中移除宠物
    async petDieRecover(ctx) {
        try {
            let { pet_id } = ctx.request.body || {};
            if (!pet_id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            await Pet.update(
                {
                    is_die: 0,
                    die_time: 0,
                    updated: Math.floor(Date.now() / 1000),
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                },
                {
                    where: {
                        id: pet_id
                    }
                }
            );
            ctx.body = {
                success: true,
                data: true
            }
        } catch (error) {
            console.log(error);
        }
    }
    //新增/编辑宠物品种
    async editPetCate(ctx) {
        try {
            let param = ctx.request.body || {};
            let { id, pid, name, is_hot, f_letter, size } = param;
            if (pid == null || is_hot == null || f_letter == null || size == null) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            if (name == null || name === "") {
                return ctx.body = { success: false, msg: "宠物分类名称不可为空", code: errorCodes.PET_CATE_NAME_IS_EXIST };
            }
            const uid = ctx.state.user?.uid;
            let petCateResult = await PetCate.findOne({
                where: { pid: pid, name: name },
                attributes: ['id', 'name']
            });
            if (id == null) {//新增
                if (petCateResult && petCateResult.id) {
                    return ctx.body = { success: false, msg: "宠物分类名称已存在", code: errorCodes.PET_CATE_NAME_IS_EXIST }
                }
                this.petRedisDel("pet_cate_tree");//删除缓存中的宠物分类数据
                await PetCate.create({
                    ...param,
                    updated_by: uid,
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                });
            } else {//编辑
                let { id, ...restOfFields } = param;
                if (petCateResult && petCateResult.id && petCateResult.id !== id) {
                    return ctx.body = { success: false, msg: "宠物分类名称已存在", code: errorCodes.PET_CATE_NAME_IS_EXIST }
                }
                this.petRedisDel("pet_cate_tree");//删除缓存中的宠物分类数据
                await PetCate.update(
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
            }
            ctx.body = {
                success: true,
                data: true
            }
        } catch (error) {
            console.log(error);
        }
    }
    //根据宠物品种ID查询品种详情
    async getPetCateInfo(ctx) {
        try {
            let { id } = ctx.request.body || {};
            if (id == null) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let cols = ['id', 'pid', 'name', 'is_hot', 'f_letter', 'size', 'updated_at', 'updated_by'];
            let petCateResult = await PetCate.findOne({
                where: {
                    id: id,
                    pid: { [Op.ne]: 0 }
                },
                attributes: cols
            });
            ctx.body = {
                success: true,
                data: petCateResult
            }
        } catch (error) {
            console.log(error);
        }
    }
    //分页查询宠物品种列表
    async petCateLists(ctx) {
        try {
            let { pid, is_hot, name, page = 1, pagesize = 10 } = ctx.request.body || {};
            let limit = parseInt(pagesize, 10);
            let where = {
                pid: { [Op.ne]: 0 }//不查询（猫/狗/其他）这三个顶层类型
            };
            if (pid !== null && pid !== undefined && pid !== "") {
                where = {
                    ...where,
                    pid: pid
                }
            }
            if (is_hot !== null && is_hot !== undefined && is_hot !== "") {
                where.is_hot = is_hot;
            }
            if (name !== null && name !== undefined && name !== "") {
                where.name = { [Op.like]: `%${name}%` };
            }
            let cols = ['id', 'pid', 'name', 'is_hot', 'f_letter', 'size', 'updated_at', 'updated_by'];
            let options = {
                attributes: cols,//返回字段
                page: page,//页码
                paginate: limit,//返回数据条数
                order: [['id', 'DESC']],//排序规则
                where: where,//查询条件
            }
            let { docs, pages, total } = await PetCate.paginate(options);
            if (_.isEmpty(docs)) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
                        ...formatPagination({ total, page, limit, pages })
                    }
                }
            }
            let petCates = JSON.parse(JSON.stringify(docs));
            let userIds = petCates.reduce((result, item) => {
                if (!result.includes(item.updated_by)) {
                    result.push(item.updated_by);
                }
                return result;
            }, []);
            //根据userIds查询pet_admin.user表，获取uid，username，truenname
            let users = await PetAdminUser.findAll({
                where: {
                    uid: {
                        [Op.in]: userIds
                    }
                },
                attributes: ['uid', 'username', 'truename']
            });
            let userInfoMap = new Map();
            for (let user of users) {
                userInfoMap.set(user.uid, { uid: user.uid, username: user.username, truename: user.truename });
            }
            for (let item of petCates) {
                let userInfo = userInfoMap.get(item.updated_by);
                if (!userInfo) continue;
                item.updated_user = {
                    uid: item.updated_by,
                    username: userInfo.username,
                    truename: userInfo.truename
                }
            }
            ctx.body = {
                success: true,
                data: {
                    data: petCates,
                    ...formatPagination({ total, page, limit, pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //删除Redis中的宠物数据
    async petRedisDel(key) {
        try {
            // let key = "pet_cate_tree";
            // RPC 调用，调用宠本本服务端内部接口，删除redis中的宠物品种信息
            const url = `${process.env.PET_API_HOST}/api/v1/openapi/inside/petadmin/globals/redisdel`;
            const rpcRes = await rpcService.request(url, { key });
            const rpcResData = rpcRes?.data || null;
            if (rpcRes.code !== 200) {
                return { success: false, msg: "删除宠物API KEY错误", code: errorCodes.PET_EDIT_ERROR }
            }
            return rpcResData;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    //移除共养关系（根据user_breeder表的id字段做逻辑删除）
    async remove(ctx) {
        try {
            let { id } = ctx.request.body || {};
            if (!id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            await UserBreeder.update(
                {
                    is_deleted: 1,
                    updated: Math.floor(Date.now() / 1000),
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                },
                {
                    where: {
                        id: id
                    }
                }
            );
            ctx.body = {
                success: true,
                data: true
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = PetController
