const responseFormatter = () => {
  return async (ctx, next) => {
    try {
      await next();
      // 如果 code 是 100000 登录失效，跳过统一的响应格式处理
      if (ctx.body && ctx.body.code === 100000) {
        return;
      }
      if (ctx.body && ctx.body.success) {
        ctx.body = {
          code: 200,
          msg: "",
          data: ctx.body.data || null,
        };
      } else {
        ctx.body = {
          code: ctx.body?.code || ctx.status || 500,
          msg: ctx.body?.message || ctx.body?.msg || "发生错误，请稍后再试",
          data: ctx.body.data || null,
        };
      }
    } catch (error) {
      console.log("responseFormatter error: ", error);
      ctx.status = error.status || 500;
      ctx.body = {
        code: ctx.status,
        msg: error.message || "发生错误，请稍后再试",
        data: null,
      };
      // 触发应用层面的错误事件，记录日志等
      ctx.app.emit("error", error, ctx);
    }
  };
};

module.exports = responseFormatter;
