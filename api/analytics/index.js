const express=require('express')
const isAuth = require("../../middlewares/isAuth");

const analyticsController = require('./analytics_controller')

const router = express.Router()

router.route('/todo').get(isAuth, analyticsController.getAnalytics)

module.exports = router
