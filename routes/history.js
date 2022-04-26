const express = require('express');
const { history } = require('../data/history');
const { checkEmail, checkPassword, checkName, checkFirstName, checkLastName, checkPhone, checkBool, checkVenmo, checkAddress, checkIsDriver, checkId, checkString, checkDate, checkTime, checkCapacity } = require('../misc/validate')
const router = express.Router();

module.exports = router;