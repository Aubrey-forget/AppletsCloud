// miniprogram/pages/getMobile/getMobile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.login({
      success: res => {
        if (res.code) {
          this.code = res.code;
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  getPhoneNumber(e) {
    if (!e.detail.errMsg || e.detail.errMsg != 'getPhoneNumber:ok') {
      wx.showModal({
        content: '不能获取手机号码',
        showCancel: false
      });
      return;
    }
    wx.showLoading({
      title: '获取手机号中...'
    });
    wx.cloud.callFunction({
      name: 'getToken', // 对应云函数名
      data: {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        sessionCode: this.code // 这个通过wx.login获取，去了解一下就知道。这不多描述
      },
      success: res => {
        wx.hideLoading();
        // 成功拿到手机号，跳转首页
      },
      fail: err => {
        console.error(err);
        wx.hideLoading();
      }
    });
  }
});
