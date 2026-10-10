export type ActionResult = { ok: boolean; message: string | null; self?: boolean };

export type RpcResult = { ok: boolean; code: string | null; self?: boolean };

const MESSAGES: Record<string, string> = {
  self: 'Không thể làm việc này với tài khoản hoặc thiết bị bạn đang dùng.',
  weak: 'Mật khẩu cần từ 10 đến 72 ký tự.',
  exists: 'Email này đã có tài khoản.',
  invalid: 'Thông tin chưa hợp lệ.',
  not_found: 'Mục này không còn tồn tại.',
  blocked: 'Mở khoá thiết bị trước khi xoá.',
  denied: 'Bạn không có quyền làm việc này với tài khoản hoặc thiết bị này.',
  wrong_password: 'Mật khẩu hiện tại không đúng.',
  mismatch: 'Hai lần nhập mật khẩu mới chưa khớp.',
};

export function toResult(row: RpcResult, success: string | null = null): ActionResult {
  if (row.ok) return { ok: true, message: success, self: row.self === true };
  return { ok: false, message: MESSAGES[row.code ?? ''] ?? 'Chưa làm được. Thử lại sau.' };
}
