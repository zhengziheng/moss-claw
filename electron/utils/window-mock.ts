/**
 * Window Mock for Node.js Environment
 * 必须在导入 gs-event-tracker-core 之前导入此文件
 */

import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

// 在 Node.js/Electron 主进程环境中，gs-event-tracker-core 会引用 window、document、navigator 等变量
// 这里提供一个 mock window 对象来避免 "window is not defined" 错误
// @ts-ignore - Node.js 环境没有 window 类型定义
if (typeof (global as any).window === 'undefined') {
  // 创建 mock window 对象
  const mockWindow: any = {
    location: { href: '', hostname: '', protocol: 'https:', origin: '' },
    navigator: { userAgent: '', platform: '', language: 'zh-CN', languages: ['zh-CN', 'en'] },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    CustomEvent: class CustomEvent {
      type: string;
      detail?: any;
      constructor(type: string, detail?: any) {
        this.type = type;
        this.detail = detail;
      }
    },
    document: {
      title: 'Mock Page Title',
      getElementById: () => null,
      getElementsByName: () => [],
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      documentElement: { scrollLeft: 0, scrollTop: 0 }
    },
    history: {
      pushState: () => {},
      replaceState: () => {}
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    Event: class Event {},
    Image: class Image { onload: any; src: string; constructor() { this.onload = null; this.src = ''; } },
    Blob: class Blob {},
    screen: { width: 0, height: 0 },
    // 使用 Node.js 原生 HTTP 模块实现 XMLHttpRequest
    XMLHttpRequest: class XMLHttpRequest {
      // 状态常量
      static readonly UNSENT: number = 0;
      static readonly OPENED: number = 1;
      static readonly HEADERS_RECEIVED: number = 2;
      static readonly LOADING: number = 3;
      static readonly DONE: number = 4;

      // 实例属性
      readonly UNSENT: number = 0;
      readonly OPENED: number = 1;
      readonly HEADERS_RECEIVED: number = 2;
      readonly LOADING: number = 3;
      readonly DONE: number = 4;

      readyState: number = 0;
      status: number = 0;
      statusText: string = '';
      response: any = null;
      responseText: string = '';
      responseType: string = 'text';
      responseXML: any = null;
      responseURL: string = '';

      private method: string = 'GET';
      private url: string = '';
      private headers: Record<string, string> = {};
      private body: string | ArrayBuffer | null = '';
      private responseHeaders: Record<string, string> = {};
      private timeoutValue: number = 0;

      // 事件处理程序
      onreadystatechange: ((this: XMLHttpRequest, ev: any) => void) | null = null;
      onabort: ((this: XMLHttpRequest, ev: any) => void) | null = null;
      onerror: ((this: XMLHttpRequest, ev: any) => void) | null = null;
      onload: ((this: XMLHttpRequest, ev: any) => void) | null = null;
      ontimeout: ((this: XMLHttpRequest, ev: any) => void) | null = null;
      onloadend: ((this: XMLHttpRequest, ev: any) => void) | null = null;
      onloadstart: ((this: XMLHttpRequest, ev: any) => void) | null = null;
      onprogress: ((this: XMLHttpRequest, ev: any) => void) | null = null;

      private setState(readyState: number) {
        this.readyState = readyState;
        if (this.onreadystatechange) {
          this.onreadystatechange({ target: this, currentTarget: this } as any);
        }
      }

      open(method: string, url: string, _async: boolean = true) {
        this.method = method.toUpperCase();
        this.url = url;
        this.headers = {};
        this.body = '';
        this.responseHeaders = {};
        this.status = 0;
        this.statusText = '';
        this.response = null;
        this.responseText = '';
        this.setState(this.OPENED);
      }

      setRequestHeader(key: string, value: string) {
        this.headers[key] = value;
      }

      getResponseHeader(header: string): string | null {
        const lowerHeader = header.toLowerCase();
        for (const [key, value] of Object.entries(this.responseHeaders)) {
          if (key.toLowerCase() === lowerHeader) {
            return value;
          }
        }
        return null;
      }

      getAllResponseHeaders(): string {
        return Object.entries(this.responseHeaders)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\r\n');
      }

      abort() {
        this.setState(this.DONE);
        if (this.onabort) {
          this.onabort({ target: this, currentTarget: this } as any);
        }
        if (this.onloadend) {
          this.onloadend({ target: this, currentTarget: this } as any);
        }
      }

      send(body?: string | ArrayBuffer | null) {
        if (!this.url) {
          throw new Error('XMLHttpRequest: open() must be called before send()');
        }

        this.body = body || '';

        const parsedUrl = new URL(this.url);
        const lib = parsedUrl.protocol === 'https:' ? https : http;

        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: this.method,
          headers: this.headers,
          timeout: this.timeoutValue
        };

        const req = lib.request(options, (res) => {
          this.responseURL = this.url;
          this.status = res.statusCode || 0;
          this.statusText = res.statusMessage || '';
          this.setState(this.HEADERS_RECEIVED);

          // 收集响应头
          const rawHeaders = res.rawHeaders || [];
          for (let i = 0; i < rawHeaders.length; i += 2) {
            this.responseHeaders[rawHeaders[i]] = rawHeaders[i + 1];
          }

          const chunks: Buffer[] = [];

          res.on('data', (chunk) => {
            chunks.push(Buffer.from(chunk));
            this.setState(this.LOADING);
            if (this.onprogress) {
              this.onprogress({
                target: this,
                currentTarget: this,
                loaded: chunks.reduce((acc, c) => acc + c.length, 0),
                lengthComputable: false
              } as any);
            }
          });

          res.on('end', () => {
            const buffer = Buffer.concat(chunks);

            // 根据 responseType 处理响应
            if (this.responseType === 'text' || this.responseType === '') {
              this.responseText = buffer.toString('utf8');
              this.response = this.responseText;
            } else if (this.responseType === 'json') {
              try {
                this.responseText = buffer.toString('utf8');
                this.response = JSON.parse(this.responseText);
              } catch {
                this.response = null;
              }
            } else if (this.responseType === 'arraybuffer') {
              this.response = buffer.buffer.slice(
                buffer.byteOffset,
                buffer.byteOffset + buffer.byteLength
              );
            } else if (this.responseType === 'blob') {
              // 简单处理：将 buffer 转为 Blob mock
              this.response = { size: buffer.length, type: this.getResponseHeader('content-type') || '' };
            } else {
              this.responseText = buffer.toString('utf8');
              this.response = this.responseText;
            }

            this.setState(this.DONE);

            // 触发事件
            if (this.status >= 200 && this.status < 300) {
              if (this.onload) {
                this.onload({ target: this, currentTarget: this } as any);
              }
            } else {
              if (this.onerror) {
                this.onerror({ target: this, currentTarget: this } as any);
              }
            }

            if (this.onloadend) {
              this.onloadend({ target: this, currentTarget: this } as any);
            }
          });
        });

        req.on('error', (err) => {
          console.error('[Tracker] XMLHttpRequest error:', err);
          this.setState(this.DONE);
          if (this.onerror) {
            this.onerror({ target: this, currentTarget: this, error: err } as any);
          }
          if (this.onloadend) {
            this.onloadend({ target: this, currentTarget: this } as any);
          }
        });

        req.on('timeout', () => {
          console.error('[Tracker] XMLHttpRequest timeout:', this.url);
          this.setState(this.DONE);
          if (this.ontimeout) {
            this.ontimeout({ target: this, currentTarget: this } as any);
          }
          if (this.onloadend) {
            this.onloadend({ target: this, currentTarget: this } as any);
          }
        });

        if (this.body) {
          if (typeof this.body === 'string') {
            req.write(this.body);
          } else if (Buffer.isBuffer(this.body)) {
            req.write(this.body);
          } else if (this.body instanceof ArrayBuffer) {
            req.write(Buffer.from(this.body));
          }
        }

        req.end();
      }

      // 添加 timeout 的 getter/setter
      get timeout(): number {
        return this.timeoutValue;
      }

      set timeout(value: number) {
        this.timeoutValue = value;
      }
    },
  };

  // 设置全局 window
  (global as any).window = mockWindow;

  // 同时将 document、navigator 等导出到全局作用域（gs-event-tracker-core 会直接使用这些全局变量）
  // 使用 Object.defineProperty 避免 "only a getter" 错误
  Object.defineProperty(global, 'document', { value: mockWindow.document, writable: true, configurable: true });
  Object.defineProperty(global, 'navigator', { value: mockWindow.navigator, writable: true, configurable: true });
  Object.defineProperty(global, 'location', { value: mockWindow.location, writable: true, configurable: true });
  Object.defineProperty(global, 'history', { value: mockWindow.history, writable: true, configurable: true });
  Object.defineProperty(global, 'localStorage', { value: mockWindow.localStorage, writable: true, configurable: true });
  Object.defineProperty(global, 'screen', { value: mockWindow.screen, writable: true, configurable: true });
  Object.defineProperty(global, 'Event', { value: mockWindow.Event, writable: true, configurable: true });
  Object.defineProperty(global, 'CustomEvent', { value: mockWindow.CustomEvent, writable: true, configurable: true });
  Object.defineProperty(global, 'Image', { value: mockWindow.Image, writable: true, configurable: true });
  Object.defineProperty(global, 'Blob', { value: mockWindow.Blob, writable: true, configurable: true });
}

// 导出 XMLHttpRequest 供其他模块使用
export const { XMLHttpRequest } = (global as any).window;
