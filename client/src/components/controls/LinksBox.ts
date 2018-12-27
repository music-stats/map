import * as L from 'leaflet';

import {LinksBoxLinks} from 'src/types/config';
import {CustomControl} from 'src/types/elements';
import {html} from 'src/utils/render';

import './LinksBox.scss';

interface LinksBoxProps {
  links: LinksBoxLinks;
  toggleAnimationDuration: number;
}

export default class LinksBox extends L.Control implements CustomControl {
  element: HTMLElement;
  tagName: string;
  className: string;
  props: LinksBoxProps;

  constructor(
    options: L.ControlOptions,
    tagName: string,
    className: string,
    props: LinksBoxProps,
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
