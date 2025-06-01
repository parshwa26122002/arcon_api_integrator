import { styled } from "styled-components";

export const AddButton = styled.button`
padding: 8px;
background-color: var(--color-panel-alt);
border: 1px solid var(--color-border);
border-radius: 4px;
color: var(--color-text);
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;

&:hover {
  background-color: var(--color-border);
}

svg {
  font-size: 14px;
}
`;