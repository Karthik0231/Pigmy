import React, { useState, useContext } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AdminContext } from '../Context/Context';

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { adminLogin } = useContext(AdminContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    adminLogin(credentials);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to right, #83a4d4, #b6fbff)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 400 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mb={2}
        >
          <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5" gutterBottom>
            Admin Login
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
