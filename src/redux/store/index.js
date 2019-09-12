import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import axiosMiddleware from 'redux-axios-middleware';
import axios from "axios";
import reducers from '../reducers';

const store = createStore(
  reducers,
  {},
  compose(
    applyMiddleware(thunk),
    applyMiddleware(axiosMiddleware(axios))
    //persist.autoRehydrate() // Store enhancer - Pulls data out and sends to different reducers
  )
);

export default store;
