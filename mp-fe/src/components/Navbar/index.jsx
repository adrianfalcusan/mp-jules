import React, { useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useTheme, styled } from "@mui/system";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AuthModal from "../AuthModal";
import LoginForm from "../LoginForm";
import SignupForm from "../SignupForm";

// Navigation routes configuration
const routes = [
  { label: "Home", link: "/", authOnly: false, icon: <HomeIcon /> },
  { label: "Catalog", link: "/catalog", authOnly: false, icon: <SchoolIcon /> },
  {
    label: "Dashboard",
    link: "/dashboard",
    authOnly: true,
    icon: <DashboardIcon />,
    roleFilter: ["student", "teacher", "admin"],
  },
  {
    label: "Purchases",
    link: "/profile#purchases",
    authOnly: true,
    icon: <PersonIcon />,
    roleFilter: ["student", "teacher", "admin"],
  },
  {
    label: "Teacher",
    link: "/teacher-dashboard",
    authOnly: true,
    icon: <SchoolIcon />,
    roleFilter: ["teacher", "admin"],
  },
  {
    label: "Admin",
    link: "/admin-dashboard",
    authOnly: true,
    icon: <SettingsIcon />,
    roleFilter: ["admin"],
  },
];

// Styled components
const StyledAppBar = styled(AppBar)(() => ({
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
}));

const Brand = styled(Typography)(() => ({
  fontWeight: 800,
  letterSpacing: 2,
  cursor: "pointer",
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  fontSize: "1.5rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const NavButton = styled(Button)(() => ({
  textTransform: "none",
  fontWeight: 600,
  color: "#f8fafc",
  borderRadius: "12px",
  padding: "8px 20px",
  margin: "0 4px",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
    zIndex: -1,
  },
  "&:hover": {
    transform: "translateY(-2px)",
    "&::before": {
      opacity: 0.2,
    },
  },
}));

const AuthButton = styled(Button)(({ variant }) => ({
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "12px",
  padding: "10px 24px",
  transition: "all 0.3s ease",
  ...(variant === "outlined" && {
    color: "#f8fafc",
    borderColor: "rgba(255, 255, 255, 0.3)",
    "&:hover": {
      borderColor: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      transform: "translateY(-2px)",
    },
  }),
  ...(variant === "contained" && {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(99, 102, 241, 0.6)",
    },
  }),
}));

const StyledDrawer = styled(Drawer)(() => ({
  "& .MuiDrawer-paper": {
    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    backdropFilter: "blur(20px)",
    borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
    width: "320px",
  },
}));

const MobileMenuButton = styled(IconButton)(() => ({
  position: "fixed",
  top: 16,
  right: 16,
  zIndex: 2000,
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "#f8fafc",
  "&:hover": {
    background:
      "linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)",
    transform: "scale(1.05)",
  },
}));

const Navbar = () => {
  // Hooks
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Event handlers
  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    setDrawerOpen(false);
    setAnchorEl(null);
  }, [logout, navigate]);

  const handleBrandClick = useCallback(() => {
    navigate("/");
    setDrawerOpen(false);
  }, [navigate]);

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleCloseModals = useCallback(() => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  }, []);

  const handleNavigationClick = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleProfileMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleProfileMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Helper function to render navigation button
  const renderNavButton = useCallback(
    (route) => (
      <NavButton
        key={route.label}
        component={RouterLink}
        to={route.link}
        onClick={handleNavigationClick}
        startIcon={route.icon}
      >
        {route.label}
      </NavButton>
    ),
    [handleNavigationClick]
  );

  // Filter routes based on authentication status and user role
  const visibleRoutes = routes.filter((route) => {
    // If route requires auth and user is not authenticated, hide it
    if (route.authOnly && !isAuthenticated) return false;

    // If route has role filter, check if user has required role
    if (route.roleFilter && user) {
      return route.roleFilter.includes(user.role);
    }

    // Show route if no role filter or user meets criteria
    return true;
  });

  // Desktop navigation component
  const DesktopNav = () => (
    <StyledAppBar position="fixed" elevation={0}>
      <Toolbar sx={{ py: 1 }}>
        {/* Brand */}
        <Brand variant="h6" onClick={handleBrandClick} sx={{ mr: 4 }}>
          MUSICLOUD
        </Brand>

        {/* Navigation links */}
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          {visibleRoutes.map(renderNavButton)}
        </Box>

        {/* Authentication section */}
        {isAuthenticated ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ color: "#cbd5e1", mr: 1 }}>
              Welcome, {user?.name}
            </Typography>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0.5,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#6366f1",
                  transform: "scale(1.05)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  mt: 1,
                  minWidth: 180,
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  handleProfileMenuClose();
                }}
                sx={{
                  color: "#f8fafc",
                  "&:hover": { backgroundColor: "rgba(99, 102, 241, 0.1)" },
                }}
              >
                <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate("/dashboard");
                  handleProfileMenuClose();
                }}
                sx={{
                  color: "#f8fafc",
                  "&:hover": { backgroundColor: "rgba(99, 102, 241, 0.1)" },
                }}
              >
                <DashboardIcon sx={{ mr: 1, fontSize: 18 }} />
                Dashboard
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate("/settings");
                  handleProfileMenuClose();
                }}
                sx={{
                  color: "#f8fafc",
                  "&:hover": { backgroundColor: "rgba(99, 102, 241, 0.1)" },
                }}
              >
                <SettingsIcon sx={{ mr: 1, fontSize: 18 }} />
                Settings
              </MenuItem>
              <Divider
                sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 1 }}
              />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "#f87171",
                  "&:hover": { backgroundColor: "rgba(248, 113, 113, 0.1)" },
                }}
              >
                <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 2 }}>
            <AuthButton
              variant="outlined"
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </AuthButton>
            <AuthButton
              variant="contained"
              onClick={() => setShowSignupModal(true)}
            >
              Sign Up
            </AuthButton>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );

  // Mobile navigation component
  const MobileNav = () => (
    <>
      {/* Menu button */}
      <MobileMenuButton onClick={handleDrawerToggle}>
        <MenuIcon />
      </MobileMenuButton>

      {/* Drawer */}
      <StyledDrawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Brand variant="h6" onClick={handleBrandClick}>
            MUSICLOUD
          </Brand>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: "#f8fafc",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Navigation links */}
        <List sx={{ p: 2, flex: 1 }}>
          {visibleRoutes.map((route) => (
            <ListItem
              key={route.label}
              component={RouterLink}
              to={route.link}
              onClick={handleNavigationClick}
              sx={{
                borderRadius: "12px",
                mb: 1,
                color: "#f8fafc",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  transform: "translateX(8px)",
                },
              }}
            >
              <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                {route.icon}
              </Box>
              <ListItemText
                primary={route.label}
                primaryTypographyProps={{
                  variant: "body1",
                  sx: { fontWeight: 600 },
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Authentication section */}
        <Box sx={{ p: 3, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          {isAuthenticated ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#f8fafc", fontWeight: 600 }}
                  >
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
              <AuthButton
                fullWidth
                variant="outlined"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
              >
                Logout
              </AuthButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <AuthButton
                fullWidth
                variant="outlined"
                onClick={() => {
                  setShowLoginModal(true);
                  setDrawerOpen(false);
                }}
              >
                Login
              </AuthButton>
              <AuthButton
                fullWidth
                variant="contained"
                onClick={() => {
                  setShowSignupModal(true);
                  setDrawerOpen(false);
                }}
              >
                Sign Up
              </AuthButton>
            </Box>
          )}
        </Box>
      </StyledDrawer>
    </>
  );

  // Render
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {isDesktop ? <DesktopNav /> : <MobileNav />}

      {/* Authentication Modals */}
      <AuthModal
        open={showLoginModal}
        onClose={handleCloseModals}
        title="Sign In"
      >
        <LoginForm onClose={handleCloseModals} />
      </AuthModal>

      <AuthModal
        open={showSignupModal}
        onClose={handleCloseModals}
        title="Create Account"
      >
        <SignupForm onClose={handleCloseModals} />
      </AuthModal>
    </motion.div>
  );
};

export default Navbar;
