import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../types';
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
  Fade,
  Zoom,
} from "@mui/material";
import {
  PersonOutlined,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  LoginOutlined,
} from "@mui/icons-material";

const Login: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(credentials);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error?.error || result.error?.detail || 'Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit(e as any);
    }
  };

  return (
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
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
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
              maxWidth: 480,
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
                  fontSize: isMobile ? 28 : 32,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  mb: 0.5,
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: isMobile ? 13 : 14,
                  opacity: 0.9,
                }}
              >
                Sign in to continue to your account
              </Typography>
            </Box>

            <Box sx={{ p: isMobile ? 2.5 : 4 }}>
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

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    name="username"
                    label="Username"
                    value={credentials.username}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    required
                    size={isMobile ? "small" : "medium"}
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

                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    required
                    size={isMobile ? "small" : "medium"}
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

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    fullWidth
                    startIcon={!loading && <LoginOutlined />}
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
                    {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Login"}
                  </Button>
                </Stack>
              </form>

              <Stack sx={{ mt: 3, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: isMobile ? 13 : 14,
                  }}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/register"
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
                    Create Account
                  </Link>
                </Typography>
              </Stack>
            </Box>
          </Card>
        </Zoom>
      </Box>
    </Fade>
  );
};

export default Login;