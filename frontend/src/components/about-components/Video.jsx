import React from "react";
import { Box, Typography, Container } from "@mui/material";

const Video = () => {
  return (
    <Box sx={{
      py: 6,
      background: '#0f0f0f',
    }}>
      <Typography
        variant="h3"
        align="center"
        sx={{
          fontWeight: "bold",
          mb: 4,
          fontFamily: "ubuntu",
          color: "#4da6a8",
        }}
      >
        See It in Action
      </Typography>
      <Typography
        variant="body1"
        align="center"
        sx={{ 
          mb: 4, 
          fontSize: "1.1rem", 
          color: "#8db8b9"
        }}
      >
        Watch the video below to understand how our website works and how to use it!
      </Typography>
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        p: 3
      }}>
        <Box
          component="video"
          sx={{
            width: "100%",
            maxWidth: "900px",
            height: "auto",
            borderRadius: "15px",
            backgroundColor: "#1a1a1a",
          }}
          controls
        >
          <source src="/forestfire1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </Box>
      </Box>
    </Box>
  );
};

export default Video;