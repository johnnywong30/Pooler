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
            return res.render("templates/eventlist", templateData);
        } else {
            return res.redirect("/");
        }
    });

router
    .route("/view/:id") // specific event page with details
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
                    const pass = checkPassword(xss(req.query.pwd));
                    const match = await bcrypt.compare(pass, password);
                    if (!match) return res.redirect("/events");
                }
                const { address, city, state, zipcode } = destination
                const displayAddress = `${address}, ${city}, ${state}, ${zipcode}`
                const googleMapsUrl = `https://www.google.com/maps/place/${displayAddress}`.replace(/\s/g, '+')
                //console.log(`${userData._id} in ${await events.getDrivers(req.params.id)}`)
                const drivers = await events.getDrivers(req.params.id)
                let isUserDriver = drivers.includes(userData._id)
                let occupied = await events.occupance(req.params.id);
                for (carpool of carpools) {
                    let driver = await users.getUserById(carpool.driver)
                    carpool.driver = `${driver.firstName} ${driver.lastName}`
                    carpool.occupance = carpool.members.length
                }
                
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
                return res.render("templates/event", templateData);
            } catch (e) {
                console.log(e)
                return res.status(400).json({ error: "Invalid password" });
            }
        } else {
            return res.redirect("/");
        }
    });

    router.route("/:id/join").get(async (req, res) => { //This should be a POST method. Need to change to a form + button
        if (req.session.user) {
            const eventData = await events.getEvent(req.params.id)
            if (await events.occupance(req.params.id) < eventData.capacity) {
                const userData = await users.getUser(req.session.user.email)
                try {
                    await carpools.createPool(req.params.id, userData._id, `${userData.firstName} ${userData.lastName}`, `${eventData.date} ${eventData.startTime}`, 5)
                } catch (e) {
                    console.log("Error creating driver: " + e)
                }
            }
            res.redirect(`/events/view/${req.params.id}`)
        } else {
            return res.redirect("/");
        }
    });

router.route("/:id/join").post(async (req, res) => {
    if (req.session.user) {
        const eventData = await events.getEvent(req.params.id)
        if (events.occupance(req.params.id) < eventData.capacity) {
            const userData = await users.getUser(req.session.user.email)
            await carpools.createPool(req.params.id, userData._id, `${userData.firstName} ${userData.lastName}`, req.body.date, req.body.capacity) //TEST NUMBERS?
        }
        res.redirect(`/events/view/${req.params.id}`)
    } else {
        return res.redirect("/");
    }
});

router.route("/:id/leave").post(async (req, res) => {
    if (req.session.user) {
        // No deletePool function made?
    } else {
        return res.redirect("/");
    }
});

router.route("/list").get(async (req, res) => {
    if (req.session.user) {
        // fetch all events even if they're private
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
        try {
            return res.json(renderedEvents);
        } catch (e) {
            return res.status(500).json({ error: e });
        }
    } else {
        return res.redirect("/");
    }
});

router.route("/createEvent").post(async (req, res) => {
    if (req.session.user) {
        const host = req.session.user.email;
        try {
            const { name, date, startTime, description, capacity, private, password, destination } = req.body;
            const _name = checkString(xss(name));
            const _date = checkDate(xss(date));
            const _startTime = checkTime(xss(startTime));
            const _host = checkEmail(host); // should be in session
            const _description = checkString(xss(description));
            const _capacity = checkCapacity(capacity); // is a number
            const _private = checkBool(private); // is a bool
            const _pass = _private ? checkPassword(xss(password)) : null;
            const _destination = checkAddress(destination);
            const event = await events.createEvent(_name, _date, _startTime, _host, _description, _capacity, _destination, _private, _pass);

            return res.json({ success: true, eventId: event.eventId }).end();
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
    try {
        const id = checkId(req.params.id);
        const event = await events.getEvent(req.params.id);
        return res.status(200).json({ event });
    } catch (e) {
        return res.status(400).json({ error: e });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = checkId(req.params.id);
        const event = await events.getEvent(id);
        console.log(event);
        await events.deleteEvent(id);
        return res.status(200).json({ eventId: id, deleted: true });
    } catch (e) {
        return res.status(400).json({ error: e });
    }
});

router.post("/validateEvent/:id", async (req, res) => {
    let auth = {};
    try {
        const id = checkId(xss(req.params.id));
        const password = checkPassword(xss(req.body.password));
        auth = await events.validateEvent(id, password);
    } catch (e) {
        return res.status(400).json({ error: e });
    }

    if (auth.authenticated) {
        return res.status(200).json({ authenticated: true });
    }
});
module.exports = router;
