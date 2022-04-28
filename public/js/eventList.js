(async function ($) {

    const DOM = {
        div: '<div></div>',
        span: '<span></span>'
    }

    let eventList = $('#eventList'),
        sortButton = $('#sort-button'),
        sortIcon = $('#sort-icon'),
        searchTerm = $('#search-term')

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
    const originalEvents = [...events]
    events.sort(sorts[toggle])
    const createEventItem = (event) => {
        // event container
        const eventContainer = $(DOM.div, {'class': 'event-container'})
        const dateContainer = $(DOM.span, {'class': 'event-date-container'})
        const date = $(DOM.span, {'class': 'date'}).text(`${event.date}`)
        const month = $(DOM.span, {'class': 'month'}).text(`${event.month}`)
        dateContainer.append([date, month])
        const detailContainer = $(DOM.span, {'class': 'event-detail-container'})
        const title = $(DOM.span, {'class': 'event-title'}).text(`${event.title}`)
        const description = $(DOM.span, {'class': 'description'}).text(`${event.description}`)
        detailContainer.append([title, description])
        eventContainer.append([dateContainer, detailContainer])
        // spacer
        const spacer = $(DOM.div, {'class': 'spacer'})
        return {
            item: eventContainer,
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

    populateList(events)

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

})(window.jQuery);
