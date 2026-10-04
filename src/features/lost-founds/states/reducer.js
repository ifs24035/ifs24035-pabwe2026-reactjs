import { ActionType } from './action';

const createFlagReducer = (type) => (state = false, action) =>
  action.type === type ? action.payload.status : state;

export const lostFoundsReducer = (state = [], action) => {
  switch (action.type) {
    case ActionType.SET_LOST_FOUNDS:
      return action.payload.lostFounds;
    default:
      return state;
  }
};

export const lostFoundReducer = (state = null, action) => {
  switch (action.type) {
    case ActionType.SET_LOST_FOUND:
      return action.payload.lostFound;
    default:
      return state;
  }
};

export const lostFoundStatsReducer = (state = null, action) => {
  switch (action.type) {
    case ActionType.SET_LOST_FOUND_STATS:
      return action.payload.stats;
    default:
      return state;
  }
};

export const isLostFoundReducer = createFlagReducer(
  ActionType.SET_IS_LOST_FOUND,
);
export const isLostFoundAddReducer = createFlagReducer(
  ActionType.SET_IS_LOST_FOUND_ADD,
);
export const isLostFoundAddedReducer = createFlagReducer(
  ActionType.SET_IS_LOST_FOUND_ADDED,
);
export const isLostFoundChangeReducer = createFlagReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGE,
);
export const isLostFoundChangedReducer = createFlagReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGED,
);
export const isLostFoundChangeCoverReducer = createFlagReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
);
export const isLostFoundChangedCoverReducer = createFlagReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
);
export const isLostFoundDeleteReducer = createFlagReducer(
  ActionType.SET_IS_LOST_FOUND_DELETE,
);
export const isLostFoundDeletedReducer = createFlagReducer(
  ActionType.SET_IS_LOST_FOUND_DELETED,
);