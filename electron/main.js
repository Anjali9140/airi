const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const isDev = process.env.NODE_ENV == "development";
const { nativeImage } = require('electron');
const { spawn } = require('child_process')

let llamaProcess
// uvx windows-mcp --transport streamable-http --host localhost --port 11433
function startLlama() {
  llamaProcess = spawn("llama-server", [
    "-hf", "Qwen/Qwen3-VL-2B-Instruct-GGUF:Q4_K_M",
    "--ctx-size", "6144",
    "--threads", "6",         // Keep this equal to your physical CPU cores
    "--batch-size", "512",    // Increased from 128: Processes the system prompt much faster
    "--ubatch-size", "512",   // Increased from 64: Speeds up prompt ingestion
    "--n-gpu-layers", "0",   // Changed from 0 to 99: Offloads processing to GPU (if you have one)
    "--flash-attn", "on",          // Added: Dramatically speeds up processing for large context sizes
    "--port", "11434",
    "--cache-type-k", "q8_0",
    "--cache-type-v", "q8_0",
    "--jinja"
  ])

  llamaProcess.stdout.on("data", (data) => {
    console.log(`[LLAMA] ${data}`)
  })

  llamaProcess.stderr.on("data", (data) => {
    console.error(`[LLAMA ERROR] ${data}`)
  })
}

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    // remove the default titlebar
    titleBarStyle: 'hidden',
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
  })
  
  win.setMenuBarVisibility(false);
  win.setIcon(nativeImage.createFromPath(path.join(__dirname,'../public/logo.ico')), 'Airi');

  if(isDev){
    win.loadURL("http://localhost:3000/");
  }else{
    win.loadFile(path.join(__dirname,"../out/index.html"));
  }
}

app.whenReady().then(() => {
  startLlama()   // start inference server
  createWindow()
})

app.on('before-quit', () => {
  if (llamaProcess) {
    llamaProcess.kill()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
