import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Grid,
  Fade,
  Zoom,
  Slide,
  Snackbar,
} from "@mui/material";
import {
  PersonOutlined,
  LockOutlined,
  EmailOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  AppRegistrationOutlined,
  BadgeOutlined,
} from "@mui/icons-material";

const API_BASE = "https://loginbackend-hjlb.onrender.com/api/";

interface RegisterFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
}

interface RegisterErrors {
  username?: string[];
  email?: string[];
  password?: string[];
  first_name?: string[];
  last_name?: string[];
  non_field_errors?: string[];
}

interface RegisterResponse {
  access?: string;
  refresh?: string;
  user?: any;
  username?: string[];
  email?: string[];
  password?: string[];
  first_name?: string[];
  last_name?: string[];
  error?: string;
  detail?: string;
  non_field_errors?: string[];
}

const Register: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successSnackbar, setSuccessSnackbar] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear specific field error when user starts typing
    if (errors[e.target.name as keyof RegisterErrors]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
    setGeneralError("");
  };

  const validateForm = (): boolean => {
    const newErrors: RegisterErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = ["Username is required"];
    } else if (formData.username.length < 3) {
      newErrors.username = ["Username must be at least 3 characters"];
    } else if (formData.username.length > 150) {
      newErrors.username = ["Username must be less than 150 characters"];
    }
    
    if (!formData.email.trim()) {
      newErrors.email = ["Email is required"];
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = ["Please enter a valid email address"];
    }
    
    if (!formData.password) {
      newErrors.password = ["Password is required"];
    } else if (formData.password.length < 6) {
      newErrors.password = ["Password must be at least 6 characters"];
    } else if (formData.password.length > 128) {
      newErrors.password = ["Password must be less than 128 characters"];
    }
    
    if (formData.password !== formData.password2) {
      newErrors.password = ["Passwords do not match"];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setGeneralError("");

    try {
      const response = await fetch(`${API_BASE}register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (response.ok) {
        // Store tokens if returned
        if (data.access) {
          localStorage.setItem("access_token", data.access);
        }
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        // Show success message and redirect
        setSuccessSnackbar(true);
        setTimeout(() => {
          navigate("/login", { 
            state: { message: "Registration successful! Please login." }
          });
        }, 1500);
      } else {
        // Handle different error formats
        if (data.username) {
          setErrors({ username: data.username });
        } else if (data.email) {
          setErrors({ email: data.email });
        } else if (data.password) {
          setErrors({ password: data.password });
        } else if (data.first_name) {
          setErrors({ first_name: data.first_name });
        } else if (data.last_name) {
          setErrors({ last_name: data.last_name });
        } else if (data.non_field_errors) {
          setGeneralError(data.non_field_errors[0]);
        } else if (data.error) {
          setGeneralError(data.error);
        } else if (data.detail) {
          setGeneralError(data.detail);
        } else {
          setGeneralError("Registration failed. Please check your information and try again.");
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.message === "Failed to fetch") {
        setGeneralError("Unable to connect to server. Please check if the backend is running.");
      } else {
        setGeneralError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  return (
    <>
      <Fade in timeout={800}>
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
                maxWidth: 550,
                width: "100%",
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
              <Box
                sx={{
                  px: isMobile ? 2 : 4,
                  py: isMobile ? 2 : 3,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  textAlign: "center",
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
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontSize: isMobile ? 24 : 28,
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    mb: 0.5,
                  }}
                >
                  Create Account
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? 12 : 14,
                    opacity: 0.9,
                  }}
                >
                  Join us and start your journey
                </Typography>
              </Box>

              <Box sx={{ p: isMobile ? 2.5 : 4 }}>
                {generalError && (
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
                      {generalError}
                    </Alert>
                  </Fade>
                )}

                <Stack spacing={2.5}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Slide direction="right" in timeout={400}>
                        <TextField
                          fullWidth
                          name="first_name"
                          label="First Name"
                          value={formData.first_name}
                          onChange={handleChange}
                          onKeyPress={handleKeyPress}
                          size={isMobile ? "small" : "medium"}
                          error={!!errors.first_name}
                          helperText={errors.first_name?.[0]}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BadgeOutlined sx={{ color: "#667eea", fontSize: 20 }} />
                              </InputAdornment>
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
                      </Slide>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Slide direction="left" in timeout={400}>
                        <TextField
                          fullWidth
                          name="last_name"
                          label="Last Name"
                          value={formData.last_name}
                          onChange={handleChange}
                          onKeyPress={handleKeyPress}
                          size={isMobile ? "small" : "medium"}
                          error={!!errors.last_name}
                          helperText={errors.last_name?.[0]}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BadgeOutlined sx={{ color: "#667eea", fontSize: 20 }} />
                              </InputAdornment>
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
                      </Slide>
                    </Grid>
                  </Grid>

                  <Slide direction="up" in timeout={500}>
                    <TextField
                      fullWidth
                      name="username"
                      label="Username"
                      value={formData.username}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      required
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.username}
                      helperText={errors.username?.[0]}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlined sx={{ color: "#667eea" }} />
                          </InputAdornment>
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
                  </Slide>

                  <Slide direction="up" in timeout={600}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      required
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.email}
                      helperText={errors.email?.[0]}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined sx={{ color: "#667eea" }} />
                          </InputAdornment>
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
                  </Slide>

                  <Slide direction="up" in timeout={700}>
                    <TextField
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      required
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.password}
                      helperText={errors.password?.[0]}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: "#667eea" }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                            </IconButton>
                          </InputAdornment>
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
                  </Slide>

                  <Slide direction="up" in timeout={800}>
                    <TextField
                      fullWidth
                      name="password2"
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.password2}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      required
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.password && formData.password !== formData.password2}
                      helperText={
                        formData.password !== formData.password2 && formData.password2
                          ? "Passwords do not match"
                          : ""
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: "#667eea" }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              size="small"
                            >
                              {showConfirmPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                            </IconButton>
                          </InputAdornment>
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
                  </Slide>

                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    fullWidth
                    startIcon={!loading && <AppRegistrationOutlined />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      py: 1.2,
                      fontSize: isMobile ? 14 : 16,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 5px 15px rgba(102,126,234,0.4)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Register"}
                  </Button>
                </Stack>

                <Stack sx={{ mt: 3, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: isMobile ? 13 : 14,
                    }}
                  >
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      style={{
                        color: "#764ba2",
                        textDecoration: "none",
                        fontWeight: 600,
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#667eea";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#764ba2";
                      }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Stack>
              </Box>
            </Card>
          </Zoom>
        </Box>
      </Fade>

      <Snackbar
        open={successSnackbar}
        autoHideDuration={1500}
        onClose={() => setSuccessSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Fade in={successSnackbar}>
          <Alert
            severity="success"
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              backgroundColor: "#4caf50",
              color: "#fff",
              "& .MuiAlert-icon": {
                color: "#fff",
              },
            }}
          >
            Registration successful! Redirecting to login...
          </Alert>
        </Fade>
      </Snackbar>
    </>
  );
};

export default Register;