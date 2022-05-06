(async function ($) {
	checkString = (str, fieldName = "input", additionalCheck = str => true) => {
		if (!str) throw `${fieldName} does not exist`;
		if (typeof str !== "string") throw `${fieldName} is not a string`;
		const trimmed = str.trim();
		if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`;
		if (!additionalCheck(trimmed)) throw `${fieldName} is invalid`;
		return trimmed;
	};

	checkId = id => {
		if (!id) throw `id does not exist`;
		if (typeof id !== "string") throw `id is not a string`;
		if (id.includes(" ")) throw `id cannot contain spaces`;
		if (id.length < 1) throw `id cannot be empty`;
		const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
		if (!regexExp.test(id)) throw `id is invalid`;
		return id;
	};

	checkFullName = fullName => {
		if (!fullName) throw `full name must be supplied`;
		let data = fullName.split(" ");
		if (data.length !== 2) throw `invalid fullName`;
		module.exportsCheckFirstName(fullName[0]);
		module.exportsChckLastName(fullName[1]);
		return fullName;
	};

	checkDateTime = dateTime => {
		if (!dateTime) throw `date and time must be supplied`;
		let data = dateTime.split(" ");
		if (data.length !== 2) throw `invalid date and time`;
		module.exports.checkDate(data[0]);
		module.exports.checkTime(data[1]);
		return dateTime;
	};

	checkCapacity = capacity => {
		if (!capacity) throw `capacity must be supplied`;
		const _capacity = Number(capacity);
		if (typeof _capacity !== "number" || isNaN(_capacity)) throw `${_capacity} must be a number`;
		if (_capacity < 1) throw `cannot have capacity ${_capacity} < 1`;
		return _capacity;
	};

	checkName = name => {
		let _name = checkString(name);
		const nameArray = _name.split(" ");
		if (nameArray.length < 2) throw "name must contain a first and last name";
		try {
			module.exports.checkFirstName(nameArray[0]);
			module.exports.checkLastName(nameArray[1]);
		} catch (e) {
			throw "first or last name is invalid";
		}
		return _name;
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
		hostPoolEventId = $("#host-pool-event-id"),
		hostPoolDriverId = $("host-pool-driver-id"),
		hostPoolDriver = $("#host-pool-driver"),
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

	// let pools = await $.get(`/pool/list/${hostPoolEventId}`); // route that gets all possible pools for a given event

	let pools = await $.get(`/pool/list/c351bd0b-0bc2-442b-a400-1a1ee368ce4a`); // route that gets all possible pools for a given event
	// console.log(pools);

	const createPoolItem = async pool => {
		let poolLink = $(DOM.a);
		poolLink.attr("href", `/pool/${pool._id}`); // route to view an individual pool

		// pool container
		// const driverData = await $.get(`/pool/data/${pool.driver}`);
		// const driverName = [driverData.firstName, driverData.lastName].join(" ");
		const poolContainer = $(DOM.div, { class: "pool-container" });
		const departureTimeContainer = $(DOM.span, { class: "pool-departureTime-container" });
		const departureTime = $(DOM.span, { class: "departureTime" }).text(`${pool.departureTime}`);
		departureTimeContainer.append([departureTime]);
		const detailContainer = $(DOM.span, { class: "pool-detail-container" });
		const driver = $(DOM.span, { class: "pool-driver" }).text(`${pool.driver}`);
		const capacity = $(DOM.span, { class: "pool-capacity" }).text(`${pool.capacity}`);
		detailContainer.append([driver, capacity]);
		poolContainer.append([departureTimeContainer, detailContainer]);
		poolLink.append(poolContainer);
		// spacer
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
			const eventId = checkId(xss(hostPoolEventId[0].value));
			const driver = checkFullName(hostPoolDriver[0].value);
			const driverId = checkId(xss(hostPoolDriverId[0].value));
			const departureTime = checkDateTime(hostPoolDepartureTime[0].value);
			const capacity = checkCapacity(hostPoolCapacity[0].value);

			const reqBody = {
				eventId: eventId,
				driver: driver,
				driverId: driverId,
				departureTime: departureTime,
				capacity: capacity,
			};

			const response = await $.post("/pool/createPool", reqBody); // make route to create pools
			if (response.success) {
				hostPoolForm[0].reset();
				pools = await $.get(`/pool/list/${hostPoolEventId}`);
				populateList(pools);
				hostPoolModal.css({
					opacity: 0,
					visibility: "hidden",
				});
				// go to pool's page
				let page = `/pool/${response.poolId}`;
				window.location.href = page;
			}
		} catch (error) {
			createError(hostErrorDiv, `Error: ${error}`);
		}
	});

	// Initial populate event list
	await populateList(pools);
})(window.jQuery);
