import { Link, Route, Routes, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import { useTranslation } from 'react-i18next'; // ⬅️ i18next

import UsersPage from './users/UsersPage';
import MapPage from './map/MapPage';

const App = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isUsers = location.pathname === '/users' || location.pathname === '/';
  const isMap = location.pathname === '/map';

  const currentLng = (i18n.language || 'uz').slice(0, 2);

  const handleChangeLang = (lng: 'uz' | 'ru') => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="app">
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background:
            'linear-gradient(90deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <Toolbar disableGutters>
          <Container
            maxWidth="lg"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1,
            }}
          >
            {/* LOGO / Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
              }}
            >
              LOGO
            </Typography>

            {/* Nav + Language switcher */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* NAV */}
              <Box
                component="nav"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Button
                  component={Link}
                  to="/users"
                  disableRipple
                  sx={{
                    color: 'common.white',
                    textTransform: 'uppercase',
                    fontWeight: isUsers ? 700 : 500,
                    borderRadius: 999,
                    px: 2.5,
                    py: 0.75,
                    fontSize: 13,
                    backgroundColor: isUsers
                      ? 'rgba(255,255,255,0.16)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.22)',
                    },
                  }}
                >
                  {t('users')}
                </Button>

                <Button
                  component={Link}
                  to="/map"
                  disableRipple
                  sx={{
                    color: 'common.white',
                    textTransform: 'uppercase',
                    fontWeight: isMap ? 700 : 500,
                    borderRadius: 999,
                    px: 2.5,
                    py: 0.75,
                    fontSize: 13,
                    backgroundColor: isMap
                      ? 'rgba(255,255,255,0.16)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.22)',
                    },
                  }}
                >
                  {t('map')}
                </Button>
              </Box>

              {/* LANGUAGE SWITCH */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 999,
                  padding: '2px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  gap: 0.5,
                }}
              >
                <Button
                  size="small"
                  onClick={() => handleChangeLang('uz')}
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    py: 0.25,
                    fontSize: 12,
                    lineHeight: 1.4,
                    textTransform: 'uppercase',
                    borderRadius: 999,
                    color:
                      currentLng === 'uz' ? 'primary.main' : 'common.white',
                    backgroundColor:
                      currentLng === 'uz' ? 'common.white' : 'transparent',
                    '&:hover': {
                      backgroundColor:
                        currentLng === 'uz'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  UZ
                </Button>
                <Button
                  size="small"
                  onClick={() => handleChangeLang('ru')}
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    py: 0.25,
                    fontSize: 12,
                    lineHeight: 1.4,
                    textTransform: 'uppercase',
                    borderRadius: 999,
                    color:
                      currentLng === 'ru' ? 'primary.main' : 'common.white',
                    backgroundColor:
                      currentLng === 'ru' ? 'common.white' : 'transparent',
                    '&:hover': {
                      backgroundColor:
                        currentLng === 'ru'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  RU
                </Button>
              </Box>
            </Box>
          </Container>
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
};

export default App;
