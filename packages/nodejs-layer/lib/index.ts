import {
  LayerVersion,
  LayerVersionProps,
  Architecture,
  Runtime
} from 'aws-cdk-lib/aws-lambda'
import { BundlingOptions } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Bundling } from './bundling'
import path from 'path'
import fs from 'fs'
import { callsites, findUpMultiple } from './utils'
import { LockFile } from './package-manager'
import { LogLevel } from './types'

interface NodejsLayerProps extends Omit<LayerVersionProps, 'code'> {
  readonly bundling?: BundlingOptions
  readonly entry: string
  readonly depsLockFilePath?: string
  readonly projectRoot?: string
}

export class NodejsLayer extends LayerVersion {
  constructor(scope: Construct, id: string, props: NodejsLayerProps) {
    const entry = path.resolve(findEntry(id, props.entry))
    const architecture = Architecture.X86_64
    const depsLockFilePath = findLockFile(props.depsLockFilePath)
    const projectRoot = props.projectRoot ?? path.dirname(depsLockFilePath)
    const runtime = Runtime.NODEJS_20_X

    super(scope, id, {
      ...props,
      code: Bundling.bundle(scope, {
        ...(props.bundling ?? {}),
        entry,
        runtime,
        architecture,
        depsLockFilePath,
        projectRoot
      })
    })
  }
}

/**
 * Checks given lock file or searches for a lock file
 */
function findLockFile(depsLockFilePath?: string): string {
  if (depsLockFilePath) {
    if (!fs.existsSync(depsLockFilePath)) {
      throw new Error(`Lock file at ${depsLockFilePath} doesn't exist`)
    }

    if (!fs.statSync(depsLockFilePath).isFile()) {
      throw new Error('`depsLockFilePath` should point to a file')
    }

    return path.resolve(depsLockFilePath)
  }

  const lockFiles = findUpMultiple([LockFile.PNPM, LockFile.YARN, LockFile.NPM])

  if (lockFiles.length === 0) {
    throw new Error(
      'Cannot find a package lock file (`pnpm-lock.yaml`, `yarn.lock` or `package-lock.json`). Please specify it with `depsLockFilePath`.'
    )
  }
  if (lockFiles.length > 1) {
    throw new Error(
      `Multiple package lock files found: ${lockFiles.join(
        ', '
      )}. Please specify the desired one with \`depsLockFilePath\`.`
    )
  }

  return lockFiles[0]
}

/**
 * Searches for an entry file. Preference order is the following:
 * 1. Given entry file
 * 2. A .ts file named as the defining file with id as suffix (defining-file.id.ts)
 * 3. A .js file name as the defining file with id as suffix (defining-file.id.js)
 * 4. A .mjs file name as the defining file with id as suffix (defining-file.id.mjs)
 * 5. A .mts file name as the defining file with id as suffix (defining-file.id.mts)
 * 6. A .cts file name as the defining file with id as suffix (defining-file.id.cts)
 * 7. A .cjs file name as the defining file with id as suffix (defining-file.id.cjs)
 */
function findEntry(id: string, entry?: string): string {
  if (entry) {
    if (!/\.(jsx?|tsx?|cjs|cts|mjs|mts)$/.test(entry)) {
      throw new Error(
        'Only JavaScript or TypeScript entry files are supported.'
      )
    }
    if (!fs.existsSync(entry)) {
      throw new Error(`Cannot find entry file at ${entry}`)
    }
    return entry
  }

  const definingFile = findDefiningFile()
  const extname = path.extname(definingFile)

  const tsHandlerFile = definingFile.replace(
    new RegExp(`${extname}$`),
    `.${id}.ts`
  )
  if (fs.existsSync(tsHandlerFile)) {
    return tsHandlerFile
  }

  const jsHandlerFile = definingFile.replace(
    new RegExp(`${extname}$`),
    `.${id}.js`
  )
  if (fs.existsSync(jsHandlerFile)) {
    return jsHandlerFile
  }

  const mjsHandlerFile = definingFile.replace(
    new RegExp(`${extname}$`),
    `.${id}.mjs`
  )
  if (fs.existsSync(mjsHandlerFile)) {
    return mjsHandlerFile
  }

  const mtsHandlerFile = definingFile.replace(
    new RegExp(`${extname}$`),
    `.${id}.mts`
  )
  if (fs.existsSync(mtsHandlerFile)) {
    return mtsHandlerFile
  }

  const ctsHandlerFile = definingFile.replace(
    new RegExp(`${extname}$`),
    `.${id}.cts`
  )
  if (fs.existsSync(ctsHandlerFile)) {
    return ctsHandlerFile
  }

  const cjsHandlerFile = definingFile.replace(
    new RegExp(`${extname}$`),
    `.${id}.cjs`
  )
  if (fs.existsSync(cjsHandlerFile)) {
    return cjsHandlerFile
  }

  throw new Error(
    `Cannot find handler file ${tsHandlerFile}, ${jsHandlerFile}, ${mjsHandlerFile}, ${mtsHandlerFile}, ${ctsHandlerFile} or ${cjsHandlerFile}`
  )
}

/**
 * Finds the name of the file where the `NodejsFunction` is defined
 */
function findDefiningFile(): string {
  let definingIndex
  const sites = callsites()
  for (const [index, site] of sites.entries()) {
    if (site.getFunctionName() === 'NodejsFunction') {
      // The next site is the site where the NodejsFunction was created
      definingIndex = index + 1
      break
    }
  }

  if (!definingIndex || !sites[definingIndex]) {
    throw new Error('Cannot find defining file.')
  }

  return sites[definingIndex].getFileName()
}
