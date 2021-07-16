/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-07-09 15:30:39
 * @Description:
 */
import ts from 'typescript'
import { readVueFile } from './vue-program'
import { readConfigFile } from './utils'

const vueTsReg = /\.vue\.ts$/
const vueDTsReg = /vue\.d\.ts$/

function overwriteCompilerHost (host: ts.CompilerHost): ts.CompilerHost {
  const writeFile = host.writeFile
  const readFile = host.readFile
  host.readFile = (fileName: string) => {
    if (vueTsReg.test(fileName)) {
      return readVueFile(fileName.replace(vueTsReg, '.vue'))
    }
    return readFile(fileName)
  }
  host.writeFile = (fileName, ...args) => {
    return writeFile(fileName.replace(vueDTsReg, 'd.ts'), ...args)
  }
  return host
}

function transfromFactory (context: ts.TransformationContext) {
  return (sourceFile: ts.SourceFile | ts.Bundle): ts.SourceFile | ts.Bundle => {
    const { factory } = context
    const visitor: ts.Visitor = (node) => {
      if (ts.isImportDeclaration(node)) {
        const text = node.moduleSpecifier.getText()
        return factory.updateImportDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.importClause,
          factory.createStringLiteral(text.replace(/^'|\.vue'$/g, ''))
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
  fileNames.forEach((fileName) => {
    const sourceFile = program.getSourceFile(fileName)
    program.emit(sourceFile, undefined, undefined, undefined, {
      afterDeclarations: [transfromFactory]
    })
  })
}

export function build (): void {
  const tsConfig = readConfigFile('tsconfig.json')
  console.log(tsConfig)
  return compile(tsConfig.fileNames, tsConfig.options)
}
