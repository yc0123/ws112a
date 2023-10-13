import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("hw5.db");
db.query("CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT)");

const router = new Router();

router.get('/', list)
  .get('/person/new', add)
  .get('/person/:id', show)
  .post('/preson', create);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

function query(sql) {
  let list = []
  for (const [id, name, phone] of db.query(sql)) {
    list.push({id, name, phone})
  }
  return list
}

async function list(ctx) {
  let people = query("SELECT id, name, phone FROM people")
  ctx.response.body = await render.list(people);
}

async function add(ctx) {
  ctx.response.body = await render.newPerson();
}

async function show(ctx) {
  const id = ctx.params.id;
  let people = query(`SELECT id, name, phone FROM people WHERE id=${id}`)
  let preson = people[0]
  if (!preson) ctx.throw(404, 'invalid preson id');
  ctx.response.body = await render.show(preson);
}

async function create(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    const pairs = await body.value
    const preson = {}
    for (const [key, value] of pairs) {
      preson[key] = value
    }
    db.query("INSERT INTO people (name, phone) VALUES (?, ?)", [preson.name, preson.phone]);
    ctx.response.redirect('/');
  }
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });
