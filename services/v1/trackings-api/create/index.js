import Tracking from "../../../../models/tracking.model.js"
import { isBlank } from "../../../../libs/validation.js"

export const handler = async (event) => {
	// userId is temporal until we have cognito implemented in app
	const { userId, name } = JSON.parse(event.body);

	if (isBlank(userId) || isBlank(name)) {
		return { statusCode: 400, body: JSON.stringify({ error: 'required attributes: userId, name' }) }
	}

	try {
		const tracking = await Tracking.create({ userId, name });

		return { statusCode: 201, body: JSON.stringify({ trackingId: tracking.trackingId }) }
	} catch (error) {
		if (process.env.TRAKER_ENV !== 'test') {
			console.error("Error on trackings-create-v1:", error)
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
