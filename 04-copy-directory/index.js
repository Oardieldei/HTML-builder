const fs = require('fs/promises')
const path = require('path')

const sourceDir = path.join(__dirname, 'files')
const targetDir = path.join(__dirname, 'files-copy')

async function copyDir(source, target) {
  await fs.mkdir(target, { recursive: true })

  const sourceItems = await fs.readdir(source, { withFileTypes: true })
  const targetItems = await fs.readdir(target, { withFileTypes: true })

  const sourceNames = sourceItems.map((item) => item.name)

  for (const item of targetItems) {
    if (!sourceNames.includes(item.name)) {
      await fs.rm(path.join(target, item.name), {
        recursive: true,
        force: true,
      })
    }
  }

  for (const item of sourceItems) {
    const sourcePath = path.join(source, item.name)
    const targetPath = path.join(target, item.name)

    if (item.isDirectory()) {
      await copyDir(sourcePath, targetPath)
    } else {
      await fs.copyFile(sourcePath, targetPath)
    }
  }
}

copyDir(sourceDir, targetDir).catch(console.error)