// components/getUserInfo/index.js
import { setUserInfo } from '../../utils/util';
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    show: false
  },

  attached() {
    wx.getSetting({
      success: res => {
        const resData = res.authSetting;
        if (!resData['scope.userInfo']) {
          this.setData({ show: true });
        } else {
          this.setData({ show: false });
        }
      },
      fail: err => {
        console.log('err', err);
      }
    });
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _getUserInfo(e) {
      const { errMsg, userInfo } = e.detail;
      if (errMsg === 'getUserInfo:ok') setUserInfo('user', userInfo);
      this._close();
    },

    _close() {
      this.setData({
        show: false
      });
    }
  }
});
