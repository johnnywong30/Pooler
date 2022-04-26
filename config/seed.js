const connection = require("./mongoConnection");
const { ObjectId } = require("mongodb");
const data = require("../data/");
const users = data.users;
const events = data.events;
const carpools = data.carpools;

const setup = async () => {
	const db = await connection.connectToDb();
	try {
		await db.collection("users").drop();
		await db.collection("events").drop();
	} catch (e) {
		// collections do not exist yet
	}
	const jordanWangDanceParty = await events.createEvent("Jordan Wang's Dance Party", "4/01/2022", "13:30:00", "jwang203@stevens.edu", "Everyone is invited to dance to WAP and Twice songs with me!", 40, true, "jaanav");
	console.log(jordanWangDanceParty);
};

setup();

module.exports = {
	setup: setup,
};
