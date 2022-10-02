import Base from "./base.model.js"

export const TABLE_NAME = 'tracking'

// fields
// userId: string non null index
// tracking_id: primary key uuid
// name: string non null
// last_occurrence_at: timestamp not null

export default class Tracking extends Base {
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
		const result = await this.sql`INSERT INTO ${this.sql(TABLE_NAME)} (user_id, name) VALUES (${userId}, ${name}) RETURNING tracking_id`
		return new Tracking({ userId, trackingId: result[0].tracking_id, name })
	}

	static async findById(trackingId) {
		const [tracking] = await this.sql`SELECT * FROM ${this.sql(TABLE_NAME)} WHERE tracking_id = ${trackingId}`
		return this.initFromDb(tracking)
	}

	static async find({ userId, trackingId }) {
		const [tracking] = await this.sql`SELECT * FROM ${this.sql(TABLE_NAME)} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
		return this.initFromDb(tracking)
	}

	static async findAll({ userId, page = 1, per_page = 10 }) {
		const total = await this.sql`SELECT COUNT(*) FROM ${this.sql(TABLE_NAME)} WHERE user_id = ${userId}`

		const trackings = await this.sql`
			SELECT tracking_id, name, last_occurrence_at
			FROM ${this.sql(TABLE_NAME)}
			WHERE user_id = ${userId}
			ORDER BY last_occurrence_at DESC, name ASC
			LIMIT ${per_page} OFFSET ${(page-1) * per_page}
		`

		const response = trackings.map(tracking => this.initFromDb({ userId, ...tracking }))
		response.totalHits = parseInt(total[0].count)

		return response
	}

	static async update({ userId, trackingId }, { name }) {
		await this.sql`UPDATE ${this.sql(TABLE_NAME)} SET name = ${name} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
	}

	static async delete({ userId, trackingId }) {
		return await this.sql`DELETE FROM ${this.sql(TABLE_NAME)} WHERE user_id = ${userId} AND tracking_id = ${trackingId}`
	}
}
