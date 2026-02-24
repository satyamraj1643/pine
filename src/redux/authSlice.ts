import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { loginUser, signupUser, logoutUser, verifyOTP, updateProfile } from "./authThunks";
import { validateUser } from "./validateThunk";

interface AuthState {
  userId: number | null;
  name: string | null;
  email: string | null;
  jwtToken : string | null;
  isActivated: boolean;
  isOtpVerifying: boolean,
  isOtpVerified: boolean;
  isValidated : boolean;
  isValidating : boolean;
  isLoggedIn : boolean,
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isSuperUser : boolean;
  isStaff : boolean;
}

const initialState: AuthState = {
  userId: null,
  name: null,
  email: null,
  jwtToken: null,
  isActivated: false,
  isOtpVerified: false,
  isLoggedIn : false,
  isOtpVerifying: false,
  isValidated: false,
  isValidating : false,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isSuperUser : false,
  isStaff : false,

};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.userId = null;
      state.email = null;
      state.name = null;
      state.isActivated = false;
      state.isValidated = false;
      state.isSigningUp = false;
      state.isLoggingIn = false;
      state.isLoggingOut = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(
        signupUser.fulfilled,
        (state, action: PayloadAction<{ user_id?: number; id?: number; email: string; name: string }>) => {
          state.isSigningUp = false;
          state.isActivated = false;
          state.email = action.payload.email;
          state.name = action.payload.name;
          const uid = action.payload.user_id ?? action.payload.id;
          state.userId = uid ?? null;
        })
      .addCase(signupUser.rejected, (state) => {
        state.isSigningUp = false;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.isLoggedIn = true;
        state.email = action.payload.email;
        state.name = action.payload.name;
        state.jwtToken = action.payload.token;
        state.isOtpVerified = action.payload.isOtpVerified;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoggingIn = false;
        state.isValidating =false;
        state.isValidated = false;
      })


      // OTP Verification
      .addCase(verifyOTP.pending, (state) => {
        state.isOtpVerifying = true;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isOtpVerifying = false;
        state.isOtpVerified = true;   
      })
      .addCase(verifyOTP.rejected, (state) => {
        state.isOtpVerifying = false;
        state.isOtpVerified = false;
      })


      // Validate
      .addCase(validateUser.pending, (state) => {
        state.isValidating = true;
      })
      .addCase(
        validateUser.fulfilled, (state, action) =>
         {
          state.isValidating = false;
          state.isValidated = true;
          state.userId = action.payload.userId ? Number(action.payload.userId) : null;
          state.name = action.payload.name;
          state.email = action.payload.email;
          state.isActivated = action.payload.isActivated;
          state.isOtpVerified = action.payload.isActivated;
          state.isSuperUser = action.payload.isSuperUser;
          state.isStaff = action.payload.isStaff
        }
      )
      .addCase(validateUser.rejected, (state) => {
        state.isValidating = false;
        state.isValidated = false;
      })

      // Logout (async)
      .addCase(logoutUser.pending, (state) => {
        state.isLoggingOut = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        authSlice.caseReducers.logout(state);
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoggingOut = false;
      })

      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.name = action.payload.name;
      });

  },
});



export const { logout } = authSlice.actions;
export default authSlice.reducer;
