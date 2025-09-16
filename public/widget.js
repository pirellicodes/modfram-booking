(function() {
  'use strict';

  // Configuration
  const WIDGET_CONFIG = {
    minHeight: 600,
    maxHeight: 1200,
    resizeThrottle: 100,
    retryAttempts: 3,
    retryDelay: 1000
  };

  // State management
  let iframes = new Map();
  let resizeObservers = new Map();
  let retryTimeouts = new Map();

  /**
   * Initialize widget when DOM is ready
   */
  function initWidget() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createWidgets);
    } else {
      createWidgets();
    }
  }

  /**
   * Create widgets for all script tags with data-schedule-url
   */
  function createWidgets() {
    const scripts = document.querySelectorAll('script[data-schedule-url]');

    scripts.forEach((script, index) => {
      const scheduleUrl = script.getAttribute('data-schedule-url');
      const width = script.getAttribute('data-width') || '100%';
      const height = script.getAttribute('data-height') || 'auto';
      const theme = script.getAttribute('data-theme') || 'auto';

      if (scheduleUrl) {
        createWidget(script, scheduleUrl, { width, height, theme }, index);
      }
    });
  }

  /**
   * Create individual widget
   */
  function createWidget(scriptElement, scheduleUrl, options, index) {
    const widgetId = `modfram-widget-${index}`;

    // Create container
    const container = document.createElement('div');
    container.id = widgetId;
    container.className = 'modfram-booking-widget';
    container.style.cssText = `
      width: ${options.width};
      height: ${options.height === 'auto' ? WIDGET_CONFIG.minHeight + 'px' : options.height};
      min-height: ${WIDGET_CONFIG.minHeight}px;
      max-height: ${WIDGET_CONFIG.maxHeight}px;
      border: none;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      background: #ffffff;
      position: relative;
    `;

    // Apply theme-specific styles
    if (options.theme === 'dark') {
      container.style.background = '#1f2937';
    } else if (options.theme === 'auto') {
      // Auto-detect system theme
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      container.style.background = prefersDark ? '#1f2937' : '#ffffff';
    }

    // Create loading state
    const loader = createLoader();
    container.appendChild(loader);

    // Insert container after script
    scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);

    // Create iframe
    createIframe(container, scheduleUrl, options, widgetId);
  }

  /**
   * Create loading spinner
   */
  function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'modfram-widget-loader';
    loader.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      z-index: 1;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 32px;
      height: 32px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: modfram-spin 1s linear infinite;
    `;

    const text = document.createElement('p');
    text.textContent = 'Loading booking widget...';
    text.style.cssText = `
      margin: 0;
      color: #6b7280;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    // Add CSS animation
    if (!document.getElementById('modfram-widget-styles')) {
      const style = document.createElement('style');
      style.id = 'modfram-widget-styles';
      style.textContent = `
        @keyframes modfram-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .modfram-booking-widget {
          transition: height 0.3s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }

    loader.appendChild(spinner);
    loader.appendChild(text);
    return loader;
  }

  /**
   * Create iframe with retry logic
   */
  function createIframe(container, scheduleUrl, options, widgetId, attemptCount = 0) {
    try {
      const iframe = document.createElement('iframe');
      const iframeId = `${widgetId}-iframe`;

      // Add theme parameter to URL
      const url = new URL(scheduleUrl);
      if (options.theme && options.theme !== 'auto') {
        url.searchParams.set('theme', options.theme);
      }

      iframe.id = iframeId;
      iframe.src = url.toString();
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      `;

      // Security attributes
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allow', 'clipboard-write');
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');

      // Track iframe
      iframes.set(widgetId, iframe);

      // Handle iframe load
      iframe.onload = function() {
        const loader = container.querySelector('.modfram-widget-loader');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => loader.remove(), 300);
        }

        iframe.style.opacity = '1';
        setupMessageListener(widgetId);
        clearRetryTimeout(widgetId);
      };

      // Handle iframe error
      iframe.onerror = function() {
        handleIframeError(container, scheduleUrl, options, widgetId, attemptCount);
      };

      // Add timeout for loading
      setTimeout(() => {
        if (iframe.style.opacity === '0') {
          handleIframeError(container, scheduleUrl, options, widgetId, attemptCount);
        }
      }, 10000); // 10 second timeout

      container.appendChild(iframe);

    } catch (error) {
      console.error('Error creating iframe:', error);
      handleIframeError(container, scheduleUrl, options, widgetId, attemptCount);
    }
  }

  /**
   * Handle iframe loading errors with retry logic
   */
  function handleIframeError(container, scheduleUrl, options, widgetId, attemptCount) {
    if (attemptCount < WIDGET_CONFIG.retryAttempts) {
      console.warn(`Widget loading failed, retrying... (${attemptCount + 1}/${WIDGET_CONFIG.retryAttempts})`);

      // Remove failed iframe
      const existingIframe = container.querySelector('iframe');
      if (existingIframe) {
        existingIframe.remove();
      }

      // Retry after delay
      const timeoutId = setTimeout(() => {
        createIframe(container, scheduleUrl, options, widgetId, attemptCount + 1);
      }, WIDGET_CONFIG.retryDelay * (attemptCount + 1));

      retryTimeouts.set(widgetId, timeoutId);
    } else {
      showErrorState(container);
    }
  }

  /**
   * Show error state when all retries fail
   */
  function showErrorState(container) {
    const loader = container.querySelector('.modfram-widget-loader');
    if (loader) {
      loader.innerHTML = `
        <div style="
          padding: 24px;
          text-align: center;
          color: #ef4444;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="font-size: 18px; margin-bottom: 8px;">⚠️</div>
          <div style="font-weight: 600; margin-bottom: 4px;">Unable to load booking widget</div>
          <div style="font-size: 14px; color: #6b7280;">Please refresh the page or try again later</div>
        </div>
      `;
    }
  }

  /**
   * Setup message listener for iframe communication
   */
  function setupMessageListener(widgetId) {
    const messageHandler = function(event) {
      const iframe = iframes.get(widgetId);
      if (!iframe) return;

      // Verify origin (in production, check against your domain)
      // if (!event.origin.includes('your-domain.com')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data.type === 'resize' && data.height) {
          resizeWidget(widgetId, data.height);
        }
      } catch (error) {
        // Ignore invalid messages
      }
    };

    window.addEventListener('message', messageHandler);

    // Store handler for cleanup if needed
    iframe.messageHandler = messageHandler;
  }

  /**
   * Resize widget with smooth animation
   */
  function resizeWidget(widgetId, newHeight) {
    const iframe = iframes.get(widgetId);
    if (!iframe) return;

    const container = iframe.closest('.modfram-booking-widget');
    if (!container) return;

    // Clamp height within bounds
    const clampedHeight = Math.max(
      WIDGET_CONFIG.minHeight,
      Math.min(WIDGET_CONFIG.maxHeight, newHeight + 20) // Add padding
    );

    // Throttle resize events
    const resizeObserver = resizeObservers.get(widgetId);
    if (resizeObserver) {
      clearTimeout(resizeObserver);
    }

    const timeoutId = setTimeout(() => {
      container.style.height = clampedHeight + 'px';
      resizeObservers.delete(widgetId);
    }, WIDGET_CONFIG.resizeThrottle);

    resizeObservers.set(widgetId, timeoutId);
  }

  /**
   * Clear retry timeout
   */
  function clearRetryTimeout(widgetId) {
    const timeoutId = retryTimeouts.get(widgetId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      retryTimeouts.delete(widgetId);
    }
  }

  /**
   * Cleanup function for removing widgets
   */
  function cleanup() {
    // Clear all timeouts
    retryTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    resizeObservers.forEach(timeoutId => clearTimeout(timeoutId));

    // Remove message listeners
    iframes.forEach(iframe => {
      if (iframe.messageHandler) {
        window.removeEventListener('message', iframe.messageHandler);
      }
    });

    // Clear maps
    iframes.clear();
    resizeObservers.clear();
    retryTimeouts.clear();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // Initialize widget
  initWidget();

  // Expose API for manual widget creation
  window.ModFramWidget = {
    create: function(element, scheduleUrl, options = {}) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }

      if (!element || !scheduleUrl) {
        console.error('ModFramWidget.create: Invalid element or scheduleUrl');
        return;
      }

      const widgetId = `modfram-widget-${Date.now()}`;
      const defaults = { width: '100%', height: 'auto', theme: 'auto' };
      const config = Object.assign(defaults, options);

      createWidget(element, scheduleUrl, config, widgetId);
      return widgetId;
    },

    destroy: function(widgetId) {
      const iframe = iframes.get(widgetId);
      if (iframe) {
        const container = iframe.closest('.modfram-booking-widget');
        if (container) {
          container.remove();
        }
        iframes.delete(widgetId);
        clearRetryTimeout(widgetId);
      }
    }
  };

})();
