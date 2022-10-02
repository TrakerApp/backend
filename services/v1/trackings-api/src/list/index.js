import Tracking from "../../../../../models/tracking.model.js"

module.exports.handler = async (event, context) => {
	const userId = "asdf1234"; // temporal until we have cognito implemented in app

	const trackings = await Tracking.findAll({ userId })

	return {
		statusCode: 200,
		body: JSON.stringify({
			total: trackings.length,
			trackings: trackings
		}),
	}
}
