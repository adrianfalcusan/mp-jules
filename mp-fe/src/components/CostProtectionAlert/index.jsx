// src/components/CostProtectionAlert/index.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  Security,
  Speed,
  MonetizationOn,
  Upgrade,
} from "@mui/icons-material";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const CostProtectionAlert = ({
  show = false,
  message = "",
  currentTier = "free",
  onUpgrade,
  onClose,
}) => {
  const [open, setOpen] = useState(false);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (show) {
      setOpen(true);
      fetchUsageStats();
    }
  }, [show]);

  const fetchUsageStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users/usage-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUsage(response.data.usage);
      }
    } catch (error) {
      console.error("Failed to fetch usage stats:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const handleUpgrade = async (targetTier) => {
    setLoading(true);
    try {
      if (onUpgrade) {
        await onUpgrade(targetTier);
      }
      handleClose();
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const tierLimits = {
    free: { bandwidth: 1, uploads: 3, quality: "480p" },
    basic: { bandwidth: 50, uploads: 25, quality: "720p" },
    pro: { bandwidth: 200, uploads: 100, quality: "1080p" },
    premium: { bandwidth: 1000, uploads: 500, quality: "4K" },
  };

  const tierPricing = {
    basic: { price: 9, savings: "$84/month vs AWS" },
    pro: { price: 29, savings: "$271/month vs AWS" },
    premium: { price: 99, savings: "$901/month vs AWS" },
  };

  const getUsagePercentage = (used, limit) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "free":
        return "#9e9e9e";
      case "basic":
        return "#2196f3";
      case "pro":
        return "#9c27b0";
      case "premium":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  };

  if (!show && !open) {
    return null;
  }

  return (
    <>
      {/* Inline Alert */}
      {show && !open && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setOpen(true)}
              startIcon={<Upgrade />}
            >
              Upgrade
            </Button>
          }
          sx={{ mb: 2 }}
        >
          <AlertTitle>Cost Protection Active</AlertTitle>
          {message ||
            "Upload limits reached for your current plan. Upgrade to continue."}
        </Alert>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <Security
            sx={{ mr: 1, verticalAlign: "middle", color: "primary.main" }}
          />
          Smart Cost Protection
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
              Your current <strong>{currentTier}</strong> plan has reached its
              limits. Upgrade to continue with enhanced features and massive
              cost savings!
            </Typography>

            {/* Current Usage */}
            {usage && (
              <Card sx={{ mb: 3, bgcolor: "#f5f5f5" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Current Usage ({currentTier} plan)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Bandwidth Used
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getUsagePercentage(
                          usage.bandwidth || 0,
                          tierLimits[currentTier]?.bandwidth || 1
                        )}
                        sx={{ mb: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">
                        {usage.bandwidth || 0}GB /{" "}
                        {tierLimits[currentTier]?.bandwidth || 1}GB
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Uploads This Month
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getUsagePercentage(
                          usage.uploads || 0,
                          tierLimits[currentTier]?.uploads || 3
                        )}
                        sx={{ mb: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">
                        {usage.uploads || 0} /{" "}
                        {tierLimits[currentTier]?.uploads || 3} uploads
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Upgrade Options */}
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Choose Your Plan
            </Typography>

            <Grid container spacing={2}>
              {Object.entries(tierPricing).map(([tier, info]) => (
                <Grid item xs={12} sm={4} key={tier}>
                  <Card
                    sx={{
                      height: "100%",
                      border:
                        tier === "pro"
                          ? `2px solid ${getTierColor(tier)}`
                          : "1px solid #e0e0e0",
                      position: "relative",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-2px)",
                        transition: "all 0.2s ease",
                      },
                    }}
                  >
                    {tier === "pro" && (
                      <Chip
                        label="Most Popular"
                        color="primary"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: -10,
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 1,
                        }}
                      />
                    )}
                    <CardContent sx={{ textAlign: "center", p: 3 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          textTransform: "capitalize",
                          color: getTierColor(tier),
                          fontWeight: "bold",
                          mb: 1,
                        }}
                      >
                        {tier}
                      </Typography>

                      <Typography variant="h3" sx={{ mb: 1 }}>
                        ${info.price}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          /month
                        </Typography>
                      </Typography>

                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ mb: 2, fontWeight: "medium" }}
                      >
                        {info.savings}
                      </Typography>

                      <Box sx={{ textAlign: "left", mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • {tierLimits[tier]?.bandwidth}GB bandwidth
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • {tierLimits[tier]?.uploads} uploads/month
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Up to {tierLimits[tier]?.quality}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Global CDN delivery
                        </Typography>
                        {tier !== "basic" && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            • Priority support
                          </Typography>
                        )}
                        {tier === "premium" && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            • Custom branding
                          </Typography>
                        )}
                      </Box>

                      <Button
                        variant={tier === "pro" ? "contained" : "outlined"}
                        fullWidth
                        onClick={() => handleUpgrade(tier)}
                        disabled={loading}
                        sx={{
                          bgcolor:
                            tier === "pro" ? getTierColor(tier) : "transparent",
                          borderColor: getTierColor(tier),
                          color: tier === "pro" ? "white" : getTierColor(tier),
                          "&:hover": {
                            bgcolor: getTierColor(tier),
                            color: "white",
                          },
                        }}
                      >
                        {currentTier === tier
                          ? "Current Plan"
                          : `Upgrade to ${tier}`}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Benefits Banner */}
            <Card
              sx={{
                mt: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                  <MonetizationOn sx={{ mr: 1, verticalAlign: "middle" }} />
                  Why Upgrade to Bunny CDN?
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Speed sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">93% Savings</Typography>
                      <Typography variant="body2">vs AWS CloudFront</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">Global CDN</Typography>
                      <Typography variant="body2">
                        114+ locations worldwide
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Security sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">Smart Protection</Typography>
                      <Typography variant="body2">
                        Automatic cost monitoring
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">
            Maybe Later
          </Button>
          <Button
            onClick={() => handleUpgrade("pro")}
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              minWidth: 120,
            }}
          >
            {loading ? "Processing..." : "Upgrade Now"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

CostProtectionAlert.propTypes = {
  show: PropTypes.bool,
  message: PropTypes.string,
  currentTier: PropTypes.string,
  onUpgrade: PropTypes.func,
  onClose: PropTypes.func,
};

export default CostProtectionAlert;
