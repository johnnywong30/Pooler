// TODO: Write history data methods here
/*
            _     _
           /@\---/@\
         ,'         `.
        |             |
        <`-----------'>
       / `. `-----' ,' \
      /    `-------'    \
     :  |   _______   |  :
     |  `.,'       `.,'  |
    ,`.   \    o    /   ,'.
   /   `.  `.     ,'  ,'   \
 ^^^^----^^^^-----^^^^----^^^^
    */

const { users, events } = require('../config/mongoCollections')
const eventFunc = require('./events');
const { checkName, checkDate, checkId } = require('../misc/validate')

module.exports = {
  async createHistory(_eventId, _name, _date, _carpool) {]
    const eventId = checkId(_eventId)
    const name = checkName(_name)
    const date = checkDate(_date)
    const carpool = checkId(_carpool)

    const historyCollection = await history()
    const eventCollection = await events()

    const newHistory = {
      _id: eventId,
      name: name,
      date: date,
      carpool: carpool
    }

    let event;
    try {
      event = await eventFunc.getEvent(eventId)
    } catch (e) {
      throw 'event does not exist'
    }

    let userEmail = event.host;
    let user;
    try {
      user = await userFunc.getUser(userEmail)
    } catch (e) {
      throw 'user does not exist'
    }

    const userHistory = user.history;
    userHistory.push(newHistory);
  }
}