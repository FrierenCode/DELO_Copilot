"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

type Variant = "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";

interface Props {
  children: ReactNode;
  className?: string;
  /** 단독 사용 시 진입 딜레이(ms) */
  delay?: number;
  duration?: number;
  variant?: Variant;
  threshold?: number;
  /** 그룹 스태거: 그룹 내 이 아이템의 인덱스 (0-based) */
  index?: number;
  /** 그룹 스태거: 그룹 전체 아이템 수 */
  total?: number;
  /** 그룹 스태거: 아이템 간 딜레이 간격(ms) */
  stagger?: number;
}

const HIDDEN: Record<Variant, CSSProperties> = {
  "fade-up":    { opacity: 0, transform: "translateY(40px)" },
  "fade-in":    { opacity: 0 },
  "scale-up":   { opacity: 0, transform: "scale(0.93)" },
  "slide-left": { opacity: 0, transform: "translateX(-40px)" },
  "slide-right":{ opacity: 0, transform: "translateX(40px)" },
};

const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 680,
  variant = "fade-up",
  threshold = 0.12,
  index,
  total,
  stagger = 130,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        } else {
          // 뷰포트 아래에 있을 때만 숨김 (위로 스크롤 → 요소가 아래쪽으로 사라질 때)
          // 뷰포트 위에 있을 때는 이미 지나친 것이므로 visible 유지
          if (entry.boundingClientRect.top > 0) {
            setVisible(false);
          }
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const isGrouped = index !== undefined && total !== undefined;

  // 진입: 앞에서부터 (0, stagger, 2*stagger…)
  const enterDelay = isGrouped ? index! * stagger : delay;
  // 퇴장: 뒤에서부터 ((total-1-index)*stagger, …, 0)
  const exitDelay  = isGrouped ? (total! - 1 - index!) * stagger : 0;

  const activeDelay = visible ? enterDelay : exitDelay;
  const transition = `opacity ${duration}ms ${EASING} ${activeDelay}ms, transform ${duration}ms ${EASING} ${activeDelay}ms`;

  return (
    <div
      ref={ref}
      className={className}
      style={
        visible
          ? { transition }
          : { ...HIDDEN[variant], transition, willChange: "opacity, transform" }
      }
    >
      {children}
    </div>
  );
}
