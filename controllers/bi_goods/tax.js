/* eslint-disable no-unused-vars */
const { Tax } = require("../../models");
const ExcelJS = require("exceljs");
const fs = require('fs').promises;

class TaxController {
    // 上传含税成本数据Excel并存入shop_tk库中的tax表
    async uploadtax(ctx) {
        try {
            const file = ctx.request.files.file; // 假设表单中的文件字段名为 file  
            if (!file) {
                ctx.status = 400;
                ctx.body = { success: false, data: 'No file uploaded.' };
                return;
            }
            // 读取Excel文件  
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(file.filepath);
            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
                throw new Error('No worksheet found in the workbook');
            }
            // 创建一个映射，用于存储列名到索引的对应关系
            const headerMap = {};
            worksheet.getRow(1).eachCell({ includeEmpty: true }, function (cell, colNumber) {
                let text = '';
                if (cell.text && cell.text.richText) {
                    // 遍历 richText 数组以获取完整的文本
                    cell.text.richText.forEach(richTextElement => {
                        text += richTextElement.text;
                    });
                } else {
                    // 如果不是富文本，则直接使用 cell.text  
                    text = cell.text;
                }
                if (!headerMap[text]) {
                    headerMap[text] = colNumber;
                }
            });
            let data = [];
            // 遍历工作表的每一行（从第二行开始，假设第一行是标题行）  
            worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
                const order_id = headerMap['订单号'] ? (row.getCell(headerMap['订单号'])?.text || '') : '';
                const platform_order_id = headerMap['平台订单号'] ? (row.getCell(headerMap['平台订单号'])?.text || '') : '';
                const customer_id = headerMap['客户编码'] ? (row.getCell(headerMap['客户编码'])?.text || '') : '';
                const customer_name = headerMap['客户'] ? (row.getCell(headerMap['客户'])?.text || '') : '';
                const store_id = headerMap['前置仓编码'] ? (row.getCell(headerMap['前置仓编码'])?.text || '') : '';
                const store_name = headerMap['前置仓名称'] ? (row.getCell(headerMap['前置仓名称'])?.text || '') : '';
                const company_id = headerMap['归属公司编码'] ? (row.getCell(headerMap['归属公司编码'])?.text || '') : '';
                const company_name = headerMap['归属公司'] ? (row.getCell(headerMap['归属公司'])?.text || '') : '';
                const order_createtime = headerMap['订单日期'] ? (row.getCell(headerMap['订单日期'])?.text || '') : '';
                const goods_id = headerMap['存货编码'] ? (row.getCell(headerMap['存货编码'])?.text || '') : '';
                const goods_name = headerMap['存货名称'] ? (row.getCell(headerMap['存货名称'])?.text || '') : '';
                const goods_count = headerMap['数量'] ? (row.getCell(headerMap['数量'])?.text || '') : '';
                const goods_price = headerMap['单价'] ? (row.getCell(headerMap['单价'])?.text || '') : '';
                const total_price_with_tax = headerMap['价税合计'] ? (row.getCell(headerMap['价税合计'])?.text || '') : '';
                const audit_output_count = headerMap['出库审核数量'] ? (row.getCell(headerMap['出库审核数量'])?.text || '') : '';
                const bill_price = headerMap['结算金额'] ? (row.getCell(headerMap['结算金额'])?.text || '') : '';
                const single_price = headerMap['分摊单价'] ? (row.getCell(headerMap['分摊单价'])?.text || '') : '';
                const total_price = headerMap['分摊金额'] ? (row.getCell(headerMap['分摊金额'])?.text || '') : '';
                const is_check = headerMap['对账状态'] ? (row.getCell(headerMap['对账状态'])?.text || '') : '';
                const single_cost = headerMap['成本单价'] ? (row.getCell(headerMap['成本单价'])?.text || '') : '';
                const total_cost = headerMap['成本金额'] ? (row.getCell(headerMap['成本金额'])?.text || '') : '';
                const is_return = headerMap['是否退货'] ? (row.getCell(headerMap['是否退货'])?.text || '') : '';
                const main_id = headerMap['主表ID'] ? (row.getCell(headerMap['主表ID'])?.text || '') : '';
                const detail_id = headerMap['明细ID'] ? (row.getCell(headerMap['明细ID'])?.text || '') : '';
                const bill_real_price = headerMap['实际结算金额'] ? (row.getCell(headerMap['实际结算金额'])?.text || '') : '';
                const order_real_createtime = headerMap['原单日期'] ? (row.getCell(headerMap['原单日期'])?.text || '') : '';
                const tax_percent = headerMap['税率'] ? (row.getCell(headerMap['税率'])?.text || '') : '';
                const city = headerMap['城市'] ? (row.getCell(headerMap['城市'])?.text || '') : '';
                const channel = headerMap['渠道'] ? (row.getCell(headerMap['渠道'])?.text || '') : '';
                const goods_cate_id = headerMap['分类编码'] ? (row.getCell(headerMap['分类编码'])?.text || '') : '';
                const goods_cate_name = headerMap['分类名称'] ? (row.getCell(headerMap['分类名称'])?.text || '') : '';
                const cost_with_tax = headerMap['含税成本'] ? (row.getCell(headerMap['含税成本'])?.text || '') : '';
                const total_cost_with_tax = headerMap['含税成本金额'] ? (row.getCell(headerMap['含税成本金额'])?.text || '') : '';
                const workflow_id = headerMap['业务流程编码'] ? (row.getCell(headerMap['业务流程编码'])?.text || '') : '';
                const workflow_name = headerMap['业务流程名称'] ? (row.getCell(headerMap['业务流程名称'])?.text || '') : '';
                const mainbody_id = headerMap['主体编码'] ? (row.getCell(headerMap['主体编码'])?.text || '') : '';
                const mainbody_name = headerMap['主体名称'] ? (row.getCell(headerMap['主体名称'])?.text || '') : '';
                const brand = headerMap['品牌'] ? (row.getCell(headerMap['品牌'])?.text || '') : '';
                const f_cate_id = headerMap['一级分类编码'] ? (row.getCell(headerMap['一级分类编码'])?.text || '') : '';
                const f_cate_name = headerMap['一级分类名称'] ? (row.getCell(headerMap['一级分类名称'])?.text || '') : '';
                const s_cate_id = headerMap['二级分类编码'] ? (row.getCell(headerMap['二级分类编码'])?.text || '') : '';
                const s_cate_name = headerMap['二级分类名称'] ? (row.getCell(headerMap['二级分类名称'])?.text || '') : '';
                const t_cate_id = headerMap['三级分类编码'] ? (row.getCell(headerMap['三级分类编码'])?.text || '') : '';
                const t_cate_name = headerMap['三级分类名称'] ? (row.getCell(headerMap['三级分类名称'])?.text || '') : '';
                if (order_id && rowNumber > 1) { //过滤标题行和无效行
                    data.push({
                        order_id,
                        platform_order_id,
                        customer_id,
                        customer_name,
                        store_id,
                        store_name,
                        company_id,
                        company_name,
                        order_createtime,
                        goods_id,
                        goods_name,
                        goods_count,
                        goods_price,
                        total_price_with_tax,
                        audit_output_count,
                        bill_price,
                        single_price,
                        total_price,
                        is_check,
                        single_cost,
                        total_cost,
                        is_return,
                        main_id,
                        detail_id,
                        bill_real_price,
                        order_real_createtime,
                        tax_percent,
                        city,
                        channel,
                        goods_cate_id,
                        goods_cate_name,
                        cost_with_tax,
                        total_cost_with_tax,
                        workflow_id,
                        workflow_name,
                        mainbody_id,
                        mainbody_name,
                        brand,
                        f_cate_id,
                        f_cate_name,
                        s_cate_id,
                        s_cate_name,
                        t_cate_id,
                        t_cate_name
                    });
                }
            });
            await Tax.bulkCreate(data);
            ctx.body = { success: true, data: 'Data uploaded successfully.' };
            await fs.unlink(file.filepath);
        } catch (error) {
            console.log('uploadtax error ===>>>', error);
        }
    }
}

module.exports = TaxController
