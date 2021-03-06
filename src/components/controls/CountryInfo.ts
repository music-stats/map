import * as L from 'leaflet';
import classNames from 'classnames';

import {CustomControl} from 'src/types/elements';
import {Artist, CountryProperties} from 'src/types/models';
import html from 'src/lib/html';
import {url} from 'src/utils/string';

import './CountryInfo.scss';

interface CountryInfoProps {
  username: string;
  totalCountryCount: number;
  totalArtistCount: number;
  totalScrobbleCount: number;
}

interface CountryInfoState {
  countryScrobbleCount: number;
  countryFlagDataUrl: string;
  countryProperties: CountryProperties;
}

export default class CountryInfo extends L.Control implements CustomControl {
  element: HTMLElement;
  tagName: string;
  className: string;
  private props: CountryInfoProps;
  private state: CountryInfoState;

  constructor(
    options: L.ControlOptions,
    tagName: string,
    className: string,
    props: CountryInfoProps,
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

  public setState(state?: CountryInfoState) {
    this.state = state
      ? state
      : this.getDefaultState();

    this.rerender();
  }

  private getDefaultState(): CountryInfoState {
    return {
      countryScrobbleCount: null,
      countryFlagDataUrl: null,
      countryProperties: null,
    };
  }

  private listenToDocument() {
    // listening to "document" instead of some "map.getContainer()"
    // because the latter will only catch events when the map is active,
    // i.e. when the map was just loaded and user hadn't clicked yet, events won't be caught
    document.addEventListener('keydown', this.handleDocumentKeydown.bind(this));
  }

  private subscribe() {
    // the close button is only shown when an country is highlighted
    if (this.state.countryProperties) {
      this.getCloseButtonElement().addEventListener('click', this.handleCloseButtonClick.bind(this));
    }
  }

  private getCloseButtonElement(): HTMLElement {
    return this.element.querySelector('.CountryInfo__close-button');
  }

  // A workaround to prevent the following undesired behavior on mobile browsers:
  // tapping is followed by a slightly delayed click
  // (see https://css-tricks.com/annoying-mobile-double-tap-link-issue/).
  // So when a country receives a tap, a "hover" event is fired first
  // and "<CountryInfo />" renders a list of artists for a given country.
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
    const {countryProperties} = this.state;

    return html`
      <section
        class="CountryInfo__section CountryInfo__section--header"
      >
        <div>
          <span>
            last.fm user:${' '}
          </span>
          <a
            href="https://www.last.fm/user/${username}"
            target="_blank"
          >
            ${username}
          </a>
        </div>

        ${countryProperties && html`
          <button
            class="CountryInfo__close-button"
            title="close"
          >
            ×
          </button>
        `}
      </section>
    `;
  }

  private renderSummary(): string {
    const {countryProperties} = this.state;

    return html`
      <section
        class="CountryInfo__section"
      >
        ${countryProperties
          ? this.renderCountrySummary()
          : this.renderTotalSummary()
        }
      </section>
    `;
  }

  private renderTotalSummary(): string {
    const {totalCountryCount} = this.props;

    return html`
      <header
        class="CountryInfo__header"
      >
        Total
      </header>

      <p>
        countries: ${totalCountryCount}
      </p>

      <p>
        <span>
          artists:${' '}
        </span>

        ${this.renderLibraryArtistsLink()}
      </p>

      <p>
        <span>
          scrobbles:${' '}
        </span>

        ${this.renderLibraryLink()}
      </p>
    `;
  }

  private renderCountrySummary(): string {
    const {countryScrobbleCount, countryFlagDataUrl, countryProperties} = this.state;

    return html`
      <header
        class="CountryInfo__header"
      >
        <div
          class="CountryInfo__country-flag"
          style="
            background-image: url('${countryFlagDataUrl}');
          "
        >
        </div>

        <span>
          ${countryProperties.name}
        </span>
      </header>

      <p>
        <span>
          artists: ${countryProperties.artists.length.toLocaleString()}
        </span>

        <span
          class="CountryInfo__stats-separator"
        >
          /
        </span>

        ${this.renderLibraryArtistsLink()}
      </p>

      <p>
        <span>
          scrobbles: ${countryScrobbleCount.toLocaleString()}
        </span>

        <span
          class="CountryInfo__stats-separator"
        >
          /
        </span>

        ${this.renderLibraryLink()}
      </p>
    `;
  }

  private renderLibraryArtistsLink(): string {
    const {username, totalArtistCount} = this.props;

    return html`
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

    return html`
      <a
        href="https://www.last.fm/user/${username}/library"
        target="_blank"
      >
        ${totalScrobbleCount.toLocaleString()}
      </a>
    `;
  }

  private renderArtistList(): string {
    const {countryProperties} = this.state;

    return html`
      <section
        class="CountryInfo__section"
      >
        ${countryProperties
          ? html`
            <table
              class="CountryInfo__artist-list"
            >
              ${countryProperties.artists.map(this.renderArtistListItem)}
            </table>
          `
          : html`
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

    return html`
      <tr
        class="CountryInfo__artist"
      >
        <td
          class="${classNames(
            'CountryInfo__artist-rank',
            {
              [classNames(
                'CountryInfo__artist-rank--medal',
                `CountryInfo__artist-rank--medal-${artist.rank}`,
              )]: artist.rank <= 3
            }
          )}"
        >
          #${artist.rank}
        </td>

        <td
          class="CountryInfo__artist-playcount"
        >
          <a
            href="${url`https://www.last.fm/user/${username}/library/music/${artist.name}`}"
            target="_blank"
          >
            ${artist.playcount.toLocaleString()}
          </a>
        </td>

        <td
          class="CountryInfo__artist-name"
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
    return `
      ${this.renderHeader()}
      ${this.renderSummary()}
      ${this.renderArtistList()}
    `;
  }
}
