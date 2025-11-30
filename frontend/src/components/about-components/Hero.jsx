import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { LightbulbOutlined } from "@mui/icons-material";

const Hero = ({ onLearnMore }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        height: "70vh",
        background: '#0f0f0f',
        backgroundImage: "url('https://cdn.pixabay.com/photo/2019/11/19/22/24/watch-4638673_640.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 15, 15, 0.75)",
          backdropFilter: "blur(5px)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 3, sm: 4, md: 6 },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mb: 2,
            fontFamily: "Ubuntu, sans-serif",
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            color: "#4da6a8",
          }}
        >
          About Us
        </Typography>

        <Typography
          variant="h6"
          sx={{
            maxWidth: "700px",
            margin: "0 auto",
            mb: 3,
            fontFamily: "Ubuntu, sans-serif",
            fontSize: { xs: "1rem", sm: "1.2rem" },
            color: "#8db8b9",
          }}
        >
          Our Incident Reporting and Response System is designed to ensure
          safety and quick action during critical situations. We empower users
          to report incidents through text or voice input, enabling faster
          responses and better monitoring through real-time analytics.
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 3,
          }}
        >
          <LightbulbOutlined
            sx={{
              color: "#4da6a8",
              fontSize: 45,
              mr: 2,
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              fontFamily: "Ubuntu, sans-serif",
              color: "#4da6a8",
            }}
          >
            Empowering Safety with Real-time Action
          </Typography>
        </Box>

        <Button
          onClick={onLearnMore}
          variant="contained"
          sx={{
            mt: 4,
            bgcolor: "#1a1a1a",
            color: "#4da6a8",
            fontWeight: "bold",
            fontSize: "1.1rem",
            borderRadius: "25px",
            padding: "12px 24px",
            border: '1px solid #4da6a8',
          }}
        >
          Explore Features
        </Button>
      </Box>
    </Box>
  );
};

export default Hero;