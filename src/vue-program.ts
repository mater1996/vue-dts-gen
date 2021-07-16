/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-07-08 15:12:57
 * @Description:
 * 解决引入路径是.vue的问题
 * 统一对所有引入路径是.vue进行抹平，直接移除.vue
 * 对所有的vue type 文件进行修改为.d.ts
 */

import fs from 'fs'
import { parse, compileScript } from '@vue/compiler-sfc'

function readVueFile (fileName: string): string {
  const fileContent = fs.readFileSync(fileName, 'utf-8')
  const sfc = parse(fileContent)
  const { script, scriptSetup } = sfc.descriptor
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
  return content
}

export { readVueFile }
