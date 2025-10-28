/* eslint-disable no-unused-vars */
const {
    sequelize_plan
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const utils = require("../../utils/commonUtil");
const excelUtils = require("../../utils/excelUtil");
const _ = require('lodash');
const moment = require("moment");
const planStatisticService = require("../../services/newbi/planStatistic");

class PlanStatisticController {
    //宠本本plan运营数据统计
    async operationStatistic(ctx) {
        try {
            let { begin, end, page = 1, pagesize = 10 } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, page: Number(page), pagesize: Number(pagesize) }
            let result = await planStatisticService.operationStatistic(param);
            ctx.body = result;
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan运营数据统计-导出
    async operationStatisticExport(ctx) {
        try {
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, exportFlag: true }
            let result = await planStatisticService.operationStatistic(param);
            if (!result || !result.success) {
                return ctx.body = { success: false, msg: "导出失败" }
            }
            let { data } = result;
            let singleDayData = data.singleDayData;
            let allDayData = data.allDayData;
            allDayData.date = "周期合计";
            singleDayData.unshift(allDayData);
            let columns = [
                { header: '日期', key: 'date' },
                { header: '当日累计用户', key: 'allUserCount' },
                { header: '新增用户', key: 'newUserCount' },
                { header: '活跃用户', key: 'userLoginCount' },
                { header: '开始测评', key: 'userBeginReportCount' },
                { header: '开始测评率', key: 'rateOfBeginReportByLoginUser' },
                { header: '生成报告人数', key: 'userFinishReportCount' },
                { header: '报告完成率', key: 'rateOfFinishReportByBeginReport' },
                { header: '总体报告完成率', key: 'rateOfFinishReportByLoginUser' },
                { header: '报告发行数量', key: 'finishedReportCount' },
                { header: '大报告数量', key: 'finishedBigReportCount' },
                { header: '大报告完成率', key: 'rateOfBeginBigReportByFinishBigReport' },
                { header: '大报告平均分', key: 'avgScoreOfBigReport' }
            ];
            if (!Array.isArray(singleDayData) || !singleDayData.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(singleDayData, columns, "宠本本plan运营数据");
            ctx.set(headers);
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan答题退出情况数据统计
    async subjectExistStatistic(ctx) {
        try {
            let { begin, end, page = 1, pagesize = 10 } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, page: Number(page), pagesize: Number(pagesize) }
            let result = await planStatisticService.subjectExistStatistic(param);
            ctx.body = result;
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan答题退出情况数据统计-导出
    async subjectExistStatisticExport(ctx) {
        try {
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, exportFlag: true }
            let result = await planStatisticService.subjectExistStatistic(param);
            if (!result || !result.success) {
                return ctx.body = { success: false, msg: "导出失败" }
            }
            let { data } = result;
            let columns = [
                { header: '题目ID', key: 'subjectId' },
                { header: '题目', key: 'subjectTitle' },
                { header: '在该题目退出答题人数', key: 'existCount' },
                { header: '该题目退出率', key: 'rateOfExistCountByAllExistCount' },
            ];
            if (!Array.isArray(data) || !data.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(data, columns, "宠本本plan答题退出情况数据");
            ctx.set(headers);
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan答题具体数据
    async reportDetail(ctx) {
        try {
            let { begin, end, page = 1, pagesize = 10 } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, page: Number(page), pagesize: Number(pagesize) }
            let result = await planStatisticService.reportDetail(param);
            ctx.body = result;
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan答题具体数据-导出
    async reportDetailExport(ctx) {
        try {
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            const beginDateYmd = utils.convertDateStringToNumber(begin);//20240601
            const endDateYmd = utils.convertDateStringToNumber(end);//20240630
            let results = [];//存储返回结果
            //查询已完成的大报告的创建时间、用户uid、宠物id和报告分数
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
            let subjectIds = [];//题目ID集合
            let subjectMap = new Map();//key:题目id,value:题目名称
            //查询未删除的题目id和题目名称
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
            //查询已完成的大报告的每道题目的答案（）
            let subjectItem_sql = `
                SELECT 
                    b.report_id AS reportId, 
                    b.sid AS sid, 
                    b.item_val AS value 
                FROM 
                    subject a 
                LEFT JOIN 
                    user_subject_item b 
                ON 
                    a.id = b.sid 
                WHERE 
                    a.is_deleted = 0 
                    AND 
                    b.report_id IN 
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
                    b.report_id DESC, b.sid ASC`;
            let subjectItemResults = await sequelize_plan.query(subjectItem_sql, {
                replacements: { begin: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            let cloneResults = JSON.parse(JSON.stringify(results));
            if (subjectItemResults && subjectItemResults.length) {
                for (let i = 0; i < cloneResults.length; i++) {
                    let resultReportId = cloneResults[i].reportId;
                    for (let item of subjectItemResults) {
                        let { reportId, sid, value } = item;
                        if (resultReportId == reportId) {
                            //多选题可能有多个答案，用逗号分隔
                            if (!cloneResults[i].hasOwnProperty(sid)) {
                                cloneResults[i][sid] = value;
                            } else {
                                let _value = cloneResults[i][sid];
                                cloneResults[i][sid] += _value + ",";
                            }
                            //第三题，宠物的品种，有两条数据，第一条是宠物品种id，第二条是宠物品种名称
                            //第十三题，宠物饮食数据，解析流程具体可参考宠物饮食数据统计
                        }
                    }
                }
            }
            let columns = [
                { header: '报告ID', key: 'reportId' },
                { header: '生成报告时间', key: 'createTime' },
                { header: '用户ID', key: 'userId' },
                { header: '猫咪ID', key: 'petId' },
                { header: '报告总分', key: 'score' }
            ];
            for (let sid of subjectIds) {
                columns.push({
                    header: subjectMap.get(sid),
                    key: sid
                })
            }
            if (!Array.isArray(cloneResults) || !cloneResults.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(cloneResults, columns, "宠本本plan答题具体数据");
            ctx.set(headers);
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan饮食数据统计
    async eatDetail(ctx) {
        try {
            let { begin, end, page = 1, pagesize = 10 } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, page: Number(page), pagesize: Number(pagesize) }
            let result = await planStatisticService.eatDetail(param);
            ctx.body = result;
        } catch (error) {
            console.log(error);
        }
    }
    //宠本本plan饮食数据统计-导出
    async eatDetailExport(ctx) {
        try {
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, exportFlag: true }
            let result = await planStatisticService.eatDetail(param);
            if (!result || !result.success) {
                return ctx.body = { success: false, msg: "导出失败" }
            }
            let { data } = result;
            let columns = [
                { header: '报告ID', key: 'reportId' },
                { header: '生成报告时间', key: 'createTime' },
                { header: '用户ID', key: 'userId' },
                { header: '猫咪ID', key: 'petId' },
                { header: '食物品类', key: 'goodsCate' },
                { header: '食物品牌', key: 'goodsBrand' },
                { header: 'SKUID', key: 'skuId' },
                { header: '食物名称', key: 'goodsName' },
                { header: '摄入克重', key: 'eatNum' },
            ];
            if (!Array.isArray(data) || !data.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" };
            }
            const { buffer, headers } = await excelUtils.exportExcel(data, columns, "宠本本plan饮食数据");
            ctx.set(headers);
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }

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
}

module.exports = PlanStatisticController
