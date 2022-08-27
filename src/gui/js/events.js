class Event {
  listeners = []
  subscribe = (fn) => {
    this.listeners.push(fn)
  }
  unsubscribe = (fn) => {
    this.listeners = this.listeners.filter((listener) => listener !== fn)
  }
  next = (data) => {
    this.listeners.forEach((fn) => fn(data))
  }
}

const Events = {
  sessionUpdated$: new Event(),
  resetTimerInputUpdated$: new Event(),
  inputUrlUpdated$: new Event(),
  dvrWindowUpdated$: new Event(),
  keepVodUpdated$: new Event(),
  messageDelivered$: new Event(),
  log$: new Event(),
  openLinkInModal$: new Event(),
  clearLog$: new Event(),
  insertTextStartUpdated$: new Event(),
  insertTextInputUpdated$: new Event(),
}
