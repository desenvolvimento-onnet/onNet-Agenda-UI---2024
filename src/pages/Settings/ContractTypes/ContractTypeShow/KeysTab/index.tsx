import { useEffect, useState, useMemo } from "react";

import { padronize } from "../../../../../global/globalFunctions";

import KeyTemplate, { KeyProp } from "../../../../../models/KeyTemplate";
import Divider from "../../../../../components/Divider";
import TabBar from "../TabBar";

interface KeysTabProps {
  active: boolean;
}

const AccordionChildren: React.FC = () => {
  return (
    <div className="accordion-container">
      <ul>
        <li>
          Para cada variável escolhida, esta deve estar entre colchetes duplos [
          [&nbsp;&nbsp;&nbsp;] ]
        </li>
        <li>
          Durante a impressão, todas as variáveis serão substituídas pelos
          valores específicos daquele contrato.
        </li>
        <li>Toda a formatação será mantida durante a impressão.</li>
      </ul>

      <Divider />

      <div className="exemple">
        <h4>Exemplo de entrada:</h4>
        <span>[[ cidade ]] - [[ uf ]]</span>
      </div>

      <div className="exemple">
        <h4>Exemplo de saída:</h4>
        <span>Patrocínio - MG</span>
      </div>

      <Divider />

      <p className="small">
        <strong>*Atenção</strong>: Insira somente o nome da variável dentro do
        par de colchetes. Não coloque espaços entre os colchetes.
      </p>
    </div>
  );
};

const KeysTab: React.FC<KeysTabProps> = ({ active }) => {
  const [query, setQuery] = useState<string>("");
  const [keys, setKeys] = useState<KeyProp[]>([]);

  const keysFiltered = useMemo(() => {
    const value = padronize(query);

    return keys.filter(
      (key) =>
        padronize(key.name).indexOf(value) > -1 ||
        padronize(key.description).indexOf(value) > -1
    );
  }, [query, keys]);

  useEffect(() => {
    const data = new KeyTemplate().keys;

    data.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;

      return 0;
    });

    setKeys(data);
  }, [setKeys]);

  return (
    <TabBar
      active={active}
      accordionChildren={<AccordionChildren />}
      queryValue={query}
      onQueryChange={(ev) => setQuery(ev.target.value)}
    >
      <ul>
        {keysFiltered.map((key) => (
          <li key={key.name}>
            <strong>[[ {key.name} ]]</strong>: {key.description}
          </li>
        ))}
      </ul>
    </TabBar>
  );
};

export default KeysTab;
