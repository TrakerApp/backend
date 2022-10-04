import Tracking from "../../../../models/tracking.model.js"

export const handler = async (event) => {
	const { userId, page, perPage } = JSON.parse(event.body); //  temporal until we have cognito implemented in app

	const trackings = await Tracking.findAll({ userId, page, perPage });

	return {
		statusCode: 200,
		body: JSON.stringify({
			totalHits: trackings.totalHits,
			total: trackings.length,
			page: page,
			perPage: perPage,
			trackings: trackings
		}),
	}
}
