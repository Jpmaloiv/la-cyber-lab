import {
  FEED
} from './types';
import * as rssParser from 'react-native-rss-parser';
// import {SecureStore} from"expo";
import axios from 'axios'
import constants from '../../../constants'




export const rss = () => async dispatch => {

  try {

    let res = await fetch('https://www.us-cert.gov/ncas/all.xml')


    let text = await res.text()

    const data = await rssParser.parse(text)

    let rss = data.items.slice(0, 8)

    let twitter, usCert, nortonOnline, staySafeOnline;

    try {
      twitter = await axios.get(`${constants.BASE_URL}/twitter/rss/lacl`)
      usCert = await axios.get(`${constants.BASE_URL}/twitter/rss/uscert`)
      nortonOnline = await axios.get(`${constants.BASE_URL}/twitter/rss/nortononline`)
      staySafeOnline = await axios.get(`${constants.BASE_URL}/twitter/rss/staysafeonline`)
    }
    catch (err) { console.log('Error fetching tweets', err) }

    let t = await rssParser.parse(twitter.data.twitterFeed)
    let uC = await rssParser.parse(usCert.data.twitterFeed)
    let nO = await rssParser.parse(nortonOnline.data.twitterFeed)
    let sSO = await rssParser.parse(staySafeOnline.data.twitterFeed)

    const rssMapped = rss.map(function (el) {
      var o = Object.assign({}, el);
      o.isTwitter = false;
      let str = o.description.split(constants.CURRENT_YEAR)[1]
      o.description = str
      return o;
    })

    const tMapped = t.items.map(function (el) {
      var o = Object.assign({}, el);
      o.isTwitter = true;
      o.handle = '@LACyberLab1'
      return o;
    })

    const uCMapped = uC.items.map(function (el) {
      var o = Object.assign({}, el);
      o.isTwitter = true;
      o.handle = '@USCERT_gov'
      return o;
    })

    const nOMapped = nO.items.map(function (el) {
      var o = Object.assign({}, el);
      o.isTwitter = true;
      o.handle = '@NortonOnline'
      return o;
    })

    const sSOMapped = sSO.items.map(function (el) {
      var o = Object.assign({}, el);
      o.isTwitter = true;
      o.handle = '@StaySafeOnline'
      return o;
    })

    let arr = rssMapped.concat(tMapped, uCMapped, nOMapped, sSOMapped)

    // arr.map(el => console.log("BEFORE", el.published))

    arr.sort(function (a, b) {
      var dateA = new Date(a.published);
      var dateB = new Date(b.published);
      return dateB - dateA;
    })

    let filteredArr = arr.slice(0, 15)

    // arr.map(el => console.log("AFTER", el.published))

    dispatch({
      type: FEED,
      payload: {
        // rss: data.items,
        tweets: filteredArr,
        loading: false
      }
    })
  }
  catch (err) {
    console.log("Error:", err)
  }
}
