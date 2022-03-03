const setGeneratedUrl = () => {
    let url = ''
    if (AppState.sessionId && AppState.inputUrl) {
        url = `${location.origin}/remote/level?sessionId=${AppState.sessionId}&url=${encodeURIComponent(AppState.inputUrl)}`
        if (AppState.dvrWindow > 0) {
            url = `${url}&dvrWindowSeconds=${AppState.dvrWindow}`
        }
    }
    Elements.generatedUrlDisplay.textContent = url
}


Events.sessionUpdated$.subscribe(({sessionStartTime, sessionId}) => {
    AppState.sessionId = sessionId
    Elements.sessionIdDisplay.textContent = sessionId
    setGeneratedUrl()
    
    clearInterval(AppState.sessionTimerInterval)
    AppState.sessionTimerInterval = setInterval(() => {
        const now = Date.now() / 1000
        Elements.sessionStartTimeDisplay.textContent = (now - sessionStartTime).toFixed(1)
    }, 100)
})

Events.inputUrlUpdated$.subscribe((inputUrl) => {
    AppState.inputUrl = inputUrl
    setGeneratedUrl()
})

Events.dvrWindowUpdated$.subscribe((dvrWindow) => {
    AppState.dvrWindow = dvrWindow
    setGeneratedUrl()
})


Events.messageDelivered$.subscribe((message) => {
    switch (message) {
        case 'StreamEnd':
            Elements.streamEndButton.classList.add('highlight')
            break;
        case 'LevelStall':
            Elements.levelStallButton.classList.add('highlight')
            break;
        case 'AllLevel403':
            Elements.allLevel403Button.classList.add('highlight')
            break;
        case 'AllFrag403':
            Elements.allFrag403Button.classList.add('highlight')
            break;
        case 'AllFragDelay':
            Elements.allFragDelayButton.classList.add('highlight')
            break;
        case 'Reset':
            Elements.streamEndButton.classList.remove('highlight')
            Elements.levelStallButton.classList.remove('highlight')
            Elements.allLevel403Button.classList.remove('highlight')
            Elements.allFrag403Button.classList.remove('highlight')
            Elements.allFragDelayButton.classList.remove('highlight')
            break;
        default:
            break;
    }
})
