/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-07-22 09:59:23
 * @Description:
 */
import ts from 'typescript'
import { transfromFactory } from '../index'

const vueTsContent = `
import { Test } from './components/HelloWorld.vue'

export { Test }
`

const result = `import { Test } from './components/HelloWorld.vue';
export { Test };
`

jest.setTimeout(300000)

test('import type from vue should return remove .vue suffix', (cb) => {
  const options: ts.CompilerOptions = {
    target: 1,
    module: 99,
    strict: true,
  }
  function overwriteCompilerHost(host: ts.CompilerHost): ts.CompilerHost {
    host.writeFile = (fileName, ...args) => {
      expect(args[0]).toBe(result)
      cb()
    }
    host.getSourceFile = () => {
      return ts.createSourceFile(
        'App.vue.ts',
        vueTsContent,
        ts.ScriptTarget.ESNext,
        true
      )
    }
    return host
  }
  const host = overwriteCompilerHost(ts.createCompilerHost(options))
  const program = ts.createProgram(['App.vue.ts'], options, host)
  program.emit(
    program.getSourceFile('App.vue.ts'),
    undefined,
    undefined,
    undefined,
    {
      afterDeclarations: [transfromFactory],
    }
  )
})
