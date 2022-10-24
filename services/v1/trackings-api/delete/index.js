import Occurrence from "../../../../models/occurrence.model.js";
import Tracking from "../../../../models/tracking.model.js";
import { getUserId } from "../../../../libs/getUserId.js";

export const handler = async (event) => {
	const userId = getUserId(event);

	const { trackingId } = event.pathParameters;

	const trackingExists = await Tracking.exists({ userId, trackingId })

	if (!trackingExists) {
		return { statusCode: 404, body: JSON.stringify({ error: 'tracking not found' }) }
	}

	await Occurrence.deleteAll({ trackingId })
	await Tracking.delete({ userId, trackingId })

	return { statusCode: 204 }
}
