const errorHandler = () => {
    return async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            console.error("Error:", err);
            ctx.status = err.status || 500;
            ctx.body = {
                success: false,
                message: err.message || "Internal Server Error",
            };
        }
    };
};

module.exports = errorHandler;
