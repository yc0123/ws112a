import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
 
const accounts = new Map();
accounts.set("xxx", {
  name: "xxx",
  password: "0123456789",
});

const router = new Router();
router
  .get("/", (ctx) => {
    ctx.response.redirect('http://127.0.0.1:8000/public/')
  })
  .get("/account", (ctx) => {
    ctx.response.body = Array.from(accounts.values());
  })
  .post("/account/register", async (ctx) => {
    const body = ctx.request.body()
    if (body.type === "form") {
      const pairs = await body.value
      console.log('pairs=', pairs)
      const params = {}
      for (const [key, value] of pairs) {
        params[key] = value
      }
      console.log('params=', params)
      let name = params['name']
      let password = params['password']
      console.log(`name=${name} password=${password}`)
      if (accounts.get(name)) {
        ctx.response.type = 'text/html'
        ctx.response.body = `<p>用戶名已存在</p><p><a href="http://127.0.0.1:8000/public/register.html">重新註冊</a></p>`
      } else {
        accounts.set(name, {name, password})
        ctx.response.type = 'text/html'
        ctx.response.body = `<p>註冊 (${name}, ${password}) 成功</p><p><a href="http://127.0.0.1:8000/public/login.html">登入</a></p>`
      }
    }
  })
  .get("/public/(.*)", async (ctx) => {
    let wpath = ctx.params[0]
    console.log('wpath=', wpath)
    await send(ctx, wpath, {
      root: Deno.cwd()+"/public/",
      index: "index.html",
    })
  })
  .post("/account/login", async (ctx) => {
    const body = ctx.request.body()
    if (body.type === "form") {
      const pairs = await body.value
      console.log('pairs=', pairs)
      const params = {}
      for (const [key, value] of pairs) {
        params[key] = value
      }
      console.log('params=', params)
      let name = params['name']
      let password = params['password']
      console.log(`name=${name} password=${password}`)
      if (accounts.get(name)&&password==accounts.get(name).password) {
        ctx.response.type = 'text/html'
        ctx.response.body = `<p>登入成功</p><p><a href="">進入系統</a></p>`
      } else {
        ctx.response.type = 'text/html'
        ctx.response.body = `<p>登入失敗，請檢查帳號密碼是否有錯！</p><p><a href="http://127.0.0.1:8000/public/login.html">重新登入</a></p>`
      }
    }
  })

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log('start at : http://127.0.0.1:8000')

await app.listen({ port: 8000 });