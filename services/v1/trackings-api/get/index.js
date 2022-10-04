import Tracking from "../../../../models/tracking.model.js"

export const handler = async (event) => {
	// userId is temporal until we have cognito implemented in app
	const { userId } = JSON.parse(event.body);
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
				count(week_occurrences) as weekOccurrences,
				count(today_occurrences) as todayOccurrences,
				lastOccurenceAt
			FROM trackings
				INNER JOIN occurrences week_occurrences
					ON week_occurrences.tracking_id = trackings.id
					AND week_occurrences.created_at >= date_trunc('week', now())
				INNER JOIN occurrences today_occurrences
					ON today_occurrences.tracking_id = trackings.id
					AND today_occurrences.created_at >= date_trunc('day', now())
			WHERE trackings.id = ${trackingId}
			GROUP BY trackings.id
		`

		console.log("data is", data)

		return { statusCode: 201, body: JSON.stringify(data) }
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
