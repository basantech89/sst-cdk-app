/// <reference types="node" />
/// <reference types="node" />
import { SpawnSyncOptions } from 'child_process';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
export interface CallSite {
    getThis(): any;
    getTypeName(): string;
    getFunctionName(): string;
    getMethodName(): string;
    getFileName(): string;
    getLineNumber(): number;
    getColumnNumber(): number;
    getFunction(): Function;
    getEvalOrigin(): string;
    isNative(): boolean;
    isToplevel(): boolean;
    isEval(): boolean;
    isConstructor(): boolean;
}
/**
 * Get callsites from the V8 stack trace API
 *
 * https://github.com/sindresorhus/callsites
 */
export declare function callsites(): CallSite[];
/**
 * Find a file by walking up parent directories
 */
export declare function findUp(name: string, directory?: string): string | undefined;
/**
 * Find the lowest of multiple files by walking up parent directories. If
 * multiple files exist at the same level, they will all be returned.
 */
export declare function findUpMultiple(names: string[], directory?: string): string[];
/**
 * Spawn sync with error handling
 */
export declare function exec(cmd: string, args: string[], options?: SpawnSyncOptions): import("child_process").SpawnSyncReturns<string | Buffer>;
/**
 * Returns a module version by requiring its package.json file
 */
export declare function tryGetModuleVersionFromRequire(mod: string): string | undefined;
/**
 * Gets module version from package.json content
 */
export declare function tryGetModuleVersionFromPkg(mod: string, pkgJson: {
    [key: string]: any;
}, pkgPath: string): string | undefined;
/**
 * Extract versions for a list of modules.
 *
 * First lookup the version in the package.json and then fallback to requiring
 * the module's package.json. The fallback is needed for transitive dependencies.
 */
export declare function extractDependencies(pkgPath: string, modules: string[]): {
    [key: string]: string;
};
export declare function getTsconfigCompilerOptions(tsconfigPath: string): string;
/**
 * Detect if a given Node.js runtime uses SDKv2
 */
export declare function isSdkV2Runtime(runtime: Runtime): boolean;
