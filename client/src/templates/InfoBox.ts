import {AreaProperties} from 'src/types';

import './InfoBox.scss';

interface InfoBoxProps extends AreaProperties {
  username: string;
  totalArtistCount: number;
  totalSongCount: number;
  areaSongCount: number;
}

export default function render({
  username,
  totalSongCount,
  totalArtistCount,
  areaSongCount,
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
        href="https://www.last.fm/user/${username}/library"
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
          songs:
        </span>
        <a
          href="https://www.last.fm/user/${username}/library/tracks"
          target="_blank"
        >
           ${totalSongCount}
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
            songs: ${areaSongCount}
          </p>

          <ul
            class="InfoBox__artist-list"
          >
            ${area.artists.map((artist) => `
              <li>
                <a
                  href="https://www.last.fm/music/${artist.name}"
                  target="_blank"
                >${artist.name}</a>:
                <a
                  href="https://www.last.fm/user/${username}/library/music/${artist.name}"
                  target="_blank"
                >${artist.playcount}</a>
                <span
                  class="InfoBox__artist-rank"
                >
                  #${artist.rank}
                </span>
              </li>
            `).join('')}
          </ul>
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
