import Tracking from "../../../../models/tracking.model.js"

export const handler = async (event) => {
	const { userId, page, per_page } = JSON.parse(event.body); //  temporal until we have cognito implemented in app

	const trackings = await Tracking.findAll({ userId, page, per_page });

	return {
		statusCode: 200,
		body: JSON.stringify({
			totalHits: trackings.totalHits,
			total: trackings.length,
			page: page,
			per_page: per_page,
			trackings: trackings
		}),
	}
}
