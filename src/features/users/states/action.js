import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';
import {
  getProfile,
  getUsers,
  postProfilePhoto,
  putProfile,
  putProfilePassword,
} from '../api/userApi';

export const ActionType = {
  SET_USERS: 'users/SET_USERS',
  SET_USER: 'users/SET_USER',
  SET_PROFILE: 'users/SET_PROFILE',
  SET_IS_PROFILE: 'users/SET_IS_PROFILE',
  SET_IS_CHANGE_PROFILE: 'users/SET_IS_CHANGE_PROFILE',
  SET_IS_CHANGE_PROFILE_PHOTO: 'users/SET_IS_CHANGE_PROFILE_PHOTO',
  SET_IS_CHANGE_PROFILE_PASSWORD: 'users/SET_IS_CHANGE_PROFILE_PASSWORD',
};

// ===== Action creators =====
export const setUsersActionCreator = (users) => ({
  type: ActionType.SET_USERS,
  payload: { users },
});

export const setUserActionCreator = (user) => ({
  type: ActionType.SET_USER,
  payload: { user },
});

export const setProfileActionCreator = (profile) => ({
  type: ActionType.SET_PROFILE,
  payload: { profile },
});

export const setIsProfileActionCreator = (status) => ({
  type: ActionType.SET_IS_PROFILE,
  payload: { status },
});

export const setIsChangeProfileActionCreator = (status) => ({
  type: ActionType.SET_IS_CHANGE_PROFILE,
  payload: { status },
});

export const setIsChangeProfilePhotoActionCreator = (status) => ({
  type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO,
  payload: { status },
});

export const setIsChangeProfilePasswordActionCreator = (status) => ({
  type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
  payload: { status },
});

// ===== Async thunks =====
export const asyncGetUsers = () => async (dispatch) => {
  const { success, message, data } = await getUsers();

  if (!success) {
    showErrorDialog(message);
    return false;
  }

  dispatch(setUsersActionCreator(data.users));
  return true;
};

// Tanpa dialog: dipakai untuk memverifikasi sesi di layout (Tahap 4)
export const asyncGetProfile = () => async (dispatch) => {
  const { success, data } = await getProfile();

  if (!success) {
    dispatch(setProfileActionCreator(null));
    dispatch(setIsProfileActionCreator(false));
    return false;
  }

  dispatch(setProfileActionCreator(data.user));
  dispatch(setIsProfileActionCreator(true));
  return true;
};

export const asyncSetIsChangeProfile =
  ({ name, email }) =>
  async (dispatch) => {
    const { success, message } = await putProfile({ name, email });

    if (!success) {
      showErrorDialog(message);
      return false;
    }

    dispatch(setIsChangeProfileActionCreator(true));
    showSuccessDialog(message);
    return true;
  };

export const asyncSetIsChangeProfilePhoto = (file) => async (dispatch) => {
  const { success, message } = await postProfilePhoto(file);

  if (!success) {
    showErrorDialog(message);
    return false;
  }

  dispatch(setIsChangeProfilePhotoActionCreator(true));
  showSuccessDialog(message);
  return true;
};

export const asyncSetIsChangeProfilePassword =
  ({ password, newPassword }) =>
  async (dispatch) => {
    const { success, message } = await putProfilePassword({
      password,
      newPassword,
    });

    if (!success) {
      showErrorDialog(message);
      return false;
    }

    dispatch(setIsChangeProfilePasswordActionCreator(true));
    showSuccessDialog(message);
    return true;
  };