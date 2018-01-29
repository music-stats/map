import './Legend.scss';

interface AreaListItemProps {
  name: string;
  artistCount: number;
  scrobbleCount: number;
  scrobbleCountPersent: number;
  color: string;
}

function renderAreaListItem({
  name,
  artistCount,
  scrobbleCount,
  scrobbleCountPersent,
  color,
}: AreaListItemProps): string {
  // "data-name" is used for binding mouse events
  return `
    <li
      class="Legend__area"
      data-name="${name}"
    >
      <div
        class="Legend__area-color"
        style="background-color: ${color}"
      >
      </div>

      <span>
        ${name}&nbsp;
      </span>

      <span
        class="Legend__area-stats"
      >
        <span title="artists">${artistCount}</span>:<span title="scrobbles">${scrobbleCount}</span>,
        <span>${scrobbleCountPersent.toFixed(1)}%</span>
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
  return `
    <ul
      class="Legend__area-list"
    >
      ${areaList.map(renderAreaListItem).join('')}
    </ul>
  `;
}
