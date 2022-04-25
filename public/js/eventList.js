(function ($) {
    let eventList = $('#eventList'),
        sortButton = $('#sort-button')

    let events = []

    


    $.get('/events/list', (data) => {
        events = [...events, data]
        
    })

    


})(window.jQuery);
