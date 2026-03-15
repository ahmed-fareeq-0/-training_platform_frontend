import { useState, useRef } from 'react';
import { Box, Button, Typography, IconButton, CircularProgress, alpha, useTheme } from '@mui/material';
import { CloudUpload, Close, InsertDriveFile } from '@mui/icons-material';

interface FileUploaderProps {
          accept?: string;
          multiple?: boolean;
          maxSizeMB?: number;
          isLoading?: boolean;
          progress?: number;
          onUpload: (files: File[]) => void;
}

export default function FileUploader({
          accept = '*/*',
          multiple = false,
          maxSizeMB = 5,
          isLoading = false,
          progress = 0,
          onUpload
}: FileUploaderProps) {
          const theme = useTheme();
          const fileInputRef = useRef<HTMLInputElement>(null);
          const [dragActive, setDragActive] = useState(false);
          const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
          const [error, setError] = useState<string | null>(null);

          const handleDrag = (e: React.DragEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.type === 'dragenter' || e.type === 'dragover') {
                              setDragActive(true);
                    } else if (e.type === 'dragleave') {
                              setDragActive(false);
                    }
          };

          const validateFiles = (files: File[]) => {
                    const validFiles: File[] = [];
                    const maxSize = maxSizeMB * 1024 * 1024;
                    setError(null);

                    for (const file of files) {
                              if (file.size > maxSize) {
                                        setError(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
                                        continue;
                              }
                              validFiles.push(file);
                    }

                    if (validFiles.length > 0) {
                              if (multiple) {
                                        setSelectedFiles(prev => [...prev, ...validFiles]);
                              } else {
                                        setSelectedFiles([validFiles[0]]);
                              }
                    }
          };

          const handleDrop = (e: React.DragEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              validateFiles(Array.from(e.dataTransfer.files));
                    }
          };

          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    e.preventDefault();
                    if (e.target.files && e.target.files[0]) {
                              validateFiles(Array.from(e.target.files));
                    }
          };

          const removeFile = (index: number) => {
                    setSelectedFiles(files => files.filter((_, i) => i !== index));
          };

          const handleUploadClick = () => {
                    if (selectedFiles.length > 0) {
                              onUpload(selectedFiles);
                    }
          };

          return (
                    <Box sx={{ width: '100%' }}>
                              <Box
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{
                                                  border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
                                                  borderRadius: 2,
                                                  p: 4,
                                                  textAlign: 'center',
                                                  bgcolor: dragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                                  cursor: 'pointer',
                                                  transition: 'all 0.2s ease',
                                                  '&:hover': {
                                                            borderColor: theme.palette.primary.main,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                  }
                                        }}
                              >
                                        <input
                                                  ref={fileInputRef}
                                                  type="file"
                                                  accept={accept}
                                                  multiple={multiple}
                                                  onChange={handleChange}
                                                  style={{ display: 'none' }}
                                        />
                                        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                                  Drag & Drop files here or click to browse
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                                  Max file size: {maxSizeMB}MB. Supported: {accept}
                                        </Typography>
                              </Box>

                              {error && (
                                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
                              )}

                              {selectedFiles.length > 0 && (
                                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                  {selectedFiles.map((file, idx) => (
                                                            <Box key={idx} sx={{
                                                                      display: 'flex', alignItems: 'center', p: 1.5,
                                                                      border: `1px solid ${theme.palette.divider}`, borderRadius: 1
                                                            }}>
                                                                      <InsertDriveFile sx={{ mr: 2, color: 'text.secondary' }} />
                                                                      <Box sx={{ flexGrow: 1 }}>
                                                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200, fontWeight: 600 }}>
                                                                                          {file.name}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                          {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                                </Typography>
                                                                      </Box>
                                                                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeFile(idx); }} disabled={isLoading}>
                                                                                <Close fontSize="small" />
                                                                      </IconButton>
                                                            </Box>
                                                  ))}

                                                  <Button
                                                            variant="contained"
                                                            onClick={handleUploadClick}
                                                            disabled={isLoading || selectedFiles.length === 0}
                                                            sx={{ mt: 2 }}
                                                  >
                                                            {isLoading ? (
                                                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                <CircularProgress size={20} color="inherit" />
                                                                                <Typography variant="button">Uploading {progress}%</Typography>
                                                                      </Box>
                                                            ) : 'Upload Selected Files'}
                                                  </Button>
                                        </Box>
                              )}
                    </Box>
          );
}
