/** Logical folders in GridFS metadata, independent of public image IDs. */
export function imageSlug(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'image'
}

export function imageNaming({ filename, sourceUrl = '', kind = '', name = '', folder = '', sha256, contentType }) {
  const source = sourceUrl.split('?')[0]
  const base = filename.split(/[\\/]/).pop() || 'image'
  let stem = base.replace(/\.[^.]+$/, '')
  if (!folder) {
    const project = source.match(/^\/assets\/projects\/([^/]+)\/([^/]+)$/)
    if (kind === 'project' || project) {
      folder = `projects/${imageSlug(name || project?.[1] || 'untitled')}`
      if (project) stem = project[2].replace(/\.[^.]+$/, '')
    } else if (kind === 'cover' || source.startsWith('/assets/books/') || /^https:\/\//.test(source)) {
      folder = `media/${imageSlug(name || stem)}`
      stem = 'cover'
    } else if (source.startsWith('/assets/logos/')) {
      folder = 'site/logos'
      stem = stem.replace(/logo$/i, '') + '-logo'
    } else if (/favicon/i.test(source || base)) folder = 'site/icons'
    else if (/illustration/i.test(source || base)) folder = 'site/illustrations'
    else if (source) folder = 'site/misc'
    else folder = 'library'
  }
  // Folder inputs originate from stored metadata, but normalize each segment too.
  folder = folder.split('/').filter(Boolean).map(imageSlug).join('/') || 'library'
  const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif' })[contentType] || 'bin'
  const normalized = `${imageSlug(stem)}-${sha256.slice(0, 12)}.${extension}`
  return { folder, filename: `${folder}/${normalized}` }
}
