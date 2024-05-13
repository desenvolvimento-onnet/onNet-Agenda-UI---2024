import "react-checkbox-tree/lib/react-checkbox-tree.css";

import React, {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import _ from "lodash";
import CheckboxTree, { Node } from "react-checkbox-tree";

import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { AiFillFolder, AiFillFolderOpen } from "react-icons/ai";
import { BiShield } from "react-icons/bi";
import { TextField } from "@material-ui/core";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdIndeterminateCheckBox,
} from "react-icons/md";

import { padronize } from "../../../../global/globalFunctions";

import { Container } from "./styles";

import Permission from "../../../../models/Permission";
import MessageInfo from "../../../../components/MessageInfo";

export const icons = {
  check: <MdCheckBox color="var(--primary-dark)" />,
  uncheck: <MdCheckBoxOutlineBlank />,
  halfCheck: <MdIndeterminateCheckBox />,
  expandClose: <IoIosArrowForward />,
  expandOpen: <IoIosArrowDown />,
  parentClose: <AiFillFolder color="var(--secondary-dark)" />,
  parentOpen: <AiFillFolderOpen color="var(--secondary-dark)" />,
  leaf: <BiShield color="var(--secondary-dark)" />,
};

interface Tree {
  expanded: string[];
  query: string;
}

interface TreePermissionProps {
  name?: string;
  permissions: Permission[];
  value: number[];
  onChange?: (checked: string[]) => void;
}

const TreePermission: React.FC<TreePermissionProps> = ({
  name,
  value,
  permissions,
  onChange,
}) => {
  const [tree, setTree] = useState<Tree>({
    expanded: [],
    query: "",
  });

  const getHighlightText = useCallback((text: string, query: string) => {
    const startIndex = text.indexOf(query);

    return startIndex !== -1 ? (
      <span>
        {text.substring(0, startIndex)}
        <span style={{ color: "#2cb664" }}>
          {text.substring(startIndex, startIndex + query.length)}
        </span>
        {text.substring(startIndex + query.length)}
      </span>
    ) : (
      <span>{text}</span>
    );
  }, []);

  const queryFilter = useCallback(
    (nodes: Node[], query) => {
      let newNodes = [];

      for (let n of nodes) {
        if (n.children) {
          const nextNodes = queryFilter(n.children, query);

          if (nextNodes.length > 0) n.children = nextNodes;
          else if (String(n.label).toLowerCase().includes(query.toLowerCase()))
            n.children = nextNodes.length > 0 ? nextNodes : [];

          if (
            nextNodes.length > 0 ||
            String(n.label).toLowerCase().includes(query.toLowerCase())
          ) {
            n.label = getHighlightText(String(n.label), query);
            newNodes.push(n);
          }
        } else {
          if (String(n.label).toLowerCase().includes(query.toLowerCase())) {
            n.label = getHighlightText(String(n.label), query);
            newNodes.push(n);
          }
        }
      }
      return newNodes;
    },
    [getHighlightText]
  );

  const getAllValuesFromNodes = useCallback(
    (nodes: Node[], firstLevel: boolean) => {
      if (firstLevel) {
        const values: string[] = [];

        for (let n of nodes) {
          values.push(n.value);

          if (n.children)
            values.push(...getAllValuesFromNodes(n.children, false));
        }

        return values;
      }
      const values: string[] = [];

      for (let n of nodes) {
        values.push(n.value);

        if (n.children)
          values.push(...getAllValuesFromNodes(n.children, false));
      }

      return values;
    },
    []
  );

  const onSearchInputChange = useCallback(
    (
      ev: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
      searchedNodes: Node[]
    ) => {
      const value = ev.target.value;

      setTree((prev) => {
        if (!padronize(prev.query) && !value.trim())
          return { ...prev, expanded: [], query: value };

        return {
          ...prev,
          expanded: getAllValuesFromNodes(searchedNodes, true),
          query: value,
        };
      });
    },
    [setTree, getAllValuesFromNodes]
  );

  const parsePermissions = useCallback(
    (permissionsToParse: Permission[]): Node[] => {
      const nodes = permissionsToParse.map(({ id, label }) => {
        const children = permissions.filter(
          (permission) => permission.parent_permission_id === id
        );

        return {
          label: `(${id}) ${label}`,
          value: String(id),
          children: children.length ? parsePermissions(children) : undefined,
        };
      });

      return nodes;
    },
    [permissions]
  );

  const nodes = useMemo(() => {
    const rootPermissions = permissions.filter(
      (permission) => !permission.parent_permission_id
    );

    const data = parsePermissions(rootPermissions);

    return data;
  }, [permissions, parsePermissions]);

  const searchedNodes = useMemo(
    () =>
      nodes && tree.query.trim()
        ? queryFilter(_.cloneDeep(nodes), tree.query)
        : nodes || [],
    [tree.query, queryFilter, nodes]
  );

  return (
    <Container>
      {nodes ? (
        nodes.length ? (
          <>
            <TextField
              placeholder="Buscar"
              type="search"
              variant="outlined"
              margin="dense"
              value={tree.query}
              onChange={(ev) => onSearchInputChange(ev, nodes)}
            />

            <CheckboxTree
              icons={icons}
              nodes={searchedNodes}
              checked={value.map((id) => String(id))}
              expanded={tree.expanded}
              name={name}
              onCheck={onChange}
              onExpand={(expanded) =>
                setTree((prev) => ({ ...prev, expanded }))
              }
            />
          </>
        ) : (
          <MessageInfo>Nenhuma permissão encontrada</MessageInfo>
        )
      ) : (
        <MessageInfo>
          Não foi possível carregar a lista de permissões
        </MessageInfo>
      )}
    </Container>
  );
};

export default memo(TreePermission);
