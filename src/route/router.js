const express = require('express')
const bodyParser = require('body-parser')
const user = require('./private/user')
const files = require('./private/files')
const project = require('./private/project')
const checkJwt = require('../middleware/checkJwt')
const error = require('../middleware/errorHandle')

module.exports = (app) => {
  app.use(bodyParser.urlencoded())
  app.use(bodyParser.json())
  app.use(bodyParser.raw())
  app.use('/public/files', express.static('public'))
  app.use('/private/users', checkJwt, user)
  app.use('/private/files', checkJwt, files)
  app.use('/private/project', checkJwt, project)
  app.use(error)
}
