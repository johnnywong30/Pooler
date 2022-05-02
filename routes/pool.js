const express = require('express');
const { events, carpools } = require('../data')
const US_States = require('../const/USStates.json')
const router = express.Router();

router
    .route('/')
    .get(async (req, res) => {
        return res.redirect('/events') // THIS SHOULD BE THE poolS PAGE - THIS IS A TEST ROUTE
    })

router
    .route('/:id')
    .get(async (req, res) => {
        console.log("pool page with id")
        try {
            const user = await users.getUser(req.session.user.email)
            const event = await events.getEventFromPool(req.params.id)
            const pool = await pool.getPool(req.params.id)
            const _poolId = req.params.id
            const _driver = pool.driver
            const _departureTime = pool.departureTime
            const _capacity = pool.capacity
            const _memberData = [{ "_id": "f4a5489d-8f6e-4997-a3a8-22519b5cc55e", "firstName": "Jordan", "lastName": "Wang", "email": "jwang203@stevens.edu", "password": "$2a$10$2M0FNA3JdPTQ4Yn2ZRFvle833u8T0z8Hi7WRWR9/qxU/M89QaG106", "phone": "333-333-3333", "venmo": "big-wang-69", "address": { "_id": "9d9e8e3f-67c6-4c72-9720-e9fe46ae9a2e", "address": "422 Monroe St", "city": "Hoboken", "state": "NJ", "zipcode": "07030" }, "driver": true, "passenger": true, "history": [ { "_id": "70abf263-c8ec-4729-b3c8-3db651979cc1", "name": "Jordan Wang's Dance Party", "date": "04/01/2022", "carpool": "3e90e42d-bcd2-411e-9057-9b8da947a001" } ], }]
            const _numMembers = _memberData.length;
            const _comments = pool.comments
            const _eventName = event.name
            const _isUserInPool = (pool.members.indexOf(user._id) > -1)
            const args = {_poolId, _driver, _departureTime, _capacity, _memberData, _numMembers, _comments, _eventName, _isUserInPool}
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
            const event = await events.getEvent(req.params.id)
            const pool = await pool.getPool(req.params.id)
            await carpools.addPooler(event._id, pool._id, user._id)
        } catch (e) {
            console.log(e)
        }
        console.log(`JOIN: ${req.params.id}`)
        res.redirect(`/pool/${req.params.id}`)
    })

router
    .route('/:id/leave')
    .get(async (req, res) => {
        try {
            const user = await users.getUser(req.session.user.email)
            const event = await events.getEvent(req.params.id)
            const pool = await pool.getPool(req.params.id)
            await carpools.deletePooler(event._id, pool._id, user._id)
        } catch (e) {
            console.log(e)
        }
        console.log(`LEAVE: ${req.params.id}`)
        res.redirect(`/pool/${req.params.id}`)
    })

module.exports = router