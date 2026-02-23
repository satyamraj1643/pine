import { createAsyncThunk } from "@reduxjs/toolkit";
import { GENERAL_BACKEND_BASE_URL } from "../constants";

export const validateUser = createAsyncThunk<
  {
    userId: string | null;
    name: string;
    email: string;
    isActivated: boolean;
    isSuperUser: boolean;
    isStaff: boolean;
  },
  void,
  { rejectValue: { detail?: string } }
>("auth/validateUser", async (_, { rejectWithValue }) => {

  const token = localStorage.getItem("auth_token");
  console.log("the token from the localstorage", token);

  
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/auth/validate`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log("data from validate", data);

    if (!response.ok) {
      return rejectWithValue(data);
    }

    const user = data.user || {};

    const idValue = user.id ?? user.user_id;

    return {
      userId: idValue !== undefined ? String(idValue) : null,
      name: user.name ?? "",
      email: user.email ?? "",
      isActivated: Boolean(user.isVerified),
      isSuperUser: Boolean(user.isSuperuser),
      isStaff: Boolean(user.isStaff),
    };
  } catch {
    return rejectWithValue({ detail: "Network Error" });
  }
});
