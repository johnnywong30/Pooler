const { users } = require('../config/mongoCollections')
const eventFunc = require('./events');
const usersFunc = require('./users')
const carpoolFunc = require('./carpools')
const { checkEmail, checkDate, checkId } = require('../misc/validate')

module.exports = {
  async getHistory(_email) {
    const email = checkEmail(_email);
    const user = await usersFunc.getUser(email)
    if (user.history.length === 0) throw 'no carpool history for this user'
    return user.history;
  },
  async addToHistory(_userId, _eventId, _carpoolId) {
    const userId = checkId(_userId)
    const eventId = checkId(_eventId)
    const carpoolId = checkId(_carpoolId)
    // check if user exists
    const user = await usersFunc.getUserById(userId)
    // check if event exists
    const event = await eventFunc.getEvent(eventId)
    // check if carpool exists
    const carpool = await carpoolFunc.getPool(carpoolId)
    const historyDoc = {
      _id: event._id,
      name: event.name,
      date: event.date,
      carpool: carpool._id
    }
    const collection = await users()
    const updateInfo = await collection.updateOne(
      { _id: user._id },
      { $push: { history: historyDoc } }
    )
    if (updateInfo.modifiedCount === 0) throw "Could not update history";
    // On success
    return { addedToHistory: true };
  },
  async removeFromHistory(_userId, _eventId, _carpoolId) {
    const userId = checkId(_userId)
    const eventId = checkId(_eventId)
    const carpoolId = checkId(_carpoolId)
    // check if user exists
    const user = await usersFunc.getUserById(userId)
    // check if event exists
    const event = await eventFunc.getEvent(eventId)
    // check if carpool exists
    const carpool = await carpoolFunc.getPool(carpoolId)
    
    const deletedDoc = {
      _id: event._id,
      carpool: carpool._id
    }

    const collection = await users()
    const updateInfo = await collection.updateOne(
      { _id: user._id },
      { $pull: { history: deletedDoc } }
    )
    if (updateInfo.modifiedCount === 0) throw "Could not update history";
    // On success
    return { removedFromHistory: true };
  }
};