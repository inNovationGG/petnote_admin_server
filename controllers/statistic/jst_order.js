/* eslint-disable no-unused-vars */
const { Banner, PetAdminUser } = require("../../models");
const { Op } = require("sequelize");
const _ = require('lodash');
const moment = require("moment");
const {
    addMtPhone,
    mtOrderStatistic, //美团订单统计
    mtOrderSaleStatistic, //美团订单销售额统计
    jdOrderStatistic, //京东订单统计
    jdOrderSaleStatistic, //京东订单销售额统计
    yzOrderSaleStatistic, //有赞订单销售额统计
    mtOrderDetailStatistic, //美团复购订单明细
    jtOrderDetailStatistic, //京东复购订单明细
} = require("../../services/jst_order/jst_order_statistic");
const excelUtils = require("../../utils/excelUtil");
const ExcelJS = require("exceljs");

class JstOrderStatisticController {
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

    async addMtPhoneField(ctx) {
        try {
            await addMtPhone();
        } catch (error) {
            console.log(error);
        }
    }

    // 查询美团的订单数据
    async getMtOrderCount(ctx) {
        try {
            let { startDate, endDate } = ctx.request.body || {};
            let { list, dateRange } = await jdOrderStatistic(startDate, endDate);
            console.log('1111111111111111111111111111111111', list);
            return ctx.body = {
                success: true,
                data: {
                    list: list,
                    dateRange: dateRange
                }
            }
            let columns = [
                { header: '日期', key: 'date' },
            ];
            for (const item of dateRange) {
                columns.push({
                    header: item,
                    key: item
                });
            }
            for (let i = 0; i < list.length; i++) {
                list[i].date = dateRange[i];
            }
            if (!list.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(list, columns, "美团新用户订单数统计");
            ctx.set(headers);
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }

    //查询美团每月新用户复购订单明细
    async getMtOrderDetail(ctx) {
        try {
            let { startDate, endDate } = ctx.request.body || {};
            let { list, dateRange } = await jtOrderDetailStatistic(startDate, endDate);
            let columns = [
                { header: '日期', key: 'created' },
                { header: '订单ID', key: 'so_id' },
                { header: '手机号', key: 'receiver_mobile' },
                // { header: '手机号', key: 'mt_phone' },
                // { header: '省', key: 'receiver_state' },
                // { header: '市', key: 'receiver_city' },
                // { header: '区', key: 'receiver_district' },
                { header: '订单金额', key: 'paid_amount' },
                { header: '商品ID', key: 'sku_id' },
                { header: '商品名称', key: 'name' },
                { header: '商品件数', key: 'qty' }
            ];
            if (!list.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const workbook = new ExcelJS.Workbook();
            for (let i = 0; i < dateRange.length; i++) {
                const worksheet = workbook.addWorksheet(`${dateRange[i]}新用户`);
                worksheet.columns = columns.map(col => ({
                    header: col.header,
                    key: col.key,
                }));
                list[i].forEach(row => {
                    worksheet.addRow(row);
                });
            }
            const buffer = await workbook.xlsx.writeBuffer();
            ctx.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=${encodeURIComponent('美团新用户复购订单明细')}`
            });
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = JstOrderStatisticController
