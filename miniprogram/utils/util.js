/** 获取当前 Unix 时间戳
 * 获取当前时间戳
 * @returns {Number}
 */
export const getUnix = () => Math.round(+new Date().getTime() / 1000);

/** 获取当前 Unix 毫秒时间戳
 * 获取当前时间戳
 * @returns {Number}
 */
export const getMillisecond = () => Math.round(new Date().getTime());

/**
 * 增加用户信息，并存储信息至本地
 * ```
 * tableName: String - 表名(所存储的数据库表名)
 * ```
 */
export const loginStorage = tableName => {
  wx.cloud.callFunction({
    name: 'login',
    success: res => {
      const { openid, env, appid } = res.result;
      // 本地保存openID信息
      if (!wx.getStorageSync('openid')) {
        wx.setStorageSync('openid', openid);
      }
      // 查询表信息
      const db = wx.cloud.database();
      db.collection(tableName)
        .where({
          _openid: openid
        })
        .get({
          success: res => {
            // 数据库中没有该用户，进行添加用户
            if (!res.data.length) {
              db.collection(tableName)
                .add({
                  data: {
                    env,
                    appid,
                    userInfo: {},
                    registrationTime: getMillisecond()
                  }
                })
                .then(res => {
                  console.log('[数据库]用户信息添加成功', res);
                })
                .cath(err => console.error('[数据库]用户信息添加失败：', err));
            }
          },
          fail: err => console.error('[数据库] [查询记录] 失败：', err)
        });
    },
    fail: err => console.error('[云函数] [login] 调用失败', err)
  });
};

/**
 * 存储用户信息（头像，昵称...）
 *```
 *tableName: String - 表名(所存储的数据库表名)
 *userInfo: Object - 用户信息
 * ```
 */
export const setUserInfo = (tableName, userInfo) => {
  const openid = wx.getStorageSync('openid');
  const db = wx.cloud.database();
  db.collection(tableName)
    .where({
      _openid: openid
    })
    .get({
      success: res => {
        const data = res.data;
        if (data.length) {
          db.collection(tableName)
            .doc(data[0]._id)
            .update({
              data: {
                userInfo: { ...userInfo }
              },
              success: res => {
                // 更新数据成功
                console.log(res);
              },
              fail: err => {
                // 更新数据失败
                console.error('err', err);
              }
            });
        } else {
          console.error('未查找到该用户');
        }
      },
      fail: err => console.error('[数据库] [查询记录] 失败：', err)
    });
};
