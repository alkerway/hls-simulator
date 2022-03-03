const sessionStartTimeDisplay = document.getElementById('sessionStartTimeDisplay')
const sessionIdDisplay = document.getElementById('sessionIdDisplay')
const generatedUrlDisplay = document.getElementById('generatedUrlDisplay')

const streamEndButton = document.getElementById('StreamEndButton')
const levelStallButton = document.getElementById('LevelStallButton')
const allFrag403Button = document.getElementById('AllFrag403Button')
const allLevel403Button = document.getElementById('AllLevel403Button')
const allFragDelayButton = document.getElementById('AllFragDelayButton')


const setGeneratedUrl = () => {
    let url = ''
    if (AppState.sessionId && AppState.inputUrl) {
        url = `${location.origin}/remote/level?sessionId=${AppState.sessionId}&url=${encodeURIComponent(AppState.inputUrl)}`
        if (AppState.dvrWindow > 0) {
            url = `${url}&dvrWindowSeconds=${AppState.dvrWindow}`
        }
    }
    generatedUrlDisplay.textContent = url
}


Events.sessionUpdated$.subscribe(({sessionStartTime, sessionId}) => {
    AppState.sessionId = sessionId
    sessionIdDisplay.textContent = sessionId
    setGeneratedUrl()
    
    clearInterval(AppState.sessionTimerInterval)
    AppState.sessionTimerInterval = setInterval(() => {
        const now = Date.now() / 1000
        sessionStartTimeDisplay.textContent = (now - sessionStartTime).toFixed(1)
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
            streamEndButton.classList.add('highlight')
            break;
        case 'LevelStall':
            levelStallButton.classList.add('highlight')
            break;
        case 'AllLevel403':
            allLevel403Button.classList.add('highlight')
            break;
        case 'AllFrag403':
            allFrag403Button.classList.add('highlight')
            break;
        case 'AllFragDelay':
            allFragDelayButton.classList.add('highlight')
            break;
        case 'Reset':
            streamEndButton.classList.remove('highlight')
            levelStallButton.classList.remove('highlight')
            allLevel403Button.classList.remove('highlight')
            allFrag403Button.classList.remove('highlight')
            allFragDelayButton.classList.remove('highlight')
            break;
        default:
            break;
    }
})
