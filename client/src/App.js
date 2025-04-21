import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Paper, useMediaQuery } from '@mui/material';
import CoffeeConfigForm from './components/CoffeeConfigForm';
import CoffeeConfigList from './components/CoffeeConfigList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#795548', // Coffee brown
    },
    secondary: {
      main: '#8D6E63', // Light coffee brown
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [refreshList, setRefreshList] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleConfigSaved = () => {
    setRefreshList(prev => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'stretch'
        }}>
          <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
            <CoffeeConfigForm onConfigSaved={handleConfigSaved} />
          </Paper>
          <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
            <CoffeeConfigList key={refreshList} />
          </Paper>
        </div>
      </Container>
    </ThemeProvider>
  );
}

export default App;
