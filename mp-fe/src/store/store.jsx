// src/store/store.jsx
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import ENV from "../config/environment";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: !ENV.IS_PRODUCTION,
});

export default store;
