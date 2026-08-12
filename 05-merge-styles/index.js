const fs = require('fs/promises')
const path = require('path')

const stylesPath = path.join(__dirname, 'styles')
const distPath = path.join(__dirname, 'project-dist')
const bundlePath = path.join(distPath, 'bundle.css')

async function buildBundle() {
  try {
    await fs.mkdir(distPath, { recursive: true })

    const entries = await fs.readdir(stylesPath, { withFileTypes: true })

    let bundle = ''

    for (const entry of entries) {
      if (!entry.isFile()) continue

      if (path.extname(entry.name) !== '.css') continue

      const filePath = path.join(stylesPath, entry.name)
      const content = await fs.readFile(filePath, 'utf8')

      bundle += `${content}\n`
    }

    await fs.writeFile(bundlePath, bundle)
  } catch (error) {
    console.error(error)
  }
}

buildBundle()