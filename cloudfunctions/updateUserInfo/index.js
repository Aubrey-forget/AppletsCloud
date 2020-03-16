// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 云函数入口函数
exports.main = async (event, context) => {
  const { openid, userInfo } = event;
  console.log('--', event);

  const db = cloud.database();
  return await db
    .collection('user')
    .where({
      _openid: openid
    })
    .get({
      success: res => {
        const data = res.data;
        if (data.length) {
          db.collection('user')
            .doc(data[0]._id)
            .update({
              data: {
                userInfo: {
                  ...userInfo
                }
              },
              success: res => {
                // 更新数据成功
                console.log(res);
                return 1;
              },
              fail: err => {
                // 更新数据失败
                console.error('err', err);
                return 0;
              }
            });
        } else {
          console.error('未查找到该用户');
          return 0;
        }
      },
      fail: err => console.error('[数据库] [查询记录] 失败：', err)
    });
};
