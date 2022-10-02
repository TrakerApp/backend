import Base from "./base.model.js"

export const TABLE_NAME = 'tracking'

// fields
// userId: string non null index
// tracking_id: primary key uuid
// name: string non null
// last_occurrence_at: timestamp not null

export default class Tracking extends Base {
	constructor({ userId, trackingId, name, lastOccurrenceAt }) {
		super()
		this.userId = userId
		this.trackingId = trackingId
		this.name = name
		this.lastOccurrenceAt = lastOccurrenceAt
	}

	static initFromDb({ tracking_id, name, last_occurrence_at }) {
		return new Tracking({
			trackingId: tracking_id,
			name,
			lastOccurrenceAt: last_occurrence_at
		})
	}

	static async create({ userId, name }) {
		const trackingId = await this.sql`INSERT INTO ${this.sql(TABLE_NAME)} (user_id, name) VALUES (${userId}, ${name}) RETURNING tracking_id`
		return new Tracking({ userId, trackingId, name })
	}

	static async find({ userId, trackingId }) {
		const [tracking] = await this.sql`SELECT * FROM ${this.sql(TABLE_NAME)} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
		return this.initFromDb(tracking)
	}

	static async findAll({ userId }) {
		const trackings = await this.sql`SELECT tracking_id, name, last_occurrence_at FROM ${this.sql(TABLE_NAME)} WHERE user_id = ${userId}`
		return trackings.map(tracking => this.initFromDb(tracking))
	}

	static async update({ userId, trackingId }, { name }) {
		await this.sql`UPDATE ${this.sql(TABLE_NAME)} SET name = ${name} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
	}

	static async delete({ userId, trackingId }) {
		return await this.sql`DELETE FROM ${this.sql(TABLE_NAME)} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
	}
}
