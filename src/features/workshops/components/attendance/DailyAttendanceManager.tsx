import { useState } from 'react';
import {
          Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell,
          TableHead, TableRow, Avatar, Select, MenuItem, TextField, CircularProgress,
          useTheme, alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useDailyAttendance, useRecordAttendance } from '../../hooks/useAttendance';
import { AttendanceStatus } from '../../../../types';
import { getImageUrl } from '../../../../utils/imageUtils';
import { Save as SaveIcon, DoneAll } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function DailyAttendanceManager({ workshopId }: { workshopId: string }) {
          const { t } = useTranslation();
          const theme = useTheme();
          const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

          const dateStr = selectedDate.format('YYYY-MM-DD');
          const { data: attendanceData, isLoading } = useDailyAttendance(workshopId, dateStr);
          const recordMutation = useRecordAttendance();

          // Local state for edits
          const [edits, setEdits] = useState<Record<string, { status: AttendanceStatus; notes?: string }>>({});

          const handleStatusChange = (traineeId: string, status: AttendanceStatus) => {
                    setEdits(prev => ({ ...prev, [traineeId]: { ...prev[traineeId], status } }));
          };

          const handleNotesChange = (traineeId: string, notes: string) => {
                    setEdits(prev => ({ ...prev, [traineeId]: { ...prev[traineeId], notes } }));
          };

          const markAllPresent = () => {
                    if (!attendanceData?.data) return;
                    const newEdits = { ...edits };
                    attendanceData.data.forEach(t => {
                              newEdits[t.trainee_id] = { ...newEdits[t.trainee_id], status: AttendanceStatus.PRESENT };
                    });
                    setEdits(newEdits);
                    toast.success('تم تعيين الجميع كحاضرين / All marked as Present');
          };

          const saveAttendance = async () => {
                    if (!attendanceData?.data) return;

                    // Build payload array
                    const records = attendanceData.data.map(t => {
                              const edit = edits[t.trainee_id];
                              return {
                                        trainee_id: t.trainee_id,
                                        status: edit?.status || t.attendance_status || AttendanceStatus.PRESENT, // default to present if unspecified
                                        notes: edit?.notes !== undefined ? edit.notes : (t.attendance_notes || ''),
                              };
                    });

                    try {
                              await recordMutation.mutateAsync({
                                        workshopId,
                                        payload: {
                                                  date: dateStr,
                                                  records
                                        }
                              });
                              setEdits({}); // Clear edits on success
                              toast.success('تم حفظ سجل الحضور بنجاح / Attendance saved successfully');
                    } catch (e) {
                              toast.error('حدث خطأ أثناء حفظ الحضور / Error saving attendance');
                    }
          };

          const trainees = attendanceData?.data || [];
          const hasChanges = Object.keys(edits).length > 0;

          return (
                    <Card sx={{ mb: 3 }}>
                              <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                                                  <Box>
                                                            <Typography variant="h6" fontWeight={700}>
                                                                      {t('attendance.manage') || 'تسجيل الحضور اليومي / Daily Attendance Manager'}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                      Record attendance for trainees confirmed for this workshop.
                                                            </Typography>
                                                  </Box>
                                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                      label="Select Session Date / يوم الجلسة"
                                                                      value={selectedDate}
                                                                      onChange={(newValue) => {
                                                                                if (newValue) {
                                                                                          setSelectedDate(newValue);
                                                                                          setEdits({}); // Clear edits when changing dates
                                                                                }
                                                                      }}
                                                                      sx={{ width: 220, bgcolor: 'background.paper' }}
                                                                      slotProps={{ textField: { size: 'small' } }}
                                                            />
                                                  </LocalizationProvider>
                                        </Box>

                                        {isLoading ? (
                                                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                                            <CircularProgress />
                                                  </Box>
                                        ) : trainees.length === 0 ? (
                                                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.default', borderRadius: 2 }}>
                                                            <Typography color="text.secondary">لا يوجد متدربين مؤكدين لهذه الورشة / No confirmed trainees found.</Typography>
                                                  </Box>
                                        ) : (
                                                  <>
                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                                                      <Button startIcon={<DoneAll />} size="small" onClick={markAllPresent} sx={{ mr: 2, color: 'success.main' }}>
                                                                                الجميع حاضر / Mark All Present
                                                                      </Button>
                                                                      <Button
                                                                                startIcon={<SaveIcon />}
                                                                                variant="contained"
                                                                                color="primary"
                                                                                onClick={saveAttendance}
                                                                                disabled={recordMutation.isPending || !hasChanges}
                                                                                sx={{ px: 4, borderRadius: 2 }}
                                                                      >
                                                                                {recordMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات / Save Changes'}
                                                                      </Button>
                                                            </Box>

                                                            <Box sx={{ overflowX: 'auto', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                                                                      <Table size="medium">
                                                                                <TableHead sx={{ bgcolor: 'background.default' }}>
                                                                                          <TableRow>
                                                                                                    <TableCell sx={{ fontWeight: 600 }}>المتدرب / Trainee</TableCell>
                                                                                                    <TableCell sx={{ fontWeight: 600 }}>الحالة / Status</TableCell>
                                                                                                    <TableCell sx={{ fontWeight: 600 }}>ملاحظات / Notes</TableCell>
                                                                                          </TableRow>
                                                                                </TableHead>
                                                                                <TableBody>
                                                                                          {trainees.map(t => {
                                                                                                    const currentEdit = edits[t.trainee_id];
                                                                                                    // Ensure status is tied to the current selected date via DB response, or the temporary edit.
                                                                                                    const status = currentEdit?.status || t.attendance_status || '';
                                                                                                    const notes = currentEdit?.notes !== undefined ? currentEdit.notes : (t.attendance_notes || '');

                                                                                                    return (
                                                                                                              <TableRow key={t.trainee_id} hover>
                                                                                                                        <TableCell>
                                                                                                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                                                                                            <Avatar src={getImageUrl(t.profile_image)} sx={{ width: 40, height: 40 }} />
                                                                                                                                            <Box>
                                                                                                                                                      <Typography variant="body2" fontWeight={600}>{t.full_name}</Typography>
                                                                                                                                                      <Typography variant="caption" color="text.secondary">{t.email}</Typography>
                                                                                                                                            </Box>
                                                                                                                                  </Box>
                                                                                                                        </TableCell>
                                                                                                                        <TableCell>
                                                                                                                                  <Select
                                                                                                                                            size="small"
                                                                                                                                            value={status}
                                                                                                                                            displayEmpty
                                                                                                                                            onChange={(e) => handleStatusChange(t.trainee_id, e.target.value as AttendanceStatus)}
                                                                                                                                            sx={{
                                                                                                                                                      minWidth: 140,
                                                                                                                                                      bgcolor: status === AttendanceStatus.PRESENT ? alpha(theme.palette.success.main, 0.1) :
                                                                                                                                                                status === AttendanceStatus.ABSENT ? alpha(theme.palette.error.main, 0.1) :
                                                                                                                                                                          status === AttendanceStatus.EXCUSED ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
                                                                                                                                                      '& .MuiSelect-select': {
                                                                                                                                                                color: status === AttendanceStatus.PRESENT ? theme.palette.success.dark :
                                                                                                                                                                          status === AttendanceStatus.ABSENT ? theme.palette.error.dark :
                                                                                                                                                                                    status === AttendanceStatus.EXCUSED ? theme.palette.warning.dark : 'inherit',
                                                                                                                                                                fontWeight: status ? 600 : 400
                                                                                                                                                      }
                                                                                                                                            }}
                                                                                                                                  >
                                                                                                                                            <MenuItem value="" disabled>Select...</MenuItem>
                                                                                                                                            <MenuItem value={AttendanceStatus.PRESENT}>حاضر / Present</MenuItem>
                                                                                                                                            <MenuItem value={AttendanceStatus.ABSENT}>غائب / Absent</MenuItem>
                                                                                                                                            <MenuItem value={AttendanceStatus.EXCUSED}>بعذر / Excused</MenuItem>
                                                                                                                                  </Select>
                                                                                                                        </TableCell>
                                                                                                                        <TableCell>
                                                                                                                                  <TextField
                                                                                                                                            size="small"
                                                                                                                                            placeholder="Optional reason..."
                                                                                                                                            value={notes}
                                                                                                                                            onChange={(e) => handleNotesChange(t.trainee_id, e.target.value)}
                                                                                                                                            fullWidth
                                                                                                                                            sx={{ bgcolor: 'background.paper' }}
                                                                                                                                  />
                                                                                                                        </TableCell>
                                                                                                              </TableRow>
                                                                                                    );
                                                                                          })}
                                                                                </TableBody>
                                                                      </Table>
                                                            </Box>
                                                  </>
                                        )}
                              </CardContent>
                    </Card>
          );
}
