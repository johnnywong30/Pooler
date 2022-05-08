const express = require('express');
const { users } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver, checkZipcode } = require('../misc/validate')
const US_States = require('../const/USStates.json')
const router = express.Router();
const xss = require('xss')

router
    .route('/')
    .get(async (req, res) => {
        if (req.session.user) {
            const user = await users.getUser(checkEmail(xss(req.session.user.email)))
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
                    error: e,
                    layout: 'custom'
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
                states: states,
                layout: 'custom'
            }
            return res.render('templates/profile', templateData)
        }
        else return res.redirect('/')
    })
    .post(async (req, res) => {
        if (req.session.user) {   
            //check if the user exists
            let user = {}
            try {
                user = await users.getUser(checkEmail(xss(req.session.user.email)))
            } catch (e) {
                const templateData = {
                    error: e,
                    layout: 'custom'
                }
                return res.status(404).render('templates/profile', templateData)
            }
            let { firstName, lastName, email, phone, venmo, address, isDriver } = req.body
            try {
                // use the actual request data
                email = checkEmail(xss(email))
                firstName = checkFirstName(xss(firstName))
                lastName = checkLastName(xss(lastName))
                phone = checkPhone(xss(phone))
                venmo = checkVenmo(xss(venmo))
                address = checkAddress(address)
                isDriver = checkIsDriver(isDriver)
                
            } catch (e) {
                const templateData = {
                    ...user,
                    error: e,
                    layout: 'custom'
                }
                return res.status(400).render('templates/profile', templateData)
            }
            // try to update the user
            try {
                await users.updateUser(email, firstName, lastName, phone, venmo, address, isDriver)
            } catch (e) {
                const templateData = {
                    ...user,
                    error: e,
                    layout: 'custom'
                }
                return res.status(400).render('templates/profile', templateData)
            }
            // at this point, we know all the data is valid
            return res.redirect('/profile')
        }
        else {
            return res.redirect('/')
        }
    })

module.exports = router