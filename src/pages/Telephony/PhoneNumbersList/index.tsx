import { Button, Chip } from "@material-ui/core";
import { MouseEvent, useCallback } from "react";
import { FiLink } from "react-icons/fi";
import { MdClose } from "react-icons/md";

import ButtonComponent from "../../../components/Button";
import Divider from "../../../components/Divider";
import PhoneNumber from "../../../models/PhoneNumber";

import { Container, NumberList, SelectedNumberList } from "./styles";

interface PhoneNumberListProps {
  phoneNumbers: PhoneNumber[];
  value: PhoneNumber[];
  onChange: (phoneNumbers: PhoneNumber[]) => void;
  handleBindClick?: (ev: MouseEvent<HTMLButtonElement>) => void;
}

const PhoneNumberList: React.FC<PhoneNumberListProps> = ({
  phoneNumbers,
  value,
  onChange,
  handleBindClick,
}) => {
  const handleNumber = useCallback(
    (
      ev: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
      id: number
    ) => {
      const selected = value.find((number) => number.id === id);

      if (selected) onChange(value.filter((number) => number.id !== id));
      else {
        const lastNumberClicked = phoneNumbers.find(
          (number) => number.id === id
        );

        if (lastNumberClicked) {
          var toAdd: PhoneNumber[] = [];

          if (ev.shiftKey && value.length) {
            const index = value.length - 1;

            var firstSufix = Number(value[index].sufix);
            var lastSufix = Number(lastNumberClicked.sufix);
            var inverse = false;

            if (firstSufix > lastSufix) {
              firstSufix += lastSufix;
              lastSufix = firstSufix - lastSufix;
              firstSufix -= lastSufix;
              inverse = true;
            }

            const betweenNumbers = phoneNumbers.filter(
              (number) =>
                !value.find((selected) => selected.id === number.id) &&
                Number(number.sufix) > firstSufix &&
                Number(number.sufix) < lastSufix
            );

            if (inverse)
              betweenNumbers.sort((a, b) => {
                if (Number(a.sufix) < Number(b.sufix)) return 1;

                if (Number(a.sufix) > Number(b.sufix)) return -1;

                return 0;
              });

            toAdd = toAdd.concat(betweenNumbers);
          }

          onChange(value.concat(toAdd, lastNumberClicked));
        }
      }
    },
    [phoneNumbers, value, onChange]
  );

  const getNumberClassName = useCallback(
    (number: PhoneNumber) => {
      var className = "";

      if (number.portability) className += " portability";

      if (number.gold) className += " gold";

      if (value.find((_number) => _number.id === number.id))
        className += " selected";

      return className;
    },
    [value]
  );

  return (
    <Container>
      {Boolean(value.length) && (
        <>
          <SelectedNumberList>
            <div className="button-group">
              <ButtonComponent
                title="Associar números selecionados em um contrato"
                icon={<FiLink />}
                background="var(--secondary-dark)"
                onClick={handleBindClick}
              >
                Vincular
              </ButtonComponent>
              <ButtonComponent
                title="Remover os números selecionados da lista"
                icon={<MdClose />}
                background="var(--background)"
                color="var(--gray)"
                onClick={() => onChange([])}
              >
                Limpar
              </ButtonComponent>
            </div>

            <div className="list">
              {value.map((number) => (
                <Chip
                  key={number.id}
                  className={getNumberClassName(number)}
                  label={number.number}
                  onDelete={(ev) => handleNumber(ev, Number(number.id))}
                />
              ))}
            </div>
          </SelectedNumberList>

          <Divider />
        </>
      )}

      <NumberList>
        {phoneNumbers.map((number) => (
          <Button
            key={number.id}
            className={getNumberClassName(number)}
            title={
              (number.portability
                ? "Portabilidade | "
                : number.gold
                ? "Gold | "
                : "") + number.number
            }
            onClick={(ev) => handleNumber(ev, Number(number.id))}
          >
            {number.portability ? number.number : number.sufix}
          </Button>
        ))}
      </NumberList>
    </Container>
  );
};

export default PhoneNumberList;
