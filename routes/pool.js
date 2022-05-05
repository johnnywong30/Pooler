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
            const event = await events.getEventFromPool(req.params.id)
            const pool = await pool.getPool(req.params.id)
            const _poolId = req.params.id
            const _driver = pool.driver
            const _departureTime = pool.departureTime
            const _capacity = pool.capacity
            const _memberData = pool.members
            _memberData.forEach(id => getUserById(id))
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

router.route("/leave/:id").get(async (req, res) => {
    console.log(`LEAVE: ${req.params.id}`);
    //await carpool.remove(getCurrentUser())
    res.redirect(`/pool/${req.params.id}`);
});

module.exports = router;
