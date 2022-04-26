const { checkEventName, checkDate, checkTime, checkEmail, checkId, checkString, checkBool, checkCapacity, checkPrivate, checkPassword, checkAddress } = require("../misc/validate");
const { events, users } = require("../config/mongoCollections");
const userFuncs = require('./users');
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;

module.exports = {
	async createEvent(name, date, startTime, host, description, capacity, private, password, destination) {
		// Initial Checks
    const _name = checkString(name);
    const _date = checkDate(date);
    const _startTime = checkTime(startTime);
    const _host = checkEmail(host);
    const _description = checkString(description);
    const _capacity = checkCapacity(capacity);
    const _private = checkBool(private);
    const _pass = checkPassword(password);
    const _destination = checkAddress(destination);
		
    // check to see if user exists
    let user;
    try {
      user = await userFuncs.getUser(_host);
    } catch (e) {
      throw e
    }

		// Create event
		const saltedPass = await bcrypt.hash(_pass, saltRounds);
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
			carpools: [],
			destination: _destination,
		};
		// Register Event
		const eventsCollection = await events();
		const insertInfo = await eventsCollection.insertOne(newEvent);
		if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not register event";
		// On success
		return {
			eventRegistered: true,
		};
	},

  async getEvent(id) {
    const _id = checkId(id)
    const eventsCollection = await events();
    let event = await eventsCollection.findOne({ _id: _id });
    if (event === null) {
      throw 'no event with that id';
    }

    event._id = (event._id).toString();
    return event;
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
    const _password = checkPassword(password)
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
    let event;
    try {
      event = await this.getEvent(_id);
    } catch (e) {
      throw "event does not exist"
    }
		
		const errorMsg = "Invalid id or password";
		const match = await bcrypt.compare(inputPassword, event.password);
		if (match) {
			return {
				authenticated: true,
			};
		} else {
			throw errorMsg;
		}
	},

  async deleteEvent(id) {
		const _id = checkId(id)
		const eventCollection = await events();
		const deletionInfo = await eventCollection.deleteOne({ _id: _id });
		if (deletionInfo.deleteCount === 0) throw `Could not delete event for ${_id}`;
		return true;
	},
};
