const express = require('express');
const { carpools } = require('../data')
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
            const pool = await poolData.getPool(req.params.id) // TODO URGENT: Extract Pool Data using ID
            const _name = pool.name // Should we be validating these? They're already in the database so probably already validated
            const _date = pool.date
            const _startTime = pool.startTime
            const _host = pool.host
            const _description = pool.description
            const _capacity = pool.capacity
            const _private = pool.private
            const _password = pool.password
            const _carpools = pool.carpools
            const _destination = pool.destination
            const args = [_name, _date, _startTime, _host, _description, _capacity, _private, _password, _carpools, _destination]
            return res.render('templates/pool', ...args);
        } catch (e) {
            const states = Object.keys(US_States)
            const templateData = {
                error: e,
                states: states
            }
            return res.status(400).render('templates/register', templateData)
        }
        
    })

module.exports = router