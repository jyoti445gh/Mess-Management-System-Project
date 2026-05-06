const levels = { ERROR: '❌', WARN: '⚠️ ', INFO: 'ℹ️ ', SUCCESS: '✅' }

const log = (level, message, data = '') => {
  const time = new Date().toLocaleTimeString()
  const prefix = levels[level] || 'ℹ️ '
  if (data) {
    console.log(`[${time}] ${prefix} ${message}`, data)
  } else {
    console.log(`[${time}] ${prefix} ${message}`)
  }
}

export const logger = {
  info:    (msg, data) => log('INFO',    msg, data),
  success: (msg, data) => log('SUCCESS', msg, data),
  warn:    (msg, data) => log('WARN',    msg, data),
  error:   (msg, data) => log('ERROR',   msg, data),
}
