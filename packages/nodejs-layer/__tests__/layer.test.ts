import { Capture, Match, Template } from 'aws-cdk-lib/assertions'
import * as cdk from 'aws-cdk-lib'
import TestStack from './TestStack'

describe('NodeJSLayer', () => {
  test('builds the typescript layer', () => {
    const app = new cdk.App()

    const apiStack = new TestStack(app, 'ApiStack')
    const template = Template.fromStack(apiStack)
  })
})
