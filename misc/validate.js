const emailValidator = require("email-validator");
const { v4: uuidv4, validate } = require("uuid");
const { phone } = require("phone");
const { ObjectId } = require("mongodb");
const US_States = require("../const/USStates.json");

module.exports = {
	checkString(str, fieldName = "input", additionalCheck = str => true) {
		if (!str) throw `${fieldName} does not exist`;
		if (typeof str !== "string") throw `${fieldName} is not a string`;
		const trimmed = str.trim();
		if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`;
		if (!additionalCheck(trimmed)) throw `${fieldName} is invalid`;
		return trimmed;
	},
	checkEmail(email) {
		if (!email) throw "email does not exist";
		if (typeof email !== "string") throw "email is not a string";
		const trimmed = email.trim();
		if (trimmed.length < 1) throw "email cannot be empty spaces";
		if (!emailValidator.validate(trimmed)) throw "email is invalid";
		return trimmed;
	},
	checkPassword(password) {
		if (!password) throw "password does not exist";
		if (typeof password !== "string") throw "password is not a string";
		const trimmed = password.trim();
		if (trimmed.length < 1) throw "password cannot be empty spaces";
		// regex source: https://stackoverflow.com/a/16334856
		const regex = /^\S*$/;
		if (!regex.test(trimmed)) throw "password cannot contain spaces";
		if (trimmed.length < 6) throw "password must be at least 6 characters long";
		return trimmed;
	},
	checkId(id) {
		if (!id) throw `id does not exist`;
		if (typeof id !== "string") throw `id is not a string`;
		if (id.includes(" ")) throw `id cannot contain spaces`;
		if (id.length < 1) throw `id cannot be empty`;
		const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
		if (!regexExp.test(id)) throw `id is invalid`;
		return id;
	},
	checkFirstName(firstName) {
		return module.exports.checkString(firstName, "First Name");
	},
	checkLastName(lastName) {
		return module.exports.checkString(lastName, "Last Name");
	},
	checkFullName(fullName) {
		if (!fullName) throw `full name must be supplied`;
		let data = fullName.split(" ");
		if (data.length !== 2) throw `invalid fullName`;
		module.exports.checkFirstName(fullName[0]);
		module.exports.checkLastName(fullName[1]);
		return fullName;
	},
	checkPhone(phoneNum) {
		const validate = phone(phoneNum);
		if (!validate.isValid) throw `Phone number is invalid`;
		return validate.phoneNumber;
	},
	checkVenmo(venmo) {
		return module.exports.checkString(venmo, "Venmo username");
	},
	checkEventName(name) {
		return module.exports.checkString(name, "Event Name");
	},
	checkStreet(street) {
		return module.exports.checkString(street, "Street");
	},
	checkCity(city) {
		return module.exports.checkString(city, "City");
	},
	checkState(state) {
		const curr = module.exports.checkString(state, "State");
		if (US_States[state] === undefined) throw `${state} does not exist in the United States`;
		return state;
	},
	checkZipcode(zipcode) {
		return module.exports.checkString(zipcode, "Zipcode", str => {
			return str.length === 5 && /^\d+$/.test(str);
		});
	},
	checkAddress(address) {
		if (!address) throw `Address does not exist`;
		const validatedAddress = {
			_id: uuidv4(),
			address: module.exports.checkStreet(address.address),
			city: module.exports.checkCity(address.city),
			state: module.exports.checkState(address.state),
			zipcode: module.exports.checkZipcode(address.zipcode),
		};
		return validatedAddress;
	},
	checkIsDriver(isDriver) {
		if (isDriver === undefined) throw `isDriver does not exist`;
		if (typeof isDriver !== 'boolean') throw `isDriver is not a boolean`;
		return isDriver;
	},
	checkPrivate(isPrivate) {
		if (isPrivate === undefined) throw `isPrivate does not exist`;
		if (typeof isPrivate !== 'boolean') throw `isPrivate is not a boolean`;
		return isPrivate;
	},
	//separate functions to check strings with both date and time
	//string is "04/01/2022 09:32:14"
	checkDateTime(dateTime) {
		if (!dateTime) throw `date and time must be supplied`;
		let data = dateTime.split(" ");
		if (data.length !== 2) throw `invalid date and time`;
		module.exports.checkDate(data[0]);
		module.exports.checkTime(data[1]);
		return dateTime;
	},

	checkId(id) {
		if (!id) throw `id must be supplied`;
		if (!validate(id)) throw `${id} is not a valid id`;
		return id;
	},

	/**********************
  Event Paramater Checks
  ***********************/

	//date validation modified from jordan's lab 8
	//https://stackoverflow.com/questions/11591854/format-date-to-mm-dd-yyyy-in-javascript
	checkDate(date) {
		if (!date) throw `date ${date} must be supplied`;
		//check if date is in acceptable format
		date = new Date(date);
		// https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
		if (date instanceof Date && isNaN(date.getTime())) {
			throw `invalid date ${date}`;
		}
		let year = date.getFullYear();
		let month = (1 + date.getMonth()).toString().padStart(2, "0");
		let day = date.getDate().toString().padStart(2, "0");
		return month + "/" + day + "/" + year;
	},
	// checks if the time is in military format
	checkTime(time) {
		if (!time) throw `time must be supplied`;
		//modified from https://www.geeksforgeeks.org/how-to-validate-time-in-24-hour-format-using-regular-expression/
		const regex = "([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]";
		const _time = time.trim();
		let matches = _time.match(regex);
		if (!matches) throw `${_time} is not in a valid military time format`;
		return _time;
	},
	// checks if capacity is a valid positive whole number
	checkCapacity(capacity) {
		if (!capacity) throw `capacity must be supplied`
		const _capacity = Number(capacity)
		if (typeof _capacity !== 'number' || isNaN(_capacity)) throw `${_capacity} must be a number`
		if (_capacity < 1) throw `cannot have capacity ${_capacity} < 1`
		return _capacity
	  },

	checkBool(bool) {
		if (typeof bool !== "boolean") throw 'variable is not a boolean'
		return bool;
	}, 
	

	/**********************
  Carpool Parameter Check
  ***********************/

  
	/**********************
  History Parameter Check
  ***********************/

  checkName(name) {
    let _name = module.exports.checkString(name)
    const nameArray = _name.split(' ')
    if (nameArray.length < 2) throw 'name must contain a first and last name'
    try {
      module.exports.checkFirstName(nameArray[0])
      module.exports.checkLastName(nameArray[1])
    } catch (e) {
      throw 'first or last name is invalid'
    }
    return _name;
  },
};
