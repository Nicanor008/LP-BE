const express = require("express")
const users = require("./users_controllers")
const isAuth = require("../../middlewares/isAuth");

const router = express.Router()

router.route("/").get(users.fetchAllUsers)
router.route("/active").get(isAuth, users.getSingleUser)

module.exports = router
