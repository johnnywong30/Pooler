const express = require('express');
const users = require('../data/users')
const router = express.Router();

// TODO: test
router
    .route('/register')
    .get(async (req, res) => {
        if (req.session.user) return res.redirect('/')
        else return res.render('templates/register')
    })
    .post(async (req, res) => {
        const { username, password } = req.body
        let register = {}
        try {
            const user = checkUsername(username)
            const pass = checkPassword(password)
            register = await createUser(user, pass)
        } catch (e) {
            const templateData = {
                error: e
            }
            return res.status(400).render('templates/register', templateData)
        }
        if (register.userRegistered) return res.redirect('/')
        else {
            const templateData = {
                error: 'Internal Server Error'
            }
            return res.status(500).render('templates/error', templateData)
        }
    })

// TODO: test
router
    .route('/login')
    .post(async (req, res) => {
        const { username, password } = req.body
        let auth = {}
        let user = ''
        try {
            user = checkUsername(username)
            const pass = checkPassword(password)
            auth = await checkUser(user, pass)
        } catch (e) {
            const templateData = {
                error: e
            }
            return res.status(400).render('templates/login', templateData)
        }
        if (auth.authenticated) {
            req.session.user = {
                username: user
            }
            return res.redirect('/')
        } else {
            const templateData = {
                error: 'You did not provide a valid username and/or password.'
            }
            return res.status(400).render('templates/login', templateData)
        }
    })

// TODO: test
router
    .route('/logout')
    .get(async (req, res) => {
        if (req.session.user) {
            req.session.destroy()    
        }
        return res.redirect('/')
    })

// TODO: test
router
    .route('/')
    .get(async (req, res) => {
        if (req.session.user) {
            const templateData = {
                authenticated: true
            }
            return res.render('templates/index', templateData)
        }
        else return res.render('templates/index')
    })



module.exports = {
    router: router
}