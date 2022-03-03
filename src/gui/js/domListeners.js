const startSessionButton = document.getElementById('startSessionButton')
const resetTimerButton = document.getElementById('resetTimerButton')
const inputUrl = document.getElementById('inputUrl')
const dvrWindowInput = document.getElementById('rollingDvrInput')
const generatedUrlDisplay = document.getElementById('generatedUrlDisplay')
const copyGeneratedUrlButton = document.getElementById('copyGeneratedUrlButton')

AppState.inputUrl = inputUrl.value
AppState.dvrWindow = dvrWindowInput.value

startSessionButton.addEventListener('click', () => {
    fetch('/startSession')
        .then(res => res.json())
        .then(Events.sessionUpdated$.next)
        .catch(console.warn)
})

resetTimerButton.addEventListener('click', () => {
    fetch(`/startSession?sessionId=${AppState.sessionId}`)
        .then(res => res.json())
        .then(Events.sessionUpdated$.next)
        .catch(console.warn)
})

inputUrl.addEventListener('keyup', () => {
    const curValue = inputUrl.value
    Events.inputUrlUpdated$.next(curValue)
})

dvrWindowInput.addEventListener('keyup', () => {
    const curValue = dvrWindowInput.value
    Events.dvrWindowUpdated$.next(curValue)
})

dvrWindowInput.addEventListener('mouseup', () => {
    const curValue = dvrWindowInput.value
    Events.dvrWindowUpdated$.next(curValue)
})

copyGeneratedUrlButton.addEventListener('click', () => {
    const genValue = generatedUrlDisplay.value
    navigator.clipboard.writeText(genValue)
})


