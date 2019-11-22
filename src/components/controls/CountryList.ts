import * as L from 'leaflet';

import {CustomControl, Animation} from 'src/types/elements';
import html from 'src/lib/html';

import './CountryList.scss';

export interface CountryListItemProps {
  name: string;
  flagDataUrl: string;
  artistCount: number;
  artistCountBgWidthPercent: number;
  scrobbleCount: number;
  scrobbleCountPercent: number;
  scrobbleCountBgWidthPercent: number;
  color: string;
  rankColor: string;
}

export interface CountryListItemAnimatedProps extends CountryListItemProps {
  animation: Animation;
}

interface CountryListProps {
  countryList: CountryListItemProps[];
  toggleAnimationDuration: number;
  onListItemMouseEnter: (countryName: string) => void;
  onListItemMouseLeave: (countryName: string) => void;
  onListItemMouseClick: (countryName: string) => void;
}

export default class CountryList extends L.Control implements CustomControl {
  element: HTMLElement;
  tagName: string;
  className: string;
  private props: CountryListProps;

  constructor(
    options: L.ControlOptions,
    tagName: string,
    className: string,
    props: CountryListProps,
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
    this.element.setAttribute('disabled', 'disabled');
    L.DomEvent.disableScrollPropagation(this.element);

    this.subscribe();

    return this.element;
  }

  private subscribe() {
    this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    Array.prototype.forEach.call(
      this.element.querySelectorAll('.CountryList__country'),
      this.subscribeListItemElement.bind(this),
    );
  }

  private subscribeListItemElement(listItemElement: HTMLElement) {
    const {onListItemMouseEnter, onListItemMouseLeave, onListItemMouseClick} = this.props;
    const {name: countryName} = listItemElement.dataset;

    const onMouseEnter = () => onListItemMouseEnter(countryName);
    const onMouseLeave = () => onListItemMouseLeave(countryName);
    const onClick = () => onListItemMouseClick(countryName);

    listItemElement.addEventListener('mouseenter', onMouseEnter);
    listItemElement.addEventListener('mouseleave', onMouseLeave);
    listItemElement.addEventListener('click', onClick);
  }

  private handleMouseEnter() {
    const {toggleAnimationDuration} = this.props;

    setTimeout(
      () => this.element.removeAttribute('disabled'),
      toggleAnimationDuration,
    );
  }

  private handleMouseLeave() {
    this.element.setAttribute('disabled', 'disabled');
  }

  private renderCountryListItem(
    {
      name,
      flagDataUrl,
      artistCount,
      artistCountBgWidthPercent,
      scrobbleCount,
      scrobbleCountPercent,
      scrobbleCountBgWidthPercent,
      color,
      rankColor,
      animation,
    }: CountryListItemAnimatedProps,
    index: number,
  ): string {
    // "data-name" is used for binding mouse events
    return html`
      <li
        class="CountryList__country"
        data-name="${name}"
      >
        <div
          class="CountryList__country-scale-container"
          style="
            animation-duration: ${animation.duration}ms;
            animation-delay: ${animation.delay}ms;
          "
        >
          <div
            class="CountryList__country-scale CountryList__country-scale--top"
            style="
              width: ${artistCountBgWidthPercent}%;
              background-color: ${color};
            "
          >
          </div>

          <div
            class="CountryList__country-scale CountryList__country-scale--bottom"
            style="
              width: ${scrobbleCountBgWidthPercent}%;
              background-color: ${color};
            "
          >
          </div>
        </div>

        <div
          class="CountryList__country-rank"
          style="
            color: ${rankColor};
            background-color: ${color};
          "
        >
          <div
            class="CountryList__country-flag"
            style="
              background-image: url('${flagDataUrl}');
            "
          >
          </div>
          <span>#${index + 1}</span>
        </div>

        <span
          class="CountryList__country-name"
          style="
            color: ${rankColor};
          "
        >
          ${name}
        </span>

        <span
          class="CountryList__country-stats"
        >
          <span>
            ${scrobbleCountPercent.toFixed(2)}%
          </span>

          <sup title="artists">
            ${artistCount.toLocaleString()}
          </sup>

          <sub title="scrobbles">
            ${scrobbleCount.toLocaleString()}
          </sub>
        </span>
      </li>
    `;
  }

  private render(): string {
    const {countryList} = this.props;

    return html`
      <ul
        class="CountryList__country-list"
      >
        ${countryList.map(this.renderCountryListItem)}
      </ul>
    `;
  }
}
