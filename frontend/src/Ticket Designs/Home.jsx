import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";

const Home = () => {
  const [isProfileClicked, setIsProfileClicked] = useState(false);

  const handleCardClick = (title) => {
    console.log(`${title} card clicked`);

    if (title === "Troubleshooting") {
      window.location.href = "/troubleshooting"; // Redirect to Trouble.jsx
    }
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
    setIsProfileClicked(true);
    setTimeout(() => setIsProfileClicked(false), 200);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding={6}
      sx={{
        position: "relative",
        backgroundImage: 'url("/backgroundlogin.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          cursor: "pointer",
          zIndex: 3,
          transition: "transform 0.2s ease-in-out",
          transform: isProfileClicked ? "scale(1.2)" : "scale(1)",
        }}
        onClick={handleProfileClick}
      >
        <img
          src="/admin.png"
          alt="Profile"
          width={30}
          height={30}
          style={{ borderRadius: "50%" }}
        />
      </Box>

      <Box
        sx={{
          backgroundColor: "white",
          padding: 4,
          borderRadius: 2,
          boxShadow: 10,
          border: "2px solid black",
          mt: 3,
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 1000, // Updated max width
          minHeight: 300, // Set a minimum height
          width: "100%", // Full width for smaller screens
        }}
      >
        <Typography
          variant="h4"
          fontSize={30}
          fontWeight="light"
          gutterBottom
          fontFamily="Poppins"
          marginTop={2.5}
        >
          Division Office of Imus City Help Desk
        </Typography>

        {/* Grid layout for cards */}
        <Grid
          container
          spacing={3} // Add gap between cards
          justifyContent="center"
          direction="row" // Set the direction to row for side-by-side
        >
          {/* First Row: Troubleshooting, Upload Documents, Technical Assistance */}
          <Grid item xs={12} sm={4} md={3}>
            <Card
              sx={{
                height: 150, // Reduced card height
                width: 270,
                padding: 2,
                boxShadow: 5,
                border: "1px solid black",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto", // Centering cards
              }}
              onClick={() => handleCardClick("Troubleshooting")}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <img
                  src="/trouble.png"
                  alt="Troubleshooting"
                  width={40}
                  height={40}
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="h6" fontWeight="bold   " gutterBottom fontFamily="Poppins">
                  Troubleshooting
                </Typography>
                <Typography variant="body2" color="text.secondary" fontStyle="italic" fontFamily="Poppins">
                  Submit a ticket to resolve an issue.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Card
              sx={{
                height: 150, // Reduced card height
                width: 270,
                padding: 2,
                boxShadow: 5,
                border: "1px solid black",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => handleCardClick("Upload Documents")}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <img
                  src="/uplud.png"
                  alt="Upload Documents"
                  width={40}
                  height={40}
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="h6" fontWeight="bold" gutterBottom fontFamily="Poppins">
                  Upload Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" fontStyle="italic" fontFamily="Poppins">
                  Upload documents to your account.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Card
              sx={{
                height: 150, // Reduced card height
                width: 270,
                padding: 2,
                boxShadow: 5,
                border: "1px solid black",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => handleCardClick("Technical Assistance")}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <img
                  src="/tech.png"
                  alt="Technical Assistance"
                  width={40}
                  height={40}
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="h6" fontWeight="bold" gutterBottom fontFamily="Poppins">
                  Technical Assistance
                </Typography>
                <Typography variant="body2" color="text.secondary" fontStyle="italic" fontFamily="Poppins">
                  Get help with technical problems.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Second Row: Account Management */}
          <Grid item xs={12} sm={4} md={3}>
            <Card
              sx={{
                height: 150, // Reduced card height
                width: 270,
                padding: 2,
                boxShadow: 5,
                border: "1px solid black",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => handleCardClick("Account Management")}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <img
                  src="/account.png"
                  alt="Account Management"
                  width={40}
                  height={40}
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="h6" fontWeight="bold" gutterBottom fontFamily="Poppins">
                  Account Management
                </Typography>
                <Typography variant="body2" color="text.secondary" fontStyle="italic" fontFamily="Poppins">
                  Manage your account settings and preferences.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box component="footer" textAlign="center" mt={5} py={2} width="100%" sx={{ position: "relative", zIndex: 1 }}>
        <Typography variant="body2" color="text.secondary" fontStyle="italic" fontWeight={600} fontFamily="Poppins">
          &copy; 2025 Division Office of Imus City. All rights reserved.
        </Typography>
      </Box>

      <Box sx={{ position: "absolute", bottom: 30, right: 20, display: "flex", gap: 2, zIndex: 2 }}>
        <img src="/lugo1.png" alt="lugo1" width={90} height={90} style={{ borderRadius: "50%" }} />
        <img src="/lugo2.png" alt="lugo2" width={90} height={90} style={{ borderRadius: "50%" }} />
      </Box>
    </Box>
  );
};

export default Home;
