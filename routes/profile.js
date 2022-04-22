const express = require('express');
const { users } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver, checkZipcode } = require('../misc/validate')
const US_States = require('../const/USStates.json')
const router = express.Router();

router
    .route('/profile')
    .get(async (req, res) => {
        if (req.session.user) {
            const user = await users.getUser(req.session.user.email)
            let { firstName, lastName, email, phone, venmo, driver, address } = user
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
                console.log(e)
                return res.status(400).render('templates/profile', templateData)
            }
            let { city, state, zipcode } = user.address
            let street = user.address.address
            const states = Object.keys(US_States)
            const templateData = {
                authenticated: true,
                email: email,
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                venmo: venmo,
                street: street,
                city: city,
                state: state,
                zipcode: zipcode,
                isDriver: driver,
                states: states
            }
            return res.render('templates/profile', templateData)
        }
        else return res.redirect('/')
    })

router
    .route('/updateProfile')
    .post(async (req, res) => {

    })

module.exports = router