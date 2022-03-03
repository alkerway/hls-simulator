AppState.inputUrl = Elements.inputUrl.value
AppState.dvrWindow = Elements.dvrWindowInput.value

const makeRequest = (url, returnJson=false) => {
    const myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');

    const requestInit = {
        method: 'GET',
        headers: myHeaders,
    };
    return fetch(url, requestInit)
        .then(async (res) =>  {
            if (res.ok) {
                return returnJson ? res.json() : res.text()
            }
            const errorText = await res.text()
            throw new Error(errorText)
        })
}

Elements.startSessionButton.addEventListener('click', () => {
    makeRequest('/startSession', true)
        .then(Events.sessionUpdated$.next)
        .catch(console.warn)
})

Elements.resetTimerButton.addEventListener('click', () => {
    makeRequest(`/startSession?sessionId=${AppState.sessionId}`, true)
        .then(Events.sessionUpdated$.next)
        .catch(console.warn)
})

Elements.inputUrl.addEventListener('keyup', () => {
    const curValue = Elements.inputUrl.value
    Events.inputUrlUpdated$.next(curValue)
})

Elements.dvrWindowInput.addEventListener('keyup', () => {
    const curValue = Elements.dvrWindowInput.value
    Events.dvrWindowUpdated$.next(curValue)
})

Elements.dvrWindowInput.addEventListener('mouseup', () => {
    const curValue = Elements.dvrWindowInput.value
    Events.dvrWindowUpdated$.next(curValue)
})

Elements.copyGeneratedUrlButton.addEventListener('click', () => {
    const genValue = Elements.generatedUrlDisplay.value
    navigator.clipboard.writeText(genValue)
})

const deliverMessage = (message) => {
    makeRequest(`/deliver?sessionId=${AppState.sessionId}&msg=${message}`)
        .then(() => Events.messageDelivered$.next(message))
        .catch(console.warn)
}

Elements.nextFrag403Button.addEventListener('click', () => deliverMessage('NextFrag403'))
Elements.nextLevel403Button.addEventListener('click', () => deliverMessage('NextLevel403'))
Elements.nextLevelTimeoutButton.addEventListener('click', () => deliverMessage('NextLevelTimeout'))
Elements.nextFragTimeoutButton.addEventListener('click', () => deliverMessage('NextFragTimeout'))
Elements.allFrag403Button.addEventListener('click', () => deliverMessage('AllFrag403'))
Elements.allLevel403Button.addEventListener('click', () => deliverMessage('AllLevel403'))
Elements.allFragDelayButton.addEventListener('click', () => deliverMessage('AllFragDelay'))
Elements.levelStallButton.addEventListener('click', () => deliverMessage('LevelStall'))
Elements.streamEndButton.addEventListener('click', () => deliverMessage('StreamEnd'))
Elements.resetButton.addEventListener('click', () => deliverMessage('Reset'))
