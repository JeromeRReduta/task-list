import db from "#db/client";
import bcrypt from "bcrypt";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed(numUsers = 3, numTasks = 3, saltRounds = 10) {
  for (let i = 1; i < numUsers + 1; i++) {
    const username = `username ${i}`;
    const hash = await bcrypt.hash(`password ${i}`, saltRounds);
    await db.query({
      text: `
                    INSERT INTO users (username, password)
                    VALUES($1, $2)
                    RETURNING *
        `,
      values: [username, hash],
    });
  }
  for (let i = 1; i < numUsers + 1; i++) {
    for (let j = 1; j < numTasks + 1; j++) {
      await db.query({
        text: `
                    INSERT INTO tasks (title, user_id)
                    VALUES ($1, $2)
                    RETURNING *
                `,
        values: [`task ${i}-${j}`, i],
      });
    }
  }
}
