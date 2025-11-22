import { Link, Route, Routes, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import UsersPage from './users/UsersPage';
import MapPage from './map/MapPage';

export default function App() {
  const location = useLocation();

  return (
    <div className="app">
      <AppBar position="static" color="primary">
        <Toolbar
          className="app-toolbar"
          sx={{ textAlign: 'center', justifyContent: 'center' }}
        >
          <nav className="app-nav">
            <Button
              color={
                location.pathname === '/users' || location.pathname === '/'
                  ? 'inherit'
                  : 'info'
              }
              component={Link}
              to="/users"
            >
              Users
            </Button>
            <Button
              color={location.pathname === '/map' ? 'inherit' : 'info'}
              component={Link}
              to="/map"
            >
              Map
            </Button>
          </nav>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }} className="app-main">
        <Routes>
          <Route path="/" element={<UsersPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </Container>
    </div>
  );
}
