import { expect, cleanAllModels, generateRequestContext } from "../../../test_helper.js"
import Tracking from "../../../../models/tracking.model.js"
import { handler } from "../../../../services/v1/trackings-api/create/index.js"

describe('trackings-create-v1', function () {
	cleanAllModels()

	it('creates the record correctly and returns the tracking id', async () => {
		const userId = 'user-1'
		const params = {
			name: "test-tracking"
		}

		const event = {
			...generateRequestContext(userId),
			body: JSON.stringify(params)
		}

		const response = await handler(event)

		expect(response.statusCode).to.equal(201)
		const body = JSON.parse(response.body)

		const tracking = await Tracking.findById(body.trackingId)
		expect(tracking.userId).to.eq(userId)
		expect(tracking.name).to.equal(params.name)
	})

	it('returns 400 error when no name or userId present', async () => {
		let response = await handler({ ...generateRequestContext('1234'), body: "{}" })
		expect(response.statusCode).to.equal(400)
		expect(response.body).to.match(/required.attributes/)

		response = await handler({ body: JSON.stringify({ name: "test-tracking" }) })
		expect(response.statusCode).to.equal(400)
		expect(response.body).to.match(/required.attributes/)

		response = await handler({ ...generateRequestContext('1234'), body: JSON.stringify({ name: "test-tracking" }) })
		expect(response.statusCode).to.equal(201)
	})

	it('returns 409 error when tracking name already in use by user', async () => {
		let response = await handler({ ...generateRequestContext('1234'), body: JSON.stringify({ name: "test-tracking" }) })
		expect(response.statusCode).to.equal(201)

		response = await handler({ ...generateRequestContext('1234'), body: JSON.stringify({ name: "test-tracking" }) })
		expect(response.statusCode).to.equal(409)
		expect(response.body).to.match(/tracking.name.already.exists/)
	})

	it('allows creating the same tracking name by different users', async () => {
		let response = await handler({ ...generateRequestContext('1234'), body: JSON.stringify({ name: "test-tracking" }) })
		expect(response.statusCode).to.equal(201)

		response = await handler({ ...generateRequestContext('12345'), body: JSON.stringify({ name: "test-tracking" }) })
		expect(response.statusCode).to.equal(201)

		expect(await Tracking.findAll({ userId: 'zzz' })).to.have.lengthOf(0)
		expect(await Tracking.findAll({ userId: '1234' })).to.have.lengthOf(1)
		expect(await Tracking.findAll({ userId: '12345' })).to.have.lengthOf(1)
	})
})
