const startSessionButton = document.getElementById('startSessionButton')
const resetTimerButton = document.getElementById('resetTimerButton')
const inputUrl = document.getElementById('inputUrl')
const dvrWindowInput = document.getElementById('rollingDvrInput')
const generatedUrlDisplay = document.getElementById('generatedUrlDisplay')
const copyGeneratedUrlButton = document.getElementById('copyGeneratedUrlButton')

const nextFrag403Button = document.getElementById('NextFrag403Button')
const nextLevel403Button = document.getElementById('NextLevel403Button')
const nextLevelTimeoutButton = document.getElementById('NextLevelTimeoutButton')
const nextFragTimeoutButton = document.getElementById('NextFragTimeoutButton')
const allFrag403Button = document.getElementById('AllFrag403Button')
const allLevel403Button = document.getElementById('AllLevel403Button')
const streamEndButton = document.getElementById('StreamEndButton')
const resetButton = document.getElementById('ResetButton')

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

const deliverMessage = (message) => {
    fetch(`/deliver?sessionId=${AppState.sessionId}&msg=${message}`)
        .then(res => res.text())
        .catch(console.warn)
}

nextFrag403Button.addEventListener('click', () => deliverMessage('NextFrag403'))
nextLevel403Button.addEventListener('click', () => deliverMessage('NextLevel403'))
nextLevelTimeoutButton.addEventListener('click', () => deliverMessage('NextLevelTimeout'))
nextFragTimeoutButton.addEventListener('click', () => deliverMessage('NextFragTimeout'))
allFrag403Button.addEventListener('click', () => deliverMessage('AllFrag403'))
allLevel403Button.addEventListener('click', () => deliverMessage('AllLevel403'))
streamEndButton.addEventListener('click', () => deliverMessage('StreamEnd'))
resetButton.addEventListener('click', () => deliverMessage('Reset'))
