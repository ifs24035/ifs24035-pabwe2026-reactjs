import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './store';
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import './index.css';

// Pengguna yang sudah login: unduh chunk halaman terproteksi secara paralel
// sejak awal, bukan menunggu layout selesai dimuat lebih dulu.
if (localStorage.getItem('accessToken')) {
  const { pathname } = window.location;

  import('./features/lost-founds/layouts/LostFoundLayout');
  if (pathname === '/') {
    import('./features/lost-founds/pages/HomePage');
  } else if (pathname.startsWith('/lost-founds/')) {
    import('./features/lost-founds/pages/DetailPage');
  } else if (pathname === '/users') {
    import('./features/users/pages/UsersPage');
  } else if (pathname === '/profile') {
    import('./features/users/pages/ProfilePage');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);