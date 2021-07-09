import express from 'express';
import { createElement } from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { concat, from, of } from 'rxjs';
import { LikeButton } from './view/likeButton';
import { promisify } from 'util';
import { readFile } from 'fs';
import { join } from 'path';

const readF = promisify(readFile)
const jsPath = join(__dirname, './view/dist/Client.js')

const server = express()

server.get('/js', (req, res) => {
    from(readF(jsPath)).subscribe({
        next: x => {
            res.write(x.toString())
        },
        complete: res.end.bind(res)
    })
})

server.get('/', (req, res) => {
    const commentID = 200
    const head = `
        <!DOCTYPE html>
        <html>
        <head>
        <title>HAHA</title>
        </head>
        <body>
        <div id="root">`
    const tail = `</div>
        <script>
            window.__INITIAL_STATE__ = ${commentID}
        </script>
        <script src="http://localhost:3000/js"></script>
        </script>
        </body>
        </html>
    `
    const $react = from(renderToNodeStream(createElement(LikeButton, { commentID, clientRender: false })))
    concat(of(head), $react, of(tail)).subscribe({
        next: res.write.bind(res),
        complete: res.end.bind(res)
    })
})

server.listen(3000, () => console.log("start"))