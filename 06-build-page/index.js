const fs = require('fs')
const fsPromises = fs.promises
const path = require('path')

const currentDir = __dirname

const templatePath = path.join(currentDir, 'template.html')
const componentsPath = path.join(currentDir, 'components')
const stylesPath = path.join(currentDir, 'styles')
const assetsPath = path.join(currentDir, 'assets')

const projectDistPath = path.join(currentDir, 'project-dist')
const indexPath = path.join(projectDistPath, 'index.html')
const stylePath = path.join(projectDistPath, 'style.css')
const projectAssetsPath = path.join(projectDistPath, 'assets')

async function createDirectory(directoryPath) {
  await fsPromises.mkdir(directoryPath, { recursive: true })
}

async function buildHtml() {
  let template = await fsPromises.readFile(templatePath, 'utf-8')

  const tags = [...template.matchAll(/{{([^{}]+)}}/g)]

  for (const tag of tags) {
    const componentName = tag[1]
    const componentPath = path.join(componentsPath, `${componentName}.html`)

    const componentStat = await fsPromises.stat(componentPath)

    if (!componentStat.isFile()) {
      throw new Error(`Component is not a file: ${componentName}`)
    }

    const component = await fsPromises.readFile(componentPath, 'utf-8')

    template = template.replace(tag[0], component)
  }

  await fsPromises.writeFile(indexPath, template)
}

async function buildStyles() {
  const entries = await fsPromises.readdir(stylesPath, {
    withFileTypes: true,
  })

  const cssFiles = entries
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.css')
    .sort((a, b) => a.name.localeCompare(b.name))

  const writeStream = fs.createWriteStream(stylePath)

  for (const file of cssFiles) {
    const filePath = path.join(stylesPath, file.name)
    const content = await fsPromises.readFile(filePath, 'utf-8')

    if (!writeStream.write(content)) {
      await new Promise((resolve) => writeStream.once('drain', resolve))
    }
  }

  await new Promise((resolve, reject) => {
    writeStream.end(resolve)
    writeStream.on('error', reject)
  })
}

async function copyDirectory(source, destination) {
  await createDirectory(destination)

  const sourceEntries = await fsPromises.readdir(source, { withFileTypes: true })

  const destinationEntries = await fsPromises.readdir(destination, { withFileTypes: true })

  const sourceNames = new Set(sourceEntries.map((entry) => entry.name))

  for (const entry of destinationEntries) {
    if (!sourceNames.has(entry.name)) {
      const destinationPath = path.join(destination, entry.name)
      await fsPromises.rm(destinationPath, {
        recursive: true,
        force: true,
      })
    }
  }

  for (const entry of sourceEntries) {
    const sourcePath = path.join(source, entry.name)
    const destinationPath = path.join(destination, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath)
    } else if (entry.isFile()) {
      await fsPromises.copyFile(sourcePath, destinationPath)
    }
  }
}

async function buildPage() {
  await createDirectory(projectDistPath)

  await buildHtml()
  await buildStyles()
  await copyDirectory(assetsPath, projectAssetsPath)
}

buildPage().catch((error) => {
  console.error(error)
  process.exitCode = 1
})