const { events } = require('../config/mongoCollections')
const eventFunc = require('./events');
const { checkName, checkDate, checkId } = require('../misc/validate')

module.exports = {
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