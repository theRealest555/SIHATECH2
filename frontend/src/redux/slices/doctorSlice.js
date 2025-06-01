import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { API_URLS } from '../../constants/apiUrls';

// Fetch all doctors (Public)
export const fetchAllDoctors = createAsyncThunk(
  'doctor/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URLS.DOCTORS.LIST); // Corrected URL used here
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch doctors'
      });
    }
  }
);

// Fetch doctor specialities (Public)
export const fetchDoctorSpecialities = createAsyncThunk(
  'doctor/fetchSpecialities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URLS.DOCTORS.SPECIALITIES); // Corrected URL
      // Backend returns: { data: [{id, nom, description}, ...] }
      return response.data.data || []; 
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch specialities'
      });
    }
  }
);

// Fetch doctor locations (Public)
export const fetchDoctorLocations = createAsyncThunk(
  'doctor/fetchLocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URLS.DOCTORS.LOCATIONS); // Corrected URL
      // Backend returns { data: ["Location1", "Location2", ...] }
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch locations'
      });
    }
  }
);

// Search for doctors (Public)
export const searchDoctors = createAsyncThunk(
  'doctor/search',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URLS.DOCTORS.SEARCH, { params: filters }); // Corrected URL
      return response.data.data || []; // Backend response structure { data: [], meta: {}, links: {} }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to search doctors'
      });
    }
  }
);

// Fetch doctor availability (Public or Authenticated Doctor for their own)
export const fetchDoctorAvailability = createAsyncThunk(
  'doctor/fetchAvailability',
  async (doctorId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      let endpoint;
      if (auth.user?.role === 'medecin' && auth.user.doctor?.id === doctorId) {
        // Authenticated doctor fetching their own availability
        endpoint = API_URLS.DOCTOR.SCHEDULE; // Uses /api/doctor/availability (maps to AvailabilityController@getAvailability)
      } else {
        // Public fetch or patient fetching specific doctor
        endpoint = API_URLS.DOCTORS.AVAILABILITY(doctorId); // Uses /api/public/doctors/{doctorId}/availability
      }
      const response = await axios.get(endpoint);
      return response.data.data || { schedule: {}, leaves: [] };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch availability'
      });
    }
  }
);

// Fetch doctor available slots (Public or Authenticated Doctor for their own)
export const fetchDoctorSlots = createAsyncThunk(
  'doctor/fetchSlots',
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      // This is a public endpoint, anyone can check slots
      const response = await axios.get(API_URLS.DOCTORS.SLOTS(doctorId), { params: { date } }); // Corrected URL
      return { doctorId, date, slots: response.data.data || [] };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch slots'
      });
    }
  }
);

// Update doctor schedule (Authenticated Doctor)
export const updateDoctorSchedule = createAsyncThunk(
  'doctor/updateSchedule',
  async ({ schedule }, { rejectWithValue }) => { // doctorId removed, backend gets it from auth
    try {
      // Uses API_URLS.DOCTOR.SCHEDULE -> /api/doctor/schedule (AvailabilityController@updateSchedule)
      const response = await axios.put(API_URLS.DOCTOR.SCHEDULE, { schedule }); // Changed to PUT
      return response.data.data || {};
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update schedule',
        errors: error.response?.data?.errors || {}
      });
    }
  }
);

// Create doctor leave (Authenticated Doctor)
export const createDoctorLeave = createAsyncThunk(
  'doctor/createLeave',
  async ({ leaveData }, { rejectWithValue }) => { // doctorId removed, backend gets it from auth
    try {
      // Uses API_URLS.DOCTOR.LEAVES -> /api/doctor/leaves (AvailabilityController@createLeave)
      const response = await axios.post(API_URLS.DOCTOR.LEAVES, leaveData);
      return response.data.data || {};
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create leave',
        errors: error.response?.data?.errors || {}
      });
    }
  }
);

// Delete doctor leave (Authenticated Doctor)
export const deleteDoctorLeave = createAsyncThunk(
  'doctor/deleteLeave',
  async ({ leaveId }, { rejectWithValue }) => { // doctorId removed, backend gets it from auth after checking ownership
    try {
      // Uses API_URLS.DOCTOR.LEAVE(leaveId) -> /api/doctor/leaves/{leaveId} (AvailabilityController@deleteLeave)
      await axios.delete(API_URLS.DOCTOR.LEAVE(leaveId));
      return { leaveId };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete leave'
      });
    }
  }
);

// Upload doctor document (Authenticated Doctor)
export const uploadDoctorDocument = createAsyncThunk(
  'doctor/uploadDocument',
  async ({ file, type }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await axios.post(API_URLS.DOCTOR.DOCUMENTS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.document || {};
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to upload document',
        errors: error.response?.data?.errors || {}
      });
    }
  }
);

// Fetch doctor documents (Authenticated Doctor)
export const fetchDoctorDocuments = createAsyncThunk(
  'doctor/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URLS.DOCTOR.DOCUMENTS);
      return response.data.documents || [];
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch documents'
      });
    }
  }
);

// Complete doctor profile (after social registration - Authenticated Doctor)
export const completeDoctorProfile = createAsyncThunk(
  'doctor/completeProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URLS.DOCTOR.COMPLETE_PROFILE, profileData);
      return response.data; // Contains { message, user (with updated doctor info) }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to complete profile',
        errors: error.response?.data?.errors || {}
      });
    }
  }
);

const initialState = {
  doctors: [], // For list of all doctors (public)
  specialities: [], // Array of {id, nom, description}
  locations: [], // Array of strings
  searchResults: [], // For search results (public)
  availability: { schedule: {}, leaves: [] }, // For a specific doctor (public or self)
  slots: {}, // For a specific doctor and date { doctorId: { date: [slots] } } (public or self)
  documents: [], // For authenticated doctor's documents
  status: 'idle', 
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    clearDoctorData: (state) => {
      // Reset parts of the state as needed, e.g., on logout or page change
      state.doctors = [];
      state.searchResults = [];
      state.availability = { schedule: {}, leaves: [] };
      state.slots = {};
      // Keep specialities and locations as they are general data
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all doctors
      .addCase(fetchAllDoctors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.doctors = action.payload;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Fetch specialities
      .addCase(fetchDoctorSpecialities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDoctorSpecialities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.specialities = action.payload; // Expecting array of {id, nom, ...}
      })
      .addCase(fetchDoctorSpecialities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Fetch locations
      .addCase(fetchDoctorLocations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDoctorLocations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.locations = action.payload; // Expecting array of strings
      })
      .addCase(fetchDoctorLocations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Search doctors
      .addCase(searchDoctors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchDoctors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchDoctors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Fetch availability
      .addCase(fetchDoctorAvailability.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDoctorAvailability.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.availability = action.payload;
      })
      .addCase(fetchDoctorAvailability.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Fetch slots
      .addCase(fetchDoctorSlots.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDoctorSlots.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (!state.slots[action.payload.doctorId]) {
          state.slots[action.payload.doctorId] = {};
        }
        state.slots[action.payload.doctorId][action.payload.date] = action.payload.slots;
      })
      .addCase(fetchDoctorSlots.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Update schedule
      .addCase(updateDoctorSchedule.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateDoctorSchedule.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.availability.schedule = action.payload;
      })
      .addCase(updateDoctorSchedule.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Create leave
      .addCase(createDoctorLeave.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createDoctorLeave.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.availability.leaves) {
            state.availability.leaves.push(action.payload);
        } else {
            state.availability.leaves = [action.payload];
        }
      })
      .addCase(createDoctorLeave.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Delete leave
      .addCase(deleteDoctorLeave.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteDoctorLeave.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.availability.leaves = state.availability.leaves.filter(
          leave => leave.id !== action.payload.leaveId
        );
      })
      .addCase(deleteDoctorLeave.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Upload document
      .addCase(uploadDoctorDocument.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(uploadDoctorDocument.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents.push(action.payload);
      })
      .addCase(uploadDoctorDocument.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Fetch documents
      .addCase(fetchDoctorDocuments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDoctorDocuments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents = action.payload;
      })
      .addCase(fetchDoctorDocuments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      
      // Complete profile
      .addCase(completeDoctorProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(completeDoctorProfile.fulfilled, (state) => { // action.payload contains {message, user (with updated doctor)}
        state.status = 'succeeded';
        // The userSlice should ideally handle updating the main user profile
        // For now, we can assume it's handled or user will re-fetch profile.
      })
      .addCase(completeDoctorProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      });
  },
});

// Actions
export const { clearDoctorData } = doctorSlice.actions;

// Selectors
export const selectAllDoctors = (state) => state.doctor.doctors;
export const selectDoctorSpecialities = (state) => state.doctor.specialities;
export const selectDoctorLocations = (state) => state.doctor.locations;
export const selectDoctorSearchResults = (state) => state.doctor.searchResults;
export const selectDoctorAvailability = (state) => state.doctor.availability;
export const selectDoctorSlots = (state) => state.doctor.slots;
export const selectDoctorDocuments = (state) => state.doctor.documents;
export const selectDoctorStatus = (state) => state.doctor.status;
export const selectDoctorError = (state) => state.doctor.error;

export default doctorSlice.reducer;