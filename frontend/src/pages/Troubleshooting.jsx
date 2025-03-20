import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

const Troubleshooting = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    dateOfRequest: new Date().toISOString().split('T')[0],
    typeOfEquipment: '',
    modelOfEquipment: '',
    serialNo: '',
    specificProblem: '',
    customEquipmentType: '',
    customModel: '',
  });
  const [message, setMessage] = useState(null);

  const equipmentModels = {
    Desktop: [
      'Acer Aspire',
      'HP ProDesk',
      'Lenovo ThinkCentre',
      'Dell OptiPlex',
      'ASUS VivoPC',
      'MSI Pro',
      'Intel NUC',
      'Other'
    ],
    Laptop: [
      'Acer Swift',
      'HP Pavilion',
      'Lenovo ThinkPad',
      'Dell XPS',
      'ASUS ZenBook',
      'MSI Modern',
      'MacBook Pro',
      'MacBook Air',
      'Other'
    ],
    Printer: [
      'HP LaserJet',
      'Canon PIXMA',
      'Epson WorkForce',
      'Brother HL',
      'Xerox VersaLink',
      'Lexmark',
      'Samsung Xpress',
      'Other'
    ],
    Scanner: [
      'Epson V39',
      'Canon DR',
      'HP ScanJet',
      'Brother ADS',
      'Fujitsu ScanSnap',
      'Kodak i2600',
      'Plustek',
      'Other'
    ],
    Others: []
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset model when equipment type changes
      ...(name === 'typeOfEquipment' && { modelOfEquipment: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalModelOfEquipment = formData.modelOfEquipment === 'Other' ? formData.customModel : formData.modelOfEquipment;
      
      await axios.post('http://localhost:5000/api/tickets', {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        dateOfRequest: formData.dateOfRequest,
        typeOfEquipment: formData.typeOfEquipment === 'Others' ? formData.customEquipmentType : formData.typeOfEquipment,
        modelOfEquipment: finalModelOfEquipment,
        serialNo: formData.serialNo,
        specificProblem: formData.specificProblem
      });

      setMessage({
        type: 'success',
        text: 'Your support request has been submitted successfully. Our IT team will contact you through the provided email.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        department: '',
        dateOfRequest: new Date().toISOString().split('T')[0],
        typeOfEquipment: '',
        modelOfEquipment: '',
        serialNo: '',
        specificProblem: '',
        customEquipmentType: '',
        customModel: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to submit ticket. Please try again.',
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        IT Support Request Form
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              required
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              required
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={formData.department}
                onChange={handleChange}
                label="Department"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      width: '60%'
                    },
                  },
                }}
              >
                <MenuItem value="Information and Communications Technology Unit">Information and Communications Technology Unit</MenuItem>
                <MenuItem value="Administrative Service - Personnel Unit">Administrative Service - Personnel Unit</MenuItem>
                <MenuItem value="Administrative Service - Records Unit">Administrative Service - Records Unit</MenuItem>
                <MenuItem value="Administrative Service - Cash Unit">Administrative Service - Cash Unit</MenuItem>
                <MenuItem value="Administrative Service - Proper">Administrative Service - Proper</MenuItem>
                <MenuItem value="Finance Services - Budget Unit">Finance Services - Budget Unit</MenuItem>
                <MenuItem value="Finance Services - Accounting Unit">Finance Services - Accounting Unit</MenuItem>
                <MenuItem value="Legal Services Unit">Legal Services Unit</MenuItem>
                <MenuItem value="Curriculum Implementation Division (CID) - ALS">Curriculum Implementation Division (CID) - ALS</MenuItem>
                <MenuItem value="Curriculum Implementation Division (CID) - Proper">Curriculum Implementation Division (CID) - Proper</MenuItem>
                <MenuItem value="Curriculum Implementation Division (CID) - Learning Resources">Curriculum Implementation Division (CID) - Learning Resources</MenuItem>
                <MenuItem value="School Governance and Operations Division (SGOD) - Planning and Research Section">School Governance and Operations Division (SGOD) - Planning and Research Section</MenuItem>
                <MenuItem value="School Governance and Operations Division (SGOD) - Human Resource Development">School Governance and Operations Division (SGOD) - Human Resource Development</MenuItem>
                <MenuItem value="School Governance and Operations Division (SGOD) - Social Mobilization and Networking">School Governance and Operations Division (SGOD) - Social Mobilization and Networking</MenuItem>
                <MenuItem value="School Governance and Operations Division (SGOD) - School Management Monitoring and Evaluation">School Governance and Operations Division (SGOD) - School Management Monitoring and Evaluation</MenuItem>
                <MenuItem value="School Governance and Operations Division (SGOD) - Education Facilities">School Governance and Operations Division (SGOD) - Education Facilities</MenuItem>
                <MenuItem value="School Governance and Operations Division (SGOD) - DRRM">School Governance and Operations Division (SGOD) - DRRM</MenuItem>
                <MenuItem value="School Governance and Operations Division (SGOD) - YFD">School Governance and Operations Division (SGOD) - YFD</MenuItem>
                <MenuItem value="School Governance and Operations Division (SGOD) - Main">School Governance and Operations Division (SGOD) - Main</MenuItem>
                <MenuItem value="Office of the Schools Division Superintendent (OSDS)">Office of the Schools Division Superintendent (OSDS)</MenuItem>
                <MenuItem value="Office of the Assistant Schools Division Superintendent (OASDS)">Office of the Assistant Schools Division Superintendent (OASDS)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              label="Date of Request"
              name="dateOfRequest"
              type="date"
              value={formData.dateOfRequest}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl fullWidth required>
              <InputLabel>Type of Equipment</InputLabel>
              <Select
                name="typeOfEquipment"
                value={formData.typeOfEquipment}
                onChange={handleChange}
                label="Type of Equipment"
              >
                <MenuItem value="Desktop">Desktop</MenuItem>
                <MenuItem value="Laptop">Laptop</MenuItem>
                <MenuItem value="Printer">Printer</MenuItem>
                <MenuItem value="Scanner">Scanner</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>

            {formData.typeOfEquipment === 'Others' ? (
              <TextField
                fullWidth
                required
                name="customEquipmentType"
                label="Specify Equipment Type"
                value={formData.customEquipmentType || ''}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            ) : null}

            <FormControl fullWidth required sx={{ mt: 2 }}>
              {formData.typeOfEquipment === 'Others' ? (
                <TextField
                  fullWidth
                  required
                  name="modelOfEquipment"
                  label="Specify Equipment Model"
                  value={formData.modelOfEquipment || ''}
                  onChange={handleChange}
                />
              ) : (
                <>
                  <InputLabel>Model of Equipment</InputLabel>
                  <Select
                    name="modelOfEquipment"
                    value={formData.modelOfEquipment}
                    onChange={handleChange}
                    label="Model of Equipment"
                  >
                    {(equipmentModels[formData.typeOfEquipment] || []).map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}
              {formData.modelOfEquipment === 'Other' && formData.typeOfEquipment !== 'Others' && (
                <TextField
                  fullWidth
                  required
                  name="customModel"
                  label="Specify Other Model"
                  value={formData.customModel}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                />
              )}
            </FormControl>

            <TextField
              required
              label="Serial No."
              name="serialNo"
              value={formData.serialNo}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              required
              multiline
              rows={4}
              label="Specific Problem"
              name="specificProblem"
              value={formData.specificProblem}
              onChange={handleChange}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
            >
              Submit Support Request
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Troubleshooting; 