const authService = require("../../services/authService");

class OpenController {
    //用户登录
    async login(ctx) {
        try {
            const { username, password } = ctx.request.body || {};
            if (!(username && password)) {
                return ctx.body = { success: false, msg: "用户名和密码不能为空" }
            }
            const result = await authService.login(username, password);
            if (result.success) {
                ctx.status = 200;
                ctx.body = result;
            } else {
                ctx.status = 400;
                ctx.body = result;
            }
        } catch (error) {
            ctx.throw(500, "Internal Server Error");
        }
    };
    
    //用户注册
    async register(ctx) {
        try {
            const { username, password, truename = '' } = ctx.request.body || {};
            if (!(username && password)) {
                return ctx.body = { success: false, msg: "用户名和密码不能为空" }
            }
            const result = await authService.register(username, password, truename);
            if (result.success) {
                ctx.status = 200;
                ctx.body = result;
            } else {
                ctx.status = 400;
                ctx.body = result;
            }
        } catch (error) {
            ctx.throw(500, "Internal Server Error");
        }
    }
}

module.exports = OpenController;
