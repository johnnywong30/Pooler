const express = require('express');
const { events } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkBool, checkVenmo, checkAddress, checkIsDriver, checkId, checkString, checkDate, checkTime, checkCapacity, checkName } = require('../misc/validate')
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
    .route('/getUser')
    .get(async (req, res) => {
        if (req.session.user) {
            return res.json(req.session.user.email);
        }
        else {
            return res.redirect('/')
        }
    })


router
    .route('/view/:id') // specific event page with details
    .get(async (req, res) => {
        if (req.session.user) {
            try {
                const id = checkId(xss(req.params.id))
                const eventData = await events.getEvent(id)
                const { _id, name, date, startTime, host, description } = eventData
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
                const states = Object.keys(US_States)
                const googleMapsUrl = `https://www.google.com/maps/place/${displayAddress}`.replace(/\s/g, '+')
                const templateData = {
                    id: _id,
                    currentUser: req.session.user,
                    name: name, 
                    date: date,
                    startTime: startTime,
                    host: host,
                    description: description,
                    capacity: capacity,
                    occupied: 0, // TODO compute this valued 
                    carpools: carpools,
                    destination: destination,
                    googleMapsUrl: googleMapsUrl,
                    street: address,
                    city: city,
                    state: state,
                    states: states,
                    zipcode: zipcode,
                    displayAddress: displayAddress,
                    layout: 'custom',
                    authenticated: true
                }       
                // render the event page
                return res.render('templates/event', templateData)
            } catch (e) {
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
            const event = await events.createEvent(_name, _date, _startTime, _host, _description, _capacity, _destination, _private, _pass);
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
    .route('/getHost/:id')
    .get(async (req, res) => {
        try {
            const id = checkId(req.params.id)
            const event = await events.getEvent(req.params.id)
            return res.status(200).json(event.host);
        } catch (e) {
            return res.status(400).json({ error: e });
        }
    })

router
    .delete('/:id', async (req, res) => {
        // console.log(req.session.user)
        try {
            const id = checkId(req.params.id)
            // const event = await events.getEvent(id)
            // console.log(event)
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
router
    .post('/updateEvent/:id', async (req, res) => {
        const { name, date, startTime, description, destination } = req.body;
        try {  
            const id = checkId(req.params.id)
            let _name = checkString(name, "event name")
            let _date = checkDate(date)
            let _startTime = checkTime(startTime)
            let _description = checkString(description)
            let _destination = checkAddress(destination)

            const currentEvent = await events.getEvent(id);
        
            if (currentEvent.name !== _name) {
                const updateName = await events.updateName(id, _name)
            }
            

            if (currentEvent.date != _date) {
                const updateDate = await events.updateDate(id, _date)
            }

            if (currentEvent.startTime !== _startTime) {
                const updateTime = await events.updateStartTime(id, _startTime)
            }

            if (currentEvent.description !== _description) {
                const updateDescription = await events.updateDescription(id, _description)
            }
            
            if (currentEvent.destination !== _destination) {
                const updateDestination = await events.updateDestination(id, _destination)
            }


            const updatedEvent = await events.getEvent(id);

            return res.status(200).json({event: updatedEvent, updated: true})
        } catch (e) {
            return res.status(400).json({error: e})
        }
    
    })
module.exports = router