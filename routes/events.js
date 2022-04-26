const express = require('express');
const { users } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver } = require('../misc/validate')
const US_States = require('../const/USStates.json')
const months = require('../const/months.json')
const fakeEvents = require('../const/seedevents.json')
const router = express.Router();


router
    .route('/') // event list the user can view
    .get(async (req, res) => {
        if (req.session.user) {
            const importEvents = Object.values(fakeEvents)
            const renderedEvents = importEvents.map(event => {
                const dateParts = event.date.split('/') // [MM, DD, YYYY]
                return {
                    _id: event._id,
                    month: months[dateParts[0]],
                    date: dateParts[1],
                    title: event.name,
                    description: event.description,
                    fullDate: event.date
                }
            })
            const templateData = {
                authenticated: true,
                events: renderedEvents,
                layout: 'custom'
            }
            console.log(renderedEvents)
            return res.render('templates/eventlist', templateData)
        } else {
            return res.redirect('/')
        }
    })

router
    .route('/view/:id') // specific event page with details
    .get(async (req, res) => {
        if (req.session.user) {

        } else {
            return res.redirect('/')
        }
    })
    .post(async (req, res) => {
        if (req.session.user) {
            // check if there is a password on the event or not
            // check if password is valid
            // if not then redirect to /view/:id after changing the request method to GET
        } else {
            return res.redirect('/')
        }
    })

router
    .route('/join/:id')
    .post(async (req, res) => {
        if (req.session.user) {
            // can only join if the event has sufficient room left; not at max capacity
            // error on page if event is at max capacity
            // redirect to GET /view/:id
        } else {
            return res.redirect('/')
        }
    })

router
    .route('/leave/:id')
    .post(async (req, res) => {
        if (req.session.user) {
            // can only join if user is part of the event

            // redirect to GET /view/:id
        } else {
            return res.redirect('/')
        }
    })

router
    .route('/list')
    .get(async (req, res) => {
        if (req.session.user) {
            // fetch all events even if they're private
            const importEvents = Object.values(fakeEvents)
            const renderedEvents = importEvents.map(event => {
                const dateParts = event.date.split('/') // [MM, DD, YYYY]
                return {
                    _id: event._id,
                    month: months[dateParts[0]],
                    date: dateParts[1],
                    title: event.name,
                    description: event.description,
                    fullDate: event.date
                }
            })
            try {
                return res.json(renderedEvents)
            } catch (e) {
                return res.status(500).json({ error: e })
            }
        } else {
            return res.redirect('/')
        }
    })

router
    .route('/createEvent')
    .post(async (req, res) => {
        try {
            const { name, date, startTime, host, description, capacity, private, password } = req.body;
            const event = await events.createEvent(name, date, startTime, host, description, capacity, private, password);
            res.json(event).end();
        } catch (e) {
            console.log(e);
            res.statusMessage = e;
            res.status(200).json({ errorMsg: e }).end();
        }
    });

module.exports = router