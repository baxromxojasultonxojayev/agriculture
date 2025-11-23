import { useMemo, useState } from 'react';
import { useUsersStore } from '../store/usersStore';
import { User } from '../services/storage';
import UserFormModal from './UserFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useTranslation } from 'react-i18next';

export default function UsersPage() {
  const { t, i18n } = useTranslation();

  const users = useUsersStore((s) => s.users);
  const deleteUser = useUsersStore((s) => s.deleteUser);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const full = `${u.lastName} ${u.firstName}`.toLowerCase();
      return full.includes(q);
    });
  }, [users, search]);

  const handleAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = (reason: string) => {
    if (deletingUser) {
      console.log('Удаляем пользователя, причина:', reason);
      deleteUser(deletingUser.id);
      setSnackbar({
        open: true,
        message: t('user_deleted'),
        severity: 'success',
      });
    }
    setDeleteModalOpen(false);
    setDeletingUser(null);
  };

  const currentLocale = (i18n.language || 'ru').startsWith('uz')
    ? 'uz-UZ'
    : 'ru-RU';

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        mb={2}
        spacing={1}
      >
        <Typography variant="h5">{t('users')}</Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            size="small"
            label={t('search_user')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" onClick={handleAdd}>
            + {t('add_user')}
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('first_name')}</TableCell>
              <TableCell>{t('last_name')}</TableCell>
              <TableCell>{t('birthdate')}</TableCell>
              <TableCell>{t('gender')}</TableCell>
              <TableCell width={140} align="right">
                {t('actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('no_data')}
                </TableCell>
              </TableRow>
            )}
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.firstName}</TableCell>
                <TableCell>{u.lastName}</TableCell>
                <TableCell>
                  {u.birthdate
                    ? new Date(u.birthdate).toLocaleDateString(currentLocale)
                    : '-'}
                </TableCell>
                <TableCell>
                  {u.gender === 'male' ? t('male') : t('female')}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label={t('edit_user')}
                    onClick={() => handleEdit(u)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={t('delete')}
                    onClick={() => handleDeleteClick(u)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isFormOpen && (
        <UserFormModal
          initialUser={editingUser}
          onClose={() => setIsFormOpen(false)}
          onSaved={(message) =>
            setSnackbar({ open: true, message, severity: 'success' })
          }
        />
      )}

      <DeleteConfirmModal
        open={deleteModalOpen}
        user={deletingUser}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeletingUser(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
