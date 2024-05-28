import type { AppSyncResolverEvent, Handler } from 'aws-lambda'
const { exec } = require('child_process')
import { add } from 'math'

const executeCommand = (command: string) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
      return
    }

    console.log('output of command', command)
    console.log(`stdout: ${stdout}`)
  })
}

export const handler: Handler<AppSyncResolverEvent<unknown, unknown>> = (
  event,
  context
) => {
  executeCommand('ls /opt')

  // withRequest(event, context)
  // const uuid = uuidv4()

  const addition = add(1, 2)
  console.log('addigtion is ', addition)

  // logger.info('11event123', obj)
  // logger.info(obj)
  // logger.info(`event is ${obj}`)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world'
    })
  }
}
