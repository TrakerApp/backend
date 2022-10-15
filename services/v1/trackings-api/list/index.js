import Tracking from "../../../../models/tracking.model.js"
import { getUserId } from "../../../../libs/getUserId.js";

export const handler = async (event) => {
	const userId = getUserId(event);
	const page = event.queryStringParameters?.page || 1;
	const perPage = event.queryStringParameters?.perPage || 10;

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
