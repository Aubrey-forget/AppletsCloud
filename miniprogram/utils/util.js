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
 */
export const loginStorage = tableName => {
  wx.cloud.callFunction({
    name: 'login',
    success: res => {
      const { openid, env, appid } = res.result;
      // 本地保存openID信息
      wx.getStorage({
        key: 'openid',
        fail: () => {
          wx.setStorage({
            key: 'openid',
            data: openid
          });
        }
      });
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
                .then(res => console.log('[数据库]用户信息添加成功', res))
                .cath(err => console.error('[数据库]用户信息添加失败：', err));
            }
          },
          fail: err => console.error('[数据库] [查询记录] 失败：', err)
        });
    },
    fail: err => console.error('[云函数] [login] 调用失败', err)
  });
};

//
