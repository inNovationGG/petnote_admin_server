const { getNextColumnLetter, getColumnNumber } = require("../utils/excelUtil");

test("getNextColumnLetter should return next column of excel", () => {
    const result = getNextColumnLetter('A');
    expect(result).toBe('B');
});

test("getColumnNumber should return index of excel column", () => {
    const result = getColumnNumber('AB');
    expect(result).toBe(28);
});