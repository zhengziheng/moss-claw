/**
 * Electron 主进程 Tracker 实例
 */

// 重要：必须先导入 window-mock，确保在导入 gs-event-tracker-core 之前 mock window 对象
// import './window-mock';

import Tracker from './gs-event-tracker-core';

const tracker = new Tracker({
  appid: 'moss-claw',
  requestUrl:  'https://eventlog.web.guosen.com.cn/_.gif',

  extra: {}, // 用户自定义上传字段对象
  enableHeatMapTracker: false, // 是否开启热力图自动上报，默认 false
  enableLoadTracker: false, // 是否开启页面加载自动上报，适合多页面应用的 pv 上报，默认 false
  enableHistoryTracker: true, // 是否开启页面 history 变化自动上报，适合单页面应用的 history 路由，默认 true
  enableHashTracker: false, // 是否开启页面 hash 变化自动上报，适合单页面应用的 hash 路由，默认 fasle
  enableTrackerKey: true // 是否开启带有 gs-tracker-key 属性的元素自动点击上报，默认 true
})

// ==================== 调试用：监听 tracker 发送请求 ====================
// 运行应用时，Console 会打印每次上报的事件和数据
const originalEventLog = tracker.eventLog.bind(tracker);
tracker.eventLog = function(event: string, data: Record<string, unknown>) {
  // console.log('[Tracker Debug] Event:', event);
  // console.log('[Tracker Debug] Data:', JSON.stringify(data, null, 2));
  // console.log('[Tracker Debug] Time:', new Date().toISOString());
  // console.log('---');
  return originalEventLog(event, data);
};
// ====================================================================

// const envInfo = location.host === 'devops.web.guosen.com.cn' ? { env: 'prod' } : envMap[location.host]
// tracker.setLogExtra({
//   env: envInfo?.env || 'test'
//   // requestUrl: envInfo.requestUrl
// })

export default tracker

