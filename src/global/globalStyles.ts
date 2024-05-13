import { createMuiTheme } from "@material-ui/core/styles";
import { createGlobalStyle } from "styled-components";

export const ContractCSS = `
  body {
    margin: 0 auto; 
    width: calc(793.7px * 1.17 + 1.5in);
    max-width: calc(793.7px * 1.17 + 1.5in);
    font-family: 'Times New Roman';
  }
`;

export const MuiTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#30a9ff",
      dark: "#7596ff",
      contrastText: "#fff",
    },
    secondary: {
      main: "#4dd495",
      dark: "#27c382",
      contrastText: "#fff",
    },
  },
});

export default createGlobalStyle`
    :root {
        --secondary: #30a9ff;
        --secondary-dark: #7596ff;
        --primary: #2adeb0; 
        --primary-dark: #10c178;
        
        --tertiary: #3b3d3f;

        --linear-primary: linear-gradient(to right, var(--primary-dark), var(--primary));
        --linear-secondary: linear-gradient(to left top, var(--secondary), var(--secondary-dark));
        --linear-tertiary: linear-gradient(to left, var(--primary), #26bbaf);
        --linear-quaternary: linear-gradient(to left, #0cebde, var(--primary));

        --background: #f0f0f7;
        --box-shadow: #00000020;
        --backdrop: #00000050;
        
        --info: #16b7ef;
        --success: #00bf85;
        --warning: #ff9800;
        --danger: #ff6a7a;
        --gold: gold;
        --gold-light: #fff15c;

        --white: #ffffff;
        --black: #000000;
        --gray: #626262;
        --gray-light: #dddddd;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;

        font-family: 'Roboto', sans-serif;
        outline: none;
    }

    html, body, #root {
        height: 100%;

        background: var(--background);
    }

    h1, h2, h3 {
        font-family: "Catamaran";
    }

    .centralize {
      margin: auto;
      align-self: center;
    }
`;
