import { Application, send } from 'https://deno.land/x/oak/mod.ts'

const app = new Application()

app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  })
})

console.log(`http://localhost:8000`)
await app.listen({ port: 8000 })