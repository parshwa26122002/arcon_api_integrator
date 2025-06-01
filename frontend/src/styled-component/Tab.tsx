import { styled } from "styled-components";

interface TabProps {
    active: boolean;
}

export const Tab = styled.button<TabProps>`
  padding: 6px 24px;
  background-color: transparent;
  border: none;
  color: ${props => props.active ? 'var(--color-text)' : 'var(--color-muted)'};
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : 'normal'};
  border-bottom: solid ${props => props.active ? 'var(--color-tab-active)' : 'transparent'};
  flex: 1;
  transition: all 0.2s;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  &:hover {
    color: var(--color-text);
    background-color: var(--color-panel-alt);
  }
`;