const { app, dialog } = require('electron');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

const programKey = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Solarus';
const filePath = path.join(app.getPath("appData"), "Solarus", "delete.bat");
const startMenu = "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs";
const desktop = app.getPath("desktop");

const launcher_shortcut = path.join(startMenu, "Solarus Launcher.lnk");
const launcher_desktop_shortcut = path.join(desktop, "Solarus Launcher.lnk");
const quest_editor_shortcut = path.join(startMenu, "Solarus Quest Editor.lnk");
const quest_editor_desktop_shortcut = path.join(desktop, "Solarus Quest Editor.lnk");

let language;
let answer;

app.setAppUserModelId("Solarus Uninstaller");

async function uninstall() {
  if (language == "fr") {
    answer = dialog.showMessageBoxSync({
      message: "Voulez-vous désinstaller Solarus ?",
      buttons: ["Oui", "Annuler"],
      type: "question",
      title: "Solarus Uninstaller"
    });
  } else {
    answer = dialog.showMessageBoxSync({
      message: "Do you want to uninstall Solarus ?",
      buttons: ["Yes", "Cancel"],
      type: "question",
      title: "Solarus Uninstaller"
    });
  }

  if (answer === 1) return app.quit();

  try {
    if (await fs.pathExists(launcher_shortcut)) {
      await fs.unlink(launcher_shortcut);
    }

    if (await fs.pathExists(launcher_desktop_shortcut)) {
      await fs.unlink(launcher_desktop_shortcut);
    }

    if (await fs.pathExists(quest_editor_shortcut)) {
      await fs.unlink(quest_editor_shortcut);
    }

    if (await fs.pathExists(quest_editor_desktop_shortcut)) {
      await fs.unlink(quest_editor_desktop_shortcut);
    }

    exec(`reg delete "${programKey}" /f`, (error) => {
      if (error) {
        return error(error);
      }
    });

    if(language == "fr"){
      dialog.showMessageBoxSync({
        message: "Solarus a été désinstallé avec succès !",
        buttons: ["Terminer"],
        type: "info",
        title: "Solarus Uninstaller"
      });
    } else {
      dialog.showMessageBoxSync({
        message: "Solarus was uninstalled successfully !",
        buttons: ["Finish"],
        type: "info",
        title: "Solarus Uninstaller"
      });
    }

    const child = spawn('cmd.exe', ['/c', filePath], {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore']
    });
    
    child.unref();
    app.quit();
  } catch (err) {
    return error(err);
  }
}

function error(e){
  dialog.showMessageBoxSync({
    message: `A f*cking error occured, please contact S2009.\n${e.message}`,
    buttons: ["OK"],
    type: "error",
    title: "Solarus Uninstaller"
  });
  app.quit();
}

function setLanguage() {
  const locale = app.getLocale();
  language = locale === "fr" ? locale : "en";
  uninstall();
}

app.whenReady().then(() => {
  setLanguage();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
