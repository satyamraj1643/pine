import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie } from "../utilities/csrf";
import {ActivationPayload, ActivationResponse, ErrorResponse, LoginPayload, LoginResponse, SignupPayload,SignupResponse,VerifyOtpPayload, VerifyOtpResponse} from "../types"
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
  { user_id?: number; email: string; name: string , isVerified: boolean},
  SignupPayload,
  { rejectValue: ErrorResponse }
>(
  "auth/signupUser",
  async (formData, { rejectWithValue }) => {
    console.log("Data for signup", formData);
    try {
      const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("data from signuo", data)

      if (!response.ok) return rejectWithValue(data);

      return {
        user_id: data.user_id ?? data.id ?? undefined,
        email: data.email,
        name: data.name,
        isVerified : data.isVerified,
      };
    } catch {
      return rejectWithValue({ detail: "Network Error" });
    }
  }
);

export const verifyOTP = createAsyncThunk<
  { isVerified: boolean; },
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

      return data;
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

      console.log("Here is the data from login: ", data)

      if (!response.ok) {
        return rejectWithValue(data);
      }

      const datab = {
        user_id: data.user_id ?? data.id ?? undefined,
        name: data.name ?? "",
        email: data.email ?? email,
        isOtpVerified: Boolean(data.isOtpVerified),
        token: data.token ?? null,
      }

      localStorage.setItem("auth_token", data.token);

      console.log("set up tok in localstorage, here is the data", datab)

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
      const csrfToken = getCookie("csrftoken");
      console.log("🔐 CSRF Token:", csrfToken);
      
      const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/auth/logout/`, {
        method: "POST",
        credentials: "include", // This sends cookies automatically
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        body: JSON.stringify({}) // Empty body since token comes from cookie
      });

      if (!response.ok) {
        const data = await response.json();
        console.log("❌ Error response:", data);
        return rejectWithValue(data);
      }
      
      console.log("✅ Logout successful");
    } catch (error) {
      console.log("❌ Network error:", error);
      return rejectWithValue({ detail: "Network Error" });
    }
  }
);





