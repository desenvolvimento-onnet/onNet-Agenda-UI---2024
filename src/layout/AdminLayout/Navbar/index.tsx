import React, { ChangeEvent, memo, useCallback, useContext, useState } from "react";

import { CircularProgress, MenuItem, TextField } from "@material-ui/core";
import { FiLogOut } from "react-icons/fi";
import { IoMdKey, IoMdSettings } from "react-icons/io";
import { MdPerson } from "react-icons/md";

import { AuthContext } from "../../../global/context/AuthContext";
import { notificate } from "../../../global/notificate";
import Divider from "../../../components/Divider";
import AuthService from "../../../services/AuthService";
import UserService from "../../../services/UserService";
import ConfirmDialog from "../../../components/ConfirmDialog";

import {
  Container,
  Content,
  Person,
  MenuStyled,
  DialogContainer,
} from "./styles";
import User from "../../../models/User";
import Ajustment from "../../../models/Ajustment";
import AjustmentService from "../../../services/AjustmentService";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NavbarProps {
  title?: string;
  background?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  title = "OnNet Agenda",
  background = "var(--linear-primary)",
}) => {
  const { user, logout } = useContext(AuthContext);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [ajustmentForm, setAjustmentForm] = useState({} as Ajustment);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(
    {} as PasswordForm
  );

  const onSubmitAjustment = useCallback(async ({ id, ...form }: Ajustment) => {
    if (
      !form.legal_month_amount.toString() ||
      !form.max_fix_time.toString() ||
      !form.min_renew_time.toString() ||
      !form.month_amount.toString() ||
      !form.monthly_benefit.toString()
    ) {
      notificate({
        title: "Aviso",
        message: "Preencha todos os campos",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    await AjustmentService.update(Number(id), form);
  }, []);

  const onSubmitPassword = useCallback(
    async (passwordForm: PasswordForm, currentUser: User) => {
      const { currentPassword, newPassword, confirmPassword } = passwordForm;

      if (!currentPassword || !newPassword || !confirmPassword) {
        notificate({
          title: "Atenção",
          message: "Preencha todos os campos",
          type: "info",
        });

        throw new Error("Missing data");
      }

      if (newPassword.length < 6) {
        notificate({
          title: "Atenção",
          message: "A senha precisa ter no mínimo 6 caracteres",
          type: "info",
        });

        throw new Error("Password lenght denied");
      }

      if (newPassword !== confirmPassword) {
        notificate({
          title: "Aviso",
          message: "As senhas não coincidem",
          type: "warning",
        });

        throw new Error("Difference passwords");
      }

      await AuthService.authenticate(currentUser.email || "", currentPassword);
      await UserService.changePassword(newPassword);
    },
    []
  );

  const handleDialogOpen = useCallback(
    (index: number) => {
      setPasswordForm({} as PasswordForm);
      setAjustmentForm({} as Ajustment);

      setDialogOpened(index);

      if (index === 1) {
        setDialogIsLoading(true);

        AjustmentService.getMainAjustment()
          .then((response) => setAjustmentForm(response.data))
          .catch((err) => {
            notificate({
              title: `Erro ${err.response?.status}`,
              message: "Ocorreu um erro ao carregar as configurações",
              type: "danger",
            });

            console.log(err);

            setDialogOpened(null);
          })
          .finally(() => setDialogIsLoading(false));
      }
    },
    [setDialogOpened, setPasswordForm, setAjustmentForm]
  );

  const ajustmentDialog = useCallback(() => {
    setDialogIsLoading(true);

    onSubmitAjustment(ajustmentForm)
      .then(() => {
        notificate({
          title: "Sucesso",
          message: "Ajustes salvos com sucesso!",
          type: "success",
        });

        setDialogOpened(null);
      })
      .catch((err) => {
        if (err.response?.status)
          notificate({
            title: `Erro ${err.response.status}`,
            message: "Ocorreu um erro ao salvar os ajustes",
            type: "danger",
          });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }, [ajustmentForm, setDialogIsLoading, onSubmitAjustment, setDialogOpened]);

  const passwordDialog = useCallback(() => {
    if (user) {
      setDialogIsLoading(true);

      onSubmitPassword(passwordForm, user)
        .then(() => {
          notificate({
            title: "Sucesso",
            message: "Senha alterada com sucesso!",
            type: "success",
          });

          setDialogOpened(null);
        })
        .catch((err) => {
          if (err.response?.status === 401)
            notificate({
              title: "Aviso",
              message: "A senha atual está inválida!",
              type: "warning",
            });
          else if (err.response?.status)
            notificate({
              title: "Erro",
              message: "Ocorreu um erro ao alterar a senha",
              type: "danger",
            });
        })
        .finally(() => setDialogIsLoading(false));
    } else setDialogOpened(null);
  }, [
    setDialogOpened,
    passwordForm,
    setDialogIsLoading,
    onSubmitPassword,
    user,
  ]);

  const handleDialogClose = useCallback(
    (success) => {
      if (success) {
        if (dialogOpened === 1) ajustmentDialog();
        else if (dialogOpened === 2) passwordDialog();
      } else setDialogOpened(null);
    },
    [dialogOpened, ajustmentDialog, passwordDialog]
  );

  const handleInputAjustmentChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      var { name, value } = ev.target;

      if (value) value = Math.max(0, Number(value)).toString();

      setAjustmentForm((prev) => ({ ...prev, [name]: value }));
    },
    [setAjustmentForm]
  );

  const handleInputPasswordChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = ev.target;

      setPasswordForm((prev) => ({ ...prev, [name]: value }));
    },
    [setPasswordForm]
  );

  return (
    <>
      <Container style={{ background }}>
        <Content style={{ background }}>
          <p>{title}</p>

          <Person
            onClick={useCallback((ev) => setAnchorEl(ev.currentTarget), [])}
          >
            <div>
              <p>{user?.short_name}</p>
              <span>{user?.email}</span>
            </div>

            <span>
              <MdPerson />
            </span>
          </Person>
        </Content>
      </Container>

      <MenuStyled
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={useCallback(() => setAnchorEl(null), [])}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        {Boolean(user?.admin) && (
          <MenuItem
            onClick={() => {
              handleDialogOpen(1);

              setAnchorEl(null);
            }}
          >
            <IoMdSettings />

            <span style={{ marginLeft: 10 }}>Ajustes</span>
          </MenuItem>
        )}

        <MenuItem
          onClick={useCallback(() => {
            handleDialogOpen(2);

            setAnchorEl(null);
          }, [setAnchorEl, handleDialogOpen])}
        >
          <IoMdKey />

          <span style={{ marginLeft: 10 }}>Alterar senha</span>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={useCallback(() => {
            logout();

            setAnchorEl(null);
          }, [setAnchorEl, logout])}
        >
          <FiLogOut />

          <span style={{ marginLeft: 10 }}>Sair</span>
        </MenuItem>
      </MenuStyled>

      {/* Adjustment Dialog - INDEX 1 */}
      <ConfirmDialog
        title="Ajustes do sistema"
        open={dialogOpened === 1}
        onClose={handleDialogClose}
        okLabel="Salvar"
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="md"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={80} className="centralize" />
          ) : (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();

                handleDialogClose(true);
              }}
            >
              <div className="line">
                <TextField
                  label="Benefício mensal base (R$)"
                  variant="outlined"
                  type="number"
                  helperText="Benefício mensal base para importação e ajuste de planos"
                  name="monthly_benefit"
                  value={ajustmentForm.monthly_benefit}
                  onChange={handleInputAjustmentChange}
                  required
                />
              </div>

              <Divider />

              <div className="line">
                <TextField
                  label="Duração do contrato PF"
                  variant="outlined"
                  type="number"
                  helperText="Duração em meses do contrato para pessoa física"
                  name="month_amount"
                  value={ajustmentForm.month_amount}
                  onChange={handleInputAjustmentChange}
                  required
                />

                <TextField
                  label="Duração do contrato PJ"
                  variant="outlined"
                  type="number"
                  helperText="Duração em meses do contrato para pessoa jurídica"
                  name="legal_month_amount"
                  value={ajustmentForm.legal_month_amount}
                  onChange={handleInputAjustmentChange}
                  required
                />
              </div>

              <Divider />

              <div className="line">
                <TextField
                  label="Tempo máx. ajuste de contrato"
                  variant="outlined"
                  type="number"
                  helperText="Tempo máximo em dias que um contrato poderá ser ajustado após uma importação/renovação"
                  name="max_fix_time"
                  value={ajustmentForm.max_fix_time}
                  onChange={handleInputAjustmentChange}
                  required
                />

                <TextField
                  label="Tempo mín. renovação de contrato"
                  variant="outlined"
                  type="number"
                  helperText="Tempo mínimo em dias entre cada renovação de contrato"
                  name="min_renew_time"
                  value={ajustmentForm.min_renew_time}
                  onChange={handleInputAjustmentChange}
                  required
                />
              </div>
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Change password Dialog - INDEX 2 */}
      <ConfirmDialog
        title="Alterar Senha"
        open={dialogOpened === 2}
        onClose={handleDialogClose}
        okLabel="Salvar"
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="xs"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={80} className="centralize" />
          ) : (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();

                handleDialogClose(true);
              }}
            >
              <TextField
                label="Senha atual"
                type="password"
                variant="outlined"
                name="currentPassword"
                value={passwordForm.currentPassword || ""}
                onChange={handleInputPasswordChange}
              />

              <Divider />

              <TextField
                label="Nova senha"
                type="password"
                variant="outlined"
                name="newPassword"
                value={passwordForm.newPassword || ""}
                onChange={handleInputPasswordChange}
                helperText={
                  Boolean(
                    passwordForm.newPassword &&
                      passwordForm.newPassword.length < 6
                  ) && "A senha precisa ter no mínimo 6 caracteres"
                }
                error={Boolean(
                  passwordForm.newPassword &&
                    passwordForm.newPassword.length < 6
                )}
              />

              <TextField
                label="Confirmar senha"
                type="password"
                variant="outlined"
                name="confirmPassword"
                value={passwordForm.confirmPassword || ""}
                onChange={handleInputPasswordChange}
                helperText={
                  Boolean(
                    passwordForm.newPassword &&
                      passwordForm.confirmPassword &&
                      passwordForm.newPassword !== passwordForm.confirmPassword
                  ) && "As senhas não coincidem"
                }
                error={Boolean(
                  passwordForm.newPassword &&
                    passwordForm.confirmPassword &&
                    passwordForm.newPassword !== passwordForm.confirmPassword
                )}
              />
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default memo(Navbar);
