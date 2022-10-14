import Tracking from "../../../../models/tracking.model.js"
import Occurrence from "../../../../models/occurrence.model.js"
import { isBlank } from "../../../../libs/validation.js"
import { getUserId } from "../../../../libs/getUserId.js";

export const handler = async (event) => {
	// userId is temporal until we have cognito implemented in app
	const userId = getUserId(event);
	const { trackingId } = event.pathParameters;

	/*
		To return:
		- name
		- weekOccurrences
		- todayOccurrences
		- lastOccurrence
	*/

	if (isBlank(userId) || isBlank(trackingId)) {
		return { statusCode: 400, body: JSON.stringify({ error: 'required attributes: userId, trackingId' }) }
	}

	try {
		const [data] = await Tracking.sql`
			SELECT
				name,
				(
					SELECT COUNT(1)
					FROM ${Occurrence.tableNameSql()}
					WHERE tracking_id = ${trackingId}
					AND created_at > NOW() - INTERVAL '1 week'
				) as week_occurrences,
				(
					SELECT COUNT(1)
					FROM ${Occurrence.tableNameSql()}
					WHERE tracking_id = ${trackingId}
					AND created_at > date_trunc('day', now())
				) as today_occurrences,
				last_occurrence_at
			FROM ${Tracking.tableNameSql()}
			WHERE tracking.tracking_id = ${trackingId}
			GROUP BY tracking.tracking_id
		`

		return {
			statusCode: 201, body: JSON.stringify({
				name: data.name,
				weekOccurrences: parseInt(data.week_occurrences),
				todayOccurrences: parseInt(data.today_occurrences),
				lastOccurrenceAt: data.last_occurrence_at,
			})
		}
	} catch (error) {
		if (process.env.TRAKER_ENV !== 'test') {
			console.error("Error on trackings-get-v1:", error)
		}

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'error',
				error: process.env.STAGE === 'dev' ? error : 'Internal Server Error',
			}),
		}
	}
}
