const express = require('express');
const { events, carpools, users, comments } = require('../data')
const US_States = require('../const/USStates.json');
const { create } = require('express-handlebars');
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver, checkZipcode, checkString } = require('../misc/validate')
const router = express.Router();
const xss = require('xss')

router
    .route('/')
    .get(async (req, res) => {
        return res.redirect('/events')
    })

router
    .route('/:id')
    .get(async (req, res) => {
        try {
            const user = await users.getUser(req.session.user.email)
            const event = await events.getEventByPoolId(req.params.id)
            const pool = await carpools.getPool(req.params.id)
            const _poolId = req.params.id
            const _driver = await users.getUserById(pool.driver)
            const _driverName = `${_driver.firstName} ${_driver.lastName}`
            const _departureTime = pool.departureTime
            const _capacity = pool.capacity
            let _memberData = pool.members.slice()
            //_memberData.forEach(id => await users.getUserById(id))
            for (let i = 0; i < _memberData.length; i++) {
                try {
                    _memberData[i] = await users.getUserById(_memberData[i])
                } catch (e) {
                    console.log("No such member with ID " + _memberData[i])
                }
            }
            const _numMembers = _memberData.length;
            const _comments = pool.comments
            const _eventName = event.name
            const _isUserInPool = (pool.members.indexOf(user._id) > -1)
            const _eventID = event._id
            const args = {_poolId, _driverName, _departureTime, _capacity, _memberData, _numMembers, _comments, _eventName, _isUserInPool, _eventID}
            return res.render('templates/pool', args);
        } catch (e) {
            const states = Object.keys(US_States)
            const templateData = {
                error: e,
                states: states
            }
            return res.status(400).render('templates/error', templateData)
        }
        
    })

    
router
    .route('/:id/join')
    .get(async (req, res) => {
        try {
            const user = await users.getUser(req.session.user.email)
            const event = await events.getEventByPoolId(req.params.id)
            const pool = await carpools.getPool(req.params.id)
            await carpools.addPooler(event._id, pool._id, user._id)
        } catch (e) {
            console.log(e)
        }
        res.redirect(`/pool/${req.params.id}`)
    })

router
    .route('/:id/leave')
    .get(async (req, res) => {
        try {
            const user = await users.getUser(req.session.user.email)
            const event = await events.getEventByPoolId(req.params.id)
            const pool = await carpools.getPool(req.params.id)
            await carpools.deletePooler(event._id, pool._id, user._id)
        } catch (e) {
            console.log(e)
        }
        res.redirect(`/pool/${req.params.id}`)
    })

// add post routes for adding comment, deleting comment

router
    .route('/:id/createComment')
    .post(async (req, res) => {
        let { createCommentDescription } = req.body
        // check if user, event, and pool exist. also check if it's valid comment
        try {
            const user = await users.getUser(req.session.user.email)
            const event = await events.getEventByPoolId(req.params.id)
            const pool = await carpools.getPool(req.params.id)
            createCommentDescription = checkString(xss(createCommentDescription))
        } catch(e) {
            const templateData = {
                error: e
            }
            return res.status(404).render(`templates/pool/${req.params.id}`, templateData)
        }
        // now we know the comment is ready to be made
        try {
            await 
        } catch(e) {
            const templateData = {
                error: e
            }
            return res.status(404).render(`templates/pool/${req.params.id}`, templateData)
        }
        res.redirect(`/pool/${req.params.id}`)
    })

router
    .route('/:id/deleteComment')
    .post(async (req, res) => {
        try {

        } catch(e) {
            console.log(e)
        }
        res.redirect(`/pool/${req.params.id}`)
    })
module.exports = router;
