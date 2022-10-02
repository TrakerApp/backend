// CHAI CONFIGURATIONS
import chai from "chai"

const { expect } = chai

// Model setup
import Tracking from "../models/tracking.model.js"
import Occurrence from "../models/occurrence.model.js"
const ALL_MODELS = [Tracking, Occurrence]

// ACTUAL HELPERS
const cleanAllModels = () => {
	beforeEach(async () => {
		for (const model of ALL_MODELS) {
			await model.deleteAllRecords()
		}
	})
}


export {
	cleanAllModels,
	chai, expect
}
