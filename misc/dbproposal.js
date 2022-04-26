// Users
const user = {
	_id: "f4a5489d-8f6e-4997-a3a8-22519b5cc55e",
	firstName: "Jordan",
	lastName: "Wang",
	email: "jwang203@stevens.edu",
	password: "$2a$10$2M0FNA3JdPTQ4Yn2ZRFvle833u8T0z8Hi7WRWR9/qxU/M89QaG106",
	phone: "333-333-3333",
	venmo: "big-wang-69",
	address: {
		_id: "9d9e8e3f-67c6-4c72-9720-e9fe46ae9a2e",
		address: "422 Monroe St",
		city: "Hoboken",
		state: "NJ",
		zipcode: "07030",
	},
	driver: true,
	passenger: true,
	history: [
		{
			_id: "70abf263-c8ec-4729-b3c8-3db651979cc1",
			name: "Jordan Wang's Dance Party",
			date: "04/01/2022",
			carpool: "3e90e42d-bcd2-411e-9057-9b8da947a001",
		},
	],
};

// History (subdocument)
const history = {
	_id: "70abf263-c8ec-4729-b3c8-3db651979cc1",
	name: "Jordan Wang's Dance Party",
	date: "04/01/2022",
	carpool: "3e90e42d-bcd2-411e-9057-9b8da947a001",
};

// Events
const event = {
	_id: "70abf263-c8ec-4729-b3c8-3db651979cc1",
	name: "Jordan Wang's Dance Party",
	date: "04/01/2022",
	startTime: "13:30:00",
	host: "jwang203@stevens.edu",
	description: "Everyone is invited to dance to WAP and Twice songs with me!",
	capacity: 40,
	private: true,
	password: "jaanav",
	carpools: [
		{
			_id: "3e90e42d-bcd2-411e-9057-9b8da947a001",
			driver: "Sophia Zuo",
			departureTime: "04/01/2022 13:00:00",
			capacity: 4,
			members: ["f4a5489d-8f6e-4997-a3a8-22519b5cc55e", "94e10771-543c-4a95-b27f-b1a74065428d"],
			comments: [
				{
					_id: "7b7ffeef-c9d6-4c42-93d5-dee015e56eac",
					from: "jwang203@stevens.edu",
					details: "Don't be late or you won't get any food",
					timestamp: "04/01/2022 09:32:14",
				},
			],
		},
		{
			_id: "e55ee618-9a73-4872-a423-39191259f44d",
			driver: "Nicholas Soriano",
			departureTime: "04/01/2022 13:00:00",
			capacity: 3,
			members: ["a06a6109-bb1a-4489-92ef-386c0b1a3996"],
			comments: [],
		},
	],
	destination: {
		_id: "9d9e8e3f-67c6-4c72-9720-e9fe46ae9a2e",
		address: "422 Monroe St, Hoboken, NJ 07030",
		city: "Hoboken",
		state: "NJ",
		zipcode: "07030",
	},
};

// Carpool (subdocument)
const carpool = {
	_id: "3e90e42d-bcd2-411e-9057-9b8da947a001",
	driver: "Sophia Zuo",
	departureTime: "04/01/2022 13:00:00",
	capacity: 4,
	members: ["f4a5489d-8f6e-4997-a3a8-22519b5cc55e", "94e10771-543c-4a95-b27f-b1a74065428d"],
	comments: [
		{
			_id: "7b7ffeef-c9d6-4c42-93d5-dee015e56eac",
			from: "jwang203@stevens.edu",
			details: "Don't be late or you won't get any food",
			timestamp: "04/01/2022 09:32:14",
		},
	],
};

// Address (subdocument)
const address = {
	_id: "9d9e8e3f-67c6-4c72-9720-e9fe46ae9a2e",
	address: "422 Monroe St",
	city: "Hoboken",
	state: "NJ",
	zipcode: "07030",
};

// Comments (subdocument)
const comment = {
	_id: "7b7ffeef-c9d6-4c42-93d5-dee015e56eac",
	from: "f4a5489d-8f6e-4997-a3a8-22519b5cc55e",
	details: "Don't be late or you won't get any food",
	timestamp: "04/01/2022 09:32:14",
};
