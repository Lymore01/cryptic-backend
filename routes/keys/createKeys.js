const express = require('express')
const keysRoute = express.Router()
const { createKeys } = require("../../controllers/keys/keysController")


keysRoute.post("/api/generate-keys", createKeys)

module.exports = keysRoute