//app.js
import { loginStorage } from './utils/util';
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      wx.showToast({
        title: '您当前微信版本过低，请升级微信后重试',
        icon: 'none',
        duration: 5000
      });
    } else {
      wx.cloud.init({
        env: 'test-hfg2f',
        traceUser: true
      });
      loginStorage('user');
    }

    this.globalData = {};
  }
});
