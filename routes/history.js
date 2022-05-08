const express = require('express');
const { checkEmail, checkPassword, checkName, checkFirstName, checkLastName, checkPhone, checkBool, checkVenmo, checkAddress, checkIsDriver, checkId, checkString, checkDate, checkTime, checkCapacity } = require('../misc/validate')
const router = express.Router();
const months = require('../const/months.json')
const { history, events } = require('../data')
const xss = require('xss')

router
    .route('/')
    .get(async (req, res) => {
        if (req.session.user) {
            const templateData = {
                authenticated: true,
                layout: 'custom'
            }
            return res.render('templates/historyList', templateData)
        }  
        else {
            return res.redirect('/')
        }
    })

router
    .route('/list')
    .get(async (req, res) => {
        if (req.session.user) {
            const { email } = req.session.user
            try {
                const historyData = await history.getHistory(xss(email))
                const detailedData = []
                for await (const event of historyData.map(event => events.getEvent(event._id))) {
                    const date = new Date(event.date)
                    const month = months[date.getMonth() + 1]
                    const info = {
                        _id: event._id,
                        date: `${date.getDate()}`,
                        month: month,
                        fullDate: event.date,
                        name: event.name,
                        description: event.description,
                        private: event.private,
                        password: event.password
                    }
                    detailedData.push(info)   
                }
                return res.json(detailedData)
            } catch (e) {
                return res.status(500).json({error: "Database error"})
            }
        } else {
            return res.redirect('/')
        }
    })

module.exports = router