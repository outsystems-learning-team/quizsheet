/**
 * @file 安全に JSON 文字列をパースするユーティリティを提供します。
 */
export const parseBody = <T = unknown>(raw: string | null | undefined): T | null => {
  if (!raw?.trim()) return null; // 空文字・null・undefined を弾く

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null; // 構文エラー → null
  }
};
