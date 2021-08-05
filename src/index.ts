#!/usr/bin/env node

// From: https://github.com/prettier/prettier/issues/554#issuecomment-351517698
// Many thanks @tqwhite

import { format } from "prettierx"

type filter = (s: string) => string

let protectWS: filter = (s) => s.replace(/^[^\S\r\n]*$/gm, '/*linebreak*/')
let unprotectWS: filter = (s) =>
    s.replace(/^[^\S\r\n]*\/\*linebreak\*\/$/gm, '').replace(/[\n]*$/g, '') +
    '\n'


export function run(argv: string[]) {
    let inputData = ''
    let pre: filter[] = []
    let post: filter[] = []


    let opt = {
        singleQuote: true,
        semi: false,
        tabWidth: 4,
        spaceBeforeFunctionParen: true,
    } as any
    if (argv[0] === '--stdin-filepath') {
        opt.filepath = argv[1]

        if (opt.filepath.endsWith('.js') || opt.filepath.endsWith('.ts')) {
            pre.push(protectWS)
            post.push(unprotectWS)
        }
    }


    // the rest

    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', function (data) {
        inputData += data
    })
    process.stdin.on('end', () => {
        let outString = inputData
        pre.forEach((filter) => {
            outString = filter(outString)
        })
        outString = format(outString, opt)
        post.forEach((filter) => {
            outString = filter(outString)
        })
        process.stdout.write(outString)
    })
}
