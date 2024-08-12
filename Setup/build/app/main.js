const {  app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const axios = require('axios');
const he = require('he');

const startMenu = "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs"

let win;
let window;
let data;
let language;
let directory = "C:\\Program Files";
let filePath;
let programFolder;

app.setAppUserModelId("Solarus Setup");

function showError(e) {
  window.setAlwaysOnTop(false);
  console.error(e);
  dialog.showMessageBoxSync({
    title: "Solarus Setup",
    message: `A f*cking error occured, please contact S2009\n${e.message}`,
    type: 'error'
  });
  window.destroy();
  win.destroy();
  app.quit();
}

async function install(launcher, quest_editor, shortcut) {
  win.closable = false;
  win.on("close", e => {
    e.preventDefault();
  });

  window = new BrowserWindow({
    width: 800,
    height: 400,
    resizable: false,
    icon: path.join(__dirname, "../icon.ico"),
    autoHideMenuBar: true,
    fullscreenable: false,
    center: true,
    movable: false,
    closable: false,
    frame: false,
    type: "toolbar",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  window.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key === 'I') {
      event.preventDefault();
    } else if (input.alt) {
      event.preventDefault();
    }
  });

  window.setAlwaysOnTop(true);

  window.on("close", e => {
    e.preventDefault();
  });

  if (language == "fr"){
    window.loadFile(path.join(__dirname, 'www/install.html'));
  } else {
    window.loadFile(path.join(__dirname, 'www/install_en.html'));
  }

  async function finish() {    
    window.webContents.send("message-from-main", "infiniteProgress");
    win.setProgressBar(2);
    
    if (language == "fr"){
      window.webContents.send("message-from-main", {command: "text", data: "Finalisation"});
    } else {
      window.webContents.send("message-from-main", {command: "text", data: "Finalization"});
    }
    
    await fs.unlink(filePath);

    if(launcher && !quest_editor){
      shell.writeShortcutLink(path.join(startMenu, "Solarus Launcher.lnk"), {target: path.join(directory, "Launcher", "solarus-launcher.exe")});
      if (shortcut){
        shell.writeShortcutLink(path.join(app.getPath('desktop'), "Solarus Launcher.lnk"), {target: path.join(directory, "Launcher", "solarus-launcher.exe")});
      }
    } else if(launcher && quest_editor){
      shell.writeShortcutLink(path.join(startMenu, "Solarus Launcher.lnk"), {target: path.join(directory, "Launcher and Quest Editor", "solarus-launcher.exe")});
      shell.writeShortcutLink(path.join(startMenu, "Solarus Quest Editor.lnk"), {target: path.join(directory, "Launcher and Quest Editor", "solarus-quest-editor.exe")});
      if (shortcut){
        shell.writeShortcutLink(path.join(app.getPath('desktop'), "Solarus Launcher.lnk"), {target: path.join(directory, "Launcher and Quest Editor", "solarus-launcher.exe")});
        shell.writeShortcutLink(path.join(app.getPath('desktop'), "Solarus Quest Editor.lnk"), {target: path.join(directory, "Launcher and Quest Editor", "solarus-quest-editor.exe")});
      }
    } else if(!launcher && quest_editor){
      shell.writeShortcutLink(path.join(startMenu, "Solarus Quest Editor.lnk"), {target: path.join(directory, "Quest Editor", "solarus-quest-editor.exe")});
      if (shortcut){
        shell.writeShortcutLink(path.join(app.getPath('desktop'), "Solarus Quest Editor.lnk"), {target: path.join(directory, "Quest Editor", "solarus-quest-editor.exe")});
      }
    }

    window.destroy();

    if (language == "fr"){
      await dialog.showMessageBoxSync(win, {
        title: "Solarus Setup",
        message: "Solarus a été installé avec succès !",
        type: 'info',
        buttons: ["Terminer"]
      });
    } else {
      await dialog.showMessageBoxSync(win, {
        title: "Solarus Setup",
        message: "Solarus was successfully installed !",
        type: 'info',
        buttons: ["Finish"]
      });
    }

    win.destroy();
  }

  async function addUninstaller() {
    const content = 
    `
      @echo off
      setlocal enabledelayedexpansion

      set "folderPath=${path.join(directory, programFolder)}"

      if not defined folderPath (
          echo FolderPath not defined.
          pause
          exit /b 1
      )

      if not exist "%folderPath%" (
          echo Folder %folderPath% not found.
          pause
          exit /b 1
      )

      timeout /t 5
      rmdir /s /q "%folderPath%"

      if exist "%folderPath%" (
          echo Can't remove %folderPath%.
          pause
          exit /b 1
      ) else (
          echo %folderPath% was successfully removed.
      )

      set "tempScript=%TEMP%\\uninstall_solarus.bat"
      echo @echo off > "%tempScript%"
      echo rmdir /s /q "%folderPath%" >> "%tempScript%"
      echo rmdir /s /q "%~dp0" >> "%tempScript%"
      echo del "%~f0" >> "%tempScript%"
      echo del "%tempScript%" >> "%tempScript%"

      start /b "" cmd /c "%tempScript%"

      endlocal
    `;

    const scriptPath = path.join(app.getPath('appData'), 'Solarus', 'delete.bat');

    await fs.ensureDir(path.join(app.getPath('appData'), 'Solarus'), { recursive: true });
    await fs.writeFile(scriptPath, content, (err) => {
      if (err) {
        showError(err);
      }
    });

    const uninstallerPath = path.join(directory, programFolder, "uninstall.exe").replace(/\\/g, '\\\\');
    const reg = 
    `Windows Registry Editor Version 5.00

    [HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Solarus]
    "DisplayIcon"="${uninstallerPath}"
    "DisplayName"="Solarus"
    "DisplayVersion"="1.0.0"
    "NoModify"=dword:00000001
    "NoRepair"=dword:00000001
    "Publisher"="S2009"
    "UninstallString"="${uninstallerPath}"
    "URLInfoAbout"="https://solarus-games.org/"
    `;

    const regPath = path.join(app.getPath("appData"), 'Solarus', "uninstaller.reg")

    await fs.writeFile(regPath, reg, (err) => {
      if (err) {
        showError(err);
      }
    });

    exec(`regedit /s ${regPath}`, (error) => {
      if (error) {
        return showError(error);
      }
    });
  }

  async function downloadUninstaller() {
    const writer = fs.createWriteStream(path.join(directory, programFolder, "uninstall.exe"));
  
    const response = await axios({
      url:'https://sls.alwaysdata.net/solarus?uninstaller',
      method: 'GET',
      responseType: 'stream'
    });
  
    const totalLength = response.headers['content-length'];
    let receivedLength = 0;
  
    response.data.on('data', (chunk) => {
      receivedLength += chunk.length;
      const percentage = (receivedLength / totalLength) * 100;
      win.setProgressBar(percentage.toFixed(0) / 100);
      window.webContents.send("message-from-main", {command: "progress", data: percentage.toFixed(2)});
      window.webContents.send("message-from-main", {command: "text", data: "Installation"});
    });
  
    response.data.pipe(writer);
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async function extractZip() {
    const zip = new AdmZip(filePath);
    const extractDir = path.dirname(filePath);
    const entries = zip.getEntries();
    const totalEntries = entries.length;
    let extractedEntries = 0;

    for (const entry of entries) {
      if (entry.entryName.startsWith('solarus/')) {
        const entryPath = path.join(extractDir, entry.entryName.replace('solarus/', `${programFolder}/`));
        if (entry.isDirectory) {
          await fs.mkdirSync(entryPath, { recursive: true });
        } else {
          const data = entry.getData();
          await fs.writeFileSync(entryPath, data);
        }
      }

      extractedEntries++;
      const progress = (extractedEntries / totalEntries) * 100;
      window.webContents.send("message-from-main", {command: "progress", data: progress.toFixed(2)});
      win.setProgressBar(progress.toFixed(0) / 100);
      window.webContents.send("message-from-main", {command: "text", data: "Extraction: " + progress.toFixed(2) + "%"});
    }
  }

  async function downloadFile(url, file) {
    filePath = path.join(directory, file);
    const writer = fs.createWriteStream(filePath);
  
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
  
    const totalLength = response.headers['content-length'];
    let receivedLength = 0;
  
    response.data.on('data', (chunk) => {
      receivedLength += chunk.length;
      const percentage = (receivedLength / totalLength) * 100;
      window.webContents.send("message-from-main", {command: "progress", data: percentage.toFixed(2)});
      win.setProgressBar(percentage.toFixed(0) / 100);

      if(language == "fr"){
        window.webContents.send("message-from-main", {command: "text", data: `Téléchargement de ${file}: ${percentage.toFixed(2)}%`});
      } else {
        window.webContents.send("message-from-main", {command: "text", data: `Downloading ${file}: ${percentage.toFixed(2)}%`});
      }
    });
  
    response.data.pipe(writer);
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async function init() {
    window.webContents.send("message-from-main", "infiniteProgress");
    win.setProgressBar(2);

    if(language == "fr"){
      window.webContents.send("message-from-main", {command: "text", data: "Initialisation"});
    }else {
      window.webContents.send("message-from-main", {command: "text", data: "Initialization"});
    }

    directory = path.join(directory, "Solarus");
  
    try {
      await fs.access(directory, fs.constants.F_OK);
      await fs.emptyDir(directory);
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.ensureDir(directory, { recursive: true });
      } else {
        showError(err);
      }
    }
  }

  try {
    await init();
    if(launcher && !quest_editor){
      programFolder = "Launcher";
      await downloadFile(data.solarus_launcher_data.installerUrl, data.solarus_launcher_data.fileName);
    } else if(launcher && quest_editor){
      programFolder = "Launcher and Quest Editor";
      await downloadFile(data.solarus_quest_editor_data.installerUrl, data.solarus_quest_editor_data.fileName);
    } else if(!launcher && quest_editor){
      programFolder = "Quest Editor"
      await downloadFile(data.solarus_quest_editor_data.installerUrl, data.solarus_quest_editor_data.fileName);
    }

    await extractZip();
    await downloadUninstaller();
    await addUninstaller();
    await finish();
  } catch (error) {
    showError(error);
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    icon: path.join(__dirname, "../icon.ico"),
    autoHideMenuBar: true,
    fullscreenable: false,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (language == "fr"){
    win.loadFile(path.join(__dirname, 'www/index.html'));
  } else {
    win.loadFile(path.join(__dirname, 'www/index_en.html'));
  }

  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key === 'I') {
      event.preventDefault();
    } else if (input.alt) {
      event.preventDefault();
    }
  });
}

function setLanguage() {
  const locale = app.getLocale();
  if(locale == "fr") {
    language = locale;
  } else {
    language = "en";
  }
  createWindow();
}

app.whenReady().then(() => {
  setLanguage();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('message-from-renderer', async (event, arg) => {
    if(arg.command == "href"){
        shell.openExternal(arg.url);
    } else if (arg == "getLanguage") {
      event.reply('message-from-main', language);
    } else if (arg.command == "setData") {
      data = arg.data;
    } else if (arg == "getData") {
      event.reply('message-from-main', {command: "data", data: data});
    } else if (arg == "setPath") {
      const filePath = await dialog.showOpenDialogSync(win, {
        properties: ['openDirectory'],
        defaultPath: directory
      })

      if (filePath) {
        directory = filePath[0];
        event.reply('message-from-main', {command: "path", data: filePath[0]});
      }
    } else if (arg.command == "install"){
      let answer = await dialog.showMessageBoxSync(win, {
        title: "Solarus Setup",
        message: "Voulez-vous installer Solarus ?",
        type: 'question',
        buttons: ["Oui", "Annuler"]
      });

      if (language != "fr"){
        answer = await dialog.showMessageBoxSync(win, {
          title: "Solarus Setup",
          message: "Do you want to install Solarus ?",
          type: 'question',
          buttons: ["Yes", "Cancel"]
        });
      }

      if(answer == 0){
        event.reply('message-from-main', "installing");
        await install(arg.launcher, arg.quest_editor, arg.shortcut);
      } else {
        event.reply('message-from-main', "cancel");
      }
    } else if (arg == "getGame") {
      const games = data.solarus_games_data;
      const randomGame = Math.floor(Math.random() * games.length);
      const game = games[randomGame];
      const game_data = {
        name: he.decode(game.title).replace(/<br\s*\/?>/gi, ' '),
        description: he.decode(game.excerpt).replace(/<br\s*\/?>/gi, ' '),
        image: game.thumbnail,
        url: game.website
      };

      event.reply('message-from-main', {command: "game", data: game_data});
    }
});