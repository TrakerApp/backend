import Base from "./base.model.js"

export const TABLE_NAME = 'occurrence'

// fields
// occurrence_id: primary key uuid
// tracking_id: foreign key
// created_at: timestamp

export default class Occurrence extends Base {
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

	static async create({ trackingId }) {
		const occurrence = await this.sql`INSERT INTO ${this.sql(TABLE_NAME)} (tracking_id) VALUES (${trackingId}) RETURNING occurrence_id, created_at`
		return this.initFromDb({ ...occurrence, tracking_id: trackingId })
	}

	static async findAllForTracking({ trackingId }) {
		const occurrences = await this.sql`SELECT occurrenceId, created_at FROM ${this.sql(TABLE_NAME)} WHERE tracking_id = ${trackingId}`
		return occurrences.map(occurrence => this.initFromDb({ ...occurrence, tracking_id: trackingId }))
	}

	static async delete({ occurrenceId }) {
		return await this.sql`DELETE FROM ${this.sql(TABLE_NAME)} WHERE occurrence_id = ${occurrenceId}`
	}
}
