/* eslint-disable no-unused-vars */
const {
    sequelize_pet,
    User,
    Pet,
    NotePet,
    NoteCate,
    NoteCateAttr,
    NoteCateAttrVal,
    PetAdminUser
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const utils = require("../../utils/commonUtil");
const excelUtils = require("../../utils/excelUtil");
const _ = require("lodash");
const moment = require("moment");
const petMap = require("../../constants/petMap");
const ExcelJS = require("exceljs");
const fs = require("fs");
const helpService = require("../../services/bi/helpService");

class CatStatisticController {
    //猫-用户记录行为，统计用户最近时间段内(1个月内/3个月内/6个月内等等)各个记录条数区间内的人数
    async useraction(ctx) {
        try {
            // {//参数结构
            //     "end": "2024-06-07"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": {
            //         "user": {
            //             "1条": {
            //                 "最近一个月": 14169,
            //                 "最近三个月": 15723,
            //                 "最近六个月": 16834,
            //                 "最近一年": 21266,
            //                 "不限": 97055
            //             },
            //             "2~10条": {
            //                 "最近一个月": 24349,
            //                 "最近三个月": 42438,
            //                 "最近六个月": 51147,
            //                 "最近一年": 61715,
            //                 "不限": 242283
            //             },
            //             "11~100条": {
            //                 "最近一个月": 3822,
            //                 "最近三个月": 12120,
            //                 "最近六个月": 22946,
            //                 "最近一年": 45995,
            //                 "不限": 143517
            //             },
            //             "101~500条": {
            //                 "最近一个月": 138,
            //                 "最近三个月": 652,
            //                 "最近六个月": 1390,
            //                 "最近一年": 3485,
            //                 "不限": 14393
            //             },
            //             "501~2000条": {
            //                 "最近一个月": 0,
            //                 "最近三个月": 1,
            //                 "最近六个月": 4,
            //                 "最近一年": 24,
            //                 "不限": 85
            //             },
            //             "2000条以上": {
            //                 "最近一个月": 0,
            //                 "最近三个月": 1,
            //                 "最近六个月": 4,
            //                 "最近一年": 24,
            //                 "不限": 85
            //             }
            //         },
            //         "breeder": {
            //             ...同上
            //         }
            //     },
            // }
            let { end } = ctx.request.body || {};
            if (!end) {
                return ctx.body = { success: false, msg: "参数缺失" };
            }
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            // 获取1个月前的时间戳
            const oneMonthAgoTimestamp = moment(end).subtract(1, "months").unix();
            // 获取3个月前的时间戳
            const threeMonthsAgoTimestamp = moment(end).subtract(3, "months").unix();
            // 获取6个月前的时间戳
            const sixMonthsAgoTimestamp = moment(end).subtract(6, "months").unix();
            // 获取1年前的时间戳
            const oneYearAgoTimestamp = moment(end).subtract(1, "years").unix();
            //查询最近1个月/3个月/6个月/一年，记录1条/2~10条/11~100条/101~500条/501~2000条/2000条以上，各自的用户人数
            let user_note_cnt_sql = `
                SELECT  
                    -- 最近1个月
                    SUM(CASE WHEN note_count = 1 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS users_with_1_notes_oneMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS users_with_2_to_10_notes_oneMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS users_with_11_to_100_notes_oneMonthAgo,
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS users_with_101_to_500_notes_oneMonthAgo,
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS users_with_501_to_2000_notes_oneMonthAgo,
                    SUM(CASE WHEN note_count > 2000 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS users_with_2001_to_more_notes_oneMonthAgo,
                    -- 最近3个月
                    SUM(CASE WHEN note_count = 1 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS users_with_1_notes_threeMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS users_with_2_to_10_notes_threeMonthAgo,
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS users_with_11_to_100_notes_threeMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS users_with_101_to_500_notes_threeMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS users_with_501_to_2000_notes_threeMonthAgo,
                    SUM(CASE WHEN note_count > 2000 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS users_with_2001_to_more_notes_threeMonthAgo,
                    -- 最近6个月
                    SUM(CASE WHEN note_count = 1 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS users_with_1_notes_sixMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS users_with_2_to_10_notes_sixMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS users_with_11_to_100_notes_sixMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS users_with_101_to_500_notes_sixMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS users_with_501_to_2000_notes_sixMonthAgo,
                    SUM(CASE WHEN note_count > 2000 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS users_with_2001_to_more_notes_sixMonthAgo,
                    -- 最近1年
                    SUM(CASE WHEN note_count = 1 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS users_with_1_notes_oneYearAgo,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS users_with_2_to_10_notes_oneYearAgo,  
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS users_with_11_to_100_notes_oneYearAgo,  
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS users_with_101_to_500_notes_oneYearAgo,  
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS users_with_501_to_2000_notes_oneYearAgo,
                    SUM(CASE WHEN note_count > 2000 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS users_with_2001_to_more_notes_oneYearAgo 
                FROM 
                    (  
                        SELECT   
                            uid,COUNT(*) AS note_count,     
                            CASE 
                                WHEN created BETWEEN :oneMonth AND :end1 THEN 'one_month'  
                                WHEN created BETWEEN :threeMonth AND :end2 THEN 'three_month'  
                                WHEN created BETWEEN :sixMonth AND :end3 THEN 'six_month' 
                                WHEN created BETWEEN :oneYear AND :end4 THEN 'one_year'  
                            END AS created_range 
                        FROM 
                            note_pet 
                        WHERE 
                            created BETWEEN :begin AND :end5 
                            AND pet_top_cid = 1 
                            AND is_auto = 0 
                        GROUP BY 
                            uid, created_range 
                    ) AS user_note_counts`;
            let userNoteCount_result = await sequelize_pet.query(user_note_cnt_sql, {
                replacements: {
                    oneMonth: oneMonthAgoTimestamp,
                    end1: endDateTimeStamp,
                    threeMonth: threeMonthsAgoTimestamp,
                    end2: endDateTimeStamp,
                    sixMonth: sixMonthsAgoTimestamp,
                    end3: endDateTimeStamp,
                    oneYear: oneYearAgoTimestamp,
                    end4: endDateTimeStamp,
                    begin: oneYearAgoTimestamp,
                    end5: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            let userNoteCount = userNoteCount_result && userNoteCount_result[0] ? userNoteCount_result[0] : {};
            //不限制条件查询，记录1条/2~10条/11~100条/101~500条/501~2000条/2000条以上，各自的人数
            let user_note_nolimit_cnt_sql = `
                SELECT  
                    SUM(CASE WHEN note_count = 1 THEN 1 ELSE 0 END) AS users_with_1_notes_nolimit,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 THEN 1 ELSE 0 END) AS users_with_2_to_10_notes_nolimit,  
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 THEN 1 ELSE 0 END) AS users_with_11_to_100_notes_nolimit,
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 THEN 1 ELSE 0 END) AS users_with_101_to_500_notes_nolimit,
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 THEN 1 ELSE 0 END) AS users_with_501_to_2000_notes_nolimit,
                    SUM(CASE WHEN note_count > 2000 THEN 1 ELSE 0 END) AS users_with_2001_to_more_notes_nolimit 
                FROM 
                    (  
                        SELECT 
                            uid, COUNT(*) AS note_count 
                        FROM 
                            note_pet 
                        GROUP BY 
                            uid
                    ) AS user_note_counts`;
            let userNoteNoLimitCount_result = await sequelize_pet.query(user_note_nolimit_cnt_sql, {
                type: QueryTypes.SELECT
            });
            let userNoteNoLimitCount = userNoteNoLimitCount_result && userNoteNoLimitCount_result[0] ? userNoteNoLimitCount_result[0] : {};
            //查询共养用户(有共养身份，但没有自己的宠物)的所有记录
            let user_breeder_base_sql = `
                SELECT 
                    t1.uid,
                    t2.created,
                    t2.pet_top_cid,
                    t2.is_auto 
                FROM 
                    (
                        SELECT 
                            DISTINCT u.uid AS uid 
                        FROM 
                            user u 
                        JOIN 
                            user_breeder ub 
                        ON 
                            u.uid = ub.uid 
                            AND 
                            ub.breeder_type = 1 
                        LEFT JOIN 
                            pet p 
                        ON 
                            u.uid = p.uid 
                        WHERE 
                            p.id IS NULL 
                    ) AS t1 
                LEFT JOIN 
                    note_pet AS t2 
                ON 
                    t1.uid = t2.uid 
                WHERE 
                    t2.pet_top_cid = 1 
                    AND 
                    t2.is_auto = 0`;
            //查询最近1个月/3个月/6个月/一年，记录1条/2~10条/11~100条/101~500条/501~2000条/2000条以上，各自的共养用户人数
            let user_breeder_note_cnt_sql = `
                SELECT  
                    -- 最近1个月
                    SUM(CASE WHEN note_count = 1 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS user_breeder_with_1_notes_oneMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS user_breeder_with_2_to_10_notes_oneMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS user_breeder_with_11_to_100_notes_oneMonthAgo,
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS user_breeder_with_101_to_500_notes_oneMonthAgo,
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS user_breeder_with_501_to_2000_notes_oneMonthAgo,
                    SUM(CASE WHEN note_count > 2000 AND created_range = 'one_month' THEN 1 ELSE 0 END) AS user_breeder_with_2001_to_more_notes_oneMonthAgo,
                    -- 最近3个月
                    SUM(CASE WHEN note_count = 1 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS user_breeder_with_1_notes_threeMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS user_breeder_with_2_to_10_notes_threeMonthAgo,
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS user_breeder_with_11_to_100_notes_threeMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS user_breeder_with_101_to_500_notes_threeMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS user_breeder_with_501_to_2000_notes_threeMonthAgo,
                    SUM(CASE WHEN note_count > 2000 AND created_range = 'three_month' THEN 1 ELSE 0 END) AS user_breeder_with_2001_to_more_notes_threeMonthAgo,
                    -- 最近6个月
                    SUM(CASE WHEN note_count = 1 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS user_breeder_with_1_notes_sixMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS user_breeder_with_2_to_10_notes_sixMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS user_breeder_with_11_to_100_notes_sixMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS user_breeder_with_101_to_500_notes_sixMonthAgo,  
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS user_breeder_with_501_to_2000_notes_sixMonthAgo,
                    SUM(CASE WHEN note_count > 2000 AND created_range = 'six_month' THEN 1 ELSE 0 END) AS user_breeder_with_2001_to_more_notes_sixMonthAgo,
                    -- 最近1年
                    SUM(CASE WHEN note_count = 1 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS user_breeder_with_1_notes_oneYearAgo,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS user_breeder_with_2_to_10_notes_oneYearAgo,  
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS user_breeder_with_11_to_100_notes_oneYearAgo,  
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS user_breeder_with_101_to_500_notes_oneYearAgo,  
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS user_breeder_with_501_to_2000_notes_oneYearAgo,
                    SUM(CASE WHEN note_count > 2000 AND created_range = 'one_year' THEN 1 ELSE 0 END) AS user_breeder_with_2001_to_more_notes_oneYearAgo 
                FROM 
                    (  
                        SELECT   
                            t.uid, COUNT(*) AS note_count,     
                            CASE   
                                WHEN t.created BETWEEN :oneMonth AND :end1 THEN 'one_month'  
                                WHEN t.created BETWEEN :threeMonth AND :end2 THEN 'three_month'  
                                WHEN t.created BETWEEN :sixMonth AND :end3 THEN 'six_month' 
                                WHEN t.created BETWEEN :oneYear AND :end4 THEN 'one_year'  
                            END AS created_range  
                        FROM 
                            (${user_breeder_base_sql}) AS t 
                        WHERE 
                            t.created BETWEEN :begin AND :end5 
                        GROUP BY 
                            t.uid, created_range 
                    ) AS user_breeder_note_counts`;
            let userBreederNoteCount_result = await sequelize_pet.query(user_breeder_note_cnt_sql, {
                replacements: {
                    oneMonth: oneMonthAgoTimestamp,
                    end1: endDateTimeStamp,
                    threeMonth: threeMonthsAgoTimestamp,
                    end2: endDateTimeStamp,
                    sixMonth: sixMonthsAgoTimestamp,
                    end3: endDateTimeStamp,
                    oneYear: oneYearAgoTimestamp,
                    end4: endDateTimeStamp,
                    begin: oneYearAgoTimestamp,
                    end5: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            let userBreederNoteCount = userBreederNoteCount_result && userBreederNoteCount_result[0] ? userBreederNoteCount_result[0] : {};
            //不限制条件查询，记录1条/2~10条/11~100条/101~500条/501~2000条/2000条以上，各自的共养用户人数
            let user_breeder_note_nolimit_cnt_sql = `
                SELECT  
                    SUM(CASE WHEN note_count = 1 THEN 1 ELSE 0 END) AS user_breeder_with_1_notes_nolimit,  
                    SUM(CASE WHEN note_count BETWEEN 2 AND 10 THEN 1 ELSE 0 END) AS user_breeder_with_2_to_10_notes_nolimit,  
                    SUM(CASE WHEN note_count BETWEEN 11 AND 100 THEN 1 ELSE 0 END) AS user_breeder_with_11_to_100_notes_nolimit,
                    SUM(CASE WHEN note_count BETWEEN 101 AND 500 THEN 1 ELSE 0 END) AS user_breeder_with_101_to_500_notes_nolimit,
                    SUM(CASE WHEN note_count BETWEEN 501 AND 2000 THEN 1 ELSE 0 END) AS user_breeder_with_501_to_2000_notes_nolimit,
                    SUM(CASE WHEN note_count > 2000 THEN 1 ELSE 0 END) AS user_breeder_with_2001_to_more_notes_nolimit 
                FROM 
                    (  
                        SELECT 
                            t.uid, COUNT(*) AS note_count  
                        FROM  
                            (${user_breeder_base_sql}) AS t  
                        GROUP BY 
                            t.uid 
                    ) AS user_breeder_note_counts`;
            let userBreederNoteNoLimitCount_result = await sequelize_pet.query(user_breeder_note_nolimit_cnt_sql, {
                type: QueryTypes.SELECT
            });
            let userBreederNoteNoLimitCount = userBreederNoteNoLimitCount_result && userBreederNoteNoLimitCount_result[0] ? userBreederNoteNoLimitCount_result[0] : {};
            ctx.body = {
                success: true,
                data: {
                    user: {
                        "1条": {
                            最近一个月: userNoteCount.users_with_1_notes_oneMonthAgo || 0,
                            最近三个月: userNoteCount.users_with_1_notes_threeMonthAgo || 0,
                            最近六个月: userNoteCount.users_with_1_notes_sixMonthAgo || 0,
                            最近一年: userNoteCount.users_with_1_notes_oneYearAgo || 0,
                            不限: userNoteNoLimitCount.users_with_1_notes_nolimit || 0,
                        },
                        "2~10条": {
                            最近一个月: userNoteCount.users_with_2_to_10_notes_oneMonthAgo || 0,
                            最近三个月: userNoteCount.users_with_2_to_10_notes_threeMonthAgo || 0,
                            最近六个月: userNoteCount.users_with_2_to_10_notes_sixMonthAgo || 0,
                            最近一年: userNoteCount.users_with_2_to_10_notes_oneYearAgo || 0,
                            不限: userNoteNoLimitCount.users_with_2_to_10_notes_nolimit || 0,
                        },
                        "11~100条": {
                            最近一个月: userNoteCount.users_with_11_to_100_notes_oneMonthAgo || 0,
                            最近三个月: userNoteCount.users_with_11_to_100_notes_threeMonthAgo || 0,
                            最近六个月: userNoteCount.users_with_11_to_100_notes_sixMonthAgo || 0,
                            最近一年: userNoteCount.users_with_11_to_100_notes_oneYearAgo || 0,
                            不限: userNoteNoLimitCount.users_with_11_to_100_notes_nolimit || 0,
                        },
                        "101~500条": {
                            最近一个月: userNoteCount.users_with_101_to_500_notes_oneMonthAgo || 0,
                            最近三个月: userNoteCount.users_with_101_to_500_notes_threeMonthAgo || 0,
                            最近六个月: userNoteCount.users_with_101_to_500_notes_sixMonthAgo || 0,
                            最近一年: userNoteCount.users_with_101_to_500_notes_oneYearAgo || 0,
                            不限: userNoteNoLimitCount.users_with_101_to_500_notes_nolimit || 0,
                        },
                        "501~2000条": {
                            最近一个月: userNoteCount.users_with_501_to_2000_notes_oneMonthAgo || 0,
                            最近三个月: userNoteCount.users_with_501_to_2000_notes_threeMonthAgo || 0,
                            最近六个月: userNoteCount.users_with_501_to_2000_notes_sixMonthAgo || 0,
                            最近一年: userNoteCount.users_with_501_to_2000_notes_oneYearAgo || 0,
                            不限: userNoteNoLimitCount.users_with_501_to_2000_notes_nolimit || 0,
                        },
                        "2000条以上": {
                            最近一个月: userNoteCount.users_with_2001_to_more_notes_oneMonthAgo || 0,
                            最近三个月: userNoteCount.users_with_2001_to_more_notes_threeMonthAgo || 0,
                            最近六个月: userNoteCount.users_with_2001_to_more_notes_sixMonthAgo || 0,
                            最近一年: userNoteCount.users_with_2001_to_more_notes_oneYearAgo || 0,
                            不限: userNoteNoLimitCount.users_with_2001_to_more_notes_nolimit || 0,
                        },
                    },
                    breeder: {
                        "1条": {
                            最近一个月: userBreederNoteCount.user_breeder_with_1_notes_oneMonthAgo || 0,
                            最近三个月: userBreederNoteCount.user_breeder_with_1_notes_threeMonthAgo || 0,
                            最近六个月: userBreederNoteCount.user_breeder_with_1_notes_sixMonthAgo || 0,
                            最近一年: userBreederNoteCount.user_breeder_with_1_notes_oneYearAgo || 0,
                            不限: userBreederNoteNoLimitCount.user_breeder_with_1_notes_nolimit || 0,
                        },
                        "2~10条": {
                            最近一个月: userBreederNoteCount.user_breeder_with_2_to_10_notes_oneMonthAgo || 0,
                            最近三个月: userBreederNoteCount.user_breeder_with_2_to_10_notes_threeMonthAgo || 0,
                            最近六个月: userBreederNoteCount.user_breeder_with_2_to_10_notes_sixMonthAgo || 0,
                            最近一年: userBreederNoteCount.user_breeder_with_2_to_10_notes_oneYearAgo || 0,
                            不限: userBreederNoteNoLimitCount.user_breeder_with_2_to_10_notes_nolimit || 0,
                        },
                        "11~100条": {
                            最近一个月: userBreederNoteCount.user_breeder_with_11_to_100_notes_oneMonthAgo || 0,
                            最近三个月: userBreederNoteCount.user_breeder_with_11_to_100_notes_threeMonthAgo || 0,
                            最近六个月: userBreederNoteCount.user_breeder_with_11_to_100_notes_sixMonthAgo || 0,
                            最近一年: userBreederNoteCount.user_breeder_with_11_to_100_notes_oneYearAgo || 0,
                            不限: userBreederNoteNoLimitCount.user_breeder_with_11_to_100_notes_nolimit || 0,
                        },
                        "101~500条": {
                            最近一个月: userBreederNoteCount.user_breeder_with_101_to_500_notes_oneMonthAgo || 0,
                            最近三个月: userBreederNoteCount.user_breeder_with_101_to_500_notes_threeMonthAgo || 0,
                            最近六个月: userBreederNoteCount.user_breeder_with_101_to_500_notes_sixMonthAgo || 0,
                            最近一年: userBreederNoteCount.user_breeder_with_101_to_500_notes_oneYearAgo || 0,
                            不限: userBreederNoteNoLimitCount.user_breeder_with_101_to_500_notes_nolimit || 0,
                        },
                        "501~2000条": {
                            最近一个月: userBreederNoteCount.user_breeder_with_501_to_2000_notes_oneMonthAgo || 0,
                            最近三个月: userBreederNoteCount.user_breeder_with_501_to_2000_notes_threeMonthAgo || 0,
                            最近六个月: userBreederNoteCount.user_breeder_with_501_to_2000_notes_sixMonthAgo || 0,
                            最近一年: userBreederNoteCount.user_breeder_with_501_to_2000_notes_oneYearAgo || 0,
                            不限: userBreederNoteNoLimitCount.user_breeder_with_501_to_2000_notes_nolimit || 0,
                        },
                        "2000条以上": {
                            最近一个月: userBreederNoteCount.user_breeder_with_2001_to_more_notes_oneMonthAgo || 0,
                            最近三个月: userBreederNoteCount.user_breeder_with_2001_to_more_notes_threeMonthAgo || 0,
                            最近六个月: userBreederNoteCount.user_breeder_with_2001_to_more_notes_sixMonthAgo || 0,
                            最近一年: userBreederNoteCount.user_breeder_with_2001_to_more_notes_oneYearAgo || 0,
                            不限: userBreederNoteNoLimitCount.user_breeder_with_2001_to_more_notes_nolimit || 0,
                        },
                    },
                },
            };
        } catch (error) {
            console.log(error);
        }
    }
    //猫-记录类型统计，统计每种记录类型的记录条数/记录人数/记录宠物数
    async noteaction(ctx) {
        try {
            // {//参数结构
            //     "begin": "2024-05-28",
            //     "end": "2024-06-11"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": [
            //         {
            //             "id": 22,//记录类型id
            //             "name": "大事记",//记录类型名称
            //             "stat": {
            //                 "note_cnt": 1308,//记录条数
            //                 "user_cnt": 1075,//记录人数
            //                 "pet_cnt": 1156,//记录宠物只数
            //                 "childs": [//子类型的数据，结构同父类型
            //                     {
            //                         "id": 96,
            //                         "name": "第一次用猫砂",
            //                         "stat": {
            //                             "note_cnt": 9,
            //                             "user_cnt": 9,
            //                             "pet_cnt": 12,
            //                             "childs": []//空数组代表该类型为叶子节点
            //                         }
            //                     }
            //                 ]
            //             }
            //         }
            //         ...
            //     ],
            //     "_t": 1718077382,
            //     "_sql": ""
            // }
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            const NOTE_CATE_MAP = new Map([
                //记录类型Map
                [22, "大事记"],
                [21, "随手记"],
                [5, "饮食"],
                [6, "尿便"],
                [7, "体重"],
                [8, "罐头"],
                [9, "驱虫"],
                [10, "疫苗"],
                [11, "异常"],
                [12, "给药"],
                [13, "剪指甲"],
                [14, "洗耳朵"],
                [15, "刷牙"],
                [18, "洗澡"],
                [19, "消毒"],
                [20, "清洁"],
                [23, "美容"],
                [24, "挤肛门腺"],
            ]);
            let second_level_noteCateIds = [...NOTE_CATE_MAP.keys()];
            let noteCates = await NoteCate.findAll({
                attributes: ["id", "pid", "name"],
            });
            let noteCateInfoMap = new Map(); //存储每个id对应的记录类型名称
            for (let item of noteCates) {
                let { id, name } = item;
                noteCateInfoMap.set(id, name);
            }
            let nodeMap = utils.buildNodeIdMap(JSON.parse(JSON.stringify(noteCates))); //存储每个id对应的子节点id数组
            let third_level_noteCateIds = utils
                .getDescendantIds(noteCates, second_level_noteCateIds)
                .filter((x) => !second_level_noteCateIds.includes(x));
            let in_second_level_noteCateIds = second_level_noteCateIds.map((item) => Number(`${item}`)).join(",") || null;
            let second_level_noteCate_cnt_sql = `  
                SELECT     
                    s_ncid AS id,
                    COUNT(DISTINCT nid) AS note_cnt,    
                    COUNT(DISTINCT uid) AS user_cnt, 
                    COUNT(DISTINCT pet_id) AS pet_cnt  
                FROM     
                    note_pet    
                WHERE  
                    note_time BETWEEN :start AND :end 
                    AND s_ncid IN (${in_second_level_noteCateIds})   
                    AND is_auto = 0    
                GROUP BY     
                    id`;
            let secondLevelNoteCateCount_result = await sequelize_pet.query(second_level_noteCate_cnt_sql, {
                replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            let secondLevelNoteCateCount = secondLevelNoteCateCount_result && secondLevelNoteCateCount_result.length ? secondLevelNoteCateCount_result : [];
            // let secondLevelNoteCateCount = [
            //     //二级记录类型的id，name，记录条数，记录人数，记录宠物数
            //     {
            //         id: 5,
            //         note_cnt: 100,
            //         user_cnt: 100,
            //         pet_cnt: 100,
            //     },
            //     {
            //         id: 6,
            //         note_cnt: 200,
            //         user_cnt: 200,
            //         pet_cnt: 200,
            //     },
            //     // ...
            // ];
            let secondLevelNoteCateInfoMap = new Map();
            for (let item of secondLevelNoteCateCount) {
                let { id, note_cnt, user_cnt, pet_cnt } = item;
                secondLevelNoteCateInfoMap.set(id, {
                    id: id,
                    note_cnt: note_cnt,
                    user_cnt: user_cnt,
                    pet_cnt: pet_cnt,
                });
            }
            let in_third_level_noteCateIds = third_level_noteCateIds.map((item) => Number(`${item}`)).join(",") || null;
            let third_level_noteCate_cnt_sql = `  
                SELECT     
                    t_ncid AS id,
                    COUNT(DISTINCT nid) AS note_cnt,    
                    COUNT(DISTINCT uid) AS user_cnt, 
                    COUNT(DISTINCT pet_id) AS pet_cnt 
                FROM     
                    note_pet    
                WHERE  
                    note_time BETWEEN :start AND :end 
                    AND t_ncid IN (${in_third_level_noteCateIds})   
                    AND is_auto = 0    
                GROUP BY     
                    id`;
            let thirdLevelNoteCateCount_result = await sequelize_pet.query(third_level_noteCate_cnt_sql, {
                replacements: { start: startDateTimeStamp, end: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            let thirdLevelNoteCateCount = thirdLevelNoteCateCount_result && thirdLevelNoteCateCount_result.length ? thirdLevelNoteCateCount_result : [];
            let thirdLevelNoteCateInfoMap = new Map();
            for (let item of thirdLevelNoteCateCount) {
                let { id, note_cnt, user_cnt, pet_cnt } = item;
                thirdLevelNoteCateInfoMap.set(id, {
                    id: id,
                    note_cnt: note_cnt,
                    user_cnt: user_cnt,
                    pet_cnt: pet_cnt,
                });
            }
            let result = []; //存储结果
            for (let secondLevel of second_level_noteCateIds) {
                let secondLevelInfo = secondLevelNoteCateInfoMap.get(secondLevel);
                if (!secondLevelInfo) continue;
                let childs = [];
                let thirdLevelIds = nodeMap.get(secondLevel) || [];
                for (let thirdLevel of thirdLevelIds) {
                    if (thirdLevel === secondLevel) continue;
                    let thirdLevelInfo = thirdLevelNoteCateInfoMap.get(thirdLevel);
                    if (!thirdLevelInfo) continue;
                    childs.push({
                        id: thirdLevel,
                        name: noteCateInfoMap.get(thirdLevel),
                        stat: {
                            note_cnt: thirdLevelInfo.note_cnt,
                            user_cnt: thirdLevelInfo.user_cnt,
                            pet_cnt: thirdLevelInfo.pet_cnt,
                            childs: [],
                        },
                    });
                }
                result.push({
                    id: secondLevel,
                    name: noteCateInfoMap.get(secondLevel),
                    stat: {
                        note_cnt: secondLevelInfo.note_cnt,
                        user_cnt: secondLevelInfo.user_cnt,
                        pet_cnt: secondLevelInfo.pet_cnt,
                        childs: childs,
                    },
                });
            }
            ctx.body = {
                success: true,
                data: result,
            };
        } catch (error) {
            console.log(error);
        }
    }
    //猫-记录类型统计详情
    async noteactiondetail(ctx) {
        try {
            // {//参数结构
            //     "id": 22,//记录类型id
            //     "level": 1,//记录等级，1-secondLevel，2-thirdLevel
            //     "user_cnt": 1075,//记录人数
            //     "note_cnt": 1308,//记录条数
            //     "begin": "2024-05-28",//开始时间
            //     "end": "2024-06-11"//结束时间
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": {
            //         "cate": "大事记",
            //         "time": "2024年05月28日-2024年06月11日",
            //         "user_cnt": "1075人",
            //         "note_cnt": "1308条",
            //         "top5": [
            //             {
            //                 "uid": 613610,
            //                 "cnt": 15,
            //                 "nick_name": "微信用户"
            //             },
            //             {
            //                 "uid": 583544,
            //                 "cnt": 13,
            //                 "nick_name": ""
            //             },
            //             {
            //                 "uid": 861749,
            //                 "cnt": 8,
            //                 "nick_name": ""
            //             },
            //             {
            //                 "uid": 273720,
            //                 "cnt": 7,
            //                 "nick_name": "厌男。"
            //             },
            //             {
            //                 "uid": 976474,
            //                 "cnt": 7,
            //                 "nick_name": ""
            //             }
            //         ]
            //     },
            // }
            let { id, level, user_cnt = 0, note_cnt = 0, begin, end } = ctx.request.body || {};
            if (!begin || !end || [null, undefined, ""].includes(id) || [null, undefined, ""].includes(level)) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let noteCateName = "";
            let top5 = [];
            if (level == 1) {
                let noteCate = await NoteCate.findOne({
                    where: { id: id },
                    attributes: ["id", "name"],
                });
                noteCateName = noteCate && noteCate.name ? noteCate.name : "";
                let top_5_user_sql = `
                    SELECT 
                        DISTINCT uid,count(*) as cnt 
                    FROM 
                        note_pet 
                    WHERE 
                        s_ncid = :id 
                        AND note_time BETWEEN :start AND :end 
                        AND is_auto = 0 
                    GROUP BY 
                        uid 
                    ORDER BY 
                        cnt DESC 
                    LIMIT 5`;
                let topFiveUser_result = await sequelize_pet.query(top_5_user_sql, {
                    replacements: { id: id, start: startDateTimeStamp, end: endDateTimeStamp },
                    type: QueryTypes.SELECT
                });
                let topFiveUser = topFiveUser_result && topFiveUser_result.length ? topFiveUser_result : [];
                // let topFiveUser = [
                //     //top5用户id和对应的记录条数
                //     { uid: 10, cnt: 100 },
                //     { uid: 11, cnt: 90 },
                //     { uid: 12, cnt: 80 },
                //     { uid: 13, cnt: 70 },
                //     { uid: 14, cnt: 60 },
                // ];
                let uids = topFiveUser.map((item) => item.uid);
                let users = await User.findAll({
                    where: {
                        uid: {
                            [Op.in]: uids,
                        },
                    },
                    attributes: ["uid", "mini_nick_name"],
                });
                let userInfoMap = new Map();
                for (let item of users) {
                    let { uid, mini_nick_name } = item;
                    userInfoMap.set(uid, mini_nick_name);
                }
                for (let item of topFiveUser) {
                    top5.push({
                        uid: item.uid,
                        cnt: item.cnt,
                        nick_name: userInfoMap.get(item.uid) || "",
                    });
                }
            } else {
                let noteCate = await NoteCate.findOne({
                    where: { id: id },
                    attributes: ["id", "pid", "name"],
                });
                if (!noteCate) {
                    return ctx.body = {
                        success: false,
                        msg: "记录类型不存在"
                    }
                }
                let noteParentCate = await NoteCate.findOne({
                    where: { id: noteCate.pid },
                    attributes: ["id", "name"],
                });
                noteCateName =
                    (noteParentCate && noteParentCate.name ? noteParentCate.name : "") +
                    "-" +
                    (noteCate && noteCate.name ? noteCate.name : "");
                let top_5_user_sql = `
                    SELECT 
                        DISTINCT uid, count(*) as cnt 
                    FROM 
                        note_pet 
                    WHERE 
                        t_ncid = :id  
                        AND note_time BETWEEN :start AND :end  
                        AND is_auto = 0  
                    GROUP BY 
                        uid 
                    ORDER BY 
                        cnt DESC 
                    LIMIT 5`;
                let topFiveUser_result = await sequelize_pet.query(top_5_user_sql, {
                    replacements: { id: id, start: startDateTimeStamp, end: endDateTimeStamp },
                    type: QueryTypes.SELECT
                });
                let topFiveUser = topFiveUser_result && topFiveUser_result.length ? topFiveUser_result : [];
                // let topFiveUser = [
                //     //top5用户id和对应的记录条数
                //     { uid: 10, cnt: 100 },
                //     { uid: 11, cnt: 90 },
                //     { uid: 12, cnt: 80 },
                //     { uid: 13, cnt: 70 },
                //     { uid: 14, cnt: 60 },
                // ];
                let uids = topFiveUser.map((item) => item.uid);
                let users = await User.findAll({
                    where: {
                        uid: {
                            [Op.in]: uids,
                        },
                    },
                    attributes: ["uid", "mini_nick_name"],
                });
                let userInfoMap = new Map();
                for (let item of users) {
                    let { uid, mini_nick_name } = item;
                    userInfoMap.set(uid, mini_nick_name);
                }
                for (let item of topFiveUser) {
                    top5.push({
                        uid: item.uid,
                        cnt: item.cnt,
                        nick_name: userInfoMap.get(item.uid) || "",
                    });
                }
            }
            ctx.body = {
                success: true,
                data: {
                    cate: noteCateName,
                    time:
                        moment(begin, "YYYY-MM-DD").format("YYYY年MM月DD日") +
                        "-" +
                        moment(end, "YYYY-MM-DD").format("YYYY年MM月DD日"),
                    user_cnt: user_cnt + "人",
                    note_cnt: note_cnt + "条",
                    top5: top5,
                },
            };
        } catch (error) {
            console.log(error);
        }
    }
    //猫-记录类型统计详情-导出(最新3000条)
    async noteacexport1(ctx) {
        try {
            let { id, level, begin, end } = ctx.query || {};
            if (!begin || !end || [null, undefined, ""].includes(id) || [null, undefined, ""].includes(level)) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let noteCateName = "";
            let user_cnt = 0;
            let top3000 = []; //存储返回结果中的top3000
            let top3000Result = []; //存储top3000_sql执行结果
            let limit = 3000;
            if (level == 1) {
                let noteCate = await NoteCate.findOne({
                    where: { id: id },
                    attributes: ["id", "name"],
                });
                noteCateName = noteCate && noteCate.name ? noteCate.name : "";
                let sql = `
                    SELECT 
                        COUNT(*) as ct 
                    FROM 
                        (
                            SELECT 
                                DISTINCT uid 
                            FROM 
                                note_pet 
                            where 
                                s_ncid = :id 
                                AND 
                                note_time BETWEEN :start AND :end  
                                AND 
                                pet_top_cid = 1 
                                AND 
                                is_auto = 0 
                            GROUP BY 
                                uid 
                            LIMIT :limit
                        ) as t`;
                let userCount_result = await sequelize_pet.query(sql, {
                    replacements: { id: id, start: startDateTimeStamp, end: endDateTimeStamp, limit: limit },
                    type: QueryTypes.SELECT
                });
                let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
                user_cnt = userCount;
                let top3000_sql = `
                    SELECT 
                        * 
                    FROM 
                        note 
                    WHERE 
                        id 
                    IN
                        (
                            SELECT 
                                DISTINCT nid 
                            FROM
                                (
                                    SELECT 
                                        nid 
                                    FROM 
                                        note_pet 
                                    WHERE 
                                        s_ncid = :id 
                                        AND 
                                        note_time BETWEEN :start AND :end  
                                        AND 
                                        pet_top_cid = 1 
                                        AND 
                                        is_auto = 0 
                                    ORDER BY 
                                        note_time DESC 
                                    LIMIT :limit
                                ) as t
                        )`;
                let top3000Result_result = await sequelize_pet.query(top3000_sql, {
                    replacements: { id: id, start: startDateTimeStamp, end: endDateTimeStamp, limit: limit },
                    type: QueryTypes.SELECT
                });
                top3000Result = top3000Result_result && top3000Result_result.length ? top3000Result_result : [];
            } else {
                let noteCate = await NoteCate.findOne({
                    where: { id: id },
                    attributes: ["id", "pid", "name"],
                });
                if (!noteCate) {
                    return ctx.body = {
                        success: false,
                        msg: "记录类型不存在"
                    }
                }
                let noteParentCate = await NoteCate.findOne({
                    where: { id: noteCate.pid },
                    attributes: ["id", "name"],
                });
                noteCateName =
                    (noteParentCate && noteParentCate.name ? noteParentCate.name : "") +
                    "-" +
                    (noteCate && noteCate.name ? noteCate.name : "");
                let sql = `
                    SELECT 
                        COUNT(*) as ct 
                    FROM 
                        (
                            SELECT 
                                DISTINCT uid 
                            FROM 
                                note_pet 
                            WHERE 
                                t_ncid = :id  
                                AND 
                                note_time BETWEEN :start AND :end  
                                AND 
                                pet_top_cid = 1 
                                AND 
                                is_auto = 0 
                            GROUP BY 
                                uid 
                            LIMIT :limit 
                        ) as t`;
                let userCount_result = await sequelize_pet.query(sql, {
                    replacements: { id: id, start: startDateTimeStamp, end: endDateTimeStamp, limit: limit },
                    type: QueryTypes.SELECT
                });
                let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
                user_cnt = userCount;
                let top3000_sql = `
                    SELECT 
                        * 
                    FROM 
                        note 
                    WHERE 
                        id 
                    IN
                        (
                            SELECT 
                                DISTINCT nid 
                            FROM
                                (
                                    SELECT 
                                        nid 
                                    FROM 
                                        note_pet 
                                    WHERE 
                                        t_ncid = :id  
                                        AND 
                                        note_time BETWEEN :start AND :end  
                                        AND 
                                        pet_top_cid = 1 
                                        AND 
                                        is_auto = 0 
                                    ORDER BY 
                                        note_time DESC 
                                    LIMIT :limit
                                ) as t
                        )`;
                let top3000Result_result = await sequelize_pet.query(top3000_sql, {
                    replacements: { id: id, start: startDateTimeStamp, end: endDateTimeStamp, limit: limit },
                    type: QueryTypes.SELECT
                });
                top3000Result = top3000Result_result && top3000Result_result.length ? top3000Result_result : [];
            }
            if (top3000Result && top3000Result.length) {
                let _top3000 = JSON.parse(JSON.stringify(top3000Result));
                for (let item of _top3000) {
                    item.user = await User.findOne({
                        where: { uid: item.uid },
                        attributes: ["mini_nick_name", "phone", "ip_province"],
                    });
                    let notePet = await NotePet.findOne({
                        where: { nid: item.id },
                    });
                    let pet_id = notePet && notePet.pet_id ? notePet.pet_id : "";
                    item.pet = await Pet.findOne({
                        where: { id: pet_id },
                        attributes: ["nick_name", "gender", "kc_status", "cate_id", "homeday", "birthday"],
                    });
                    item.pet_id = pet_id;
                }
                top3000 = _top3000;
            }
            let result = {
                cate: noteCateName,
                time:
                    moment(begin, "YYYY-MM-DD").format("YYYY年MM月DD日") +
                    "-" +
                    moment(end, "YYYY-MM-DD").format("YYYY年MM月DD日"),
                user_cnt: user_cnt,
                top3000: top3000,
            }
            let role_id = 0;
            const globalUid = ctx.state.user?.uid;
            let adminUser = await PetAdminUser.findOne({
                where: {
                    uid: globalUid
                },
            });
            role_id = adminUser && adminUser.role_id ? adminUser.role_id : 0;
            let title = [];
            if (role_id == 0) {
                title = [
                    '序号',
                    '宠物id',
                    '宠物名称',
                    '宠物品种',
                    '性别',
                    '是否绝育',
                    '用户id',
                    '用户名称',
                    '手机号',
                    '地区',
                    '记录时年龄(月)',
                    '详细记录内容',
                    '图片/视频链接',
                ];
            } else {
                title = [
                    '序号',
                    '宠物id',
                    '宠物名称',
                    '宠物品种',
                    '性别',
                    '是否绝育',
                    '用户id',
                    '用户名称',
                    '地区',
                    '记录时年龄(月)',
                    '详细记录内容',
                    '图片/视频链接',
                ];
            }
            let data = [];
            if (result.top3000 && result.top3000.length) {
                let ct = 1;
                let top3000 = result.top3000;
                for (let item of top3000) {
                    if (role_id == 0) {
                        data.push([
                            ct++,
                            item.pet_id,
                            item.pet && item.pet.nick_name ? item.pet.nick_name : "",
                            item.pet ? await helpService.getPetCateName(item.pet.cate_id) : "",
                            item.pet ? petMap.PET_GENDER.get(item.pet.gender) : "未知",
                            item.pet ? petMap.PET_KC_STATUS.get(item.pet.kc_status) : "未知",
                            item.uid || "",
                            item.user && item.user.mini_nick_name ? item.user.mini_nick_name : "",
                            item.user ? item.user.phone : "",
                            item.user ? item.user.ip_province : "",
                            item.pet && item.pet.birthday ? await helpService.getPetAge(item.note_time, item.pet.birthday) : "",
                            item.desc,
                            await helpService.getImgByNoteId(item.id)
                        ]);
                    } else {
                        data.push([
                            ct++,
                            item.pet_id,
                            item.pet && item.pet.nick_name ? item.pet.nick_name : "",
                            item.pet ? await helpService.getPetCateName(item.pet.cate_id) : "",
                            item.pet ? petMap.PET_GENDER.get(item.pet.gender) : "未知",
                            item.pet ? petMap.PET_KC_STATUS.get(item.pet.kc_status) : "未知",
                            item.uid || "",
                            item.user && item.user.mini_nick_name ? item.user.mini_nick_name : "",
                            item.user ? item.user.ip_province : "",
                            item.pet && item.pet.birthday ? await helpService.getPetAge(item.note_time, item.pet.birthday) : "",
                            item.desc,
                            await helpService.getImgByNoteId(item.id)
                        ]);
                    }
                }
            }
            // 创建一个新的工作簿  
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');
            //第一行
            role_id == 0 ? worksheet.mergeCells('A1:M1') : worksheet.mergeCells('A1:L1');
            worksheet.getCell('A1').value = result.cate + ' 记录详细内容(最新3000条)';
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'center' };
            worksheet.getRow(1).height = 40;
            worksheet.getCell('A1').font = { bold: true, size: 16 };
            //第二行
            role_id == 0 ? worksheet.mergeCells('A2:M2') : worksheet.mergeCells('A2:L2');
            worksheet.getRow(2).height = 40;
            worksheet.getCell('A2').font = { bold: true, size: 16 };
            let secondLine = `记录人数：${result.user_cnt}人`;
            worksheet.getCell('A2').value = secondLine;
            worksheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'center' }; // 第二行合并后的单元格垂直居中，水平左对齐
            let titCol = 'A';
            title.forEach((value, index) => {
                worksheet.getCell(titCol + '3').value = value;
                titCol = excelUtils.getNextColumnLetter(titCol); // 增加列索引并获取对应的列字母  
            });
            // 写入数据  
            let row = 4; // 从第4行开始写入数据  
            data.forEach((item) => {
                let column = 1; // 从A列开始  
                item.forEach((value) => {
                    worksheet.getCell(excelUtils.getColumnLetter(column) + row).value = value;
                    column++;
                });
                row++;
            });
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
    //猫-记录类型统计详情-导出(单个用户记录)
    async noteacexport2(ctx) {
        try {
            let { begin, end, level, id, uid } = ctx.query || {};
            if (!begin || !end || [null, undefined, ""].includes(level) || [null, undefined, ""].includes(id) || [null, undefined, ""].includes(uid)) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let role_id = 0;
            const globalUid = ctx.state.user?.uid;
            let adminUser = await PetAdminUser.findOne({
                where: {
                    uid: globalUid
                },
            });
            role_id = adminUser && adminUser.role_id ? adminUser.role_id : 0;
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let pet_cnt = 0;
            let note_cnt = 0;
            let lists = [];
            let sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS ct 
                FROM 
                    note_pet 
                WHERE 
                    uid = :uid  
                    AND 
                    pet_top_cid = 1 
                    AND 
                    is_auto = 0`;
            let userNoteCount_result = await sequelize_pet.query(sql, {
                replacements: { uid: uid },
                type: QueryTypes.SELECT
            });
            let userNoteCount = userNoteCount_result && userNoteCount_result[0] && userNoteCount_result[0].ct ? userNoteCount_result[0].ct : 0;
            note_cnt = userNoteCount;
            let sql2 = `
                SELECT 
                    id, uid, note_time, \`desc\`, f_ncid, s_ncid 
                FROM 
                    note 
                WHERE 
                    id 
                IN 
                    (
                        SELECT 
                            DISTINCT nid 
                        FROM 
                            note_pet 
                        WHERE 
                            uid = :uid  
                            AND 
                            pet_top_cid = 1 
                            AND 
                            is_auto = 0
                    )
            `;
            let noteResult_result = await sequelize_pet.query(sql2, {
                replacements: { uid: uid },
                type: QueryTypes.SELECT
            });
            let noteResult = noteResult_result && noteResult_result.length ? noteResult_result : [];
            if (noteResult && noteResult.length) {
                let noteList = JSON.parse(JSON.stringify(noteResult));
                for (let item of noteList) {
                    let notePet = await NotePet.findOne({
                        where: { nid: item.id },
                    });
                    let pet_id = notePet && notePet.pet_id ? notePet.pet_id : "";
                    item.pet = await Pet.findOne({
                        where: { id: pet_id },
                        attributes: ["nick_name", "gender", "kc_status", "cate_id", "homeday", "birthday"],
                    });
                    item.pet_id = pet_id;
                }
                lists = noteList;
            }
            pet_cnt = await Pet.count({
                where: { uid: uid },
            });
            let userInfo = await User.findOne({
                where: { uid: uid },
                attributes: ["mini_nick_name", "phone", "ip_province"],
            });
            let result = {
                time: moment(begin, "YYYY-MM-DD").format("YYYY年MM月DD日") + "-" + moment(end, "YYYY-MM-DD").format("YYYY年MM月DD日"),
                note_cnt,
                pet_cnt,
                lists,
                uid,
                user: userInfo,
            }
            let title = [
                '序号',
                '宠物id',
                '宠物名称',
                '宠物品种',
                '性别',
                '是否绝育',
                '记录时年龄(月)',
                '记录类型',
                '详细记录内容',
                '图片/视频链接',
            ];
            let data = [];
            if (result.lists && result.lists.length) {
                let ct = 1;
                let list = result.lists;
                let noteCateIds = [];//存储记录类型id
                for (let item of list) {
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
                for (let item of list) {
                    data.push([
                        ct++,
                        item.pet_id,
                        item.pet && item.pet.nick_name ? item.pet.nick_name : "",
                        item.pet && item.pet.cate_id ? await helpService.getPetCateName(item.pet.cate_id) : "",
                        item.pet ? petMap.PET_GENDER.get(item.pet.gender) : "未知",
                        item.pet ? petMap.PET_KC_STATUS.get(item.pet.kc_status) : "未知",
                        item.pet ? await helpService.getPetAge(item.note_time, item.pet.birthday) : "",
                        await helpService.getNoteCate(noteCateMap, item.f_ncid, item.s_ncid),
                        item.desc,
                        await helpService.getImgByNoteId(item.id)
                    ])
                }
            }
            // 创建一个新的工作簿  
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');
            //第一行
            worksheet.mergeCells('A1:J1');
            worksheet.getCell('A1').value = result.user.mini_nick_name + ' 用户全部记录内容';
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'center' };
            worksheet.getRow(1).height = 40;
            worksheet.getCell('A1').font = { bold: true, size: 16 };
            //第二行
            worksheet.mergeCells('A2:J2');
            worksheet.getRow(2).height = 120;
            worksheet.getCell('A2').font = { bold: true, size: 16 };
            let secondLine = "";
            if (role_id == 0) {
                secondLine = `
                    用户id：${result.uid}
                    用户名称：${result.user.mini_nick_name}
                    手机号：${result.user.phone}
                    地区：${result.user.ip_province}
                    名下宠物数：${result.pet_cnt}
                    记录总条数：${result.note_cnt}`;
            } else {
                secondLine = `
                    用户id：${result.uid}
                    用户名称：${result.user.mini_nick_name}
                    地区：${result.user.ip_province}
                    名下宠物数：${result.pet_cnt}
                    记录总条数：${result.note_cnt}`;
            }
            worksheet.getCell('A2').value = secondLine;
            worksheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'center' };
            let titCol = 'A';
            title.forEach((value, index) => {
                worksheet.getCell(titCol + '3').value = value;
                titCol = excelUtils.getNextColumnLetter(titCol); // 增加列索引并获取对应的列字母  
            });
            // 写入数据  
            let row = 4; // 从第4行开始写入数据  
            data.forEach((item) => {
                let column = 1; // 从A列开始  
                item.forEach((value) => {
                    worksheet.getCell(excelUtils.getColumnLetter(column) + row).value = value;
                    column++;
                });
                row++;
            });
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
    //猫-体重年龄分布详情
    async newweightagedetail(ctx) {
        try {
            let { begin, end, size = 0 } = ctx.request.body || {};
            if (!begin || !end) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let base_cond = ` n.s_ncid = 7 AND n.pet_top_cid = 1 AND n.note_time BETWEEN ${startDateTimeStamp} AND ${endDateTimeStamp} `;
            let base_sql = `
                SELECT 
                    n.nid AS id, n.uid, n.pet_id, n.s_ncid, n.note_time, na.vals 
                FROM 
                    note_pet AS n 
                LEFT JOIN 
                    note_attr AS na 
                ON 
                    n.nid = na.nid 
                WHERE 
                    ${base_cond}`;
            let base_view_sql = "";
            if (size) {
                base_view_sql = `
                    SELECT 
                        t.*, p.birthday, p.size, TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(birthday), FROM_UNIXTIME(note_time)) AS diffmonth 
                    FROM 
                        (${base_sql}) AS t 
                    LEFT JOIN 
                        pet AS p 
                    ON 
                        t.pet_id = p.id 
                    WHERE 
                        p.birthday != 0 
                        AND 
                        p.size = ${size}`;
            } else {
                base_view_sql = `
                    SELECT 
                        t.*, p.birthday, p.size, TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(birthday),FROM_UNIXTIME(note_time)) AS diffmonth 
                    FROM 
                        (${base_sql}) AS t 
                    LEFT JOIN 
                        pet AS p 
                    ON 
                        t.pet_id = p.id 
                    WHERE 
                        p.birthday != 0`;
            }
            let weight_maps = [
                { key: "0-500g", count: 0, weight_id: 1, cond: "vals BETWEEN 0 AND 500" },
                { key: "501-1000g", count: 0, weight_id: 2, cond: "vals BETWEEN 501 AND 1000" },
                { key: "1001-1500g", count: 0, weight_id: 3, cond: "vals BETWEEN 1001 AND 1500" },
                { key: "1501-2000g", count: 0, weight_id: 4, cond: "vals BETWEEN 1501 AND 2000" },
                { key: "2001-2500g", count: 0, weight_id: 5, cond: "vals BETWEEN 2001 AND 2500" },
                { key: "2501-3000g", count: 0, weight_id: 6, cond: "vals BETWEEN 2501 AND 3000" },
                { key: "3001-3500g", count: 0, weight_id: 7, cond: "vals BETWEEN 3001 AND 3500" },
                { key: "3501-4000g", count: 0, weight_id: 8, cond: "vals BETWEEN 3501 AND 4000" },
                { key: "4001-4500g", count: 0, weight_id: 9, cond: "vals BETWEEN 4001 AND 4500" },
                { key: "4501-5000g", count: 0, weight_id: 10, cond: "vals BETWEEN 4501 AND 5000" },
                { key: "5001-5500g", count: 0, weight_id: 11, cond: "vals BETWEEN 5001 AND 5500" },
                { key: "5501-6000g", count: 0, weight_id: 12, cond: "vals BETWEEN 5501 AND 6000" },
                { key: "6001-6500g", count: 0, weight_id: 13, cond: "vals BETWEEN 6001 AND 6500" },
                { key: "6501-7000g", count: 0, weight_id: 14, cond: "vals BETWEEN 6501 AND 7000" },
                { key: "7001-7500g", count: 0, weight_id: 15, cond: "vals BETWEEN 7001 AND 7500" },
                { key: "7501-8000g", count: 0, weight_id: 16, cond: "vals BETWEEN 7501 AND 8000" },
                { key: "8001-8500g", count: 0, weight_id: 17, cond: "vals BETWEEN 8001 AND 8500" },
                { key: "8501-9000g", count: 0, weight_id: 18, cond: "vals BETWEEN 8501 AND 9000" },
                { key: "9001-9500g", count: 0, weight_id: 19, cond: "vals BETWEEN 9001 AND 9500" },
                { key: "9501-10000g", count: 0, weight_id: 20, cond: "vals BETWEEN 9501 AND 10000" },
                { key: "10000g+", count: 0, weight_id: 21, cond: "vals > 10000" },
            ];
            let conds = [
                { key: "0~2个月", cond: "t.diffmonth BETWEEN 0 AND 2", age_id: 1 },
                { key: "3~4个月", cond: "t.diffmonth BETWEEN 3 AND 4", age_id: 2 },
                { key: "5~6个月", cond: "t.diffmonth BETWEEN 5 AND 6", age_id: 3 },
                { key: "7~12个月", cond: "t.diffmonth BETWEEN 7 AND 12", age_id: 4 },
                { key: "1岁", cond: "t.diffmonth = 12", age_id: 5 },
                { key: "2岁", cond: "t.diffmonth = 24", age_id: 6 },
                { key: "3岁", cond: "t.diffmonth = 36", age_id: 7 },
                { key: "4岁", cond: "t.diffmonth = 48", age_id: 8 },
                { key: "5岁", cond: "t.diffmonth = 60", age_id: 9 },
                { key: "6岁", cond: "t.diffmonth = 72", age_id: 10 },
                { key: "7~10岁", cond: "t.diffmonth BETWEEN 84 AND 120", age_id: 11 },
                { key: "11岁以上", cond: "t.diffmonth >= 132", age_id: 12 },
            ];
            let data = {};
            for (let cond of conds) {
                let key = cond.key;
                let age_id = cond.age_id;
                let result = [];
                for (let map of weight_maps) {
                    let tmp_sql = `
                        SELECT 
                            pet_id ,COUNT(*) AS ct 
                        FROM 
                            (${base_view_sql}) AS t 
                        WHERE 
                            ${cond.cond} 
                            AND 
                            ${map.cond} 
                        GROUP BY 
                            pet_id`;
                    let cnt_sql = `
                        SELECT 
                            COUNT(*) AS ct 
                        FROM 
                            (${tmp_sql}) AS tt`;
                    let count_result = await sequelize_pet.query(cnt_sql, {
                        type: QueryTypes.SELECT
                    });
                    let count = count_result && count_result[0] && count_result[0].ct ? count_result[0].ct : 0;
                    // let count = [
                    //     //待执行SQL，这里是模拟数据
                    //     { ct: 100 },
                    // ];
                    result.push({
                        map_key: map.key,
                        map_key_count: count,
                        age_id: age_id,
                        weight_id: map.weight_id,
                    });
                }
                data[key] = result;
            }
            ctx.body = {
                success: true,
                data: data,
            };
        } catch (error) {
            console.log(error);
        }
    }
    async weightagedetail2(ctx) {
        try {
            let { begin, end, size = 0, age_id = 0, weight_id = 0 } = ctx.request.body || {};
            if (!begin || !end) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let cond = `s_ncid = 7 AND pet_top_cid = 1 AND note_time BETWEEN ${startDateTimeStamp} AND ${endDateTimeStamp}`;
            let base_view_sql = "";
            let pre_base_sql = `
                SELECT 
                    MAX(note_time) AS note_time, MAX(nid) AS id, uid, pet_id, COUNT(*), s_ncid
                FROM 
                    note_pet 
                WHERE 
                    ${cond} 
                GROUP BY 
                    uid, pet_id 
                ORDER BY 
                    note_time DESC`;
            let base_sql = `
                SELECT 
                    n.id, n.uid, n.pet_id, n.s_ncid, n.note_time, na.vals 
                FROM 
                    (${pre_base_sql}) AS n 
                LEFT JOIN  
                    note_attr AS na 
                ON 
                    n.id = na.nid`;
            if (size) {
                base_view_sql = `
                    SELECT 
                        t.*,
                        p.birthday,
                        p.size,
                        TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(birthday),FROM_UNIXTIME(note_time)) AS diffmonth 
                    FROM 
                        (${base_sql}) AS t 
                    LEFT JOIN 
                        pet AS p 
                    ON 
                        t.pet_id = p.id 
                    WHERE 
                        p.birthday != 0 
                        AND 
                        p.size = ${size}`;
            } else {
                base_view_sql = `
                    SELECT 
                        t.*,
                        p.birthday,
                        p.size,
                        TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(birthday),FROM_UNIXTIME(note_time)) AS diffmonth 
                    FROM 
                        (${base_sql}) AS t 
                    LEFT JOIN 
                        pet AS p 
                    ON 
                        t.pet_id = p.id 
                    WHERE 
                        p.birthday != 0`;
            }
            const weightMaps = {
                1: {
                    key: '0-500g',
                    cond: "vals > 0 AND vals <= 500"
                },
                2: {
                    key: '501-1000g',
                    cond: "vals > 500 AND vals <= 1000"
                },
                3: {
                    key: '1001-1500g',
                    cond: "vals > 1000 AND vals <= 1500"
                },
                4: {
                    key: '1501-2000g',
                    cond: "vals > 1500 AND vals <= 2000"
                },
                5: {
                    key: '2001-2500g',
                    cond: "vals > 2000 AND vals <= 2500"
                },
                6: {
                    key: '2501-3000g',
                    cond: "vals > 2501 AND vals <= 3000"
                },
                7: {
                    key: '3001-3500g',
                    cond: "vals > 3001 AND vals <= 3500"
                },
                8: {
                    key: '3501-4000g',
                    cond: "vals > 3501 AND vals <= 4000"
                },
                9: {
                    key: '4001-4500g',
                    cond: "vals > 4001 AND vals <= 4500"
                },
                10: {
                    key: '4501-5000g',
                    cond: "vals > 4501 AND vals <= 5000"
                },
                11: {
                    key: '5001-5500g',
                    cond: "vals > 5001 AND vals <= 5500"
                },
                12: {
                    key: '5501-6000g',
                    cond: "vals > 5501 AND vals <= 6000"
                },
                13: {
                    key: '6001-6500g',
                    cond: "vals > 6001 AND vals <= 6500"
                },
                14: {
                    key: '6501-7000g',
                    cond: "vals > 6501 AND vals <= 7000"
                },
                15: {
                    key: '7001-7500g',
                    cond: "vals > 7001 AND vals <= 7500"
                },
                16: {
                    key: '7501-8000g',
                    cond: "vals > 7501 AND vals <= 8000"
                },
                17: {
                    key: '8001-8500g',
                    cond: "vals > 8001 AND vals <= 8500"
                },
                18: {
                    key: '8501-9000g',
                    cond: "vals > 8501 AND vals <= 9000"
                },
                19: {
                    key: '9001-9500g',
                    cond: "vals > 9001 AND vals <= 9500"
                },
                20: {
                    key: '9501-10000g',
                    cond: "vals > 9501 AND vals <= 10000"
                },
                21: {
                    key: '10000g+',
                    cond: "vals > 10000"
                }
            };
            const ageMaps = {
                1: {
                    age_id: 1,
                    key: "0~2个月",
                    cond: "t.diffmonth BETWEEN 0 AND 2"
                },
                2: {
                    age_id: 2,
                    key: "3~4个月",
                    cond: "t.diffmonth BETWEEN 3 AND 4"
                },
                3: {
                    age_id: 3,
                    key: "5~6个月",
                    cond: "t.diffmonth BETWEEN 5 AND 6"
                },
                4: {
                    age_id: 4,
                    key: "7~12个月",
                    cond: "t.diffmonth BETWEEN 7 AND 12"
                },
                5: {
                    age_id: 5,
                    key: "1岁",
                    cond: "t.diffmonth = 12"
                },
                6: {
                    age_id: 6,
                    key: "2岁",
                    cond: "t.diffmonth = 24"
                },
                7: {
                    age_id: 7,
                    key: "3岁",
                    cond: "t.diffmonth = 36"
                },
                8: {
                    age_id: 8,
                    key: "4岁",
                    cond: "t.diffmonth = 48"
                },
                9: {
                    age_id: 9,
                    key: "5岁",
                    cond: "t.diffmonth = 60"
                },
                10: {
                    age_id: 10,
                    key: "6岁",
                    cond: "t.diffmonth = 72"
                },
                11: {
                    age_id: 11,
                    key: "7~10岁",
                    cond: "t.diffmonth BETWEEN 84 AND 120"
                },
                12: {
                    age_id: 12,
                    key: "11岁以上",
                    cond: "t.diffmonth >= 132"
                }
            };
            let ret_sql = ``;
            if (weight_id && age_id && weightMaps[weight_id] && ageMaps[age_id]) {
                ret_sql = `
                    SELECT 
                        * 
                    FROM 
                        (${base_view_sql}) AS t 
                    WHERE 
                        ${ageMaps[age_id].cond} 
                        AND 
                        ${weightMaps[weight_id].cond} 
                    ORDER BY 
                        note_time DESC`;
            } else {
                ret_sql = `
                    SELECT 
                        * 
                    FROM 
                        (${base_view_sql}) AS t 
                    ORDER BY 
                        note_time DESC`;
            }
            let sql_view = `
                SELECT 
                    t.id,
                    t.pet_id,
                    t.note_time,
                    t.vals,
                    p.kc_status,
                    p.gender,
                    p.nick_name AS p_nick_name,
                    u.mini_nick_name AS u_nick_name,
                    u.uid 
                FROM 
                    (${ret_sql}) AS t 
                LEFT JOIN 
                    pet AS p 
                ON 
                    t.pet_id = p.id 
                LEFT JOIN 
                    user AS u 
                ON 
                    t.uid = u.uid`;
            let sql = `
                SELECT 
                    a.* 
                FROM 
                    (${sql_view}) AS a 
                RIGHT JOIN 
                    (
                        SELECT 
                            pet_id, MAX(note_time) AS max_note_time 
                        FROM 
                            (${sql_view}) AS _v 
                        GROUP BY 
                            pet_id
                    ) AS b 
                ON 
                    b.pet_id = a.pet_id 
                    AND 
                    b.max_note_time = a.note_time`;
            let list_result = await sequelize_pet.query(sql, {
                type: QueryTypes.SELECT
            });
            let list = list_result && list_result.length ? list_result : [];
            ctx.body = {
                success: true,
                data: list
            }
        } catch (error) {
            console.log(error);
        }
    }
    async weightagexport1(ctx) {
        try {
            // size: 0
            // weight_range: 0-500g
            // age_id: 2
            // weight_id: 1
            // key: 3~4个月
            // token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwZXRfYWRtaW4iLCJpYXQiOjE3MTg2OTA3NTUsIm5iZiI6MTcxODY5MDc1NSwiZXhwIjoxNzE4Nzc3MTU1LCJqdGkiOiI0YzEzZjQyZTMyNWVjYTU2MTUxMzBhZTc4ODY3MzcyNCIsInVpZCI6MTcsInVzZXJuYW1lIjoidGVzdGluZyJ9.gj2zWfS5Jn7MWyyQabUmAOTZnuLGv4bEDu8EgUneW0k
            // begin: 2024-06-01
            // end: 2024-06-18
            let { begin, end, size = 0, age_id = 0, weight_id = 0 } = ctx.query || {};
            if (!begin || !end) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let cond = `s_ncid = 7 AND pet_top_cid = 1 AND note_time BETWEEN ${startDateTimeStamp} AND ${endDateTimeStamp}`;
            let base_view_sql = "";
            let pre_base_sql = `
                SELECT 
                    MAX(note_time) AS note_time, MAX(nid) AS id, uid, pet_id, COUNT(*), s_ncid
                FROM 
                    note_pet 
                WHERE 
                    ${cond} 
                GROUP BY 
                    uid, pet_id 
                ORDER BY 
                    note_time DESC`;
            let base_sql = `
                SELECT 
                    n.id, n.uid, n.pet_id, n.s_ncid, n.note_time, na.vals 
                FROM 
                    (${pre_base_sql}) AS n 
                LEFT JOIN  
                    note_attr AS na 
                ON 
                    n.id = na.nid`;
            if (size) {
                base_view_sql = `
                    SELECT 
                        t.*,
                        p.birthday,
                        p.size,
                        TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(birthday),FROM_UNIXTIME(note_time)) AS diffmonth 
                    FROM 
                        (${base_sql}) AS t 
                    LEFT JOIN 
                        pet AS p 
                    ON 
                        t.pet_id = p.id 
                    WHERE 
                        p.birthday != 0 
                        AND 
                        p.size = ${size}`;
            } else {
                base_view_sql = `
                    SELECT 
                        t.*,
                        p.birthday,
                        p.size,
                        TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(birthday),FROM_UNIXTIME(note_time)) AS diffmonth 
                    FROM 
                        (${base_sql}) AS t 
                    LEFT JOIN 
                        pet AS p 
                    ON 
                        t.pet_id = p.id 
                    WHERE 
                        p.birthday != 0`;
            }
            const weightMaps = {
                1: {
                    key: '0-500g',
                    cond: "vals > 0 AND vals <= 500"
                },
                2: {
                    key: '501-1000g',
                    cond: "vals > 500 AND vals <= 1000"
                },
                3: {
                    key: '1001-1500g',
                    cond: "vals > 1000 AND vals <= 1500"
                },
                4: {
                    key: '1501-2000g',
                    cond: "vals > 1500 AND vals <= 2000"
                },
                5: {
                    key: '2001-2500g',
                    cond: "vals > 2000 AND vals <= 2500"
                },
                6: {
                    key: '2501-3000g',
                    cond: "vals > 2501 AND vals <= 3000"
                },
                7: {
                    key: '3001-3500g',
                    cond: "vals > 3001 AND vals <= 3500"
                },
                8: {
                    key: '3501-4000g',
                    cond: "vals > 3501 AND vals <= 4000"
                },
                9: {
                    key: '4001-4500g',
                    cond: "vals > 4001 AND vals <= 4500"
                },
                10: {
                    key: '4501-5000g',
                    cond: "vals > 4501 AND vals <= 5000"
                },
                11: {
                    key: '5001-5500g',
                    cond: "vals > 5001 AND vals <= 5500"
                },
                12: {
                    key: '5501-6000g',
                    cond: "vals > 5501 AND vals <= 6000"
                },
                13: {
                    key: '6001-6500g',
                    cond: "vals > 6001 AND vals <= 6500"
                },
                14: {
                    key: '6501-7000g',
                    cond: "vals > 6501 AND vals <= 7000"
                },
                15: {
                    key: '7001-7500g',
                    cond: "vals > 7001 AND vals <= 7500"
                },
                16: {
                    key: '7501-8000g',
                    cond: "vals > 7501 AND vals <= 8000"
                },
                17: {
                    key: '8001-8500g',
                    cond: "vals > 8001 AND vals <= 8500"
                },
                18: {
                    key: '8501-9000g',
                    cond: "vals > 8501 AND vals <= 9000"
                },
                19: {
                    key: '9001-9500g',
                    cond: "vals > 9001 AND vals <= 9500"
                },
                20: {
                    key: '9501-10000g',
                    cond: "vals > 9501 AND vals <= 10000"
                },
                21: {
                    key: '10000g+',
                    cond: "vals > 10000"
                }
            };
            const ageMaps = {
                1: {
                    age_id: 1,
                    key: "0~2个月",
                    cond: "t.diffmonth BETWEEN 0 AND 2"
                },
                2: {
                    age_id: 2,
                    key: "3~4个月",
                    cond: "t.diffmonth BETWEEN 3 AND 4"
                },
                3: {
                    age_id: 3,
                    key: "5~6个月",
                    cond: "t.diffmonth BETWEEN 5 AND 6"
                },
                4: {
                    age_id: 4,
                    key: "7~12个月",
                    cond: "t.diffmonth BETWEEN 7 AND 12"
                },
                5: {
                    age_id: 5,
                    key: "1岁",
                    cond: "t.diffmonth = 12"
                },
                6: {
                    age_id: 6,
                    key: "2岁",
                    cond: "t.diffmonth = 24"
                },
                7: {
                    age_id: 7,
                    key: "3岁",
                    cond: "t.diffmonth = 36"
                },
                8: {
                    age_id: 8,
                    key: "4岁",
                    cond: "t.diffmonth = 48"
                },
                9: {
                    age_id: 9,
                    key: "5岁",
                    cond: "t.diffmonth = 60"
                },
                10: {
                    age_id: 10,
                    key: "6岁",
                    cond: "t.diffmonth = 72"
                },
                11: {
                    age_id: 11,
                    key: "7~10岁",
                    cond: "t.diffmonth BETWEEN 84 AND 120"
                },
                12: {
                    age_id: 12,
                    key: "11岁以上",
                    cond: "t.diffmonth >= 132"
                }
            };
            let ret_sql = `
                SELECT 
                    * 
                FROM 
                    (${base_view_sql}) AS t 
                WHERE 
                    ${ageMaps[age_id].cond} 
                    AND 
                    ${weightMaps[weight_id].cond} 
                ORDER BY 
                    note_time DESC`;
            let sql_view = `
                SELECT 
                    t.id,
                    t.pet_id,
                    t.note_time,
                    t.vals,
                    p.kc_status,
                    p.gender,
                    p.nick_name AS p_nick_name,
                    u.mini_nick_name AS u_nick_name,
                    u.uid 
                FROM 
                    (${ret_sql}) AS t 
                LEFT JOIN 
                    pet AS p 
                ON 
                    t.pet_id = p.id 
                LEFT JOIN 
                    user AS u 
                ON 
                    t.uid = u.uid`;
            let sql = `
                SELECT 
                    a.* 
                FROM 
                    (${sql_view}) AS a 
                RIGHT JOIN 
                    (
                        SELECT 
                            pet_id, MAX(note_time) AS max_note_time 
                        FROM 
                            (${sql_view}) AS _v 
                        GROUP BY 
                            pet_id
                    ) AS b 
                ON 
                    b.pet_id = a.pet_id 
                    AND 
                    b.max_note_time = a.note_time`;
            let list_result = await sequelize_pet.query(sql, {
                type: QueryTypes.SELECT
            });
            let lists = list_result && list_result.length ? list_result : [];
            let title = [
                '序号',
                '用户名称',
                '猫咪名称',
                '宠物id',
                '性别',
                '是否绝育',
                '最新记录体重(kg)',
            ];
            let data = [];
            if (lists.length > 0) {
                let ct = 1;
                for (const item of lists) {
                    data.push([
                        ct++,
                        item.u_nick_name,
                        item.p_nick_name,
                        item.pet_id,
                        petMap.PET_GENDER.get(item.gender) || "未知",
                        petMap.PET_KC_STATUS.get(item.kc_status) || "未知",
                        (item.vals / 1000).toFixed(2),
                    ]);
                }
            }
            // 创建工作簿和工作表  
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
            // 设置表头  
            const titleRow = [
                petMap.PET_SIZE.get(Number(size)) + '猫' + ageMaps[Number(age_id)].key + '体重' + weightMaps[Number(weight_id)].key + '明细表'
            ];
            worksheet.addRow(titleRow).font = { bold: true, size: 16 }; // 第一行加粗，字体大小16  
            worksheet.mergeCells('A1:G1'); // 合并A1到G1的单元格  
            worksheet.getRow(1).height = 40; // 设置第一行行高  
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'center' }; // 第一行合并后的单元格居中  
            // 第二行（合并，但文本左对齐）  
            worksheet.addRow([]); // 占位行  
            worksheet.mergeCells('A2:G2'); // 合并A2到G2的单元格  
            worksheet.getRow(2).height = 90; // 设置第二行行高  
            // 设置第二行内容（合并后的单元格值只需要设置一次）  
            const secondLine = `
                猫咪分类:${petMap.PET_SIZE.get(Number(size))}猫  
                年龄:${ageMaps[Number(age_id)].key}  
                体重区间:${weightMaps[Number(weight_id)].key}  
                符合条件的数量为:${lists.length}条  
                记录日期:${moment(begin).format('YYYY年MM月DD日')}-${moment(end).format('YYYY年MM月DD日')}`;
            worksheet.getCell('A2').value = secondLine;
            worksheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'center' }; // 第二行合并后的单元格垂直居中，水平左对齐
            let titCol = 'A';
            title.forEach((value, index) => {
                worksheet.getCell(titCol + '3').value = value;
                titCol = excelUtils.getNextColumnLetter(titCol); // 增加列索引并获取对应的列字母  
            });
            // 写入数据  
            let row = 4; // 从第4行开始写入数据  
            data.forEach((item) => {
                let column = 1; // 从A列开始  
                item.forEach((value) => {
                    worksheet.getCell(excelUtils.getColumnLetter(column) + row).value = value;
                    column++;
                });
                row++;
            });
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
    async weightagexport2(ctx) {
        try {
            let { begin, end, size, age_id = 0, weight_id = 0, pet_id = 0, uid = 0 } = ctx.query || {};
            let cond = "n.s_ncid = 7 AND n.pet_top_cid = 1";
            let base_sql = `
                SELECT 
                    n.nid AS id,
                    n.uid,
                    n.pet_id,
                    n.s_ncid,
                    n.note_time, 
                    na.vals 
                FROM 
                    note_pet AS n 
                LEFT JOIN 
                    note_attr AS na 
                ON 
                    n.nid = na.nid 
                WHERE 
                    ${cond}`;
            let base_view_sql = "";
            if (!size) {
                base_view_sql = `
                    SELECT 
                        t.*,
                        p.birthday,
                        p.size,
                        TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(birthday),FROM_UNIXTIME(note_time)) AS diffmonth 
                    FROM 
                        (${base_sql}) AS t 
                    LEFT JOIN 
                        pet AS p 
                    ON 
                        t.pet_id = p.id 
                    WHERE 
                        p.birthday != 0`;
            } else {
                base_view_sql = `
                    SELECT 
                        t.*,
                        p.birthday,
                        p.size,
                        TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(birthday),FROM_UNIXTIME(note_time)) AS diffmonth 
                    FROM 
                        (${base_sql}) AS t 
                    LEFT JOIN 
                        pet AS p 
                    ON 
                        t.pet_id = p.id 
                    WHERE 
                        p.birthday != 0 
                        AND 
                        p.size = ${size}`;
            }
            let ret_sql = `${base_view_sql} order by note_time DESC`;
            let sql_view = `
                SELECT 
                    t.id,
                    t.uid,
                    t.pet_id,
                    t.note_time,
                    t.vals,
                    p.birthday,
                    t.diffmonth 
                FROM 
                    (${ret_sql}) AS t 
                LEFT JOIN 
                    pet AS p 
                ON 
                    t.pet_id = p.id 
                LEFT JOIN 
                    user AS u 
                ON 
                    t.uid = u.uid`;
            let sql = `
                SELECT 
                    t.*,
                    n.\`desc\` 
                FROM 
                    (${sql_view}) AS t 
                LEFT JOIN 
                    note AS n 
                ON 
                    t.id = n.id 
                WHERE 
                    t.pet_id = :petId  
                    AND 
                    t.uid = :uid 
                ORDER BY 
                    t.note_time DESC`;
            let list_result = await sequelize_pet.query(sql, {
                replacements: { petId: pet_id, uid: uid },
                type: QueryTypes.SELECT
            });
            let list = list_result && list_result.length ? list_result : [];
            let petInfo = await Pet.findOne({
                where: { id: pet_id }
            });
            let userInfo = await User.findOne({
                where: { uid: uid }
            });
            let result = {
                lists: list,
                pet: petInfo,
                user: userInfo
            }
            let title = [
                '序号',
                '记录时年龄(月)',
                '记录时体重(kg)',
                '记录详细内容',
                '图片或者视频链接',
            ];
            let data = [];//存储数据
            if (result.lists && result.lists.length) {
                let ct = 1;
                for (let item of result.lists) {
                    data.push([
                        ct++,
                        item.diffmonth,
                        Math.round(item.vals / 1000).toFixed(2),
                        item.desc,
                        await helpService.getImgByNoteId(item.id)
                    ]);
                }
            }
            // 创建工作簿和工作表  
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
            // 设置表头  
            const titleRow = [
                result.pet.nick_name + '全部体重记录详情'
            ];
            worksheet.addRow(titleRow).font = { bold: true, size: 16 }; // 第一行加粗，字体大小16  
            worksheet.mergeCells('A1:G1'); // 合并A1到G1的单元格  
            worksheet.getRow(1).height = 40; // 设置第一行行高  
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'center' }; // 第一行合并后的单元格居中  
            // 第二行（合并，但文本左对齐）  
            worksheet.addRow([]); // 占位行  
            worksheet.mergeCells('A2:G2'); // 合并A2到G2的单元格  
            worksheet.getRow(2).height = 170; // 设置第二行行高 
            let role_id = 0;
            const globalUid = ctx.state.user?.uid;
            let adminUser = await PetAdminUser.findOne({
                where: {
                    uid: globalUid
                },
            });
            role_id = adminUser && adminUser.role_id ? adminUser.role_id : 0;
            let secondLine = "";
            if (role_id == 0) {
                secondLine = `
                    用户id：${result.user.uid}
                    用户名称：${result.user.mini_nick_name}
                    手机号：${result.user.phone}
                    地区：${result.user.ip_province}
                    猫咪名称：${result.pet.nick_name}
                    猫咪id：${result.pet.id}
                    猫咪品种：${await helpService.getPetCateName(result.pet.cate_id)}
                    猫咪性别：${petMap.PET_GENDER.get(result.pet.gender)}
                    是否绝育：${petMap.PET_KC_STATUS.get(result.pet.kc_status)}
                    最新体重记录：${result.lists.length && result.lists[0].vals ? Math.round(result.lists[0].vals / 1000).toFixed(2) + "kg" : "无"}`;
            } else {
                secondLine = `
                    用户id：${result.user.uid}
                    用户名称：${result.user.mini_nick_name}
                    地区：${result.user.ip_province}
                    猫咪名称：${result.pet.nick_name}
                    猫咪id：${result.pet.id}
                    猫咪品种：${await helpService.getPetCateName(result.pet.cate_id)}
                    猫咪性别：${petMap.PET_GENDER.get(result.pet.gender)}
                    是否绝育：${petMap.PET_KC_STATUS.get(result.pet.kc_status)}
                    最新体重记录：${result.lists.length && result.lists[0].vals ? Math.round(result.lists[0].vals / 1000).toFixed(2) + "kg" : "无"}`;
            }
            worksheet.getCell('A2').value = secondLine;
            worksheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'center' }; // 第二行合并后的单元格垂直居中，水平左对齐
            let titCol = 'A';
            title.forEach((value, index) => {
                worksheet.getCell(titCol + '3').value = value;
                titCol = excelUtils.getNextColumnLetter(titCol); // 增加列索引并获取对应的列字母  
            });
            // 写入数据  
            let row = 4; // 从第4行开始写入数据  
            data.forEach((item) => {
                let column = 1; // 从A列开始  
                item.forEach((value) => {
                    worksheet.getCell(excelUtils.getColumnLetter(column) + row).value = value;
                    column++;
                });
                row++;
            });
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
    //猫-年龄体型分布详情
    async weightage1(ctx) {
        try {
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let cond = `top_cate_id = 1 AND created BETWEEN ${startDateTimeStamp} AND ${endDateTimeStamp} AND somato_type != 0`;
            let base_sql = `
                SELECT 
                    id, somato_type, TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(birthday), NOW()) AS diffmonth 
                FROM 
                    pet 
                WHERE 
                    ${cond}`;
            let age_maps = [
                { key: "0-2个月", cond: "t.diffmonth BETWEEN 0 AND 2" },
                { key: "3-4个月", cond: "t.diffmonth BETWEEN 3 AND 4" },
                { key: "5-6个月", cond: "t.diffmonth BETWEEN 5 AND 6" },
                { key: "7-12个月", cond: "t.diffmonth BETWEEN 7 AND 12" },
                { key: "1岁", cond: "t.diffmonth = 12" },
                { key: "2岁", cond: "t.diffmonth = 24" },
                { key: "3岁", cond: "t.diffmonth = 36" },
                { key: "4岁", cond: "t.diffmonth = 48" },
                { key: "5岁", cond: "t.diffmonth = 60" },
                { key: "6岁", cond: "t.diffmonth = 72" },
                { key: "7-10岁", cond: "t.diffmonth BETWEEN 84 AND 120" },
                { key: "11岁以上", cond: "t.diffmonth >= 132" },
            ];
            let data = []; //存储返回结果
            //体型1-瘦弱,2-偏瘦,3-标准,4-偏胖,5-肥胖
            for (let age of age_maps) {
                let stat = {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                };
                let sql = `
                    SELECT 
                        somato_type, COUNT(*) AS ct 
                    FROM 
                        (${base_sql}) AS t 
                    WHERE  
                        ${age.cond} 
                    GROUP BY 
                        somato_type`;
                let somatoCount_result = await sequelize_pet.query(sql, {
                    type: QueryTypes.SELECT
                });
                let somatoCount = somatoCount_result && somatoCount_result.length ? somatoCount_result : [];
                // let somatoCount = [
                //     //待执行SQL，这里是模拟数据
                //     { somato_type: 1, ct: 100 },
                //     { somato_type: 2, ct: 100 },
                //     { somato_type: 3, ct: 100 },
                //     { somato_type: 4, ct: 100 },
                //     { somato_type: 5, ct: 100 },
                // ];
                if (!somatoCount || !somatoCount.length) continue;
                for (let item of somatoCount) {
                    let key = String(item.somato_type);
                    if (key in stat) {
                        stat[key] = item.ct;
                    }
                }
                data.push({
                    key: age.key,
                    stat: stat
                });
            }
            ctx.body = {
                success: true,
                data: data,
            };
        } catch (error) {
            console.log(error);
        }
    }
    //猫-排便相关
    async stool(ctx) {
        try {
            // {//参数结构
            //     "begin": "2024-05-30",
            //     "end": "2024-06-13"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": [
            //         {
            //             "id": 7,
            //             "key": "形态",
            //             "stat": {
            //                 "note_count": 3338,//记录条数
            //                 "user_count": 651,//记录人数
            //                 "pet_count": 1//记录宠物只数
            //             },
            //             "child": [//子类集合
            //                 {
            //                     "id": 42,
            //                     "key": "圆球颗粒",
            //                     "stat": {
            //                         "note_count": 153,
            //                         "user_count": 78,
            //                         "pet_count": 2
            //                     }
            //                 },
            //                 //...形态下的其它小类，比如节节状/木桩状等等
            //             ]
            //         },
            //         //...其它大类，比如颜色/气味/分量/混合物
            //     ]
            // }
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let cond = `note_time BETWEEN ${startDateTimeStamp} AND ${endDateTimeStamp}`;
            let ncaid_maps = [
                { key: "形态", cond: "ncaid = 7", type: "single", id: 7 },
                { key: "颜色", cond: "ncaid = 8", type: "single", id: 8 },
                { key: "气味", cond: "ncaid = 9", type: "single", id: 9 },
                { key: "分量", cond: "ncaid = 10", type: "single", id: 10 },
                { key: "混合物", cond: "ncaid = 11", type: "multi", id: 11 },
            ];
            let data = []; //存储返回结果
            for (let map of ncaid_maps) {
                let base_view_sql = `
                    SELECT 
                        id, nid, ncaid, uid, pet_id, vals, vals_ext, is_deleted, created, updated, note_time 
                    FROM 
                        note_attr 
                    WHERE 
                        ${map.cond} 
                        AND 
                        ${cond}`;
                //存储记录条数/记录人数/记录宠物数
                let stat = {
                    note_count: 0,
                    user_count: 0,
                    pet_count: 0,
                };
                let child = []; //存储子类数据
                //记录条数
                let note_cnt_sql = `SELECT COUNT(*) AS ct FROM (${base_view_sql}) AS t`;
                let noteCount_result = await sequelize_pet.query(note_cnt_sql, {
                    type: QueryTypes.SELECT
                });
                let noteCount = noteCount_result && noteCount_result[0] && noteCount_result[0].ct ? noteCount_result[0].ct : 0;
                // let noteCount = [
                //     //待执行SQL，这里是模拟数据
                //     { ct: 100 },
                // ];
                stat.note_count = noteCount;
                //记录人数
                let user_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.uid) AS t`;
                let userCount_result = await sequelize_pet.query(user_cnt_sql, {
                    type: QueryTypes.SELECT
                });
                let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
                // let userCount = [
                //     //待执行SQL，这里是模拟数据
                //     { ct: 100 },
                // ];
                stat.user_count = userCount;
                //记录宠物只数
                let pet_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.pet_id) AS t`;
                let petCount_result = await sequelize_pet.query(pet_cnt_sql, {
                    type: QueryTypes.SELECT
                });
                let petCount = petCount_result && petCount_result[0] && petCount_result[0].ct ? petCount_result[0].ct : 0;
                // let petCount = [
                //     //待执行SQL，这里是模拟数据
                //     { ct: 100 },
                // ];
                stat.pet_count = petCount;
                //获取属性值
                let arrt_vals = await NoteCateAttrVal.findAll({
                    where: {
                        ncaid: map.id,
                    },
                });
                let attrVals = JSON.parse(JSON.stringify(arrt_vals));
                if (_.isEmpty(attrVals)) continue;
                if (map.type === "single") {
                    for (let item of attrVals) {
                        let base_view_sql = `
                            SELECT 
                                id,nid,ncaid,uid,pet_id,vals,vals_ext,is_deleted,created,updated,note_time 
                            FROM 
                                note_attr 
                            WHERE 
                                vals = ${item.id} 
                                AND 
                                ${cond}`;
                        //存储记录条数/记录人数/记录宠物数
                        let child_stat = {
                            note_count: 0,
                            user_count: 0,
                            pet_count: 0,
                        };
                        //记录条数
                        let note_cnt_sql = `SELECT COUNT(*) AS ct FROM (${base_view_sql}) AS t`;
                        let noteCount_result = await sequelize_pet.query(note_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let noteCount = noteCount_result && noteCount_result[0] && noteCount_result[0].ct ? noteCount_result[0].ct : 0;
                        // let noteCount = [
                        //     //待执行SQL，这里是模拟数据
                        //     { ct: 100 },
                        // ];
                        child_stat.note_count = noteCount;
                        //记录人数
                        let user_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.uid) AS t`;
                        let userCount_result = await sequelize_pet.query(user_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
                        // let userCount = [
                        //     //待执行SQL，这里是模拟数据
                        //     { ct: 100 },
                        // ];
                        child_stat.user_count = userCount;
                        //记录宠物只数
                        let pet_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.pet_id) AS t`;
                        let petCount_result = await sequelize_pet.query(pet_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let petCount = petCount_result && petCount_result[0] && petCount_result[0].ct ? petCount_result[0].ct : 0;
                        child_stat.pet_count = petCount;
                        child.push({
                            id: item.id,
                            key: item.key,
                            stat: child_stat,
                        });
                    }
                } else {
                    for (let item of attrVals) {
                        let base_view_sql = `
                            SELECT 
                                id,nid,ncaid,uid,pet_id,vals,vals_ext,is_deleted,created,updated,note_time 
                            FROM 
                                note_attr 
                            WHERE 
                                FIND_IN_SET(${item.id},vals) 
                                AND 
                                ${cond}`;
                        //存储记录条数/记录人数/记录宠物数
                        let child_stat = {
                            note_count: 0,
                            user_count: 0,
                            pet_count: 0,
                        };
                        //记录条数
                        let note_cnt_sql = `SELECT COUNT(*) AS ct FROM (${base_view_sql}) AS t`;
                        let noteCount_result = await sequelize_pet.query(note_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let noteCount = noteCount_result && noteCount_result[0] && noteCount_result[0].ct ? noteCount_result[0].ct : 0;
                        // let noteCount = [
                        //     //待执行SQL，这里是模拟数据
                        //     { ct: 100 },
                        // ];
                        child_stat.note_count = noteCount;
                        //记录人数
                        let user_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.uid) AS t`;
                        let userCount_result = await sequelize_pet.query(user_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
                        // let userCount = [
                        //     //待执行SQL，这里是模拟数据
                        //     { ct: 100 },
                        // ];
                        child_stat.user_count = userCount;
                        //记录宠物只数
                        let pet_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.pet_id) AS t`;
                        let petCount_result = await sequelize_pet.query(pet_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let petCount = petCount_result && petCount_result[0] && petCount_result[0].ct ? petCount_result[0].ct : 0;
                        child_stat.pet_count = petCount;
                        child.push({
                            id: item.id,
                            key: item.key,
                            stat: child_stat,
                        });
                    }
                }
                data.push({
                    id: map.id,
                    key: map.key,
                    stat: stat,
                    child: child,
                });
            }
            ctx.body = {
                success: true,
                data: data,
            };
        } catch (error) {
            console.log(error);
        }
    }
    //猫-排尿相关
    async urine(ctx) {
        try {
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let cond = `note_time BETWEEN ${startDateTimeStamp} AND ${endDateTimeStamp}`;
            let ncaid_maps = [
                { key: "外观", cond: "ncaid = 12", type: "single", id: 12 },
                { key: "颜色", cond: "ncaid = 13", type: "single", id: 13 },
                { key: "气味", cond: "ncaid = 14", type: "single", id: 14 },
                { key: "形态", cond: "ncaid = 15", type: "multi", id: 15 },
            ];
            let data = []; //存储返回结果
            for (let map of ncaid_maps) {
                let base_view_sql = `
                    SELECT 
                        id, nid, ncaid, uid, pet_id, vals, vals_ext, is_deleted, created, updated, note_time 
                    FROM 
                        note_attr 
                    WHERE 
                        ${map.cond} 
                        AND 
                        ${cond}`;
                //存储记录条数/记录人数/记录宠物数
                let stat = {
                    note_count: 0,
                    user_count: 0,
                    pet_count: 0,
                };
                let child = []; //存储子类数据
                //记录条数
                let note_cnt_sql = `SELECT COUNT(*) AS ct FROM (${base_view_sql}) AS t`;
                let noteCount_result = await sequelize_pet.query(note_cnt_sql, {
                    type: QueryTypes.SELECT
                });
                let noteCount = noteCount_result && noteCount_result[0] && noteCount_result[0].ct ? noteCount_result[0].ct : 0;
                // let noteCount = [
                //     //待执行SQL，这里是模拟数据
                //     { ct: 100 },
                // ];
                stat.note_count = noteCount;
                //记录人数
                let user_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.uid) AS t`;
                let userCount_result = await sequelize_pet.query(user_cnt_sql, {
                    type: QueryTypes.SELECT
                });
                let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
                // let userCount = [
                //     //待执行SQL，这里是模拟数据
                //     { ct: 100 },
                // ];
                stat.user_count = userCount;
                //记录宠物只数
                let pet_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.pet_id) AS t`;
                let petCount_result = await sequelize_pet.query(pet_cnt_sql, {
                    type: QueryTypes.SELECT
                });
                let petCount = petCount_result && petCount_result[0] && petCount_result[0].ct ? petCount_result[0].ct : 0;
                // let petCount = [
                //     //待执行SQL，这里是模拟数据
                //     { ct: 100 },
                // ];
                stat.pet_count = petCount;
                //获取属性值
                let arrt_vals = await NoteCateAttrVal.findAll({
                    where: {
                        ncaid: map.id,
                    },
                });
                let attrVals = JSON.parse(JSON.stringify(arrt_vals));
                if (_.isEmpty(attrVals)) continue;
                if (map.type === "single") {
                    for (let item of attrVals) {
                        let base_view_sql = `
                            SELECT 
                                id,nid,ncaid,uid,pet_id,vals,vals_ext,is_deleted,created,updated,note_time 
                            FROM 
                                note_attr 
                            WHERE 
                                vals = ${item.id} 
                                AND 
                                ${cond}`;
                        //存储记录条数/记录人数/记录宠物数
                        let child_stat = {
                            note_count: 0,
                            user_count: 0,
                            pet_count: 0,
                        };
                        //记录条数
                        let note_cnt_sql = `SELECT COUNT(*) AS ct FROM (${base_view_sql}) AS t`;
                        let noteCount_result = await sequelize_pet.query(note_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let noteCount = noteCount_result && noteCount_result[0] && noteCount_result[0].ct ? noteCount_result[0].ct : 0;
                        // let noteCount = [
                        //     //待执行SQL，这里是模拟数据
                        //     { ct: 100 },
                        // ];
                        child_stat.note_count = noteCount;
                        //记录人数
                        let user_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.uid) AS t`;
                        let userCount_result = await sequelize_pet.query(user_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
                        // let userCount = [
                        //     //待执行SQL，这里是模拟数据
                        //     { ct: 100 },
                        // ];
                        child_stat.user_count = userCount;
                        //记录宠物只数
                        let pet_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.pet_id) AS t`;
                        let petCount_result = await sequelize_pet.query(pet_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let petCount = petCount_result && petCount_result[0] && petCount_result[0].ct ? petCount_result[0].ct : 0;
                        child_stat.pet_count = petCount;
                        child.push({
                            id: item.id,
                            key: item.key,
                            stat: child_stat,
                        });
                    }
                } else {
                    for (let item of attrVals) {
                        let base_view_sql = `
                            SELECT 
                                id,nid,ncaid,uid,pet_id,vals,vals_ext,is_deleted,created,updated,note_time 
                            FROM 
                                note_attr 
                            WHERE 
                                FIND_IN_SET(${item.id},vals) 
                                AND 
                                ${cond}`;
                        //存储记录条数/记录人数/记录宠物数
                        let child_stat = {
                            note_count: 0,
                            user_count: 0,
                            pet_count: 0,
                        };
                        //记录条数
                        let note_cnt_sql = `SELECT COUNT(*) AS ct FROM (${base_view_sql}) AS t`;
                        let noteCount_result = await sequelize_pet.query(note_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let noteCount = noteCount_result && noteCount_result[0] && noteCount_result[0].ct ? noteCount_result[0].ct : 0;
                        // let noteCount = [
                        //     //待执行SQL，这里是模拟数据
                        //     { ct: 100 },
                        // ];
                        child_stat.note_count = noteCount;
                        //记录人数
                        let user_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.uid) AS t`;
                        let userCount_result = await sequelize_pet.query(user_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
                        // let userCount = [
                        //     //待执行SQL，这里是模拟数据
                        //     { ct: 100 },
                        // ];
                        child_stat.user_count = userCount;
                        //记录宠物只数
                        let pet_cnt_sql = `SELECT COUNT(*) AS ct FROM (SELECT COUNT(*) AS _ct FROM (${base_view_sql}) AS t GROUP BY t.pet_id) AS t`;
                        let petCount_result = await sequelize_pet.query(pet_cnt_sql, {
                            type: QueryTypes.SELECT
                        });
                        let petCount = petCount_result && petCount_result[0] && petCount_result[0].ct ? petCount_result[0].ct : 0;
                        child_stat.pet_count = petCount;
                        child.push({
                            id: item.id,
                            key: item.key,
                            stat: child_stat,
                        });
                    }
                }
                data.push({
                    id: map.id,
                    key: map.key,
                    stat: stat,
                    child: child,
                });
            }
            ctx.body = {
                success: true,
                data: data,
            };
        } catch (error) {
            console.log(error);
        }
    }
    //猫-尿便详情
    async stoolurinedetail(ctx) {
        try {
            // {参数结构(大类型)
            //     "type": 1,
            //     "atrr_id": 7,
            //     "type_text": "stool",
            //     "begin": "2024-05-31",
            //     "end": "2024-06-14"
            // }
            // {参数结构(子类型)
            //     "type": 1,
            //     "atrr_id": 7,
            //     "atrr_var_id": 42,
            //     "type_text": "stool",
            //     "begin": "2024-05-31",
            //     "end": "2024-06-14"
            // }
            // {//返回结构
            //     "code": 200,
            //     "msg": "",
            //     "data": {
            //         "lists": [
            //             {
            //                 "uid": 212349,
            //                 "ct": 42,
            //                 "nick_name": "庚儿是个小坏蛋"
            //             },
            //             {
            //                 "uid": 604314,
            //                 "ct": 37,
            //                 "nick_name": ""
            //             },
            //             {
            //                 "uid": 629888,
            //                 "ct": 34,
            //                 "nick_name": ""
            //             },
            //             {
            //                 "uid": 391634,
            //                 "ct": 31,
            //                 "nick_name": "安三岁"
            //             },
            //             {
            //                 "uid": 644606,
            //                 "ct": 28,
            //                 "nick_name": ""
            //             }
            //         ],
            //         "time": "2024年05月31日-2024年06月14日",
            //         "note_count": 3291,
            //         "user_count": 638,
            //         "attr_cate": "形态"
            //     },
            //     "_t": 1718345338,
            //     "_sql": ""
            // }
            let { begin, end, type, atrr_id, atrr_var_id = 0, type_text } = ctx.request.body || {};
            if (!begin || !end || !type || !atrr_id) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let cond = `note_time BETWEEN ${startDateTimeStamp} AND ${endDateTimeStamp}`;
            const maps = {
                1: {
                    7: {
                        type: "single",
                    },
                    8: {
                        type: "single",
                    },
                    9: {
                        type: "single",
                    },
                    10: {
                        type: "single",
                    },
                    11: {
                        type: "multi",
                    },
                },
                2: {
                    12: {
                        type: "single",
                    },
                    13: {
                        type: "single",
                    },
                    14: {
                        type: "single",
                    },
                    15: {
                        type: "multi",
                    },
                },
            };
            let top5_sql = ""; //TOP5用户及其对应的记录条数
            let user_count_sql = ""; //记录人数SQL
            let note_count_sql = ""; //记录条数SQL
            let atrr = {}; //大类型信息
            atrr = await NoteCateAttr.findOne({
                //获取大类型的信息
                where: { id: atrr_id },
            });
            let atrr_val = {}; //子类型信息
            //type 1-尿便-排便 2-尿便-排尿
            //1级属性
            if (atrr_var_id == 0) {
                let ncaid = atrr_id;
                let base_view_sql = `
                    SELECT 
                        id,nid,ncaid,uid,pet_id,vals,vals_ext,is_deleted,created,updated,note_time 
                    FROM 
                        note_attr 
                    WHERE 
                        ncaid = ${ncaid} 
                        AND 
                        ${cond}`;
                top5_sql = `
                    SELECT 
                        uid, COUNT(*) AS ct 
                    FROM 
                        (${base_view_sql}) AS t 
                    GROUP BY 
                        uid 
                    ORDER BY 
                        ct DESC 
                    LIMIT 5`;
                user_count_sql = `
                    SELECT 
                        COUNT(*) AS ct 
                    FROM 
                        (
                            SELECT 
                                COUNT(*) AS _ct 
                            FROM 
                                (${base_view_sql}) AS t 
                            GROUP BY 
                                t.uid
                        ) as t`;
                note_count_sql = `
                    SELECT 
                        COUNT(*) AS ct 
                    FROM 
                        (${base_view_sql}) AS t`;
            } else {
                //2级属性
                let vals = atrr_var_id;
                atrr_val = await NoteCateAttrVal.findOne({
                    where: { id: atrr_var_id },
                });
                if (maps[type][atrr_id].type === "single") {
                    let base_view_sql = `
                        SELECT 
                            id,nid,ncaid,uid,pet_id,vals,vals_ext,is_deleted,created,updated,note_time 
                        FROM 
                            note_attr 
                        WHERE 
                            vals = ${vals} 
                            AND 
                            ${cond}`;
                    top5_sql = `
                        SELECT 
                            uid,count(*) AS ct 
                        FROM 
                            (${base_view_sql}) AS t 
                        GROUP BY 
                            uid 
                        ORDER BY 
                            ct DESC 
                        LIMIT 5`;
                    user_count_sql = `
                        SELECT 
                            COUNT(*) AS ct 
                        FROM 
                            (
                                SELECT 
                                    COUNT(*) AS _ct 
                                FROM 
                                    (${base_view_sql}) AS t 
                                GROUP BY 
                                    t.uid
                            ) AS t`;
                    note_count_sql = `
                        SELECT 
                            COUNT(*) AS ct 
                        FROM 
                            (${base_view_sql}) AS t`;
                } else {
                    let base_view_sql = `
                        SELECT 
                            id,nid,ncaid,uid,pet_id,vals,vals_ext,is_deleted,created,updated,note_time 
                        FROM 
                            note_attr 
                        WHERE 
                            FIND_IN_SET(${vals},vals) 
                            AND 
                            ${cond}`;
                    top5_sql = `
                        SELECT 
                            uid,COUNT(*) AS ct 
                        FROM 
                            (${base_view_sql}) AS t 
                        GROUP BY 
                            uid 
                        ORDER BY 
                            ct DESC  
                        LIMIT 5`;
                    user_count_sql = `
                        SELECT 
                            COUNT(*) AS ct 
                        FROM 
                            (
                                SELECT 
                                    COUNT(*) AS _ct 
                                FROM 
                                    (${base_view_sql}) AS t 
                                GROUP BY 
                                    t.uid
                            ) AS t`;
                    note_count_sql = `
                        SELECT 
                            COUNT(*) AS ct 
                        FROM 
                            (${base_view_sql}) AS t`;
                }
            }
            let top5Lists_result = await sequelize_pet.query(top5_sql, {
                type: QueryTypes.SELECT
            });
            let top5Lists = top5Lists_result && top5Lists_result.length ? top5Lists_result : [];
            // let top5Lists = [
            //     //待执行top5_sql，这里是模拟数据
            //     { uid: 1, ct: 100 },
            //     { uid: 2, ct: 90 },
            //     { uid: 3, ct: 80 },
            //     { uid: 4, ct: 70 },
            //     { uid: 5, ct: 60 },
            // ];
            let userCount_result = await sequelize_pet.query(user_count_sql, {
                type: QueryTypes.SELECT
            });
            let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
            // let userCount = [
            //     //待执行user_count_sql，这里是模拟数据
            //     { ct: 100 },
            // ];
            let noteCount_result = await sequelize_pet.query(note_count_sql, {
                type: QueryTypes.SELECT
            });
            let noteCount = noteCount_result && noteCount_result[0] && noteCount_result[0].ct ? noteCount_result[0].ct : 0;
            // let noteCount = [
            //     //待执行note_count_sql，这里是模拟数据
            //     { ct: 200 },
            // ];
            let top5 = JSON.parse(JSON.stringify(top5Lists));
            for (let item of top5) {
                let user = await User.findOne({
                    where: { uid: item.uid },
                });
                item.nick_name = user && user.mini_nick_name ? user.mini_nick_name : "";
            }
            ctx.body = {
                success: true,
                data: {
                    lists: top5,
                    time:
                        moment(begin, "YYYY-MM-DD").format("YYYY年MM月DD日") +
                        "-" +
                        moment(end, "YYYY-MM-DD").format("YYYY年MM月DD日"),
                    note_count: noteCount,
                    user_count: userCount,
                    attr_cate: atrr_val && atrr_val.val ? atrr.title + "-" + atrr_val.val : atrr.title,
                },
            };
        } catch (error) {
            console.log(error);
        }
    }
    //猫-尿便详情-导出（top3000）
    async stoolurinexport1(ctx) {
        try {
            let { begin, end, type, atrr_id, atrr_var_id = 0 } = ctx.query || {};
            if (!begin || !end || [null, undefined, ""].includes(type) || [null, undefined, ""].includes(atrr_id)) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let cond = `na.note_time BETWEEN ${startDateTimeStamp} AND ${endDateTimeStamp}`;
            const maps = {
                1: {
                    7: {
                        type: "single",
                    },
                    8: {
                        type: "single",
                    },
                    9: {
                        type: "single",
                    },
                    10: {
                        type: "single",
                    },
                    11: {
                        type: "multi",
                    },
                },
                2: {
                    12: {
                        type: "single",
                    },
                    13: {
                        type: "single",
                    },
                    14: {
                        type: "single",
                    },
                    15: {
                        type: "multi",
                    },
                },
            };
            let top3000_sql = ""; //TOP3000记录
            let user_count_sql = ""; //记录人数SQL
            let note_count_sql = ""; //记录条数SQL
            let atrr = {}; //大类型信息
            atrr = await NoteCateAttr.findOne({
                //获取大类型的信息
                where: { id: atrr_id },
            });
            let atrr_val = {}; //子类型信息
            let limit = 3000;
            //type 1-尿便-排便 2-尿便-排尿
            //1级属性
            if (atrr_var_id == 0) {
                let ncaid = atrr_id;
                let nids_sql = `
                    SELECT 
                        nid 
                    FROM 
                        note_attr AS na 
                    LEFT JOIN 
                        note AS n 
                    ON 
                        na.nid = n.id 
                    WHERE 
                        ncaid = :ncaid  
                        AND 
                        ${cond} 
                    ORDER BY 
                        na.note_time DESC 
                    LIMIT  
                        :limit`;
                let nidList_result = await sequelize_pet.query(nids_sql, {
                    replacements: { ncaid: ncaid, limit: limit },
                    type: QueryTypes.SELECT
                });
                let nidList = nidList_result && nidList_result.length ? nidList_result : [];
                let nids = nidList.map(item => item.nid);
                let in_nids = nids.map((item) => Number(`${item}`)).join(",") || null;//1,2,...,100,...
                let base_view_sql = `
                    SELECT 
                        g1.*, g2.id, g2.ncaid, g2.uid, g2.vals, g2.vals_ext, g2.is_deleted, g2.created, g2.updated 
                    FROM 
                        (
                            SELECT 
                                t1.*, t2.note_time, t2.\`desc\` 
                            FROM 
                                (
                                    SELECT 
                                        nid, MAX(pet_id) AS pet_id 
                                    FROM 
                                        note_pet 
                                    WHERE 
                                        nid IN (${in_nids}) 
                                    GROUP BY 
                                        nid
                                ) AS t1 
                            LEFT JOIN 
                                note AS t2
	                        ON 
                                t1.nid = t2.id
                        ) AS g1 
                    LEFT JOIN 
                        note_attr AS g2 
                    ON 
                        g1.nid = g2.nid`;
                let view_sql = `
                    SELECT 
                        t.nid,t.uid,t.pet_id,t.note_time,t.\`desc\` 
                    FROM 
                        (${base_view_sql}) AS t`;
                top3000_sql = `
                    SELECT 
                        t.*,
                        p.birthday, 
                        p.nick_name,
                        p.cate_id,
                        p.gender,
                        p.kc_status, 
                        TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(p.birthday),FROM_UNIXTIME(t.note_time)) AS diffmonth 
                    FROM 
                        (${view_sql}) AS t 
                    LEFT JOIN 
                        pet AS p 
                    ON 
                        t.pet_id = p.id`;
                user_count_sql = `
                    SELECT 
                        COUNT(*) AS ct 
                    FROM 
                        (${base_view_sql}) AS t 
                    GROUP BY 
                        t.uid`;
                note_count_sql = `
                    SELECT 
                        COUNT(*) AS ct 
                    FROM 
                        (${base_view_sql}) AS t`;
            } else {
                //2级属性值
                let vals = atrr_var_id;
                atrr_val = await NoteCateAttrVal.findOne({
                    where: { id: atrr_var_id },
                });
                if (maps[type][atrr_id].type === "single") {
                    let nids_sql = `
                        SELECT 
                            nid 
                        FROM 
                            note_attr AS na 
                        LEFT JOIN 
                            note AS n 
                        ON 
                            na.nid = n.id 
                        WHERE 
                            vals = :vals  
                            AND 
                            ${cond} 
                        ORDER BY 
                            na.note_time DESC 
                        LIMIT 
                            :limit`;
                    let nidList_result = await sequelize_pet.query(nids_sql, {
                        replacements: { vals: vals, limit: limit },
                        type: QueryTypes.SELECT
                    });
                    let nidList = nidList_result && nidList_result.length ? nidList_result : [];
                    let nids = nidList.map(item => item.nid)
                    let in_nids = nids.map((item) => Number(`${item}`)).join(",") || null;//1,2,...,100,...
                    let base_view_sql = `
                        SELECT 
                            g1.*,
                            g2.id,
                            g2.ncaid,
                            g2.uid,
                            g2.vals,
                            g2.vals_ext,
                            g2.is_deleted,
                            g2.created,
                            g2.updated 
                        FROM
                            (
                                SELECT 
                                    t1.*, t2.note_time, t2.\`desc\`  
                                FROM 
                                    (
                                        SELECT 
                                            nid, MAX(pet_id) AS pet_id 
                                        FROM 
                                            note_pet 
                                        WHERE 
                                            nid IN (${in_nids}) 
                                        GROUP BY 
                                            nid
                                    ) AS t1 
                                LEFT JOIN 
                                    note AS t2 
                                ON 
                                    t1.nid = t2.id
                            ) AS g1 
                        LEFT JOIN 
                            note_attr AS g2 
                        ON 
                            g1.nid = g2.nid`;
                    let view_sql = `
                        SELECT 
                            t.nid,t.uid,t.pet_id,t.note_time,t.\`desc\`  
                        FROM 
                            (${base_view_sql}) AS t`;
                    top3000_sql = `
                        SELECT 
                            t.*,
                            p.birthday, 
                            p.nick_name,
                            p.cate_id,
                            p.gender,
                            p.kc_status, 
                            TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(p.birthday),FROM_UNIXTIME(t.note_time)) AS diffmonth 
                        FROM 
                            (${view_sql}) AS t 
                        LEFT JOIN 
                            pet AS p 
                        ON 
                            t.pet_id = p.id`;
                    user_count_sql = `
                        SELECT 
                            COUNT(*) AS ct 
                        FROM 
                            (${base_view_sql}) AS t 
                        GROUP BY 
                            t.uid`;
                    note_count_sql = `
                        SELECT 
                            COUNT(*) AS ct 
                        FROM 
                            (${base_view_sql}) AS t`;

                } else {
                    let nids_sql = `
                        SELECT 
                            nid 
                        FROM 
                            note_attr AS na 
                        LEFT JOIN 
                            note AS n 
                        ON 
                            na.nid = n.id 
                        WHERE 
                            FIND_IN_SET(:vals,vals) 
                            AND 
                            ${cond} 
                        ORDER BY  
                            na.note_time DESC 
                        LIMIT 
                            :limit`;
                    let nidList_result = await sequelize_pet.query(nids_sql, {
                        replacements: { vals: vals, limit: limit },
                        type: QueryTypes.SELECT
                    });
                    let nidList = nidList_result && nidList_result.length ? nidList_result : [];
                    let nids = nidList.map(item => item.nid);
                    let in_nids = nids.map((item) => Number(`${item}`)).join(",") || null;//1,2,...,100,...
                    let base_view_sql = `
                        SELECT 
                            g1.*,
                            g2.id,
                            g2.ncaid,
                            g2.uid,
                            g2.vals,
                            g2.vals_ext,
                            g2.is_deleted,
                            g2.created,
                            g2.updated 
                        FROM 
                            (
                                SELECT 
                                    t1.*, t2.note_time, t2.\`desc\`  
                                FROM 
                                    (
                                        SELECT 
                                            nid, MAX(pet_id) AS pet_id 
                                        FROM 
                                            note_pet 
                                        WHERE 
                                            nid IN (${in_nids}) 
                                        GROUP BY 
                                            nid
                                    ) AS t1 
                                LEFT JOIN 
                                    note AS t2
                                ON 
                                    t1.nid = t2.id
                            ) as g1 
                        LEFT JOIN 
                            note_attr AS g2 
                        ON 
                            g1.nid = g2.nid`;
                    let view_sql = `
                        SELECT 
                            t.nid,t.uid,t.pet_id,t.note_time,t.\`desc\`  
                        FROM 
                            (${base_view_sql}) AS t`;
                    top3000_sql = `
                        SELECT 
                            t.*,
                            p.birthday, 
                            p.nick_name,
                            p.cate_id,
                            p.gender,
                            p.kc_status, 
                            TIMESTAMPDIFF(MONTH,FROM_UNIXTIME(p.birthday),FROM_UNIXTIME(t.note_time)) AS diffmonth 
                        FROM 
                            (${view_sql}) AS t 
                        LEFT JOIN 
                            pet AS p 
                        ON 
                            t.pet_id = p.id`;
                    user_count_sql = `
                        SELECT 
                            COUNT(*) AS ct 
                        FROM 
                            (${base_view_sql}) AS t 
                        GROUP BY 
                            t.uid`;
                    note_count_sql = `
                        SELECT 
                            COUNT(*) AS ct 
                        FROM 
                            (${base_view_sql}) AS t`;
                }
            }
            let top3000Lists_result = await sequelize_pet.query(top3000_sql, {
                type: QueryTypes.SELECT
            });
            let top3000Lists = top3000Lists_result && top3000Lists_result.length ? top3000Lists_result : [];
            let userCount_result = await sequelize_pet.query(user_count_sql, {
                type: QueryTypes.SELECT
            });
            let userCount = userCount_result && userCount_result[0] && userCount_result[0].ct ? userCount_result[0].ct : 0;
            let noteCount_result = await sequelize_pet.query(note_count_sql, {
                type: QueryTypes.SELECT
            });
            let noteCount = noteCount_result && noteCount_result[0] && noteCount_result[0].ct ? noteCount_result[0].ct : 0;
            let top3000 = JSON.parse(JSON.stringify(top3000Lists));
            for (let item of top3000) {
                let user = await User.findOne({
                    where: { uid: item.uid },
                    attributes: ['uid', 'mini_nick_name', 'phone', 'ip_province']
                });
                item.user = user || {};
            }
            let result = {
                lists3000: top3000,
                time: moment(begin, "YYYY-MM-DD").format("YYYY年MM月DD日") + "-" + moment(end, "YYYY-MM-DD").format("YYYY年MM月DD日"),
                note_count: noteCount,
                user_count: userCount,
                attr_cate: atrr_val && atrr_val.val ? atrr.title + "-" + atrr_val.val : atrr.title,
                type: type == 1 ? "尿便-排便" : "尿便-排尿"
            }
            let role_id = 0;
            const globalUid = ctx.state.user?.uid;
            let adminUser = await PetAdminUser.findOne({
                where: {
                    uid: globalUid
                },
            });
            role_id = adminUser && adminUser.role_id ? adminUser.role_id : 0;
            let title = [];
            if (role_id == 0) {
                title = [
                    '序号',
                    '宠物id',
                    '宠物名称',
                    '宠物品种',
                    '性别',
                    '是否绝育',
                    '用户id',
                    '用户名称',
                    '手机号',
                    '地区',
                    '记录时年龄(月)',
                    '详细记录内容',
                    '图片/视频链接',
                ];
            } else {
                title = [
                    '序号',
                    '宠物id',
                    '宠物名称',
                    '宠物品种',
                    '性别',
                    '是否绝育',
                    '用户id',
                    '用户名称',
                    '地区',
                    '记录时年龄(月)',
                    '详细记录内容',
                    '图片/视频链接',
                ];
            }
            let data = [];
            if (result.lists3000 && result.lists3000.length) {
                let ct = 1;
                let top3000 = result.lists3000;
                for (let item of top3000) {
                    if (role_id == 0) {
                        data.push([
                            ct++,
                            item.pet_id,
                            item.p_nick_name || item.nick_name || "",
                            await helpService.getPetCateName(item.cate_id) || "",
                            petMap.PET_GENDER.get(item.gender) || "未知",
                            petMap.PET_KC_STATUS.get(item.kc_status) || "未知",
                            item.user ? item.user.uid : "",
                            item.user && item.user.mini_nick_name ? item.user.mini_nick_name : "",
                            item.user ? item.user.phone : "",
                            item.user ? item.user.ip_province : "",
                            (!item.birthday || item.diffmonth < 0) ? "无" : item.diffmonth,
                            item.desc,
                            await helpService.getImgByNoteId(item.nid)
                        ]);
                    } else {
                        data.push([
                            ct++,
                            item.pet_id,
                            item.p_nick_name || item.nick_name || "",
                            await helpService.getPetCateName(item.cate_id) || "",
                            petMap.PET_GENDER.get(item.gender) || "未知",
                            petMap.PET_KC_STATUS.get(item.kc_status) || "未知",
                            item.user ? item.user.uid : "",
                            item.user && item.user.mini_nick_name ? item.user.mini_nick_name : "",
                            item.user ? item.user.ip_province : "",
                            (!item.birthday || item.diffmonth < 0) ? "无" : item.diffmonth,
                            item.desc,
                            await helpService.getImgByNoteId(item.nid)
                        ]);
                    }
                }
            }
            // 创建一个新的工作簿  
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');
            //第一行
            role_id == 0 ? worksheet.mergeCells('A1:M1') : worksheet.mergeCells('A1:L1');
            worksheet.getCell('A1').value = result.attr_cate + ' 记录详细内容(最新3000条)';
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'center' };
            worksheet.getRow(1).height = 40;
            worksheet.getCell('A1').font = { bold: true, size: 16 };
            //第二行
            role_id == 0 ? worksheet.mergeCells('A2:M2') : worksheet.mergeCells('A2:L2');
            worksheet.getRow(2).height = 40;
            worksheet.getCell('A2').font = { bold: true, size: 16 };
            let secondLine = `
                记录类型：${result.type}
                属性类型：${result.attr_cate}
                记录人数：${result.user_count}
                记录条数：${result.note_count}条`;
            worksheet.getCell('A2').value = secondLine;
            worksheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'center' }; // 第二行合并后的单元格垂直居中，水平左对齐
            let titCol = 'A';
            title.forEach((value, index) => {
                worksheet.getCell(titCol + '3').value = value;
                titCol = excelUtils.getNextColumnLetter(titCol); // 增加列索引并获取对应的列字母  
            });
            // 写入数据  
            let row = 4; // 从第4行开始写入数据  
            data.forEach((item) => {
                let column = 1; // 从A列开始  
                item.forEach((value) => {
                    worksheet.getCell(excelUtils.getColumnLetter(column) + row).value = value;
                    column++;
                });
                row++;
            });
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
    //猫-尿便详情-导出（单个用户的全部记录）
    async stoolurinexport2(ctx) {
        try {
            let { begin, end, type, atrr_id, atrr_var_id = 0, uid = 0 } = ctx.query || {};
            if (!begin || !end || [null, undefined, ""].includes(type) || [null, undefined, ""].includes(atrr_id)) {
                return (ctx.body = { success: false, msg: "参数缺失" });
            }
            let role_id = 0;
            const globalUid = ctx.state.user?.uid;
            let adminUser = await PetAdminUser.findOne({
                where: {
                    uid: globalUid
                },
            });
            role_id = adminUser && adminUser.role_id ? adminUser.role_id : 0;
            let startDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            let endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let cond = `uid = ${uid} AND pet_top_cid = 1 AND is_auto = 0`;
            let pet_cnt = 0;
            let note_cnt = 0;
            let lists = [];
            let user_note_cnt_sql = `
                SELECT 
                    COUNT(DISTINCT nid) AS ct 
                FROM 
                    note_pet 
                WHERE 
                    ${cond}`;
            let userNoteCount_result = await sequelize_pet.query(user_note_cnt_sql, {
                type: QueryTypes.SELECT
            });
            let userNoteCount = userNoteCount_result && userNoteCount_result[0] && userNoteCount_result[0].ct ? userNoteCount_result[0].ct : 0;
            note_cnt = userNoteCount;
            pet_cnt = await Pet.count({
                where: { uid: uid },
            });
            let base_sql = `
                SELECT 
                    DISTINCT nid AS id, pet_id 
                FROM 
                    note_pet 
                WHERE 
                    ${cond}`;
            let sql = `
                SELECT 
                    t1.*,t2.note_time,t2.\`desc\` ,t2.f_ncid,t2.s_ncid 
                FROM 
                    (${base_sql}) AS t1 
                LEFT JOIN 
                    note AS t2 
                ON 
                    t1.id = t2.id`;
            let lists_result = await sequelize_pet.query(sql, {
                type: QueryTypes.SELECT
            });
            lists = lists_result && lists_result.length ? lists_result : [];
            if (lists && lists.length) {
                let list = JSON.parse(JSON.stringify(lists));
                for (let item of list) {
                    item.pet = await Pet.findOne({
                        where: { id: item.pet_id },
                        attributes: ['nick_name', 'gender', 'kc_status', 'cate_id', 'homeday', 'birthday'],
                    });
                }
                lists = list;
            }
            let userInfo = await User.findOne({
                where: { uid: uid },
                attributes: ['uid', 'mini_nick_name', 'phone', 'ip_province'],
            });
            let result = {
                lists: lists,
                user: userInfo || {},
                pet_count: pet_cnt,
                note_count: note_cnt
            }
            let title = [
                '序号',
                '宠物id',
                '宠物名称',
                '宠物品种',
                '性别',
                '是否绝育',
                '记录时年龄(月)',
                '记录类型',
                '详细记录内容',
                '图片/视频链接',
            ];
            let data = [];
            if (result.lists && result.lists.length) {
                let ct = 1;
                let list = result.lists;
                let noteCateIds = [];//存储记录类型id
                for (let item of list) {
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
                for (let item of list) {
                    data.push([
                        ct++,
                        item.pet_id,
                        item.pet && item.pet.nick_name ? item.pet.nick_name : "",
                        item.pet && item.pet.cate_id ? await helpService.getPetCateName(item.pet.cate_id) : "",
                        item.pet ? petMap.PET_GENDER.get(item.pet.gender) : "未知",
                        item.pet ? petMap.PET_KC_STATUS.get(item.pet.kc_status) : "未知",
                        item.pet ? await helpService.getPetAge(item.note_time, item.pet.birthday) : "",
                        await helpService.getNoteCate(noteCateMap, item.f_ncid, item.s_ncid),
                        item.desc,
                        await helpService.getImgByNoteId(item.nid)
                    ])
                }
            }
            // 创建一个新的工作簿  
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');
            //第一行
            worksheet.mergeCells('A1:M1');
            worksheet.getCell('A1').value = result.user.mini_nick_name + ' 用户全部记录内容';
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'center' };
            worksheet.getRow(1).height = 40;
            worksheet.getCell('A1').font = { bold: true, size: 16 };
            //第二行
            worksheet.mergeCells('A2:M2');
            worksheet.getRow(2).height = 120;
            worksheet.getCell('A2').font = { bold: true, size: 16 };
            let secondLine = "";
            if (role_id == 0) {
                secondLine = `
                    用户id：${result.user.uid}
                    用户名称：${result.user.mini_nick_name}
                    手机号：${result.user.phone}
                    地区：${result.user.ip_province}
                    名下宠物数：${result.pet_count}
                    记录总条数：${result.note_count}条`;
            } else {
                secondLine = `
                    用户id：${result.user.uid}
                    用户名称：${result.user.mini_nick_name}
                    地区：${result.user.ip_province}
                    名下宠物数：${result.pet_count}
                    记录总条数：${result.note_count}条`;
            }
            worksheet.getCell('A2').value = secondLine;
            worksheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'center' };
            let titCol = 'A';
            title.forEach((value, index) => {
                worksheet.getCell(titCol + '3').value = value;
                titCol = excelUtils.getNextColumnLetter(titCol); // 增加列索引并获取对应的列字母  
            });
            // 写入数据  
            let row = 4; // 从第4行开始写入数据  
            data.forEach((item) => {
                let column = 1; // 从A列开始  
                item.forEach((value) => {
                    worksheet.getCell(excelUtils.getColumnLetter(column) + row).value = value;
                    column++;
                });
                row++;
            });
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

module.exports = CatStatisticController;
