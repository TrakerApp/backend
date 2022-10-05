import Occurrence from "../../../../models/occurrence.model.js";
import Tracking from "../../../../models/tracking.model.js";

export const handler = async (event) => {
	const { userId, page, perPage } = JSON.parse(event.body);
	const { trackingId } = event.pathParameters;

	const trackingExists = await Tracking.exists({ userId, trackingId })

	if (!trackingExists) {
		return { statusCode: 404, body: JSON.stringify({ error: 'tracking not found' }) }
	}

	const occurrences = await Occurrence.findAllByTrackingId({ trackingId, page, perPage });

	return {
		statusCode: 200,
		body: JSON.stringify({
			totalHits: occurrences.totalHits,
			total: occurrences.length,
			page: page,
			perPage: perPage,
			occurrences: occurrences
		}),
	}
}
