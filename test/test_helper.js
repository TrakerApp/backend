// CHAI CONFIGURATIONS
import chai from "chai"

const { expect } = chai

// Model setup
import Tracking from "../models/tracking.model.js"
import Occurrence from "../models/occurrence.model.js"
const ALL_MODELS = [Occurrence, Tracking]

// ACTUAL HELPERS
const cleanAllModels = () => {
	beforeEach(async () => {
		for (const model of ALL_MODELS) {
			await model.deleteAllRecords()
		}
	})
}

const sleep = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

const generateRequestContext = (userId) => { return { requestContext: { authorizer: { jwt: { claims: { sub: userId } } } } } }

export {
	cleanAllModels,
	sleep,
	chai, expect,
	generateRequestContext,
}
