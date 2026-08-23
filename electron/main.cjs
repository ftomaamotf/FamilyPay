const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function startServer() {
  const serverScript = path.join(__dirname, '..', 'server.js');
  // Use node to run server.js
  serverProcess = spawn('node', [serverScript], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '5000', NODE_ENV: 'production' }
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Local Server]: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Local Server Error]: ${data}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 880,
    minWidth: 900,
    minHeight: 650,
    title: 'نظام الصندوق والحسابات المشتركة - FamilyPay Desktop',
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  Menu.setApplicationMenu(null);

  const loadURL = () => {
    mainWindow.loadURL('http://localhost:5000').catch(() => {
      setTimeout(loadURL, 500);
    });
  };

  setTimeout(loadURL, 1200);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
