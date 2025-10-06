// src/store/actions/authActions.js
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
export const SIGNUP_FAILURE = "SIGNUP_FAILURE";
export const LOGOUT = "LOGOUT";

export const loginSuccess = (user) => ({ type: LOGIN_SUCCESS, payload: user });
export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error,
});
export const signupSuccess = (user) => ({
  type: SIGNUP_SUCCESS,
  payload: user,
});
export const signupFailure = (error) => ({
  type: SIGNUP_FAILURE,
  payload: error,
});
export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
  return { type: LOGOUT };
};

export const login = (credentials) => {
  return async (dispatch) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        dispatch(loginFailure(data.message || "Login failed"));
      } else {
        dispatch(loginSuccess(data.user));
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
        }
      }
    } catch (err) {
      dispatch(loginFailure(err.message));
    }
  };
};

export const signup = (userData) => {
  return async (dispatch) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        dispatch(signupFailure(data.message || "Signup failed"));
      } else {
        dispatch(signupSuccess(data.user));
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
        }
      }
    } catch (err) {
      dispatch(signupFailure(err.message));
    }
  };
};
