// TODO: Write event data methods here
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
const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver, checkName, checkString, checkDate, checkTime, checkNum, checkArray, checkId } = require('../misc/validate')
const { events, users } = require('../config/mongoCollections')
const userFunc = require('./users');
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid');
const saltRounds = 10

module.exports = {
  async createEvent(name, date, startTime, host, description, capacity, private, password) {
    // initial checks
    const _name = checkString(name)
    const _date = checkDate(date)
    const _startTime = checkTime(startTime)
    const _host = checkEmail(host)
    const _description = checkString(description)
    const _capacity = checkNum(capacity)
    const _private = checkBool(private)
    const _password = checkPassword(password)

    const userCollection = await users()
    const eventsCollection = await events()
    const user = await userCollection.findOne({ email: _host })
    if (user === null) throw `host with email ${_host} does not exist`

    // create event
    const saltedPass = await bcrypt.hash(_password, saltRounds)
    const newEvent = {
      _id: uuidv4(),
      name: _name,
      date: _date,
      startTime: _startTime,
      host: _host,
      description: _description,
      capacity: _capacity,
      private: _private,
      password: saltedPass,
      carpools: []
    }

    // register event
    const insertInfo = await eventsCollection.insertOne(newEvent)
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not register event'
    // On success
    return {
      eventRegistered: true
    }
  },

  async getEvent(id) {
    const _id = checkId(id)
    const eventsCollection = await events();
    let event = await eventsCollection.findOne({ _id: ObjectId(id) });
    if (event === null) {
      return []
    }
    event._id = (event._id).toString();
    return [event];
  },

  async updateEvent(id, name, date, startTime, host, description, capacity, private, password, carpools) {
    const _id = checkId(id)
    const _name = checkString(name)
    const _date = checkDate(date)
    const _startTime = checkTime(startTime)
    const _host = checkEmail(host)
    const _description = checkString(description)
    const _capacity = checkNum(capacity)
    const _private = checkBool(private)
    const _carpools = checkArray(carpools)
    const inputPassword = checkPassword(password)

    const eventCollection = await events()
    const eventExists = await this.getEvent(_id);
		const errorMsg = "Invalid id or password";
		if (eventExists.length < 1) throw errorMsg;
		const event = eventExists[0];
    const saltedPass = await bcrypt.hash(_password, saltRounds)
    // const { password } = event;
    // const match = await bcrypt.compare(inputPassword, password)
		// if (match) {
		// 	return {
		// 		...event,
		// 		password: "thats not very froggers of you",
		// 	};
		// } else {
		// 	throw 'invalid password';
		// }

    let updatedEventData = {
      name: _name,
      date: _date,
      startTime: _startTime,
      host: _host,
      description: _description,
      capacity: _capacity,
      private: _private,
      password: saltedPass,
      carpools: _carpools
    }

    const updatedInfo = await eventCollection.updateOne(
      {_id: ObjectId(id)},
      {$set: updatedEventData}
    );
    
    if (updatedInfo.modifiedCount === 0) {
        throw 'could not update event successfully';
    }

    return await this.getEvent(_id);
  },

  async validateEvent(id, password) {
		const _id = checkId(id);
		const inputPassword = checkPassword(password);
		const eventExists = await this.getEvent(_id);
		const errorMsg = "Invalid id or password";
		if (eventExists.length < 1) throw errorMsg;
		const event = eventExists[0];
		const { password } = event;
		const match = await bcrypt.compare(inputPassword, password);
		if (match) {
			return {
				...event,
				password: "thats not very froggers of you",
			};
		} else {
			throw errorMsg;
		}
	},

  async deleteEvent(id) {
		const _id = checkId(id)
		const eventCollection = await events();
		const deletionInfo = await eventCollection.deleteOne({ id: id });
		if (deletionInfo.deleteCount === 0) throw `Could not delete event for ${_id}`;
		return true;
	},
}