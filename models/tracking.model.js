import BaseModel from "./base.model.js"
import Occurrence from "./occurrence.model.js"

export const TABLE_NAME = 'tracking'

// fields
// userId: string non null index
// tracking_id: primary key uuid
// name: string non null
// last_occurrence_at: timestamp not null

export default class Tracking extends BaseModel {
	static tableName() { return TABLE_NAME }

	constructor({ userId, trackingId, name, lastOccurrenceAt }) {
		super()
		this.userId = userId
		this.trackingId = trackingId
		this.name = name
		this.lastOccurrenceAt = lastOccurrenceAt
	}

	static initFromDb({ user_id, tracking_id, name, last_occurrence_at }) {
		return new Tracking({
			userId: user_id,
			trackingId: tracking_id,
			name,
			lastOccurrenceAt: last_occurrence_at
		})
	}

	static async create({ userId, name }) {
		const result = await this.sql`INSERT INTO ${this.tableNameSql()} (user_id, name) VALUES (${userId}, ${name}) RETURNING tracking_id`
		return new Tracking({ userId, trackingId: result[0].tracking_id, name })
	}

	// ONLY FOR TESTS
	static async findById(trackingId) {
		if (!process.env.NODE_ENV === 'test') { throw "model.findById is Only for test environment" }
		const [tracking] = await this.sql`SELECT * FROM ${this.tableNameSql()} WHERE tracking_id = ${trackingId}`
		return this.initFromDb(tracking)
	}

	static async find({ userId, trackingId }) {
		const [tracking] = await this.sql`SELECT * FROM ${this.tableNameSql()} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
		return this.initFromDb(tracking)
	}

	static async exists({ userId, trackingId }) {
		const [tracking] = await this.sql`SELECT 1 FROM ${this.tableNameSql()} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
		return !!tracking
	}

	static async findAll({ userId, page = 1, perPage = 10 }) {
		const total = await this.sql`SELECT COUNT(*) FROM ${this.tableNameSql()} WHERE user_id = ${userId}`

		const trackings = await this.sql`
			SELECT tracking_id, name, last_occurrence_at
			FROM ${this.tableNameSql()}
			WHERE user_id = ${userId}
			ORDER BY last_occurrence_at DESC, name ASC
			LIMIT ${perPage} OFFSET ${(page-1) * perPage}
		`

		const response = trackings.map(tracking => this.initFromDb({ ...tracking }))
		response.totalHits = parseInt(total[0].count)

		return response
	}

	static async update({ userId, trackingId }, { name }) {
		await this.sql`UPDATE ${this.tableNameSql()} SET name = ${name} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
	}

	static async delete({ userId, trackingId }) {
		return await this.sql`DELETE FROM ${this.tableNameSql()} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
	}

	static async setLastOccurrenceAt({ userId, trackingId }) {
		const [{ last_occurrence_at }] = await this.sql`SELECT MAX(created_at) FROM ${Occurrence.tableNameSql()} WHERE tracking_id = ${trackingId}`
		const newDate = last_occurrence_at || null
		await this.sql`UPDATE ${this.tableNameSql()} SET last_occurrence_at = ${newDate} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
	}

	// NOTE: THIS METHOD ASSUMES THAT TRACKINGID IS VALID AND EXISTS
	// VALIDATE ON CONTROLLER/ACTION BEFORE USING
	static async track({ userId, trackingId }) {
		const [occurrenceId, createdAt] = await this.sql.begin(async sql => {
			const [{ occurrence_id, created_at }] = await sql`INSERT INTO ${Occurrence.tableNameSql()} (tracking_id) VALUES (${trackingId}) returning occurrence_id, created_at`
			await sql`UPDATE ${this.tableNameSql()} SET last_occurrence_at = ${created_at} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`

			return [occurrence_id, created_at]
		})

		return { occurrenceId, createdAt }
	}
}
