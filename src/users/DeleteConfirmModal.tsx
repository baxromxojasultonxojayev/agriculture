import { useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';

type FormValues = {
  reason: string;
};

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
  const { t } = useTranslation();

  // Zod schema’ni ham tarjima bilan bog‘laymiz
  const schema = useMemo(
    () =>
      z.object({
        reason: z.string().min(5, t('delete_reason_min')), // "Пожалуйста, укажите причину (минимум 5 символов)"
      }),
    [t]
  );

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

  const fullName = `${user.lastName} ${user.firstName}`;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('delete_confirm_title')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2">
              {t('delete_confirm_user_text', { fullName })}
            </Typography>
            <TextField
              label={t('delete_reason')}
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
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            color="error"
            variant="contained"
            disabled={isSubmitting}
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
