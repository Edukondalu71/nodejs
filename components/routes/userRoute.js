  const express = require('express')
  const router = express.Router()
  const userController = require('../controllers/userController')
  const User = require('../modals/User')


  //get , post , put/patch delete

  router.post('/add-user',  userController.createUser)

  module.exports = router