/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-07-14 19:34:34
 * @Description
 */
import fs from 'fs'
import path from 'path'
import ts from 'typescript'

function isVue (fileName: string): boolean {
  return path.extname(fileName) === '.vue'
}

function reportDiagnostics (diagnostics: ts.Diagnostic[]): void {
  diagnostics.forEach((diagnostic) => {
    let message = 'Error'
    if (diagnostic.file != null && diagnostic.start != null) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      )
      message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`
    }
    message +=
      ': ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    console.log(message)
  })
}

/**
 * readConfigFile forked from https://github.com/microsoft/TypeScript/issues/44573
 * @param configFileName - configFileName
 * @returns
 */
export function readConfigFile (configFileName: string): ts.ParsedCommandLine {
  // Read config file
  const configFileText = fs.readFileSync(configFileName).toString()
  // Parse JSON, after removing comments. Just fancier JSON.parse
  const result = ts.parseConfigFileTextToJson(configFileName, configFileText)
  const configObject = result.config
  //
  if (configObject != null && result.error != null) {
    reportDiagnostics([result.error])
    process.exit(1)
  }
  // Extract config infromation
  const configParseResult = ts.parseJsonConfigFileContent(
    configObject,
    {
      ...ts.sys,
      readDirectory (
        rootDir: string,
        extensions: readonly string[],
        excludes: readonly string[] | undefined,
        includes: readonly string[],
        depth?: number | undefined
      ): readonly string[] {
        return ts.sys.readDirectory(
          rootDir,
          [...extensions, '.vue'],
          excludes,
          includes,
          depth
        )
      }
    },
    path.dirname(configFileName)
  )
  if (configParseResult.errors.length > 0) {
    reportDiagnostics(configParseResult.errors)
    process.exit(1)
  }
  configParseResult.fileNames = configParseResult.fileNames.map((v) =>
    isVue(v) ? `${v}.ts` : v
  )
  return configParseResult
}
