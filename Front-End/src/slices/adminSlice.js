import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// make HTTP POST request to login admin
export const adminLogin = createAsyncThunk('loginadmin', async (adminCredentialsObject, thunkApi) => {
  try {
    const response = await axios.post('/admin-api/login', adminCredentialsObject);
    const data = response.data;

    if (data.message === 'success') {
      // store token in local storage
      localStorage.setItem('adminToken', data.payload);
      return data.adminObj;
    }

    if (data.message === 'Invalid admin' || data.message === 'Invalid password') {
      return thunkApi.rejectWithValue(data);
    }
  } catch (error) {
    // handle other errors if needed
    return thunkApi.rejectWithValue({ message: 'An error occurred' });
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    adminObj: {},
    isError: false,
    isSuccess: false,
    isLoading: false,
    errMsg: '',
  },
  reducers: {
    adminClearLoginStatus: (state) => {
      state.isSuccess = false;
      state.adminObj = null;
      state.isError = false;
      state.errMsg = '';
    },
  },
  extraReducers: (builder) => {
    // track life cycle of promise returned by createAsyncThunk function
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.adminObj = action.payload;
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.errMsg = '';
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        state.errMsg = action.payload.message;
      });
  },
});

// export action creators
export const { adminClearLoginStatus } = adminSlice.actions;
// export reducer
export default adminSlice.reducer;
