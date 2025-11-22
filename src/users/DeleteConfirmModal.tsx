import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import type { User } from '../services/storage';

const schema = z.object({
  reason: z.string().min(5, 'Пожалуйста, укажите причину (минимум 5 символов)'),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  user: User | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

export default function DeleteConfirmModal({
  open,
  user,
  onCancel,
  onConfirm,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  });

  const handleClose = () => {
    reset({ reason: '' });
    onCancel();
  };

  const onSubmit = (values: FormValues) => {
    onConfirm(values.reason);
    reset({ reason: '' });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Подтверждение удаления</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2">
              Вы действительно хотите удалить пользователя{' '}
              <strong>
                {user.lastName} {user.firstName}
              </strong>
              ?
            </Typography>
            <TextField
              label="Причина удаления"
              multiline
              minRows={3}
              fullWidth
              {...register('reason')}
              error={!!errors.reason}
              helperText={errors.reason?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Отмена
          </Button>
          <Button
            type="submit"
            color="error"
            variant="contained"
            disabled={isSubmitting}
          >
            Удалить
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
