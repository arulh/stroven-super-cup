import React from 'react';
import { AppBar, Toolbar, Box, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Competitors', path: '/competitors' },
    { label: 'About', path: '/about' },
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none', mb: 2 }}>
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <Box
            component="img"
            src="/stroven_super_cup.png"
            alt="Stroven Super Cup"
            sx={{
              height: { xs: 40, sm: 50 },
              width: 'auto',
              filter: 'drop-shadow(0 0 10px rgba(101, 148, 192, 0.3))',
            }}
          />
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: 'flex', gap: 2 }}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            component={Link}
            to={item.path}
            sx={{
              color: location.pathname === item.path ? '#6594C0' : 'rgba(255, 255, 255, 0.7)',
              fontWeight: location.pathname === item.path ? 700 : 500,
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              position: 'relative',
              '&:hover': {
                color: '#6594C0',
                backgroundColor: 'transparent',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: location.pathname === item.path ? '100%' : '0%',
                height: '2px',
                backgroundColor: '#6594C0',
                transition: 'width 0.3s ease',
              },
              '&:hover::after': {
                width: '100%',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
