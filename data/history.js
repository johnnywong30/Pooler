const { events } = require('../config/mongoCollections')
const eventFunc = require('./events');
const { checkName, checkDate, checkId } = require('../misc/validate')

module.exports = {
  async createHistory(_eventId, _carpool) {
    console.log('hi')
    const eventId = checkId(_eventId)
    const carpool = checkId(_carpool)

    const eventCollection = await events()

    let event;
    try {
      event = await eventFunc.getEvent(eventId)
    } catch (e) {
      throw 'event does not exist'
    }

    //check if carpool exists

    const newHistory = {
      _id: eventId,
      name: event.name,
      date: event.date,
      carpool: carpool
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

    const updatedInfo = await eventCollection.updateOne(
      {_id: eventId},
      {$set: { history: userHistory}}
    )

    if (updatedInfo.insertedCount === 0) throw 'Could not add album';
    return eventFunc.getEvent(event._id);
  },

  async getHistory(_email) {
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
};