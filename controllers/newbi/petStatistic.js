/* eslint-disable no-unused-vars */
const excelUtils = require("../../utils/excelUtil");
const petStatisticService = require("../../services/newbi/petStatistic");

class PetStatisticController {
    //宠本本运营数据
    async operationStatistic(ctx) {
        try {
            let { begin, end, page = 1, pagesize = 10 } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, page: Number(page), pagesize: Number(pagesize) }
            let result = await petStatisticService.operationStatistic(param);
            ctx.body = result;
        } catch (error) {
            console.log(error);
        }
    }

    //宠本本运营数据-导出
    async operationStatisticExport(ctx) {
        try {
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, exportFlag: true }
            let result = await petStatisticService.operationStatistic(param);
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
                { header: '总活跃用户', key: 'userLoginCount' },
                { header: '新增用户活跃人数', key: 'newUserCount' },
                { header: '老用户活跃人数', key: 'oldUserCount' },
                { header: '新增用户首次建档数', key: 'newUserWithPet' },
                { header: '新增用户次日留存率', key: 'rateOfnewUserAlive' },
                { header: '新增建档数', key: 'newPetCount' },
                { header: '记录用户人数', key: 'userWithNoteCount' },
                { header: '新建记录率', key: 'rateOfUserWithNoteByUserLogin' },
                { header: '记录条数', key: 'noteCount' }
            ];
            if (!Array.isArray(singleDayData) || !singleDayData.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(singleDayData, columns, "宠本本运营数据");
            ctx.set(headers);
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }

    //宠本本用户留存
    async userAlive(ctx) {
        try {
            let { begin, end, page = 1, pagesize = 10 } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, page: Number(page), pagesize: Number(pagesize) }
            let result = await petStatisticService.userAlive(param);
            ctx.body = result;
        } catch (error) {
            console.log(error);
        }
    }

    //宠本本用户留存-导出
    async userAliveExport(ctx) {
        try {
            let { begin, end } = ctx.request.body || {};
            if (!begin || !end) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            let param = { begin, end, exportFlag: true }
            let result = await petStatisticService.userAlive(param);
            if (!result || !result.success) {
                return ctx.body = { success: false, msg: "导出失败" }
            }
            let { data } = result;
            let columns = [
                { header: '日期', key: 'date' },
                { header: '当月新注册用户人数', key: 'newUserCount' },
                { header: '当月活跃老用户人数', key: 'oldUserCount' },
                { header: '+1月留存新用户人数', key: 'newUserAliveAfterOneMonth' },
                { header: '+1月留存老用户人数', key: 'oldUserAliveAfterOneMonth' },
                { header: '+2月留存新用户人数', key: 'newUserAliveAfterTwoMonth' },
                { header: '+2月留存老用户人数', key: 'oldUserAliveAfterTwoMonth' },
                { header: '+3月留存新用户人数', key: 'newUserAliveAfterThreeMonth' },
                { header: '+3月留存老用户人数', key: 'oldUserAliveAfterThreeMonth' },
                { header: '+4月留存新用户人数', key: 'newUserAliveAfterFourMonth' },
                { header: '+4月留存老用户人数', key: 'oldUserAliveAfterFourMonth' },
                { header: '+5月留存新用户人数', key: 'newUserAliveAfterFiveMonth' },
                { header: '+5月留存老用户人数', key: 'oldUserAliveAfterFiveMonth' },
                { header: '+6月留存新用户人数', key: 'newUserAliveAfterSixMonth' },
                { header: '+6月留存老用户人数', key: 'oldUserAliveAfterSixMonth' },
                { header: '+7月留存新用户人数', key: 'newUserAliveAfterSevenMonth' },
                { header: '+7月留存老用户人数', key: 'oldUserAliveAfterSevenMonth' },
                { header: '+8月留存新用户人数', key: 'newUserAliveAfterEightMonth' },
                { header: '+8月留存老用户人数', key: 'oldUserAliveAfterEightMonth' },
                { header: '+9月留存新用户人数', key: 'newUserAliveAfterNineMonth' },
                { header: '+9月留存老用户人数', key: 'oldUserAliveAfterNineMonth' },
                { header: '+10月留存新用户人数', key: 'newUserAliveAfterTenMonth' },
                { header: '+10月留存老用户人数', key: 'oldUserAliveAfterTenMonth' },
                { header: '+11月留存新用户人数', key: 'newUserAliveAfterElevenMonth' },
                { header: '+11月留存老用户人数', key: 'oldUserAliveAfterElevenMonth' },
                { header: '+12月留存新用户人数', key: 'newUserAliveAfterTwelveMonth' },
                { header: '+12月留存老用户人数', key: 'oldUserAliveAfterTwelveMonth' },
            ];
            if (!Array.isArray(data) || !data.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(data, columns, "宠本本用户留存数据");
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

module.exports = PetStatisticController
