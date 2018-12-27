import * as L from 'leaflet';

import {CustomControl, Animation} from 'src/types/elements';
import {html} from 'src/utils/render';

import './Legend.scss';

export interface AreaListItemProps {
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

export interface AreaListItemAnimatedProps extends AreaListItemProps {
  animation: Animation;
}

interface LegendProps {
  areaList: AreaListItemProps[];
  toggleAnimationDuration: number;
  onListItemMouseEnter: (areaName: string) => void;
  onListItemMouseLeave: (areaName: string) => void;
  onListItemMouseClick: (areaName: string) => void;
}

export default class Legend extends L.Control implements CustomControl {
  element: HTMLElement;
  tagName: string;
  className: string;
  private props: LegendProps;

  constructor(
    options: L.ControlOptions,
    tagName: string,
    className: string,
    props: LegendProps,
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
      this.element.querySelectorAll('.Legend__area'),
      this.subscribeListItemElement.bind(this),
    );
  }

  private subscribeListItemElement(listItemElement: HTMLElement) {
    const {onListItemMouseEnter, onListItemMouseLeave, onListItemMouseClick} = this.props;
    const {name: areaName} = listItemElement.dataset;

    const onMouseEnter = () => onListItemMouseEnter(areaName);
    const onMouseLeave = () => onListItemMouseLeave(areaName);
    const onClick = () => onListItemMouseClick(areaName);

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

  private renderAreaListItem(
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
    }: AreaListItemAnimatedProps,
    index: number,
  ): string {
    // "data-name" is used for binding mouse events
    return `
      <li
        class="Legend__area"
        data-name="${name}"
      >
        <div
          class="Legend__area-scale-container"
          style="
            animation-duration: ${animation.duration}ms;
            animation-delay: ${animation.delay}ms;
          "
        >
          <div
            class="Legend__area-scale Legend__area-scale--top"
            style="
              width: ${artistCountBgWidthPercent}%;
              background-color: ${color};
            "
          >
          </div>

          <div
            class="Legend__area-scale Legend__area-scale--bottom"
            style="
              width: ${scrobbleCountBgWidthPercent}%;
              background-color: ${color};
            "
          >
          </div>
        </div>

        <div
          class="Legend__area-rank"
          style="
            color: ${rankColor};
            background-color: ${color};
          "
        >
          <div
            class="Legend__area-flag"
            style="
              background-image: url('${flagDataUrl}');
            "
          >
          </div>
          <span>#${index + 1}</span>
        </div>

        <span
          class="Legend__area-name"
          style="
            color: ${rankColor};
          "
        >
          ${name}
        </span>

        <span
          class="Legend__area-stats"
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
    const {areaList} = this.props;

    return html`
      <ul
        class="Legend__area-list"
      >
        ${areaList.map(this.renderAreaListItem).join('')}
      </ul>
    `;
  }
}
