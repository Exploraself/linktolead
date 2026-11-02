# Fonts for the printed manuals

Fixed-weight instances of the two ExploraSelf fonts in `public/assets/fonts/`
(Newsreader 450, Newsreader Italic 450, Inter 400 and 600), made with fontTools'
instancer. Both fonts are under the SIL Open Font Licence 1.1.

`scripts/make-manuals.mjs` embeds them: fixed weights print as small TrueType
subsets, where the variable web fonts would print as large Type 3 fonts.
They are never served to the site.
