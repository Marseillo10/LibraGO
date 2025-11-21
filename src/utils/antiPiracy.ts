/**
 * Anti-Piracy Protection System for LibraGO
 * Multi-layered security to prevent unauthorized distribution
 */

export interface UserSession {
  userId: string;
  userName: string;
  userEmail: string;
  deviceId: string;
  sessionId: string;
  timestamp: number;
  isPremium: boolean;
}

export interface WatermarkConfig {
  userName: string;
  userEmail: string;
  deviceId: string;
  timestamp: string;
  bookId: string;
  sessionId: string;
}

/**
 * Generate unique device fingerprint
 * Combines multiple browser/device characteristics
 */
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprinting
  let canvasFingerprint = '';
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('LibraGO', 2, 2);
    canvasFingerprint = canvas.toDataURL().slice(-50);
  }
  
  // Combine various browser characteristics
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasFingerprint,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0,
  };
  
  // Create hash from fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  return btoa(fingerprintString).slice(0, 32);
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create dynamic watermark text
 */
export function createWatermark(config: WatermarkConfig): string {
  const { userName, userEmail, deviceId, timestamp, bookId, sessionId } = config;
  
  // Create multi-line watermark
  const watermarkLines = [
    `Licensed to: ${userName}`,
    `Email: ${userEmail}`,
    `Device: ${deviceId.slice(0, 8)}...${deviceId.slice(-4)}`,
    `Time: ${timestamp}`,
    `Book: ${bookId}`,
    `Session: ${sessionId.slice(0, 12)}`,
    `© LibraGO Premium - Unauthorized distribution is illegal`,
  ];
  
  return watermarkLines.join(' • ');
}

/**
 * Detect screenshot attempts (limited browser support)
 */
export function detectScreenshot(callback: () => void): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Common screenshot shortcuts
    const isScreenshot = 
      // Windows: PrtScn, Alt+PrtScn, Win+PrtScn
      e.key === 'PrintScreen' ||
      // Mac: Cmd+Shift+3, Cmd+Shift+4
      (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) ||
      // Windows Snipping Tool: Win+Shift+S
      (e.metaKey && e.shiftKey && e.key === 's');
    
    if (isScreenshot) {
      callback();
      e.preventDefault();
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => document.removeEventListener('keydown', handleKeyDown);
}

/**
 * Prevent right-click context menu
 */
export function preventRightClick(): () => void {
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    return false;
  };
  
  document.addEventListener('contextmenu', handleContextMenu);
  
  return () => document.removeEventListener('contextmenu', handleContextMenu);
}

/**
 * Prevent text selection (for premium content)
 */
export function preventTextSelection(): () => void {
  const style = document.createElement('style');
  style.textContent = `
    .anti-piracy-protected {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  `;
  document.head.appendChild(style);
  
  return () => document.head.removeChild(style);
}

/**
 * Check if running in development mode
 */
export function isDevelopmentMode(): boolean {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('stackblitz') ||
    window.location.hostname.includes('webcontainer')
  );
}

/**
 * Detect DevTools opening (with throttling)
 */
export function detectDevTools(callback: () => void): () => void {
  const threshold = 160;
  let isDevToolsOpen = false;
  let lastCallbackTime = 0;
  const THROTTLE_TIME = 60000; // Only callback once per minute
  
  const check = () => {
    // Skip in development mode
    if (isDevelopmentMode()) {
      return;
    }
    
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? 'vertical' : 'horizontal';
    
    if (!(heightThreshold && widthThreshold) && 
        ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || 
         widthThreshold || heightThreshold)) {
      if (!isDevToolsOpen) {
        isDevToolsOpen = true;
        
        // Throttle callback
        const now = Date.now();
        if (now - lastCallbackTime > THROTTLE_TIME) {
          lastCallbackTime = now;
          callback();
        }
      }
    } else {
      isDevToolsOpen = false;
    }
  };
  
  const interval = setInterval(check, 5000); // Check every 5 seconds instead of 1
  
  return () => clearInterval(interval);
}

/**
 * Prevent copy-paste
 */
export function preventCopyPaste(): () => void {
  const handleCopy = (e: ClipboardEvent) => {
    e.preventDefault();
    return false;
  };
  
  const handleCut = (e: ClipboardEvent) => {
    e.preventDefault();
    return false;
  };
  
  document.addEventListener('copy', handleCopy);
  document.addEventListener('cut', handleCut);
  
  return () => {
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('cut', handleCut);
  };
}

/**
 * Track reading session for analytics
 */
export function trackReadingSession(session: UserSession) {
  const sessionData = {
    ...session,
    startTime: Date.now(),
  };
  
  // Store in sessionStorage (would be sent to backend in production)
  sessionStorage.setItem('reading_session', JSON.stringify(sessionData));
  
  // Only log in production mode
  if (!isDevelopmentMode()) {
    console.log('[Anti-Piracy] Reading session started:', sessionData);
  }
}

/**
 * Validate session integrity
 */
export function validateSession(session: UserSession): boolean {
  // Check if session is not expired (24 hours)
  const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours
  const sessionAge = Date.now() - session.timestamp;
  
  if (sessionAge > MAX_SESSION_AGE) {
    console.warn('[Anti-Piracy] Session expired');
    return false;
  }
  
  // Verify device fingerprint matches
  const currentDeviceId = generateDeviceFingerprint();
  if (currentDeviceId !== session.deviceId) {
    console.warn('[Anti-Piracy] Device fingerprint mismatch');
    return false;
  }
  
  return true;
}

/**
 * Create invisible watermark overlay
 */
export function createWatermarkOverlay(config: WatermarkConfig): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.className = 'watermark-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `;
  
  // Create multiple watermark instances
  const watermarkText = createWatermark(config);
  const watermarkCount = 20;
  
  for (let i = 0; i < watermarkCount; i++) {
    const watermark = document.createElement('div');
    watermark.textContent = watermarkText;
    watermark.style.cssText = `
      position: absolute;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.05);
      transform: rotate(-45deg);
      white-space: nowrap;
      user-select: none;
      pointer-events: none;
    `;
    
    // Random positioning
    watermark.style.top = `${(i * 10) % 100}%`;
    watermark.style.left = `${(i * 15) % 100}%`;
    
    overlay.appendChild(watermark);
  }
  
  return overlay;
}

/**
 * Monitor for suspicious activity (with throttling)
 */
export function monitorSuspiciousActivity(callback: (activity: string) => void): () => void {
  let copyAttempts = 0;
  let rightClickAttempts = 0;
  let screenshotAttempts = 0;
  let lastLogTime = 0;
  const LOG_THROTTLE = 30000; // Only log once per 30 seconds
  
  const throttledCallback = (activity: string) => {
    // Skip in development mode
    if (isDevelopmentMode()) {
      return;
    }
    
    const now = Date.now();
    if (now - lastLogTime > LOG_THROTTLE) {
      lastLogTime = now;
      callback(activity);
    }
  };
  
  const handleCopy = () => {
    copyAttempts++;
    if (copyAttempts > 5) { // Increased threshold
      throttledCallback(`Multiple copy attempts detected (${copyAttempts})`);
    }
  };
  
  const handleContextMenu = () => {
    rightClickAttempts++;
    if (rightClickAttempts > 10) { // Increased threshold
      throttledCallback(`Multiple right-click attempts detected (${rightClickAttempts})`);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey)) {
      screenshotAttempts++;
      if (screenshotAttempts > 2) { // Only log after multiple attempts
        throttledCallback(`Screenshot attempt detected (${screenshotAttempts})`);
      }
    }
  };
  
  document.addEventListener('copy', handleCopy);
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Encrypt content (simple obfuscation for demo)
 * In production, use proper encryption
 */
export function obfuscateContent(content: string, key: string): string {
  let result = '';
  for (let i = 0; i < content.length; i++) {
    result += String.fromCharCode(
      content.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result);
}

/**
 * Decrypt content
 */
export function deobfuscateContent(obfuscated: string, key: string): string {
  const decoded = atob(obfuscated);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(
      decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * Check if user is accessing from authorized location (mock)
 */
export function validateAccessLocation(): Promise<boolean> {
  return new Promise((resolve) => {
    // In production, check against allowed IP ranges, geo-location, etc.
    // For now, always return true
    setTimeout(() => resolve(true), 100);
  });
}

/**
 * Generate time-limited access token
 */
export function generateAccessToken(userId: string, bookId: string, duration: number): string {
  const expiresAt = Date.now() + duration;
  const tokenData = {
    userId,
    bookId,
    expiresAt,
    random: Math.random().toString(36),
  };
  return btoa(JSON.stringify(tokenData));
}

/**
 * Validate access token
 */
export function validateAccessToken(token: string): boolean {
  try {
    const tokenData = JSON.parse(atob(token));
    return tokenData.expiresAt > Date.now();
  } catch {
    return false;
  }
}

/**
 * Disable browser features during reading
 */
export function disableBrowserFeatures(): () => void {
  const cleanups: Array<() => void> = [];
  
  // Disable text selection
  cleanups.push(preventTextSelection());
  
  // Disable right-click
  cleanups.push(preventRightClick());
  
  // Disable copy-paste
  cleanups.push(preventCopyPaste());
  
  // Disable drag
  const handleDragStart = (e: DragEvent) => e.preventDefault();
  document.addEventListener('dragstart', handleDragStart);
  cleanups.push(() => document.removeEventListener('dragstart', handleDragStart));
  
  // Disable inspect element (F12, Ctrl+Shift+I, etc.)
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I (Inspector)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C (Inspector)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  cleanups.push(() => document.removeEventListener('keydown', handleKeyDown));
  
  // Return cleanup function
  return () => cleanups.forEach(cleanup => cleanup());
}

/**
 * Log piracy attempt to server (mock)
 */
export function logPiracyAttempt(
  userId: string, 
  type: 'screenshot' | 'copy' | 'devtools' | 'suspicious',
  details: string
) {
  // Skip logging in development mode
  if (isDevelopmentMode()) {
    return;
  }
  
  const log = {
    userId,
    type,
    details,
    timestamp: new Date().toISOString(),
    deviceId: generateDeviceFingerprint(),
    userAgent: navigator.userAgent,
  };
  
  console.warn('[Anti-Piracy] Piracy attempt logged:', log);
  
  // In production, send to server
  // fetch('/api/anti-piracy/log', {
  //   method: 'POST',
  //   body: JSON.stringify(log),
  // });
}

/**
 * Initialize complete anti-piracy protection
 * @param session - User session information
 * @param options - Configuration options
 */
export function initAntiPiracy(
  session: UserSession,
  options: {
    enableLogging?: boolean;
    strictMode?: boolean;
  } = {}
): () => void {
  const { enableLogging = true, strictMode = false } = options;
  const cleanups: Array<() => void> = [];
  const isDev = isDevelopmentMode();
  
  // Only log in production or if explicitly enabled
  if (enableLogging && !isDev) {
    console.log('[Anti-Piracy] Protection activated for:', session.userName);
  }
  
  // Track session
  trackReadingSession(session);
  
  // Detect screenshots
  cleanups.push(detectScreenshot(() => {
    if (enableLogging) {
      logPiracyAttempt(session.userId, 'screenshot', 'Screenshot key detected');
    }
  }));
  
  // Detect DevTools (only in production or strict mode)
  if (!isDev || strictMode) {
    cleanups.push(detectDevTools(() => {
      if (enableLogging) {
        logPiracyAttempt(session.userId, 'devtools', 'Developer tools opened');
      }
    }));
  }
  
  // Monitor suspicious activity
  cleanups.push(monitorSuspiciousActivity((activity) => {
    if (enableLogging) {
      logPiracyAttempt(session.userId, 'suspicious', activity);
    }
  }));
  
  // Disable browser features (only in production or strict mode)
  if (!isDev || strictMode) {
    cleanups.push(disableBrowserFeatures());
  }
  
  // Return cleanup function
  return () => {
    if (enableLogging && !isDev) {
      console.log('[Anti-Piracy] Protection deactivated');
    }
    cleanups.forEach(cleanup => cleanup());
  };
}

declare global {
  interface Window {
    Firebug?: any;
  }
}
