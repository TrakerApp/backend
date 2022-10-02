import { expect, cleanAllModels } from "../../../test_helper.js"
import Tracking from "../../../../models/tracking.model.js"
import { handler } from "../../../../services/v1/trackings-api/update/index.js"

describe('trackings-update-v1', function () {
	cleanAllModels()

	it('updates the name correctly', async () => {
		let tracking = await Tracking.create({ userId: 'user1', name: 'tracking1' })

		const params = {
			userId: tracking.userId,
			name: "pepetrueno"
		}

		const event = {
			pathParameters: { trackingId: tracking.trackingId },
			body: JSON.stringify(params)
		}

		const response = await handler(event)

		expect(response.statusCode).to.equal(201)
		
		tracking = await Tracking.findById(tracking.trackingId)
		expect(tracking.name).to.equal(params.name)
	})

	it('returns 400 error when no trackingId, name or userId present', async () => {
		let tracking = await Tracking.create({ userId: 'user1', name: 'tracking1' })

		let response = await handler({ pathParameters: { trackingId: tracking.trackingId }, body: JSON.stringify({ userId: "1234" }) })
		expect(response.statusCode).to.equal(400)
		expect(response.body).to.match(/required.attributes/)

		response = await handler({ pathParameters: { trackingId: tracking.trackingId }, body: JSON.stringify({ name: "test-tracking" }) })
		expect(response.statusCode).to.equal(400)
		expect(response.body).to.match(/required.attributes/)

		response = await handler({ pathParameters: {}, body: JSON.stringify({ userId: "1234", name: "test-tracking" }) })
		expect(response.statusCode).to.equal(400)
		expect(response.body).to.match(/required.attributes/)

		response = await handler({ pathParameters: { trackingId: tracking.trackingId }, body: JSON.stringify({ userId: "1234", name: "test-tracking" }) })
		expect(response.statusCode).to.equal(201)
	})

	it('returns 409 error when tracking name already in use by user', async () => {
		let tracking1 = await Tracking.create({ userId: 'user1', name: 'tracking1' })
		await Tracking.create({ userId: 'user1', name: 'tracking2' })


		const params = {
			userId: tracking1.userId,
			name: "tracking2"
		}

		let response = await handler({
			pathParameters: { trackingId: tracking1.trackingId },
			body: JSON.stringify(params)
		})

		expect(response.statusCode).to.equal(409)
		expect(response.body).to.match(/tracking.name.already.exists/)

		params.name = 'other tracking'

		response = await handler({
			pathParameters: { trackingId: tracking1.trackingId },
			body: JSON.stringify(params)
		})
		expect(response.statusCode).to.equal(201)
	})
})
