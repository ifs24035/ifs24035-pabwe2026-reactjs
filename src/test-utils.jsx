import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import * as authReducers from './features/auth/states/reducer';
import * as lostFoundReducers from './features/lost-founds/states/reducer';
import * as userReducers from './features/users/states/reducer';

// Nama reducer diubah menjadi kunci state: isAuthLoginReducer -> isAuthLogin
const reducer = Object.fromEntries(
  Object.entries({
    ...authReducers,
    ...userReducers,
    ...lostFoundReducers,
  }).map(([name, fn]) => [name.replace(/Reducer$/, ''), fn]),
);

export const createTestStore = (preloadedState) =>
  configureStore({ reducer, preloadedState });

export const renderWithProviders = (
  ui,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    route = '/',
    ...renderOptions
  } = {},
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};