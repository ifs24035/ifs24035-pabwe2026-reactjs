import {
  putAccessToken,
  removeAccessToken,
} from '../../../helpers/apiHelper';
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';
import { postLogin, postRegister } from '../api/authApi';

export const ActionType = {
  SET_IS_AUTH_LOGIN: 'auth/SET_IS_AUTH_LOGIN',
  SET_IS_AUTH_REGISTER: 'auth/SET_IS_AUTH_REGISTER',
  SET_IS_AUTH_LOGOUT: 'auth/SET_IS_AUTH_LOGOUT',
};

// ===== Action creators =====
export const setIsAuthLoginActionCreator = (status) => ({
  type: ActionType.SET_IS_AUTH_LOGIN,
  payload: { status },
});

export const setIsAuthRegisterActionCreator = (status) => ({
  type: ActionType.SET_IS_AUTH_REGISTER,
  payload: { status },
});

export const setIsAuthLogoutActionCreator = (status) => ({
  type: ActionType.SET_IS_AUTH_LOGOUT,
  payload: { status },
});

// ===== Async thunks =====
export const asyncSetIsAuthLogin =
  ({ email, password }) =>
  async (dispatch) => {
    const { success, message, data } = await postLogin({ email, password });

    if (!success) {
      showErrorDialog(message);
      return false;
    }

    putAccessToken(data.token);
    dispatch(setIsAuthLoginActionCreator(true));
    dispatch(setIsAuthLogoutActionCreator(false));
    showSuccessDialog(message);
    return true;
  };

export const asyncSetIsAuthRegister =
  ({ name, email, password }) =>
  async (dispatch) => {
    const { success, message } = await postRegister({ name, email, password });

    if (!success) {
      showErrorDialog(message);
      return false;
    }

    dispatch(setIsAuthRegisterActionCreator(true));
    showSuccessDialog(message);
    return true;
  };

export const asyncSetIsAuthLogout = () => async (dispatch) => {
  removeAccessToken();
  dispatch(setIsAuthLoginActionCreator(false));
  dispatch(setIsAuthLogoutActionCreator(true));
  showSuccessDialog('Anda berhasil keluar');
};