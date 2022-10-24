import { expect, cleanAllModels, generateRequestContext } from "../../../test_helper.js"
import Tracking from "../../../../models/tracking.model.js"
import Occurrence from "../../../../models/occurrence.model.js"
import { handler } from "../../../../services/v1/trackings-api/delete/index.js"

const FAKE_UUID = '4299d1c2-a7bb-4e42-8778-e40a280fe015'

describe('trackings-delete-v1', function () {
	cleanAllModels()

	it('removes the tracking along with its occurrences', async () => {
		const { userId, trackingId } = await Tracking.create({ userId: 'user1', name: 'tracking1' })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })
		await Tracking.track({ userId, trackingId })

		expect(await Occurrence.countByTrackingid({ trackingId })).to.eq(3)
		expect(await Tracking.exists({ userId, trackingId })).to.eq(true)

		let event = {
			...generateRequestContext(userId),
			pathParameters: { trackingId }
		}
		let response = await handler(event)

		expect(response.statusCode).to.equal(204)

		expect(await Occurrence.countByTrackingid({ trackingId })).to.eq(0)
		expect(await Tracking.exists({ userId, trackingId })).to.eq(false)
	})

	it('fails when removing tracking of another userId or unexistant trackingId', async () => {
		const tracking1 = await Tracking.create({ userId: 'user1', name: 'tracking1' })
		const tracking2 = await Tracking.create({ userId: 'user2', name: 'tracking2' })

		// tracking id of another user
		let event = {
			...generateRequestContext(tracking1.userId),
			pathParameters: { trackingId: tracking2.trackingId }
		}
		let response = await handler(event)

		expect(response.statusCode).to.equal(404)
		expect(response.body).to.equal(JSON.stringify({ error: 'tracking not found' }))

		// fake tracking id
		event = {
			...generateRequestContext(tracking1.userId),
			pathParameters: { trackingId: FAKE_UUID }
		}
		response = await handler(event)

		expect(response.statusCode).to.equal(404)
		expect(response.body).to.equal(JSON.stringify({ error: 'tracking not found' }))

		// fake user id
		event = {
			...generateRequestContext(FAKE_UUID),
			pathParameters: { trackingId: tracking1.trackingId }
		}
		response = await handler(event)

		expect(response.statusCode).to.equal(404)
		expect(response.body).to.equal(JSON.stringify({ error: 'tracking not found' }))
	})

	it('wont remove occurrences of another tracking', async () => {
		const tracking1 = await Tracking.create({ userId: 'user1', name: 'tracking1' })
		const tracking2 = await Tracking.create({ userId: 'user1', name: 'tracking2' })

		await Tracking.track({ userId: tracking1.userId, trackingId: tracking1.trackingId })
		await Tracking.track({ userId: tracking1.userId, trackingId: tracking1.trackingId })
		await Tracking.track({ userId: tracking1.userId, trackingId: tracking1.trackingId })
		await Tracking.track({ userId: tracking1.userId, trackingId: tracking2.trackingId })
		await Tracking.track({ userId: tracking1.userId, trackingId: tracking2.trackingId })
		
		expect(await Occurrence.countByTrackingid({ trackingId: tracking1.trackingId })).to.eq(3)
		expect(await Occurrence.countByTrackingid({ trackingId: tracking2.trackingId })).to.eq(2)

		let event = {
			...generateRequestContext(tracking1.userId),
			pathParameters: { trackingId: tracking1.trackingId }
		}
		let response = await handler(event)

		expect(response.statusCode).to.equal(204)

		expect(await Occurrence.countByTrackingid({ trackingId: tracking1.trackingId })).to.eq(0)
		expect(await Occurrence.countByTrackingid({ trackingId: tracking2.trackingId })).to.eq(2)
	})
})
