import path from 'path'
import fs from 'fs'
import { Project, SourceFile, ts } from 'ts-morph'
import glob from 'fast-glob'

export type Options = {
  input: string | string[]
  outDir?: string
}

let vueCompiler: typeof import('@vue/compiler-sfc')

const getVueCompiler = () => {
  if (!vueCompiler) {
    try {
      vueCompiler = require(path.resolve('node_modules/@vue/compiler-sfc'))
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error(`@vue/compiler-sfc is not founded in ./node_modules`)
      }
      throw error
    }
  }

  return vueCompiler
}

export async function build({ input, outDir }: Options) {
  const vueCompiler = getVueCompiler()
  const tsConfigFilePath = fs.existsSync('tsconfig.json')
    ? 'tsconfig.json'
    : undefined

  const project = new Project({
    compilerOptions: {
      allowJs: true,
      declaration: true,
      declarationDir: 'lib',
      emitDeclarationOnly: true,
      noEmitOnError: true,
      outDir,
    },
    tsConfigFilePath,
    skipAddingFilesFromTsConfig: true,
  })

  const files = await glob(input)

  const sourceFiles: SourceFile[] = []

  function transfromFactory(context: ts.TransformationContext) {
    return (
      sourceFile: ts.SourceFile | ts.Bundle,
    ): ts.SourceFile | ts.Bundle => {
      const { factory } = context
      const visitor: ts.Visitor = (node) => {
        if (ts.isImportDeclaration(node)) {
          return factory.updateImportDeclaration(
            node,
            node.decorators,
            node.modifiers,
            node.importClause,
            ts.factory.createStringLiteral(
              node.moduleSpecifier
                .getText()
                .replace(/.vue/, '')
                .replace(/'/g, ''),
              true,
            ),
          )
        }
        return ts.visitEachChild(node, visitor, context)
      }
      return ts.visitNode(sourceFile, visitor)
    }
  }

  function processVue(filePath: string, content: string) {
    const sfc = vueCompiler.parse(content)
    const { script, scriptSetup } = sfc.descriptor
    if (script || scriptSetup) {
      let content = ''
      let isTS = false
      if (script && script.content) {
        content += script.content
        if (script.lang === 'ts') isTS = true
      }
      if (scriptSetup) {
        const compiled = vueCompiler.compileScript(sfc.descriptor, {
          id: 'xxx',
        })
        content += compiled.content
        if (scriptSetup.lang === 'ts') isTS = true
      }
      const sourceFile = project.createSourceFile(
        filePath + (isTS ? '.ts' : '.js'),
        content,
      )
      sourceFiles.push(sourceFile)
    }
  }

  function processTs(filePath: string, content: string) {
    const sourceFile = project.getSourceFile(filePath)
    if (sourceFile) {
      sourceFiles.push(sourceFile)
    }
  }

  await Promise.all(
    files.map(async (file) => {
      const extname = path.extname(file)
      const filePath = path.relative(process.cwd(), file)
      const content = await fs.promises.readFile(file, 'utf8')
      switch (extname) {
        case '.vue':
          processVue(filePath, content)
          break
        case '.ts':
          processTs(filePath, content)
          break
      }
    }),
  )

  console.log(project.getSourceFiles())

  const diagnostics = project.getPreEmitDiagnostics()
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))

  const memoryResult = project.emitToMemory({
    customTransformers: {
      afterDeclarations: [transfromFactory],
    },
  })

  console.log(memoryResult.getFiles())

  for (const outputFile of memoryResult.getFiles()) {
    const filepath = outputFile.filePath.replace('.vue.d.ts', '.d.ts')
    await fs.promises.mkdir(path.dirname(filepath), { recursive: true })
    await fs.promises.writeFile(filepath, outputFile.text, 'utf8')
    console.log(`Emitted ${filepath}`)
  }
}
