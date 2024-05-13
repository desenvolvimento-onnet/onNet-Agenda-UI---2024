import styled from "styled-components";

export const Container = styled.form`
  display: grid;
  align-items: flex-end;
  grid-template-columns: 1fr 0.5fr 0.5fr auto auto;

  padding: .5rem;

  gap: 1.5rem;

  .switch-label {
    margin: 0 1rem !important;

    span {
      font-size: 10pt;
    }
  }
`;
