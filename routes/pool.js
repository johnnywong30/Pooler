const express = require('express');
const { events, carpools, users } = require('../data')
const US_States = require('../const/USStates.json')
const router = express.Router();

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

module.exports = router;
