/* eslint-disable no-unused-vars */
const { sequelize_pet, User, Pet } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const _ = require('lodash');
class UserController {
    async userSearchList(ctx) {
        try {
            let { uid, mini_nick_name, phone, page = 1, pagesize = 10 } = ctx.request.body || {};
            let limit = parseInt(pagesize, 10);
            let where = {
                is_deleted: 0//默认查询未删除的用户
            };
            if (uid !== undefined && uid !== null && uid !== "") {
                where.uid = uid;
            }
            if (mini_nick_name !== undefined && mini_nick_name !== null && mini_nick_name !== "") {
                where.mini_nick_name = { [Op.like]: `%${mini_nick_name}%` };
            }
            if (phone !== undefined && phone !== null && phone !== "") {
                where.phone = phone;
            }
            let cols = ['uid', 'nick_name', 'mini_nick_name', 'gender', 'birthday', 'avatar_url', 'phone', 'city', 'province', 'country',
                'region_first', 'region_second', 'region_third', 'ip_province', 'ip_city', 'ip_area'];
            let options = {
                attributes: cols,//返回字段
                page: page,//页码
                paginate: limit,//返回数据条数
                order: [['uid', 'DESC']],//排序规则
                where: where,//查询条件
            }
            let { docs, pages, total } = await User.paginate(options)
            ctx.body = {
                success: true,
                data: {
                    data: docs,
                    ...formatPagination({ total, page, limit, pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    async userPetInfo(ctx) {
        try {
            let { uid } = ctx.request.body || {};
            let where = {
                is_deleted: 0//默认查询未删除的用户
            }
            if (uid !== null && uid !== undefined && uid !== "") {
                where.uid = uid;
            }
            let cols = ['uid', 'nick_name', 'mini_nick_name', 'gender', 'birthday', 'avatar_url', 'phone', 'city', 'province', 'country',
                'region_first', 'region_second', 'region_third', 'ip_province', 'ip_city', 'ip_area'];
            let userResult = await User.findOne({
                where: where,
                attributes: cols
            });
            if (!userResult || !userResult.uid) {
                return ctx.body = { success: false, msg: "用户不存在" }
            }
            let userInfo = userResult.toJSON();
            //查询用户的所有宠物信息
            let userPetResult = await Pet.findAll({
                where: { uid: uid },
                attributes: ['id', 'nick_name', 'is_die', 'die_time', 'is_deleted'],
                order: ['is_deleted', 'is_die']
            });
            userInfo.user_pet = userPetResult || [];
            let breeder_sql = `
                SELECT 
                    ub.id, p.id pet_id, p.nick_name 
                FROM   
                    user_breeder ub 
                LEFT JOIN 
                    pet p 
                ON 
                    ub.pet_id = p.id 
                WHERE   
                    ub.uid = :uid 
                    AND 
                    ub.breeder_type = 1 
                    AND 
                    ub.is_deleted = 0
                    AND 
                    p.is_die = 0
                    AND 
                    p.is_deleted = 0`;
            let breederResults = await sequelize_pet.query(breeder_sql, {
                replacements: { uid: uid },
                type: QueryTypes.SELECT
            });
            userInfo.user_breeder = breederResults || [];
            ctx.body = {
                success: true,
                data: userInfo
            }
        } catch (error) {
            console.log(error);
        }
    }
    async userEdit(ctx) {
        try {
            let param = ctx.request.body || {};
            let { uid, birthday, ...restOfFields } = param;
            if (!uid) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            if (birthday !== undefined && birthday !== null && birthday !== "") {
                birthday = new Date(birthday).getTime() / 1000;
                birthday = birthday < 0 ? 0 : birthday;
            }
            await User.update(
                {
                    ...restOfFields,
                    birthday: birthday ? birthday : 0
                },
                {
                    where: {
                        uid: uid
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
}

module.exports = UserController
