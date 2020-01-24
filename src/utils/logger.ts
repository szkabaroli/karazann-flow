import { createLogger, transports, format, config } from 'winston'

const { combine } = format
const { Console } = transports

/**
 * Error Levels
 * DEBUG     (7) Debug or trace information.
 * INFO      (6) Routine information, such as ongoing status or performance.
 * NOTICE    (5) Normal but significant events, such as start up, shut down, or a configuration change.
 * WARNING   (4) Warning events might cause problems.
 * ERROR     (3) Error events are likely to cause problems.
 * CRITICAL  (2) Critical events cause more severe problems or outages.
 * ALERT     (1) A person must take an action immediately.
 * EMERGENCY (0) One or more systems are unusable.
 */

const development = combine(
    format.timestamp(),
    format.colorize({ all: true }),
    format.printf((info: any) => {
        const { timestamp, level, message, ...args } = info

        const ts = timestamp.slice(0, 19).replace('T', ' ')
        return `${ts} ${'karazann-flow-prcessor'}: [${level}] ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`
    })
)

export const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels: config.syslog.levels,
    format: development,
    transports: [new Console()]
})
