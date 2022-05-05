const express = require('express');
const { checkEmail, checkPassword, checkName, checkFirstName, checkLastName, checkPhone, checkBool, checkVenmo, checkAddress, checkIsDriver, checkId, checkString, checkDate, checkTime, checkCapacity } = require('../misc/validate')
const router = express.Router();
const fakeHistory = require('../const/seedhistory.json')
const months = require('../const/months.json')
module.exports = router;

router
    .route('/')
    .get(async (req, res) => {
        if (req.session.user) {
            const importHistory = Object.values(fakeHistory)
            
            const renderedHistory = importHistory.map(history => {
                const dateParts = history.date.split('/') // [MM, DD, YYYY]
                // would need to get current user's history and pull that data
                return {
                    _id: history._id,
                    month: months[dateParts[0]],
                    date: dateParts[1],
                    name: history.name,
                    carpool: history.carpool,
                    fullDate: history.date
                }
            })
            const templateData = {
                authenticated: true,
                history: renderedHistory,
                layout: 'custom'
            }
            return res.render('templates/historyList', templateData)
        }  else {
            return res.redirect('/')
        }
    })

router
    .route('/list')
    .get(async (req, res) => {
        if (req.session.user) {
            const importHistory = Object.values(fakeHistory)
            const renderedHistory = importHistory.map(history => {
                const dateParts = history.date.split('/') // [MM, DD, YYYY]
                // would need to get current user's history and pull that data
                return {
                    _id: history._id,
                    month: months[dateParts[0]],
                    date: dateParts[1],
                    name: history.name,
                    carpool: history.carpool,
                    fullDate: history.date
                }
            })

            try {
                return res.json(renderedHistory)
            } catch (e) {
                return res.status(500).json({ error: e })
            }
        } else {
            return res.redirect('/')
        }
    })

module.exports = router