import React, {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { FiLogIn } from "react-icons/fi";
import {
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@material-ui/core";
import Lottie from "react-lottie";

import Button from "../../components/Button";

import { Container, Content, Card, Header, DividerLogo, Form, Footer } from "./styles";

import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { AuthContext } from "../../global/context/AuthContext";
import { useHistory } from "react-router";
import { notificate } from "../../global/notificate";

import personLottie from "../../assets/lotties/person-lottie.json";
import AgendaLogoFull from "../../assets/agenda-logo-full.svg";
import OnNetLogoFull from "../../assets/onnet-logo-full.png";

interface State {
  email: string;
  password: string;
  showPassword: boolean;
  rememberEmail: boolean;
}

const Login: React.FC = () => {
  const history = useHistory();

  const { login, logout } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [values, setValues] = React.useState<State>({
    email: localStorage.getItem("email") || "",
    password: "",
    showPassword: false,
    rememberEmail: Boolean(localStorage.getItem("email")),
  });

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      const { email, password, rememberEmail } = values;

      setIsLoading(true);

      login(email, password, { rememberEmail })
        .then(() => history.push("/"))
        .catch((err) => {
          if (err.response?.status === 401 || err.response?.status === 403)
            notificate({
              title: "Aviso",
              message: "E-mail ou senha inválidos",
              type: "warning",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro",
              type: "danger",
            });

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    },
    [login, values, setIsLoading]
  );

  const handleChange = useCallback(
    (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      setValues((prev) => ({ ...prev, [prop]: value }));
    },
    [setValues]
  );

  const handleClickShowPassword = useCallback(() => {
    setValues((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  }, [setValues]);

  const handleClickRememberEmail = useCallback(() => {
    setValues((prev) => ({ ...prev, rememberEmail: !prev.rememberEmail }));
  }, [setValues]);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <Container>
      <Content>
        <Lottie
          width={700}
          style={{ margin: 0 }}
          options={{
            loop: true,
            autoplay: true,
            animationData: personLottie,
          }}
        />

        <Card>
          <Header>
            <img src={AgendaLogoFull} alt="Logo" />
          </Header>

          <DividerLogo>
            <hr />
            <span>Login</span>
          </DividerLogo>

          <Form onSubmit={handleSubmit}>
            <FormControl variant="outlined">
              <InputLabel>E-mail</InputLabel>
              <OutlinedInput
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange("email")}
                disabled={isLoading}
                labelWidth={50}
                required
              />
            </FormControl>

            <FormControl variant="outlined">
              <InputLabel>Senha</InputLabel>
              <OutlinedInput
                type={values.showPassword ? "text" : "password"}
                name="password"
                value={values.password}
                onChange={handleChange("password")}
                disabled={isLoading}
                labelWidth={50}
                required
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      disabled={isLoading}
                    >
                      {values.showPassword ? (
                        <MdVisibility />
                      ) : (
                        <MdVisibilityOff />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <FormControlLabel
              className="remember"
              label="Lembrar e-mail"
              labelPlacement="start"
              disabled={isLoading}
              control={
                <Checkbox
                  checked={Boolean(values.rememberEmail)}
                  onChange={handleClickRememberEmail}
                  size="small"
                />
              }
            />

            {isLoading ? (
              <CircularProgress
                size={40}
                className="centralize"
                style={{ marginTop: "1rem" }}
              />
            ) : (
              <Button
                title="Entrar"
                type="submit"
                icon={<FiLogIn />}
                background="var(--success)"
              >
                Entrar
              </Button>
            )}
          </Form>
        </Card>
      </Content>

      <Footer>
        <a href="https://www.onnetmais.com.br" target="blank">
          OnNet Telecom
        </a>
        <span>Copyright © 2021 - Todos os direitos reservados</span>
        <a href="https://www.onnetmais.com.br" target="blank">
          <img src={OnNetLogoFull} alt="Logo OnNet" />
        </a>
      </Footer>
    </Container>
  );
};

export default Login;
