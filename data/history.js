const { users, events } = require('../config/mongoCollections')
const eventFunc = require('./events');
const { checkName, checkDate, checkId } = require('../misc/validate')

module.exports = {
  async createHistory(_eventId, _name, _date, _carpool) {
    const eventId = checkId(_eventId)
    const name = checkName(_name)
    const date = checkDate(_date)
    const carpool = checkId(_carpool)

    // check if event exists
    

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
  },

  async getAll(_email) {
    const email = checkEmail(_email);

    let user;
    try {
      user = userFunc.getUser(email)
    } catch(e) {
      throw 'user does not exist'
    }

    if (user.history.length === 0) {
      throw 'no carpool history for this user'
    }

    return user.history;
  }
}