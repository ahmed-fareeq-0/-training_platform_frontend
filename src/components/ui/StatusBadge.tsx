import { Chip, type ChipProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BookingStatus, WorkshopStatus } from '../../types';

type StatusType = BookingStatus | WorkshopStatus | string;

const statusColors: Record<string, ChipProps['color']> = {
          [BookingStatus.PENDING]: 'warning',
          [BookingStatus.CONFIRMED]: 'info',
          [BookingStatus.ATTENDED]: 'success',
          [BookingStatus.PAID]: 'success',
          [BookingStatus.NO_SHOW]: 'error',
          [BookingStatus.CANCELLED]: 'default',
          [WorkshopStatus.DRAFT]: 'default',
          [WorkshopStatus.SCHEDULED]: 'info',
          [WorkshopStatus.ONGOING]: 'warning',
          [WorkshopStatus.COMPLETED]: 'success',
          // WorkshopStatus.CANCELLED shares key with BookingStatus.CANCELLED
};

interface StatusBadgeProps {
          status: StatusType;
          type?: 'booking' | 'workshop';
          size?: 'small' | 'medium';
}

export default function StatusBadge({ status, type = 'booking', size = 'small' }: StatusBadgeProps) {
          const { t } = useTranslation();
          const i18nKey = type === 'booking' ? `booking.status.${status}` : `workshop.status.${status}`;
          const label = t(i18nKey, status);

          return (
                    <Chip
                              label={label}
                              color={statusColors[status] || 'default'}
                              size={size}
                              variant="filled"
                              sx={{ fontWeight: 600, minWidth: 80 }}
                    />
          );
}
