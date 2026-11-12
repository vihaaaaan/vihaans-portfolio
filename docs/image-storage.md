# Image storage

Original image bytes are stored in the `portfolio` database's GridFS bucket:

- `images.files`: filenames, dimensions, MIME types, checksums, and source URLs.
- `images.chunks`: original file contents. Do not edit either collection by hand.

No images are resized or recompressed during upload. Public image URLs are
`/api/images/<file-id>` and are cached as immutable. Replacements get another ID;
the old original remains in the library. Source aliases let existing local and
external URLs resolve to the stored copy without rewriting content documents.

## Uploading

After this code is deployed, visit `/#edit`, sign in with the existing admin
password, and select **manage images**. Choose a destination, select the original,
and upload. You can add a project screenshot, replace a media cover, replace an
existing image (including favicon), or store a file in the library and copy its URL.
Reload to see attached changes. Future uploads need no Git push or deployment.

Browser uploads support PNG, JPEG, WebP, GIF, SVG, and AVIF up to 4 MB per file,
below the hosting platform's request limit. The migration script supports files
up to 25 MB. This library is for publicly visible site images, not private files.

The admin UI uses the existing signed session cookie. Writes are authenticated;
public reads expose only image bytes. External cover imports accept only the
image providers already used by this app, including redirect destinations.
Cover lookup and Letterboxd synchronization store newly resolved covers too.

## Existing images

Run `node scripts/migrate-images.mjs` to list sources without writing. Run with
`--apply` to import all images in `public/` and every bookshelf cover URL. Each
stored file is downloaded and SHA-256 checked. Existing mappings are reused,
including administrator replacements. A migration manifest is saved outside
the repository under `~/Documents/Database Backups/vihaans-portfolio/`.

The migration does not delete local files or rewrite live content records.
This preserves the currently deployed site's behavior until the new code is
deployed. Keep local project files for now: their folder listing defines the
initial screenshot ordering when a project has no explicit `images` array.
New admin uploads establish that array, and it then controls the project gallery.

The two GridFS collections are required, not legacy duplicate content. Back up
both together. Database credentials stay server-side in the existing
`MONGODB_CONNECTION_STRING`; no new service or credentials are needed.

## Verification

With the dev server running, `node scripts/verify-image-storage.mjs` checks auth,
validation, byte preservation, deduplication, immutable caching, replacements,
and source-host restrictions. It writes random temporary images only, verifies
that the four portfolio documents are unchanged, then deletes its test images.

## Names and folders

GridFS filenames follow `<folder>/<descriptive-name>-<12-character-checksum>.<ext>`.
Names are lowercase kebab-case; extensions come from the detected image type.
For example:

- `projects/omni-doc/01-landing-ddfd4164d279.png`
- `media/red-rising/cover-4d4c737e557a.jpg`
- `site/logos/etsy-logo-a0dff91a76e5.jpg`
- `site/icons/favicon-566e415ccaff.png`
- `site/illustrations/vihaan-illustration-4d48c6ac7c6a.png`
- `library/my-upload-<checksum>.png` for unattached uploads

These are logical folders, stored in `metadata.folder`, with a folder filter in
the admin library. `metadata.originalFilename` preserves the uploaded filename.
Public URLs still use immutable file IDs, so naming changes cannot break links.
Project uploads use the project name; media imports use the media title;
replacements inherit the original's folder. Identical bytes reuse the existing
file and its folder, even when attached to another item.

Run `node scripts/organize-images.mjs` to preview organization of existing images;
add `--apply` to save it. The script backs up GridFS metadata outside the repo,
updates names/folders only, and skips images already organized. It does not
rename local files, change gallery ordering, or move any image bytes.
