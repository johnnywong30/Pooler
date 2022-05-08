const express = require('express');
const { users } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver } = require('../misc/validate')
const US_States = require('../const/USStates.json')
const router = express.Router();
const xss = require("xss");


router
    .route('/register')
    .get(async (req, res) => {
        if (req.session.user) return res.redirect('/')
        else {
            const states = Object.keys(US_States)
            const templateData = {
                states: states
            }
            return res.status(200).render('templates/register', templateData)
        }
    })
    .post(async (req, res) => {
        const { email, password, firstName, lastName, phone, venmo, address, isDriver } = req.body
        let register = {}
        try {
            const _email = checkEmail(xss(email))
            const _pass = checkPassword(xss(password))
            const _firstName = checkFirstName(xss(firstName))
            const _lastName = checkLastName(xss(lastName))
            const _phone = checkPhone(xss(phone))
            const _venmo = checkVenmo(xss(venmo))
            const _address = checkAddress(address)
            const boolVal = typeof isDriver === 'boolean' ? isDriver : xss(isDriver)
            const _isDriver = checkIsDriver(boolVal)
            const args = [_email, _pass, _firstName, _lastName, _phone, _venmo, _address, _isDriver]
            register = await users.createUser(...args)
        } catch (e) {
            const states = Object.keys(US_States)
            const templateData = {
                error: e,
                states: states
            }
            return res.status(400).render('templates/register', templateData)
        }
        if (register.userRegistered) return res.redirect('/login')
        else {
            const templateData = {
                error: 'Internal Server Error'
            }
            return res.status(500).render('templates/error', templateData)
        }
    })

router
    .route('/login')
    .get(async (req, res) => {
        if (req.session.user) return res.redirect('/')
        else return res.status(200).render('templates/login', {layout: 'main'})
    })
    .post(async (req, res) => {
        const { email, password } = req.body
        let auth = {}
        let userEmail = ''
        let pass = ''
        // validate
        try {
            userEmail = checkEmail(xss(email))
            pass = checkPassword(xss(password))
        } catch (e) {
            const templateData = {
                error: 'You did not provide a valid email and/or password.'
            }
            return res.status(400).render('templates/login', templateData)
        }
        try {
            auth = await users.checkUser(userEmail, pass)
        } catch (e) {
            const templateData = {
                error: 'Account not found with given email and/or password.'
            }
            return res.status(404).render('templates/login', templateData)
        }
        if (auth.authenticated) {
            req.session.user = {
                email: userEmail
            }
            return res.redirect('/')
        } else {
            const templateData = {
                error: 'You did not provide a valid email and/or password.'
            }
            return res.status(400).render('templates/login', templateData)
        }
    })

router
    .route('/logout')
    .get(async (req, res) => {
        if (req.session.user) {
            req.session.destroy()
        }
        return res.redirect('/')
    })

router
    .route('/')
    .get(async (req, res) => {
        const templateData = {
            authenticated: false,
            layout: 'custom'
        }
        if (req.session.user) {
            templateData.authenticated = true
        }
        return res.status(200).render('templates/index', templateData)
    })


module.exports = router