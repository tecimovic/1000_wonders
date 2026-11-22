// Parses tommix.txt into { intro, songs }.
//
// Format of tommix.txt:
//   - Everything before the first "## " line is the intro (prose; paragraphs
//     separated by blank lines).
//   - Each "## <title>" line starts a song. The lines after it, up to the next
//     "## " line, are the lyrics, kept exactly as written. Blank lines
//     separate stanzas.
//   - A song whose only lyric is "(instrumental)" (or that has no lyrics) is
//     shown as an instrumental.
import raw from './tommix.txt?raw'

function slugify(title, used) {
  let base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'song'
  let slug = base
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`
  used.add(slug)
  return slug
}

function trimBlankEdges(lines) {
  let a = 0
  let b = lines.length
  while (a < b && lines[a].trim() === '') a++
  while (b > a && lines[b - 1].trim() === '') b--
  return lines.slice(a, b)
}

function splitBlocks(lines) {
  const blocks = []
  let cur = []
  for (const line of lines) {
    if (line.trim() === '') {
      if (cur.length) blocks.push(cur.join('\n'))
      cur = []
    } else {
      cur.push(line)
    }
  }
  if (cur.length) blocks.push(cur.join('\n'))
  return blocks
}

export function parseTommix(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+$/, ''))
  const introLines = []
  const songs = []
  const used = new Set()
  let current = null
  for (const line of lines) {
    const m = /^## (.*)$/.exec(line)
    if (m) {
      current = { title: m[1].trim(), lines: [] }
      songs.push(current)
    } else if (current) {
      current.lines.push(line)
    } else {
      introLines.push(line)
    }
  }
  return {
    intro: splitBlocks(trimBlankEdges(introLines)),
    songs: songs.map((s, i) => {
      const stanzas = splitBlocks(trimBlankEdges(s.lines))
      return {
        number: i + 1,
        title: s.title,
        slug: slugify(s.title, used),
        stanzas,
        instrumental: stanzas.length === 0 || (stanzas.length === 1 && stanzas[0].trim() === '(instrumental)')
      }
    })
  }
}

export const tommix = parseTommix(raw)
