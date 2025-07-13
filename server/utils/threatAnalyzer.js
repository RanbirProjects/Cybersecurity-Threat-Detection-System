const moment = require('moment');

// Brute-force detection: Detects rapid failed login attempts from the same IP or user
function detectBruteForce(logs, { windowMinutes = 5, maxAttempts = 5 } = {}) {
  const now = moment();
  const recentLogs = logs.filter(log =>
    log.type === 'login_failed' &&
    moment(log.timestamp).isAfter(now.clone().subtract(windowMinutes, 'minutes'))
  );
  const attemptsByIp = {};
  recentLogs.forEach(log => {
    attemptsByIp[log.sourceIp] = (attemptsByIp[log.sourceIp] || 0) + 1;
  });
  const suspiciousIps = Object.entries(attemptsByIp)
    .filter(([ip, count]) => count >= maxAttempts)
    .map(([ip]) => ip);
  return suspiciousIps;
}

// SQL Injection detection: Looks for common SQLi patterns in input
function detectSQLInjection(input) {
  const sqliPatterns = [
    /('|%27)\s*or\s*('|%27)?\d+=\d+/i,
    /('|%27)\s*--/i,
    /union(\s+all)?\s+select/i,
    /select\s+.*\s+from/i,
    /insert\s+into/i,
    /drop\s+table/i,
    /update\s+.*\s+set/i,
    /delete\s+from/i,
    /;\s*shutdown/i,
    /information_schema/i
  ];
  return sqliPatterns.some(pattern => pattern.test(input));
}

// XSS detection: Looks for common XSS payloads in input
function detectXSS(input) {
  const xssPatterns = [
    /<script.*?>.*?<\/script>/i,
    /onerror\s*=\s*['"]/i,
    /onload\s*=\s*['"]/i,
    /<img\s+.*?src=['"][^'"]*['"].*?>/i,
    /<iframe.*?>.*?<\/iframe>/i,
    /javascript:/i,
    /document\.cookie/i,
    /<svg.*?on\w+=/i
  ];
  return xssPatterns.some(pattern => pattern.test(input));
}

// Main analysis function
function analyzeLog(log, recentLogs = []) {
  let detected = [];
  // Brute-force
  const bruteForceIps = detectBruteForce(recentLogs);
  if (bruteForceIps.includes(log.sourceIp)) {
    detected.push('brute_force');
  }
  // SQLi
  if (log.body && typeof log.body === 'string' && detectSQLInjection(log.body)) {
    detected.push('sql_injection');
  }
  // XSS
  if (log.body && typeof log.body === 'string' && detectXSS(log.body)) {
    detected.push('xss');
  }
  return detected;
}

module.exports = {
  detectBruteForce,
  detectSQLInjection,
  detectXSS,
  analyzeLog
}; 