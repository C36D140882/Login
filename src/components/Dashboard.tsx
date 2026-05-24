import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Avatar,
  Stack,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Paper,
  TextField,
  Fade,
  Zoom,
  Slide,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import {
  LogoutOutlined,
  EmailOutlined,
  BadgeOutlined,
  CalendarTodayOutlined,
  EditOutlined,
  SaveOutlined,
  CancelOutlined,
  PhoneOutlined,
  HomeOutlined,
  DashboardOutlined,
  VerifiedUserOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

const API_BASE = "https://loginbackend-hjlb.onrender.com/api/";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

interface Profile {
  id: number;
  user: User;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

const getHeaders = (): HeadersInit => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/profile/`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("refresh_token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUser(data.user);
      setProfile(data);
      setFormData({
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/profile/`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfile(data);
      setEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
      if (refreshToken) {
        await fetch(`${API_BASE}/logout/`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      navigate("/login");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: e.target.value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, address: e.target.value });
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || "U";
  };

  const getMemberDuration = () => {
    if (!user?.date_joined) return "N/A";
    const joined = new Date(user.date_joined);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <Fade in timeout={800}>
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Zoom in timeout={500}>
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={isMobile ? 40 : 60} sx={{ color: "#fff", mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#fff", fontWeight: 500 }}>
                Loading your dashboard...
              </Typography>
            </Box>
          </Zoom>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          p: isMobile ? 1.5 : 3,
          position: "relative",
          overflow: "auto",
          "&::before": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        <Zoom in timeout={500}>
          <Card
            sx={{
              maxWidth: 1200,
              mx: "auto",
              borderRadius: isMobile ? 3 : 5,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              backdropFilter: "blur(10px)",
              animation: "slideUp 0.6s ease-out",
              "@keyframes slideUp": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(30px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: isMobile ? 2 : 4,
                py: isMobile ? 2 : 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                position: "relative",
                overflow: "hidden",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -20,
                  left: -20,
                  right: -20,
                  height: 40,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  filter: "blur(10px)",
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <DashboardOutlined sx={{ fontSize: isMobile ? 28 : 32 }} />
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontSize: isMobile ? 20 : 28, 
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Dashboard
                </Typography>
              </Stack>
              <Button
                variant="contained"
                onClick={handleLogout}
                startIcon={<LogoutOutlined />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  "&:hover": { 
                    backgroundColor: "rgba(255,255,255,0.3)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Logout
              </Button>
            </Box>

            <Box sx={{ p: isMobile ? 2 : 4 }}>
              {/* Success Message */}
              {success && (
                <Fade in timeout={300}>
                  <Alert 
                    severity="success" 
                    sx={{ 
                      borderRadius: 2, 
                      mb: 3,
                      animation: "slideIn 0.3s ease-out",
                      "@keyframes slideIn": {
                        "0%": { transform: "translateY(-20px)", opacity: 0 },
                        "100%": { transform: "translateY(0)", opacity: 1 },
                      },
                    }}
                  >
                    {success}
                  </Alert>
                </Fade>
              )}

              {/* Error Message */}
              {error && (
                <Fade in timeout={300}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: 2, 
                      mb: 3,
                      animation: "shake 0.5s",
                      "@keyframes shake": {
                        "0%, 100%": { transform: "translateX(0)" },
                        "25%": { transform: "translateX(-5px)" },
                        "75%": { transform: "translateX(5px)" },
                      },
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* User Profile Card */}
              <Slide direction="right" in timeout={600}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: isMobile ? 3 : 4,
                    p: isMobile ? 2 : 3,
                    mb: 3,
                    background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                    border: "1px solid rgba(102,126,234,0.2)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={isMobile ? 2 : 3} 
                    alignItems={isMobile ? "center" : "flex-start"}
                    sx={{ mb: isMobile ? 2 : 3 }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        width: isMobile ? 80 : 100, 
                        height: isMobile ? 80 : 100,
                        boxShadow: "0 4px 15px rgba(102,126,234,0.3)",
                        fontSize: isMobile ? 32 : 40,
                        fontWeight: 600,
                      }}
                    >
                      {getInitials()}
                    </Avatar>
                    <Box sx={{ textAlign: isMobile ? "center" : "left", flex: 1 }}>
                      <Typography 
                        variant="h4" 
                        component="h2" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: isMobile ? 22 : 28,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                          mb: 0.5,
                        }}
                      >
                        {user?.first_name} {user?.last_name}
                      </Typography>
                      <Stack 
                        direction={isMobile ? "column" : "row"} 
                        spacing={1} 
                        alignItems={isMobile ? "center" : "center"}
                        sx={{ mb: 1 }}
                      >
                        <Chip 
                          icon={<VerifiedUserOutlined />} 
                          label={`@${user?.username}`} 
                          size="small"
                          sx={{ 
                            bgcolor: "rgba(102,126,234,0.1)",
                            color: "#667eea",
                            fontWeight: 500,
                          }}
                        />
                        <Chip 
                          label={`Member for ${getMemberDuration()}`} 
                          size="small"
                          sx={{ 
                            bgcolor: "rgba(118,75,162,0.1)",
                            color: "#764ba2",
                            fontWeight: 500,
                          }}
                        />
                      </Stack>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper sx={{ p: isMobile ? 1.5 : 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <EmailOutlined sx={{ fontSize: 18, color: "#667eea" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            EMAIL ADDRESS
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? 13 : 14 }}>
                          {user?.email}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Paper sx={{ p: isMobile ? 1.5 : 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <BadgeOutlined sx={{ fontSize: 18, color: "#667eea" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            USERNAME
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? 13 : 14 }}>
                          {user?.username}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Paper sx={{ p: isMobile ? 1.5 : 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <CalendarTodayOutlined sx={{ fontSize: 18, color: "#667eea" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            JOINED DATE
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? 13 : 14 }}>
                          {user?.date_joined ? new Date(user.date_joined).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }) : "N/A"}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Card>
              </Slide>

              {/* Profile Information Card */}
              <Slide direction="left" in timeout={700}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: isMobile ? 3 : 4,
                    p: isMobile ? 2 : 3,
                    background: "#fff",
                    border: "1px solid rgba(102,126,234,0.2)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  }}
                >
                  <Box 
                    sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      mb: 3,
                      flexWrap: "wrap",
                      gap: 1.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SettingsOutlined sx={{ color: "#667eea", fontSize: 24 }} />
                      <Typography 
                        variant="h5" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: isMobile ? 18 : 22,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        Profile Information
                      </Typography>
                    </Stack>
                    {!editing && (
                      <Button
                        variant="contained"
                        startIcon={<EditOutlined />}
                        onClick={() => setEditing(true)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 5px 15px rgba(102,126,234,0.4)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>

                  {!editing ? (
                    <Grid container spacing={isMobile ? 1.5 : 2}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: isMobile ? 1.5 : 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <PhoneOutlined sx={{ fontSize: 18, color: "#667eea" }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              PHONE NUMBER
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? 13 : 14 }}>
                            {profile?.phone || (
                              <Box component="span" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                                Not provided
                              </Box>
                            )}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: isMobile ? 1.5 : 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <HomeOutlined sx={{ fontSize: 18, color: "#667eea" }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              ADDRESS
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? 13 : 14 }}>
                            {profile?.address || (
                              <Box component="span" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                                Not provided
                              </Box>
                            )}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  ) : (
                    <Fade in timeout={300}>
                      <Stack spacing={2.5}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          size={isMobile ? "small" : "medium"}
                          InputProps={{
                            startAdornment: (
                              <PhoneOutlined sx={{ color: "#667eea", mr: 1, fontSize: 20 }} />
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "&:hover fieldset": {
                                borderColor: "#667eea",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#764ba2",
                              },
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Address"
                          value={formData.address}
                          onChange={handleAddressChange}
                          multiline
                          rows={3}
                          size={isMobile ? "small" : "medium"}
                          InputProps={{
                            startAdornment: (
                              <HomeOutlined sx={{ color: "#667eea", mr: 1, fontSize: 20, mt: 1 }} />
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "&:hover fieldset": {
                                borderColor: "#667eea",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#764ba2",
                              },
                            },
                          }}
                        />
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setEditing(false);
                              setFormData({
                                phone: profile?.phone || "",
                                address: profile?.address || "",
                              });
                            }}
                            startIcon={<CancelOutlined />}
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              borderColor: "#d32f2f",
                              color: "#d32f2f",
                              "&:hover": {
                                borderColor: "#d32f2f",
                                backgroundColor: "rgba(211,47,47,0.04)",
                              },
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateProfile}
                            variant="contained"
                            disabled={updating}
                            startIcon={updating ? <CircularProgress size={20} /> : <SaveOutlined />}
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 5px 15px rgba(102,126,234,0.4)",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            {updating ? "Saving..." : "Save Changes"}
                          </Button>
                        </Stack>
                      </Stack>
                    </Fade>
                  )}
                </Card>
              </Slide>
            </Box>
          </Card>
        </Zoom>
      </Box>
    </Fade>
  );
};

export default Dashboard;