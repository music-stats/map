import './Legend.scss';

interface AreaListItem {
  name: string;
  songCount: number;
  songCountPersent: number;
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
      ${areaList.map(({name, songCount, songCountPersent, color}) => `
        <li
          class="Legend__area-list-item"
        >
          <div
            class="Legend__area-color"
            style="background-color: ${color}"
          >
          </div>

          <span>
            ${name}: ${songCount}, ${songCountPersent.toFixed(1)}%
          </span>
        </li>
      `).join('')}
    </ul>
  `;
}
