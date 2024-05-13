import { MuiThemeProvider } from "@material-ui/core";
import { AuthProvider } from "./global/context/AuthContext";

import GlobalStyles, { MuiTheme } from "./global/globalStyles";
import ReactNotification from "./global/notificate";

import Routes from "./routes";

function App() {
  return (
    <>
      <GlobalStyles />
      <ReactNotification isMobile />

      <MuiThemeProvider theme={MuiTheme}>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </MuiThemeProvider>
    </>
  );
}

export default App;
