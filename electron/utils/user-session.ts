/**
 * User Session Manager
 * 管理用户登录状态和 userId 缓存
 *
 * 功能：
 * 1. 缓存当前登录用户的 userId
 * 2. 提供 IPC 接口供渲染进程设置 userId
 * 3. 为日志上报提供 userId 参数
 */

import { EventEmitter } from 'events';
import { logger } from './logger';

class UserSessionManager extends EventEmitter {
  private userId: string | null = null;
  private loginTime: number | null = null;

  /**
   * 设置用户 ID
   * @param userId 用户唯一标识
   */
  setUserId(userId: string): void {
    const wasLoggedIn = this.userId !== null;
    this.userId = userId;
    this.loginTime = Date.now();

    if (wasLoggedIn) {
      logger.info('[UserSession] User ID updated:', userId);
    } else {
      logger.info('[UserSession] User logged in:', userId);
    }

    // 触发登录事件，通知监听者
    this.emit('login', { userId, loginTime: this.loginTime });
  }

  /**
   * 获取用户 ID
   * @returns 用户 ID，未登录返回 null
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * 获取登录时间
   * @returns 登录时间戳，未登录返回 null
   */
  getLoginTime(): number | null {
    return this.loginTime;
  }

  /**
   * 清除用户登录状态
   */
  clear(): void {
    const oldUserId = this.userId;
    this.userId = null;
    this.loginTime = null;

    if (oldUserId) {
      logger.info('[UserSession] User logged out:', oldUserId);
      this.emit('logout', { userId: oldUserId });
    }
  }

  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  isLoggedIn(): boolean {
    return this.userId !== null;
  }

  /**
   * 获取会话信息（用于日志上报）
   * @returns 会话信息对象
   */
  getSessionInfo(): { userId: string | null; loginTime: number | null } {
    return {
      userId: this.userId,
      loginTime: this.loginTime
    };
  }
}

// 导出单例
export const userSessionManager = new UserSessionManager();
