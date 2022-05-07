const express = require("express");
const { events, carpools, users, history } = require("../data");
const US_States = require("../const/USStates.json");
const router = express.Router();
const xss = require("xss");
const { checkId, checkEmail, checkCapacity, checkDateTime } = require("../misc/validate");

router.route("/").get(async (req, res) => {
	return res.redirect("/events");
});

router.route("/create/pool").post(async (req, res) => {
	if (req.session.user) {
		try {
			const { eventId, driverId, capacity, departureTime } = req.body;
			const _eventId = checkId(xss(eventId));
			const _driverId = checkId(xss(driverId));
			const _capacity = checkCapacity(capacity); // is a number
			const _departureTime = checkDateTime(xss(departureTime));
			const pool = await carpools.createPool(_eventId, _driverId, _departureTime, _capacity);
			return res.json({ success: true, poolId: pool._id }).end();
		} catch (e) {
			console.log(e);
			res.statusMessage = e;
			return res.status(404).json({ errorMsg: e }).end();
		}
	} else {
		return res.redirect("/");
	}
});

router.route("/:id").get(async (req, res) => {
	try {
		const user = await users.getUser(req.session.user.email);
		const event = await events.getEventByPoolId(req.params.id);
		const pool = await carpools.getPool(req.params.id);
		const _poolId = req.params.id;
		const _driver = await users.getUserById(pool.driver);
		const _driverName = `${_driver.firstName} ${_driver.lastName}`;
		const _departureTime = pool.departureTime;
		const _capacity = pool.capacity;
		let _memberData = pool.members.slice();
		//_memberData.forEach(id => await users.getUserById(id))
		for (let i = 0; i < _memberData.length; i++) {
			try {
				_memberData[i] = await users.getUserById(_memberData[i]);
			} catch (e) {
				console.log("No such member with ID " + _memberData[i]);
			}
		}
		const _numMembers = _memberData.length;
		const _comments = pool.comments;
		const _eventName = event.name;
		const _isUserInPool = pool.members.indexOf(user._id) > -1;
		const _eventID = event._id;
		const args = { _poolId, _driverName, _departureTime, _capacity, _memberData, _numMembers, _comments, _eventName, _isUserInPool, _eventID };
		return res.render("templates/pool", args);
	} catch (e) {
		const states = Object.keys(US_States);
		const templateData = {
			error: e,
			states: states,
		};
		return res.status(400).render("templates/error", templateData);
	}
});

router.route("/list/:id").get(async (req, res) => {
	if (req.session.user) {
		try {
			const pool = await carpools.getPools(req.params.id);
			const _poolId = req.params.id;
			const importCarpools = await carpools.getPools(_poolId);
			return res.json(importCarpools);
		} catch (e) {
			console.log(e);
			return res.status(500).json({ error: e });
		}
	} else {
		res.redirect("/");
	}
});

router.route("/currentUser/data").get(async (req, res) => {
	if (req.session.user) {
		try {
			const user = await users.getUser(req.session.user.email);
			return res.json(user);
		} catch (e) {
			console.log(e);
			return res.status(500).json({ error: e });
		}
	} else {
		res.redirect("/");
	}
});

router.route("/user/:id").get(async (req, res) => {
	if (req.session.user) {
		try {
			const user = await users.getUserById(req.params.id);
			return res.json(user);
		} catch (e) {
			console.log(e);
			return res.status(500).json({ error: e });
		}
	} else {
		res.redirect("/");
	}
});

router.route("/:id/join").get(async (req, res) => {
	try {
		const email = checkEmail(xss(req.session.user.email));
		const _poolId = checkId(xss(req.params.id));
		const user = await users.getUser(email);
		const event = await events.getEventByPoolId(_poolId);
		const pool = await carpools.getPool(_poolId);
		await carpools.addPooler(event._id, pool._id, user._id);
		// add event to history
		await history.addToHistory(user._id, event._id, pool._id);
	} catch (e) {
		console.log(e);
	}
	res.redirect(`/pool/${req.params.id}`);
});

router.route("/:id/leave").get(async (req, res) => {
	try {
		const email = checkEmail(xss(req.session.user.email));
		const _poolId = checkId(xss(req.params.id));
		const user = await users.getUser(email);
		const event = await events.getEventByPoolId(_poolId);
		const pool = await carpools.getPool(_poolId);
		await carpools.deletePooler(event._id, pool._id, user._id);
		await history.removeFromHistory(user._id, event._id, pool._id);
	} catch (e) {
		console.log(e);
	}
	res.redirect(`/pool/${req.params.id}`);
});

module.exports = router;
