/* eslint-disable no-unused-vars */
const {
    sequelize_pet,
    User,
    UserBreeder,
    Pet,
    PetCate,
    NotePet,
    NoteCate,
    PetAdminUser
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const utils = require("../../utils/commonUtil");
const excelUtils = require("../../utils/excelUtil");
const _ = require('lodash');
const moment = require("moment");
const petMap = require("../../constants/petMap");
const ExcelJS = require('exceljs');
const fs = require('fs');
const helpService = require("../../services/bi/helpService");

class PetStatisticController {
    // "data": [
    //     {
    //         "created_ymd": 0,//统计截止日期
    //         "uid_cnt": 1,//注册用户
    //         "user_info": {//建档用户
    //             "val_0": 0,//总建档用户
    //             "val_1": 0,//建猫用户
    //             "val_2": 0,//建狗用户
    //             "val_3": 0,//建其他用户
    //         },
    //         "single_pet_user_cnt": 0,//单宠用户
    //         "multi_pet_user_cnt": 0,//多宠用户
    //         "breeder_info": {//共养
    //             "val_1": 0,//宠
    //             "val_2": 0,//人
    //             "val_3": 0,//未建档
    //         },
    //         "pet_info": {//宠物数量
    //             "val_1": 0,//猫
    //             "val_2": 0,//狗
    //             "val_3": 0,//其他
    //         },
    //         "note_user_cnt": 0,//当日记录人数
    //         "note_cnt": 0,//当日记录条数
    //         "total_note_user_cnt": 0,//记录人数(总)
    //         "total_note_cnt": 0,//记录条数(总)
    //     }
    // ],
    // "totalCount": 1,
    // "totalPage": 1,
    // "currentPage": 1,
    // "currentPageSize": 10
    //每日数据统计接口
    async dailyStat(ctx) {
        try {
            let { page = 1, pagesize = 10 } = ctx.query || {};
            let limit = parseInt(pagesize, 10);
            //查询存在用户创建的总天数
            let totalDayWithUserCreated_sql = `
                SELECT 
                    COUNT(*) AS cnt 
                FROM 
                    (SELECT created_ymd, count(uid) as uid_ct FROM user GROUP BY created_ymd ORDER BY created_ymd DESC) as t`;
            let totalDayWithUserCreated_result = await sequelize_pet.query(totalDayWithUserCreated_sql, {
                type: QueryTypes.SELECT
            });
            let totalDayWithUserCreated = totalDayWithUserCreated_result && totalDayWithUserCreated_result[0] && totalDayWithUserCreated_result[0].cnt ? totalDayWithUserCreated_result[0].cnt : 0;
            let userCreatedNum_sql = `
                SELECT 
                    created_ymd, count(uid) as uid_cnt 
                FROM 
                    user 
                GROUP BY 
                    created_ymd 
                ORDER BY 
                    created_ymd DESC`;
            let userCreatedNum_result = await sequelize_pet.query(userCreatedNum_sql, {
                type: QueryTypes.SELECT
            });
            let userCreatedNum = userCreatedNum_result && userCreatedNum_result.length ? userCreatedNum_result : [];
            let startIndex = (page - 1) * limit;
            let pageData = userCreatedNum.slice(startIndex, startIndex + limit);
            let paginationInfo = {//分页结果
                ...formatPagination({
                    total: totalDayWithUserCreated,
                    page: page,
                    limit: limit,
                    pages: Math.ceil(totalDayWithUserCreated / limit)
                })
            }
            if (!totalDayWithUserCreated || !userCreatedNum.length) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
                        ...paginationInfo
                    }
                }
            }
            //查询note_num_everyday中的数据并放到map中，方便读取
            let note_num_everyday_sql = `
                SELECT 
                    created_ymd, note_num, user_num, user_all_num 
                FROM 
                    note_num_everyday 
                ORDER BY 
                    created_ymd DESC`;
            let noteNumEveryday_result = await sequelize_pet.query(note_num_everyday_sql, {
                type: QueryTypes.SELECT
            });
            let noteNumEveryday = noteNumEveryday_result && noteNumEveryday_result.length ? noteNumEveryday_result : [];
            let noteNumMap = new Map();
            for (let item of noteNumEveryday) {
                let { created_ymd, note_num, user_num, user_all_num } = item;
                noteNumMap.set(created_ymd, { noteNum: note_num, userNum: user_num, userAllNum: user_all_num })
            }
            let result = [];//存储查询结果
            //循环执行SQL，因为有分页limit，只处理limit条数据
            for (let item of pageData) {
                let user_info = {//建档用户
                    val_0: 0,//总建档用户数量
                    val_1: 0,//建猫用户数量
                    val_2: 0,//建狗用户数量
                    val_3: 0,//建其他用户数量
                }
                let breeder_info = {//共养
                    val_1: 0,//被共养的宠物数量
                    val_2: 0,//共养人数量
                    val_3: 0,//未建档用户数量
                }
                let pet_info = {//宠物数量
                    val_1: 0,//猫的数量
                    val_2: 0,//狗的数量
                    val_3: 0,//其他数量
                }
                let date = item.created_ymd;//当天的日期20240516
                let userCount = item.uid_cnt;//当天的注册用户数量
                let startDateTimeStamp = Math.floor(new Date(utils.convertNumberToDateString(date) + " 00:00:00").getTime() / 1000);
                let endDateTimeStamp = Math.floor(new Date(utils.convertNumberToDateString(date) + " 23:59:59").getTime() / 1000);
                // FROM_UNIXTIME(created,'%Y%m%d') = ${date} 优化为 created BETWEEN startDateTimeStamp AND endDateTimeStamp
                // let userWithTopCate_sql = `
                //     SELECT 
                //         top_cate_id, count(*) as cnt 
                //     FROM 
                //         (SELECT DISTINCT uid, FROM_UNIXTIME(created,'%Y%m%d' ) as cr, top_cate_id FROM pet WHERE FROM_UNIXTIME(created,'%Y%m%d') = :date AND is_deleted = 0) as t 
                //     GROUP BY 
                //         t.top_cate_id;`
                let userWithTopCate_sql = `
                    SELECT 
                        top_cate_id, count(*) as cnt 
                    FROM 
                        (SELECT DISTINCT uid, FROM_UNIXTIME(created,'%Y%m%d') as cr, top_cate_id FROM pet WHERE created BETWEEN :start AND :end AND is_deleted = 0) as t 
                    GROUP BY 
                        t.top_cate_id;`
                let userWithTopCate_result = await sequelize_pet.query(userWithTopCate_sql, {
                    replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                    type: QueryTypes.SELECT
                });
                let userWithTopCate = userWithTopCate_result && userWithTopCate_result.length ? userWithTopCate_result : [];
                let userWithTopCateMap = new Map();
                for (let obj of userWithTopCate) {
                    userWithTopCateMap.set(obj.top_cate_id, obj.cnt);
                }
                let userWithCatCount = userWithTopCateMap.get(1) || 0;//建猫用户数量
                let userWithDogCount = userWithTopCateMap.get(2) || 0;//建狗用户数量
                let userWithOtherCount = userWithTopCateMap.get(3) || 0;//建其他用户数量
                let userWithAllCount = userWithCatCount + userWithDogCount + userWithOtherCount;//总共建档用户数量，上述三者相加
                user_info = {
                    val_0: userWithAllCount,//总建档用户数
                    val_1: userWithCatCount,//建猫用户数
                    val_2: userWithDogCount,//建狗用户数
                    val_3: userWithOtherCount//建其他用户数
                };
                // let single_pet_user_cnt_sql = `
                //     SELECT 
                //         count(*) as ct 
                //     FROM 
                //         (SELECT uid, count(*) as ct FROM pet WHERE created BETWEEN :start AND :end AND is_deleted = 0 GROUP BY uid) as t 
                //     WHERE 
                //         t.ct = 1;`
                // let multi_pet_user_cnt_sql = `
                //     SELECT 
                //         count(*) as ct 
                //     FROM 
                //         (SELECT uid, count(*) as ct FROM pet WHERE created BETWEEN :start AND :end AND is_deleted = 0 GROUP BY uid) as t 
                //     WHERE 
                //         t.ct > 1;`
                // let userWithSinglePetCount_result = await sequelize_pet.query(single_pet_user_cnt_sql, {
                //     replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                //     type: QueryTypes.SELECT
                // });
                // let userWithMultiPetCount_result = await sequelize_pet.query(multi_pet_user_cnt_sql, {
                //     replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                //     type: QueryTypes.SELECT
                // });
                // let userWithSinglePetCount = userWithSinglePetCount_result && userWithSinglePetCount_result[0] && userWithSinglePetCount_result[0].ct ? userWithSinglePetCount_result[0].ct : 0;
                // let userWithMultiPetCount = userWithMultiPetCount_result && userWithMultiPetCount_result[0] && userWithMultiPetCount_result[0].ct ? userWithMultiPetCount_result[0].ct : 0;
                //用一条SQL得到单宠和多宠用户数量，节省调用开销
                let pet_user_cnt_sql = `
                    SELECT 
                        SUM(CASE WHEN pet_count = 1 THEN 1 ELSE 0 END) AS single_pet_user_count, 
                        SUM(CASE WHEN pet_count > 1 THEN 1 ELSE 0 END) AS multi_pet_user_count 
                    FROM (
                            SELECT 
                                uid, COUNT(*) as pet_count 
                            FROM 
                                pet 
                            WHERE 
                                created BETWEEN :start AND :end 
                                AND 
                                is_deleted = 0 
                            GROUP BY 
                                uid
                        ) AS t`;
                let userWithPetCount_result = await sequelize_pet.query(pet_user_cnt_sql, {
                    replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                    type: QueryTypes.SELECT
                });
                let userPetCount = userWithPetCount_result && userWithPetCount_result[0] ? userWithPetCount_result[0] : {};
                let userWithSinglePetCount = userPetCount.single_pet_user_count || 0;//单宠用户数量
                let userWithMultiPetCount = userPetCount.multi_pet_user_count || 0;//多宠用户数量
                let userBreeder_cnt_sql = `
                    SELECT 
                        COUNT(DISTINCT pet_id) as pet_cnt, COUNT(DISTINCT uid) as user_cnt 
                    FROM 
                        user_breeder 
                    WHERE 
                        created BETWEEN :start AND :end 
                        AND 
                        breeder_type = 1 
                        AND 
                        is_deleted = 0`;
                let userBreederCount_result = await sequelize_pet.query(userBreeder_cnt_sql, {
                    replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                    type: QueryTypes.SELECT
                });
                let userBreederCount = userBreederCount_result && userBreederCount_result.length ? userBreederCount_result : [];
                let userBreederPetCount = userBreederCount && userBreederCount[0] && userBreederCount[0].pet_cnt ? userBreederCount[0].pet_cnt : 0;
                let userBreederUserCount = userBreederCount && userBreederCount[0] && userBreederCount[0].user_cnt ? userBreederCount[0].user_cnt : 0;
                let userWithPetWithoutBreeder_cnt_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) as ct 
                    FROM 
                        pet 
                    WHERE 
                        created BETWEEN :startOne AND :endOne 
                        AND 
                        uid NOT IN 
                        (SELECT DISTINCT uid FROM user_breeder WHERE created BETWEEN :startTwo AND :endTwo AND breeder_type = 1 AND is_deleted = 0)`;
                let userWithPetWithoutBreederCount_result = await sequelize_pet.query(userWithPetWithoutBreeder_cnt_sql, {
                    replacements: {
                        startOne: startDateTimeStamp,
                        endOne: endDateTimeStamp,
                        startTwo: startDateTimeStamp,
                        endTwo: endDateTimeStamp
                    },
                    type: QueryTypes.SELECT
                });
                let userWithPetWithoutBreederCount = userWithPetWithoutBreederCount_result && userWithPetWithoutBreederCount_result[0] && userWithPetWithoutBreederCount_result[0].ct ? userWithPetWithoutBreederCount_result[0].ct : 0;
                breeder_info = {
                    val_1: userBreederPetCount || 0,
                    val_2: userBreederUserCount || 0,
                    val_3: userWithPetWithoutBreederCount || 0
                }
                let pet_cnt_sql = `
                    SELECT 
                        top_cate_id, count(*) as cnt 
                    FROM 
                        pet 
                    WHERE 
                        created BETWEEN :start AND :end 
                        AND 
                        is_deleted = 0 
                    GROUP BY 
                        top_cate_id;`
                let petCount_result = await sequelize_pet.query(pet_cnt_sql, {
                    replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                    type: QueryTypes.SELECT
                });
                let petCount = petCount_result && petCount_result.length ? petCount_result : [];
                let petCountMap = new Map();
                for (let obj of petCount) {
                    petCountMap.set(obj.top_cate_id, obj.cnt);
                }
                let catCount = petCountMap.get(1) || 0;//猫数量
                let dogCount = petCountMap.get(2) || 0;//狗数量
                let otherCount = petCountMap.get(3) || 0;//其他数量
                pet_info = {
                    val_1: catCount,
                    val_2: dogCount,
                    val_3: otherCount
                };
                //查询当天创建记录的用户数量
                // let userWithNote_cnt_sql = `
                //     SELECT 
                //         count(DISTINCT uid) as cnt 
                //     FROM 
                //         note 
                //     WHERE 
                //         created_ymd = :date 
                //         AND 
                //         is_deleted = 0;`
                // let userWithNoteCount_result = await sequelize_pet.query(userWithNote_cnt_sql, {
                //     replacements: { date: date },
                //     type: QueryTypes.SELECT
                // });
                // let userWithNoteCount = userWithNoteCount_result && userWithNoteCount_result[0] && userWithNoteCount_result[0].cnt ? userWithNoteCount_result[0].cnt : 0;
                let noteNumInfo = noteNumMap.get(date);
                let userWithNoteCount = noteNumInfo ? noteNumInfo.userNum : 0;
                //查询当天创建的记录数量
                // let note_cnt_sql = `
                //     SELECT 
                //         count(*) as cnt 
                //     FROM 
                //         note 
                //     WHERE 
                //         created_ymd = :date 
                //         AND 
                //         is_deleted = 0;`
                // let noteCount_result = await sequelize_pet.query(note_cnt_sql, {
                //     replacements: { date: date },
                //     type: QueryTypes.SELECT
                // });
                // let noteCount = noteCount_result && noteCount_result[0] && noteCount_result[0].cnt ? noteCount_result[0].cnt : 0;
                let noteCount = noteNumInfo ? noteNumInfo.noteNum : 0;
                //查询当天之前的总创建记录人数
                // let allUserWithNote_cnt_sql = `
                //     SELECT 
                //         count(DISTINCT uid) as cnt 
                //     FROM 
                //         note 
                //     WHERE 
                //         created_ymd <= :date 
                //         AND 
                //         is_deleted = 0;`
                // let allUserWithNoteCount_result = await sequelize_pet.query(allUserWithNote_cnt_sql, {
                //     replacements: { date: date },
                //     type: QueryTypes.SELECT
                // });
                // let allUserWithNoteCount = allUserWithNoteCount_result && allUserWithNoteCount_result[0] && allUserWithNoteCount_result[0].cnt ? allUserWithNoteCount_result[0].cnt : 0;
                let allUserWithNoteCount = noteNumInfo ? noteNumInfo.userAllNum : 0;
                //查询当天之前总共创建的记录数量
                let allNote_cnt_sql = `
                    SELECT 
                        SUM(note_num) AS cnt 
                    FROM 
                        note_num_everyday 
                    WHERE 
                        created_ymd <= :date`;
                let allNoteCount_result = await sequelize_pet.query(allNote_cnt_sql, {
                    replacements: { date: date },
                    type: QueryTypes.SELECT
                });
                let allNoteCount = allNoteCount_result && allNoteCount_result[0] && allNoteCount_result[0].cnt ? allNoteCount_result[0].cnt : 0;
                result.push({
                    created_ymd: date,//当天日期20240516
                    uid_cnt: userCount,//当天注册用户数量
                    user_info: user_info,//建档用户数量分类统计
                    single_pet_user_cnt: userWithSinglePetCount,//单宠用户数量
                    multi_pet_user_cnt: userWithMultiPetCount,//多宠用户数量
                    breeder_info: breeder_info,//共养数量分类统计
                    pet_info: pet_info,//宠物数量分类统计
                    note_user_cnt: userWithNoteCount,//当日记录人数
                    note_cnt: noteCount,//当日记录条数
                    total_note_user_cnt: allUserWithNoteCount,//总的记录人数
                    total_note_cnt: allNoteCount//总的记录条数
                })
            }
            ctx.body = {
                success: true,
                data: {
                    data: result,
                    ...paginationInfo
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠物品种大类统计（猫/狗/其它/总数）
    async getCate1(ctx) {
        try {
            // {//参数结构
            //     "begin": "2024-05-22",
            //     "end": "2024-06-05"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": [
            //         {
            //             "type": "猫",
            //             "count": 0,
            //             "percent": 0
            //         },
            //         {
            //             "type": "狗",
            //             "count": 0,
            //             "percent": 0
            //         },
            //         {
            //             "type": "其它",
            //             "count": 0,
            //             "percent": 0
            //         },
            //         {
            //             "type": "总数",
            //             "count": 0,
            //             "percent": 100
            //         }
            //     ],
            // }
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let pet_cnt_sql = `
                SELECT 
                    top_cate_id, count(*) as cnt  
                FROM 
                    pet 
                WHERE 
                    created BETWEEN :start AND :end 
                GROUP BY 
                    top_cate_id`;
            let petCount_result = await sequelize_pet.query(pet_cnt_sql, {
                replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            let petCount = petCount_result && petCount_result.length ? petCount_result : [];
            let petCountMap = new Map();
            for (let obj of petCount) {
                petCountMap.set(obj.top_cate_id, obj.cnt);
            }
            let catCount = petCountMap.get(1) || 0;//猫数量
            let dogCount = petCountMap.get(2) || 0;//狗数量
            let otherCount = petCountMap.get(3) || 0;//其他数量
            let totalCount = catCount + dogCount + otherCount;//总数量，上述三者相加
            let catPercent = 0;//猫占比
            let dogPercent = 0;//狗占比
            let otherPercent = 0;//其他占比
            if (totalCount) {
                catPercent = catCount / totalCount * 100;
                dogPercent = dogCount / totalCount * 100;
                otherPercent = otherCount / totalCount * 100;
            }
            ctx.body = {
                success: true,
                data: [
                    {
                        type: "猫",
                        count: catCount,
                        percent: parseFloat(catPercent.toFixed(2))
                    },
                    {
                        type: "狗",
                        count: dogCount,
                        percent: parseFloat(dogPercent.toFixed(2))
                    },
                    {
                        type: "其它",
                        count: otherCount,
                        percent: parseFloat(otherPercent.toFixed(2))
                    },
                    {
                        type: "总数",
                        count: totalCount,
                        percent: 100
                    }
                ]
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠物品种子类统计（猫或狗下的子类）
    async getCate2(ctx) {
        try {
            // {//参数结构
            //     "pid": 1,//1代表猫，2代表狗
            //     "begin": "2024-05-22",
            //     "end": "2024-06-05"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": {
            //         "cate": "狗",
            //         "lists": [
            //             {
            //                 "name": "马尔熊",
            //                 "count": 0
            //             },
            //             ...
            //         ];
            //     },
            // }
            let { pid, begin, end } = ctx.request.body || {};
            if (!(pid && begin && end)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let petCateLists = await PetCate.findAll({
                where: {
                    pid: pid
                },
                attributes: ['id', 'name']
            });
            let petCateMap = new Map();
            for (let item of petCateLists) {
                petCateMap.set(item.id, item.name);
            }
            let result = [];//{name:宠物品种名称,count:宠物数量}
            let pet_cnt_sql = `
                SELECT 
                    cate_id, count(*) as cnt  
                FROM 
                    pet 
                WHERE 
                    created BETWEEN :start AND :end 
                    AND 
                    top_cate_id = :topCateId 
                GROUP BY 
                    cate_id`;
            let petCount_result = await sequelize_pet.query(pet_cnt_sql, {
                replacements: { start: startDateTimeStamp, end: endDateTimeStamp, topCateId: pid },
                type: QueryTypes.SELECT
            });
            let petCount = petCount_result && petCount_result.length ? petCount_result : [];
            for (let obj of petCount) {
                let petCateName = petCateMap.get(obj.cate_id);
                if (!petCateName) continue;
                result.push({
                    name: petCateName,
                    count: obj.cnt
                })
            }
            ctx.body = {
                success: true,
                data: {
                    cate: pid == 1 ? "猫" : "狗",
                    lists: result
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠物到家统计（根据到家时间，统计猫/狗/其他各自的数量）
    async home1(ctx) {
        try {
            // {//参数结构
            //     "begin": "2024-05-22",
            //     "end": "2024-06-05"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": [
            //         {
            //             "key": "未到家",
            //             "cat": 0,
            //             "dog": 0,
            //             "oth": 0
            //         },
            //         {
            //             "key": "1个月内",
            //             "cat": 0,
            //             "dog": 0,
            //             "oth": 0
            //         },
            //         {
            //             "key": "1个月~3个月",
            //             "cat": 0,
            //             "dog": 0,
            //             "oth": 0
            //         },
            //         {
            //             "key": "3个月~6个月",
            //             "cat": 0,
            //             "dog": 0,
            //             "oth": 0
            //         },
            //         {
            //             "key": "6个月~12个月",
            //             "cat": 0,
            //             "dog": 0,
            //             "oth": 0
            //         },
            //         {
            //             "key": "12个月以上",
            //             "cat": 0,
            //             "dog": 0,
            //             "oth": 0
            //         },
            //         {
            //             "key": "未填写到家时间",
            //             "cat": 0,
            //             "dog": 0,
            //             "oth": 0
            //         }
            //     ],
            // }
            let { begin, end } = ctx.request.body || {};
            if (!(begin && end)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let base_sql = `
                SELECT 
                    SUM(CASE WHEN top_cate_id = 1 AND homeday = 0 THEN 1 ELSE 0 END) AS cat_no_homeday,  -- 猫没有到家时间
                    SUM(CASE WHEN top_cate_id = 1 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) < 0 THEN 1 ELSE 0 END) AS cat_not_arrived,  -- 猫未到家  
                    SUM(CASE WHEN top_cate_id = 1 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) >= 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) < 1 THEN 1 ELSE 0 END) AS cat_within_one_month,  -- 猫到家1个月内  
                    SUM(CASE WHEN top_cate_id = 1 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) BETWEEN 1 AND 2 THEN 1 ELSE 0 END) AS cat_one_to_three_months,  -- 猫到家1~3个月  
                    SUM(CASE WHEN top_cate_id = 1 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) BETWEEN 3 AND 5 THEN 1 ELSE 0 END) AS cat_three_to_six_months,  -- 猫到家3~6个月  
                    SUM(CASE WHEN top_cate_id = 1 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) BETWEEN 6 AND 11 THEN 1 ELSE 0 END) AS cat_six_to_twelve_months,  -- 猫到家6~12个月  
                    SUM(CASE WHEN top_cate_id = 1 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) >= 12 THEN 1 ELSE 0 END) AS cat_over_twelve_months,  -- 猫到家12个月以上 
                    SUM(CASE WHEN top_cate_id = 2 AND homeday = 0 THEN 1 ELSE 0 END) AS dog_no_homeday,  -- 狗没有到家时间
                    SUM(CASE WHEN top_cate_id = 2 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) < 0 THEN 1 ELSE 0 END) AS dog_not_arrived,  -- 狗未到家  
                    SUM(CASE WHEN top_cate_id = 2 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) >= 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) < 1 THEN 1 ELSE 0 END) AS dog_within_one_month,  -- 狗到家1个月内  
                    SUM(CASE WHEN top_cate_id = 2 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) BETWEEN 1 AND 2 THEN 1 ELSE 0 END) AS dog_one_to_three_months,  -- 狗到家1~3个月  
                    SUM(CASE WHEN top_cate_id = 2 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) BETWEEN 3 AND 5 THEN 1 ELSE 0 END) AS dog_three_to_six_months,  -- 狗到家3~6个月  
                    SUM(CASE WHEN top_cate_id = 2 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) BETWEEN 6 AND 11 THEN 1 ELSE 0 END) AS dog_six_to_twelve_months,  -- 狗到家6~12个月  
                    SUM(CASE WHEN top_cate_id = 2 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) >= 12 THEN 1 ELSE 0 END) AS dog_over_twelve_months,  -- 狗到家12个月以上
                    SUM(CASE WHEN top_cate_id = 3 AND homeday = 0 THEN 1 ELSE 0 END) AS other_no_homeday,  -- 其它没有到家时间
                    SUM(CASE WHEN top_cate_id = 3 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) < 0 THEN 1 ELSE 0 END) AS other_not_arrived,  -- 其它未到家  
                    SUM(CASE WHEN top_cate_id = 3 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) >= 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) < 1 THEN 1 ELSE 0 END) AS other_within_one_month,  -- 其它到家1个月内  
                    SUM(CASE WHEN top_cate_id = 3 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) BETWEEN 1 AND 2 THEN 1 ELSE 0 END) AS other_one_to_three_months,  -- 其它到家1~3个月  
                    SUM(CASE WHEN top_cate_id = 3 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) BETWEEN 3 AND 5 THEN 1 ELSE 0 END) AS other_three_to_six_months,  -- 其它到家3~6个月  
                    SUM(CASE WHEN top_cate_id = 3 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) BETWEEN 6 AND 11 THEN 1 ELSE 0 END) AS other_six_to_twelve_months,  -- 其它到家6~12个月  
                    SUM(CASE WHEN top_cate_id = 3 AND homeday != 0 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(homeday), NOW()) >= 12 THEN 1 ELSE 0 END) AS other_over_twelve_months  -- 其它到家12个月以上 
                FROM 
                    pet 
                WHERE 
                    created BETWEEN :start AND :end`;
            let homeday_result = await sequelize_pet.query(base_sql, {
                replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            let homedayStatistic = homeday_result && homeday_result[0] ? homeday_result[0] : {};
            ctx.body = {
                success: true,
                data: [
                    {
                        key: "未到家",
                        cat: homedayStatistic.cat_not_arrived || 0,
                        dog: homedayStatistic.dog_not_arrived || 0,
                        oth: homedayStatistic.other_not_arrived || 0
                    },
                    {
                        key: "1个月内",
                        cat: homedayStatistic.cat_within_one_month || 0,
                        dog: homedayStatistic.dog_within_one_month || 0,
                        oth: homedayStatistic.other_within_one_month || 0
                    },
                    {
                        key: "1个月~3个月",
                        cat: homedayStatistic.cat_one_to_three_months || 0,
                        dog: homedayStatistic.dog_one_to_three_months || 0,
                        oth: homedayStatistic.other_one_to_three_months || 0
                    },
                    {
                        key: "3个月~6个月",
                        cat: homedayStatistic.cat_three_to_six_months || 0,
                        dog: homedayStatistic.dog_three_to_six_months || 0,
                        oth: homedayStatistic.other_three_to_six_months || 0
                    },
                    {
                        key: "6个月~12个月",
                        cat: homedayStatistic.cat_six_to_twelve_months || 0,
                        dog: homedayStatistic.dog_six_to_twelve_months || 0,
                        oth: homedayStatistic.other_six_to_twelve_months || 0
                    },
                    {
                        key: "12个月以上",
                        cat: homedayStatistic.cat_over_twelve_months || 0,
                        dog: homedayStatistic.dog_over_twelve_months || 0,
                        oth: homedayStatistic.other_over_twelve_months || 0
                    },
                    {
                        key: "未填写到家时间",
                        cat: homedayStatistic.cat_no_homeday || 0,
                        dog: homedayStatistic.dog_no_homeday || 0,
                        oth: homedayStatistic.other_no_homeday || 0
                    }
                ]
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠物到家年龄统计（统计猫/狗到家时的年龄，按0~2个月，3~4个月，5~6个月，7~12个月等等范围）
    async home2(ctx) {
        try {
            // {//参数结构
            //     "begin": "2024-05-22",
            //     "end": "2024-06-05"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": {
            //         "cat": [
            //             {
            //                 "time": "0-2个月",
            //                 "count": 0
            //             },
            //             ...
            //         ],
            //         "dog": [
            //             {
            //                 "time": "0-2个月",
            //                 "count": 0
            //             },
            //             ...
            //         ]
            //     },
            // }
            let { begin, end } = ctx.request.body || {};
            if (!(begin && end)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let base_sql = `
                SELECT 
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) BETWEEN 0 AND 2 THEN 1 ELSE 0 END) AS cat_zero_to_two_months,  -- 猫0~2个月内
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) BETWEEN 3 AND 4 THEN 1 ELSE 0 END) AS cat_three_to_four_months,  -- 猫3~4个月内 
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) BETWEEN 5 AND 6 THEN 1 ELSE 0 END) AS cat_five_to_six_months,  -- 猫5~6个月内
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) >= 7 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) < 12 THEN 1 ELSE 0 END) AS cat_seven_to_twelve_months,  -- 猫7~12个月内
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 12 THEN 1 ELSE 0 END) AS cat_one_years,  -- 猫1岁
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 24 THEN 1 ELSE 0 END) AS cat_two_years,  -- 猫2岁
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 36 THEN 1 ELSE 0 END) AS cat_three_years,  -- 猫3岁
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 48 THEN 1 ELSE 0 END) AS cat_four_years,  -- 猫4岁
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 60 THEN 1 ELSE 0 END) AS cat_five_years,  -- 猫5岁
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 72 THEN 1 ELSE 0 END) AS cat_six_years,  -- 猫6岁
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) BETWEEN 84 AND 120 THEN 1 ELSE 0 END) AS cat_seven_to_ten_years,  -- 猫7~10岁
                    SUM(CASE WHEN top_cate_id = 1 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) > 132 THEN 1 ELSE 0 END) AS cat_eleven_to_more_years,  -- 猫11岁以上
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) BETWEEN 0 AND 2 THEN 1 ELSE 0 END) AS dog_zero_to_two_months,  -- 狗0~2个月内
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) BETWEEN 3 AND 4 THEN 1 ELSE 0 END) AS dog_three_to_four_months,  -- 狗3~4个月内 
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) BETWEEN 5 AND 6 THEN 1 ELSE 0 END) AS dog_five_to_six_months,  -- 狗5~6个月内
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) >= 7 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) < 12 THEN 1 ELSE 0 END) AS dog_seven_to_twelve_months,  -- 狗7~12个月内
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 12 THEN 1 ELSE 0 END) AS dog_one_years,  -- 狗1岁
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 24 THEN 1 ELSE 0 END) AS dog_two_years,  -- 狗2岁
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 36 THEN 1 ELSE 0 END) AS dog_three_years,  -- 狗3岁
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 48 THEN 1 ELSE 0 END) AS dog_four_years,  -- 狗4岁
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 60 THEN 1 ELSE 0 END) AS dog_five_years,  -- 狗5岁
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) = 72 THEN 1 ELSE 0 END) AS dog_six_years,  -- 狗6岁
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) BETWEEN 84 AND 120 THEN 1 ELSE 0 END) AS dog_seven_to_ten_years,  -- 狗7~10岁
                    SUM(CASE WHEN top_cate_id = 2 AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), FROM_UNIXTIME(homeday)) > 132 THEN 1 ELSE 0 END) AS dog_eleven_to_more_years  -- 狗11岁以上
                FROM 
                    pet 
                WHERE 
                    created BETWEEN :start AND :end  
                    AND 
                    homeday != 0 
                    AND 
                    birthday != 0`;
            let homeday_result = await sequelize_pet.query(base_sql, {
                replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            let ageStatistic = homeday_result && homeday_result[0] ? homeday_result[0] : {};
            ctx.body = {
                success: true,
                data: {
                    cat: [
                        {
                            time: "0-2个月",
                            count: ageStatistic.cat_zero_to_two_months || 0
                        },
                        {
                            time: "3-4个月",
                            count: ageStatistic.cat_three_to_four_months || 0,
                        },
                        {
                            time: "5-6个月",
                            count: ageStatistic.cat_five_to_six_months || 0
                        },
                        {
                            time: "7-12个月",
                            count: ageStatistic.cat_seven_to_twelve_months || 0
                        },
                        {
                            time: "1岁",
                            count: ageStatistic.cat_one_years || 0
                        },
                        {
                            time: "2岁",
                            count: ageStatistic.cat_two_years || 0
                        },
                        {
                            time: "3岁",
                            count: ageStatistic.cat_three_years || 0
                        },
                        {
                            time: "4岁",
                            count: ageStatistic.cat_four_years || 0
                        },
                        {
                            time: "5岁",
                            count: ageStatistic.cat_five_years || 0
                        },
                        {
                            time: "6岁",
                            count: ageStatistic.cat_six_years || 0
                        },
                        {
                            time: "7-10岁",
                            count: ageStatistic.cat_seven_to_ten_years || 0
                        },
                        {
                            time: "11岁以上",
                            count: ageStatistic.cat_eleven_to_more_years || 0
                        },
                    ],
                    dog: [
                        {
                            time: "0-2个月",
                            count: ageStatistic.dog_zero_to_two_months || 0
                        },
                        {
                            time: "3-4个月",
                            count: ageStatistic.dog_three_to_four_months || 0,
                        },
                        {
                            time: "5-6个月",
                            count: ageStatistic.dog_five_to_six_months || 0
                        },
                        {
                            time: "7-12个月",
                            count: ageStatistic.dog_seven_to_twelve_months || 0
                        },
                        {
                            time: "1岁",
                            count: ageStatistic.dog_one_years || 0
                        },
                        {
                            time: "2岁",
                            count: ageStatistic.dog_two_years || 0
                        },
                        {
                            time: "3岁",
                            count: ageStatistic.dog_three_years || 0
                        },
                        {
                            time: "4岁",
                            count: ageStatistic.dog_four_years || 0
                        },
                        {
                            time: "5岁",
                            count: ageStatistic.dog_five_years || 0
                        },
                        {
                            time: "6岁",
                            count: ageStatistic.dog_six_years || 0
                        },
                        {
                            time: "7-10岁",
                            count: ageStatistic.dog_seven_to_ten_years || 0
                        },
                        {
                            time: "11岁以上",
                            count: ageStatistic.dog_eleven_to_more_years || 0
                        },
                    ]
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //用户名下猫数量统计（统计拥有/共养1只或2只或3只或4只以上猫的用户数量）
    async usercat(ctx) {
        try {
            // {//参数结构
            //     "begin": "2024-05-22",
            //     "end": "2024-06-05"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": [
            //         {
            //             "key": "1只",
            //             "reg_count": 5043,//建档用户数量
            //             "breeder_count": 610//共养用户数量
            //         },
            //         {
            //             "key": "2只",
            //             "reg_count": 901,
            //             "breeder_count": 151
            //         },
            //         {
            //             "key": "3只",
            //             "reg_count": 145,
            //             "breeder_count": 34
            //         },
            //         {
            //             "key": "4只及以上",
            //             "reg_count": 46,
            //             "breeder_count": 5
            //         }
            //     ],
            // }
            let { begin, end } = ctx.request.body || {};
            if (!(begin && end)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            // 用户注册日期between startDateTimeStamp and endDateTimeStamp
            let users = await User.findAll({
                where: {
                    created: { [Op.between]: [startDateTimeStamp, endDateTimeStamp] },
                },
                attributes: ['uid']
            });
            let allUids = [];//存储用户id
            if (users && users.length) {
                for (let i = 0; i < users.length; i++) {
                    allUids.push(users[i].uid);
                }
            }
            let in_allUids = allUids.map((item) => Number(`${item}`)).join(",") || null;
            let user_cat_cnt_sql = `
                SELECT  
                    SUM(CASE WHEN cnt = 1 THEN 1 ELSE 0 END) AS ct_one,  -- 1只猫的用户数量  
                    SUM(CASE WHEN cnt = 2 THEN 1 ELSE 0 END) AS ct_two,  -- 2只猫的用户数量  
                    SUM(CASE WHEN cnt = 3 THEN 1 ELSE 0 END) AS ct_three,  -- 3只猫的用户数量  
                    SUM(CASE WHEN cnt >= 4 THEN 1 ELSE 0 END) AS ct_four_or_more  -- 4只以上猫的用户数量  
                FROM   
                    (
                        SELECT 
                            uid, top_cate_id, COUNT(*) as cnt  
                        FROM 
                            pet  
                        WHERE 
                            top_cate_id = 1  
                            AND 
                            uid in (${in_allUids}) 
                        GROUP BY 
                            uid, top_cate_id  
                        HAVING 
                            cnt >= 1    
                    ) AS t;`
            let userCatCount_result = await sequelize_pet.query(user_cat_cnt_sql, {
                type: QueryTypes.SELECT
            });
            let userCountWithDifferentNumOfCat = userCatCount_result && userCatCount_result[0] ? userCatCount_result[0] : {};
            //共养用户指的是自己没有猫，但共养别人的猫，需要从allUids中过滤掉自己有猫的uid
            let usersWithPet = await Pet.findAll({
                where: {
                    uid: { [Op.in]: allUids },
                    top_cate_id: 1
                },
                attributes: ['uid']
            });
            let userWithPetUids = [];//存储有猫的用户id
            if (usersWithPet && usersWithPet.length) {
                for (let item of usersWithPet) {
                    userWithPetUids.push(item.uid);
                }
            }
            let userNoPetUids = allUids.filter(x => !userWithPetUids.includes(x));//存储没有猫的用户id
            let in_userNoPetUids = userNoPetUids.map((item) => Number(`${item}`)).join(",") || null;
            let userbreeder_cat_cnt_sql = `
                SELECT  
                    SUM(CASE WHEN pet_count = 1 THEN 1 ELSE 0 END) AS ct_one,  -- 共养1只猫的用户数量
                    SUM(CASE WHEN pet_count = 2 THEN 1 ELSE 0 END) AS ct_two,  -- 共养2只猫的用户数量
                    SUM(CASE WHEN pet_count = 3 THEN 1 ELSE 0 END) AS ct_three,  -- 共养3只猫的用户数量
                    SUM(CASE WHEN pet_count >= 4 THEN 1 ELSE 0 END) AS ct_four_or_more  -- 共养4只以上猫的用户数量
                FROM (  
                    SELECT ub.uid, COUNT(DISTINCT p.id) AS pet_count  
                    FROM user_breeder as ub  
                    JOIN pet as p ON ub.pet_id = p.id  
                    WHERE ub.uid in (${in_userNoPetUids}) 
                    AND ub.breeder_type = 1  
                    AND p.top_cate_id = 1  
                    GROUP BY ub.uid  
                ) AS subquery;`
            let userBreederCatCount_result = await sequelize_pet.query(userbreeder_cat_cnt_sql, {
                type: QueryTypes.SELECT
            });
            let userBreederCountWithDifferentNumOfCat = userBreederCatCount_result && userBreederCatCount_result[0] ? userBreederCatCount_result[0] : {};
            ctx.body = {
                success: true,
                data: [
                    {
                        key: "1只",
                        reg_count: userCountWithDifferentNumOfCat.ct_one || 0,//拥有1只猫的用户数量
                        breeder_count: userBreederCountWithDifferentNumOfCat.ct_one || 0//共养1只猫的用户数量
                    },
                    {
                        key: "2只",
                        reg_count: userCountWithDifferentNumOfCat.ct_two || 0,//拥有2只猫的用户数量
                        breeder_count: userBreederCountWithDifferentNumOfCat.ct_two || 0//共养2只猫的用户数量
                    },
                    {
                        key: "3只",
                        reg_count: userCountWithDifferentNumOfCat.ct_three || 0,//拥有3只猫的用户数量
                        breeder_count: userBreederCountWithDifferentNumOfCat.ct_three || 0//共养3只猫的用户数量
                    },
                    {
                        key: "4只及以上",
                        reg_count: userCountWithDifferentNumOfCat.ct_four_or_more || 0,//拥有4只猫以上的用户数量
                        breeder_count: userBreederCountWithDifferentNumOfCat.ct_four_or_more || 0//共养4只猫以上的用户数量
                    }
                ]
            }
        } catch (error) {
            console.log(error);
        }
    }
    //用户名下狗数量统计（统计拥有/共养1只或2只或3只或4只以上狗的用户数量）
    async userdog(ctx) {
        try {
            // {//参数结构
            //     "begin": "2024-05-22",
            //     "end": "2024-06-05"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": [
            //         {
            //             "key": "1只",
            //             "reg_count": 5043,//建档用户数量
            //             "breeder_count": 610//共养用户数量
            //         },
            //         {
            //             "key": "2只",
            //             "reg_count": 901,
            //             "breeder_count": 151
            //         },
            //         {
            //             "key": "3只",
            //             "reg_count": 145,
            //             "breeder_count": 34
            //         },
            //         {
            //             "key": "4只及以上",
            //             "reg_count": 46,
            //             "breeder_count": 5
            //         }
            //     ],
            // }
            let { begin, end } = ctx.request.body || {};
            if (!(begin && end)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            // 用户注册日期between startDateTimeStamp and endDateTimeStamp
            let users = await User.findAll({
                where: {
                    created: { [Op.between]: [startDateTimeStamp, endDateTimeStamp] },
                },
                attributes: ['uid']
            });
            let allUids = [];//存储用户id
            if (users && users.length) {
                for (let i = 0; i < users.length; i++) {
                    allUids.push(users[i].uid);
                }
            }
            let in_allUids = allUids.map((item) => Number(`${item}`)).join(",") || null;
            let user_dog_cnt_sql = `
                SELECT  
                    SUM(CASE WHEN cnt = 1 THEN 1 ELSE 0 END) AS ct_one,  -- 1只狗的用户数量  
                    SUM(CASE WHEN cnt = 2 THEN 1 ELSE 0 END) AS ct_two,  -- 2只狗的用户数量  
                    SUM(CASE WHEN cnt = 3 THEN 1 ELSE 0 END) AS ct_three,  -- 3只狗的用户数量  
                    SUM(CASE WHEN cnt >= 4 THEN 1 ELSE 0 END) AS ct_four_or_more  -- 4只以上狗的用户数量  
                FROM   
                    (
                        SELECT 
                            uid, top_cate_id, COUNT(*) as cnt  
                        FROM 
                            pet  
                        WHERE 
                            top_cate_id = 2  
                            AND 
                            uid in (${in_allUids}) 
                        GROUP BY 
                            uid, top_cate_id  
                        HAVING 
                            cnt >= 1  -- 只统计cnt至少为1的情况  
                    ) AS t;`
            let userDogCount_result = await sequelize_pet.query(user_dog_cnt_sql, {
                type: QueryTypes.SELECT
            });
            let userCountWithDifferentNumOfDog = userDogCount_result && userDogCount_result[0] ? userDogCount_result[0] : {};
            //共养用户指的是自己没有狗，但共养别人的狗，需要从allUids中过滤掉自己有狗的uid
            let usersWithPet = await Pet.findAll({
                where: {
                    uid: { [Op.in]: allUids },
                    top_cate_id: 2
                },
                attributes: ['uid']
            });
            let userWithPetUids = [];//存储有狗的用户id
            if (usersWithPet && usersWithPet.length) {
                for (let item of usersWithPet) {
                    userWithPetUids.push(item.uid);
                }
            }
            let userNoPetUids = allUids.filter(x => !userWithPetUids.includes(x));//存储没有狗的用户id
            let in_userNoPetUids = userNoPetUids.map((item) => Number(`${item}`)).join(",") || null;
            let userbreeder_dog_cnt_sql = `
                SELECT  
                    SUM(CASE WHEN pet_count = 1 THEN 1 ELSE 0 END) AS ct_one,  -- 共养1只狗的用户数量
                    SUM(CASE WHEN pet_count = 2 THEN 1 ELSE 0 END) AS ct_two,  -- 共养2只狗的用户数量
                    SUM(CASE WHEN pet_count = 3 THEN 1 ELSE 0 END) AS ct_three,  -- 共养3只狗的用户数量
                    SUM(CASE WHEN pet_count >= 4 THEN 1 ELSE 0 END) AS ct_four_or_more  -- 共养4只以上狗的用户数量
                FROM (  
                    SELECT ub.uid, COUNT(DISTINCT p.id) AS pet_count  
                    FROM user_breeder as ub  
                    JOIN pet as p ON ub.pet_id = p.id  
                    WHERE ub.uid in (${in_userNoPetUids}) 
                    AND ub.breeder_type = 1  
                    AND p.top_cate_id = 2  
                    GROUP BY ub.uid  
                ) AS subquery;`
            let userBreederDogCount_result = await sequelize_pet.query(userbreeder_dog_cnt_sql, {
                type: QueryTypes.SELECT
            });
            let userBreederCountWithDifferentNumOfDog = userBreederDogCount_result && userBreederDogCount_result[0] ? userBreederDogCount_result[0] : {};
            ctx.body = {
                success: true,
                data: [
                    {
                        key: "1只",
                        reg_count: userCountWithDifferentNumOfDog.ct_one || 0,//拥有1只狗的用户数量
                        breeder_count: userBreederCountWithDifferentNumOfDog.ct_one || 0//共养1只狗的用户数量
                    },
                    {
                        key: "2只",
                        reg_count: userCountWithDifferentNumOfDog.ct_two || 0,//拥有2只狗的用户数量
                        breeder_count: userBreederCountWithDifferentNumOfDog.ct_two || 0//共养2只狗的用户数量
                    },
                    {
                        key: "3只",
                        reg_count: userCountWithDifferentNumOfDog.ct_three || 0,//拥有3只狗的用户数量
                        breeder_count: userBreederCountWithDifferentNumOfDog.ct_three || 0//共养3只狗的用户数量
                    },
                    {
                        key: "4只及以上",
                        reg_count: userCountWithDifferentNumOfDog.ct_four_or_more || 0,//拥有4只狗以上的用户数量
                        breeder_count: userBreederCountWithDifferentNumOfDog.ct_four_or_more || 0//共养4只狗以上的用户数量
                    }
                ]
            }
        } catch (error) {
            console.log(error);
        }
    }
    //用户手机号授权统计（有/无手机号的用户数量/共养用户数量/亲友用户数量）
    async userphone(ctx) {
        try {
            // {//参数结构
            //     "begin": "2024-05-23",
            //     "end": "2024-06-06"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": [
            //         {
            //             "key": "有",//有手机号授权
            //             "reg_count": 2192,//建档用户数量
            //             "breeder1_count": 98,//共养用户数量
            //             "breeder2_count": 26//亲友用户数量
            //         },
            //         {
            //             "key": "无",//无手机号授权
            //             "reg_count": 8823,//建档用户数量
            //             "breeder1_count": 911,//共养用户数量
            //             "breeder2_count": 290//亲友用户数量
            //         }
            //     ],
            // }
            let { begin, end } = ctx.request.body || {};
            if (!(begin && end)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            //查询有手机号和无手机号的人数
            let user_phone_cnt_sql = `
                SELECT 
                    COUNT(*) as ct 
                FROM  
                    user 
                WHERE 
                    created BETWEEN :start AND :end 
                    AND 
                    phone != ''`;
            let userPhoneCount_result = await sequelize_pet.query(user_phone_cnt_sql, {
                replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            let userPhoneCount = userPhoneCount_result && userPhoneCount_result[0] && userPhoneCount_result[0].ct ? userPhoneCount_result[0].ct : 0;
            let user_noPhone_cnt_sql = `
                SELECT 
                    COUNT(*) as ct 
                FROM 
                    user 
                WHERE 
                    created BETWEEN :start AND :end 
                    AND 
                    phone = ''`;
            let userNoPhoneCount_result = await sequelize_pet.query(user_noPhone_cnt_sql, {
                replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            let userNoPhoneCount = userNoPhoneCount_result && userNoPhoneCount_result[0] && userNoPhoneCount_result[0].ct ? userNoPhoneCount_result[0].ct : 0;
            let user_phone_breeder_one_cnt_sql = `
                SELECT 
                    COUNT(DISTINCT ub.uid) AS ct_phone_breeder_one   
                FROM 
                    user_breeder AS ub  
                JOIN 
                    user AS u ON ub.uid = u.uid  
                LEFT JOIN 
                    pet AS p ON u.uid = p.uid  
                WHERE   
                    u.created BETWEEN :start1 AND :end1 
                    AND u.phone != ''  
                    AND p.id IS NULL   
                    AND ub.breeder_type = 1`;
            let user_nophone_breeder_one_cnt_sql = `
                SELECT 
                    COUNT(DISTINCT ub.uid) AS ct_noPhone_breeder_one   
                FROM 
                    user_breeder AS ub  
                JOIN 
                    user AS u ON ub.uid = u.uid  
                LEFT JOIN 
                    pet AS p ON u.uid = p.uid  
                WHERE   
                    u.created BETWEEN :start2 AND :end2 
                    AND u.phone = ''  
                    AND p.id IS NULL   
                    AND ub.breeder_type = 1`;
            let user_phone_breeder_two_cnt_sql = `
                SELECT 
                        COUNT(DISTINCT ub.uid) AS ct_phone_breeder_two    
                FROM 
                    user_breeder AS ub  
                JOIN 
                    user AS u ON ub.uid = u.uid  
                LEFT JOIN 
                    pet AS p ON u.uid = p.uid  
                WHERE   
                    u.created BETWEEN :start3 AND :end3  
                    AND u.phone != ''  
                    AND p.id IS NULL   
                    AND ub.breeder_type = 2 `;
            let user_nophone_breeder_two_cnt_sql = `
                SELECT 
                    COUNT(DISTINCT ub.uid) AS ct_noPhone_breeder_two   
                FROM 
                    user_breeder AS ub  
                JOIN 
                    user AS u ON ub.uid = u.uid  
                LEFT JOIN 
                    pet AS p ON u.uid = p.uid  
                WHERE   
                    u.created BETWEEN :start4 AND :end4 
                    AND u.phone = ''  
                    AND p.id IS NULL   
                    AND ub.breeder_type = 2`;
            let userPhoneBreederOne_result = await sequelize_pet.query(user_phone_breeder_one_cnt_sql, {
                replacements: {
                    start1: startDateTimeStamp,
                    end1: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            let userNoPhoneBreederOne_result = await sequelize_pet.query(user_nophone_breeder_one_cnt_sql, {
                replacements: {
                    start2: startDateTimeStamp,
                    end2: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            let userPhoneBreederTwo_result = await sequelize_pet.query(user_phone_breeder_two_cnt_sql, {
                replacements: {
                    start3: startDateTimeStamp,
                    end3: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            let userNoPhoneBreederTwo_result = await sequelize_pet.query(user_nophone_breeder_two_cnt_sql, {
                replacements: {
                    start4: startDateTimeStamp,
                    end4: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            let userCountStatistic = {
                ct_phone_breeder_one: userPhoneBreederOne_result && userPhoneBreederOne_result[0] && userPhoneBreederOne_result[0].ct_phone_breeder_one ? userPhoneBreederOne_result[0].ct_phone_breeder_one : 0,
                ct_noPhone_breeder_one: userNoPhoneBreederOne_result && userNoPhoneBreederOne_result[0] && userNoPhoneBreederOne_result[0].ct_noPhone_breeder_one ? userNoPhoneBreederOne_result[0].ct_noPhone_breeder_one : 0,
                ct_phone_breeder_two: userPhoneBreederTwo_result && userPhoneBreederTwo_result[0] && userPhoneBreederTwo_result[0].ct_phone_breeder_two ? userPhoneBreederTwo_result[0].ct_phone_breeder_two : 0,
                ct_noPhone_breeder_two: userNoPhoneBreederTwo_result && userNoPhoneBreederTwo_result[0] && userNoPhoneBreederTwo_result[0].ct_noPhone_breeder_two ? userNoPhoneBreederTwo_result[0].ct_noPhone_breeder_two : 0
            }
            ctx.body = {
                success: true,
                data: [
                    {
                        key: "有",
                        reg_count: userPhoneCount,//有手机号的人数
                        breeder1_count: userCountStatistic.ct_phone_breeder_one,//有手机号的共养用户数量
                        breeder2_count: userCountStatistic.ct_phone_breeder_two//有手机号的亲友用户数量
                    },
                    {
                        key: "无",
                        reg_count: userNoPhoneCount,//无手机号的人数
                        breeder1_count: userCountStatistic.ct_noPhone_breeder_one,//无手机号的共养用户数量
                        breeder2_count: userCountStatistic.ct_noPhone_breeder_two//无手机号的亲友用户数量
                    }
                ]
            }
        } catch (error) {
            console.log(error);
        }
    }
    //地区分布统计（各个省的用户数量/共养用户数量/亲友用户数量）
    async userarea(ctx) {
        try {
            // {//参数结构
            //     "begin": "2024-05-23",
            //     "end": "2024-06-06"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": [
            //         {
            //             "ip_province": "上海市",//省名
            //             "reg_count": 590,//用户数量
            //             "breeder1_count": 45,//共养用户数量
            //             "breeder2_count": 22//亲友用户数量
            //         }
            //     ]
            // }
            let { begin, end } = ctx.request.body || {};
            if (!(begin && end)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let user_ip_province_cnt_sql = `
                SELECT 
                    ip_province AS province, COUNT(*) AS count  
                FROM 
                    user 
                WHERE 
                    created BETWEEN :start AND :end 
                GROUP BY 
                    ip_province 
                HAVING 
                    ip_province != ""`;
            let userCount_result = await sequelize_pet.query(user_ip_province_cnt_sql, {
                replacements: {
                    start: startDateTimeStamp,
                    end: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            let userCount = userCount_result && userCount_result.length ? userCount_result : [];
            if (!userCount || !userCount.length) {
                return ctx.body = { success: true, data: [] }
            }
            let allProvinces = [];//存储所有的省名
            let userCountMap = new Map();//key:"上海市",value:100(用户数量)
            for (let item of userCount) {
                allProvinces.push(item.province);
                userCountMap.set(item.province, item.count);
            }
            let user_ip_province_breeder_one_cnt_sql = `
                SELECT 
                    u.ip_province AS province,
                    COUNT(DISTINCT u.uid) AS breeder_one_count 
                FROM   
                    user u 
                LEFT JOIN   
                    pet p ON u.uid = p.uid  
                LEFT JOIN   
                    user_breeder ub ON u.uid = ub.uid 
                WHERE 
                    u.created BETWEEN :start AND :end 
                    AND 
                    p.id IS NULL   
                    AND 
                    ub.breeder_type = 1 
                    AND 
                    ub.uid IS NOT NULL   
                GROUP BY 
                    u.ip_province`;
            let userBreederOneCount_result = await sequelize_pet.query(user_ip_province_breeder_one_cnt_sql, {
                replacements: {
                    start: startDateTimeStamp,
                    end: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            let userBreederOneCount = userBreederOneCount_result && userBreederOneCount_result.length ? userBreederOneCount_result : [];
            let userBreederOneCountMap = new Map();
            if (userBreederOneCount && userBreederOneCount.length) {
                for (let item of userBreederOneCount) {
                    userBreederOneCountMap.set(item.province, item.breeder_one_count);
                }
            }
            let user_ip_province_breeder_two_cnt_sql = `
                SELECT 
                    u.ip_province AS province,
                    COUNT(DISTINCT u.uid) AS breeder_two_count 
                FROM   
                    user u 
                LEFT JOIN   
                    pet p ON u.uid = p.uid  
                LEFT JOIN   
                    user_breeder ub ON u.uid = ub.uid 
                WHERE 
                    u.created BETWEEN :start AND :end  
                    AND 
                    p.id IS NULL   
                    AND 
                    ub.breeder_type = 2 
                    AND 
                    ub.uid IS NOT NULL   
                GROUP BY 
                    u.ip_province`;
            let userBreederTwoCount_result = await sequelize_pet.query(user_ip_province_breeder_two_cnt_sql, {
                replacements: {
                    start: startDateTimeStamp,
                    end: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            let userBreederTwoCount = userBreederTwoCount_result && userBreederTwoCount_result.length ? userBreederTwoCount_result : [];
            let userBreederTwoCountMap = new Map();
            if (userBreederTwoCount && userBreederTwoCount.length) {
                for (let item of userBreederTwoCount) {
                    userBreederTwoCountMap.set(item.province, item.breeder_two_count);
                }
            }
            let result = [];//存储返回结果
            for (let item of allProvinces) {
                result.push({
                    ip_province: item,
                    reg_count: userCountMap.get(item) || 0,
                    breeder1_count: userBreederOneCountMap.get(item) || 0,
                    breeder2_count: userBreederTwoCountMap.get(item) || 0
                })
            }
            ctx.body = {
                success: true,
                data: result
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠物信息
    async petinfo(ctx) {
        try {
            // {//参数结构
            //     "pet_id": 18
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": {
            //         "pet_id": 18,//宠物id
            //         "pet_name": "大美子",//宠物名称
            //         "pet_cate": "英短银渐层",//宠物品种
            //         "pet_gender": "女",//性别
            //         "pet_kc": "已绝育",//是否绝育
            //         "user_name": "肖棣",//主人昵称
            //         "user_phone": "无",//手机号
            //         "last_note_time": "2023-09-06 07:47:00",//最近一次记录时间
            //         "note_count": 545,//记录次数
            //         "breeder1": 3,//共养人数
            //         "breeder2": 38//亲友团人数
            //     },
            // }
            let { pet_id, role_id = 0 } = ctx.request.body || {};
            const globalUid = ctx.state.user?.uid;
            let adminUser = await PetAdminUser.findOne({
                where: {
                    uid: globalUid
                },
            });
            role_id = adminUser && adminUser.role_id ? adminUser.role_id : 0;
            let pet = await Pet.findOne({//某个宠物的详细信息
                where: {
                    id: pet_id
                }
            });
            if (!pet) {
                return ctx.body = { success: true, data: [] }
            }
            let user = await User.findOne({//某个宠物的用户信息
                where: {
                    uid: pet.uid
                }
            });
            let note = await NotePet.findOne({//某个宠物的最近一次记录时间
                where: {
                    pet_id: pet.id
                },
                order: [['note_time', 'DESC']],
            });
            let note_count = await NotePet.count({//某个宠物的记录次数
                where: {
                    pet_id: pet.id
                }
            });
            let pet_cate = await PetCate.findOne({//某个宠物的类型信息
                where: {
                    id: pet.cate_id
                }
            });
            let breeder1 = await UserBreeder.count({//某个宠物的共养人数
                where: {
                    pet_id: pet.id,
                    breeder_type: 1
                }
            })
            let breeder2 = await UserBreeder.count({//某个宠物的亲友人数
                where: {
                    pet_id: pet.id,
                    breeder_type: 2
                }
            })
            ctx.body = {
                success: true,
                data: {
                    pet_id: pet.id,
                    pet_name: pet.nick_name,
                    pet_cate: pet_cate.name,
                    pet_gender: petMap.PET_GENDER.get(pet.gender),
                    pet_kc: petMap.PET_KC_STATUS.get(pet.kc_status),
                    user_name: user.mini_nick_name,
                    user_phone: role_id == 0 ? user.phone : "无",
                    last_note_time: moment(note.note_time * 1000).format("YYYY-MM-DD HH:mm:ss"),
                    note_count: note_count,
                    breeder1: breeder1,
                    breeder2: breeder2
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    // 宠物数据导出
    async infoexport(ctx) {
        try {
            let { pet_id } = ctx.query || {};
            if (!pet_id) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let role_id = 0;
            const globalUid = ctx.state.user?.uid;
            let adminUser = await PetAdminUser.findOne({
                where: {
                    uid: globalUid
                },
            });
            role_id = adminUser && adminUser.role_id ? adminUser.role_id : 0;
            let petInfo = {};//存储宠物信息
            let pet = await Pet.findOne({//某个宠物的详细信息
                where: {
                    id: pet_id
                }
            });
            if (!pet) {
                return ctx.body = { success: false, data: null, msg: "宠物不存在" }
            }
            let user = await User.findOne({//某个宠物的用户信息
                where: {
                    uid: pet.uid
                }
            });
            if (!user) {
                return ctx.body = { success: false, data: null, msg: "用户不存在" }
            }
            let note = await NotePet.findOne({//某个宠物的最近一次记录时间
                where: {
                    pet_id: pet.id
                },
                order: [['note_time', 'DESC']],
            });
            if (!note) {
                return ctx.body = { success: false, data: null, msg: "宠物没有记录" }
            }
            let note_count = await NotePet.count({//某个宠物的记录次数
                where: {
                    pet_id: pet.id
                }
            });
            let pet_cate = await PetCate.findOne({//某个宠物的类型信息
                where: {
                    id: pet.cate_id
                }
            });
            if (!pet_cate) {
                return ctx.body = { success: false, data: null, msg: "宠物类型不存在" }
            }
            let breeder1 = await UserBreeder.count({//某个宠物的共养人数
                where: {
                    pet_id: pet.id,
                    breeder_type: 1
                }
            })
            let breeder2 = await UserBreeder.count({//某个宠物的亲友人数
                where: {
                    pet_id: pet.id,
                    breeder_type: 2
                }
            })
            petInfo = {
                pet_id: pet ? pet.id : null,
                pet_name: pet ? pet.nick_name : null,
                pet_cate: pet_cate ? pet_cate.name : null,
                pet_gender: pet ? petMap.PET_GENDER.get(pet.gender) : null,
                pet_kc: pet ? petMap.PET_KC_STATUS.get(pet.kc_status) : null,
                user_name: user ? user.mini_nick_name : null,
                user_phone: user && role_id == 0 ? user.phone : "无",
                last_note_time: note && note.note_time ? moment(note.note_time * 1000).format("YYYY-MM-DD HH:mm:ss") : null,
                note_count: note_count,
                breeder1: breeder1,
                breeder2: breeder2
            }
            let title = [];
            if (role_id == 0) {
                title = ['宠物id', '宠物名称', '宠物品种', '性别', '是否绝育', '主人昵称', '电话号', '最近一次记录时间', '记录次数', '供养人数', '亲友团数'];
            } else {
                title = ['宠物id', '宠物名称', '宠物品种', '性别', '是否绝育', '主人昵称', '最近一次记录时间', '记录次数', '供养人数', '亲友团数'];
            }
            const a5title = ['序号', '记录时年龄(月)', '记录类型', '详细记录内容', '图片/视频链接'];
            let sql = `
                SELECT 
                    tm.*,
                    nt.\`desc\`  
                FROM 
                    (
                        SELECT 
                            n.nid,
                            n.pet_id,
                            n.note_time,
                            n.f_ncid,
                            n.s_ncid,
                            n.t_ncid, 
                            p.homeday,
                            TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(p.homeday),FROM_UNIXTIME(n.note_time)) as diffmonth 
                        FROM 
                            note_pet as n 
                        LEFT JOIN 
                            pet as p 
                        on 
                            n.pet_id= p.id 
                        where 
                            n.pet_id = :pid
                    ) as tm 
                        LEFT JOIN 
                            note as nt 
                        on 
                            tm.nid=nt.id`;
            let lists_result = await sequelize_pet.query(sql, {
                replacements: { pid: pet_id },
                type: QueryTypes.SELECT
            });
            let lists = lists_result && lists_result.length ? lists_result : [];//详细记录数据
            // 创建一个新的工作簿  
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');
            // 合并单元格  
            role_id == 0 ? worksheet.mergeCells('A1:K1') : worksheet.mergeCells('A1:J1');
            // 设置标题单元格样式和值  
            worksheet.getCell('A1').value = '详细记录查询';
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'center' };
            worksheet.getRow(1).height = 40;
            worksheet.getCell('A1').font = { bold: true, size: 16 };
            // 设置标题行  
            let titCol = 'A';
            for (let i = 0; i < title.length; i++) {
                worksheet.getCell(titCol + '2').value = title[i];
                titCol = excelUtils.getNextColumnLetter(titCol);
            }
            if (!_.isEmpty(petInfo)) {
                if (role_id == 1) {
                    delete petInfo.user_phone;
                }
                titCol = 'A';
                for (let value of Object.values(petInfo)) {
                    worksheet.getCell(titCol + 3).value = value;
                    titCol = excelUtils.getNextColumnLetter(titCol);
                }
            }
            // 设置A5标题行  
            titCol = 'A';
            let row = 5;
            for (let value of a5title) {
                worksheet.getCell(titCol + row).value = value;
                titCol = excelUtils.getNextColumnLetter(titCol);
            }
            let noteCateIds = [];//存储记录类型id
            for (let item of lists) {
                let { f_ncid, s_ncid, t_ncid } = item;
                if (f_ncid && !noteCateIds.includes(f_ncid)) {
                    noteCateIds.push(f_ncid);
                }
                if (s_ncid && !noteCateIds.includes(s_ncid)) {
                    noteCateIds.push(s_ncid);
                }
                if (t_ncid && !noteCateIds.includes(t_ncid)) {
                    noteCateIds.push(t_ncid);
                }
            }
            let noteCateMap = await helpService.getNoteCateMap(noteCateIds);
            // 设置数据行  
            row = 6;
            for (let item of lists) {
                titCol = 'A';
                const dataRow = [
                    row - 5, // 序号（从1开始）  
                    item.diffmonth,
                    await helpService.getNoteCate(noteCateMap, item.f_ncid, item.s_ncid, item.t_ncid),
                    item.desc,
                    await helpService.getImgByNoteId(item.id)
                ];
                for (let value of dataRow) {
                    worksheet.getCell(titCol + row).value = value;
                    titCol = excelUtils.getNextColumnLetter(titCol);
                }
                row++;
            }
            // 将工作簿写入Buffer  
            const buffer = await workbook.xlsx.writeBuffer();
            const base64Data = buffer.toString('base64');
            ctx.body = {
                success: true,
                data: base64Data
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = PetStatisticController
