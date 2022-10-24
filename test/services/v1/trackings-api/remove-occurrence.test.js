import { expect, cleanAllModels, generateRequestContext } from "../../../test_helper.js"
import Tracking from "../../../../models/tracking.model.js"
import Occurrence from "../../../../models/occurrence.model.js"
import { handler } from "../../../../services/v1/trackings-api/remove-occurrence/index.js"

const FAKE_UUID = '4299d1c2-a7bb-4e42-8778-e40a280fe015'

describe('trackings-remove-occurrence-v1', function () {
	cleanAllModels()

	it('removes the occurrence', async () => {
		const { userId, trackingId } = await Tracking.create({ userId: 'user1', name: 'tracking1' })
		const { occurrenceId } = await Tracking.track({ userId, trackingId })

		expect(await Occurrence.exists({ trackingId, occurrenceId })).to.eq(true)

		let event = {
			...generateRequestContext(userId),
			pathParameters: { trackingId, occurrenceId }
		}
		let response = await handler(event)

		expect(response.statusCode).to.equal(204)

		expect(await Occurrence.exists({ trackingId, occurrenceId })).to.eq(false)
	})

	it('updates the tracking lastOccurrenceAt', async () => {
		const { userId, trackingId } = await Tracking.create({ userId: 'user1', name: 'tracking1' })
		const occurrence1 = await Tracking.track({ userId, trackingId })
		const occurrence2 = await Tracking.track({ userId, trackingId })

		expect(await Occurrence.exists({ trackingId, occurrenceId: occurrence1.occurrenceId })).to.eq(true)
		expect(await Occurrence.exists({ trackingId, occurrenceId: occurrence2.occurrenceId })).to.eq(true)

		let tracking = await Tracking.findById(trackingId)
		expect(tracking.lastOccurrenceAt.toISOString()).to.eq(occurrence2.createdAt.toISOString())

		// should be occurrence1 date
		let event = {
			...generateRequestContext(userId),
			pathParameters: { trackingId, occurrenceId: occurrence2.occurrenceId }
		}
		let response = await handler(event)

		expect(response.statusCode).to.equal(204)

		expect(await Occurrence.exists({ trackingId, occurrenceId: occurrence2.occurrenceId })).to.eq(false)
		tracking = await Tracking.findById(trackingId)
		expect(tracking.lastOccurrenceAt.toISOString()).to.eq(occurrence1.createdAt.toISOString())

		// should be null
		event = {
			...generateRequestContext(userId),
			pathParameters: { trackingId, occurrenceId: occurrence1.occurrenceId }
		}
		response = await handler(event)

		expect(response.statusCode).to.equal(204)

		expect(await Occurrence.exists({ trackingId, occurrenceId: occurrence1.occurrenceId })).to.eq(false)
		tracking = await Tracking.findById(trackingId)
		expect(tracking.lastOccurrenceAt).to.eq(null)
	})

	it('returns error when invalid user id, trackign id or occurrence id provided', async () => {
		const { userId, trackingId } = await Tracking.create({ userId: 'user1', name: 'tracking1' })
		const { occurrenceId } = await Tracking.track({ userId, trackingId })

		const otherTracking = await Tracking.create({ userId: 'user2', name: 'tracking2' })
		const otherOccurrence = await Tracking.track({ userId, trackingId: otherTracking.trackingId })

		// invalid user id
		let event = {
			...generateRequestContext('fake-user-id'),
			pathParameters: { trackingId, occurrenceId }
		}
		let response = await handler(event)

		expect(response.statusCode).to.equal(404)
		let body = JSON.parse(response.body)
		expect(body.error).to.equal('tracking not found')

		// tracking id of another user
		event = {
			...generateRequestContext(otherTracking.userId),
			pathParameters: { trackingId, occurrenceId }
		}
		event.pathParameters = { trackingId, occurrenceId: otherOccurrence.occurrenceId }
		response = await handler(event)

		expect(response.statusCode).to.equal(404)
		body = JSON.parse(response.body)
		expect(body.error).to.equal('tracking not found')

		// invalid occurrence id
		event = {
			...generateRequestContext(userId),
			pathParameters: { trackingId, occurrenceId: otherOccurrence.occurrenceId }
		}
		response = await handler(event)

		expect(response.statusCode).to.equal(404)
		body = JSON.parse(response.body)
		expect(body.error).to.equal('occurrence not found')

		// all good
		event = {
			...generateRequestContext(userId),
			pathParameters: { trackingId, occurrenceId }
		}
		response = await handler(event)

		expect(response.statusCode).to.equal(204)
	})
})
