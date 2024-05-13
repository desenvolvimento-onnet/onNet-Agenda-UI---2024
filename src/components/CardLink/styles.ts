import styled from "styled-components";

import { Link } from "react-router-dom";

export const Container = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-width: 14rem;
  min-height: 8rem;

  padding: 1rem;

  gap: 0.5rem;

  color: var(--white);
  text-decoration: none;

  border-radius: 0.2rem;
  box-shadow: 3px 3px 8px 0 var(--box-shadow);
  background: var(--secondary);
  background: var(--linear-secondary);

  transition: all 0.2s;

  svg {
    font-size: 26pt;
  }

  h4 {
    font-family: "Catamaran";
  }

  &:hover {
    transform: scale(1.05);
  }
`;
