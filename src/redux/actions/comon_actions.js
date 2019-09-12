import {
 FEED
} from './types';
import * as rssParser from 'react-native-rss-parser';
// import {SecureStore} from"expo";




export const rss = () =>async dispatch=>{
  
   try {
   
  const res = await fetch('https://www.us-cert.gov/ncas/all.xml')
    const text = await res.text()
    const data = await rssParser.parse(text)
   
        // console.log(data.items)
        dispatch({ 
          type:FEED,
          payload:{rss: data.items, loading: false} })
   }
   catch (err) {

   }
 }
