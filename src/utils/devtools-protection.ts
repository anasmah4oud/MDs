(() => {
  'use strict';

  // منع Right Click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // منع اختصارات DevTools
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Ctrl + Shift + I
    if (e.ctrlKey && e.shiftKey && key === 'i') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Ctrl + Shift + J
    if (e.ctrlKey && e.shiftKey && key === 'j') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Ctrl + Shift + C
    if (e.ctrlKey && e.shiftKey && key === 'c') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Ctrl + U
    if (e.ctrlKey && key === 'u') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }, true);

  // محاولة كشف DevTools
  let devToolsOpen = false;

  const checkDevTools = () => {
    const threshold = 160;

    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    const detected =
      widthDiff > threshold ||
      heightDiff > threshold;

    if (detected && !devToolsOpen) {
      devToolsOpen = true;

      document.body.innerHTML = `
        <div style="
          position:fixed;
          inset:0;
          background:#0b0b0b;
          color:white;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-direction:column;
          font-family:Arial,sans-serif;
          z-index:999999999;
          text-align:center;
        ">
          <div style="font-size:60px;margin-bottom:20px;">⚠️</div>

          <h1 style="margin:0 0 10px;">
            Developer Tools Detected
          </h1>

          <p style="opacity:.7;">
            Please close Developer Tools to continue.
          </p>
        </div>
      `;
    }

    if (!detected && devToolsOpen) {
      window.location.reload();
    }
  };

  setInterval(checkDevTools, 1000);

  // منع بعض أساليب فتح Console
  const noop = () => {};

  try {
    Object.defineProperty(window, 'debugger', {
      value: noop,
      configurable: false
    });
  } catch {}

})();
