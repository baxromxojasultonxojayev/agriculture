import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormHelperText from '@mui/material/FormHelperText';

import { useUsersStore } from '../store/usersStore';
import { User, Gender } from '../services/storage';
import { useTranslation } from 'react-i18next';

type Props = {
  initialUser: User | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

type FormValues = {
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: Gender;
};

const today = new Date();
const maxDate = today.toISOString().slice(0, 10);

export default function UserFormModal({
  initialUser,
  onClose,
  onSaved,
}: Props) {
  const { t, i18n } = useTranslation();

  const addUser = useUsersStore((s) => s.addUser);
  const updateUser = useUsersStore((s) => s.updateUser);

  // Zod schema ni tilga qarab rebuild qilamiz
  const userSchema = useMemo(
    () =>
      z.object({
        firstName: z
          .string()
          .min(2, t('first_name_min')) // "Минимум 2 символа"
          .max(50, t('first_name_max')), // "Слишком длинное имя"
        lastName: z
          .string()
          .min(2, t('last_name_min')) // "Минимум 2 символа"
          .max(50, t('last_name_max')), // "Слишком длинная фамилия"
        birthdate: z
          .string()
          .nonempty(t('birthdate_required')) // "Дата рождения обязательна"
          .refine(
            (value) => {
              const d = new Date(value);
              if (Number.isNaN(d.getTime())) return false;
              return d <= today;
            },
            { message: t('birthdate_future_error') } // "Дата рождения не может быть в будущем"
          ),
        gender: z.enum(['male', 'female'], {
          errorMap: () => ({ message: t('gender_required') }),
        }),
      }),
    [t, i18n.language]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthdate: '',
      gender: 'male',
    },
  });

  useEffect(() => {
    if (initialUser) {
      reset({
        firstName: initialUser.firstName,
        lastName: initialUser.lastName,
        birthdate: initialUser.birthdate,
        gender: initialUser.gender as Gender,
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        birthdate: '',
        gender: 'male',
      });
    }
  }, [initialUser, reset]);

  const onSubmit = (values: FormValues) => {
    if (initialUser) {
      const updated: User = {
        ...initialUser,
        ...values,
      };
      updateUser(updated);
      onSaved(t('user_updated')); // "Пользователь успешно обновлён"
    } else {
      const newUser: User = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...values,
      };
      addUser(newUser);
      onSaved(t('user_created')); // "Пользователь успешно создан"
    }
    onClose();
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialUser ? t('edit_user') : t('add_user')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label={t('first_name')}
              fullWidth
              {...register('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label={t('last_name')}
              fullWidth
              {...register('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
            <TextField
              label={t('birthdate')}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              {...register('birthdate')}
              inputProps={{ max: maxDate }}
              error={!!errors.birthdate}
              helperText={errors.birthdate?.message}
            />

            <FormControl error={!!errors.gender}>
              <FormLabel>{t('gender')}</FormLabel>
              <RadioGroup row>
                <FormControlLabel
                  value="male"
                  control={<Radio {...register('gender')} />}
                  label={t('male')}
                />
                <FormControlLabel
                  value="female"
                  control={<Radio {...register('gender')} />}
                  label={t('female')}
                />
              </RadioGroup>
              {errors.gender && (
                <FormHelperText>{errors.gender.message}</FormHelperText>
              )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            {t('cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t('save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
