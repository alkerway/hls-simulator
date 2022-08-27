AppState.resetAtInputValue = Elements.resetTimerInput.value
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
  makeRequest(`/startSession?offset=${Math.max(0, AppState.resetAtInputValue)}`, true)
    .then(Events.sessionUpdated$.next)
    .catch((err) => Events.log$.next(err))
})

Elements.resetTimerButton.addEventListener('click', () => {
  Events.log$.next('Sending reset session request...')
  makeRequest(`/startSession?sessionId=${AppState.sessionId}&offset=${Math.max(0, AppState.resetAtInputValue)}`, true)
    .then(Events.sessionUpdated$.next)
    .catch((err) => Events.log$.next(err))
})

Elements.resetTimerInput.addEventListener('keyup', () => {
  const curValue = Elements.resetTimerInput.value
  Events.resetTimerInputUpdated$.next(curValue)
})

Elements.resetTimerInput.addEventListener('mouseup', () => {
  const curValue = Elements.resetTimerInput.value
  Events.resetTimerInputUpdated$.next(curValue)
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
  if (Elements.generatedUrlDisplay.value) {
    Events.openLinkInModal$.next({ link: Elements.generatedUrlDisplay.value })
  } else {
    Events.log$.next('No url to request')
  }
})

Elements.clearLogsButton.addEventListener('click', () => {
  Events.clearLog$.next()
})

const deliverMessage = (message, query) => {
  Events.log$.next(`Sending ${message} request...`)
  let requestUrl = `/deliver?sessionId=${AppState.sessionId}&msg=${message}`
  if (query && Object.keys(query).length) {
    requestUrl = Object.keys(query).reduce((fullUrl, key) => `${fullUrl}&${key}=${query[key]}`, requestUrl)
  }
  makeRequest(requestUrl, true)
    .then((messageState) => {
      Events.messageDelivered$.next({ message, messageState })
    })
    .catch((err) => Events.log$.next(err))
}

Elements.networkFaultButton.addEventListener('click', () => {
  const applyTo = document.querySelector('input[name="NetworkFaultApplyToRadio"]:checked').value
  const once = document.querySelector('input[name="NetworkFaultOnceRadio"]:checked').value === 'once'
  const incidentDropdown = document.getElementById('NetworkFaultIncidentDropdown')
  const fault = incidentDropdown.options[incidentDropdown.selectedIndex].text
  deliverMessage('NetworkFault', { fault, applyTo, once })
})
Elements.serverResponseButton.addEventListener('click', () => {
  const applyTo = document.querySelector('input[name="ServerResponseApplyToRadio"]:checked').value
  const once = document.querySelector('input[name="ServerResponseApplyOnceRadio"]:checked').value === 'once'
  const statusDropdown = document.getElementById('ServerResponseStatusDropdown')
  const status = statusDropdown.options[statusDropdown.selectedIndex].text
  deliverMessage('ServerResponse', { status, applyTo, once })
})
Elements.failOneLevelButton.addEventListener('click', () => deliverMessage('FailOneLevel'))
Elements.failFragsAtOneLevelButton.addEventListener('click', () => deliverMessage('FailFragsAtOneLevel'))
Elements.stallAllLevelButton.addEventListener('click', () => deliverMessage('AllLevelStall'))
Elements.stallOneLevelButton.addEventListener('click', () => deliverMessage('OneLevelStall'))
Elements.streamEndButton.addEventListener('click', () => deliverMessage('StreamEnd'))
Elements.diyButton.addEventListener('click', () => deliverMessage('DIY'))
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
