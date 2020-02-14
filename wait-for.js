const { Client } = require("pg");

const DEFAULT_MAX_ATTEMPTS = 100;
const DEFAULT_DELAY = 1000; // in ms

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForPostgreSql({
  databaseUrl = process.env.DATABASE_URL || "postgres://postgres@localhost",
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  delay = DEFAULT_DELAY
} = {}) {
  let didConnect = false;
  let retries = 0;

  while (!didConnect) {
    try {
      const client = new Client(databaseUrl);
      await client.connect();

      console.log("Postgres is up");
      client.end();

      didConnect = true;
    } catch (error) {
      retries++;

      if (retries > maxAttempts) {
        throw error;
      }

      console.log(`Postgres is unavailable - try again in ${delay}`);

      await timeout(delay);
    }
  }
}

module.exports = waitForPostgreSql;
