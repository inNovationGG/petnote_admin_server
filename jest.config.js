module.exports = {
    testEnvironment: "node",
    // 用于匹配测试用例的文件名，这里表示匹配__tests__目录下的文件或后缀为.test.js、.spec.js、.test.ts、.spec.ts等的文件
    testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",  
    // 指定Jest可以处理的文件扩展名
    moduleFileExtensions: ["ts", "tsx", "js"],
    // coveragePathIgnorePatterns: ["/node_modules/", "/test/"],
    // roots: ["<rootDir>/src/__tests__"],
    moduleFileExtensions: ["js", "jsx"],
    // testMatch: ["**/?(*.)+(test).js"],
    transform: {
        "^.+\\.js$": "babel-jest",
    }
};