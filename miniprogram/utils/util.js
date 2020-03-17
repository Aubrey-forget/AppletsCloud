/** 获取当前 Unix 时间戳
 * 获取当前时间戳
 * @returns {Number}
 */
const getUnix = () => Math.round(+new Date().getTime() / 1000);
/**
 * 时间戳转化为年 月 日 时 分 秒
 * number: 传入时间戳
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
 * 例子：formatDate(需要转换的时间戳, 'M月D日 h:m:s')
 */
const formatDate = (number, format) => {
  const formatNumber = num => `${num > 9 ? '' : '0'}${num}`;
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's', '年', '月', '日'];
  let returnArr = [];
  const date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (let i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
};

/** 获取当前 Unix 毫秒时间戳
 * 获取当前时间戳
 * @returns {Number}
 */
const getMillisecond = () => Math.round(new Date().getTime());

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
                    createTime: getMillisecond()
                  }
                })
                .then(res => {
                  console.log('[数据库]用户信息添加成功', res);
                })
                .catch(err => {
                  console.error('[数据库]用户信息添加失败：', err);
                  setLog('[数据库]用户信息添加失败：' + err);
                });
            }
          },
          fail: err => {
            console.error('[数据库] [查询记录] 失败：', err);
            setLog('[数据库] [查询记录] 失败：' + err);
          }
        });
    },
    fail: err => {
      console.error('[云函数] [login] 调用失败', err);
      setLog('[云函数] [login] 调用失败：' + err);
    }
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

// 存储程序执行出错日志
export const setLog = msg => {
  const db = wx.cloud.database();
  db.collection('log')
    .add({
      data: {
        createTime: formatDate(getUnix(), 'Y-M-D h:m:s'),
        msg
      }
    })
    .then(res => {
      console.log('日志添加成功', res);
    })
    .catch(err => {
      console.log('日志添加失败', err);
    });
};

/**
 * 上传文件
 * ```
 * filePath: String - (文件路径)
 * ```
 */
export const uploadFile = filePath => {
  // 文件后缀名
  const suffix = filePath.match(/\.[^.]+?$/)
    ? filePath.match(/\.[^.]+?$/)[0]
    : '';
  const pathName = filePath.split('.')[1]
    ? filePath.split('.')[1] + '-' + getMillisecond()
    : '-' + getMillisecond();
  // 文件名字
  const cloudPath = pathName + suffix;

  // 上传的图片进行openID绑定
  const cloudStorage = id => {
    const db = wx.cloud.database();
    db.collection('cloudStorage')
      .add({
        data: { fileID: id }
      })
      .then(() => {})
      .catch(err => setLog('图片添加失败：' + err));
  };

  // 上传图片
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '上传中...', mask: true });
    wx.cloud
      .uploadFile({
        cloudPath,
        filePath
      })
      .then(res => {
        wx.hideLoading();
        cloudStorage(res.fileID);
        resolve(res);
      })
      .catch(error => {
        wx.hideLoading();
        setLog('上传文件失败：' + error);
        wx.showModal({
          title: '提示',
          content: '文件上传失败：请重新上传'
        });
        reject(error);
      });
  });
};

/**
 * 下载云存储中的文件到本地
 * ```
 * list String - (值为云存储fileID)
 * ```
 */
export const download = async pathId => {
  wx.cloud.callFunction({
    name: 'download',
    data: { path: pathId },
    success: res => {
      console.log('成功：', res);
      const result = res.result;
      runTask(result[0].tempFileURL);
    },
    fail: err => {
      console.log('失败：', err);
      setLog('下载云函数调用失败：' + err);
    }
  });

  const runTask = downloadPath => {
    wx.showLoading({ title: '下载中...', mask: true });
    wx.downloadFile({
      url: downloadPath,
      success: res => {
        wx.hideLoading();
        console.log('下载：', res);
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showModal({
                title: '成功',
                content: '保存成功'
              });
            },
            fail: err => {
              setLog('保存失败：' + err);
              wx.showModal({
                title: '错误',
                content: '保存失败，请确保已授权，可到我的授权中查看授权信息'
              });
            }
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('文件下载失败', err);
        wx.showModal({
          title: '提示',
          content: '文件上传下载：请重新下载'
        });
      }
    });
    // const downloadTask = wx.downloadFile({
    //   url: downloadPath,
    //   success: res => {
    //     console.log('下载：', res);
    //   }
    // });
    // downloadTask.onProgressUpdate(res => {
    //   console.log('下载进度', res.progress);
    //   console.log('已经下载的数据长度', res.totalBytesWritten);
    //   console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite);
    // });
  };
};
