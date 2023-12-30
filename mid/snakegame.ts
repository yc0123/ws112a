import { Application, send, Router } from 'https://deno.land/x/oak/mod.ts'

const accounts = new Map()
accounts.set("cyc", {
  name: "cyc",
  password: "0000",
})

const router = new Router()
router
  .get("/", (ctx) => {
    ctx.response.redirect('http://127.0.0.1:8000/public/')
  })
  .post("/account/register", async (ctx) => {
    const body = ctx.request.body()
    if (body.type === "form") {
      const pairs = await body.value
      const params = {}
      for (const [key, value] of pairs) {
        params[key] = value
      }
      let name = params['name']
      let password = params['password']
      if (accounts.get(name)) {
        ctx.response.type = 'text/html';
        ctx.response.body = `
        <script>
          alert('用戶名已存在，請重新註冊！');
          window.location.href = 'http://127.0.0.1:8000/public/index.html';
        </script>`
      } else {
        accounts.set(name, {name, password})
        ctx.response.type = 'text/html';
        ctx.response.body = `
        <script>
          alert('註冊成功!');
          window.location.href = 'http://127.0.0.1:8000/public/index.html';
        </script>`
      }
    }
  })
  .get("/public/(.*)", async (ctx) => {
    let wpath = ctx.params[0]
    await send(ctx, wpath, {
      root: Deno.cwd()+"/public/",
      index: "index.html",
    })
  })
  .post("/account/login", async (ctx) => {
    const body = ctx.request.body()
    if (body.type === "form") {
      const pairs = await body.value
      const params = {}
      for (const [key, value] of pairs) {
        params[key] = value
      }
      let name = params['name']
      let password = params['password']
      if (accounts.get(name)&&password==accounts.get(name).password) {
        ctx.response.redirect('http://127.0.0.1:8000/public/snakegame.html')
      } else {
        ctx.response.type = 'text/html';
        ctx.response.body = `
        <script>
          alert('登入失敗，請檢查帳號密碼是否有錯！');
          window.location.href = 'http://127.0.0.1:8000/public/index.html';
        </script>`
      }
    }
  })

const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())

console.log(`http://localhost:8000`)
await app.listen({ port: 8000 })