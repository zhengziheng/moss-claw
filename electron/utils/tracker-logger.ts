/**
 * Tracker 日志适配器
 * 将本地日志同时上报到远程事件日志服务器
 *
 * 设计原则：
 * 1. 默认关闭远程上报，需手动开启
 * 2. WARN 和 ERROR 级别 100% 上报，DEBUG 和 INFO 可选择性上报
 * 3. 上报失败时降级到本地日志，不影响主流程
 * 4. 使用批量上报 + 异步发送，避免阻塞主线程
 */

import { logger, LogLevel } from './logger';
import { homedir, tmpdir } from 'os';
import { join } from 'path';
import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { app } from 'electron';
import { userSessionManager } from './user-session';

/**
 * 日志级别枚举（与 logger.ts 保持一致）
 */
export { LogLevel };

/**
 * 已上报位置持久化文件路径
 */
const REPORTED_POSITIONS_FILE = join(
  process.env.NODE_ENV === 'development' ? tmpdir() : (app.getPath('userData') || tmpdir()),
  'reported-log-positions.json'
);

/**
 * Tracker 配置接口
 */
export interface TrackerConfig {
  /** 是否启用远程上报 */
  enabled: boolean;
  /** 上报的最小日志级别 */
  minLevel: LogLevel;
  /** DEBUG 日志采样率 (0-1)，降低流量 */
  sampleRate: number;
  /** 公共附加字段（如 appVersion, platform 等） */
  extraFields: Record<string, string | number | boolean>;
  /** 批量上报最大等待时间 (ms) */
  flushIntervalMs: number;
  /** 批量上报最大条数 */
  maxBatchSize: number;
  /** 是否启用 OpenClaw 日志上报 */
  enableOpenClawLogUpload?: boolean;
  /** OpenClaw 日志上报间隔 (ms) */
  openClawLogIntervalMs?: number;
  /** 每次上报的 OpenClaw 日志最大行数 */
  openClawLogMaxLines?: number;
}

/**
 * 日志事件接口
 */
export interface LogEvent {
  level: string;
  message: string;
  timestamp: string;
  process: 'main' | 'renderer';
  module?: string;
  [key: string]: unknown;
}

/**
 * 待上报事件队列项
 */
interface PendingEvent {
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
}

/**
 * Tracker 日志适配器类
 */
export class TrackerLogger {
  private config: TrackerConfig = {
    enabled: false,
    minLevel: LogLevel.INFO,
    sampleRate: 0.1,
    extraFields: {},
    flushIntervalMs: 5000,
    maxBatchSize: 50
  };

  private pendingEvents: PendingEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private tracker: { eventLog: (event: string, data: Record<string, unknown>) => void } | null = null;
  private isInitialized = false;

  // OpenClaw 日志上报相关
  private openClawLogTimer: NodeJS.Timeout | null = null;
  private lastReadPosition: Map<string, number> = new Map(); // 记录每个文件的读取位置（运行时）

  /**
   * 从磁盘加载已上报位置
   */
  private loadReportedPositions(): void {
    try {
      if (existsSync(REPORTED_POSITIONS_FILE)) {
        const data = readFileSync(REPORTED_POSITIONS_FILE, 'utf-8');
        const positions = JSON.parse(data) as Record<string, number>;
        for (const [filePath, position] of Object.entries(positions)) {
          this.lastReadPosition.set(filePath, position);
        }
        logger.debug('[TrackerLogger] Loaded reported positions:', Object.keys(positions).length);
      }
    } catch (error) {
      logger.debug('[TrackerLogger] Failed to load reported positions:', error);
    }
  }

  /**
   * 保存已上报位置到磁盘
   */
  private saveReportedPositions(): void {
    try {
      const positions: Record<string, number> = {};
      for (const [filePath, position] of this.lastReadPosition.entries()) {
        positions[filePath] = position;
      }
      writeFileSync(REPORTED_POSITIONS_FILE, JSON.stringify(positions, null, 2), 'utf-8');
    } catch (error) {
      logger.debug('[TrackerLogger] Failed to save reported positions:', error);
    }
  }

  /**
   * 获取某个文件的最后读取位置
   */
  private getLastReadPosition(filePath: string): number {
    return this.lastReadPosition.get(filePath) || 0;
  }

  /**
   * 设置某个文件的最后读取位置并持久化保存
   */
  private setLastReadPosition(filePath: string, position: number): void {
    this.lastReadPosition.set(filePath, position);
    this.saveReportedPositions();
  }

  /**
   * 初始化 tracker 实例
   * 需要在渲染进程中调用，传入 tracker 实例
   */
  initTracker(trackerInstance: { eventLog: (event: string, data: Record<string, unknown>) => void }): void {
    this.tracker = trackerInstance;
    this.isInitialized = true;
    this.loadReportedPositions(); // 加载已上报位置
    this.startFlushTimer();
  }

  /**
   * 更新配置
   */
  setConfig(config: Partial<TrackerConfig>): void {
    this.config = { ...this.config, ...config };

    // 如果启用了上报，启动定时器
    if (this.config.enabled && !this.flushTimer) {
      this.startFlushTimer();
    }

    // 如果启用了 OpenClaw 日志上报，启动定时器
    if (this.config.enableOpenClawLogUpload && this.config.enabled && !this.openClawLogTimer) {
      this.startOpenClawLogUploader();
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): Readonly<TrackerConfig> {
    return { ...this.config };
  }

  /**
   * 启动定时刷新
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushIntervalMs);

    // 确保进程退出时清理定时器
    if (typeof process !== 'undefined') {
      process.on('exit', () => {
        this.flushEventsSync();
        if (this.flushTimer) {
          clearInterval(this.flushTimer);
        }
        if (this.openClawLogTimer) {
          clearInterval(this.openClawLogTimer);
        }
      });
    }
  }

  /**
   * 启动 OpenClaw 日志上报定时器
   */
  private startOpenClawLogUploader(): void {
    if (this.openClawLogTimer) {
      clearInterval(this.openClawLogTimer);
    }

    const interval = this.config.openClawLogIntervalMs || 30000; // 默认 30 秒
    const maxLines = this.config.openClawLogMaxLines || 100; // 默认每次最多 100 行

    this.openClawLogTimer = setInterval(() => {
      this.uploadOpenClawLogs(maxLines);
    }, interval);

    logger.debug(`[TrackerLogger] OpenClaw log uploader started, interval: ${interval}ms`);
  }

  /**
   * 获取 OpenClaw 日志目录列表
   * 返回所有存在的日志目录：
   * 1. 环境变量 OPENCLAW_LOG_DIR 指定的目录
   * 2. TEMP/openclaw/ 目录（Gateway 默认日志目录）
   * 3. ~/.openclaw/logs/ 目录（备用）
   */
  private getOpenClawLogDirs(): string[] {
    const dirs: string[] = [];

    // 1. 检查环境变量
    const envLogDir = process.env.OPENCLAW_LOG_DIR || process.env.LOG_DIR;
    if (envLogDir && existsSync(envLogDir)) {
      dirs.push(envLogDir);
    }

    // 2. 检查 TEMP/openclaw/ 目录（Gateway 默认日志目录）
    const tempLogDir = join(tmpdir(), 'openclaw');
    if (existsSync(tempLogDir)) {
      dirs.push(tempLogDir);
    }

    // 3. 备用目录 ~/.openclaw/logs/
    const fallbackLogDir = join(homedir(), '.openclaw', 'logs');
    if (existsSync(fallbackLogDir)) {
      dirs.push(fallbackLogDir);
    }

    return dirs;
  }

  /**
   * 读取并上报 OpenClaw 日志
   * 支持从多个日志目录中读取日志
   */
  private uploadOpenClawLogs(maxLines: number): void {
    if (!this.config.enableOpenClawLogUpload || !this.tracker) {
      return;
    }

    const logDirs = this.getOpenClawLogDirs();
    if (logDirs.length === 0) {
      return;
    }

    // 遍历所有日志目录
    for (const logDir of logDirs) {
      this.uploadLogDir(logDir, maxLines);
    }
  }

  /**
   * 从指定目录读取并上报日志
   */
  private uploadLogDir(logDir: string, maxLines: number): void {
    try {
      // 获取所有日志文件
      const files = readdirSync(logDir)
        .filter(f => f.endsWith('.log'))
        .map(f => ({
          name: f,
          path: join(logDir, f),
          stat: statSync(join(logDir, f))
        }))
        .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs); // 按修改时间排序，最新的在前

      // 只处理最新的日志文件
      const latestFile = files[0];

      if (!latestFile) return;

      const filePath = latestFile.path;
      const currentSize = latestFile.stat.size;
      const lastPosition = this.getLastReadPosition(filePath);

      // 如果文件被截断（轮转），重置位置
      if (currentSize < lastPosition) {
        this.setLastReadPosition(filePath, 0);
      }

      // 读取新增内容
      const content = readFileSync(filePath, 'utf-8');
      const newContent = content.substring(lastPosition);
      this.setLastReadPosition(filePath, content.length);

      if (!newContent.trim()) return;

      // 按行分割，限制行数
      const lines = newContent.split('\n').filter(line => line.trim()).slice(-maxLines);

      // 批量上报
      lines.forEach((line, index) => {
        // 尝试解析日志格式（时间戳 + 级别 + 消息）
        const logMatch = line.match(/^\[(.*?)\]\s*\[(.*?)\]\s*(.*)$/);
        if (logMatch) {
          this.track('openclaw_log', {
            source: 'openclaw',
            file: latestFile.name,
            timestamp: logMatch[1],
            level: logMatch[2],
            message: logMatch[3],
            lineIndex: index
          });
        } else {
          this.track('openclaw_log', {
            source: 'openclaw',
            file: latestFile.name,
            message: line,
            lineIndex: index
          });
        }
      });

      logger.debug(`[TrackerLogger] Uploaded ${lines.length} lines from OpenClaw log: ${latestFile.path}`);
    } catch (error) {
      logger.debug('[TrackerLogger] Failed to upload OpenClaw logs:', error);
    }
  }

  /**
   * 判断是否应该上报该级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled || !this.isInitialized) {
      return false;
    }
    if (level < this.config.minLevel) {
      return false;
    }

    // DEBUG 级别使用采样
    if (level === LogLevel.DEBUG) {
      return Math.random() < this.config.sampleRate;
    }
    return true;
  }

  /**
   * 构建日志事件数据
   */
  private buildEvent(
    level: string,
    message: string,
    data?: Record<string, unknown>
  ): LogEvent {
    const sessionInfo = userSessionManager.getSessionInfo();
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      process: 'main',
      userId: sessionInfo.userId || undefined,
      ...this.config.extraFields,
      ...data
    };
  }

  /**
   * 过滤敏感信息
   */
  private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    // 更精确的敏感关键词匹配（使用单词边界，避免误判）
    const sensitivePatterns = [
      /\bpassword\b/i,
      /\bpasswd\b/i,
      /\bsecret\b/i,
      /\btoken\b/i,
      /\bapi[_-]?key\b/i,
      /\bauth\b/i,
      /\bcredential\b/i,
      /\bcookie\b/i,
      /\baccess[_-]?token\b/i,
      /\brefresh[_-]?token\b/i
    ];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const isSensitive = sensitivePatterns.some(pattern => pattern.test(key));
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * 上报事件到远程服务器
   */
  private track(event: string, data: Record<string, unknown>): void {
    const sanitizedData = this.sanitizeData(data);

    const pendingEvent: PendingEvent = {
      event,
      data: sanitizedData,
      timestamp: Date.now()
    };

    this.pendingEvents.push(pendingEvent);

    // 达到阈值立即上报
    if (this.pendingEvents.length >= this.config.maxBatchSize) {
      this.flushEvents();
    }
  }

  /**
   * 批量上报事件（异步）
   */
  private flushEvents(): void {
    if (this.pendingEvents.length === 0 || !this.tracker) {
      return;
    }

    const events = this.pendingEvents.splice(0, this.config.maxBatchSize);

    events.forEach(({ event, data }) => {
      try {
        this.tracker?.eventLog(event, data);
      } catch (error) {
        // 上报失败时记录到本地日志，但不影响主流程
        logger.debug('[TrackerLogger] Track failed:', event, error);
      }
    });
  }

  /**
   * 同步上报（用于进程退出前）
   */
  private flushEventsSync(): void {
    if (this.pendingEvents.length === 0 || !this.tracker) {
      return;
    }

    // 注意：tracker 的 eventLog 可能是异步的，这里只是尽力而为
    const events = this.pendingEvents.splice(0, this.config.maxBatchSize);
    events.forEach(({ event, data }) => {
      try {
        this.tracker?.eventLog(event, data);
      } catch {
        // 忽略错误
      }
    });
  }

  // ==================== 公共日志方法 ====================

  /**
   * DEBUG 级别日志
   */
  debug(message: string, data?: Record<string, unknown>): void {
    logger.debug(message, data);
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.track('log_debug', this.buildEvent('DEBUG', message, data));
    }
  }

  /**
   * INFO 级别日志
   */
  info(message: string, data?: Record<string, unknown>): void {
    logger.info(message, data);
    if (this.shouldLog(LogLevel.INFO)) {
      this.track('log_info', this.buildEvent('INFO', message, data));
    }
  }

  /**
   * WARN 级别日志
   */
  warn(message: string, data?: Record<string, unknown>): void {
    logger.warn(message, data);
    if (this.shouldLog(LogLevel.WARN)) {
      this.track('log_warn', this.buildEvent('WARN', message, data));
    }
  }

  /**
   * ERROR 级别日志
   */
  error(message: string, data?: Record<string, unknown>): void {
    logger.error(message, data);
    if (this.shouldLog(LogLevel.ERROR)) {
      this.track('log_error', this.buildEvent('ERROR', message, data));
    }
  }

  /**
   * 直接上报自定义事件
   */
  trackEvent(event: string, data: Record<string, unknown>): void {
    if (!this.config.enabled || !this.isInitialized) {
      logger.debug(`[tracker-fallback] ${event}`, data);
      return;
    }
    // 添加 userId 到事件数据中
    const sessionInfo = userSessionManager.getSessionInfo();
    const enrichedData = {
      userId: sessionInfo.userId || undefined,
      ...data
    };
    this.track(event, enrichedData);
  }

  /**
   * 立即刷新所有待上报事件
   */
  flush(): void {
    this.flushEvents();
  }

  /**
   * 获取指定日志文件已上报的字节位置
   * @param filePath 日志文件完整路径
   * @returns 已上报的字节位置，未上报过返回 0
   */
  getReportedPosition(filePath: string): number {
    return this.getLastReadPosition(filePath);
  }

  /**
   * 获取所有已上报位置的文件信息
   * @returns 文件路径和已上报位置的映射
   */
  getAllReportedPositions(): Map<string, number> {
    return new Map(this.lastReadPosition);
  }

  /**
   * 判断日志文件的指定行是否已上报（按行号）
   * @param filePath 日志文件完整路径
   * @param lineNumber 行号（从1开始）
   * @returns 是否已上报
   */
  isLineReported(filePath: string, lineNumber: number): boolean {
    const reportedPosition = this.getLastReadPosition(filePath);
    if (reportedPosition === 0) {
      return false;
    }
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      // 计算前 lineNumber 行的字符数（包括换行符）
      let position = 0;
      for (let i = 0; i < lineNumber && i < lines.length; i++) {
        position += lines[i].length + 1; // +1 是换行符
      }
      return position <= reportedPosition;
    } catch {
      return false;
    }
  }

  /**
   * 判断日志文件的指定内容是否已上报（按字节位置）
   * @param filePath 日志文件完整路径
   * @param startByte 内容的起始字节位置
   * @param endByte 内容的结束字节位置
   * @returns 是否已上报
   */
  isRangeReported(filePath: string, startByte: number, endByte: number): boolean {
    const reportedPosition = this.getLastReadPosition(filePath);
    return endByte <= reportedPosition;
  }

  /**
   * 重置指定日志文件的上报位置（用于手动重试）
   * @param filePath 日志文件完整路径，不传则重置所有
   */
  resetReportedPosition(filePath?: string): void {
    if (filePath) {
      this.lastReadPosition.delete(filePath);
    } else {
      this.lastReadPosition.clear();
    }
    this.saveReportedPositions();
    logger.info('[TrackerLogger] Reset reported positions:', filePath || 'all');
  }

  /**
   * 销毁实例，清理资源
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.openClawLogTimer) {
      clearInterval(this.openClawLogTimer);
      this.openClawLogTimer = null;
    }
    this.flushEventsSync();
    this.pendingEvents = [];
  }
}

// 导出单例
export const trackerLogger = new TrackerLogger();
