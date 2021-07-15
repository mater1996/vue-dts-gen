/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-07-09 15:30:39
 * @Description:
 */
import ts from 'typescript'
import { createSourceFile as createVueSourceFile } from './vue-program'
import { readConfigFile, findVueFiles } from './utils'

function overwriteCompilerHost (host: ts.CompilerHost): ts.CompilerHost {
  const getSourceFile = host.getSourceFile
  const writeFile = host.writeFile

  host.writeFile = (
    fileName,
    data,
    writeByteOrderMark,
    onError,
    sourceFiles
  ) => {
    return writeFile(
      fileName.replace('vue.d.ts', 'd.ts'),
      data,
      writeByteOrderMark,
      onError,
      sourceFiles
    )
  }

  host.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget) => {
    const isVue = /.vue.ts$/.test(fileName)
    let sourceFile
    if (isVue) {
      sourceFile = createVueSourceFile(fileName.replace(/.ts$/, ''))
    } else {
      sourceFile = getSourceFile(fileName, languageVersion)
    }
    return sourceFile
  }

  return host
}

function transfromFactory (context: ts.TransformationContext) {
  return (sourceFile: ts.SourceFile | ts.Bundle): ts.SourceFile | ts.Bundle => {
    const { factory } = context
    const visitor: ts.Visitor = node => {
      if (ts.isImportDeclaration(node)) {
        return factory.updateImportDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.importClause,
          ts.factory.createStringLiteral(
            node.moduleSpecifier
              .getText()
              .replace(/\.vue$/, '')
              .replace(/'/g, ''),
            true
          )
        )
      }
      return ts.visitEachChild(node, visitor, context)
    }
    return ts.visitNode(sourceFile, visitor)
  }
}

function compile (fileNames: string[], options: ts.CompilerOptions): void {
  const host = overwriteCompilerHost(ts.createCompilerHost(options))
  const program = ts.createProgram(fileNames, options, host)
  fileNames.forEach(fileName => {
    const sourceFile = program.getSourceFile(fileName)
    program.emit(sourceFile, undefined, undefined, undefined, {
      afterDeclarations: [transfromFactory]
    })
  })
}

export function build (): void {
  const tsConfig = readConfigFile('tsconfig.json')
  const { options } = tsConfig
  const { rootDirs = [], rootDir = '' } = options
  const vueFileNames = findVueFiles([rootDir, ...rootDirs]).map(
    v => (v += '.ts')
  )
  return compile([...tsConfig.fileNames, ...vueFileNames], tsConfig.options)
}
