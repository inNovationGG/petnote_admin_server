/* eslint-disable no-unused-vars */
const {
    sequelize_plan,
    sequelize_plan_log
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const utils = require("../../utils/commonUtil");
const moment = require("moment");
const { GOODS_CATE } = require("../../constants/planMap");
const { formatPagination } = require("../../utils/pagination");

class PlanStatisticService {
    //宠本本plan运营数据统计
    async operationStatistic(param) {
        try {
            let { begin, end, page = 1, pagesize = 10, exportFlag = false } = param;//exportFlag为导出标识，true代表查询所有数据，false代表分页查询
            let singleDayData = [];//存储单日结果
            let allFinishedReportCount = 0;//周期合计完成的报告数量
            let allFinishedBigReportCount = 0;//周期内合计完成的大报告数量
            let date = utils.getDateRange(begin, end);
            const totalLength = date.length;
            const totalPages = Math.ceil(totalLength / pagesize);
            const startIndex = (page - 1) * pagesize;
            if (!exportFlag) {
                date = date.slice(startIndex, startIndex + pagesize);//只处理页内的数据
            }
            for (let i = 0; i < date.length; i++) {
                const beginDateTimeStamp = Math.floor(new Date(date[i]).getTime() / 1000);
                const endDateTimeStamp = Math.floor(new Date(date[i] + " 23:59:59").getTime() / 1000);
                const dateYmd = utils.convertDateStringToNumber(date[i]);//20240601
                const formatDate = moment(date[i], "YYYY-MM-DD").format("YYYY/MM/DD");//"2024/06/01"
                let allUserCount = 0;//当日累计用户：当日累计用户数量
                let allUserCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM 
                        user 
                    WHERE 
                        is_deleted = 0 
                        AND 
                        created <= :date`;
                let allUserCountResults = await sequelize_plan.query(allUserCount_sql, {
                    replacements: { date: endDateTimeStamp },
                    type: QueryTypes.SELECT
                });
                allUserCount = allUserCountResults && allUserCountResults[0] && allUserCountResults[0].cnt ? allUserCountResults[0].cnt : 0;
                let newUserCount = 0;//新增用户：当天的新增用户数量
                let newUserCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM 
                        user 
                    WHERE 
                        is_deleted = 0 
                        AND 
                        created_ymd = :dateYmd`;
                let newUserCountResults = await sequelize_plan.query(newUserCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                newUserCount = newUserCountResults && newUserCountResults[0] && newUserCountResults[0].cnt ? newUserCountResults[0].cnt : 0;
                let userLoginCount = 0;//活跃用户：当日登录用户数量
                let userLoginCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM 
                        user_login_log 
                    WHERE 
                        last_login_ymd = :dateYmd`;
                let userLoginCountResults = await sequelize_plan_log.query(userLoginCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                userLoginCount = userLoginCountResults && userLoginCountResults[0] && userLoginCountResults[0].cnt ? userLoginCountResults[0].cnt : 0;
                let userBeginReportCount = 0;//开始测评：当天进入答题页面的人数
                let userBeginReportCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM 
                        user_report 
                    WHERE 
                        created_ymd = :dateYmd`;
                let userBeginReportCountResults = await sequelize_plan.query(userBeginReportCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                userBeginReportCount = userBeginReportCountResults && userBeginReportCountResults[0] && userBeginReportCountResults[0].cnt ? userBeginReportCountResults[0].cnt : 0;
                //开始测评率：开始测评人数/活跃用户数
                let rateOfBeginReportByLoginUser = userBeginReportCount && userLoginCount ? (userBeginReportCount / userLoginCount * 100).toFixed(2) + "%" : "0.00%";
                let userFinishReportCount = 0;//生成报告人数：当天生成报告的人数
                let userFinishReportCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM 
                        user_report 
                    WHERE 
                        is_finished = 1 
                        AND 
                        created_ymd = :dateYmd`;
                let userFinishReportCountResults = await sequelize_plan.query(userFinishReportCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                userFinishReportCount = userFinishReportCountResults && userFinishReportCountResults[0] && userFinishReportCountResults[0].cnt ? userFinishReportCountResults[0].cnt : 0;
                //报告完成率：生成报告人数/开始测评人数
                let rateOfFinishReportByBeginReport = userFinishReportCount && userBeginReportCount ? (userFinishReportCount / userBeginReportCount * 100).toFixed(2) + "%" : "0.00%";
                //总体报告完成率：生成报告人数/活跃用户
                let rateOfFinishReportByLoginUser = userFinishReportCount && userLoginCount ? (userFinishReportCount / userLoginCount * 100).toFixed(2) + "%" : "0.00%";
                let finishedReportCount = 0;//报告发行数量：当天所有报告的发行数量
                let finishedReportCount_sql = `
                    SELECT 
                        COUNT(*) AS cnt 
                    FROM 
                        user_report 
                    WHERE 
                        is_finished = 1 
                        AND 
                        created_ymd = :dateYmd`;
                let finishedReportCountResults = await sequelize_plan.query(finishedReportCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                finishedReportCount = finishedReportCountResults && finishedReportCountResults[0] && finishedReportCountResults[0].cnt ? finishedReportCountResults[0].cnt : 0;
                let finishedBigReportCount = 0;//大报告数量：当天发行大报告的数量
                let finishedBigReportCount_sql = `
                    SELECT 
                        COUNT(*) AS cnt 
                    FROM 
                        user_report 
                    WHERE 
                        is_finished = 1 
                        AND 
                        type_last = 0 
                        AND 
                        created_ymd = :dateYmd`;
                let finishedBigReportCountResults = await sequelize_plan.query(finishedBigReportCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                finishedBigReportCount = finishedBigReportCountResults && finishedBigReportCountResults[0] && finishedBigReportCountResults[0].cnt ? finishedBigReportCountResults[0].cnt : 0;
                let userWithBigReportCount = 0;//当天开始做大报告的人数
                let userFinishBigReportCount = 0;//当天完成大报告的人数
                let userWithBigReportCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM 
                        user_report 
                    WHERE 
                        type_last = 0 
                        AND 
                        created_ymd = :dateYmd`;
                let userWithBigReportCountResults = await sequelize_plan.query(userWithBigReportCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                userWithBigReportCount = userWithBigReportCountResults && userWithBigReportCountResults[0] && userWithBigReportCountResults[0].cnt ? userWithBigReportCountResults[0].cnt : 0;
                let userFinishBigReportCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM 
                        user_report 
                    WHERE 
                        is_finished = 1 
                        AND 
                        type_last = 0 
                        AND 
                        created_ymd = :dateYmd`;
                let userFinishBigReportCountResults = await sequelize_plan.query(userFinishBigReportCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                userFinishBigReportCount = userFinishBigReportCountResults && userFinishBigReportCountResults[0] && userFinishBigReportCountResults[0].cnt ? userFinishBigReportCountResults[0].cnt : 0;
                //大报告完成率：完成大报告的人数/当天开始做大报告的人数
                let rateOfBeginBigReportByFinishBigReport = userWithBigReportCount && userFinishBigReportCount ? (userFinishBigReportCount / userWithBigReportCount * 100).toFixed(2) + "%" : "0.00%";
                let avgScoreOfBigReport = 0;//大报告平均分：当天生成的大报告的平均分
                let avgScoreOfBigReport_sql = `
                    SELECT 
                        AVG(score) AS avgScore 
                    FROM 
                        user_report_data 
                    WHERE 
                        report_type = 0 
                        AND 
                        created BETWEEN :beginDate AND :endDate`;
                let avgScoreOfBigReportResults = await sequelize_plan.query(avgScoreOfBigReport_sql, {
                    replacements: { beginDate: beginDateTimeStamp, endDate: endDateTimeStamp },
                    type: QueryTypes.SELECT
                });
                avgScoreOfBigReport = avgScoreOfBigReportResults && avgScoreOfBigReportResults[0] && avgScoreOfBigReportResults[0].avgScore ? Number(avgScoreOfBigReportResults[0].avgScore).toFixed(2) : 0;
                singleDayData.push({
                    date: formatDate,
                    allUserCount,
                    newUserCount,
                    userLoginCount,
                    userBeginReportCount,
                    rateOfBeginReportByLoginUser,
                    userFinishReportCount,
                    rateOfFinishReportByBeginReport,
                    rateOfFinishReportByLoginUser,
                    finishedReportCount,
                    finishedBigReportCount,
                    rateOfBeginBigReportByFinishBigReport,
                    avgScoreOfBigReport
                })
            }
            let allDayData = {};//周期合计
            const beginDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            const endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            const beginDateYmd = utils.convertDateStringToNumber(begin);//20240601
            const endDateYmd = utils.convertDateStringToNumber(end);//20240630
            let allUserCount = 0;//周期内累计用户
            let allUserCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user 
                WHERE 
                    is_deleted = 0 
                    AND 
                    created <= :date`;
            let allUserCountResults = await sequelize_plan.query(allUserCount_sql, {
                replacements: { date: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            allUserCount = allUserCountResults && allUserCountResults[0] && allUserCountResults[0].cnt ? allUserCountResults[0].cnt : 0;
            let newUserCount = 0;//周期内新增用户
            let newUserCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user 
                WHERE 
                    is_deleted = 0 
                    AND 
                    created_ymd BETWEEN :start AND :end`;
            let newUserCountResults = await sequelize_plan.query(newUserCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            newUserCount = newUserCountResults && newUserCountResults[0] && newUserCountResults[0].cnt ? newUserCountResults[0].cnt : 0;
            let userLoginCount = 0;//周期内活跃用户
            let userLoginCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user_login_log 
                WHERE 
                    last_login_ymd BETWEEN :start AND :end`;
            let userLoginCountResults = await sequelize_plan_log.query(userLoginCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            userLoginCount = userLoginCountResults && userLoginCountResults[0] && userLoginCountResults[0].cnt ? userLoginCountResults[0].cnt : 0;
            let userBeginReportCount = 0;//开始测评：周期内进入答题页面的人数
            let userBeginReportCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user_report 
                WHERE 
                    created_ymd BETWEEN :start AND :end`;
            let userBeginReportCountResults = await sequelize_plan.query(userBeginReportCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            userBeginReportCount = userBeginReportCountResults && userBeginReportCountResults[0] && userBeginReportCountResults[0].cnt ? userBeginReportCountResults[0].cnt : 0;
            //开始测评率：开始测评人数/活跃用户数
            let rateOfBeginReportByLoginUser = userBeginReportCount && userLoginCount ? (userBeginReportCount / userLoginCount * 100).toFixed(2) + "%" : "0.00%";
            let userFinishReportCount = 0;//生成报告人数：周期内生成报告的人数
            let userFinishReportCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user_report 
                WHERE 
                    is_finished = 1 
                    AND 
                    created_ymd BETWEEN :start AND :end`;
            let userFinishReportCountResults = await sequelize_plan.query(userFinishReportCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            userFinishReportCount = userFinishReportCountResults && userFinishReportCountResults[0] && userFinishReportCountResults[0].cnt ? userFinishReportCountResults[0].cnt : 0;
            //报告完成率：生成报告人数/开始测评人数
            let rateOfFinishReportByBeginReport = userFinishReportCount && userBeginReportCount ? (userFinishReportCount / userBeginReportCount * 100).toFixed(2) + "%" : "0.00%";
            //总体报告完成率：生成报告人数/活跃用户
            let rateOfFinishReportByLoginUser = userFinishReportCount && userLoginCount ? (userFinishReportCount / userLoginCount * 100).toFixed(2) + "%" : "0.00%";
            let allFinishedReportCount_sql = `
                SELECT 
                    COUNT(*) AS cnt 
                FROM 
                    user_report 
                WHERE 
                    is_finished = 1 
                    AND 
                    created_ymd BETWEEN :start AND :end`;
            let allFinishedReportCountResults = await sequelize_plan.query(allFinishedReportCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            allFinishedReportCount = allFinishedReportCountResults && allFinishedReportCountResults[0] && allFinishedReportCountResults[0].cnt ? allFinishedReportCountResults[0].cnt : 0;
            let allFinishedBigReportCount_sql = `
                SELECT 
                    COUNT(*) AS cnt 
                FROM 
                    user_report 
                WHERE 
                    is_finished = 1 
                    AND 
                    type_last = 0 
                    AND 
                    created_ymd BETWEEN :start AND :end`;
            let allFinishedBigReportCountResults = await sequelize_plan.query(allFinishedBigReportCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            allFinishedBigReportCount = allFinishedBigReportCountResults && allFinishedBigReportCountResults[0] && allFinishedBigReportCountResults[0].cnt ? allFinishedBigReportCountResults[0].cnt : 0;
            let userWithBigReportCount = 0;//周期内开始做大报告的人数
            let userFinishBigReportCount = 0;//周期内完成大报告的人数
            let userWithBigReportCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user_report 
                WHERE 
                    type_last = 0 
                    AND 
                    created_ymd BETWEEN :start AND :end`;
            let userWithBigReportCountResults = await sequelize_plan.query(userWithBigReportCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            userWithBigReportCount = userWithBigReportCountResults && userWithBigReportCountResults[0] && userWithBigReportCountResults[0].cnt ? userWithBigReportCountResults[0].cnt : 0;
            let userFinishBigReportCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt  
                FROM 
                    user_report 
                WHERE  
                    is_finished = 1 
                    AND 
                    type_last = 0 
                    AND 
                    created_ymd BETWEEN :start AND :end`;
            let userFinishBigReportCountResults = await sequelize_plan.query(userFinishBigReportCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            userFinishBigReportCount = userFinishBigReportCountResults && userFinishBigReportCountResults[0] && userFinishBigReportCountResults[0].cnt ? userFinishBigReportCountResults[0].cnt : 0;
            //大报告完成率：完成大报告的人数/当天开始做大报告的人数
            let rateOfBeginBigReportByFinishBigReport = userWithBigReportCount && userFinishBigReportCount ? (userFinishBigReportCount / userWithBigReportCount * 100).toFixed(2) + "%" : "0.00%";
            let avgScoreOfBigReport = 0;//大报告平均分：周期内生成的大报告的平均分
            let avgScoreOfBigReport_sql = `
                SELECT 
                    AVG(score) AS avgScore 
                FROM 
                    user_report_data 
                WHERE 
                    report_type = 0 
                    AND 
                    created BETWEEN :beginDate AND :endDate`;
            let avgScoreOfBigReportResults = await sequelize_plan.query(avgScoreOfBigReport_sql, {
                replacements: { beginDate: beginDateTimeStamp, endDate: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            avgScoreOfBigReport = avgScoreOfBigReportResults && avgScoreOfBigReportResults[0] && avgScoreOfBigReportResults[0].avgScore ? Number(avgScoreOfBigReportResults[0].avgScore).toFixed(2) : 0;
            allDayData = {
                allUserCount: allUserCount,
                newUserCount: newUserCount,
                userLoginCount: userLoginCount,
                userBeginReportCount: userBeginReportCount,
                rateOfBeginReportByLoginUser: rateOfBeginReportByLoginUser,
                userFinishReportCount: userFinishReportCount,
                rateOfFinishReportByBeginReport: rateOfFinishReportByBeginReport,
                rateOfFinishReportByLoginUser: rateOfFinishReportByLoginUser,
                finishedReportCount: allFinishedReportCount,
                finishedBigReportCount: allFinishedBigReportCount,
                rateOfBeginBigReportByFinishBigReport: rateOfBeginBigReportByFinishBigReport,
                avgScoreOfBigReport: avgScoreOfBigReport
            }
            return {
                success: true,
                data: {
                    singleDayData: singleDayData,//单日数据集合
                    allDayData: allDayData,//周期合计
                    ...formatPagination({ total: totalLength, page: page, limit: pagesize, pages: totalPages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan答题退出情况数据统计
    async subjectExistStatistic(param) {
        try {
            let { begin, end, page = 1, pagesize = 10, exportFlag = false } = param;//exportFlag为导出标识，true代表查询所有数据，false代表分页查询
            const beginDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            const endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            let results = [];//存储返回结果
            let subjectIds = [];//题目ID集合
            let subjectMap = new Map();//key:题目id,value:题目名称
            let subject_sql = `
                SELECT 
                    id, title 
                FROM 
                    subject 
                WHERE 
                    is_deleted = 0 
                ORDER BY 
                    id`;
            let subjectResults = await sequelize_plan.query(subject_sql, {
                type: QueryTypes.SELECT
            });
            if (subjectResults && subjectResults.length) {
                for (let item of subjectResults) {
                    let { id, title } = item;
                    let formatTitle = utils.stripHtmlTags(title);//处理title中的HTML标签
                    subjectIds.push(id);
                    subjectMap.set(id, formatTitle);
                }
            }
            let totalExistCount = 0;//大报告的总退出答题人数
            let totalExistCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user_report 
                WHERE 
                    created BETWEEN :begin AND :end 
                    AND 
                    is_finished = 0 
                    AND 
                    type_last = 0`;
            let totalExistCountResults = await sequelize_plan.query(totalExistCount_sql, {
                replacements: { begin: beginDateTimeStamp, end: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            totalExistCount = totalExistCountResults && totalExistCountResults[0] && totalExistCountResults[0].cnt ? totalExistCountResults[0].cnt : 0;
            let subjectExistMap = new Map();//key:题目ID,value:在该题目退出答题的人数
            let subjectExist_sql = `
                SELECT 
                    subject_step, COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user_report 
                WHERE 
                    created BETWEEN :beginOne AND :endOne 
                    AND 
                    is_finished = 0 
                    AND 
                    type_last = 0 
                    AND 
                    uid IN 
                        (
                            SELECT 
                                uid 
                            FROM 
                                user_report 
                            WHERE 
                                created BETWEEN :beginTwo AND :endTwo 
                                AND 
                                type_last = 0 
                            GROUP BY 
                                uid 
                            HAVING 
                                SUM(is_finished) = 0
                        ) 
                    AND 
                    subject_step IN 
                        (
                            SELECT 
                                id 
                            FROM 
                                subject 
                            WHERE 
                                is_deleted = 0 
                        ) 
                GROUP BY 
                    subject_step`;
            let subjectExistResults = await sequelize_plan.query(subjectExist_sql, {
                replacements: {
                    beginOne: beginDateTimeStamp,
                    endOne: endDateTimeStamp,
                    beginTwo: beginDateTimeStamp,
                    endTwo: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            if (subjectExistResults && subjectExistResults.length) {
                for (let item of subjectExistResults) {
                    let { subject_step, cnt } = item;
                    subjectExistMap.set(subject_step, cnt);
                }
            }
            for (let id of subjectIds) {
                let existCount = subjectExistMap.get(id) || 0;
                let subjectTitle = subjectMap.get(id) || "";
                let rateOfExistCountByAllExistCount = "0.00%"
                if (existCount && totalExistCount) {
                    rateOfExistCountByAllExistCount = (existCount / totalExistCount * 100).toFixed(2) + "%"
                }
                results.push({
                    subjectId: id,
                    subjectTitle: subjectTitle,
                    existCount: existCount,
                    rateOfExistCountByAllExistCount: rateOfExistCountByAllExistCount
                })
            }
            if (exportFlag) {//导出全部
                return {
                    success: true,
                    data: results
                }
            } else {//分页查询
                const totalLength = results.length;
                const totalPages = Math.ceil(totalLength / pagesize);
                const startIndex = (page - 1) * pagesize;
                results = results.slice(startIndex, startIndex + pagesize);//只返回页内的数据
                return {
                    success: true,
                    data: {
                        data: results,
                        ...formatPagination({ total: totalLength, page: page, limit: pagesize, pages: totalPages })
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan答题具体数据
    async reportDetail(param) {
        try {
            let { begin, end, page = 1, pagesize = 10, exportFlag = false } = param;//exportFlag为导出标识，true代表查询所有数据，false代表分页查询
            const beginDateYmd = utils.convertDateStringToNumber(begin);//20240601
            const endDateYmd = utils.convertDateStringToNumber(end);//20240630
            let results = [];//存储返回结果
            let report_sql = `
                SELECT 
                    report_id, created_at, uid, pet_id, score 
                FROM 
                    user_report_data 
                WHERE 
                    report_id IN 
                        (
                            SELECT 
                                id 
                            FROM 
                                user_report 
                            WHERE 
                                created_ymd BETWEEN :begin AND :end 
                                AND 
                                is_finished = 1 
                                AND 
                                type_last = 0
                        )
                ORDER BY 
                    report_id DESC`;
            let reportResults = await sequelize_plan.query(report_sql, {
                replacements: { begin: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            if (reportResults && reportResults.length) {
                for (let item of reportResults) {
                    let { report_id, created_at, uid, pet_id, score } = item;
                    results.push({
                        reportId: report_id,
                        createTime: moment(created_at).format("YYYY/MM/DD HH:mm"),
                        userId: uid,
                        petId: pet_id,
                        score: score
                    })
                }
            }
            if (exportFlag) {//导出全部
                return {
                    success: true,
                    data: results
                }
            } else {//分页查询
                const totalLength = results.length;
                const totalPages = Math.ceil(totalLength / pagesize);
                const startIndex = (page - 1) * pagesize;
                results = results.slice(startIndex, startIndex + pagesize);//只返回页内的数据
                return {
                    success: true,
                    data: {
                        data: results,
                        ...formatPagination({ total: totalLength, page: page, limit: pagesize, pages: totalPages })
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan饮食数据统计
    async eatDetail(param) {
        try {
            let { begin, end, page = 1, pagesize = 10, exportFlag = false } = param;//exportFlag为导出标识，true代表查询所有数据，false代表分页查询
            const beginDateYmd = utils.convertDateStringToNumber(begin);//20240601
            const endDateYmd = utils.convertDateStringToNumber(end);//20240630
            let results = [];//存储最终返回结果
            let report_sql = `
                SELECT 
                    report_id, created_at, uid, pet_id 
                FROM 
                    user_report_data 
                WHERE 
                    report_id IN 
                        (
                            SELECT 
                                id 
                            FROM 
                                user_report 
                            WHERE 
                                created_ymd BETWEEN :begin AND :end 
                                AND 
                                is_finished = 1 
                                AND 
                                type_last = 0
                        )
                ORDER BY 
                    report_id DESC`;
            let reportResults = await sequelize_plan.query(report_sql, {
                replacements: { begin: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            let reportList = [];//存储报告基本数据（报告ID、生成报告时间、用户ID、猫咪ID）
            if (reportResults && reportResults.length) {
                for (let item of reportResults) {
                    let { report_id, created_at, uid, pet_id } = item;
                    reportList.push({
                        reportId: report_id,
                        createTime: moment(created_at).format("YYYY/MM/DD HH:mm"),
                        userId: uid,
                        petId: pet_id
                    })
                }
            }
            let userSubjectItem_sql = `
                SELECT 
                    report_id, item_val 
                FROM 
                    user_subject_item 
                WHERE 
                    sid = 13 
                    AND 
                    report_id IN 
                        (
                            SELECT 
                                id 
                            FROM 
                                user_report 
                            WHERE 
                                created_ymd BETWEEN :begin AND :end 
                                AND 
                                is_finished = 1 
                                AND 
                                type_last = 0
                        )
                ORDER BY 
                    report_id DESC`;
            let userSubjectItemResults = await sequelize_plan.query(userSubjectItem_sql, {
                replacements: { begin: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            let reportItemMap = new Map();//key:报告ID-number，value:饮食结构答案-array
            if (userSubjectItemResults && userSubjectItemResults.length) {
                for (let item of userSubjectItemResults) {
                    let { report_id, item_val } = item;
                    reportItemMap.set(report_id, JSON.parse(item_val));
                }
            }
            //查询商品信息
            let goods_sql = `
                SELECT 
                    id, cate_id 
                FROM 
                    goods`;
            let goodsResults = await sequelize_plan.query(goods_sql, {
                type: QueryTypes.SELECT
            });
            let goodsMap = new Map();//key:商品ID，value:商品品类
            if (goodsResults && goodsResults.length) {
                for (let item of goodsResults) {
                    let { id, cate_id } = item;
                    goodsMap.set(id, GOODS_CATE.get(cate_id) || "");
                }
            }
            //查询品牌信息
            let brand_sql = `
                SELECT 
                    id, name 
                FROM 
                    brand`;
            let brandResults = await sequelize_plan.query(brand_sql, {
                type: QueryTypes.SELECT
            });
            let brandMap = new Map();//key:品牌ID，value:品牌名称
            if (brandResults && brandResults.length) {
                for (let item of brandResults) {
                    let { id, name } = item;
                    brandMap.set(id, name);
                }
            }
            for (let i = 0; i < reportList.length; i++) {
                let { reportId, createTime, userId, petId } = reportList[i];
                let foodList = reportItemMap.get(reportId) || [];
                if (!foodList.length) {
                    results.push({
                        reportId: reportId,
                        createTime: createTime,
                        userId: userId,
                        petId: petId,
                        goodsCate: "",
                        goodsBrand: "",
                        skuId: "",
                        goodsName: "",
                        eatNum: ""
                    });
                    continue;
                }
                for (let j = 0; j < foodList.length; j++) {
                    let { brand_id, id, income, name } = foodList[j];
                    results.push({
                        reportId: reportId,
                        createTime: createTime,
                        userId: userId,
                        petId: petId,
                        goodsCate: goodsMap.get(id) || "",
                        goodsBrand: brandMap.get(brand_id) || "",
                        skuId: id,
                        goodsName: name,
                        eatNum: income
                    })
                }
            }
            if (exportFlag) {//导出全部
                return {
                    success: true,
                    data: results
                }
            } else {//分页查询
                const totalLength = results.length;
                const totalPages = Math.ceil(totalLength / pagesize);
                const startIndex = (page - 1) * pagesize;
                results = results.slice(startIndex, startIndex + pagesize);//只返回页内的数据
                return {
                    success: true,
                    data: {
                        data: results,
                        ...formatPagination({ total: totalLength, page: page, limit: pagesize, pages: totalPages })
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new PlanStatisticService();
