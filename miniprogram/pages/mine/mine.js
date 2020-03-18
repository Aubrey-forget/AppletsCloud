// miniprogram/pages/mine/mine.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    authorizeStatus: true,
    showUser: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检测用户是否授权用户信息
    wx.getSetting({
      success: res => {
        const resData = res.authSetting;
        if (!resData['scope.userInfo'])
          this.setData({ authorizeStatus: false });
      }
    });
  },

  // 监测用户是否授权用户信息
  changeStatus(e) {
    const { status } = e.detail;
    if (status) this.setData({ authorizeStatus: true });
  },

  getLoginUser() {
    this.setData({ showUser: true });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {}
});
