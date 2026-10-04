import { configureStore } from '@reduxjs/toolkit';
import {
  isAuthLoginReducer,
  isAuthLogoutReducer,
  isAuthRegisterReducer,
} from './features/auth/states/reducer';
import {
  isLostFoundAddedReducer,
  isLostFoundAddReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundChangedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangeReducer,
  isLostFoundDeletedReducer,
  isLostFoundDeleteReducer,
  isLostFoundReducer,
  lostFoundReducer,
  lostFoundsReducer,
  lostFoundStatsReducer,
} from './features/lost-founds/states/reducer';
import {
  isChangeProfilePasswordReducer,
  isChangeProfilePhotoReducer,
  isChangeProfileReducer,
  isProfileReducer,
  profileReducer,
  userReducer,
  usersReducer,
} from './features/users/states/reducer';

const store = configureStore({
  reducer: {
    // auth
    isAuthLogin: isAuthLoginReducer,
    isAuthRegister: isAuthRegisterReducer,
    isAuthLogout: isAuthLogoutReducer,
    // users
    users: usersReducer,
    user: userReducer,
    profile: profileReducer,
    isProfile: isProfileReducer,
    isChangeProfile: isChangeProfileReducer,
    isChangeProfilePhoto: isChangeProfilePhotoReducer,
    isChangeProfilePassword: isChangeProfilePasswordReducer,
    // lost-founds
    lostFounds: lostFoundsReducer,
    lostFound: lostFoundReducer,
    isLostFound: isLostFoundReducer,
    isLostFoundAdd: isLostFoundAddReducer,
    isLostFoundAdded: isLostFoundAddedReducer,
    isLostFoundChange: isLostFoundChangeReducer,
    isLostFoundChanged: isLostFoundChangedReducer,
    isLostFoundChangeCover: isLostFoundChangeCoverReducer,
    isLostFoundChangedCover: isLostFoundChangedCoverReducer,
    isLostFoundDelete: isLostFoundDeleteReducer,
    isLostFoundDeleted: isLostFoundDeletedReducer,
    lostFoundStats: lostFoundStatsReducer,
  },
});

export default store;