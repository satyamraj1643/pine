import { createAsyncThunk } from "@reduxjs/toolkit";
import { ErrorResponse, SignupPayload } from "../types";
import { GENERAL_BACKEND_BASE_URL } from "../constants";

// --------- Thunks ---------

// Update profile name
export const updateProfile = createAsyncThunk<
  { name: string },
  { name: string },
  { rejectValue: { detail: string } }
>(
  "auth/updateProfile",
  async ({ name }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/auth/update-profile`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue({ detail: data.detail || "Failed to update profile" });
      return { name: data.name };
    } catch {
      return rejectWithValue({ detail: "Network Error" });
    }
  }
);

// Signup
export const signupUser = createAsyncThunk<
  { user_id?: number; email: string; name: string, isVerified: boolean },
  SignupPayload,
  { rejectValue: ErrorResponse }
>(
  "auth/signupUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) return rejectWithValue(data);

      return {
        user_id: data.user_id ?? data.id ?? undefined,
        email: data.email,
        name: data.name,
        isVerified: data.isVerified,
      };
    } catch {
      return rejectWithValue({ detail: "Network Error" });
    }
  }
);

export const verifyOTP = createAsyncThunk<
  {
    user_id?: string | number;
    name: string;
    email: string;
    isOtpVerified: boolean;
    token: string | null;
  },
  { email: string; otp: string },
  { rejectValue: { detail?: string } }
>(
  "auth/verifyOtp",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data);

      // Store token so the app is immediately authenticated
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      return {
        user_id: data.user_id ?? data.id ?? undefined,
        name: data.name ?? "",
        email: data.email ?? formData.email,
        isOtpVerified: Boolean(data.isOtpVerified),
        token: data.token ?? null,
      };
    } catch {
      return rejectWithValue({ detail: "Network Error" });
    }
  }
);


// Login
export const loginUser = createAsyncThunk<
  {
    user_id?: string | number;
    name: string;
    email: string;
    isOtpVerified: boolean;
    token: string | null;
  },
  {
    email: string;
    password: string;
  },
  { rejectValue: { detail: string } }
>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      localStorage.setItem("auth_token", data.token);

      return {
        user_id: data.user_id ?? data.id ?? undefined,
        name: data.name ?? "",
        email: data.email ?? email,
        isOtpVerified: Boolean(data.isOtpVerified),
        token: data.token ?? null,
      };
    } catch {
      return rejectWithValue({ detail: "Network Error" });
    }
  }
);



export const logoutUser = createAsyncThunk<void, void, { rejectValue: ErrorResponse }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");

      // Clear token from localStorage immediately
      localStorage.removeItem("auth_token");

      // Attempt to notify backend, but treat the logout as successful regardless
      await fetch(`${GENERAL_BACKEND_BASE_URL}/auth/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({})
      });

    } catch (error) {
      // Logout is treated as successful even on network failure
    }
  }
);
