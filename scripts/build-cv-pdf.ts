// Renders public/cv.pdf from lib/cv.ts so the download always matches /cv.
// Runs before `next build`; the PDF is a build output and is not committed.

import { createWriteStream } from 'node:fs'
import { resolve } from 'node:path'
import PDFDocument from 'pdfkit'
import { EDUCATION, LINKS, PROFILE, PUBLICATIONS, ROLES, SKILLS } from '../lib/cv'

const MARGIN = 42
const INK = '#1a1a1a'
const MUTED = '#5c5c5c'
const ACCENT = '#b4561f'
const RULE = '#d9d9d9'

const doc = new PDFDocument({
  size: 'A4',
  margin: MARGIN,
  info: { Title: `${PROFILE.name} - CV`, Author: PROFILE.name },
})
doc.pipe(createWriteStream(resolve('public/cv.pdf')))

const width = doc.page.width - MARGIN * 2
const bare = (url: string) => url.replace(/^https:\/\/(www\.)?/, '').replace(/\?.*$/, '')

function section(title: string) {
  if (doc.y > doc.page.height - MARGIN - 50) doc.addPage()
  doc.moveDown(0.9)
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED).text(title.toUpperCase(), { characterSpacing: 1 })
  const y = doc.y + 2
  doc.moveTo(MARGIN, y).lineTo(MARGIN + width, y).lineWidth(0.5).strokeColor(RULE).stroke()
  doc.y = y + 7
}

// A bold heading on the left with a muted period on the right of the same line.
function heading(left: string, org: string, right: string, url?: string) {
  if (doc.y > doc.page.height - MARGIN - 60) doc.addPage()
  const y = doc.y
  doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(right, MARGIN, y + 1, { width, align: 'right' })
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(left, MARGIN, y, { width: width - 110, continued: true })
  doc.font('Helvetica').fillColor(ACCENT).text(`  ${org}`, { link: url, underline: false })
}

doc.font('Helvetica-Bold').fontSize(22).fillColor(INK).text(PROFILE.name)
doc.font('Helvetica').fontSize(10.5).fillColor(MUTED).text(`${PROFILE.title}, ${PROFILE.employer.name}  |  ${PROFILE.location}`)
doc.moveDown(0.3)
const contacts: [string, string][] = [
  [PROFILE.email, `mailto:${PROFILE.email}`],
  [bare(PROFILE.site), PROFILE.site],
  [bare(LINKS.github), LINKS.github],
  [bare(LINKS.linkedin), LINKS.linkedin],
  ['Google Scholar', LINKS.scholar],
]
doc.fontSize(9).fillColor(ACCENT)
contacts.forEach(([label, link], i) => {
  doc.text(label, { link, continued: i < contacts.length - 1 })
  if (i < contacts.length - 1) doc.fillColor(MUTED).text('   |   ', { link: null, continued: true }).fillColor(ACCENT)
})
doc.moveDown(0.7)
doc.font('Helvetica').fontSize(10).fillColor(INK).text(PROFILE.summary, { width, lineGap: 2 })

section('Experience')
for (const role of ROLES) {
  heading(role.title, role.org, role.location ? `${role.period}  |  ${role.location}` : role.period, role.url)
  doc.moveDown(0.25)
  doc.font('Helvetica').fontSize(9.5).fillColor(INK).list(role.bullets, MARGIN + 4, doc.y, {
    width: width - 4,
    bulletRadius: 1.4,
    textIndent: 10,
    bulletIndent: 0,
    lineGap: 1.5,
  })
  doc.x = MARGIN
  doc.moveDown(0.6)
}

section('Education')
for (const item of EDUCATION) {
  heading(item.qualification, item.org, item.period)
  if (item.note) doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(item.note, MARGIN, doc.y + 2, { width })
  doc.moveDown(0.5)
}

section('Publications')
for (const publication of PUBLICATIONS) {
  if (doc.y > doc.page.height - MARGIN - 40) doc.addPage()
  doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(publication.title, MARGIN, doc.y, { width, link: publication.url })
  doc.fontSize(8.5).fillColor(MUTED).text(`${publication.venue}, ${publication.year}  |  `, { continued: true })
  doc.fillColor(ACCENT).text(bare(publication.url), { link: publication.url })
  doc.moveDown(0.45)
}

section('Skills')
doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(SKILLS.join('  |  '), { width, lineGap: 2 })

doc.end()
