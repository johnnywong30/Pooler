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

    const checkString = (str, fieldName = 'input', additionalCheck = str => true) => {
        if (!str) throw `${fieldName} is required`
        if (typeof str !== 'string') throw `${fieldName} is not a string`
        const trimmed = str.trim()
        if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`
        if (!additionalCheck(trimmed)) throw `${fieldName} is invalid`
        return trimmed
    }

    const checkPassword = (password) => {
        return checkString(password, 'Password', (password) => {
            // regex source: https://stackoverflow.com/a/16334856
            const regex = /^\S*$/
            if (!regex.test(password)) throw 'password cannot contain spaces'
            if (password.length < 6) throw 'password must be at least 6 characters long'
            return true
        })
    }

    const checkFirstName = (firstName) => {
        return checkString(firstName, 'First Name')
    }

    const checkLastName = (lastName) => {
        return checkString(lastName, 'Last Name')
    }

    const checkStreet = (street) => {
        return checkString(street, 'Street')
    }

    const checkCity = (city) => {
        return checkString(city, 'City')
    }

    const checkState = (state) => {
        return checkString(state, 'State', (state) => {
            if (US_States[state] === undefined) throw `${state} does not exist in the United States`
            return true
        })
    }

    const checkZipcode = (zipcode) => {
        return checkString(zipcode, 'Zipcode', (str) => {
            return str.length === 5 && /^\d+$/.test(str)
        })
    }

    const DOM = {
        div: '<div></div>',
        span: '<span></span>',
        a: '<a></a>',
        input: '<input/>',
        label: '<label></label>'
    }

    let eventList = $('#eventList'),
        sortButton = $('#sort-button'),
        sortIcon = $('#sort-icon'),
        searchTerm = $('#search-term'),
        passwordModal = $('#password-modal'),
        modalCloseBtn = $('#modal-close-btn'),
        privateEventForm = $('#private-event-form')

    let hostEventModal = $('#host-modal'),
        hostEventBtn = $('#create-button'),
        hostEventCloseBtn = $('#event-close-btn'),
        hostEventForm = $('#host-event-form'),
        hostEventName = $('#host-event-name'),
        hostEventTime = $('#host-event-time'),
        hostEventCapacity = $('#host-event-capacity'),
        hostEventDescription = $('#host-event-description'),
        hostEventPrivate = $('#host-event-private'),
        hostEventStreet = $('#host-event-street'),
        hostEventCity = $('#host-event-city'),
        hostEventZip = $('#host-event-zip'),
        hostEventState = $('#host-event-state'),
        hostEventPassword = $('#host-event-password')

    let hostErrorDiv = document.getElementById('host-event-error')

    let errorDiv = document.getElementById('client-error')

    let privateEventLink;


    modalCloseBtn.on('click', () => {
        passwordModal.css(
            {
                opacity: 0,
                visibility: 'hidden'
            }
        )
    })

    hostEventCloseBtn.on('click', () => {
        hostEventModal.css(
            {
                opacity: 0,
                visibility: 'hidden'
            }
        )
    })

    hostEventBtn.on('click', () => {
        hostEventModal.css(
            {
                opacity: 1,
                visibility: 'visible'
            }
        )
    })


    // -1 is descending order
    // 1 is ascending order
    let toggle = 1

    const sorts = {
        "1": (a, b) => {
            return new Date(a.fullDate) - new Date(b.fullDate)

        },
        "-1": (a, b) => {
            return new Date(b.fullDate) - new Date(a.fullDate)
        }
    }

    let events = await $.get('/events/list')
    console.log(events)
    const originalEvents = [...events]
    events.sort(sorts[toggle])

    const createEventItem = (event) => {
        const { private } = event
        let eventLink;
        if (!private) {
            eventLink = $(DOM.a)
            eventLink.attr('href', `/events/view/${event._id}`)
        }
        else {
            eventLink = $(DOM.div)
            eventLink.on('click', () => {
                passwordModal.css(
                    {
                        opacity: 1,
                        visibility: 'visible'
                    }
                )
                const link = `/events/validateEvent/${event._id}`
                privateEventForm.attr('action', link)
                privateEventLink = `/events/view/${event._id}`
            })
        }
        // event container
        const eventContainer = $(DOM.div, { 'class': 'event-container' })
        const dateContainer = $(DOM.span, { 'class': 'event-date-container' })
        const date = $(DOM.span, { 'class': 'date' }).text(`${event.date}`)
        const month = $(DOM.span, { 'class': 'month' }).text(`${event.month}`)
        dateContainer.append([date, month])
        const detailContainer = $(DOM.span, { 'class': 'event-detail-container' })
        const title = $(DOM.span, { 'class': 'event-title' }).text(`${event.title}`)
        const description = $(DOM.span, { 'class': 'description' }).text(`${event.description}`)
        detailContainer.append([title, description])
        eventContainer.append([dateContainer, detailContainer])
        eventLink.append(eventContainer)
        // spacer
        const spacer = $(DOM.div, { 'class': 'spacer' })
        return {
            item: eventLink,
            spacer: spacer
        }
    }

    const populateList = (events) => {
        // make sure event list is empty before adding
        eventList.empty()
        for (const event of events) {
            const { item, spacer } = createEventItem(event)
            eventList.append([item, spacer])
        }
    }

    sortButton.on('click', (e) => {
        e.preventDefault()
        sortIcon.toggleClass("fa-angle-down fa-angle-up")
        toggle *= -1
        events.sort(sorts[toggle])
        populateList(events)
    })



    searchTerm.on('keyup', (e) => {
        const currentTerm = e.target.value.trim().toLowerCase()
        if (currentTerm.length === 0) {
            events = [...originalEvents].sort(sorts[toggle])
            populateList(events)
        }
        else {
            events = [...originalEvents].filter(event => {
                const title = event.title.trim().toLowerCase()
                return title.includes(currentTerm)
            })
                .sort(sorts[toggle])
            populateList(events)
        }
    })

    const createError = (div, error) => {
        // in case error had another error in it already; clear all children
        div.replaceChildren()
        div.hidden = false
        const clearButton = document.createElement('span')
        clearButton.className = 'fa-solid fa-xmark'
        clearButton.id = 'close-error'
        const clearError = () => {
            div.replaceChildren()
            div.hidden = true
        }
        clearButton.addEventListener('click', clearError)
        div.innerHTML = `Error: ${error}`
        div.appendChild(clearButton)
    }

    privateEventForm.on('submit', async (e) => {
        e.preventDefault()
        try {
            const password = checkPassword(e.target[0].value)
            const url = privateEventForm.attr('action')
            const data = await $.post(url, { password: password })
            const { authenticated } = data
            if (authenticated) {
                // go to private event's page
                const privatePage = `${privateEventLink}?pwd=${password}`
                window.location.href = privatePage
            }
            else throw 'Invalid password'

        } catch (error) {
            createError(errorDiv, "Invalid password")
        }

    })

    let passwordDiv = null;

    // Host Event Functionality
    hostEventPrivate.on('change', (e) => {
        if (e.target.value === 'private' && passwordDiv === null) {
            passwordDiv = $(DOM.div).addClass("profile-form-item")
            const passwordInput = $(DOM.input)
            passwordInput.attr('id', 'host-event-password')
            passwordInput.attr('name', 'password')
            passwordInput.attr('type', 'password')
            passwordInput.attr('required', true)
            const passwordLabel = $(DOM.label)
            passwordLabel.attr('for', 'host-event-password')
            passwordLabel.text('Password')
            passwordDiv.append([passwordInput, passwordLabel])
            $('#host-footer').before(passwordDiv)
        }
        else {
            passwordDiv.remove()
            passwordDiv = null;
        }
    })

    hostEventForm.on('submit', (e) => {
        try {
            // TODO finish validation and then submit
            const name = hostEventName[0].value
            const time = hostEventTime[0].value
            const capacity = hostEventCapacity[0].value
            const description = hostEventDescription[0].value
            const private = hostEventPrivate[0].value === 'private'
            const street = hostEventStreet[0].value
            const city = hostEventCity[0].value
            const zip = hostEventZip[0].value
            const state = hostEventState[0].value

        } catch (error) {
            e.preventDefault()
            createError(hostErrorDiv, `Error: ${error}`)
        }

    })

    // Initial populate event list
    populateList(events)

})(window.jQuery);
