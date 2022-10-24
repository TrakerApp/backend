import Occurrence from "../../../../models/occurrence.model.js";
import Tracking from "../../../../models/tracking.model.js";
import { getUserId } from "../../../../libs/getUserId.js";

export const handler = async (event) => {
	const userId = getUserId(event);

	const { trackingId, occurrenceId } = event.pathParameters;

	const trackingExists = await Tracking.exists({ userId, trackingId })

	if (!trackingExists) {
		return { statusCode: 404, body: JSON.stringify({ error: 'tracking not found' }) }
	}

	const occurrenceExists = await Occurrence.exists({ trackingId, occurrenceId })

	if (!occurrenceExists) {
		return { statusCode: 404, body: JSON.stringify({ error: 'occurrence not found' }) }
	}

	await Occurrence.delete({ occurrenceId })

	return {
		statusCode: 204
	}
}
