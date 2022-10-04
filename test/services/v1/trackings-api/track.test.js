import { expect, cleanAllModels, sleep } from "../../../test_helper.js"
import Tracking from "../../../../models/tracking.model.js"
import Occurrence from "../../../../models/occurrence.model.js"
import { handler } from "../../../../services/v1/trackings-api/track/index.js"

describe('trackings-track-v1', function () {
	cleanAllModels()

	it('tracks an occurrence on the tracking', async () => {
		const tracking = await Tracking.create({ name: 'test', userId: 'test' })

		const event = {
			body: JSON.stringify({ userId: 'test' }),
			pathParameters: { trackingId: tracking.trackingId }
		}

		// first track
		const response1 = await handler(event)
		expect(response1.statusCode).to.equal(201)
		const { lastOccurrenceAt: lastOccurrenceAt1 } = JSON.parse(response1.body)

		sleep(200)

		// second track
		const response2 = await handler(event)
		expect(response2.statusCode).to.equal(201)
		const { lastOccurrenceAt: lastOccurrenceAt2 } = JSON.parse(response2.body)

		console.log("lastOccurrenceAt1:", lastOccurrenceAt1)
		console.log("lastOccurrenceAt2:", lastOccurrenceAt2)

		// verify
		const updatedTracking = await Tracking.findById(tracking.trackingId)
		const occurrences = await Occurrence.findAllForTracking({ trackingId: tracking.trackingId })

		console.log("updatedTracking.lastOccurrenceAt:", updatedTracking.lastOccurrenceAt)
		console.log("updatedTracking.lastOccurrenceAt.toJSON():", updatedTracking.lastOccurrenceAt.toJSON())
		console.log("occurrences map createdAt:", occurrences.map(o => o.createdAt))

		expect(updatedTracking.lastOccurrenceAt.toJSON()).to.equal(lastOccurrenceAt2)
		expect(occurrences.length).to.equal(2)
		expect(occurrences[0].createdAt).to.equal(lastOccurrenceAt1)
		expect(occurrences[1].createdAt).to.equal(lastOccurrenceAt2)
	})

	it('returns 404 when tracking does not exists', async () => {
		await Tracking.create({ userId: "1234", name: "test-tracking" })

		const event = {
			body: JSON.stringify({ userId: "1234" }),
			pathParameters: { trackingId: "4299d1c2-a7bb-4e42-8778-e40a280fe015" }
		}

		const response = await handler(event)

		expect(response.statusCode).to.equal(404)
		expect(response.body).to.equal(JSON.stringify({ error: 'tracking not found' }))
	})
})
