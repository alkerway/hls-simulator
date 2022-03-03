const sessionStartTimeDisplay = document.getElementById('sessionStartTimeDisplay')
const sessionIdDisplay = document.getElementById('sessionIdDisplay')
const generatedUrlDisplay = document.getElementById('generatedUrlDisplay')

const setGeneratedUrl = () => {
    let url = ''
    if (AppState.sessionId && AppState.inputUrl) {
        url = `${location.origin}/remote/level?sessionId=${AppState.sessionId}&url=${encodeURIComponent(AppState.inputUrl)}`
        if (AppState.dvrWindow > 0) {
            url = `${url}&dvrWindow=${AppState.dvrWindow}`
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

