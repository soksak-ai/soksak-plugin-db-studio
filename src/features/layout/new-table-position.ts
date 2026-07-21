import type { NodePosition, Viewport } from '@/types/diagram';
import { NODE_WIDTH, HEADER_HEIGHT, ROW_HEIGHT } from '@/components/canvas/pixi/constants';

// 새로 만든 테이블은 사용자가 지금 보고 있는 곳에 나타나야 한다. 카메라는 pan/zoom 이
// viewport 에 남아 어디든 주차될 수 있으므로, 새 테이블을 월드 원점에 고정하면 화면 밖으로
// 떨어진다 — 테이블은 존재하지만 사용자는 못 본다. viewport.x/y 는 화면 중심의 월드 좌표이니,
// 노드 반크기만큼 당겨 노드 몸통이 그 중심을 감싸게 둔다. jitter(월드 px)는 반복 생성이
// 픽셀 단위로 겹치지 않게 흩뜨린다.
export function newTablePosition(viewport: Viewport, jitter = 0): NodePosition {
  const nodeHeight = HEADER_HEIGHT + ROW_HEIGHT; // 헤더 + 기본 PK 행 하나
  return {
    x: viewport.x - NODE_WIDTH / 2 + jitter,
    y: viewport.y - nodeHeight / 2 + jitter,
  };
}
