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

Events.messageDelivered$.subscribe((message) => {
  switch (message) {
    case 'StreamEnd':
      Elements.streamEndButton.classList.add('highlight')
      break
    case 'LevelStall':
      Elements.levelStallButton.classList.add('highlight')
      break
    case 'AllLevel403':
      Elements.allLevel403Button.classList.add('highlight')
      break
    case 'AllFrag403':
      Elements.allFrag403Button.classList.add('highlight')
      break
    case 'AllFragDelay':
      Elements.allFragDelayButton.classList.add('highlight')
      break
    case 'Reset':
      Elements.streamEndButton.classList.remove('highlight')
      Elements.levelStallButton.classList.remove('highlight')
      Elements.allLevel403Button.classList.remove('highlight')
      Elements.allFrag403Button.classList.remove('highlight')
      Elements.allFragDelayButton.classList.remove('highlight')
      break
    default:
      break
  }
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
