class Event {
    listeners = []
    subscribe = (fn) => {
        this.listeners.push(fn)
    }
    unsubscribe = (fn) => {
        this.listeners = this.listeners.filter(listener => listener !== fn)
    }
    next = (data) => {
        this.listeners.forEach(fn => fn(data))
    }
}

const Events = {
    sessionUpdated$: new Event(),
    inputUrlUpdated$: new Event(),
    dvrWindowUpdated$: new Event(),
    messageDelivered$: new Event(),
    log$: new Event(),
    clearLog$: new Event()
}