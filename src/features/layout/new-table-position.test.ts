// 재현: 카메라(viewport)가 월드 원점에서 멀리 주차된 상태에서 새 테이블을 만들면,
// 구현이 원점 기준 좌표(구버전: random*400+100 ≈ 100..500)로 배치해 카메라에서 수천 px
// 밖으로 벗어난다 → 테이블은 생성되지만 화면에 안 보인다("생성을 할 수가 없네").
// 계약: 새 테이블은 현재 뷰포트 중심을 감싸도록(= 반드시 화면 안) 배치된다.
import { describe, it, expect } from 'vitest';
import { newTablePosition } from './new-table-position';
import { NODE_WIDTH } from '@/components/canvas/pixi/constants';

describe('newTablePosition — 새 테이블은 현재 뷰포트 안에 놓인다', () => {
  it('카메라가 원점에서 멀리 주차돼 있어도 뷰포트 중심을 감싸도록 배치한다', () => {
    // 실제 재현 좌표(런타임 get-render-state 로 관측): viewport 가 월드 (-7052,-1829) 에 주차.
    const viewport = { x: -7052, y: -1829, zoom: 1 };
    const pos = newTablePosition(viewport);
    // 노드(폭 NODE_WIDTH)가 뷰포트 중심을 수평으로 감싼다(top-left = 중심 - 반너비).
    expect(pos.x).toBe(viewport.x - NODE_WIDTH / 2);
    // 중심에서의 거리는 노드 한 개 크기 이내 — 원점 기준(≈7000px 밖) 회귀를 막는다.
    expect(Math.hypot(pos.x - viewport.x, pos.y - viewport.y)).toBeLessThan(NODE_WIDTH);
  });

  it('원점 뷰포트에서도 중심 기준으로 배치한다', () => {
    const pos = newTablePosition({ x: 0, y: 0, zoom: 1 });
    expect(pos.x).toBe(-NODE_WIDTH / 2);
    expect(Math.hypot(pos.x, pos.y)).toBeLessThan(NODE_WIDTH);
  });

  it('jitter 는 반복 생성이 픽셀 단위로 겹치지 않게 흩뜨린다', () => {
    const viewport = { x: 0, y: 0, zoom: 1 };
    const a = newTablePosition(viewport, 0);
    const b = newTablePosition(viewport, 40);
    expect(b.x - a.x).toBe(40);
    expect(b.y - a.y).toBe(40);
  });
});
