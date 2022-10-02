import Base from "../models/base.model.js"
import { TABLE_NAME as TrackingTableName } from "../models/tracking.model.js"
import { TABLE_NAME as OccurrenceTableName } from "../models/occurrence.model.js"

const up = async () => {
	await Base.sql`
		CREATE TABLE ${Base.sql(TrackingTableName)} (
			user_id STRING NOT NULL,
			tracking_id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
			name STRING NOT NULL,
			last_occurrence_at TIMESTAMP,
			CONSTRAINT tracking_user_id_name_unique UNIQUE (user_id, name),
			INDEX index_user_id (user_id)
		)
	`

	await Base.sql`
		CREATE TABLE IF NOT EXISTS ${Base.sql(OccurrenceTableName)} (
			occurrence_id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
			tracking_id UUID NOT NULL REFERENCES ${Base.sql(TrackingTableName)} (tracking_id),
			created_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`
}

await up()
