(async function ($) {

    const DOM = {
        div: '<div></div>',
        span: '<span></span>',
        a: '<a></a>'
    }

    let historyList = $('#historyList'),
        sortButton = $('#sort-button'),
        sortIcon = $('#sort-icon'),
        pastButton = $('#pastButton'),
        upcomingButton = $('#upcomingButton'),
        allButton = $('#allButton')

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

    let history = await $.get('/history/list')
    console.log(history)
    const originalHistory = [...history]
    history.sort(sorts[toggle])

    const createHistoryItem = (history) => {
        const { private } = history
        let eventLink;
        eventLink = $(DOM.a)
        const password = private ? `?pwd=${history.password}` : ''
        const link = `/events/view/${history._id}${password}`
        eventLink.attr('href', link)
        const historyContainer = $(DOM.div, { 'class': 'history-container' })
        const dateContainer = $(DOM.span, { 'class': 'history-date-container' })
        const date = $(DOM.span, { 'class': 'date' }).text(`${history.date}`)
        const month = $(DOM.span, { 'class': 'month' }).text(`${history.month}`)
        dateContainer.append([date, month])
        const detailContainer = $(DOM.span, { 'class': 'history-detail-container' })
        const title = $(DOM.span, { 'class': 'history-title' }).text(`${history.name}`)
        const description = $(DOM.span, { 'class': 'history-description' }).text(`${history.description}`)
        detailContainer.append([title, description])
        historyContainer.append([dateContainer, detailContainer])
        eventLink.append(historyContainer)
        // spacer
        const spacer = $(DOM.div, { 'class': 'spacer' })
        return {
            item: eventLink,
            spacer: spacer
        }
    }

    const populateList = (histories) => {
        // make sure history list is empty before adding
        historyList.empty()
        for (const history of histories) {
            const { item, spacer } = createHistoryItem(history)
            historyList.append([item, spacer])
        }
    }

    pastButton.on('click', (e) => {
        e.preventDefault()
        var d = new Date();
        var strDate = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
        history = [...originalHistory].filter(history => {
            const historyDate = history.fullDate
            return new Date(strDate) > new Date(historyDate)
        })

        toggle = 1
        history.sort(sorts[toggle])
        populateList(history)
    })

    upcomingButton.on('click', (e) => {
        e.preventDefault()

        var d = new Date();
        var strDate = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
        history = [...originalHistory].filter(history => {
            const historyDate = history.fullDate
            return new Date(strDate) < new Date(historyDate)
        })
        toggle = 1
        history.sort(sorts[toggle])

        populateList(history)
    })

    allButton.on('click', (e) => {
        e.preventDefault()
        history = [...originalHistory]
        toggle = 1
        history.sort(sorts[toggle])
        populateList(history)
    })

    sortButton.on('click', (e) => {
        e.preventDefault()
        sortIcon.toggleClass("fa-angle-down fa-angle-up")
        toggle *= -1
        history.sort(sorts[toggle])
        populateList(history)
    })

    populateList(history)

})(window.jQuery);