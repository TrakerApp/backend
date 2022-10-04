import repl from 'node:repl'

// import models
import BaseModel from './models/base.model.js'
import Tracking from './models/tracking.model.js'
import Occurrence from './models/occurrence.model.js'

const replServer = repl.start('> ')

replServer.context.BaseModel = BaseModel
replServer.context.Tracking = Tracking
replServer.context.Occurrence = Occurrence
replServer.context.sql = BaseModel.sql
