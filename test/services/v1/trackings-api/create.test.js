// const ApplicationValidator = require('../../src/services/application_validator.service')
// const AttachmentFactory = require('../factories/attachment.factory')
import { expect, cleanAllModels } from "../../../test_helper.js"

describe('ApplicationWorkflow', function () {
	cleanAllModels()

	it('works', async () => {
		expect(1).to.equal(1)
	})
})
