const express = require('express');
const { events } = require('../data')
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver } = require('../misc/validate')
const router = express.Router();

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