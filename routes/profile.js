const express = require('express');
const { users } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver } = require('../misc/validate')
const US_States = require('../const/USStates.json')
const router = express.Router();

router
    .route('/profile')
    .get(async (req, res) => {
        if (req.session.user) {
            const user = await users.getUser(req.session.user.email)
            const { firstName, lastName, email, phone, venmo, driver, passenger} = user
            const { address, city, state, zipcode } = user.address
            try {
                email = checkEmail(email)
                firstName = checkFirstName(firstName)
                lastName = checkLastName(lastName)
                phone = checkPhone(phone)
                venmo = checkVenmo(venmo)
                address = checkAddress(address)
                
            } catch (e) {
                const templateData = {
                    error: e
                }
                return res.status(400).render('templates/users', templateData)
            }
            const templateData = {
                authenticated: true
            }
            return res.render('templates/profile', templateData)
        }
        else return res.render('templates/index')
    })

router
    .route('/updateProfile')
    .get(async (req, res) => {

    })

module.exports = router