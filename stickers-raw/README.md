# Drawings go here

Draw on white paper in a dark pen. Photograph it straight-on in good, even
light — a phone camera is fine, it does not need to be a scan. Then:

    stickers-raw/swing.jpg          one photo   -> a drawing that sits still
    stickers-raw/swing/01.jpg       a folder    -> a flipbook, one photo per frame
    stickers-raw/swing/02.jpg
    stickers-raw/swing/03.jpg

Run `npm run stickers`. It knocks the paper out, crops to the ink, and writes
web-ready art into `public/stickers/` plus `src/data/stickers.generated.ts`.

Then place it in `src/data/stickers.ts`, e.g.

    { art: 'swing', side: 'right', top: '3%', width: 126, move: 'swing' }

`move` picks how the whole drawing moves on the page — `swing`, `drift`, `bob`,
`twinkle`, or `none`. See `src/components/stickers/motions.ts`.

## Notes

- Number flipbook frames with a leading zero (01, 02 … 10). Plain 1, 2 … 10
  sorts 10 before 2 and the animation plays out of order.
- Every frame of a flipbook is cropped to the same box, so keep the paper in
  roughly the same position between shots.
- Don't shade or use a coloured background. The knockout reads brightness only:
  dark becomes ink, light becomes transparent.
- The ink colour is applied in CSS, not baked into the file, so the drawings
  stay matched to the page's text colour. Draw in whatever dark pen you like.
- 8-12 frames is plenty for a loop. Make the last frame flow back into the
  first or the loop will visibly hitch.
- Faint lines dropping out, or grey haze around the drawing? Adjust `HAZE_FLOOR`
  at the top of `scripts/prepare-stickers.mjs`.
