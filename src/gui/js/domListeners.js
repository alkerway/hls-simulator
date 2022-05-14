AppState.inputUrl = Elements.inputUrl.value
AppState.dvrWindow = Elements.dvrWindowInput.value
AppState.keepVod = Elements.keepVodInput.checked
AppState.insertTextStartTime = Elements.insertTextStartInput.value
AppState.insertTextValue = Elements.insertTextInput.value

const makeRequest = (url, returnJson = false) => {
  const myHeaders = new Headers()
  myHeaders.append('pragma', 'no-cache')
  myHeaders.append('cache-control', 'no-cache')

  const requestInit = {
    method: 'GET',
    headers: myHeaders,
  }
  return fetch(url, requestInit).then(async (res) => {
    if (res.ok) {
      Events.log$.next('Request success')
      return returnJson ? res.json() : res.text()
    }
    const errorText = await res.text()
    throw new Error(errorText)
  })
}

Elements.startSessionButton.addEventListener('click', () => {
  Events.log$.next('Sending start session request...')
  makeRequest('/startSession', true)
    .then(Events.sessionUpdated$.next)
    .catch((err) => Events.log$.next(err))
})

Elements.resetTimerButton.addEventListener('click', () => {
  Events.log$.next('Sending reset session request...')
  makeRequest(`/startSession?sessionId=${AppState.sessionId}`, true)
    .then(Events.sessionUpdated$.next)
    .catch((err) => Events.log$.next(err))
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

Elements.keepVodInput.addEventListener('change', () => {
  const isChecked = Elements.keepVodInput.checked
  Events.keepVodUpdated$.next(isChecked)
})

Elements.copyGeneratedUrlButton.addEventListener('click', () => {
  const genValue = Elements.generatedUrlDisplay.value
  navigator.clipboard
    .writeText(genValue)
    .then(() => Events.log$.next('Copy success'))
    .catch((err) => Events.log$.next(err))
})

Elements.logRemoteManifestButton.addEventListener('click', () => {
  makeRequest(Elements.generatedUrlDisplay.value)
    .then(Events.log$.next)
    .catch((err) => Events.log$.next(err))
})

Elements.clearLogsButton.addEventListener('click', () => {
  Events.clearLog$.next()
})

const deliverMessage = (message) => {
  Events.log$.next(`Sending ${message} request...`)
  makeRequest(`/deliver?sessionId=${AppState.sessionId}&msg=${message}`)
    .then(() => Events.messageDelivered$.next(message))
    .catch((err) => Events.log$.next(err))
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

Elements.insertTextStartInput.addEventListener('keyup', () => {
  const curValue = Elements.insertTextStartInput.value
  Events.insertTextStartUpdated$.next(curValue)
})

Elements.insertTextInput.addEventListener('keyup', () => {
  const curValue = Elements.insertTextInput.value
  Events.insertTextInputUpdated$.next(curValue)
})

Elements.sendInsertTextButton.addEventListener('click', () => {
  const requestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: AppState.insertTextValue,
  }
  let url = `/inject?sessionId=${AppState.sessionId}`
  if (AppState.insertTextStartTime > -1) {
    url += `&startAfter=${AppState.insertTextStartTime}`
  }
  Events.log$.next('Sending custom insert manifest request')
  return fetch(url, requestInit).then(async (res) => {
    if (res.ok) {
      Events.log$.next('Request success')
      return
    }
    const errorText = await res.text()
    Events.log$.next(errorText)
  })
})

Elements.clearInsertTextButton.addEventListener('click', () => {
  Events.log$.next('Sending clear custom manifests request')
  makeRequest(`/clearInjections?sessionId=${AppState.sessionId}`).catch((err) => Events.log$.next(err))
})
