import { useEffect, useState, useMemo } from "react";

import { padronize } from "../../../../../global/globalFunctions";

import KeyTemplate, { ListProp } from "../../../../../models/KeyTemplate";
import Divider from "../../../../../components/Divider";
import TabBar from "../TabBar";

interface ListsTabProps {
  active: boolean;
}

const AccordionChildren: React.FC = () => {
  return (
    <div className="accordion-container">
      <ul>
        <li>
          Para cada lista escolhida, esta deve estar entre o par de sinais Menor
          Maior {`< <`}&nbsp;&nbsp;&nbsp;{`> >`}
        </li>
        <li>
          Para uma lista funcionar, é necessário ter um gatilho de ativação.
          <br />
          Este recebe a segunte estrutura{" "}
          <strong>{`<< $lista(id, titulo) >>`}</strong>, onde:
          <ul>
            <li>
              <strong>$lista</strong>: Representa o nome da lista escolhida.
            </li>
            <br />
            <li>
              <strong>id</strong>: ID único referente a tag HTML que será
              duplicada. Exemplo:
              <div className="exemple">
                <span>{`<tr id="lista-1">...</tr>`}</span>
              </div>
            </li>
            <br />
            <li>
              <strong>titulo</strong>: Este é um parâmetro opcional, que fará
              com que o texto do gatilho seja substituído pelo conteúdo do
              parâmetro. Caso este parâmetro esteja vazio, a linha do gatilho
              será apagada.
            </li>
          </ul>
        </li>
        <li>
          Todo atributo da lista escolhida deverá estar inserido dentro da tag
          HTML com o ID referenciado no gatilho dessa lista. Cada atributo
          recebe a seguinte estrutura <strong>{`<< lista(atributo) >>`}</strong>
          , onde:
          <ul>
            <li>
              <strong>lista</strong>: Representa o nome da lista escolhida.
            </li>
            <br />
            <li>
              <strong>atributo</strong>: Representa o nome do atributo
              escolhido.
            </li>
          </ul>
        </li>
        <li>
          Durante a impressão, tanto os gatilhos quanto os atributos da lista
          serão substituídos pelos valores especificados.
        </li>
        <li>Toda a formatação será mantida durante a impressão.</li>{" "}
      </ul>

      <Divider />

      <div className="exemple">
        <h4>Exemplo de entrada:</h4>
        <span>
          <strong>{`<< $produtos(lista1, Lista de Produtos:) >>`}</strong>{" "}
          <br />
          <br />
          {`<< produtos(nome) >> - R$ << produtos(valor) >>`}
        </span>
        <p>Ajuste de ID na tag HTML dos atributos</p>
        <span>{`<p id="lista1"> << produtos(nome) >> - R$ << produtos(valor) >> </p>`}</span>
      </div>

      <div className="exemple">
        <h4>Exemplo de saída:</h4>
        <span>
          <strong>Lista de Produtos:</strong>
          <br />
          <br />
          Produto A - R$ 10.00 <br />
          Produto B - R$ 60.00 <br />
          Produto C - R$ 40.00 <br />
        </span>
      </div>

      <Divider />

      <p className="small">
        <strong>*Atenção</strong>: Insira somente a chamada do gatilho/atribito
        dentro do par sinais Maior Menor. Não coloque espaços entre os sinais
        Maior Menor.
      </p>
    </div>
  );
};

const ListsTab: React.FC<ListsTabProps> = ({ active }) => {
  const [query, setQuery] = useState<string>("");
  const [lists, setLists] = useState<ListProp[]>([]);

  const listsFiltered = useMemo(() => {
    const value = padronize(query);
    const dataLists: ListProp[] = [];

    lists.forEach((list) => {
      const keys =
        padronize(list.name).indexOf(value) > -1 ||
        padronize(list.description).indexOf(value) > -1
          ? list.keys[0]
          : list.keys[0].filter(
              (key) =>
                padronize(key.name).indexOf(value) > -1 ||
                padronize(key.description).indexOf(value) > -1
            );

      dataLists.push({ ...list, keys: [keys] });
    });

    return dataLists.filter(
      (list) =>
        padronize(list.name).indexOf(value) > -1 ||
        padronize(list.description).indexOf(value) > -1 ||
        list.keys[0].length
    );
  }, [query, lists]);

  useEffect(() => {
    const data = new KeyTemplate().lists;

    data.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;

      return 0;
    });

    data.forEach((list) =>
      list.keys[0].sort((a, b) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;

        return 0;
      })
    );

    setLists(data);
  }, [setLists]);

  return (
    <TabBar
      active={active}
      accordionChildren={<AccordionChildren />}
      queryValue={query}
      onQueryChange={(ev) => setQuery(ev.target.value)}
    >
      <ul>
        {listsFiltered.map((list) => (
          <li key={list.name}>
            <strong>{`<< $${list.name}(...) >>`}</strong>: {list.description}
            <ul>
              {list.keys[0].map((listKey) => (
                <li key={listKey.name}>
                  <strong>{`<< ${list.name}(${listKey.name}) >>`}</strong>:{" "}
                  {listKey.description}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </TabBar>
  );
};

export default ListsTab;
