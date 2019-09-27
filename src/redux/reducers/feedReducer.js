import {FEED
} from '../actions/types';

const INITIAL_STATE = {rss:[], tweets: [],
                        loading: true
                        };

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FEED:
            // console.log(action.payload)÷
            return {...state, rss: action.payload.rss, tweets: action.payload.tweets, loading:action.payload.loading  };
        default:
            return state;
    }
};
