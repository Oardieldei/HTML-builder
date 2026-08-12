const fs = require('fs/promises')
const path = require('path')

const secretFolder = path.join(__dirname, 'secret-folder')

async function showFilesInfo() {
  const items = await fs.readdir(secretFolder, { withFileTypes: true })

  for (const item of items) {
    if (!item.isFile()) {
      continue
    }

    const filePath = path.join(secretFolder, item.name)
    const stats = await fs.stat(filePath)

    console.log(
      `${path.parse(item.name).name} - ${path.extname(item.name).slice(1)} - ${stats.size}`
    )
  }
}

showFilesInfo().catch(console.error)