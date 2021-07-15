/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-06-25 17:06:58
 * @Description:
 */
const execa = require('execa')

module.exports = {
  remove(dir){
    return execa('rm', ['-rf', dir])
  }
}
