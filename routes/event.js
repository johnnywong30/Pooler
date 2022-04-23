const express = require('express');
const { events } = require('../data')
const US_States = require('../const/USStates.json')
const router = express.Router();

router
    .route('/')
    .get(async (req, res) => {
        return res.render('templates/events')
    })

router
    .route('/:id')
    .get(async (req, res) => {
        try {
            const event = await eventData.getEvent(req.params.id) // TODO URGENT: Extract Event Data using ID
            const _name = event.name // Should we be validating these? They're already in the database so probably already validated
            const _date = event.date
            const _startTime = event.startTime
            const _host = event.host
            const _description = event.description
            const _capacity = event.capacity
            const _private = event.private
            const _password = event.password
            const _carpools = event.carpools
            const _destination = event.destination
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