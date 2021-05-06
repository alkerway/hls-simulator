import { Messages } from './messages'

class MessageState {
    private originalState = {
        [Messages.NEXT_FRAG_403]: false,
        [Messages.NEXT_FRAG_TIMEOUT]: false,
        [Messages.ALL_FRAG_403]: false,

        [Messages.NEXT_LEVEL_403]: false,
        [Messages.NEXT_LEVEL_TIMEOUT]: false,
        [Messages.ALL_LEVEL_403]: false,
        [Messages.LEVEL_STALL]: false,
    }
    public vals = Object.assign({}, this.originalState)
    public reset = () => {
        this.vals = Object.assign({}, this.originalState)
    }
}


export default new MessageState()