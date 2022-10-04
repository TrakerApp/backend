import postgres from "postgres"
import * as dotenv from "dotenv"
dotenv.config()

export const DEFAULT_IDLE_TIME_FOR_DISCONNECT = 10 // seconds
// test is only used locally for running tests, dev/prod/staging/etc are all on lambda
export const DATABASE_URL = process.env.TRAKER_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL

// we can declare thousands of these if we want, they only get executed when called and then will connection will die after 10 seconds
const sql = postgres(DATABASE_URL, {
	idle_timeout: DEFAULT_IDLE_TIME_FOR_DISCONNECT
})

class Base {
	static deleteAllRecords() {
		return sql`DELETE FROM ${sql(this.tableName())}`
	}
}

// literal hack
Base.sql = sql

export default Base
