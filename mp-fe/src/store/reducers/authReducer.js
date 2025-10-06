// src/store/reducers/authReducer.js
import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  LOGOUT,
} from "../actions/authActions";

const initialState = { user: null, error: null };

if (typeof window !== "undefined") {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    initialState.user = JSON.parse(savedUser);
  }
}

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
    case SIGNUP_SUCCESS:
      return { ...state, user: action.payload, error: null };
    case LOGIN_FAILURE:
    case SIGNUP_FAILURE:
      return { ...state, user: null, error: action.payload };
    case LOGOUT:
      return { ...state, user: null, error: null };
    default:
      return state;
  }
}
