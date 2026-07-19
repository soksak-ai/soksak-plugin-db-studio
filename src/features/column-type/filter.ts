// Type combobox filtering — pure logic shared by the searchable data-type picker.
// The dataType is a free string (VARCHAR(255), DECIMAL(12,2), ENUM('a','b')…), so
// besides filtering the dialect's suggestion list, a non-matching query is offered
// as a custom value. This is what the old plain <Select> could not express.
export interface TypeFilterResult {
  matches: string[];
  // 목록에 정확히 없는 비어있지 않은 쿼리 → 커스텀 값으로 제안(예: "VARCHAR(100)").
  custom: string | null;
}

export function filterTypeOptions(allTypes: readonly string[], query: string): TypeFilterResult {
  const q = query.trim();
  if (q === '') {
    return { matches: [...allTypes], custom: null };
  }
  const lower = q.toLowerCase();
  const matches = allTypes.filter((t) => t.toLowerCase().includes(lower));
  // 정확히 일치하는 항목이 이미 있으면 커스텀 제안 불필요(대소문자 무시).
  const exact = allTypes.some((t) => t.toLowerCase() === lower);
  return { matches, custom: exact ? null : q };
}
