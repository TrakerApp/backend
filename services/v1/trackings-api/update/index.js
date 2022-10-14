import Tracking from "../../../../models/tracking.model.js"
import { isBlank } from "../../../../libs/validation.js"
import { getUserId } from "../../../../libs/getUserId.js";

export const handler = async (event) => {
	const userId = getUserId(event);
	const { name } = JSON.parse(event.body); // temporal until we have cognito implemented in app
	const { trackingId } = event.pathParameters;

	if (isBlank(trackingId) || isBlank(name) || isBlank(userId)) {
		return { statusCode: 400, body: JSON.stringify({ error: 'required attributes: userId, trackingId, name' }) }
	}

	try {
		await Tracking.update({ userId, trackingId }, { name });

		return { statusCode: 201 }
	} catch (error) {
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
