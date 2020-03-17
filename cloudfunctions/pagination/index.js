// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const dbName = event.dbName;
  const filter = event.filter || {}; //(格式：{ _id: '123' })
  const currPage = event.currPage || 1; // 当前第几页，默认：第一页
  const pageSize = event.pageSize || 10; // 每页的数量  默认：10条
  const resResult = await db
    .collection(dbName)
    .where(filter)
    .count();
  const total = resResult.total; // 数据总数量
  const totalPage = Math.ceil(total / 10); // 总页数
  let hasMore; //是否还有数据
  if (currPage >= totalPage) hasMore = false;
  else hasMore = true;
  return db
    .collection(dbName)
    .where(filter)
    .skip((currPage - 1) * pageSize)
    .limit(pageSize)
    .get()
    .then(res => {
      res.hasMore = hasMore;
      res.currPage = currPage;
      res.totalPage = totalPage;
      res.total = total;
      return res;
    })
    .catch(err => {
      return err;
    });
};
