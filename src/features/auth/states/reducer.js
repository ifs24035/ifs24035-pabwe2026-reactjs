import { getAccessToken } from '../../../helpers/apiHelper';
import { ActionType } from './action';

// true jika token sudah tersimpan (pengguna dianggap sudah login)
export const isAuthLoginReducer = (state = Boolean(getAccessToken()), action) => {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_LOGIN:
      return action.payload.status;
    default:
      return state;
  }
};

// true sesaat setelah registrasi berhasil, lalu di-reset oleh RegisterPage
export const isAuthRegisterReducer = (state = false, action) => {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_REGISTER:
      return action.payload.status;
    default:
      return state;
  }
};

// true setelah pengguna logout
export const isAuthLogoutReducer = (state = false, action) => {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_LOGOUT:
      return action.payload.status;
    default:
      return state;
  }
};