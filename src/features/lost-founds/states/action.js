import {
  formatApiDateTime,
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';
import {
  deleteLostFound,
  getLostFound,
  getLostFounds,
  getLostFoundStatsDaily,
  getLostFoundStatsMonthly,
  postLostFound,
  postLostFoundCover,
  putLostFound,
} from '../api/lostFoundApi';

export const ActionType = {
  SET_LOST_FOUNDS: 'lostFounds/SET_LOST_FOUNDS',
  SET_LOST_FOUND: 'lostFounds/SET_LOST_FOUND',
  SET_IS_LOST_FOUND: 'lostFounds/SET_IS_LOST_FOUND',
  SET_IS_LOST_FOUND_ADD: 'lostFounds/SET_IS_LOST_FOUND_ADD',
  SET_IS_LOST_FOUND_ADDED: 'lostFounds/SET_IS_LOST_FOUND_ADDED',
  SET_IS_LOST_FOUND_CHANGE: 'lostFounds/SET_IS_LOST_FOUND_CHANGE',
  SET_IS_LOST_FOUND_CHANGED: 'lostFounds/SET_IS_LOST_FOUND_CHANGED',
  SET_IS_LOST_FOUND_CHANGE_COVER: 'lostFounds/SET_IS_LOST_FOUND_CHANGE_COVER',
  SET_IS_LOST_FOUND_CHANGED_COVER:
    'lostFounds/SET_IS_LOST_FOUND_CHANGED_COVER',
  SET_IS_LOST_FOUND_DELETE: 'lostFounds/SET_IS_LOST_FOUND_DELETE',
  SET_IS_LOST_FOUND_DELETED: 'lostFounds/SET_IS_LOST_FOUND_DELETED',
  SET_LOST_FOUND_STATS: 'lostFounds/SET_LOST_FOUND_STATS',
};

// ===== Action creators =====
export const setLostFoundsActionCreator = (lostFounds) => ({
  type: ActionType.SET_LOST_FOUNDS,
  payload: { lostFounds },
});

export const setLostFoundActionCreator = (lostFound) => ({
  type: ActionType.SET_LOST_FOUND,
  payload: { lostFound },
});

export const setLostFoundStatsActionCreator = (stats) => ({
  type: ActionType.SET_LOST_FOUND_STATS,
  payload: { stats },
});

const createStatusAction = (type) => (status) => ({
  type,
  payload: { status },
});

export const setIsLostFoundActionCreator = createStatusAction(
  ActionType.SET_IS_LOST_FOUND,
);
export const setIsLostFoundAddActionCreator = createStatusAction(
  ActionType.SET_IS_LOST_FOUND_ADD,
);
export const setIsLostFoundAddedActionCreator = createStatusAction(
  ActionType.SET_IS_LOST_FOUND_ADDED,
);
export const setIsLostFoundChangeActionCreator = createStatusAction(
  ActionType.SET_IS_LOST_FOUND_CHANGE,
);
export const setIsLostFoundChangedActionCreator = createStatusAction(
  ActionType.SET_IS_LOST_FOUND_CHANGED,
);
export const setIsLostFoundChangeCoverActionCreator = createStatusAction(
  ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
);
export const setIsLostFoundChangedCoverActionCreator = createStatusAction(
  ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
);
export const setIsLostFoundDeleteActionCreator = createStatusAction(
  ActionType.SET_IS_LOST_FOUND_DELETE,
);
export const setIsLostFoundDeletedActionCreator = createStatusAction(
  ActionType.SET_IS_LOST_FOUND_DELETED,
);

// ===== Async thunks (pengambilan data) =====
export const asyncGetLostFounds = (params) => async (dispatch) => {
  const { success, message, data } = await getLostFounds(params);

  if (!success) {
    showErrorDialog(message);
    return false;
  }

  dispatch(setLostFoundsActionCreator(data.lost_founds));
  return true;
};

export const asyncGetLostFound = (id) => async (dispatch) => {
  const { success, message, data } = await getLostFound(id);

  if (!success) {
    dispatch(setLostFoundActionCreator(null));
    dispatch(setIsLostFoundActionCreator(false));
    showErrorDialog(message);
    return false;
  }

  dispatch(setLostFoundActionCreator(data.lost_found));
  dispatch(setIsLostFoundActionCreator(true));
  return true;
};

const summarizeLostFounds = (items) => ({
  total: items.length,
  lost: items.filter((item) => item.status === 'lost').length,
  found: items.filter((item) => item.status === 'found').length,
  completed: items.filter((item) => Number(item.is_completed) === 1).length,
});

const pad2 = (value) => String(value).padStart(2, '0');

const toStatsKey = (date, period) =>
  period === 'daily'
    ? `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`
    : `${pad2(date.getMonth() + 1)}-${date.getFullYear()}`;

// Membangun data statistik dengan bentuk yang sama seperti respons API
// (stats_losts, stats_founds, dst) dari daftar laporan
export const buildStatsSeries = (items, period, total, endDate) => {
  const keys = [];

  for (let offset = total - 1; offset >= 0; offset -= 1) {
    const date =
      period === 'daily'
        ? new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate() - offset,
          )
        : new Date(endDate.getFullYear(), endDate.getMonth() - offset, 1);

    keys.push(toStatsKey(date, period));
  }

  const emptySeries = () => Object.fromEntries(keys.map((key) => [key, 0]));

  const result = {
    stats_losts: emptySeries(),
    stats_losts_completed: emptySeries(),
    stats_losts_process: emptySeries(),
    stats_founds: emptySeries(),
    stats_founds_completed: emptySeries(),
    stats_founds_process: emptySeries(),
  };

  items.forEach((item) => {
    const key = toStatsKey(new Date(item.created_at), period);

    // Abaikan laporan di luar rentang waktu grafik
    if (!(key in result.stats_losts)) return;

    const type = item.status === 'lost' ? 'losts' : 'founds';
    const state = Number(item.is_completed) === 1 ? 'completed' : 'process';

    result[`stats_${type}`][key] += 1;
    result[`stats_${type}_${state}`][key] += 1;
  });

  return result;
};

// Ringkasan (semua dan milik saya) + data grafik harian 7 hari dan bulanan 6 bulan
export const asyncGetLostFoundStats = () => async (dispatch) => {
  const now = new Date();
  const endDate = formatApiDateTime(now);

  const [allResult, mineResult, dailyResult, monthlyResult] =
    await Promise.all([
      getLostFounds(),
      getLostFounds({ is_me: 1 }),
      getLostFoundStatsDaily({ end_date: endDate, total_data: 7 }),
      getLostFoundStatsMonthly({ end_date: endDate, total_data: 6 }),
    ]);

  if (!allResult.success) {
    showErrorDialog(allResult.message);
    return false;
  }

  const allItems = allResult.data.lost_founds;

  dispatch(
    setLostFoundStatsActionCreator({
      summary: {
        all: summarizeLostFounds(allItems),
        mine: summarizeLostFounds(
          mineResult.success ? mineResult.data.lost_founds : [],
        ),
      },
      charts: {
        // Semua pengguna: dihitung dari daftar laporan
        all: {
          daily: buildStatsSeries(allItems, 'daily', 7, now),
          monthly: buildStatsSeries(allItems, 'monthly', 6, now),
        },
        // Milik saya: dari endpoint statistik API
        mine: {
          daily: dailyResult.success ? dailyResult.data : null,
          monthly: monthlyResult.success ? monthlyResult.data : null,
        },
      },
    }),
  );
  return true;
};

// ===== Async thunks (mutasi) =====
const runMutation = async (
  dispatch,
  { request, setProcess, setDone },
) => {
  dispatch(setProcess(true));
  const { success, message } = await request();
  dispatch(setProcess(false));

  if (!success) {
    showErrorDialog(message);
    return false;
  }

  dispatch(setDone(true));
  showSuccessDialog(message);
  return true;
};

export const asyncSetLostFoundAdd = (payload) => (dispatch) =>
  runMutation(dispatch, {
    request: () => postLostFound(payload),
    setProcess: setIsLostFoundAddActionCreator,
    setDone: setIsLostFoundAddedActionCreator,
  });

export const asyncSetLostFoundChange = (id, payload) => (dispatch) =>
  runMutation(dispatch, {
    request: () => putLostFound(id, payload),
    setProcess: setIsLostFoundChangeActionCreator,
    setDone: setIsLostFoundChangedActionCreator,
  });

export const asyncSetLostFoundChangeCover = (id, file) => (dispatch) =>
  runMutation(dispatch, {
    request: () => postLostFoundCover(id, file),
    setProcess: setIsLostFoundChangeCoverActionCreator,
    setDone: setIsLostFoundChangedCoverActionCreator,
  });

export const asyncSetLostFoundDelete = (id) => (dispatch) =>
  runMutation(dispatch, {
    request: () => deleteLostFound(id),
    setProcess: setIsLostFoundDeleteActionCreator,
    setDone: setIsLostFoundDeletedActionCreator,
  });