import * as cdk from 'aws-cdk-lib'
import type { Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

export default class StorageStack extends cdk.Stack {
  private readonly table: dynamodb.Table

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const table = new dynamodb.Table(this, 'PostsTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: 'posts'
    })

    this.table = table
  }
}
