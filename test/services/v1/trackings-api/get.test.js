import { expect, cleanAllModels, generateRequestContext } from "../../../test_helper.js"
import Tracking from "../../../../models/tracking.model.js"
import Occurrence from "../../../../models/occurrence.model.js"
import { handler } from "../../../../services/v1/trackings-api/get/index.js"

describe('trackings-get-v1', function () {
	cleanAllModels()

	it('gets tracking information', async () => {
		// create tracking and occurrences
		const userId = 'test'
		const tracking = await Tracking.create({ name: 'test', userId: userId })
		await Tracking.track({ trackingId: tracking.trackingId, userId: userId })
		await Tracking.track({ trackingId: tracking.trackingId, userId: userId })
		const occurrences = await Occurrence.findAllForTracking({ trackingId: tracking.trackingId })
		const lastOccurrenceDate = occurrences[0].createdAt

		const event = {
			...generateRequestContext(userId),
			body: '{}',
			pathParameters: { trackingId: tracking.trackingId }
		}

		// first track
		const response = await handler(event)
		const { name, weekOccurrences, todayOccurrences, lastOccurrenceAt } = JSON.parse(response.body)

		expect(response.statusCode).to.equal(200)
		expect(name).to.eq('test')
		expect(weekOccurrences).to.eq(2)
		expect(todayOccurrences).to.eq(2)
		expect(lastOccurrenceAt).to.eq(lastOccurrenceDate.toISOString())
	})
})
