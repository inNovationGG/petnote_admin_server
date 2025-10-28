const { Area, PetAdminActionLog } = require("../../models");
// const { Op } = require("sequelize");
const uploadService = require("../../services/uploadService");
const { buildTreeData } = require("../../utils/commonUtil");
const moment = require("moment");

class GlobalController {
    //获取地区（省市区数据）
    async getAreas(ctx) {
        try {
            //优化为从缓存取值，待完善
            // let key = "globals_staticinfo";
            let areaResult = "";
            // areaResult = this.cache.get(key);//从缓存中取值
            let result = {}
            if (!areaResult) {
                let allArea = await Area.findAll();
                //将数组转换为树形结构数据areaId和childrens
                let areaTree = buildTreeData(JSON.parse(JSON.stringify(allArea)), "areaId", "parentId");
                result = {
                    area: areaTree
                }
                // this.cache.set(key, result, 2592000);//数据存到缓存中，并设置过期时间为2592000秒，即30天
            }
            ctx.body = {
                success: true,
                data: result
            }
        } catch (error) {
            console.log(error);
        }
    }
    //用户行为日志记录
    async addActionLog(ctx) {
        try {
            let { uid, ctrl, config = [], req_data = [], page = "" } = ctx.request.body || {};
            let nowTime = Math.floor(Date.now() / 1000);
            let momentDate = moment(new Date());
            let year = momentDate.year();//2024
            let yearMonth = parseInt(momentDate.format('YYYYMM'), 10);//202406
            let yearMonthDay = parseInt(momentDate.format('YYYYMMDD'), 10);//20240601 
            let ip = ctx.request.header['x-forwarded-for'] || ctx.request.ip || "";
            if (ip && ip.split(',').length > 0) {
                ip = ip.split(',')[0].trim();
            }
            console.log('Client IP:', ip);
            let data = {
                uid: uid,
                page: page,
                action: ctrl,
                remark: config['desc'] || "",
                parameter: JSON.parse(JSON.stringify(req_data)),
                type: config['type'] || 0,
                ip: ip,
                created_y: year,
                created_ym: yearMonth,
                created_ymd: yearMonthDay,
                created: nowTime
            }
            await PetAdminActionLog.create(data);
            ctx.body = {
                success: true,
                data: true
            }
        } catch (error) {
            console.log(error);
        }
    }
    //上传图片
    async uploadImg(ctx) {
        const { file_type: fileType, file_data: fileData } = ctx.request.body || {};
        if (!fileType || !fileData) {
            ctx.status = 400;
            ctx.body = { success: false, message: "File type and file data are required." };
            return;
        }
        try {
            const url = await uploadService.uploadImg(fileType, fileData);
            ctx.body = { success: true, data: url }
        } catch (error) {
            ctx.body = { success: false, message: "File upload failed." };
        }
    }
    //权限验证
    async getPermission(ctx) {
        try {
            let { permissionCodes } = ctx.request.body;
            console.log('permissionCodes ===', permissionCodes);
            if (!permissionCodes || !permissionCodes.length) {
                return ctx.body = {
                    success: false,
                    msg: "无系统权限"
                }
            }
            let permissions = {};
            for (let item of permissionCodes) {
                permissions[item] = 1;
            }
            ctx.body = {
                success: true,
                data: permissions
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = GlobalController
