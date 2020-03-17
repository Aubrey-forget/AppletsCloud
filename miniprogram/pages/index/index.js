//index.js
const app = getApp();
import { uploadFile, download } from '../../utils/util';

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib'
      });
      return;
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              });
            }
          });
        }
      }
    });
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      });
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        app.globalData.openid = res.result.openid;
        wx.navigateTo({
          url: '../userConsole/userConsole'
        });
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err);
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions'
        });
      }
    });
  },

  // 上传图片
  doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        const filePath = res.tempFilePaths[0];
        uploadFile(filePath)
          .then(res => {
            console.log('****', res);
            download(res.fileID);
          })
          .catch(err => {
            console.log('----', err);
          });
      },
      fail: e => {
        console.error(e);
      }
    });
  }
});
