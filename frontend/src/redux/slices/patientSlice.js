import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { API_URLS } from '../../constants/apiUrls';

/**
 * Fetch appointments for a patient or doctor
 * Matches backend route: GET /api/appointments
 */
export const fetchPatientAppointments = createAsyncThunk(
  'patient/fetchAppointments',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userRole = auth.user?.role;
      
      const params = {};
      // Backend's /api/appointments filters based on authenticated user's role and ID,
      // or by doctor_id/patient_id if provided by an admin.
      // For a patient fetching their own, or a doctor fetching theirs, no explicit ID param might be needed
      // if the backend derives it from auth.
      // However, if the 'id' param is meant to be doctor_id or patient_id for filtering (e.g. by admin or for public views)
      // then it should be used. The current App.jsx logic seems to pass user.id.
      if (userRole === 'patient') {
        // The general /api/appointments endpoint in backend should filter by authenticated patient user
      } else if (userRole === 'medecin') {
        // The general /api/appointments endpoint in backend should filter by authenticated doctor user
      } else if (userRole === 'admin' && id) { // Admin might pass an ID to filter
        // Depending on how admin views appointments, you might add params.patient_id or params.doctor_id
        // For simplicity, assuming the backend /api/appointments handles role-based filtering automatically for patient/doctor
      }
      
      const response = await axios.get(API_URLS.APPOINTMENTS.LIST, { params });
      
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch appointments'
      });
    }
  }
);

/**
 * Book a new appointment
 * Matches backend route: POST /api/patient/doctors/{doctorId}/appointments
 */
export const bookAppointment = createAsyncThunk(
  'patient/bookAppointment',
  async ({ doctorId, date_heure }, { getState, rejectWithValue }) => { // Removed patientId from params
    try {
      const { auth } = getState();
      // Ensure user is authenticated and is a patient
      if (!auth.user || auth.user.role !== 'patient') {
        return rejectWithValue({ message: 'Only authenticated patients can book appointments.' });
      }
      
      // Backend AppointmentController::bookAppointment expects doctorId in URL and date_heure in body.
      // It derives patient_id from the authenticated user.
      const response = await axios.post(
        API_URLS.APPOINTMENTS.BOOK(doctorId), // Uses the corrected function: /api/patient/doctors/{doctorId}/appointments
        { date_heure } // Payload only contains date_heure
      );
      
      return response.data.data || {};
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to book appointment',
        errors: error.response?.data?.errors || {}
      });
    }
  }
);

/**
 * Update an appointment's status
 * Matches backend route: PATCH /api/appointments/{id}/status
 */
export const updateAppointmentStatus = createAsyncThunk(
  'patient/updateAppointmentStatus',
  async ({ appointmentId, status }, { rejectWithValue }) => {
    try {
      // Backend expects 'statut'
      const response = await axios.patch(
        API_URLS.PATIENT.UPDATE_APPOINTMENT_STATUS(appointmentId), // Use patient-specific URL 
        { statut: status } // Ensure payload key is 'statut'
      );
      
      return response.data.data || {};
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update appointment status',
        errors: error.response?.data?.errors || {}
      });
    }
  }
);

const initialState = {
  appointments: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    clearPatientData: (state) => {
      state.appointments = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchPatientAppointments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(fetchPatientAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch appointments';
      })
      
      // Book appointment
      .addCase(bookAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Optionally, add the new appointment to the list or refetch
        state.appointments.push(action.payload); // Assuming payload is the new appointment
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to book appointment';
      })
      
      // Update appointment status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.appointments.findIndex(
          appointment => appointment.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to update appointment status';
      });
  },
});

// Actions
export const { clearPatientData } = patientSlice.actions;

// Selectors
export const selectPatientAppointments = (state) => state.patient.appointments;
export const selectPatientStatus = (state) => state.patient.status;
export const selectPatientError = (state) => state.patient.error;

export default patientSlice.reducer;