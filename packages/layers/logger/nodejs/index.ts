import pino from 'pino'
import { lambdaRequestTracker, pinoLambdaDestination } from 'pino-lambda'

const destination = pinoLambdaDestination()

export const logger = pino(
  {
    redact: {
      paths: ['email', 'password', '*.address', '*.email', '*.password'],
      censor: '**REDACTED**'
    },
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  },
  destination
)

export const withRequest = lambdaRequestTracker()
