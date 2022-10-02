import Base, { DATABASE_NAME } from "../models/base.model.js"

// NOTE: For CockroachDB create the DB manually!

const up = async () => {
	await Base.sql`CREATE DATABASE ${Base.sql(DATABASE_NAME)};`
}

await up()
