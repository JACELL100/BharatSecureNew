import React, { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import logo from "/image.png";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const getActiveLink = () => {
    if (location.pathname === "/") return "/";
    return location.pathname;
  };

  const activeLink = getActiveLink();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleNavigation = (route) => {
    navigate(route);
  };

  const sideMenu = (
    <Box
      sx={{
        width: 250,
        height: "100%",
        backgroundColor: "#0f0f0f",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onClick={() => toggleDrawer(false)}
    >
      <List>
        {["/", "/About", "/Blogs"].map((route, index) => {
          const label = route.slice(1) || "Home";
          return (
            <ListItem
              button
              key={index}
              onClick={() => handleNavigation(route)}
              sx={{
                marginBottom: 1,
                borderRadius: 2,
                backgroundColor:
                  activeLink === route ? "#4da6a8" : "transparent",
                color: activeLink === route ? "#0f0f0f" : "#fff",
                "&:hover": {
                  backgroundColor: "#4da6a8",
                  color: "#0f0f0f",
                },
              }}
            >
              <ListItemText
                primary={label}
                sx={{ textAlign: "center", fontWeight: "bold" }}
              />
            </ListItem>
          );
        })}
        <ListItem
          button
          onClick={handleMenuClick}
          sx={{
            marginBottom: 1,
            borderRadius: 2,
            backgroundColor: "transparent",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#4da6a8",
              color: "#0f0f0f",
            },
          }}
        >
          <ListItemText primary="Features" sx={{ textAlign: "center" }} />
        </ListItem>
      </List>
      <Box sx={{ textAlign: "center", paddingTop: 2 }}>
        <Typography variant="caption" sx={{ color: "#4da6a8" }}>
          BharatSecure © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#0f0f0f",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        padding: "0 20px",
        "@media (max-width: 450px)": {
          padding: "0",
        },
      }}
    >
      <Container
        sx={{
          "@media (max-width: 450px)": {
            padding: "0",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            "@media (max-width: 450px)": {
              padding: "0",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => handleNavigation("/")}
              sx={{
                p: 1,
                "&:hover": {
                  backgroundColor: "rgba(77, 166, 168, 0.1)",
                },
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{ width: 40, height: 40, marginRight: 10, borderRadius:"50%" }}
              />
            </IconButton>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#4da6a8",
                  fontFamily: "Smooch Sans, sans-serif",
                  fontSize: "3rem",
                  "&:hover": {
                    color: "#3e8c8e",
                  },
                  "@media (max-width: 450px)": {
                    fontSize: "2rem",
                  },
                }}
              >
                BharatSecure
              </Typography>
            </Link>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            {["/", "/About", "/InciLog"].map((route, index) => {
              const label = route.slice(1) || "Home";
              return (
                <Button
                  key={index}
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                    margin: "0 20px",
                    borderBottom:
                      activeLink === route ? "2px solid #4da6a8" : "none",
                    "&:hover": {
                      color: "#4da6a8",
                      backgroundColor: "transparent",
                    },
                  }}
                  onClick={() => handleNavigation(route)}
                >
                  {label.toUpperCase()}
                </Button>
              );
            })}
            <Button
              sx={{
                color: "#fff",
                fontWeight: "bold",
                margin: "0 20px",
                borderBottom: [
                  "/report-incident",
                  "/heatmap",
                  "/voice-report",
                ].includes(activeLink)
                  ? "2px solid #4da6a8"
                  : "none",
                "&:hover": {
                  color: "#4da6a8",
                  backgroundColor: "transparent",
                },
              }}
              onMouseEnter={handleMenuClick}
              onMouseLeave={(event) => {
                const isOverMenu =
                  event.relatedTarget?.closest(".MuiMenu-root");
                if (!isOverMenu) handleMenuClose();
              }}
            >
              Features
            </Button>
          </Box>

          {!isLoggedIn ? (
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Button
                sx={{
                  color: "#4da6a8",
                  fontWeight: "bold",
                  border: "2px solid #4da6a8",
                  borderRadius: 3,
                  "&:hover": {
                    backgroundColor: "#4da6a8",
                    color: "#0f0f0f",
                  },
                }}
              >
                Login
              </Button>
            </Link>
          ) : (
            <Button
              sx={{
                color: "#4da6a8",
                fontWeight: "bold",
                border: "2px solid #4da6a8",
                borderRadius: 3,
                "&:hover": {
                  backgroundColor: "#4da6a8",
                  color: "#0f0f0f",
                },
              }}
              onClick={() => {
                const user_type = localStorage.getItem("userType");
                handleNavigation(
                  user_type === "user" ? "/my-reports" : "/admin"
                );
              }}
            >
              Dashboard
            </Button>
          )}

          <IconButton
            sx={{
              display: { xs: "block", md: "none" },
              color: "#4da6a8",
              "&:hover": {
                backgroundColor: "rgba(77, 166, 168, 0.1)",
              },
            }}
            onClick={() => toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{
          onMouseEnter: () => setAnchorEl(anchorEl),
          onMouseLeave: handleMenuClose,
        }}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#0f0f0f",
            borderRadius: 2,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
            minWidth: 180,
          },
          "& .MuiMenuItem-root": {
            padding: "10px 20px",
            fontSize: "1rem",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#4da6a8",
              color: "#0f0f0f",
              fontWeight: "bold",
            },
          },
        }}
      >
        {[
          { route: "/report-incident", label: "Report Incident" },
          { route: "/heatmap", label: "Heatmaps" },
          { route: "/heatmap2", label: "Incident Type Heatmap" },
          { route: "/voice-report", label: "Voice Report" },
          { route: "/chatbot", label: "Saathi AI" },
          { route: "/upload", label: "VR Viewer" },
          { route: "/pothole", label: "Pothole Analyzer" },
          { route: "/video", label: "Video Analysis" },
          
        ].map((item) => (
          <MenuItem
            key={item.route}
            onClick={() => {
              handleNavigation(item.route);
              handleMenuClose();
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        {sideMenu}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;