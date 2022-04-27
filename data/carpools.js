const { checkId, checkFullName, checkDateTime, checkCapacity } = require("../misc/validate");
const { events, users } = require("../config/mongoCollections");
const { v4: uuidv4 } = require("uuid");

module.exports = {
	async createPool(eventId, driverId, driver, departureTime, capacity) {
		// Initial Checks
		const _eventId = checkId(eventId);
		const _driverId = checkId(driverId)
		const _driver = checkFullName(driver);
		const _departureTime = checkDateTime(departureTime);
		const _capacity = checkCapacity(capacity);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: _eventId });
		if (!event) throw `No event with ID of ${_eventId}`;

		// Check if driver exists
		const userCollection = await users()
		const user = await userCollection.findOne({ _id: _driverId })
		if (!user) throw `No driver with ID of ${driverId}`
		// Check if driver is actually a driver
		if (!user.driver) throw `${driver} cannot drive. Cannot create carpool`

		// Check if driver is in another carpool
		const hasCarpool = event.carpools.find(carpool => carpool.members.includes(_driverId));
		if (hasCarpool) throw `${driver} has already registered for a carpool`;

		// Create carpool
		const newCarpool = {
			_id: uuidv4(),
			driver: _driver,
			departureTime: _departureTime,
			capacity: _capacity,
			members: [_driverId],
			comments: [],
		};
		const updateEvents = await collection.updateOne(
			{ _id: _eventId },
			{ $push: { carpools: newCarpool } }
		);
		if (updateEvents.modifiedCount === 0) throw "Could not add carpool successfully";
		// On success
		return { carpoolRegistered: true };
	},
	async addPooler(eventId, poolId, userId) {
		// Inital Checks
		let _eventId = checkId(eventId);
		let _poolId = checkId(poolId);
		let _userId = checkId(userId);
		// Check if user exists
		const userCollection = await users();
		const user = await userCollection.findOne({ _id: _userId });
		if (!user) throw `No user with ID of ${_userId}`;
		// Check if event exists
		const eventCollection = await events();
		const event = await eventCollection.findOne({ _id: _eventId });
		if (!event) throw `No event with ID of ${_eventId}`;
		// Check if carpool exists
		const carpool = event.carpools.find(carpool => carpool._id === _poolId);
		if (!carpool) throw `No carpool with ID of ${_poolId}`;
		// Check if capacity is reached
		if (carpool.members.length === carpool.capacity) throw `Carpool capacity reached`;
		// Add user to carpool
		// const query = { _id: _eventId, carpools: { $elemMatch: { _id: _poolId } } };
		// const options = { $push: { carpools: { $elemMatch: { _id: _poolId } } }: _userId }; // Fix options

		const updateCarpool = await eventCollection.updateOne(
			{ _id: _eventId, "carpools._id": _poolId },
			{ $push: { "carpools.$.members": _userId } }
		)
		if (updateCarpool.modifiedCount === 0) throw "Could not add pooler successfully";
		// On success
		return { poolerRegistered: true }
	},
	async deletePooler(eventId, poolId, userId) {
		// Inital Checks
		let _eventId = checkId(eventId);
		let _poolId = checkId(poolId);
		let _userId = checkId(userId);
		// Check if user exists
		const userCollection = await users();
		const user = await userCollection.findOne({ _id: _userId });
		if (!user) throw `No user with ID of ${_userId}`;
		// Check if event exists
		const eventCollection = await events();
		const event = await eventCollection.findOne({ _id: _eventId });
		if (!event) throw `No event with ID of ${_eventId}`;
		// Check if carpool exists
		const carpool = event.carpools.find(carpool => carpool._id === _poolId);
		if (!carpool) throw `No carpool with ID of ${_poolId}`;
		// Check if user is in carpool
		if (!carpool.members.includes(userId)) throw `${_userId} is not part of carpool ${_poolId}`

		const updateInfo = await eventCollection.updateOne(
			{ _id: _eventId, "carpools._id": _poolId },
			{ $pull: { "carpools.$.members": _userId } }
		)
		
		if (updateInfo.modifiedCount === 0) throw `Could not remove ${_userId} from pool ${_poolId}`;
		return true;
	}
};
