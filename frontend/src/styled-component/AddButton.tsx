import { styled } from "styled-components";

export const AddButton = styled.button`
padding: 8px;
background-color: #383838;
border: 1px solid #4a4a4a;
border-radius: 4px;
color: #e1e1e1;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;

&:hover {
  background-color: #4a4a4a;
}

svg {
  font-size: 14px;
}
`;