import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Link as MuiLink,
  Button,
  Container,
  Divider,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  YouTube,
  Twitter,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  School,
  MusicNote,
  Piano,
  GraphicEq,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";

// Styled components
const StyledFooter = styled(Box)(() => ({
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
    pointerEvents: "none",
  },
}));

const FooterSection = styled(Box)(() => ({
  position: "relative",
  zIndex: 1,
}));

const SectionTitle = styled(Typography)(() => ({
  fontWeight: 700,
  fontSize: "1.2rem",
  marginBottom: "1.5rem",
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}));

const StyledLink = styled(MuiLink)(() => ({
  color: "#cbd5e1",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "12px",
  transition: "all 0.3s ease",
  "&:hover": {
    color: "#6366f1",
    transform: "translateX(4px)",
  },
}));

const SocialButton = styled(IconButton)(() => ({
  background:
    "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "#cbd5e1",
  margin: "0 8px 8px 0",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#ffffff",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(99, 102, 241, 0.4)",
  },
}));

const LanguageButton = styled(Button)(() => ({
  minWidth: "48px",
  height: "36px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "#cbd5e1",
  margin: "0 8px 8px 0",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#6366f1",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    color: "#6366f1",
  },
  "&.active": {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#ffffff",
    borderColor: "transparent",
  },
}));

const BrandSection = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1rem",
}));

const BrandLogo = styled(Typography)(() => ({
  fontWeight: 800,
  fontSize: "2rem",
  letterSpacing: 2,
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  marginBottom: "0.5rem",
}));

const Footer = () => {
  const quickLinks = useMemo(
    () => [
      {
        href: "/courses",
        label: "Courses",
        icon: <School sx={{ fontSize: 16 }} />,
      },
      {
        href: "/about",
        label: "About Us",
        icon: <MusicNote sx={{ fontSize: 16 }} />,
      },
      {
        href: "/contact",
        label: "Contact",
        icon: <Email sx={{ fontSize: 16 }} />,
      },
      {
        href: "/teach",
        label: "Teach With Us",
        icon: <Piano sx={{ fontSize: 16 }} />,
      },
    ],
    []
  );

  const supportLinks = useMemo(
    () => [
      {
        href: "/help",
        label: "Help Center",
        icon: <Email sx={{ fontSize: 16 }} />,
      },
      {
        href: "/privacy",
        label: "Privacy Policy",
        icon: <Email sx={{ fontSize: 16 }} />,
      },
      {
        href: "/terms",
        label: "Terms of Service",
        icon: <Email sx={{ fontSize: 16 }} />,
      },
      { href: "/faq", label: "FAQ", icon: <Email sx={{ fontSize: 16 }} /> },
    ],
    []
  );

  const contactInfo = useMemo(
    () => [
      { icon: <Email sx={{ fontSize: 16 }} />, text: "support@musicloud.com" },
      { icon: <Phone sx={{ fontSize: 16 }} />, text: "+1 (555) 123-4567" },
      { icon: <LocationOn sx={{ fontSize: 16 }} />, text: "New York, NY" },
    ],
    []
  );

  const socialLinks = useMemo(
    () => [
      { href: "https://facebook.com", icon: <Facebook />, label: "Facebook" },
      {
        href: "https://instagram.com",
        icon: <Instagram />,
        label: "Instagram",
      },
      { href: "https://youtube.com", icon: <YouTube />, label: "YouTube" },
      { href: "https://twitter.com", icon: <Twitter />, label: "Twitter" },
      { href: "https://linkedin.com", icon: <LinkedIn />, label: "LinkedIn" },
    ],
    []
  );

  return (
    <StyledFooter
      component="footer"
      sx={{
        mt: 8,
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <FooterSection>
          <Grid container spacing={4}>
            {/* Brand & Description */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <BrandSection>
                  <BrandLogo variant="h4">MUSICLOUD</BrandLogo>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#94a3b8",
                      lineHeight: 1.6,
                      maxWidth: "300px",
                    }}
                  >
                    Learn music from the world&apos;s best instructors. Master
                    your instrument with personalized lessons and cutting-edge
                    technology.
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    <GraphicEq sx={{ color: "#6366f1", fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Powered by AI-driven learning
                    </Typography>
                  </Box>
                </BrandSection>
              </motion.div>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={2}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <FooterSection>
                  <SectionTitle variant="h6">Quick Links</SectionTitle>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {quickLinks.map((link) => (
                      <StyledLink key={link.href} href={link.href}>
                        {link.icon}
                        {link.label}
                      </StyledLink>
                    ))}
                  </Box>
                </FooterSection>
              </motion.div>
            </Grid>

            {/* Support */}
            <Grid item xs={12} sm={6} md={2}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <FooterSection>
                  <SectionTitle variant="h6">Support</SectionTitle>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {supportLinks.map((link) => (
                      <StyledLink key={link.href} href={link.href}>
                        {link.icon}
                        {link.label}
                      </StyledLink>
                    ))}
                  </Box>
                </FooterSection>
              </motion.div>
            </Grid>

            {/* Contact & Social */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <FooterSection>
                  <SectionTitle variant="h6">Get In Touch</SectionTitle>

                  {/* Contact Info */}
                  <Box sx={{ mb: 3 }}>
                    {contactInfo.map((info, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                          color: "#cbd5e1",
                        }}
                      >
                        {info.icon}
                        <Typography variant="body2">{info.text}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Social Media */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#94a3b8",
                        mb: 2,
                        fontWeight: 600,
                      }}
                    >
                      Follow Us
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                      {socialLinks.map((social) => (
                        <SocialButton
                          key={social.href}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                        >
                          {social.icon}
                        </SocialButton>
                      ))}
                    </Box>
                  </Box>

                  {/* Language Switcher */}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#94a3b8",
                        mb: 2,
                        fontWeight: 600,
                      }}
                    >
                      Language
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                      <LanguageButton className="active">EN</LanguageButton>
                      <LanguageButton>RO</LanguageButton>
                      <LanguageButton>ES</LanguageButton>
                      <LanguageButton>FR</LanguageButton>
                    </Box>
                  </Box>
                </FooterSection>
              </motion.div>
            </Grid>
          </Grid>

          {/* Divider */}
          <Divider
            sx={{
              borderColor: "rgba(255, 255, 255, 0.1)",
              my: 4,
            }}
          />

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                © 2025 MUSICLOUD. All rights reserved. Made with ♪ for music
                lovers.
              </Typography>
              <Box sx={{ display: "flex", gap: 3 }}>
                <MuiLink
                  href="/privacy"
                  sx={{
                    color: "#64748b",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": { color: "#6366f1" },
                  }}
                >
                  Privacy
                </MuiLink>
                <MuiLink
                  href="/terms"
                  sx={{
                    color: "#64748b",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": { color: "#6366f1" },
                  }}
                >
                  Terms
                </MuiLink>
                <MuiLink
                  href="/cookies"
                  sx={{
                    color: "#64748b",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": { color: "#6366f1" },
                  }}
                >
                  Cookies
                </MuiLink>
              </Box>
            </Box>
          </motion.div>
        </FooterSection>
      </Container>
    </StyledFooter>
  );
};

export default React.memo(Footer);
