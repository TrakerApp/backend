import Tracking from "../../../../models/tracking.model.js"
import { isBlank } from "../../../../libs/validation.js"

export const handler = async (event) => {
	// userId is temporal until we have cognito implemented in app
	const { userId } = JSON.parse(event.body);
	const { trackingId } = event.pathParameters;

	if (isBlank(userId) || isBlank(trackingId)) {
		return { statusCode: 400, body: JSON.stringify({ error: 'required attributes: userId, trackingId' }) }
	}

	try {
		const tracking = await Tracking.exists({ userId, trackingId });

		if (!tracking) {
			return { statusCode: 404, body: JSON.stringify({ error: 'tracking not found' }) }
		}

		const lastOccurrenceAt = await Tracking.track({ userId, trackingId });

		return { statusCode: 201, body: JSON.stringify({ lastOccurrenceAt }) }
	} catch (error) {
		if (process.env.TRAKER_ENV !== 'test') {
			console.error("Error on trackings-track-v1:", error)
		}

		const msg = error.toString()
		if (msg.match(/duplicate.key/) && msg.match(/name_unique/)) {
			return { statusCode: 409, body: JSON.stringify({ error: 'tracking name already exists' }) }
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
