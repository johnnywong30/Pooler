const { checkId, checkFullName, checkDateTime, checkCapacity, checkName } = require("../misc/validate");
const eventsData = require("./events");
const { events, users } = require("../config/mongoCollections");
const { v4: uuidv4 } = require("uuid");

module.exports = {
	async createPool(eventId, driverId, driver, departureTime, capacity) {
		// Initial Checks
		const _eventId = checkId(eventId);
		const _driverId = checkId(driverId);
		const _driver = checkFullName(driver);
		const _departureTime = checkDateTime(departureTime);
		const _capacity = checkCapacity(capacity);
		// Check if event exists
		const collection = await events();
		const event = await collection.findOne({ _id: _eventId });
		if (!event) throw `No event with ID of ${_eventId}`;

		// Check if driver exists
		const userCollection = await users();
		const user = await userCollection.findOne({ _id: _driverId });
		if (!user) throw `No driver with ID of ${driverId}`;
		// Check if driver is actually a driver
		if (!user.driver) throw `${driver} cannot drive. Cannot create carpool`;

		// Check if driver is in another carpool
		const hasCarpool = event.carpools.find(carpool => carpool.members.includes(_driverId));
		if (hasCarpool) throw `${driver} has already registered for a carpool`;

		const _poolId = uuidv4()

		// Create carpool
		const newCarpool = {
			_id: _poolId,
			driver: _driverId,
			departureTime: _departureTime,
			capacity: _capacity,
			members: [_driverId],
			comments: [],
		};
		const updateEvents = await collection.updateOne({ _id: _eventId }, { $push: { carpools: newCarpool } });
		if (updateEvents.modifiedCount === 0) throw "Could not add carpool successfully";
		if (! response.addedToHistory) throw 'Could not add event to history'
		// On success
		return { carpoolRegistered: true };
	},
	async deletePool(poolId) {
		// Initial Checks
		const _poolId = checkId(poolId);
		// Check if event exists
		const event = await eventsData.getEventByPoolId(poolId)
		if (!event) throw `No event with Pool ID of ${poolId}`

		const eventCollection = await events();
		const updateInfo = await eventCollection.updateOne({ _id: event._id }, { $pull: { carpools: {_id: poolId}} });
		if (updateInfo.modifiedCount === 0) throw `Could not delete pool ${_poolId}`;
		
		return { carpoolDeleted: true }
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
		if (carpool.members.length >= carpool.capacity) throw `Carpool capacity reached`;
		// Check if user is in any other carpool
		const membersList = await eventsData.getAllMembers(eventId)
		if (membersList.indexOf(_userId) > 0) throw `User already in another pool`;
		// Add user to carpool
		const updateCarpool = await eventCollection.updateOne({ _id: _eventId, "carpools._id": _poolId }, { $push: { "carpools.$.members": _userId } });
		if (updateCarpool.modifiedCount === 0) throw "Could not add pooler successfully";

		// On success
		return { poolerRegistered: true };
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
		if (!carpool.members.includes(userId)) throw `${_userId} is not part of carpool ${_poolId}`;
		
		// Check if user is last member
		if (carpool.members.length <= 1){
			await this.deletePool(poolId)
			return false
		}

		const updateInfo = await eventCollection.updateOne({ _id: _eventId, "carpools._id": _poolId }, { $pull: { "carpools.$.members": _userId } });
		if (updateInfo.modifiedCount === 0) throw `Could not remove ${_userId} from pool ${_poolId}`;
		return true;
	},
	async getPool(poolId) {
		// Initial Checks
		let _poolId = checkId(poolId);
		// Check if carpool exists
		const eventsCollection = await events();
		const event = await eventsCollection.findOne({ carpools: { $elemMatch: { _id: _poolId } } });
		if (!event) throw `No carpool with ID of ${_poolId}`;
		const carpool = event.carpools.find(carpool => carpool._id === _poolId);
		return carpool;
	},
	async updateDepartureTime(_id, _departureTime) {
		const id = checkId(_id);
		const departureTime = checkDateTime(_departureTime);
		// Check if carpool exists
		const eventsCollection = await events();
		const event = await eventsCollection.findOne({ carpools: { $elemMatch: { _id: _poolId } } });
		if (!event) throw `No carpool with ID of ${_poolId}`;
		const updatedInfo = await eventsCollection.updateOne({ _id: _eventId, "carpools._id": _poolId }, { $set: { "carpools.$.departureTime": departureTime } });

		if (updatedInfo.modifiedCount === 0) throw "Could not update departire time";
		return await this.getEvent(id);
	},
};
