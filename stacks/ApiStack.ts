import { Bundling } from './../packages/nodejs-layer/lib/bundling'
import * as cdk from 'aws-cdk-lib'
import type { Construct } from 'constructs'
import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { NodejsLayer } from 'nodejs-layer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const graphqlApi = new appsync.GraphqlApi(this, 'AppSyncApiStack', {
      name: 'appsync-api',
      definition: appsync.Definition.fromFile(
        path.join(__dirname, './graphql/schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY
        }
      }
    })

    const mathLayer = new NodejsLayer(this, 'MathLayer', {
      entry: path.join(__dirname, './packages/layers/math/math.ts'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Math layer'
    })

    // const loggerLayer = new NodejsLayer(this, 'Logger', {
    //   code: lambda.Code.fromAsset(
    //     path.join(__dirname, './packages/layers/logger')
    //   ),
    //   // entry: path.join(__dirname, './packages/layers/logger/index.ts'),
    //   compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
    //   description: 'Logger layer'
    // })

    const postLambdaFn = new NodejsFunction(this, 'PostLambdaFn', {
      functionName: 'posts-lambda',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, './packages/functions/src/index.ts'),
      awsSdkConnectionReuse: true,
      layers: [mathLayer],
      depsLockFilePath: './pnpm-lock.yaml',
      bundling: {
        externalModules: ['aws-sdk', 'math', 'logger'],
        tsconfig: './packages/functions/tsconfig.json'
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
