import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import doctorReducer from './slices/doctorSlice';
import patientReducer from './slices/patientSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    doctor: doctorReducer,
    patient: patientReducer,
  },
});

export default store;