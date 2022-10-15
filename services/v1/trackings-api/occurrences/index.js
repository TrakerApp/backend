import Occurrence from "../../../../models/occurrence.model.js";
import Tracking from "../../../../models/tracking.model.js";
import { getUserId } from "../../../../libs/getUserId.js";

export const handler = async (event) => {
	const userId = getUserId(event);
	const page = event.queryStringParameters?.page || 1;
	const perPage = event.queryStringParameters?.perPage || 10;

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
