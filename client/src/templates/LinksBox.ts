import './LinksBox.scss';

interface Link {
  url: string;
  text: string;
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
      <li>
        <span>
          GitHub:
        </span>
        <a
          href="${github.url}"
          target="_blank"
        >
          ${github.text}
        </a>
      </li>

      <li>
        <span>
          Twitter:
        </span>
        <a
          href="${twitter.url}"
          target="_blank"
        >
          ${twitter.text}
        </a>
      </li>
    </ul>
  `;
}
