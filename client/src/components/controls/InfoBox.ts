import * as L from 'leaflet';
import classNames from 'classnames';

import {CustomControl} from 'src/types/elements';
import {Artist, AreaProperties} from 'src/types/models';
import {html, url} from 'src/utils/render';

import './InfoBox.scss';

interface InfoBoxProps {
  username: string;
  totalAreaCount: number;
  totalArtistCount: number;
  totalScrobbleCount: number;
}

interface InfoBoxState {
  areaScrobbleCount: number;
  areaFlagDataUrl: string;
  areaProperties: AreaProperties;
}

export default class InfoBox extends L.Control implements CustomControl {
  element: HTMLElement;
  tagName: string;
  className: string;
  private props: InfoBoxProps;
  private state: InfoBoxState;

  constructor(
    options: L.ControlOptions,
    tagName: string,
    className: string,
    props: InfoBoxProps,
  ) {
    super(options);

    this.tagName = tagName;
    this.className = className;
    this.props = props;
    this.state = this.getDefaultState();
  }

  public onAdd() {
    this.element = L.DomUtil.create(this.tagName, this.className);
    this.rerender();
    L.DomEvent.disableScrollPropagation(this.element);

    this.listenToDocument();

    return this.element;
  }

  public setState(state?: InfoBoxState) {
    this.state = state
      ? state
      : this.getDefaultState();

    this.rerender();
  }

  private getDefaultState(): InfoBoxState {
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
      const closeButton = this.element.querySelector('.InfoBox__close-button');
      closeButton.addEventListener('click', this.handleCloseButtonClick.bind(this));
    }
  }

  private handleDocumentKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.setState();
    }
  }

  private handleCloseButtonClick() {
    this.setState();
  }

  private rerender() {
    this.element.innerHTML = this.render();
    this.subscribe();
  }

  private renderArtistListItem(artist: Artist): string {
    const {username} = this.props;

    return `
      <tr
        class="InfoBox__artist"
      >
        <td
          class="${classNames(
            'InfoBox__artist-rank',
            {
              [classNames(
                'InfoBox__artist-rank--medal',
                `InfoBox__artist-rank--medal-${artist.rank}`,
              )]: artist.rank <= 3
            }
          )}"
        >
          #${artist.rank}
        </td>

        <td
          class="InfoBox__artist-playcount"
        >
          <a
            href="${url`https://www.last.fm/user/${username}/library/music/${artist.name}`}"
            target="_blank"
          >
            ${artist.playcount.toLocaleString()}
          </a>
        </td>

        <td
          class="InfoBox__artist-name"
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
    const {username, totalAreaCount, totalArtistCount, totalScrobbleCount} = this.props;
    const {areaScrobbleCount, areaFlagDataUrl, areaProperties} = this.state;

    return html`
      <section
        class="InfoBox__section InfoBox__section--header"
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
              class="InfoBox__close-button"
              title="close"
            >
              &times;
            </button>
          `
          : ``
        }
      </section>

      <section
        class="InfoBox__section"
      >
        <header
          class="InfoBox__header"
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
          <a
            href="https://www.last.fm/user/${username}/library/artists"
            target="_blank"
          >
            ${totalArtistCount.toLocaleString()}
          </a>
        </p>

        <p>
          <span>
            scrobbles:&nbsp;
          </span>
          <a
            href="https://www.last.fm/user/${username}/library"
            target="_blank"
          >
            ${totalScrobbleCount.toLocaleString()}
          </a>
        </p>
      </section>

      <section
        class="InfoBox__section"
      >
        ${areaProperties
          ? `
            <header
              class="InfoBox__header"
            >
              <div
                class="InfoBox__area-flag"
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
              artists: ${areaProperties.artists.length.toLocaleString()}
            </p>

            <p>
              scrobbles: ${areaScrobbleCount.toLocaleString()}
            </p>

            <table
              class="InfoBox__artist-list"
            >
              ${areaProperties.artists.map((artist) => this.renderArtistListItem(artist)).join('')}
            </table>
          `
          : `
            <p>
              (hover over a country)
            </p>
          `
        }
      </section>
    `;
  }
}
