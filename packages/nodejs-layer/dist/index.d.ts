import { LayerVersion, LayerVersionProps } from 'aws-cdk-lib/aws-lambda';
import { BundlingOptions } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
interface NodejsLayerProps extends Omit<LayerVersionProps, 'code'> {
    readonly bundling?: BundlingOptions;
    readonly entry: string;
    readonly depsLockFilePath?: string;
    readonly projectRoot?: string;
}
export declare class NodejsLayer extends LayerVersion {
    constructor(scope: Construct, id: string, props: NodejsLayerProps);
}
export {};
