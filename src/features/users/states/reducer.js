import { ActionType as AuthActionType } from '../../auth/states/action';
import { ActionType } from './action';

export const usersReducer = (state = [], action) => {
  switch (action.type) {
    case ActionType.SET_USERS:
      return action.payload.users;
    default:
      return state;
  }
};

// Pengguna yang sedang dipilih (untuk modal detail di UsersPage)
export const userReducer = (state = null, action) => {
  switch (action.type) {
    case ActionType.SET_USER:
      return action.payload.user;
    default:
      return state;
  }
};

// Profil pengguna yang sedang login
export const profileReducer = (state = null, action) => {
  switch (action.type) {
    case ActionType.SET_PROFILE:
      return action.payload.profile;
    case AuthActionType.SET_IS_AUTH_LOGOUT:
      return action.payload.status ? null : state;
    default:
      return state;
  }
};

// true jika profil sudah berhasil dimuat (dipakai route guard di Tahap 4)
export const isProfileReducer = (state = false, action) => {
  switch (action.type) {
    case ActionType.SET_IS_PROFILE:
      return action.payload.status;
    case AuthActionType.SET_IS_AUTH_LOGOUT:
      return action.payload.status ? false : state;
    default:
      return state;
  }
};

export const isChangeProfileReducer = (state = false, action) => {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE:
      return action.payload.status;
    default:
      return state;
  }
};

export const isChangeProfilePhotoReducer = (state = false, action) => {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE_PHOTO:
      return action.payload.status;
    default:
      return state;
  }
};

export const isChangeProfilePasswordReducer = (state = false, action) => {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE_PASSWORD:
      return action.payload.status;
    default:
      return state;
  }
};