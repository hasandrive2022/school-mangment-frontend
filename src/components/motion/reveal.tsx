"use client";

/**
 * Scroll-reveal wrapper (Framer Motion). Renders a real <section> with the
 * caller's className/id untouched — only motion is added: the block fades
 * and rises into place the first time it enters the viewport. Honours the
 * OS "reduce motion" setting (renders statically there).
 */
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Extra delay in seconds — used to stagger neighbouring blocks. */
  delay?: number;
};

export function RevealSection({ children, className, id, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <section className={className} id={id}>
        {children}
      </section>
    );
  }
  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
