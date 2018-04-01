import {Artist, AreaProperties} from 'src/types/models';
import {trimExtraSpaces, replaceSpaces} from 'src/utils/render';

import './InfoBox.scss';

interface ArtistListItemProps {
  artist: Artist;
  username: string;
}

function renderArtistListItem({
  artist,
  username,
}: ArtistListItemProps): string {
  return `
    <tr
      class="InfoBox__artist"
    >
      <td
        class="InfoBox__artist-rank"
      >
        #${artist.rank}
      </td>

      <td
        class="InfoBox__artist-playcount"
      >
        <a
          href="https://www.last.fm/user/${username}/library/music/${replaceSpaces(artist.name)}"
          target="_blank"
        >
          ${artist.playcount}
        </a>
      </td>

      <td>
        <a
          href="https://www.last.fm/music/${replaceSpaces(artist.name)}"
          target="_blank"
        >
          ${artist.name}
        </a>
      </td>
    </tr>
  `;
}

interface InfoBoxProps extends AreaProperties {
  username: string;
  totalCountriesCount: number;
  totalArtistCount: number;
  totalScrobbleCount: number;
  areaScrobbleCount: number;
}

export default function render({
  username,
  totalCountriesCount,
  totalScrobbleCount,
  totalArtistCount,
  areaScrobbleCount,
  ...area,
}: InfoBoxProps): string {
  return trimExtraSpaces(`
    <section
      class="InfoBox__section"
    >
      <span>
        last.fm user:
      </span>
      <a
        href="https://www.last.fm/user/${username}"
        target="_blank"
      >
        ${username}
      </a>
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
        countries: ${totalCountriesCount}
      </p>

      <p>
        <span>
          artists:
        </span>
        <a
          href="https://www.last.fm/user/${username}/library/artists"
          target="_blank"
        >
          ${totalArtistCount}
        </a>
      </p>

      <p>
        <span>
          scrobbles:
        </span>
        <a
          href="https://www.last.fm/user/${username}/library"
          target="_blank"
        >
           ${totalScrobbleCount}
        </a>
      </p>
    </section>

    <section
      class="InfoBox__section"
    >
      ${area.name
        ? `
          <header
            class="InfoBox__header"
          >
            ${area.name}
          </header>

          <p>
            artists: ${area.artists.length}
          </p>

          <p>
            scrobbles: ${areaScrobbleCount}
          </p>

          <table
            class="InfoBox__artist-list"
          >
            ${area.artists.map((artist) => renderArtistListItem({
              artist,
              username,
            })).join('')}
          </table>
        `
        : `
          <p>
            (hover over a country)
          </p>
        `
      }
    </section>
  `);
}
