// Parses lg/constitution.txt into a structure the overlay can render.
// The words are shown verbatim; only the structure is recognised:
//   - the first block (up to the first blank line) is the title,
//   - "Preamble: ..." / "Article N: ..." lines start a section,
//   - "1. ..." lines are numbered clauses,
//   - the block starting with "Signatories" lists the signatories.
import raw from '../constitution.txt?raw'

const SECTION_RE = /^(Preamble|Article\s+\S+?)\s*:\s*(.*)$/
const CLAUSE_RE = /^(\d+)\.\s*(.*)$/

export function parseConstitution(text) {
  const blocks = text
    .replace(/^﻿/, '')
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map(b => b.split('\n').map(l => l.trim()).filter(Boolean))
    .filter(b => b.length)

  const [titleLines = [], ...rest] = blocks
  const result = { title: titleLines, sections: [], signatories: null }
  let section = null

  for (const block of rest) {
    if (/^Signatories/i.test(block[0])) {
      result.signatories = { heading: block[0], names: block.slice(1) }
      continue
    }

    let lines = block
    const m = block[0].match(SECTION_RE)
    if (m) {
      section = { heading: m[1], subtitle: '', content: [] }
      result.sections.push(section)
      // A heading line alone carries the article's name; followed by more
      // lines (the Preamble), its text is the opening paragraph.
      if (block.length === 1) section.subtitle = m[2]
      else lines = [m[2], ...block.slice(1)]
      if (block.length === 1) continue
    }
    if (!section) {
      section = { heading: '', subtitle: '', content: [] }
      result.sections.push(section)
    }

    for (const line of lines) {
      const c = line.match(CLAUSE_RE)
      const last = section.content[section.content.length - 1]
      if (c) {
        const item = { n: c[1], text: c[2] }
        if (last?.type === 'list') last.items.push(item)
        else section.content.push({ type: 'list', items: [item] })
      } else {
        section.content.push({ type: 'p', text: line })
      }
    }
  }
  return result
}

export const constitution = parseConstitution(raw)
