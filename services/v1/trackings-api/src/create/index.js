import Tracking from "../../../../../models/tracking.model.js"

export const handler = async (event) => {
	const userId = "asdf1234"; // temporal until we have cognito implemented in app
	const { name } = JSON.parse(event.body);
	
	try {
		const tracking = await Tracking.create({ userId, name });

		return { statusCode: 201, body: JSON.stringify({ tracking_id: tracking.trackingId }) }
	} catch (error) {
		console.error("Error on trackings-create-v1:", error)

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
