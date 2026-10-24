/**
 * Designed placeholder for a missing (null) image.
 *
 * Reuses the app's existing missing-photo treatment — the gradient
 * initial-letter panel used for people with no photoUrl
 * (`.pcard .ph.ph-txt` in globals.css, `.msg-photo .msg-photo-txt`
 * in design-c.css): a `linear-gradient(135deg, var(--p100), var(--p50))`
 * panel with the title's first letter, large and bold, in var(--p600).
 * The sizing / aspect rules for each surface live with those styles in
 * design-c.css (`.dsite .img-txt` + per-surface overrides).
 *
 * Rendered as a <span> so it is valid inside <button>/<figure> surfaces
 * (album cards, photo items) as well as plain containers. Never renders
 * an <img>, so a null URL can never produce a broken-image icon.
 */
export function ImagePlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const text = label?.trim() ? label : "বিদ্যালয়";
  return (
    <span
      className={`img-txt${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={text}
    >
      <span aria-hidden="true">{text.charAt(0)}</span>
    </span>
  );
}
