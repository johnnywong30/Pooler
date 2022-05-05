const { checkId, checkString, checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver } = require("../misc/validate");
const { users } = require("../config/mongoCollections");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
// uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const saltRounds = 10;

module.exports = {
	async createUser(email, password, firstName, lastName, phone, venmo, address, isDriver) {
		// Initial checks
		const _email = checkEmail(email);
		const _pass = checkPassword(password);
		const _firstName = checkFirstName(firstName);
		const _lastName = checkLastName(lastName);
		const _phone = checkPhone(phone);
		const _venmo = checkVenmo(venmo);
		const _address = checkAddress(address);
		const _isDriver = checkIsDriver(isDriver);
		// Check if account exists
		const collection = await users();
		const account = await collection.findOne({ email: email });
		if (account !== null) throw `Account with email ${email} exists already`;
		// Create account
		const saltedPass = await bcrypt.hash(_pass, saltRounds);
		const newUser = {
			_id: uuidv4(),
			firstName: _firstName,
			lastName: _lastName,
			email: _email,
			password: saltedPass,
			phone: _phone,
			venmo: _venmo,
			address: _address,
			driver: _isDriver,
			passenger: true,
			history: [],
		};
		// Register account
		const insertInfo = await collection.insertOne(newUser);
		if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not register user";
		// On success
		return {
			userRegistered: true,
		};
	},
	async getUserById(id) {
		const _id = checkId(id);
		const collection = await users();
		const account = await collection.findOne({ _id: id });
		if (account === null) throw `Account with id ${id} does not exist`;
		return account;
	},
	async checkUser(email, password) {
		// Initial checks
		const _email = checkEmail(email);
		const _password = checkPassword(password);
		// Check if account exists
		const collection = await users();
		const account = await collection.findOne({ email: _email });
		if (account === null) throw `Either the username or password is invalid`;
		// Authenticate
		let match = false;
		try {
			match = await bcrypt.compare(_password, account.password);
		} catch (e) {
			// no op
		}
		// Not authenticated
		if (!match) throw `Either the username or password is invalid`;
		return {
			authenticated: true,
		};
	},
	async getUser(_email) {
		const email = checkEmail(_email)
		const collection = await users()
		const user = await collection.findOne({ email: email });
		if (user === null) throw `Error: user with email ${email} was not found`;
		return user
	},
	async getUsers() {
		const collection = await users();
		const userList = await collection.find({}).toArray();
		if (!userList) throw "could not get all users";
		return userList;
	},
	//for editing profile or anything
	async updateUser(email, firstName, lastName, phone, venmo, address, isDriver) {
		const _email = checkEmail(email)
		const _firstName = checkFirstName(firstName)
		const _lastName = checkLastName(lastName)
		const _phone = checkPhone(phone)
		const _venmo = checkVenmo(venmo)
		const _address = checkAddress(address)
		const _isDriver = checkIsDriver(isDriver)
		// Check if account exists
		const collection = await users()
		const account = await collection.findOne({ email: _email })
		if (account === null) throw `updateUser: Account with email ${email} not found`
		let newInfo = {
			...account,
			email: _email,
			firstName: _firstName,
			lastName: _lastName,
			phone: _phone,
			venmo: _venmo,
			address: _address,
			driver: _isDriver
		}
		const updatedInfo = await collection.updateOne(
			{ email: _email },
			{ $set: newInfo }
		)
		if (updatedInfo.modifiedCount === 0) {
			throw 'Error: updateUser could not update user successfully';
		}
		return await module.exports.getUser(_email)
	}
};