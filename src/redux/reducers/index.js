import { combineReducers } from "redux";
import feed from "./feedReducer";
////////////////////////////////////////////////////////////////////////
// Combines reducers and assigns reducer names
export default combineReducers({
  feed,
});
