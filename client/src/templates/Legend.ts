import './Legend.scss';

interface AreaListItem {
  name: string;
  scrobbleCount: number;
  scrobbleCountPersent: number;
  color: string;
}

interface LegendProps {
  areaList: AreaListItem[];
}

export default function render({
  areaList,
}: LegendProps): string {
  return `
    <ul>
      ${areaList.map(({name, scrobbleCount, scrobbleCountPersent, color}) => `
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
            ${name}:&nbsp;
          </span>

          <span
            class="Legend__area-stats"
          >
            ${scrobbleCount}, ${scrobbleCountPersent.toFixed(1)}%
          </span>
        </li>
      `).join('')}
    </ul>
  `;
}
