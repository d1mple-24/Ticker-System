import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const documentTypes = [
  'Memorandum',
  'Official Letter',
  'Report',
  'Form',
  'Certificate',
  'Other',
];

function DocumentUpload() {
  const [files, setFiles] = useState([]);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please select at least one file to upload.',
      });
      return;
    }
    if (!documentType) {
      setMessage({
        type: 'error',
        text: 'Please select a document type.',
      });
      return;
    }

    // This would normally make an API call to upload the files
    setMessage({
      type: 'success',
      text: 'Documents uploaded successfully.',
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Document Upload
      </Typography>

      <Paper sx={{ p: 4 }}>
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                backgroundColor: 'background.default',
                cursor: 'pointer',
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                type="file"
                id="file-input"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drag and drop files here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select files
              </Typography>
            </Box>

            {files.length > 0 && (
              <List>
                {files.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <FileIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            <TextField
              select
              required
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              {documentTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              multiline
              rows={4}
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter any additional information about the documents..."
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={files.length === 0}
            >
              Upload Documents
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default DocumentUpload; 