// src/utils/devtools-protection.ts

(() => {
  'use strict';

  // منع تشغيل الملف أكثر من مرة
  const GLOBAL_KEY = '__DEVTOOLS_PROTECTION_INITIALIZED__';

  const win = window as Window & {
    [GLOBAL_KEY]?: boolean;
  };

  if (win[GLOBAL_KEY]) {
    return;
  }

  win[GLOBAL_KEY] = true;

  // =========================================================
  // Configuration
  // =========================================================

  const CONFIG = {
    // حجم الفرق الذي يعتبر مؤشرًا على DevTools
    detectionThreshold: 160,

    // مدة إعادة الفحص
    checkInterval: 1000,

    // منع Right Click
    blockContextMenu: true,

    // منع اختصارات DevTools
    blockDevToolsShortcuts: true,

    // إظهار شاشة عند اكتشاف DevTools
    showOverlay: true,
  };

  // =========================================================
  // State
  // =========================================================

  let devToolsDetected = false;
  let overlay: HTMLDivElement | null = null;
  let intervalId: number | null = null;

  // =========================================================
  // Helpers
  // =========================================================

  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);

  const createOverlay = (): HTMLDivElement => {
    const element = document.createElement('div');

    element.id = 'devtools-protection-overlay';

    Object.assign(element.style, {
      position: 'fixed',
      inset: '0',
      width: '100%',
      height: '100%',
      background: '#0b0b0b',
      color: '#ffffff',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily:
        'Arial, Helvetica, sans-serif',
      textAlign: 'center',
      zIndex: '2147483647',
      padding: '24px',
      boxSizing: 'border-box',
    });

    element.innerHTML = `
      <div
        style="
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          max-width:600px;
        "
      >
        <div
          style="
            font-size:64px;
            line-height:1;
            margin-bottom:24px;
          "
          aria-hidden="true"
        >
          ⚠️
        </div>

        <h1
          style="
            margin:0 0 12px;
            font-size:32px;
            font-weight:700;
            color:#ffffff;
          "
        >
          Developer Tools Detected
        </h1>

        <p
          style="
            margin:0;
            font-size:17px;
            line-height:1.7;
            color:rgba(255,255,255,.72);
          "
        >
          Please close Developer Tools to continue.
        </p>
      </div>
    `;

    return element;
  };

  const ensureOverlay = () => {
    if (!CONFIG.showOverlay) {
      return;
    }

    if (!overlay) {
      overlay = createOverlay();
    }

    if (!overlay.isConnected) {
      document.documentElement.appendChild(overlay);
    }
  };

  const showOverlay = () => {
    if (!CONFIG.showOverlay) {
      return;
    }

    ensureOverlay();

    if (overlay) {
      overlay.style.display = 'flex';
    }

    document.documentElement.style.overflow = 'hidden';
  };

  const hideOverlay = () => {
    if (overlay) {
      overlay.style.display = 'none';
    }

    document.documentElement.style.overflow = '';
  };

  // =========================================================
  // Keyboard Protection
  // =========================================================

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!CONFIG.blockDevToolsShortcuts) {
      return;
    }

    const key = event.key.toLowerCase();

    const ctrlOrCmd = isMac
      ? event.metaKey
      : event.ctrlKey;

    // F12
    if (event.key === 'F12') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Ctrl + Shift + I
    // Cmd + Option + I على Mac
    if (
      ctrlOrCmd &&
      event.shiftKey &&
      key === 'i'
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Ctrl + Shift + J
    // Cmd + Option + J على Mac
    if (
      ctrlOrCmd &&
      event.shiftKey &&
      key === 'j'
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Ctrl + Shift + C
    // Cmd + Option + C على Mac
    if (
      ctrlOrCmd &&
      event.shiftKey &&
      key === 'c'
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Ctrl + U
    if (
      ctrlOrCmd &&
      key === 'u'
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Ctrl + Shift + K - Firefox Console
    if (
      ctrlOrCmd &&
      event.shiftKey &&
      key === 'k'
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  };

  // =========================================================
  // Right Click Protection
  // =========================================================

  const handleContextMenu = (event: MouseEvent) => {
    if (!CONFIG.blockContextMenu) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  // =========================================================
  // DevTools Detection
  // =========================================================

  const detectByWindowSize = (): boolean => {
    const widthDifference =
      window.outerWidth - window.innerWidth;

    const heightDifference =
      window.outerHeight - window.innerHeight;

    return (
      widthDifference >
        CONFIG.detectionThreshold ||
      heightDifference >
        CONFIG.detectionThreshold
    );
  };

  const detectByScreenSize = (): boolean => {
    const widthDifference =
      window.outerWidth - document.documentElement.clientWidth;

    const heightDifference =
      window.outerHeight - document.documentElement.clientHeight;

    return (
      widthDifference >
        CONFIG.detectionThreshold ||
      heightDifference >
        CONFIG.detectionThreshold
    );
  };

  const isDevToolsOpen = (): boolean => {
    // الطريقة الأساسية
    if (detectByWindowSize()) {
      return true;
    }

    // طريقة إضافية
    if (detectByScreenSize()) {
      return true;
    }

    return false;
  };

  // =========================================================
  // Protection State
  // =========================================================

  const setProtectionState = (
    detected: boolean
  ) => {
    if (detected === devToolsDetected) {
      return;
    }

    devToolsDetected = detected;

    if (detected) {
      showOverlay();
    } else {
      hideOverlay();
    }
  };

  const checkDevTools = () => {
    try {
      const detected = isDevToolsOpen();

      setProtectionState(detected);
    } catch {
      // لا نسمح للحماية بكسر الموقع
    }
  };

  // =========================================================
  // Prevent Debugger Property Tricks
  // =========================================================

  /*
   * لا نحاول تعديل window.debugger لأن:
   *
   * debugger
   *
   * عبارة JavaScript محجوزة وليست property يمكن تعطيلها
   * بهذه الطريقة.
   *
   * لذلك لا نستخدم Object.defineProperty(window, 'debugger').
   */

  // =========================================================
  // Initialization
  // =========================================================

  const initialize = () => {
    document.addEventListener(
      'keydown',
      handleKeyDown,
      true
    );

    document.addEventListener(
      'contextmenu',
      handleContextMenu,
      true
    );

    // إنشاء الـ Overlay فقط عند الحاجة
    // حتى لا نتدخل في DOM الخاص بـ React بدون داعٍ.

    intervalId = window.setInterval(
      checkDevTools,
      CONFIG.checkInterval
    );

    // فحص أولي
    checkDevTools();
  };

  // =========================================================
  // Safe DOM Ready
  // =========================================================

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }

  // =========================================================
  // Cleanup API
  // =========================================================

  /*
   * متاح داخليًا لو احتجت مستقبلاً تعطيل الحماية
   * أثناء الاختبار.
   */

  const cleanup = () => {
    document.removeEventListener(
      'keydown',
      handleKeyDown,
      true
    );

    document.removeEventListener(
      'contextmenu',
      handleContextMenu,
      true
    );

    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }

    if (overlay) {
      overlay.remove();
      overlay = null;
    }

    document.documentElement.style.overflow = '';

    win[GLOBAL_KEY] = false;
  };

  const protectionWindow = window as Window & {
    __DEVTOOLS_PROTECTION_CLEANUP__?: () => void;
  };

  protectionWindow.__DEVTOOLS_PROTECTION_CLEANUP__ =
    cleanup;
})();
