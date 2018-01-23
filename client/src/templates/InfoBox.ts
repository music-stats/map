import {AreaProperties} from 'src/types';

import './InfoBox.scss';

interface InfoBoxProps extends AreaProperties {
  username: string;
  totalArtistCount: number;
  totalScrobbleCount: number;
  areaScrobbleCount: number;
}

export default function render({
  username,
  totalScrobbleCount,
  totalArtistCount,
  areaScrobbleCount,
  ...area,
}: InfoBoxProps): string {
  return `
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
            ${area.artists.map((artist) => `
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
                    href="https://www.last.fm/user/${username}/library/music/${artist.name}"
                    target="_blank"
                  >
                    ${artist.playcount}
                  </a>
                </td>

                <td>
                  <a
                    href="https://www.last.fm/music/${artist.name}"
                    target="_blank"
                  >
                    ${artist.name}
                  </a>
                </td>
              </tr>
            `).join('')}
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
