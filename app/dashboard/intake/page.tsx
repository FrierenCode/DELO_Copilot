import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IntakeWorkspace } from "@/components/intake/IntakeWorkspace";

export default async function IntakePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          브랜드 문의 분석
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          브랜드 이메일이나 DM을 붙여넣고 견적, 체크리스트, 답장 초안을 자동 생성하세요.
        </p>
      </div>
      <IntakeWorkspace />
    </div>
  );
}
