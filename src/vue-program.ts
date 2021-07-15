/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-07-08 15:12:57
 * @Description:
 * 解决引入路径是.vue的问题
 * 统一对所有引入路径是.vue进行抹平，直接移除.vue
 * 对所有的vue type 文件进行修改为.d.ts
 */

import ts, { SourceFile } from 'typescript'
import fs from 'fs'
import { parse, compileScript } from '@vue/compiler-sfc'

function createSourceFile (fileName: string): SourceFile | undefined {
  const content = fs.readFileSync(fileName, 'utf-8')
  const sfc = parse(content)
  const { script, scriptSetup } = sfc.descriptor
  if (Boolean(script) || Boolean(scriptSetup)) {
    let content = ''
    if (script?.content != null) {
      const scriptContent = script.content
      content = `${content}${scriptContent}`
    }
    if (scriptSetup != null) {
      const compiled = compileScript(sfc.descriptor, {
        id: 'xxx'
      })
      const compiledContent = compiled.content
      content = `${content}${compiledContent}`
    }
    return ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true)
  }
}

export { createSourceFile }
