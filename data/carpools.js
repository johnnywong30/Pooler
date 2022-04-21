const { checkId, checkFullName, checkDateTime, checkCapacity } = require("../misc/validate");
const { events, user } = require("../config/mongoCollections");
const { v4: uuidv4 } = require("uuid");

module.exports = {
	async createPool(eventId, driver, departureTime, capacity) {
		// Initial Checks
		let _eventId = checkId(eventId);
		let _driver = checkFullName(driver);
		let _departureTime = checkDateTime(departureTime);
		let _capacity = checkCapacity(capacity);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: _eventId });
		if (!event) throw `No event with ID of ${_eventId}`;
		// Check if carpool exists
		const carpool = event.carpools.find(carpool => carpool.driver === _driver);
		if (carpool) throw `${driver} has already registered for a carpool`;
		// Create carpool
		const newCarpool = {
			_id: uuidv4(),
			driver: _driver,
			departureTime: _departureTime,
			capacity: _capacity,
			members: [],
			comments: [],
		};
		const updateEvents = await collection.updateOne({ _id: _eventId }, { $push: { carpools: newCarpool } });
		if (updateEvents.modifiedCount === 0) throw "Could not update carpools successfully";
		// On success
		return {
			carpoolRegistered: true,
		};
	},
	async addPooler(eventId, poolId, userId) {
		// Inital Checks
		let _eventId = checkId(eventId);
		let _poolId = checkId(poolId);
		let _userId = checkId(userId);
		// Check if event exists
		const eventCollection = await events();
		const event = await eventCollection.findOne({ _id: _eventId });
		if (!event) throw `No event with ID of ${_eventId}`;
		// Check if carpool exists
		const carpool = event.carpools.find(carpool => carpool._id === _poolId);
		if (!carpool) throw `No carpool with ID of ${_poolId}`;
		// Check if user exists
		const userCollection = await user();
		const user = await userCollection.findOne({ _id: _userId });
		if (!user) throw `No event with ID of ${_eventId}`;
		// Check if capacity is reached
		if (carpool.members.length === carpool.capacity) throw `Carpool capacity reached`;
		// Add user to carpool
		const query = { _id: _eventId, carpools: { $elemMatch: { _id: _poolId } } };
    const options = { $push: { carpools: { $elemMatch: { _id: _poolId } } }: _userId }; // Fix options
		const updateEvents = await collection.updateOne(query, options);
		if (updateEvents.modifiedCount === 0) throw "Could not add pooler successfully";
		// On success
		return {
			poolerRegistered: true,
		};
	},
};
