/**
 * User Session Hook
 * 用于在渲染进程中管理用户登录状态
 *
 * 使用方法：
 * 1. 用户登录成功后，调用 setUserId(userId) 将 userId 传递给主进程
 * 2. 主进程会缓存 userId，并在上报日志时自动带上
 */

import { useEffect, useState } from 'react';

// 声明 electron API 类型
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
        on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
      };
    };
  }
}

/**
 * 设置用户 ID
 * @param userId 用户唯一标识
 */
export async function setUserId(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!window.electron) {
    console.warn('[UserSession] Electron API not available');
    return { success: false, error: 'Electron API not available' };
  }

  try {
    const result = await window.electron.ipcRenderer.invoke('user:setUserId', userId);
    return result as { success: boolean; error?: string };
  } catch (error) {
    console.error('[UserSession] Failed to set userId:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 获取当前用户 ID
 * @returns 用户 ID，未登录返回 null
 */
export async function getUserId(): Promise<string | null> {
  if (!window.electron) {
    console.warn('[UserSession] Electron API not available');
    return null;
  }

  try {
    const result = await window.electron.ipcRenderer.invoke('user:getUserId');
    return result as string | null;
  } catch (error) {
    console.error('[UserSession] Failed to get userId:', error);
    return null;
  }
}

/**
 * 清除用户登录状态
 */
export async function clearUserSession(): Promise<{ success: boolean }> {
  if (!window.electron) {
    console.warn('[UserSession] Electron API not available');
    return { success: false };
  }

  try {
    const result = await window.electron.ipcRenderer.invoke('user:clear');
    return result as { success: boolean };
  } catch (error) {
    console.error('[UserSession] Failed to clear user session:', error);
    return { success: false };
  }
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export async function isLoggedIn(): Promise<boolean> {
  if (!window.electron) {
    console.warn('[UserSession] Electron API not available');
    return false;
  }

  try {
    const result = await window.electron.ipcRenderer.invoke('user:isLoggedIn');
    return result as boolean;
  } catch (error) {
    console.error('[UserSession] Failed to check login status:', error);
    return false;
  }
}

/**
 * React Hook - 管理用户登录状态
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { userId, isLoggedIn, setUserId, clearSession } = useUserSession();
 *
 *   // 用户登录成功后
 *   const handleLoginSuccess = async (userId: string) => {
 *     await setUserId(userId);
 *   };
 *
 *   // 用户登出
 *   const handleLogout = async () => {
 *     await clearSession();
 *   };
 *
 *   return (
 *     <div>
 *       {isLoggedIn ? `Logged in as: ${userId}` : 'Not logged in'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserSession() {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化时检查登录状态
  useEffect(() => {
    let mounted = true;

    const checkLoginStatus = async () => {
      try {
        const id = await getUserId();
        if (mounted) {
          setUserIdState(id);
          setLoggedIn(!!id);
        }
      } catch (error) {
        console.error('[UserSession] Error checking login status:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkLoginStatus();

    return () => {
      mounted = true;
    };
  }, []);

  // 设置用户 ID
  const setUserId = async (id: string) => {
    const result = await setUserId(id);
    if (result.success) {
      setUserIdState(id);
      setLoggedIn(true);
    }
    return result;
  };

  // 清除会话
  const clearSession = async () => {
    const result = await clearUserSession();
    if (result.success) {
      setUserIdState(null);
      setLoggedIn(false);
    }
    return result;
  };

  return {
    userId,
    isLoggedIn: loggedIn,
    loading,
    setUserId,
    clearSession
  };
}
