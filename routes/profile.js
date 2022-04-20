const express = require('express');
const { users } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver } = require('../misc/validate')
const US_States = require('../const/USStates.json')
const router = express.Router();

router
    .route('/')
    .get(async (req, res) => {
        if (req.session.user) {
            const templateData = {
                authenticated: true
            }
            return res.render('templates/profile', templateData)
        }
        else return res.render('templates/index')
    })

module.exports = router