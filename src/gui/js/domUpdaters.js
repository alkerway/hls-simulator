const setGeneratedUrl = () => {
  let url = ''
  if (AppState.sessionId && AppState.inputUrl) {
    url = `${location.origin}/remote/hls?sessionId=${AppState.sessionId}`
    if (AppState.dvrWindow > 0) {
      url = `${url}&dvrWindowSeconds=${AppState.dvrWindow}`
    }
    if (AppState.keepVod) {
      url = `${url}&keepVod=true`
    }
    url = `${url}&url=${encodeURIComponent(AppState.inputUrl)}`
  }
  Elements.generatedUrlDisplay.textContent = url
}

const setHighlight = (element, shouldHighlight) => {
  if (shouldHighlight) {
    element.classList.add('highlight')
  } else {
    element.classList.remove('highlight')
  }
}

Events.sessionUpdated$.subscribe(({ sessionStartTime, sessionId }) => {
  AppState.sessionId = sessionId
  Elements.sessionIdDisplay.textContent = sessionId
  setGeneratedUrl()

  clearInterval(AppState.sessionTimerInterval)
  AppState.sessionTimerInterval = setInterval(() => {
    const now = Date.now() / 1000
    Elements.sessionStartTimeDisplay.textContent = (now - sessionStartTime).toFixed(1)
  }, 100)
})

Events.resetTimerInputUpdated$.subscribe((offset) => {
  AppState.resetAtInputValue = offset
})

Events.inputUrlUpdated$.subscribe((inputUrl) => {
  AppState.inputUrl = inputUrl
  setGeneratedUrl()
})

Events.dvrWindowUpdated$.subscribe((dvrWindow) => {
  AppState.dvrWindow = dvrWindow
  setGeneratedUrl()
})

Events.keepVodUpdated$.subscribe((isChecked) => {
  AppState.keepVod = isChecked
  setGeneratedUrl()
})

Events.log$.subscribe((text) => {
  const wasScrolledToLast =
    Elements.logsWindow.scrollHeight - Elements.logsWindow.clientHeight === Elements.logsWindow.scrollTop
  const logNode = document.createElement('div')
  logNode.textContent = text
  Elements.logsWindow.appendChild(logNode)
  if (wasScrolledToLast) {
    Elements.logsWindow.scrollTop = Elements.logsWindow.scrollHeight
  }
})

Events.clearLog$.subscribe(() => {
  Elements.logsWindow.innerHTML = ''
})

Events.messageDelivered$.subscribe(({ message, messageState }) => {
  setHighlight(Elements.networkFaultButton, messageState.NetworkFault.active && !messageState.NetworkFault.once)
  setHighlight(Elements.serverResponseButton, messageState.ServerResponse.active && !messageState.ServerResponse.once)

  setHighlight(Elements.failOneLevelButton, messageState.FailOneLevel.active)
  setHighlight(Elements.failFragsAtOneLevelButton, messageState.FailFragsAtOneLevel.active)
  setHighlight(Elements.stallAllLevelButton, messageState.AllLevelStall.active)
  setHighlight(Elements.stallOneLevelButton, messageState.OneLevelStall.active)
  setHighlight(Elements.streamEndButton, messageState.StreamEnd.active)
})

Events.insertTextStartUpdated$.subscribe((value) => {
  AppState.insertTextStartTime = value
})

Events.insertTextInputUpdated$.subscribe((value) => {
  AppState.insertTextValue = value
})

Elements.insertTextInput.placeholder = `
Paste ad text here, e.g.

#EXTM3U
#EXT-X-VERSION:3
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.8800,
https://maitv-vod.lab.eyevinn.technology/VINN.mp4/2000/2000-00000.ts
#EXTINF:7.2000,
https://maitv-vod.lab.eyevinn.technology/VINN.mp4/2000/2000-00001.ts
#EXTINF:7.2000,
https://maitv-vod.lab.eyevinn.technology/VINN.mp4/2000/2000-00002.ts
#EXT-X-ENDLIST

`
