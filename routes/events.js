const express = require('express');
const { events, users, carpools } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkBool, checkVenmo, checkAddress, checkIsDriver, checkId, checkString, checkDate, checkTime, checkCapacity } = require('../misc/validate')
const US_States = require('../const/USStates.json')
const months = require('../const/months.json')
const xss = require('xss');
const bcrypt = require('bcryptjs');
const router = express.Router();

router
    .route("/") // event list the user can view
    .get(async (req, res) => {
        if (req.session.user) {
            const templateData = {
                states: Object.keys(US_States),
                authenticated: true,
                layout: "custom",
            };
            return res.status(200).render("templates/eventlist", templateData);
        } else {
            return res.redirect("/");
        }
    });

router
    .route('/getUser')
    .get(async (req, res) => {
        if (req.session.user) {
            // validate
            try {
                req.session.user.email = checkEmail(xss(req.session.user.email))
            } catch (e) {
                console.log(e);
                res.statusMessage = e;
                return res.status(400).json({ errorMsg: e }).end();
            }
            return res.status(200).json(req.session.user.email);
        }
        else {
            return res.redirect('/')
        }
    })


router
    .route('/view/:id') // specific event page with details
    .get(async (req, res) => {
        if (req.session.user) {
            // validate
            try {
                req.session.user.email = checkEmail(xss(req.session.user.email))
                req.params.id = checkId(xss(req.params.id))
            } catch (e) {
                console.log(e);
                res.statusMessage = e;
                return res.status(400).json({ errorMsg: e }).end();
            }
            // check if user and event exists
            let userData, eventData
            const id = req.params.id
            try {
                userData = await users.getUser(xss(req.session.user.email))
                eventData = await events.getEvent(id)
            } catch (e) {
                console.log(e);
                res.statusMessage = e;
                return res.status(404).json({ errorMsg: e }).end();
            }
            try {
                const { _id, name, date, startTime, host, description } = eventData
                const { capacity, carpools, destination, private, password } = eventData
                // if event has password, see if it is correct
                if (private) {
                    // use a query instead of a POST for the password so users
                    // can share the event link with their friends
                    // and not have random strangers get it, unless they somehow get the link
                    // then that was the users' fault 🤷
                    // kinda like Zoom
                    const pass = checkPassword(xss(req.query.pwd));
                    const match = await bcrypt.compare(pass, password);
                    if (!match) return res.redirect("/events");
                }
                const { address, city, state, zipcode } = destination
                const displayAddress = `${address}, ${city}, ${state}, ${zipcode}`
                const states = Object.keys(US_States)
                const googleMapsUrl = `https://www.google.com/maps/place/${displayAddress}`.replace(/\s/g, '+')
                //console.log(`${userData._id} in ${await events.getDrivers(req.params.id)}`)
                const drivers = await events.getDrivers(id)
                let isUserDriver = drivers.includes(userData._id)
                let occupied = await events.occupance(id);
                for (carpool of carpools) {
                    let driver = await users.getUserById(carpool.driver)
                    carpool.driver = `${driver.firstName} ${driver.lastName}`
                    carpool.occupance = carpool.members.length
                }

                const templateData = {
                    id: _id,
                    currentUser: req.session.user,
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
                    street: address,
                    city: city,
                    state: state,
                    states: states,
                    zipcode: zipcode,
                    displayAddress: displayAddress,
                    layout: 'custom',
                    isUserDriver: isUserDriver,
                    eventID: req.params.id,
                    authenticated: true
                }
                // render the event page
                return res.status(200).render("templates/event", templateData);
            } catch (e) {
                console.log(e)
                return res.status(400).json({ error: "Invalid password" });
            }
        } else {
            return res.redirect("/");
        }
    });


router.route("/list").get(async (req, res) => {
    if (req.session.user) {
        // fetch all events even if they're private
        // bad api for security oops
        try {
            const importEvents = await events.getEvents();
            const renderedEvents = importEvents.map((event) => {
                const dateParts = event.date.split("/"); // [MM, DD, YYYY]
                return {
                    _id: event._id,
                    month: months[dateParts[0]],
                    date: dateParts[1],
                    title: event.name,
                    description: event.description,
                    fullDate: event.date,
                    private: event.private,
                };
            });
            return res.status(200).json(renderedEvents);
        } catch (e) {
            return res.status(404).json({ error: e });
        }
    } else {
        return res.redirect("/");
    }
});

router
    .route("/createEvent")
    .post(async (req, res) => {
        if (req.session.user) {
            const { name, date, startTime, description, capacity, private, password, destination } = req.body;
            let host, _name, _date, _startTime, _host, _description, _capacity, _private, _pass, _destination
            // validate
            try {
                host = xss(req.session.user.email);
                _name = checkString(xss(name));
                 _date = checkDate(xss(date));
                _startTime = checkTime(xss(startTime));
                _host = checkEmail(host); // should be in session
                _description = checkString(xss(description));
                const cap = typeof capacity === 'number' ? capacity : xss(capacity)
                _capacity = checkCapacity(cap); // is a number
                const boolVal = typeof private === 'boolean' ? private : xss(private)
                _private = checkBool(boolVal); // is a bool
                _pass = _private ? checkPassword(xss(password)) : null;
                _destination = checkAddress(destination);
            } catch (e) {
                console.log(e);
                res.statusMessage = e;
                return res.status(400).json({ errorMsg: e }).end();
            }
            // create event
            try {
                const event = await events.createEvent(_name, _date, _startTime, _host, _description, _capacity, _destination, _private, _pass);
                return res.status(200).json({ success: true, eventId: event.eventId }).end();
            } catch (e) {
                console.log(e);
                res.statusMessage = e;
                return res.status(404).json({ errorMsg: e }).end();
            }
        } else {
            return res.redirect("/");
        }
    });

router.get("/:id", async (req, res) => {
    if (req.session.user) {
        // validate
        try {
            req.params.id = checkId(xss(req.params.id))
        } catch (e) {
            console.log(e);
            res.statusMessage = e;
            return res.status(400).json({ errorMsg: e }).end();
        }
        // check if event exists
        try {
            const id = req.params.id;
            const event = await events.getEvent(id);
            return res.status(200).json({ event });
        } catch (e) {
            return res.status(404).json({ error: e });
        }
    } else {
        return res.redirect('/')
    }
});

router
    .route('/getHost/:id')
    .get(async (req, res) => {
        if (req.session.user) {
             // validate
            try {
                req.params.id = checkId(xss(req.params.id))
            } catch (e) {
                console.log(e);
                res.statusMessage = e;
                return res.status(400).json({ errorMsg: e }).end();
            }
            // check if event exists
            try {
                const id = req.params.id
                const event = await events.getEvent(id)
                return res.status(200).json(event.host);
            } catch (e) {
                return res.status(404).json({ error: e });
            }
        } else {
            return res.redirect('/')
        }
    })

router
    .delete('/:id', async (req, res) => {
        if (req.session.user) {
            // validate
            try {
                req.params.id = checkId(xss(req.params.id))
            } catch (e) {
                console.log(e);
                res.statusMessage = e;
                return res.status(400).json({ errorMsg: e }).end();
            }
            // delete event
            try {
                const id = req.params.id
                await events.deleteEvent(id)
                return res.status(200).json({ eventId: id, deleted: true });
            } catch (e) {
                return res.status(404).json({ error: e });
            }
        } else {
            return res.redirect('/')
        }
    })

router.post("/validateEvent/:id", async (req, res) => {
    if (req.session.user) {
        let auth = {};
        // validate
        try {
            req.params.id = checkId(xss(req.params.id))
            req.body.password = checkPassword(xss(req.body.password))
        } catch (e) {
            console.log(e);
            res.statusMessage = e;
            return res.status(400).json({ errorMsg: e }).end();
        }
        //validate event
        try {
            const id = req.params.id;
            const password = req.body.password;
            auth = await events.validateEvent(id, password);
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        if (auth.authenticated) {
            return res.status(200).json({ authenticated: true })
        }
    } else {
        return res.redirect('/')
    }
})
router
    .post('/updateEvent/:id', async (req, res) => {
        if (req.session.user) {
            const { name, date, startTime, description, destination } = req.body;
            // validate
            let id, _name, _date, _startTime, _description, _destination 
            try {
                id = checkId(xss(req.params.id))
                _name = checkString(xss(name), "event name")
                _date = checkDate(xss(date))
                _startTime = checkTime(xss(startTime))
                _description = checkString(xss(description))
                // all addresses should be cleaned by middleware
                _destination = checkAddress(destination)
            } catch (e) {
                console.log(e);
                res.statusMessage = e;
                return res.status(400).json({ errorMsg: e }).end();
            }
            // check if event exists
            let currentEvent
            try {
                currentEvent = await events.getEvent(id);
            } catch (e) {
                console.log(e);
                res.statusMessage = e;
                return res.status(404).json({ errorMsg: e }).end();
            }
            // update event
            try {
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

                const updateDestination = await events.updateDestination(id, _destination)
                const updatedEvent = await events.getEvent(id);

                return res.status(200).json({ event: updatedEvent, updated: true })
            } catch (e) {
                return res.status(400).json({ error: e })
            }
        }

    })

module.exports = router;
