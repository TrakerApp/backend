import { expect, cleanAllModels, sleep, generateRequestContext } from "../../../test_helper.js"
import Tracking from "../../../../models/tracking.model.js"
import Occurrence from "../../../../models/occurrence.model.js"
import { handler } from "../../../../services/v1/trackings-api/track/index.js"

describe('trackings-track-v1', function () {
	cleanAllModels()

	it('tracks an occurrence on the tracking', async () => {
		const tracking = await Tracking.create({ name: 'test', userId: 'test' })

		const event = {
			...generateRequestContext('test'),
			body: '{}',
			pathParameters: { trackingId: tracking.trackingId }
		}

		// first track
		const response1 = await handler(event)
		expect(response1.statusCode).to.equal(201)
		const response1Body = JSON.parse(response1.body)
		const occurrence1 = { occurrenceId: response1Body.occurrenceId, createdAt: new Date(response1Body.createdAt) }

		sleep(200)

		// second track
		const response2 = await handler(event)
		expect(response2.statusCode).to.equal(201)
		const response2Body = JSON.parse(response2.body)
		const occurrence2 = { occurrenceId: response2Body.occurrenceId, createdAt: new Date(response2Body.createdAt) }

		// verify
		const updatedTracking = await Tracking.findById(tracking.trackingId)
		const occurrences = await Occurrence.findAllForTracking({ trackingId: tracking.trackingId })

		expect(updatedTracking.lastOccurrenceAt.toISOString()).to.equal(occurrence2.createdAt.toISOString())
		expect(occurrences.length).to.equal(2)
		expect(occurrences[0].occurrenceId).to.equal(occurrence2.occurrenceId)
		expect(occurrences[0].createdAt.toISOString()).to.equal(occurrence2.createdAt.toISOString())
		expect(occurrences[1].occurrenceId).to.equal(occurrence1.occurrenceId)
		expect(occurrences[1].createdAt.toISOString()).to.equal(occurrence1.createdAt.toISOString())
	})

	it('returns 404 when tracking does not exists', async () => {
		await Tracking.create({ userId: "1234", name: "test-tracking" })

		const event = {
			...generateRequestContext('1234'),
			body: '{}',
			pathParameters: { trackingId: "4299d1c2-a7bb-4e42-8778-e40a280fe015" }
		}

		const response = await handler(event)

		expect(response.statusCode).to.equal(404)
		expect(response.body).to.equal(JSON.stringify({ error: 'tracking not found' }))
	})
})
