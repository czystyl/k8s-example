const express = require("express");
const { Client } = require("pg");
const faker = require("faker");
const waitForPostgreSql = require("./wait-for");

const port = 3000;
const app = express();

let client = null;

const host = process.env.POSTGRES_HOST || "localhost";
const postgres_port = process.env.POSTGRES_PORT || 5111;
const user = process.env.POSTGRES_USER || "postgres";
const password = process.env.POSTGRES_PASSWORD || "postgres";
const database = process.env.POSTGRES_DB || "postgres";

const databaseUrl = `postgresql://${user}:${password}@${host}:${postgres_port}/${database}`;

(async function main() {
  await waitForPostgreSql({ databaseUrl });

  client = new Client(databaseUrl);
  await client.connect();

  await client.query(
    `CREATE TABLE IF NOT EXISTS visitor (
      id serial PRIMARY KEY, 
      first_name TEXT, 
      last_name TEXT,
      job_title TEXT,
      company TEXT,
      avatar TEXT,
      secret TEXT
      )`
  );

  app.listen(port, () =>
    console.log(`🧨 App listening on: http://localhost:${port} 🚀`)
  );
})();

app.get("/", async (_, res) => {
  const countQuery = await client.query("select COUNT(1) from visitor");

  const results = await client.query("SELECT * FROM visitor ORDER BY id desc");

  res.send(`
    <h1>Rows count: ${countQuery.rows[0].count} 🧐</h1>
    <a href="/seed" style="color: green;"><h3> 🌱 SEED MORE 🌱 </h3></a>
    
    <table border=1>
      <tr>
        <th>NAME</th>
        <th>SECRET</th>
        <th>AVATAR</th>
        <th>COMPANY</th>
      </tr>
      ${results.rows
        .map(
          result => `<tr>
          <td>${result.first_name} ${result.first_name}</td>
          <td>${result.company}</td>
          <td><img src="${result.avatar}"/></td>
          <td>${result.secret.slice(-8)}********</td>
        </tr>`
        )
        .join("")}
    </table>
  `);
});

app.get("/seed", async (_, res) => {
  const MIN = 10;
  const MAX = 100;

  const MAX_COUNT = Math.floor(Math.random() * (MAX - MIN)) + MIN;

  for (let i = 0; i < MAX_COUNT; i++) {
    client.query(
      "INSERT INTO visitor (first_name, last_name, job_title, company, avatar, secret) VALUES($1, $2, $3, $4, $5, $6)",
      [
        faker.name.firstName(),
        faker.name.lastName(),
        faker.name.jobTitle(),
        faker.company.companyName(),
        faker.image.avatar(),
        faker.random.uuid()
      ]
    );
  }

  res.send(`
  <h1>Items loaded: ${MAX_COUNT}</h1>

  <a href="/" style="color: green;"><h3> 🔙 GO BACK 🔙 </h3></a>
  `);
});
