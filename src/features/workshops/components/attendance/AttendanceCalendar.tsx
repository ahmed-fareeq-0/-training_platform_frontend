import { Box, Card, CardContent, Typography, Grid, useTheme, Avatar } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useTraineeAttendance } from '../../hooks/useAttendance';
import { AttendanceStatus } from '../../../../types';

export default function AttendanceCalendar({ workshopId }: { workshopId: string }) {
          const { t } = useTranslation();
          const theme = useTheme();
          const { data: attendanceData, isLoading } = useTraineeAttendance(workshopId);

          // Map dates to status for easy lookup
          const attendanceMap = new Map<string, AttendanceStatus>();
          attendanceData?.data?.forEach(record => {
                    attendanceMap.set(dayjs(record.date).format('YYYY-MM-DD'), record.status);
          });

          const CustomPickersDay = (props: PickersDayProps & { selectedDay?: Dayjs | null }) => {
                    const { day, outsideCurrentMonth, ...other } = props;
                    const dateStr = day.format('YYYY-MM-DD');
                    const status = attendanceMap.get(dateStr);

                    let bgColor = 'transparent';
                    let color = theme.palette.text.primary;
                    let fontWeight = 400;

                    if (status === AttendanceStatus.PRESENT) {
                              bgColor = theme.palette.success.main;
                              color = theme.palette.success.contrastText;
                              fontWeight = 700;
                    } else if (status === AttendanceStatus.ABSENT) {
                              bgColor = theme.palette.error.main;
                              color = theme.palette.error.contrastText;
                              fontWeight = 700;
                    } else if (status === AttendanceStatus.EXCUSED) {
                              bgColor = theme.palette.warning.main;
                              color = theme.palette.warning.contrastText;
                              fontWeight = 700;
                    }

                    return (
                              <PickersDay
                                        {...other}
                                        outsideCurrentMonth={outsideCurrentMonth}
                                        day={day}
                                        sx={{
                                                  fontWeight,
                                                  ...(status && !outsideCurrentMonth && {
                                                            backgroundColor: bgColor,
                                                            color: color,
                                                            '&:hover, &:focus': {
                                                                      backgroundColor: bgColor,
                                                            },
                                                  }),
                                        }}
                              />
                    );
          };

          if (isLoading) return null;

          return (
                    <Card sx={{ mb: 3 }}>
                              <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>
                                                  {t('attendance.myAttendance') || 'سجل الحضور الخاص بي / My Attendance Calendar'}
                                        </Typography>
                                        <Grid container spacing={4} alignItems="center">
                                                  <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                      <DateCalendar
                                                                                readOnly
                                                                                slots={{
                                                                                          day: CustomPickersDay,
                                                                                }}
                                                                      />
                                                            </LocalizationProvider>
                                                  </Grid>
                                                  <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                      <Avatar sx={{ bgcolor: theme.palette.success.main, width: 40, height: 40, fontWeight: 'bold' }}>P</Avatar>
                                                                      <Box>
                                                                                <Typography fontWeight={600}>حاضر / Present</Typography>
                                                                                <Typography variant="caption" color="text.secondary">Trainee attended the workshop session</Typography>
                                                                      </Box>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                      <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40, fontWeight: 'bold' }}>A</Avatar>
                                                                      <Box>
                                                                                <Typography fontWeight={600}>غائب / Absent</Typography>
                                                                                <Typography variant="caption" color="text.secondary">Trainee missed the session without excuse</Typography>
                                                                      </Box>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                      <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 40, height: 40, fontWeight: 'bold' }}>E</Avatar>
                                                                      <Box>
                                                                                <Typography fontWeight={600}>بعذر / Excused</Typography>
                                                                                <Typography variant="caption" color="text.secondary">Trainee had an approved excuse</Typography>
                                                                      </Box>
                                                            </Box>
                                                  </Grid>
                                        </Grid>
                              </CardContent>
                    </Card>
          );
}
