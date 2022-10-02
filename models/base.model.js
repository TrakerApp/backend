import postgres from "postgres"
import * as dotenv from "dotenv"
dotenv.config()

export const DATABASE_NAME = process.env.DATABASE_NAME || `trakerapp-${process.env.TRAKER_ENV}`
export const DEFAULT_IDLE_TIME_FOR_DISCONNECT = 10 // seconds
// test is only used locally for running tests, dev/prod/staging/etc are all on lambda
export const DATABASE_URL = process.env.TRAKER_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL

// we can declare thousands of these if we want, they only get executed when called and then will connection will die after 10 seconds
const sql = postgres(DATABASE_URL, {
	// database: DATABASE_NAME,
	idle_timeout: DEFAULT_IDLE_TIME_FOR_DISCONNECT
})

export default class Base {
	static sql(...args) { return sql(...args) }

	static deleteAllRecords() {
		return this.sql`DELETE FROM ${this.sql(this.tableName())}`
	}
}
