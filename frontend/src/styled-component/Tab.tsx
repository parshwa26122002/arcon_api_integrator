import { styled } from "styled-components";

interface TabProps {
    active: boolean;
}

export const Tab = styled.button<TabProps>`
  padding: 6px 24px;
  background-color: transparent;
  border: none;
  // color: ${props => props.active ? '#e1e1e1' : '#999999'};
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : 'normal'};
  border-bottom: solid ${props => props.active ? '#7d4acf' : 'transparent'};
  flex: 1;
  transition: all 0.2s;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  &:hover {
    color: #e1e1e1;
    background-color: #383838;
  }
`;