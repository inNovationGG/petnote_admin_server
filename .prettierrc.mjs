/** @type {import("prettier").Config} */
const config = {
    printWidth: 120, // 每行代码的长度限制
    tabWidth: 2, // 指定一个制表符等于的空格数
    useTabs: false, //空格和制表符的插入和删除与制表位对齐
    semi: true, // 在所有代码语句的末尾添加分号
    singleQuote: false, // 使用单引号而不是双引号
    jsxSingleQuote: true, // JSX 中使用单引号而不是双引号
    quoteProps: "as-needed", // 指定对象字面量中的属性名引号添加方式。可选项：•as-needed - 只在需要的情况下加引号
    trailingComma: "es5", // 指定添加尾后逗号的方式。选项：• es5 - 在 ES5 中有效的尾后逗号（如对象与数组等）。
    bracketSpacing: true, // 在对象字面量的花括号内侧使用空格作为间隔
    arrowParens: "always", // 箭头函数仅有一个参数时，参数是否添加括号。
    proseWrap: "preserve", // 文本换行
    htmlWhitespaceSensitivity: "ignore", // 指定 HTML 文件的空白字符敏感度。可选项：•ignore- 空白字符不敏感
    endOfLine: "lf", //指定 Prettier 使用的换行符
};

export default config;
