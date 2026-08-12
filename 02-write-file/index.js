const fs = require('fs')
const path = require('path')
const readline = require('readline')

const filePath = path.join(__dirname, 'text.txt')

const writeStream = fs.createWriteStream(filePath, { flags: 'a' })

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

console.log('Введите текст. Для выхода напишите "exit" или нажмите Ctrl + C.')

rl.on('line', (input) => {
  if (input.trim() === 'exit') {
    exitProgram()
    return
  }

  writeStream.write(`${input}\n`)
})

rl.on('SIGINT', () => {
  exitProgram()
})

function exitProgram() {
  console.log('Goodbye!')
  rl.close()
  writeStream.end()

  process.exit()
}