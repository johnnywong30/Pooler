const express = require('express');
const { events, users } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkBool, checkVenmo, checkAddress, checkIsDriver, checkId, checkString, checkDate, checkTime, checkCapacity } = require('../misc/validate')
const US_States = require('../const/USStates.json')
const months = require('../const/months.json')
const xss = require('xss');
const bcrypt = require('bcryptjs');
const router = express.Router();


router
    .route('/') // event list the user can view
    .get(async (req, res) => {
        if (req.session.user) {
            const templateData = {
                authenticated: true,
                layout: 'custom'
            }
            return res.render('templates/eventlist', templateData)
        } else {
            return res.redirect('/')
        }
    })

router
    .route('/view/:id') // specific event page with details
    .get(async (req, res) => {
        if (req.session.user) {
            try {
                const id = checkId(xss(req.params.id))
                const userData = await users.getUser(req.session.user.email)
                const eventData = await events.getEvent(id)
                const { name, date, startTime, host, description } = eventData
                const { capacity, carpools, destination, private, password } = eventData
                // if event has password, see if it is correct
                if (private) {
                    // use a query instead of a POST for the password so users
                    // can share the event link with their friends 
                    // and not have random strangers get it, unless they somehow get the link
                    // then that was the users' fault 🤷
                    // kinda like Zoom
                    const pass = checkPassword(xss(req.query.pwd))
                    const match = await bcrypt.compare(pass, password)
                    if (! match) return res.redirect('/events')
                }         
                const { address, city, state, zipcode } = destination
                const displayAddress = `${address}, ${city}, ${state}, ${zipcode}` 
                const googleMapsUrl = `https://www.google.com/maps/place/${displayAddress}`.replace(/\s/g, '+')
                let occupied = 0;
                for (carpool of carpools) {
                    occupied += carpool.members.length
                }
                let isUserDriver = (userData._id === eventData.driver)
                const templateData = {
                    name: name, 
                    date: date,
                    startTime: startTime,
                    host: host,
                    description: description,
                    capacity: capacity,
                    occupied: occupied,
                    carpools: carpools,
                    destination: destination,
                    googleMapsUrl: googleMapsUrl,
                    displayAddress: displayAddress,
                    layout: 'custom',
                    isUserDriver: isUserDriver,
                    eventID: req.params.id,
                    authenticated: true
                }       
                // render the event page
                return res.render('templates/event', templateData)
            } catch (e) {
                console.log(e)
                return res.status(400).json({ error: 'Invalid password'})
            }
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
            const importEvents = await events.getEvents()
            const renderedEvents = importEvents.map(event => {
                const dateParts = event.date.split('/') // [MM, DD, YYYY]
                return {
                    _id: event._id,
                    month: months[dateParts[0]],
                    date: dateParts[1],
                    title: event.name,
                    description: event.description,
                    fullDate: event.date,
                    private: event.private
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
            const { name, date, startTime, host, description, capacity, private, password, destination } = req.body;
            const _name = checkString(name);
            const _date = checkDate(date);
            const _startTime = checkTime(startTime);
            const _host = checkEmail(host);
            const _description = checkString(description);
            const _capacity = checkCapacity(capacity);
            const _private = checkBool(private);
            const _pass = checkPassword(password);
            const _destination = checkAddress(destination);
            const event = await events.createEvent(_name, _date, _startTime, _host, _description, _capacity, _private, _pass, _destination);
            return res.json(event).end();
        } catch (e) {
            console.log(e);
            res.statusMessage = e;
            return res.status(200).json({ errorMsg: e }).end();
        }
    });

router.get('/:id', async (req, res) => {
    try {
        const id = checkId(req.params.id)
        const event = await events.getEvent(req.params.id)
        return res.status(200).json({ event });
    } catch (e) {
        return res.status(400).json({ error: e });
    }
})

router
    .delete('/:id', async (req, res) => {
        try {
            const id = checkId(req.params.id)
            const event = await events.getEvent(id)
            console.log(event)
            await events.deleteEvent(id)
            return res.status(200).json({ eventId: id, deleted: true });
        } catch (e) {
            return res.status(400).json({ error: e });
        }
    })

router
    .post('/validateEvent/:id', async (req, res) => {
        let auth = {}
        try {
            const id = checkId(xss(req.params.id));
            const password = checkPassword(xss(req.body.password))
            auth = await events.validateEvent(id, password)
        } catch (e) {
            return res.status(400).json({ error: e })
        }

        if (auth.authenticated) {
            return res.status(200).json({ authenticated: true })
        }
    })
module.exports = router