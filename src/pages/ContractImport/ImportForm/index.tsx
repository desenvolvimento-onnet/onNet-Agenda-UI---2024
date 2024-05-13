import { ChangeEvent, FormEvent, MouseEvent, useState, useEffect } from "react";

import { FiDownload } from "react-icons/fi";
import {
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";

import { notificate } from "../../../global/notificate";
import { BsPlusCircleFill } from "react-icons/bs";
import SystemService, {
  SystemContractParams,
} from "../../../services/SystemService";

import System from "../../../models/System";
import Button from "../../../components/Button";

import { Container } from "./styles";

export interface ImportFormProps {
  selectedSystem?: System;
  value: SystemContractParams;
  disableButtons?: boolean;
  onChange?: (
    ev: ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | { name: string; value?: any }
    >,
    system?: System
  ) => void;
  onSubmit?: (ev: FormEvent, data: SystemContractParams) => void;
  onAddClick?: (ev: MouseEvent<HTMLButtonElement>) => void;
}

const ImportForm: React.FC<ImportFormProps> = ({
  selectedSystem,
  value,
  disableButtons,
  onChange,
  onSubmit,
  onAddClick,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [systems, setSystems] = useState<System[]>([]);

  useEffect(() => {
    setIsLoading(true);

    SystemService.index({ active: 1 })
      .then((response) => setSystems(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.data}`,
          message: "Ocorreu um erro ao carregar os sistemas",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [setSystems, setIsLoading]);

  useEffect(() => {
    if (systems.length && onChange)
      onChange(
        { target: { name: "system" } } as ChangeEvent<{
          name: string;
          value?: any;
        }>,
        systems[0]
      );
  }, [onChange, systems]);

  return (
    <Container
      onSubmit={(ev) => {
        ev.preventDefault();

        onSubmit && onSubmit(ev, value);
      }}
    >
      {isLoading ? (
        <CircularProgress className="centralize" size={50} />
      ) : (
        <>
          <RadioGroup
            name="system"
            className="system"
            value={selectedSystem?.id || ""}
            onChange={(ev) => {
              const system = systems.find(
                (system) => system.id === Number(ev.target.value)
              );

              if (system && onChange) onChange(ev, system);
            }}
          >
            {systems.map((system, i) => (
              <div key={system.id}>
                {i > 0 && <span>|</span>}

                <FormControlLabel
                  value={system.id}
                  control={<Radio color="primary" />}
                  label={system.name}
                  style={{ margin: 0 }}
                  disabled={disableButtons || isLoading}
                />
              </div>
            ))}
          </RadioGroup>

          <div className="input-group">
            {selectedSystem?.short_name === "HubSoft" && (
              <TextField
                label="N° Cliente"
                variant="outlined"
                type="number"
                name="client_number"
                value={value.client_number || ""}
                onChange={onChange}
                required
                autoComplete="off"
                disabled={disableButtons || isLoading}
              />
            )}

            <TextField
              label={`N° ${
                selectedSystem?.short_name === "HubSoft"
                  ? "Serviço"
                  : "Contrato"
              }`}
              variant="outlined"
              type="number"
              name="contract_number"
              value={value.contract_number || ""}
              onChange={onChange}
              disabled={disableButtons || isLoading}
              autoComplete="off"
              required
            />
          </div>
        </>
      )}

      <Button
        title="Importar"
        icon={<FiDownload />}
        background="var(--info)"
        type="submit"
        disabled={disableButtons || isLoading}
      >
        Importar
      </Button>

      <Button
        title="Adicionar um novo"
        icon={<BsPlusCircleFill />}
        background="var(--success)"
        onClick={onAddClick}
        disabled={disableButtons || isLoading}
        type="button"
      >
        Novo
      </Button>
    </Container>
  );
};

export default ImportForm;
