import { expect, cleanAllModels } from "../../../test_helper.js"
import Tracking from "../../../../models/tracking.model.js"
import Occurrence from "../../../../models/occurrence.model.js"
import { handler } from "../../../../services/v1/trackings-api/occurrences/index.js"

describe('trackings-occurrences-v1', function () {
	cleanAllModels()

	it('returns all occurrences for the trackingId paginated', async () => {
		const { userId, trackingId } = await Tracking.create({ userId: 'user1', name: 'tracking1' })

		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })

		let event = {
			body: JSON.stringify({ userId }),
			pathParameters: { trackingId }
		}
		let response = await handler(event)

		expect(response.statusCode).to.equal(200)
		const body = JSON.parse(response.body)

		const bodyOccurrences = body.occurrences.map(t => t.occurrenceId).sort((a, b) => a - b)
		const expectedOccurrences = (await Occurrence.findAllForTracking({ trackingId })).map(t => t.occurrenceId).sort((a, b) => a - b)

		expect(bodyOccurrences).to.deep.equal(expectedOccurrences)
	})

	it('returns results paginated', async () => {
		const { userId, trackingId } = await Tracking.create({ userId: 'user1', name: 'tracking1' })

		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })

		// by default: 10 results per page
		let event = {
			body: JSON.stringify({ userId }),
			pathParameters: { trackingId }
		}
		let response = await handler(event)

		expect(response.statusCode).to.equal(200)
		let body = JSON.parse(response.body)
		expect(body.totalHits).to.equal(11)
		expect(body.total).to.equal(10)
		expect(body.occurrences.length).to.equal(10)

		// page 1, perPage 5
		event = {
			body: JSON.stringify({ userId, page: 1, perPage: 5 }),
			pathParameters: { trackingId }
		}
		response = await handler(event)

		expect(response.statusCode).to.equal(200)
		body = JSON.parse(response.body)
		expect(body.totalHits).to.equal(11)
		expect(body.total).to.equal(5)
		expect(body.occurrences.length).to.equal(5)

		// page 3, perPage 6
		event = {
			body: JSON.stringify({ userId, page: 3, perPage: 6 }),
			pathParameters: { trackingId }
		}
		response = await handler(event)

		expect(response.statusCode).to.equal(200)
		body = JSON.parse(response.body)
		expect(body.totalHits).to.equal(11)
		expect(body.total).to.equal(0)
		expect(body.occurrences.length).to.equal(0)
	})

	it('returns 404 if trying to obtain the occurrences of a trackingId of another userId', async () => {
		const tracking1 = await Tracking.create({ userId: 'user1', name: 'tracking1' })
		const tracking2 = await Tracking.create({ userId: 'user2', name: 'tracking2' })

		const baseParams = { pathParameters: { trackingId: tracking1.trackingId } }

		let response = await handler({ ...baseParams, body: JSON.stringify({ userId: tracking1.userId }) })
		expect(response.statusCode).to.equal(200)

		response = await handler({ ...baseParams, body: JSON.stringify({ userId: tracking2.userId }) })
		expect(response.statusCode).to.equal(404)
	})

	it('returns 404 if the tracking does not exists', async () => {

	})
})
