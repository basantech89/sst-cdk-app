import { SSTConfig } from 'sst'
import ApiStack from './stacks/ApiStack'

const env = { region: 'us-east-1' }

export default {
  config(_input) {
    return {
      name: 'sst-app',
      region: 'us-east-1'
    }
  },
  stacks(app) {
    new ApiStack(app, `${app.stage}-sst-app-api`, { env })
  }
} satisfies SSTConfig
