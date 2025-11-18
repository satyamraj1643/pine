import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

// Assuming these are defined in your project
import { validateUser } from "../redux/validateThunk";
import type { RootState } from "../redux/store";

// Define typed dispatch
type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

const useValidateUser = (): void => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(validateUser());
  }, [dispatch]);
};

export default useValidateUser;