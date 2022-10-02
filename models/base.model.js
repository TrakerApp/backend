import postgres from "postgres"
import * as dotenv from "dotenv"
dotenv.config()

export const DATABASE_NAME = process.env.DATABASE_NAME || `trakerapp-${process.env.TRAKER_ENV}`
export const DEFAULT_IDLE_TIME_FOR_DISCONNECT = 10 // seconds

// we can declare thousands of these if we want, they only get executed when called and then will connection will die after 10 seconds
const sql = postgres(process.env.DATABASE_URL, {
	database: DATABASE_NAME,
	idle_timeout: DEFAULT_IDLE_TIME_FOR_DISCONNECT
})

export default class Base {
	static sql(...args) { return sql(...args) }
}
