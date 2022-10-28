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

const clickOutsideModalListener = (clickEvent) => {
  const boxLeft = Elements.modalContents.offsetLeft
  const boxTop = Elements.modalContents.offsetTop
  const boxRight = boxLeft + Elements.modalContents.offsetWidth
  const boxBottom = boxTop + Elements.modalContents.offsetHeight

  if (clickEvent.clientX < boxLeft ||
      clickEvent.clientX > boxRight ||
      clickEvent.clientY < boxTop ||
      clickEvent.clientY > boxBottom) {
    Elements.modalContainer.style.display = 'none'
    Elements.modalBody.innerHTML = ''
    Elements.modalHeader.innerHTML = ''
    document.removeEventListener('click', clickOutsideModalListener)
  }
}

Events.openLinkInModal$.subscribe(({ link, masterUrl }) => {
  Elements.modalContainer.style.display = ''
  Elements.modalHeader.innerHTML = 'Loading...'
  Elements.modalBody.innerHTML = ''
  makeRequest(link)
    .then((serverResponse) => {
      if (serverResponse && serverResponse.includes('#EXTM3U')) {
        const modalElements = serverResponse.split('\n').map(line => {
          const lineElement = document.createElement('div')
          if (line && !line.startsWith('#') && line.includes('.m3u8')) {
            lineElement.classList.add('manifestLink')
            lineElement.addEventListener('click', () => {
              const linkWithoutPath = link.split('?')[0].split('/').slice(0, -1).join('/')
              const levelUrl = `${linkWithoutPath}/${line}`
              Events.openLinkInModal$.next({link: levelUrl, masterUrl: link})
            })
            lineElement.innerText = line
            return lineElement
          } else if (line && line.startsWith('#EXT-X-MEDIA:')) {
            const lineURIMatch = line.match(/#EXT-X-MEDIA.+URI="(.*?)"/)
            if (lineURIMatch && lineURIMatch[1]) {
              const lineURI = lineURIMatch[1]
              const lineWithoutURIParts = line.split(lineURI)
              lineWithoutURIParts.forEach((part, partIdx) => {
                lineElement.append(part)
                if (partIdx < lineWithoutURIParts.length - 1) {
                  const lineURISpan = document.createElement('span')
                  lineURISpan.innerText = lineURI
                  lineURISpan.classList.add('manifestLink')
                  lineURISpan.addEventListener('click', () => {
                    const linkWithoutPath = link.split('?')[0].split('/').slice(0, -1).join('/')
                    const levelUrl = `${linkWithoutPath}/${lineURI}`
                    Events.openLinkInModal$.next({link: levelUrl, masterUrl: link})
                  })
                  lineElement.append(lineURISpan)
                }
              })
            } else {
              lineElement.innerText = line
            }
          } else {
            lineElement.innerText = line
          }
          return lineElement
        })
        return {
          modalElements,
          serverResponse
        }
      } else {
        const manifestSpan = document.createElement('span')
        manifestSpan.innerText = serverResponse
        return {
          modalElements: [manifestSpan],
          serverResponse
        }
      }
    })
    .then(({modalElements, serverResponse}) => {
      modalElements.forEach((element) => {
        Elements.modalBody.appendChild(element)
      })
      Elements.modalHeader.innerHTML = 'Response: '
      const copyLink = document.createElement('span')
      copyLink.classList.add('manifestLink')
      copyLink.style.float = 'right'
      copyLink.style.marginLeft = '10px'
      copyLink.addEventListener('click', () => {
        navigator.clipboard
          .writeText(serverResponse)
          .then(() => Events.log$.next('Copy success'))
          .catch((err) => Events.log$.next(err))
      })
      copyLink.innerText = 'Copy'
      Elements.modalHeader.appendChild(copyLink)

      const refreshLink = document.createElement('span')
      refreshLink.classList.add('manifestLink')
      refreshLink.style.float = 'right'
      refreshLink.style.marginLeft = '10px'
      refreshLink.addEventListener('click', () => {
        Events.openLinkInModal$.next({ link, masterUrl })
      })
      refreshLink.innerText = 'Refresh'
      Elements.modalHeader.appendChild(refreshLink)

      if (masterUrl) {
        const masterClickLink = document.createElement('span')
        masterClickLink.classList.add('manifestLink')
        masterClickLink.style.float = 'right'
        masterClickLink.addEventListener('click', () => {
          Events.openLinkInModal$.next({ link: masterUrl })
        })
        masterClickLink.innerText = 'Master'
        Elements.modalHeader.appendChild(masterClickLink)
      }
    })
    .catch((err) => {
      Elements.modalHeader.innerText = 'Response:'
      Elements.modalBody.innerText = err.toString()
    })
    .finally(() => {
      document.addEventListener('click', clickOutsideModalListener)
    })
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
