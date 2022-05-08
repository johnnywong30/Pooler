(async function ($) {
    const US_States = {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District Of Columbia",
        "FM": "Federated States Of Micronesia",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "MP": "Northern Mariana Islands",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PW": "Palau",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VI": "Virgin Islands",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
    }

    //taken from validateRegister
    const checkString = (str, fieldName = 'input', additionalCheck = str => true) => {
        if (!str) throw `${fieldName} is required`
        if (typeof str !== 'string') throw `${fieldName} is not a string`
        const trimmed = str.trim()
        if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`
        if (!additionalCheck(trimmed)) throw `${fieldName} is invalid`
        return trimmed
    }

    //date validation modified from jordan's lab 8
        //https://stackoverflow.com/questions/11591854/format-date-to-mm-dd-yyyy-in-javascript
    const checkDate = (date) => {
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
    }
    // checks if the time is in military format
    const checkTime = (time) => {
        if (!time) throw `time must be supplied`;
        //modified from https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s06.html
        const regex = "^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$";
        const _time = time.trim();
        let matches = _time.match(regex);
        if (!matches) throw `${_time} is not in a valid military time format`;
        return _time;
    }

    const checkStreet = (street) => {
		return checkString(street, "Street");
	}

	const checkCity = (city) => {
		return checkString(city, "City");
	}

	const checkState = (state) => {
		const curr = checkString(state, "State");
		if (US_States[state] === undefined) throw `${state} does not exist in the United States`;
		return state;
	}

	const checkZipcode = (zipcode) => {
		return checkString(zipcode, "Zipcode", str => {
			return str.length === 5 && /^\d+$/.test(str);
		});
	}

    const checkName = (name) => {
        return checkString(name, 'Event Name')
    }

    const checkEventDate = (date) => {
        return checkDate(date)
    }

    const checkEventTime = (time) => {
        return checkTime(time)
    }

    const checkDescription = (description) => {
        return checkString(description, 'description')
    }

    const checkAddress = (address) => {
		if (!address) throw `Address does not exist`;
		const validatedAddress = {
			address: checkStreet(address.address),
			city: checkCity(address.city),
			state: checkState(address.state),
			zipcode: checkZipcode(address.zipcode),
		};
		return validatedAddress;
	}

    let editEventForm = document.getElementById('edit-event-form')
    let name = document.getElementById('name')
    let date = document.getElementById('date')
    let time = document.getElementById('time')
    let street = document.getElementById('street')
    let city = document.getElementById('city')
    let zipcode = document.getElementById('zipcode')
    let state = document.getElementById('state')
    let description = document.getElementById('description')
    let editBtn = document.getElementById('update-button')
    let saveChangesBtn = document.getElementById('saveChangesBtn')
    let cancelBtn = document.getElementById('cancelBtn')
    let deleteBtn = document.getElementById('delete-button')

    let list = document.querySelectorAll('.editable')
    let editables = Array.from(list).map(elem => elem)
    let currentValues = editables.map((element) => (element.value) ? element.value : element.checked)
    let currentState = state.value


    let stateAttributes = ["data-value", "onfocus", "onchange"]
    let beforeEditStateAttr = {
        dataValue: state.getAttribute("data-value"),
        onFocus: state.getAttribute("onfocus"),
        onChange: state.getAttribute("onchange")
    }


    let contentEditable = false;
    const submittable = {
        name: true,
        date: true,
        time: true,
        street: true,
        city: true,
        zipcode: true,
        state: true,
        description: true
    }

    let host = await $.get(`/events/getHost/${deleteBtn.value}`)
    let currentuser = await $.get('/events/getUser')

    if (currentuser === host) {
        deleteBtn.disabled = false;
        editBtn.disabled = false;
    }

    if (currentuser !== host) {
        deleteBtn.hidden = true
        editBtn.hidden = true
        cancelBtn.hidden = true
        saveChangesBtn.hidden = true
    }

    editBtn.addEventListener('click', (e) => {
        e.preventDefault()
        if (!contentEditable) {
            contentEditable = !contentEditable
            editables.map((element) => element.readOnly = false)
            for (const attr of stateAttributes) {
                state.removeAttribute(attr)
            }
            editBtn.disabled = true
            saveChangesBtn.disabled = false
            cancelBtn.disabled = false
        }
        else {
            throw `Error: edit mode is enabled. Please cancel or save changes`
        }
    })

    cancelBtn.addEventListener('click', (e) => {
        if (contentEditable) {
            contentEditable = !contentEditable
            for (let i = 0; i < editables.length; i++) {
                if (editables[i].value)
                    editables[i].value = currentValues[i]
                else
                    editables[i].checked = currentValues[i]
            }
            state.value = currentState
            editables.map((element) => element.readOnly = true)
            for (const attr in beforeEditStateAttr) {
                state.setAttribute(attr, beforeEditStateAttr[attr])
            }
            editBtn.disabled = false
            saveChangesBtn.disabled = true
            cancelBtn.disabled = true
        }
    })

    deleteBtn.addEventListener('click', (e) => {
        if (confirm("Are you sure you would like to delete this event?")) {
            $.ajax({
                url: `/events/${deleteBtn.value}`,
                type: 'DELETE',
                success: function (msg) {
                    console.log('success');
                    location.href = `/events`
                },
                error: function (error) {
                    console.log(`Error ${error}`);
                }
            });
        }

        else {
            console.log("cancelled");
        }
    })
    
    editEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        var destination = {
            address: street.value,
            city: city.value,
            state: state.value,
            zipcode: zipcode.value,
        }

        var sendInfo = {
            name: name.value,
            date: date.value,
            startTime: time.value,
            description: description.value,
            destination: destination
        }
        
        try {
            const _checkName = checkName(name.value);
        } catch(e) {
            name.value = currentValues[0]
            alert("invalid name")
        }

        try {
            const _checkDate = checkEventDate(date.value);
        } catch(e) {
            date.value = currentValues[1]
            alert("invalid date")
        }

        try {
            const _checkTime = checkEventTime(time.value);
        } catch(e) {
            time.value = currentValues[2]
            alert("invalid time")
        }

        try {
            const _checkDescription = checkDescription(description.value);
        } catch(e) {
            description.value = currentValues[6]
            alert("invalid description")
        }

        try {
            const _checkDestination = checkAddress(destination);
            street.value = currentValues[3]
            city.value = currentValues[4]
            zipcode.value = currentValues[5]
        } catch(e) {
            alert("invalid address")
        }

        // this hurts to look at
        $.ajax({
            url: `/events/updateEvent/${deleteBtn.value}`,
            type: 'POST',
            data: sendInfo,
            success: function (msg) {
                console.log('success');
                editBtn.disabled = false
                saveChangesBtn.disabled = true
                cancelBtn.disabled = true
                currentValues = editables.map((element) => (element.value) ? element.value : element.checked)
                location.reload()
            },
            error: function (error) {
                alert(`Error ${error}`);
            }
        });

        if (contentEditable) {
            contentEditable = !contentEditable
            editables.map((element) => element.readOnly = true)
            $('.event-heading').text(name.value)
            editBtn.disabled = false
            saveChangesBtn.disabled = true
            cancelBtn.disabled = true
        }
        
    })

    
})(window.jQuery);
