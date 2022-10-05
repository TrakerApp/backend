import BaseModel from "./base.model.js"

export const TABLE_NAME = 'occurrence'

// fields
// occurrence_id: primary key uuid
// tracking_id: foreign key
// created_at: timestamp

export default class Occurrence extends BaseModel {
	static tableName() { return TABLE_NAME }

	constructor({ trackingId, occurrenceId, createdAt }) {
		super()
		this.trackingId = trackingId
		this.occurrenceId = occurrenceId
		this.createdAt = createdAt
	}

	static initFromDb({ tracking_id, occurrence_id, created_at }) {
		return new Occurrence({
			trackingId: tracking_id,
			occurrenceId: occurrence_id,
			createdAt: created_at
		})
	}

	static async findAllByTrackingId({ trackingId, page = 1, perPage = 10 }) {
		const total = await this.sql`SELECT COUNT(*) FROM ${this.tableNameSql()} WHERE tracking_id = ${trackingId}`

		const occurrences = await this.sql`
			SELECT occurrence_id, created_at
			FROM ${this.tableNameSql()}
			WHERE tracking_id = ${trackingId}
			ORDER BY created_at DESC
			LIMIT ${perPage} OFFSET ${(page-1) * perPage}
		`

		const response = occurrences.map(occurrence => this.initFromDb({ ...occurrence }))
		response.totalHits = parseInt(total[0].count)

		return response
	}

	static async create({ trackingId }) {
		const occurrence = await this.sql`INSERT INTO ${this.sql(TABLE_NAME)} (tracking_id) VALUES (${trackingId}) RETURNING occurrence_id, created_at`
		return this.initFromDb({ ...occurrence, tracking_id: trackingId })
	}

	static async findAllForTracking({ trackingId }) {
		const occurrences = await this.sql`SELECT occurrence_id, created_at FROM ${this.sql(TABLE_NAME)} WHERE tracking_id = ${trackingId} ORDER BY created_at DESC`
		return occurrences.map(occurrence => this.initFromDb({ ...occurrence, tracking_id: trackingId }))
	}

	static async delete({ occurrenceId }) {
		return await this.sql`DELETE FROM ${this.sql(TABLE_NAME)} WHERE occurrence_id = ${occurrenceId}`
	}
}
