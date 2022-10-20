import { expect, cleanAllModels, generateRequestContext } from "../../../test_helper.js"
import Tracking from "../../../../models/tracking.model.js"
import { handler } from "../../../../services/v1/trackings-api/list/index.js"

describe('trackings-list-v1', function () {
	cleanAllModels()

	it('returns all existing trackings per userId', async () => {
		await Tracking.create({ userId: 'user1', name: 'tracking1' })
		await Tracking.create({ userId: 'user1', name: 'tracking2' })
		await Tracking.create({ userId: 'user1', name: 'tracking3' })
		await Tracking.create({ userId: 'user2', name: 'tracking1' })

		const event = { ...generateRequestContext('user1'), body: '{}' }
		const response = await handler(event)

		expect(response.statusCode).to.equal(200)
		const body = JSON.parse(response.body)
		expect(body.totalHits).to.equal(3)
		expect(body.total).to.equal(3)
		expect(body.trackings.length).to.equal(3)

		const trackingNames = body.trackings.map(t => t.name)
		expect(trackingNames).to.include('tracking1')
		expect(trackingNames).to.include('tracking2')
		expect(trackingNames).to.include('tracking3')
	})

	it('returns results in a paginated way', async () => {
		const userId = 'user1'

		await Tracking.create({ userId: userId, name: 'tracking1' })
		await Tracking.create({ userId: userId, name: 'tracking2' })
		await Tracking.create({ userId: userId, name: 'tracking3' })
		await Tracking.create({ userId: userId, name: 'tracking4' })
		await Tracking.create({ userId: userId, name: 'tracking5' })
		await Tracking.create({ userId: userId, name: 'tracking6' })

		let response = await handler({ ...generateRequestContext(userId), queryStringParameters: { page: 1, perPage: 2 } })
		expect(response.statusCode).to.equal(200)
		let body = JSON.parse(response.body)
		expect(body.totalHits).to.equal(6)
		expect(body.total).to.equal(2)
		expect(body.page).to.equal(1)
		expect(body.perPage).to.equal(2)
		expect(body.totalPages).to.equal(3)
		expect(body.trackings.length).to.equal(2)
		expect(body.trackings[0].name).to.eq('tracking1')
		expect(body.trackings[1].name).to.eq('tracking2')

		response = await handler({ ...generateRequestContext(userId), queryStringParameters: { page: 2, perPage: 3 } })
		expect(response.statusCode).to.equal(200)
		body = JSON.parse(response.body)
		expect(body.totalHits).to.equal(6)
		expect(body.total).to.equal(3)
		expect(body.page).to.equal(2)
		expect(body.perPage).to.equal(3)
		expect(body.totalPages).to.equal(2)
		expect(body.trackings.length).to.equal(3)
		expect(body.trackings[0].name).to.eq('tracking4')
		expect(body.trackings[1].name).to.eq('tracking5')
		expect(body.trackings[2].name).to.eq('tracking6')
	})
})
