import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CircularProgress, TextField } from "@material-ui/core";
import { MdEdit } from "react-icons/md";

import { padronize } from "../../../global/globalFunctions";
import { notificate } from "../../../global/notificate";
import { Table, THead, TBody, Th, Td } from "../../../components/Table";

import Role from "../../../models/Role";
import RoleService from "../../../services/RoleService";
import Button from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageInfo from "../../../components/MessageInfo";
import SettingsChildren from "../SettingsChildren";
import TreePermission from "./TreePermission";
import Permission from "../../../models/Permission";
import PermissionService from "../../../services/PermissionService";

import { Container, DialogContainer } from "./styles";

import Divider from "../../../components/Divider";

const Roles: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<Role>({} as Role);

  const [roles, setRoles] = useState<Role[]>();
  const [permissions, setPermissions] = useState<Permission[]>();

  const rolesFiltered = useMemo<Role[]>(() => {
    if (!roles) return [];

    const value = padronize(query);

    const data = roles.filter(
      (role) => padronize(role.name).indexOf(value) > -1
    );

    return data;
  }, [query, roles]);

  async function getData() {
    const roles = (await RoleService.index({ order_by: "name" })).data;
    const permissions = (await PermissionService.index({ order_by: "id" }))
      .data;

    return { roles, permissions };
  }

  function refresh() {
    setIsLoading(true);

    getData()
      .then((response) => {
        setRoles(response.roles);
        setPermissions(response.permissions);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar os dados",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  async function onSubmit(role: Role, id?: number) {
    if (!id && !role.name) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await RoleService.update(id, role);
    else await RoleService.store(role);
  }

  const handleDialogOpen = useCallback((roleId?: number) => {
    setRoleForm({} as Role);

    setDialogIsOpen(true);

    if (roleId) {
      setDialogIsLoading(true);

      RoleService.show(roleId)
        .then((response) => {
          const permissions =
            (response.data.permissions as Permission[] | undefined)?.map(
              (permission) => Number(permission.id)
            ) || [];

          setSelectedRole({ ...response.data, permissions });
        })
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Aviso",
              message: "Este grupo não foi encontrada",
              type: "warning",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar o grupo",
              type: "danger",
            });

          setDialogIsOpen(false);

          console.log(err);
        })
        .finally(() => setDialogIsLoading(false));
    } else setSelectedRole(null);
  }, []);

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        setDialogIsLoading(true);

        onSubmit(roleForm, selectedRole?.id)
          .then(() => {
            setDialogIsOpen(false);
            refresh();
          })
          .catch((err) => {
            if (err.response?.status === 409)
              notificate({
                title: "Aviso",
                message: "Já existe um grupo com este nome",
                type: "warning",
              });
            else if (err.response?.status)
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao salvar os dados",
                type: "danger",
              });

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else setDialogIsOpen(false);
    },
    [roleForm, selectedRole]
  );

  const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;

    setRoleForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  // First loading
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <SettingsChildren
        inputProps={{
          value: query,
          onChange: useCallback((ev) => setQuery(ev.target.value), []),
          disabled: !roles,
        }}
        onAddClick={useCallback(() => handleDialogOpen(), [])}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : roles ? (
            roles.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Grupo</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {rolesFiltered.map((role) => (
                    <tr key={role.id}>
                      <Td>{role.id}</Td>
                      <Td>{role.name}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() => handleDialogOpen(role.id)}
                        />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhum grupo encontrado</MessageInfo>
            )
          ) : (
            <MessageInfo>Não foi possível carregar os grupos</MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      <ConfirmDialog
        title={`${selectedRole?.id ? "Editar" : "Adicionar"} grupo`}
        okLabel="Salvar"
        open={dialogIsOpen}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled: dialogIsLoading || JSON.stringify(roleForm) === "{}",
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();

                handleDialogClose(true);
              }}
            >
              <TextField
                label="Nome"
                variant="outlined"
                autoComplete="off"
                name="name"
                value={roleForm?.name || selectedRole?.name || ""}
                onChange={handleInputChange}
                required
              />

              <Divider />

              <TreePermission
                name="permissions"
                permissions={permissions || []}
                value={
                  (roleForm.permissions as number[]) ||
                  (selectedRole?.permissions as number[]) ||
                  []
                }
                onChange={(permissions) =>
                  setRoleForm((prev) => ({ ...prev, permissions }))
                }
              />
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Roles;
