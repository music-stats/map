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
        ${label}:
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
  return `
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
