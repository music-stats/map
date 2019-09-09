import * as L from 'leaflet';
import classNames from 'classnames';

import {CustomControl} from 'src/types/elements';
import {Artist, AreaProperties} from 'src/types/models';
import {html, url} from 'src/utils/render';

import './AreaInfo.scss';

interface AreaInfoProps {
  username: string;
  totalAreaCount: number;
  totalArtistCount: number;
  totalScrobbleCount: number;
}

interface AreaInfoState {
  areaScrobbleCount: number;
  areaFlagDataUrl: string;
  areaProperties: AreaProperties;
}

export default class AreaInfo extends L.Control implements CustomControl {
  element: HTMLElement;
  tagName: string;
  className: string;
  private props: AreaInfoProps;
  private state: AreaInfoState;

  constructor(
    options: L.ControlOptions,
    tagName: string,
    className: string,
    props: AreaInfoProps,
  ) {
    super(options);

    this.tagName = tagName;
    this.className = className;
    this.props = props;
    this.state = this.getDefaultState();

    this.renderArtistListItem = this.renderArtistListItem.bind(this);
  }

  public onAdd() {
    this.element = L.DomUtil.create(this.tagName, this.className);
    this.rerender();
    L.DomEvent.disableScrollPropagation(this.element);

    this.listenToDocument();

    return this.element;
  }

  public setState(state?: AreaInfoState) {
    this.state = state
      ? state
      : this.getDefaultState();

    this.rerender();
  }

  private getDefaultState(): AreaInfoState {
    return {
      areaScrobbleCount: null,
      areaFlagDataUrl: null,
      areaProperties: null,
    };
  }

  private listenToDocument() {
    // listening to "document" instead of some "map.getContainer()"
    // because the latter will only catch events when the map is active,
    // i.e. when the map was just loaded and user hadn't clicked yet, events won't be caught
    document.addEventListener('keydown', this.handleDocumentKeydown.bind(this));
  }

  private subscribe() {
    // the close button is only shown when an area is highlighted
    if (this.state.areaProperties) {
      this.getCloseButtonElement().addEventListener('click', this.handleCloseButtonClick.bind(this));
    }
  }

  private getCloseButtonElement(): HTMLElement {
    return this.element.querySelector('.AreaInfo__close-button');
  }

  // A workaround to prevent the following undesired behavior on mobile browsers:
  // tapping is followed by a slightly delayed click
  // (see https://css-tricks.com/annoying-mobile-double-tap-link-issue/).
  // So when a country receives a tap, a "hover" event is fired first
  // and "<AreaInfo />" renders a list of artists for a given country.
  // Then the "click" event is fired on that list,
  // eventually causing an underlying link to be opened,
  // which is clearly not expected from the first tap on the map.
  private deactivateAndReactivatePointerEvents() {
    this.element.style.pointerEvents = 'none';

    setTimeout(
      () => this.element.style.pointerEvents = 'auto',
      300,
    );
  }

  private resetRoute() {
    document.location.hash = '';
  }

  private handleDocumentKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.resetRoute();
    }
  }

  private handleCloseButtonClick() {
    this.resetRoute();
  }

  private rerender() {
    this.element.innerHTML = this.render();
    this.subscribe();
    this.deactivateAndReactivatePointerEvents();
  }

  private renderHeader(): string {
    const {username} = this.props;
    const {areaProperties} = this.state;

    return `
      <section
        class="AreaInfo__section AreaInfo__section--header"
      >
        <div>
          <span>
            last.fm user:&nbsp;
          </span>
          <a
            href="https://www.last.fm/user/${username}"
            target="_blank"
          >
            ${username}
          </a>
        </div>

        ${areaProperties
          ? `
            <button
              class="AreaInfo__close-button"
              title="close"
            >
              &times;
            </button>
          `
          : ``
        }
      </section>
    `;
  }

  private renderSummary(): string {
    const {areaProperties} = this.state;

    return `
      <section
        class="AreaInfo__section"
      >
        ${areaProperties
          ? this.renderAreaSummary()
          : this.renderTotalSummary()
        }
      </section>
    `;
  }

  private renderTotalSummary(): string {
    const {totalAreaCount} = this.props;

    return `
      <header
        class="AreaInfo__header"
      >
        Total
      </header>

      <p>
        countries: ${totalAreaCount}
      </p>

      <p>
        <span>
          artists:&nbsp;
        </span>

        ${this.renderLibraryArtistsLink()}
      </p>

      <p>
        <span>
          scrobbles:&nbsp;
        </span>

        ${this.renderLibraryLink()}
      </p>
    `;
  }

  private renderAreaSummary(): string {
    const {areaScrobbleCount, areaFlagDataUrl, areaProperties} = this.state;

    return `
      <header
        class="AreaInfo__header"
      >
        <div
          class="AreaInfo__area-flag"
          style="
            background-image: url('${areaFlagDataUrl}');
          "
        >
        </div>

        <span>
          ${areaProperties.name}
        </span>
      </header>

      <p>
        <span>
          artists: ${areaProperties.artists.length.toLocaleString()}
        </span>

        <span
          class="AreaInfo__stats-separator"
        >
          /
        </span>

        ${this.renderLibraryArtistsLink()}
      </p>

      <p>
        <span>
          scrobbles: ${areaScrobbleCount.toLocaleString()}
        </span>

        <span
          class="AreaInfo__stats-separator"
        >
          /
        </span>

        ${this.renderLibraryLink()}
      </p>
     `;
  }

  private renderLibraryArtistsLink(): string {
    const {username, totalArtistCount} = this.props;

    return `
      <a
        href="https://www.last.fm/user/${username}/library/artists"
        target="_blank"
      >
        ${totalArtistCount.toLocaleString()}
      </a>
    `;
  }

  private renderLibraryLink(): string {
    const {username, totalScrobbleCount} = this.props;

    return `
      <a
        href="https://www.last.fm/user/${username}/library"
        target="_blank"
      >
        ${totalScrobbleCount.toLocaleString()}
      </a>
    `;
  }

  private renderArtistList(): string {
    const {areaProperties} = this.state;

    return `
      <section
        class="AreaInfo__section"
      >
        ${areaProperties
          ? `
            <table
              class="AreaInfo__artist-list"
            >
              ${areaProperties.artists.map(this.renderArtistListItem).join('')}
            </table>
          `
          : `
            <p>
              (click on a country)
            </p>
          `
        }
      </section>
    `;
  }

  private renderArtistListItem(artist: Artist): string {
    const {username} = this.props;

    return `
      <tr
        class="AreaInfo__artist"
      >
        <td
          class="${classNames(
            'AreaInfo__artist-rank',
            {
              [classNames(
                'AreaInfo__artist-rank--medal',
                `AreaInfo__artist-rank--medal-${artist.rank}`,
              )]: artist.rank <= 3
            }
          )}"
        >
          #${artist.rank}
        </td>

        <td
          class="AreaInfo__artist-playcount"
        >
          <a
            href="${url`https://www.last.fm/user/${username}/library/music/${artist.name}`}"
            target="_blank"
          >
            ${artist.playcount.toLocaleString()}
          </a>
        </td>

        <td
          class="AreaInfo__artist-name"
        >
          <a
            href="${url`https://www.last.fm/music/${artist.name}`}"
            target="_blank"
          >
            ${artist.name}
          </a>
        </td>
      </tr>
    `;
  }

  private render(): string {
    return html`
      ${this.renderHeader()}
      ${this.renderSummary()}
      ${this.renderArtistList()}
    `;
  }
}
