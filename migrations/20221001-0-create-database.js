import Base, { DATABASE_NAME } from "../models/base.model.js"

// NOTE: For CockroachDB create the DB manually!

const up = async () => {
	await Base.sql`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME};`
}

await up()
