(async function ($) {
	const checkString = (str, fieldName = "input", additionalCheck = str => true) => {
		if (!str) throw `${fieldName} does not exist`;
		if (typeof str !== "string") throw `${fieldName} is not a string`;
		const trimmed = str.trim();
		if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`;
		if (!additionalCheck(trimmed)) throw `${fieldName} is invalid`;
		return trimmed;
	};

	const checkFullName = fullName => {
		if (!fullName) throw `full name must be supplied`;
		let data = fullName.split(" ");
		if (data.length !== 2) throw `invalid fullName`;
		checkString(fullName[0]);
		checkString(fullName[1]);
		return fullName;
	};

	const checkDate = date => {
		if (!date) throw `date ${date} must be supplied`;
		let data = date.split("-");
		if (data.length !== 3) throw `invalid date ${date}`;
		date = [data[1], data[2], data[0]].join("/");
		date = new Date(date);
		// https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
		if (date instanceof Date && isNaN(date.getTime())) {
			throw `invalid date ${date}`;
		}
		let year = date.getFullYear();
		let month = (1 + date.getMonth()).toString().padStart(2, "0");
		let day = date.getDate().toString().padStart(2, "0");
		return month + "/" + day + "/" + year;
	};

	// checks if the time is in military format
	const checkTime = time => {
		if (!time) throw `time must be supplied`;
		//modified from https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s06.html
		const regex = "^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$";
		const _time = time.trim();
		let matches = _time.match(regex);
		if (!matches) throw `${_time} is not in a valid military time format`;
		return _time;
	};
	const checkDateTime = dateTime => {
		// might need to do some conversion
		if (!dateTime) throw `date and time must be supplied`;
		let data = dateTime.split("T");
		if (data.length !== 2) throw `invalid date and time ${dateTime}`;
		data[0] = checkDate(data[0]);
		data[1] = checkTime(`${data[1]}:00`);
		return data.join(" ");
	};

	const checkCapacity = capacity => {
		if (!capacity) throw `capacity must be supplied`;
		const _capacity = Number(capacity);
		if (typeof _capacity !== "number" || isNaN(_capacity)) throw `${_capacity} must be a number`;
		if (_capacity < 1) throw `cannot have capacity ${_capacity} < 1`;
		return _capacity;
	};

	const DOM = {
		div: "<div></div>",
		span: "<span></span>",
		a: "<a></a>",
		input: "<input/>",
		label: "<label></label>",
	};

	let poolList = $("#poolList"),
		hostPoolModal = $("#host-modal"),
		hostPoolBtn = $("#create-button"),
		hostPoolCloseBtn = $("#pool-close-btn"),
		hostPoolForm = $("#host-pool-form"),
		hostPoolDepartureTime = $("#host-pool-departureTime"),
		hostPoolCapacity = $("#host-pool-capacity"),
		hostErrorDiv = document.getElementById("host-pool-error");

	hostPoolCloseBtn.on("click", () => {
		hostPoolModal.css({
			opacity: 0,
			visibility: "hidden",
		});
	});

	hostPoolBtn.on("click", () => {
		hostPoolModal.css({
			opacity: 1,
			visibility: "visible",
		});
	});

	let pools = await $.get(`/pool/list/${$("#eventId").val()}`); // route that gets all possible pools for a given event

	const createPoolItem = async pool => {
		let poolLink = $(DOM.a);
		poolLink.attr("href", `/pool/${pool._id}`); // route to view an individual pool

		// pool container
		const driverData = await $.get(`/pool/user/${pool.driver}`);
		const driverName = [driverData.firstName, driverData.lastName].join(" ");

		const dateTime = pool.departureTime.split(/\s+/)
		const date = dateTime[0]
		const time = dateTime[1] 

		const poolContainer = $(DOM.div, { class: "pool-container" });
		const departureTimeContainer = $(DOM.span, { class: "pool-time-container" });
		const dateSpan = $(DOM.span, { class: "date" }).text(`${date}`);
		const departureTime = $(DOM.span, { class: "time" }).text(`${time}`);
		departureTimeContainer.append([dateSpan, departureTime]);
		const detailContainer = $(DOM.span, { class: "pool-detail-container" });
		const driver = $(DOM.span, { class: "driver" }).text(`${driverName}`);
		const capacity = $(DOM.span, { class: "capacity" }).text(`${pool.capacity} Seats`);
		detailContainer.append([driver, capacity]);
		poolContainer.append([departureTimeContainer, detailContainer]);
		poolLink.append(poolContainer);

		const spacer = $(DOM.div, { class: "spacer" });
		return {
			item: poolLink,
			spacer: spacer,
		};
	};

	const populateList = async pools => {
		// make sure pool list is empty before adding
		poolList.empty();
		for (const pool of pools) {
			const { item, spacer } = await createPoolItem(pool);
			poolList.append([item, spacer]);
		}
	};

	const createError = (div, error) => {
		// in case error had another error in it already; clear all children
		div.replaceChildren();
		div.hidden = false;
		const clearButton = document.createElement("span");
		clearButton.className = "fa-solid fa-xmark";
		clearButton.id = "close-error";
		const clearError = () => {
			div.replaceChildren();
			div.hidden = true;
		};
		clearButton.addEventListener("click", clearError);
		div.innerHTML = `${error}`;
		div.appendChild(clearButton);
	};

	// Host pool Functionality
	hostPoolForm.on("submit", async e => {
		e.preventDefault();
		try {
			let eventId = $("#eventId").val();
			const driverData = await $.get(`/pool/currentUser/data`);
			let driver = checkFullName([driverData.firstName, driverData.lastName].join(" "));
			let driverId = driverData._id;
			let departureTime = checkDateTime(hostPoolDepartureTime[0].value);
			let capacity = checkCapacity(hostPoolCapacity[0].value);

			let reqBody = {
				eventId: eventId,
				driverId: driverId,
				driver: driver,
				departureTime: departureTime,
				capacity: capacity,
			};

			const response = await $.post("/pool/create/pool", reqBody); // make route to create pools
			if (response.success) {
				hostPoolForm[0].reset();
				pools = await $.get(`/pool/list/${eventId}`);
				populateList(pools);
				hostPoolModal.css({
					opacity: 0,
					visibility: "hidden",
				});
				let page = `/pool/${response.poolId}`;
				window.location.href = page;
			}
		} catch (error) {
			const { responseJSON } = error
			const { errorMsg } = responseJSON
			createError(hostErrorDiv, `Error: ${errorMsg}`);
		}
	});

	// Initial populate event list
	await populateList(pools);
})(window.jQuery);
