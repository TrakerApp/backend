import Tracking from "../../../../../models/tracking.model.js"

export const handler = async (event) => {
	const userId = "asdf1234"; // temporal until we have cognito implemented in app
	const { name } = JSON.parse(event.body);
	const { trackingId } = event.pathParameters;

	if (!trackingId || trackingId === '' || !name || name === '') {
		return { statusCode: 400, body: JSON.stringify({ error: 'Required attributes: trackingId, name' }) }
	}

	try {
		await Tracking.update({ userId, trackingId }, { name });

		return { statusCode: 201 }
	} catch (error) {
		const msg = error.toString()
		if (msg.match(/duplicate.key/) && msg.match(/name_unique/)) {
			return { statusCode: 409, body: JSON.stringify({ error: 'Tracking already exists' }) }
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
