const { checkEventName, checkDate, checkTime, checkEmail, checkId, checkString, checkBool, checkCapacity, checkPrivate, checkPassword, checkAddress } = require("../misc/validate");
const { events, users } = require("../config/mongoCollections");
const userFuncs = require("./users");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;

module.exports = {
	async createEvent(_name, _date, _startTime, _host, _description, _capacity, _destination, _private, _password = "") {
		// Initial checks
		const name = checkEventName(_name);
		const date = checkDate(_date);
		const startTime = checkTime(_startTime);
		const host = checkEmail(_host);
		const description = checkString(_description);
		const capacity = checkCapacity(_capacity);
		const destination = checkAddress(_destination);
		const private = checkPrivate(_private);
		// only need a password if the event is private
		const password = private ? checkPassword(_password) : "";

		// Check if user exists
		const user = await userFuncs.getUser(host);
		if (!user) throw `${host} is not a user`;

		// Create event
		const pass = private ? await bcrypt.hash(password, saltRounds) : password;
		const eventId = uuidv4();
		const newEvent = {
			_id: eventId,
			name: name,
			date: date,
			startTime: startTime,
			host: host,
			description: description,
			capacity: capacity,
			private: private,
			password: pass,
			carpools: [],
			destination: destination,
		};

		// Insert event
		const collection = await events();
		const insertInfo = await collection.insertOne(newEvent);
		if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not register event";

		// On success
		return {
			eventRegistered: true,
			eventId: eventId,
		};
	},

	async getEvent(_id) {
		// Initial checks
		const id = checkId(_id);
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";
		return event;
	},
	async getEventByPoolId(poolId) {
		// Initial Checks
		let _poolId = checkId(poolId);
		// Check if carpool exists
		const eventsCollection = await events();
		const event = await eventsCollection.findOne({ carpools: { $elemMatch: { _id: _poolId } } });
		if (!event) throw `No event with Pool ID of ${_poolId}`;
		return event;
	},
	async getDrivers(_id) {
		// Initial Checks
		const id = checkId(_id);
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (!event) throw `No event with Pool ID of ${_poolId}`;
		return event.carpools.map(pool => pool.driver)
	},
	async getEvents() {
		const collection = await events();
		const eventList = await collection.find({}).toArray();
		if (!eventList) throw "Could not get Events";
		return eventList;
	},

	async updateName(_id, _name) {
		const id = checkId(_id);
		const name = checkEventName(_name);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";
		const updatedInfo = await collection.updateOne({ _id: id }, { $set: { name: name } });
		if (updatedInfo.modifiedCount === 0) throw "Could not update event name";
		return await this.getEvent(id);
	},

	async updateDate(_id, _date) {
		const id = checkId(_id);
		const date = checkDate(_date);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";
		const updatedInfo = await collection.updateOne({ _id: id }, { $set: { date: date } });
		if (updatedInfo.modifiedCount === 0) throw "Could not update event date";
		return await this.getEvent(id);
	},

	async updateStartTime(_id, _startTime) {
		const id = checkId(_id);
		const startTime = checkTime(_startTime);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";
		const updatedInfo = await collection.updateOne({ _id: id }, { $set: { startTime: startTime } });
		if (updatedInfo.modifiedCount === 0) throw "Could not update event startTime";
		return await this.getEvent(id);
	},

	async updateDescription(_id, _description) {
		const id = checkId(_id);
		const description = checkString(_description);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";
		const updatedInfo = await collection.updateOne({ _id: id }, { $set: { description: description } });
		if (updatedInfo.modifiedCount === 0) throw "Could not update event description";
		return await this.getEvent(id);
	},

	async updateCapacity(_id, _capacity) {
		const id = checkId(_id);
		const capacity = checkCapacity(_capacity);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";
		const updatedInfo = await collection.updateOne({ _id: id }, { $set: { capacity: capacity } });
		if (updatedInfo.modifiedCount === 0) throw "Could not update event capacity";
		return await this.getEvent(id);
	},

	async updatePrivacy(_id, _private, _password = "") {
		const id = checkId(_id);
		const private = checkPrivate(_private);
		const password = private ? checkPassword(_password) : "";
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";
		const pass = private ? await bcrypt.hash(password, saltRounds) : "";
		const updatedInfo = await collection.updateOne({ _id: id }, { $set: { private: private, password: pass } });
		if (updatedInfo.modifiedCount === 0) throw "Could not update event privacy ";
		return await this.getEvent(id);
	},

	// maybe move this in addresses.js
	async updateDestination(_id, _destination) {
		const id = checkId(_id);
		const destination = checkAddress(_destination);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";
		const updatedInfo = await collection.updateOne({ _id: id }, { $set: { destination: destination } });
		if (updatedInfo.modifiedCount === 0) throw "Could not update event destination";
		return await this.getEvent(id);
	},

	async validateEvent(_id, _password = "") {
		const id = checkId(_id);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";
		const isPrivate = event.private;
		// only check password if the event is private
		const password = isPrivate ? checkPassword(_password) : "";
		if (isPrivate) {
			const match = await bcrypt.compare(password, event.password);
			if (match) return { authenticated: true };
			else throw "Invalid password";
		} else {
			return { authenticated: true };
		}
	},

	async deleteEvent(_id) {
		const id = checkId(_id);
		const collection = await events();
		const deletionInfo = await collection.deleteOne({ _id: id });
		if (deletionInfo.deleteCount === 0) throw `Could not delete event of id ${_id}`;
		return true;
	},

	async occupance(_id) {
		const id = checkId(_id);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: id });
		if (event === null) throw "Event does not exist";

		sum = 0
		for (carpool of event.carpools) {
			sum += carpool.members.length //passengers + drivers
		}
		return sum
	},
};
