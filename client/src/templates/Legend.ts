import {Animation} from 'src/types/elements';
import {trimExtraSpaces} from 'src/utils/render';

import './Legend.scss';

// @see: https://webpack.js.org/guides/dependency-management/#require-context
const svgContext = require.context('src/../assets/flags/1x1/', false, /\.svg$/);
const svgContextKeys = svgContext.keys();
const svgDataUrls = svgContextKeys.map(svgContext);
const svgDict: {[key: string]: string} = {};

svgContextKeys.forEach((key, index) => {
  svgDict[key.slice(2, 4)] = (svgDataUrls as [string])[index];
});

export interface AreaListItemProps {
  name: string;
  iso_a2: string;
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

function renderAreaListItem(
  {
    name,
    iso_a2,
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
            background-image: url('${svgDict[iso_a2.toLowerCase()]}');
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
          ${artistCount}
        </sup>

        <sub title="scrobbles">
          ${scrobbleCount}
        </sub>
      </span>
    </li>
  `;
}

interface LegendProps {
  areaList: AreaListItemProps[];
}

export default function render({
  areaList,
}: LegendProps): string {
  return trimExtraSpaces(`
    <ul
      class="Legend__area-list"
    >
      ${areaList.map(renderAreaListItem).join('')}
    </ul>
  `);
}
