import * as cdk from 'aws-cdk-lib'
import type { Construct } from 'constructs'
import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import path from 'path'
import { LogLevel, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { NodejsLayer } from '../lib'

export default class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const graphqlApi = new appsync.GraphqlApi(this, 'AppSyncApiStack', {
      name: 'appsync-api',
      definition: appsync.Definition.fromFile(
        path.join(__dirname, './schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY
        }
      }
    })

    const mathLayer = new NodejsLayer(this, 'MathLayer', {
      entry: path.join(__dirname, './layers/math/index.ts'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Math layer'
    })

    const loggerLayer = new NodejsLayer(this, 'Logger', {
      entry: path.join(__dirname, './layers/logger/index.ts'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Logger layer'
    })

    const postLambdaFn = new NodejsFunction(this, 'PostLambdaFn', {
      functionName: 'posts-lambda',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, './function.ts'),
      awsSdkConnectionReuse: true,
      layers: [mathLayer, loggerLayer],
      // depsLockFilePath: './pnpm-lock.yaml',
      bundling: {
        externalModules: ['aws-sdk', 'math', 'logger'],
        logLevel: LogLevel.VERBOSE
        // tsconfig: './packages/functions/tsconfig.json'
      }
    })

    const lambdaDataSource = graphqlApi.addLambdaDataSource(
      'postsLambdaDataSource',
      postLambdaFn
    )

    lambdaDataSource.createResolver('getPosts', {
      typeName: 'Query',
      fieldName: 'getPosts'
    })

    lambdaDataSource.createResolver('createPost', {
      typeName: 'Mutation',
      fieldName: 'createPost'
    })

    new cdk.CfnOutput(this, 'GraphQLApiUrl', {
      value: graphqlApi.graphqlUrl
    })

    new cdk.CfnOutput(this, 'GraphQLApiKey', {
      value: graphqlApi.apiKey || ''
    })

    new cdk.CfnOutput(this, 'Stack Region', {
      value: this.region
    })
  }
}
