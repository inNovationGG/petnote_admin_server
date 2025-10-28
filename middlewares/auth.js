const { verifyToken } = require("../utils/jwt");

module.exports = async (ctx, next) => {
  try {
    const token = ctx.request.header.token || ctx.query.token;
    if (!token) {
      ctx.throw(401, "登录过期，请重新登录");
    }
    const payload = verifyToken(token);
    if (payload && payload.uid) {
      ctx.state.user = {
        uid: payload.uid,
        username: payload.username,
      };
    } else {
      ctx.throw(401, "登录过期，请重新登录");
    }
    await next();
  } catch (error) {
    console.log("error: ", error);
    ctx.body = {
      code: 100000,
      msg: "登录过期,请重新登录",
      data: null,
    };
  }
};
