import { useEffect } from 'react';
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

type Props = {
  initialUser: User | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

const today = new Date();
const maxDate = today.toISOString().slice(0, 10);

const userSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(50, 'Слишком длинное имя'),
  lastName: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(50, 'Слишком длинная фамилия'),
  birthdate: z
    .string()
    .nonempty('Дата рождения обязательна')
    .refine(
      (value) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return false;
        return d <= today;
      },
      { message: 'Дата рождения не может быть в будущем' }
    ),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Пожалуйста, выберите пол' }),
  }),
});

type FormValues = z.infer<typeof userSchema>;

export default function UserFormModal({
  initialUser,
  onClose,
  onSaved,
}: Props) {
  const addUser = useUsersStore((s) => s.addUser);
  const updateUser = useUsersStore((s) => s.updateUser);

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
      onSaved('Пользователь успешно обновлён');
    } else {
      const newUser: User = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...values,
      };
      addUser(newUser);
      onSaved('Пользователь успешно создан');
    }
    onClose();
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialUser ? 'Редактирование пользователя' : 'Создание пользователя'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Имя"
              fullWidth
              {...register('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Фамилия"
              fullWidth
              {...register('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
            <TextField
              label="Дата рождения"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              {...register('birthdate')}
              inputProps={{ max: maxDate }}
              error={!!errors.birthdate}
              helperText={errors.birthdate?.message}
            />

            <FormControl error={!!errors.gender}>
              <FormLabel>Пол</FormLabel>
              <RadioGroup row>
                <FormControlLabel
                  value="male"
                  control={<Radio {...register('gender')} />}
                  label="Мужчина"
                />
                <FormControlLabel
                  value="female"
                  control={<Radio {...register('gender')} />}
                  label="Женщина"
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
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Сохранить
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
