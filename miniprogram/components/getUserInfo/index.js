// components/getUserInfo/index.js
import { setUserInfo } from '../../utils/util';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

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
      if (errMsg === 'getUserInfo:ok') {
        setUserInfo('user', userInfo);
        this.isStatus = true;
      } else {
        this.isStatus = false;
      }
      this.setData({ show: false });
    },

    _close() {
      this.setData({ show: false });
      this.isStatus = false;
    },

    changeStatus() {
      this.triggerEvent('status', { status: this.isStatus }, {});
    }
  }
});
