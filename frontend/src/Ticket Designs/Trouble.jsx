import React, { useState } from "react";
import {
    TextField, MenuItem, Button, Typography,
    Container, Paper, IconButton, Box
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Trouble = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        location: "",
        date: "",
        equipmentType: "",
        model: "",
        serialNo: "",
        priority: "",
        description: "",
    });

    const priorityLevels = [
        "Low",
        "Medium",
        "High",
        "Critical",
    ];

    const locations = [
        "SDO - Imus City",
        "Schools - Imus City",
    ];

    const equipmentModels = [
        "Model A",
        "Model B",
        "Model C",
        "Model D",
    ];

    const equipmentTypes = [
        "Computer",
        "Printer",
        "Scanner",
        "Other",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (window.confirm("Are you sure you want to submit this issue?")) {
            console.log("Form Data:", formData);
            alert("✅ Your issue has been successfully submitted! Our IT team will get back to you soon.");
            setFormData({
                name: "", email: "", location: "", date: "", equipmentType: "",
                model: "", serialNo: "", priority: "", description: "",
            });
        }
    };

    const goBackToHome = () => {
        window.location.href = "/";
    };

    return (
        <Box
            sx={{
                minHeight: "100vh", // Ensure the background covers the full page height
                backgroundColor: "lightblue",
                backgroundSize: "cover", // Make the image cover the entire container
                backgroundPosition: "center", // Center the background image
                backgroundRepeat: "no-repeat", // Prevent the image from repeating
                display: "flex", // Center the content
                justifyContent: "center",
                alignItems: "center",
                position: "relative", // Enable absolute positioning inside
            }}
        >
            {/* Admin Profile Picture */}
            <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    overflow: "hidden",
                    
                }}
            >
                <img
                    src="/admin.png"
                    alt="Profile"
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%" }}
                />
            </Box>

            <Container maxWidth="md" sx={{ padding: 2 }}>
                <Paper elevation={5} sx={{ padding: 4, borderRadius: 3, mt: 5, position: "relative" }}>

                    {/* Back to Home Button */}
                    <IconButton
                        onClick={goBackToHome}
                        sx={{ position: "absolute", top: 10, left: 10, color: "black" }}
                    >
                        <ArrowBackIcon fontSize="large" />
                    </IconButton>

                    <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
                        IT Support Form
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        {/* Personal Information Section */}
                        <Typography variant="h6" fontWeight="bold" mt={2}>
                            Personal Information
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ width: "50%" }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                />
                            </Box>
                            <Box sx={{ width: "50%" }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                />
                            </Box>
                        </Box>

                        {/* Request Details Section */}
                        <Typography variant="h6" fontWeight="bold" mt={2}>
                            Request Details
                        </Typography>

                        {/* Location Dropdown */}
                        <TextField
                            select
                            fullWidth
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            margin="normal"
                        >
                            {locations.map((loc, index) => (
                                <MenuItem key={index} value={loc}>
                                    {loc}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ width: "50%" }}>
                                <TextField
                                    fullWidth
                                    label="Date of Request"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>
                            <Box sx={{ width: "50%" }}>
                                <TextField
                                    fullWidth
                                    label="Type of Equipment"
                                    name="equipmentType"
                                    value={formData.equipmentType}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                    select
                                >
                                    {equipmentTypes.map((type, index) => (
                                        <MenuItem key={index} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ width: "50%" }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Model of Equipment"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                >
                                    {equipmentModels.map((model, index) => (
                                        <MenuItem key={index} value={model}>
                                            {model}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                            <Box sx={{ width: "50%" }}>
                                <TextField
                                    type="number"
                                    fullWidth
                                    label="Serial No."
                                    name="serialNo"
                                    value={formData.serialNo}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                />
                            </Box>
                        </Box>

                        {/* Priority Level Dropdown */}
                        <TextField
                            select
                            fullWidth
                            label="Priority Level"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            required
                            margin="normal"
                        >
                            {priorityLevels.map((level, index) => (
                                <MenuItem key={index} value={level}>
                                    {level}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Specific Problem"
                            name="description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />

                        {/* Submit Button */}
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
                            Submit
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default Trouble;
