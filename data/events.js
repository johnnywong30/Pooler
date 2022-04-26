const { checkEventName, checkDate, checkTime, checkEmail, checkString, checkCapacity, checkPrivate, checkPassword, checkAddress } = require("../misc/validate");
const { events } = require("../config/mongoCollections");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;

module.exports = {
	async createEvent(name, date, startTime, host, description, capacity, private, password) {
		// add back destination
		// Initial Checks
		const _name = checkEventName(name);
		const _date = checkDate(date);
		const _startTime = checkTime(startTime);
		const _host = checkEmail(host);
		const _description = checkString(description);
		const _capacity = checkCapacity(capacity);
		const _private = checkPrivate(private);
		const _pass = checkPassword(password);
		// const _destination = checkAddress(destination);
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
			// destination: destination,
		};
		// Register Event
		const collection = await events();
		const insertInfo = await collection.insertOne(newEvent);
		if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not register event";
		// On success
		return {
			eventRegistered: true,
		};
	},
};
