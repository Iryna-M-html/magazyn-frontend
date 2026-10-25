import { Suspense } from "react";
import { AuditLogView } from "../_audit/AuditLogView";

// История изменений данных (только администратор — проверка в admin/layout)
export default function ChangesPage() {
  return (
    <Suspense fallback={null}>
      <AuditLogView mode="changes" />
    </Suspense>
  );
}
