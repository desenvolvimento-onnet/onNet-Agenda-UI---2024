import { useEffect, useState, useMemo } from "react";

import { padronize } from "../../../../../global/globalFunctions";

import KeyTemplate, { FuncProp } from "../../../../../models/KeyTemplate";
import Divider from "../../../../../components/Divider";
import TabBar from "../TabBar";

interface FunctionsTabProps {
  active: boolean;
}

const AccordionChildren: React.FC = () => {
  return (
    <div className="accordion-container">
      <ul>
        <li>
          {" "}
          Para cada função escolhida, esta deve estar entre chaves duplas{" "}
          {`{ {`}&nbsp;&nbsp;&nbsp;{`} }`}
        </li>
        <li>
          Durante a impressão, todas as funções serão executadas e substituídas
          por seu resultado.
        </li>
        <li>
          Toda função, exceto <strong>inteiro(...)</strong> e <strong>compara(...)</strong>, irá retornar um
          número com duas casas decimais.
        </li>
        <li>Cada parâmetro deve estar separado por vírgula.</li>
        <li>Toda a formatação será mantida durante a impressão.</li>
      </ul>

      <Divider />

      <div className="line">
        <div className="exemple">
          <h4>Exemplo de entrada 1:</h4>
          <span>
            1 + 2 + 3 é igual a <strong>{`{{ soma(1, 2, 3) }}`}</strong>
          </span>
        </div>

        <div className="exemple">
          <h4>Exemplo de saída 1:</h4>
          <span>
            1 + 2 + 3 é igual a <strong>6.00</strong>
          </span>
        </div>
      </div>


      <div className="exemple-group">
        <ul>
          <li>
            É possível passar uma variável numérica como parâmetro, por exemplo{" "}
            <strong>[[ duracao_fidelidade ]]</strong> representando o número 12.
          </li>
        </ul>

        <Divider />

        <div className="line">
          <div className="exemple">
            <h4>Exemplo de entrada 3:</h4>
            <span>
              39.90 x 12 é igual a{" "}
              <strong>{`{{ multiplica(39.90, [[ duracao_fidelidade ]]) }}`}</strong>
            </span>
          </div>

          <div className="exemple">
            <h4>Exemplo de saída 3:</h4>
            <span>
              39.90 x 12 é igual a <strong>478.80</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="exemple-group">
        <ul>
          <li>
            É possível passar como parâmetro uma nova{" "}
            <strong>Função Simples</strong> e sem chaves.
          </li>
        </ul>

        <Divider />

        <div className="line">
          <div className="exemple">
            <h4>Exemplo de entrada 2:</h4>
            <span>
              2 x (2 + 2) é igual a{" "}
              <strong>{`{{ multiplica(2, soma(2, 2)) }}`}</strong>
            </span>
          </div>

          <div className="exemple">
            <h4>Exemplo de saída 2:</h4>
            <span>
              2 x (2 + 2) é igual a <strong>8.00</strong>
            </span>
          </div>
        </div>
      </div>

      <p className="small">
        <strong>Função Simples</strong>: Função que aceita somente números ou
        variáveis numéricas como parâmetro. Não aceita novas funções como
        parâmetro.
      </p>
            <Divider />

      <p className="small">
        <strong>*Atenção</strong>: Utilize somente números ou variáveis
        numéricas como parâmetro. Não coloque espaços entre as chaves.
      </p>
    </div>
  );
};

const FunctionsTab: React.FC<FunctionsTabProps> = ({ active }) => {
  const [query, setQuery] = useState<string>("");
  const [funcs, setFuncs] = useState<FuncProp[]>([]);

  const funcsFiltered = useMemo(() => {
    const value = padronize(query);

    return funcs.filter(
      (func) =>
        padronize(func.name).indexOf(value) > -1 ||
        padronize(func.description).indexOf(value) > -1
    );
  }, [query, funcs]);

  useEffect(() => {
    const data = new KeyTemplate().funcs;

    data.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;

      return 0;
    });

    setFuncs(data);
  }, [setFuncs]);

  return (
    <TabBar
      active={active}
      accordionChildren={<AccordionChildren />}
      queryValue={query}
      onQueryChange={(ev) => setQuery(ev.target.value)}
    >
      <ul>
        {funcsFiltered.map((func) => (
          <li key={func.name}>
            <strong>{`{{ ${func.name}(...) }}`}</strong>: {func.description}
          </li>
        ))}
      </ul>
    </TabBar>
  );
};

export default FunctionsTab;
