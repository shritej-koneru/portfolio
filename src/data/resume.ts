/**
 * The resume, as a real file.
 *
 * `public/Shritej_Koneru_Resume.pdf` — the two-page resume the resume claims on
 * this site come from, copied from `Shritej_Koneru_Resume_2page.pdf` unchanged.
 * The bytes are the real thing, so the download needs no backend, no token and
 * no generated link.
 *
 * Scene 08 reads these two values and nothing else. Changing the file means
 * changing `RESUME_FILE` here, and the scene follows — the animation is
 * deliberately ignorant of both the path and the filename.
 */

/** Served from `public/`, so it is same-origin and `download` is honoured. */
export const RESUME_FILE = "/Shritej_Koneru_Resume.pdf";

/** What the browser should name the saved file. */
export const RESUME_FILENAME = "Shritej_Koneru_Resume.pdf";
