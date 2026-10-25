import { Suspense } from "react";
import { AuditLogView } from "../_audit/AuditLogView";

// История входов в систему (только администратор — проверка в admin/layout)
export default function LoginsPage() {
  return (
    <Suspense fallback={null}>
      <AuditLogView mode="logins" />
    </Suspense>
  );
}
