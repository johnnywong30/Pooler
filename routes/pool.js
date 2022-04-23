const express = require('express');
const { event } = require('../data')
const US_States = require('../const/USStates.json')
const router = express.Router();

router
    .route('/')
    .get(async (req, res) => {
        return res.render('templates/pool') // THIS SHOULD BE THE poolS PAGE - THIS IS A TEST ROUTE
    })

router
    .route('/:id')
    .get(async (req, res) => {
        try {
            // const pool = await event.getCarpool(req.params.id) // TODO URGENT: Extract Pool Data using ID
            // const _driver = pool.driver // Should we be validating these? They're already in the database so probably already validated
            // const _departureTime = pool.departureTime
            // const _capacity = pool.capacity
            // const _members = pool.members
            // const _comments = pool.comments
            // const args = [_driver, _departureTime, _capacity, _members, _comments]
            const _poolId = req.params.id
            const _driver = "Roland Tumbokon"
            const _departureTime = "4/23/2022 10:30:22"
            const _capacity = 4
            const _memberData = [{ "_id": "f4a5489d-8f6e-4997-a3a8-22519b5cc55e", "firstName": "Jordan", "lastName": "Wang", "email": "jwang203@stevens.edu", "password": "$2a$10$2M0FNA3JdPTQ4Yn2ZRFvle833u8T0z8Hi7WRWR9/qxU/M89QaG106", "phone": "333-333-3333", "venmo": "big-wang-69", "address": { "_id": "9d9e8e3f-67c6-4c72-9720-e9fe46ae9a2e", "address": "422 Monroe St", "city": "Hoboken", "state": "NJ", "zipcode": "07030" }, "driver": true, "passenger": true, "history": [ { "_id": "70abf263-c8ec-4729-b3c8-3db651979cc1", "name": "Jordan Wang's Dance Party", "date": "04/01/2022", "carpool": "3e90e42d-bcd2-411e-9057-9b8da947a001" } ], }]
            const _numMembers = _memberData.length;
            const _comments = {}
            const _eventName = "Nikky's Tea Party!"
            const _isUserInPool = false;
            const args = {_poolId, _driver, _departureTime, _capacity, _memberData, _numMembers, _comments, _eventName, _isUserInPool}
            return res.render('templates/pool', args);
        } catch (e) {
            const states = Object.keys(US_States)
            const templateData = {
                error: e,
                states: states
            }
            return res.status(400).render('templates/pool', templateData)
        }
        
    })

    
router
    .route('/:id/join')
    .get(async (req, res) => {
        console.log(`JOIN: ${req.params.id}`)
        //await carpool.add(getCurrentUser())
        res.redirect(`/pool/${req.params.id}`)
    })

router
    .route('/:id/leave')
    .get(async (req, res) => {
        console.log(`LEAVE: ${req.params.id}`)
        //await carpool.remove(getCurrentUser())
        res.redirect(`/pool/${req.params.id}`)
    })

module.exports = router