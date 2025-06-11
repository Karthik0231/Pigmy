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
import { CollectorContext } from '../Context/Context';

export default function CollectorLoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { collectorLogin, collector} = useContext(CollectorContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    collectorLogin(credentials);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to right,rgb(68, 142, 48),rgb(20, 220, 230))',
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
            Collector Login
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
