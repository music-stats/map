import {html} from 'src/utils/render';

import './LinksBox.scss';

interface Link {
  url: string;
  text: string;
}

interface LinkListItemProps extends Link {
  label: string;
}

function renderLinkListItem({
  url,
  text,
  label,
}: LinkListItemProps): string {
  return `
    <li>
      <span>
        ${label}:&nbsp;
      </span>
      <a
        href="${url}"
        target="_blank"
      >
        ${text}
      </a>
    </li>
  `;
}

interface LinksBoxProps {
  github: Link;
  twitter: Link;
}

export default function render({
  github,
  twitter,
}: LinksBoxProps): string {
  return html`
    <ul>
      ${renderLinkListItem({
        ...github,
        label: 'GitHub',
      })}

      ${renderLinkListItem({
        ...twitter,
        label: 'Twitter',
      })}
    </ul>
  `;
}
