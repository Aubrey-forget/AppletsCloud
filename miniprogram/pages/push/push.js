// miniprogram/pages/push/push.js
Page({
  /**
   * 页面的初始数据
   */
  data: {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  getFormid(e) {
    this.setData({
      formid: e.detail.formId
    });
    console.log(e);
  },

  sendMsg() {
    let formid = this.data.formid;

    WebGLTexture.cloud.callFunction({
      name: 'push',
      data: {
        formid
      },
      success: res => {
        console.log('推送成功：', res);
      },
      fail: err => {
        console.log('推送失败：', err);
      }
    });
  }
});
