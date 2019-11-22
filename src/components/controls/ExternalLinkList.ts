import * as L from 'leaflet';

import {ExternalLinkListConfig} from 'src/types/config';
import {CustomControl} from 'src/types/elements';
import html from 'src/lib/html';

import './ExternalLinkList.scss';

interface ExternalLinkListProps {
  links: ExternalLinkListConfig;
  toggleAnimationDuration: number;
}

export default class ExternalLinkList extends L.Control implements CustomControl {
  element: HTMLElement;
  tagName: string;
  className: string;
  props: ExternalLinkListProps;

  constructor(
    options: L.ControlOptions,
    tagName: string,
    className: string,
    props: ExternalLinkListProps,
  ) {
    super(options);

    this.tagName = tagName;
    this.className = className;
    this.props = props;
  }

  public onAdd() {
    const {toggleAnimationDuration} = this.props;

    this.element = L.DomUtil.create(this.tagName, this.className);
    this.element.innerHTML = this.render();
    this.element.style.transitionDuration = `${toggleAnimationDuration}ms`;

    return this.element;
  }

  private renderLinkListItem(url: string, text: string, label: string): string {
    return html`
      <li>
        <span>
          ${label}:${' '}
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

  private render(): string {
    const {github, twitter} = this.props.links;

    return html`
      <ul>
        ${this.renderLinkListItem(github.url, github.text, 'GitHub')}
        ${this.renderLinkListItem(twitter.url, twitter.text, 'Twitter')}
      </ul>
    `;
  }
}
