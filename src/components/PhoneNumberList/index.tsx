import React, {
  HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Button, Menu, MenuItem } from "@material-ui/core";
import { RiMedal2Fill } from "react-icons/ri";
import { MdEdit, MdMoreVert, MdPhonelinkLock } from "react-icons/md";
import { FiEye, FiLink, FiLock, FiTrash2 } from "react-icons/fi";
import { GiBreakingChain } from "react-icons/gi";
import { CgBlock } from "react-icons/cg";

import { Table, TBody, Td, Th, THead } from "../Table";
import { AuthContext } from "../../global/context/AuthContext";
import { InfoCoin, InfoCoinContainer } from "../InfoCoin";

import PhoneNumber from "../../models/PhoneNumber";
import Pagination from "../../models/Pagination";
import PaginateFooter from "../PaginateFooter";

import { Container } from "./styles";

import MessageInfo from "../MessageInfo";
import useNumberDialog from "../Dialogs/PhoneNumberDialogs/context/useNumberDialog";
import { IoIosLock } from "react-icons/io";
import { BsLock, BsUnlock } from "react-icons/bs";

interface PhoneNumberListProps extends HTMLAttributes<HTMLTableElement> {
  phoneNumbers: Pagination<PhoneNumber>;
  onReload?: (page: number, perPage: number) => void;
}

const PhoneNumberList: React.FC<PhoneNumberListProps> = ({
  phoneNumbers,
  children,
  onReload,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);
  const {
    viewNumberDialog,
    addNumberDialog,
    bindNumberDialog,
    unbindNumberDialog,
    reserveNumberDialog,
    deleteNumberDialog,
  } = useNumberDialog();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPhoneNumber, setSelectedPhoneNumber] =
    useState<PhoneNumber | null>(null);

  const handleMoreClick = useCallback(
    (ev: React.MouseEvent<HTMLButtonElement>, phoneNumber: PhoneNumber) => {
      setSelectedPhoneNumber(phoneNumber);
      setAnchorEl(ev.currentTarget);
    },
    [setSelectedPhoneNumber, setAnchorEl]
  );

  useEffect(() => {
    if (!anchorEl) setSelectedPhoneNumber(null);
  }, [anchorEl, setSelectedPhoneNumber]);

  return (
    <>
      <Container>
        {Boolean(phoneNumbers.data.length) ? (
          <>
            <Table cellSpacing={3} {...props}>
              <THead>
                <tr>
                  <Th>Número</Th>
                  <Th>Cidade</Th>
                  <Th noContent></Th>
                  <Th>Cliente</Th>
                  <Th>N° Contrato</Th>
                  <Th short></Th>
                </tr>
              </THead>
              <TBody>
                {phoneNumbers.data.map((phoneNumber) => (
                  <tr key={phoneNumber.id}>
                    <Td>{phoneNumber.number}</Td>
                    <Td>{phoneNumber.city?.name}</Td>
                    <Td noBackground noContent>
                      {Boolean(
                        !phoneNumber.active ||
                          phoneNumber.alocated ||
                          phoneNumber.reserved ||
                          phoneNumber.gold ||
                          phoneNumber.portability
                      ) && (
                        <InfoCoinContainer>
                          {Boolean(phoneNumber.gold) && (
                            <InfoCoin
                              icon={<RiMedal2Fill />}
                              title="Gold"
                              type="gold"
                            />
                          )}

                          {Boolean(phoneNumber.portability) && (
                            <InfoCoin
                              icon={<MdPhonelinkLock />}
                              title="Portabilidade"
                              type="iceGreen"
                            />
                          )}

                          {Boolean(phoneNumber.alocated) && (
                            <InfoCoin
                              icon={<FiLink />}
                              title="Alocado"
                              type="blue"
                            />
                          )}

                          {Boolean(phoneNumber.reserved) && (
                            <InfoCoin
                              icon={<IoIosLock />}
                              title="Reservado"
                              type="orange"
                            />
                          )}

                          {!phoneNumber.active && (
                            <InfoCoin
                              icon={<CgBlock />}
                              title="Inativo"
                              type="red"
                            />
                          )}
                        </InfoCoinContainer>
                      )}
                    </Td>
                    <Td>{phoneNumber.contract?.client}</Td>
                    <Td>
                      {phoneNumber.contract?.client_number
                        ? `${phoneNumber.contract?.client_number} (${phoneNumber.contract?.contract_number})`
                        : phoneNumber.contract?.contract_number}
                    </Td>
                    <Td short noBackground>
                      <Button
                        onClick={(ev) => handleMoreClick(ev, phoneNumber)}
                      >
                        <MdMoreVert size={24} />
                      </Button>
                    </Td>
                  </tr>
                ))}
              </TBody>
            </Table>

            <PaginateFooter
              pagination={{ ...phoneNumbers }}
              onReload={onReload}
            />
          </>
        ) : (
          <MessageInfo>Nenhum número encontrado</MessageInfo>
        )}
      </Container>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={useCallback(() => setAnchorEl(null), [setAnchorEl])}
        MenuListProps={{ style: { minWidth: "4rem" } }}
      >
        {Boolean(userPermissions?.phone_number.show) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);

              selectedPhoneNumber &&
                viewNumberDialog(Number(selectedPhoneNumber.id));
            }}
            disabled={!anchorEl || !selectedPhoneNumber}
          >
            <FiEye />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Visualizar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.phone_number.edit) && (
          <MenuItem
            onClick={() => {
              selectedPhoneNumber &&
                addNumberDialog(
                  { phoneNumberId: selectedPhoneNumber.id },
                  (success) =>
                    success &&
                    onReload &&
                    onReload(phoneNumbers.page, phoneNumbers.perPage)
                );

              setAnchorEl(null);
            }}
            disabled={!anchorEl || !selectedPhoneNumber}
          >
            <MdEdit />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Editar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.phone_number.bind.allow) &&
          !Boolean(selectedPhoneNumber?.alocated) && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);

                selectedPhoneNumber &&
                  bindNumberDialog(
                    [Number(selectedPhoneNumber.id)],
                    Number(selectedPhoneNumber.city_id),
                    (success) =>
                      success &&
                      onReload &&
                      onReload(phoneNumbers.page, phoneNumbers.perPage)
                  );
              }}
              disabled={
                !anchorEl ||
                !selectedPhoneNumber ||
                selectedPhoneNumber.reserved ||
                (!selectedPhoneNumber.alocated && !selectedPhoneNumber.active)
              }
            >
              <FiLink />
              <span className="menu-option" style={{ marginLeft: 10 }}>
                Alocar
              </span>
            </MenuItem>
          )}

        {Boolean(userPermissions?.phone_number.unbind) &&
          Boolean(selectedPhoneNumber?.alocated) && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);

                selectedPhoneNumber &&
                  unbindNumberDialog(
                    Number(selectedPhoneNumber.id),
                    (success) =>
                      success &&
                      onReload &&
                      onReload(phoneNumbers.page, phoneNumbers.perPage)
                  );
              }}
              disabled={
                !anchorEl ||
                !selectedPhoneNumber ||
                selectedPhoneNumber.reserved ||
                (!selectedPhoneNumber.alocated && !selectedPhoneNumber.active)
              }
            >
              <GiBreakingChain />
              <span className="menu-option" style={{ marginLeft: 10 }}>
                Desvincular
              </span>
            </MenuItem>
          )}

        {Boolean(userPermissions?.phone_number.reserve) &&
          !Boolean(selectedPhoneNumber?.reserved) && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);

                selectedPhoneNumber &&
                  reserveNumberDialog(
                    Number(selectedPhoneNumber.id),
                    (success) =>
                      success &&
                      onReload &&
                      onReload(phoneNumbers.page, phoneNumbers.perPage)
                  );
              }}
              disabled={
                !anchorEl ||
                !selectedPhoneNumber ||
                selectedPhoneNumber.alocated
              }
            >
              <BsLock />
              <span className="menu-option" style={{ marginLeft: 10 }}>
                Reservar
              </span>
            </MenuItem>
          )}

        {Boolean(userPermissions?.phone_number.release) &&
          Boolean(selectedPhoneNumber?.reserved) && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);

                selectedPhoneNumber &&
                  reserveNumberDialog(
                    Number(selectedPhoneNumber.id),
                    (success) =>
                      success &&
                      onReload &&
                      onReload(phoneNumbers.page, phoneNumbers.perPage)
                  );
              }}
              disabled={
                !anchorEl ||
                !selectedPhoneNumber ||
                selectedPhoneNumber.alocated
              }
            >
              <BsUnlock />
              <span className="menu-option" style={{ marginLeft: 10 }}>
                Liberar
              </span>
            </MenuItem>
          )}

        {Boolean(userPermissions?.phone_number.delete) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);

              selectedPhoneNumber &&
                deleteNumberDialog(
                  Number(selectedPhoneNumber.id),
                  (success) =>
                    success &&
                    onReload &&
                    onReload(phoneNumbers.page, phoneNumbers.perPage)
                );
            }}
            disabled={
              !anchorEl || !selectedPhoneNumber || selectedPhoneNumber.alocated
            }
          >
            <FiTrash2 />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Deletar
            </span>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default memo(PhoneNumberList);
