import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyDealsState() {
  return (
    <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-8 py-16 text-center">
      <p className="text-base font-medium text-neutral-500">
        아직 저장된 딜이 없습니다.
      </p>
      <p className="mt-1 text-sm text-neutral-400">첫 문의를 분석해보세요.</p>
      <Button asChild className="mt-5">
        <Link href="/dashboard/intake">문의 분석하기</Link>
      </Button>
    </div>
  );
}
