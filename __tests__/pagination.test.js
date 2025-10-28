const { formatPagination } = require("../utils/pagination");

test("formatPagination should return formatted pagination object", () => {
  const result = formatPagination({ total: 100, page: 1, limit: 10, pages: 10 });
  expect(result).toEqual({
    totalCount: 100,
    currentPage: 1,
    currentPageSize: 10,
    totalPage: 10,
  });
});
