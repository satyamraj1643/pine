import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { loginUser, signupUser, logoutUser, verifyOTP, updateProfile } from "./authThunks";
import { validateUser } from "./validateThunk";

interface AuthState {
  userId: number | null;
  name: string | null;
  email: string | null;
  jwtToken: string | null;
  isActivated: boolean;
  isOtpVerifying: boolean,
  isOtpVerified: boolean;
  isValidated: boolean;
  isValidating: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
}

const initialState: AuthState = {
  userId: null,
  name: null,
  email: null,
  jwtToken: null,
  isActivated: false,
  isOtpVerified: false,
  isOtpVerifying: false,
  isValidated: false,
  isValidating: false,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.userId = null;
      state.email = null;
      state.name = null;
      state.jwtToken = null;
      state.isActivated = false;
      state.isValidated = false;
      state.isOtpVerified = false;
      state.isSigningUp = false;
      state.isLoggingIn = false;
      state.isLoggingOut = false;
    },
    /**
     * loginSuccess — the single convergence point for ALL auth methods.
     * Call this after: OTP verify, Google OAuth callback, any future provider.
     * Keeps login logic in one place so adding new providers is trivial.
     */
    loginSuccess: (
      state,
      action: PayloadAction<{
        user_id?: string | number;
        name: string;
        email: string;
        isOtpVerified: boolean;
        token: string | null;
      }>
    ) => {
      const { user_id, name, email, isOtpVerified, token } = action.payload;
      state.userId = user_id !== undefined ? Number(user_id) : null;
      state.name = name;
      state.email = email;
      state.jwtToken = token;
      state.isOtpVerified = isOtpVerified;
      state.isValidated = true;
      state.isActivated = isOtpVerified;
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
        state.isValidated = true;
        state.email = action.payload.email;
        state.name = action.payload.name;
        state.jwtToken = action.payload.token;
        state.isOtpVerified = action.payload.isOtpVerified;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoggingIn = false;
        state.isValidating = false;
        state.isValidated = false;
      })


      // OTP Verification — on success, reuse loginSuccess to auto-login
      .addCase(verifyOTP.pending, (state) => {
        state.isOtpVerifying = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isOtpVerifying = false;
        // If the endpoint returned 200, OTP is verified by definition — force true
        authSlice.caseReducers.loginSuccess(state, {
          type: "auth/loginSuccess",
          payload: { ...action.payload, isOtpVerified: true },
        });
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
        validateUser.fulfilled, (state, action) => {
          state.isValidating = false;
          state.isValidated = true;
          state.userId = action.payload.userId ? Number(action.payload.userId) : null;
          state.name = action.payload.name;
          state.email = action.payload.email;
          state.isActivated = action.payload.isActivated;
          state.isOtpVerified = action.payload.isActivated;
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
        authSlice.caseReducers.logout(state);
      })

      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.name = action.payload.name;
      });

  },
});



export const { logout, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
