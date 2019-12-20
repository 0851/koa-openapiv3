import fs from 'fs'
import handlebars from 'handlebars'
import { minify } from 'html-minifier'
import { Dict } from './openapi'

export async function read (p: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(p, function (err, data) {
      if (!err) {
        let source = data.toString()
        resolve(source)
      } else {
        console.error(err)
        reject(err)
      }
    })
  })
}

let cached: Dict<string> = {}

export async function hbs (p: string, data: any): Promise<string> {
  let source: string = ''
  if (cached.hasOwnProperty(p)) {
    source = cached[p]
  } else {
    source = await read(p)
    if (source) {
      cached[p] = source
    }
  }
  let template = handlebars.compile(source)
  return minify(template(data), {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    minifyJS: true,
    minifyCSS: true,
  })
}
