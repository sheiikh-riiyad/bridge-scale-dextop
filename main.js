const { app, BrowserWindow, Menu } = require('electron'); 
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let backendProcess, printedProcess, serverProcess;

app.whenReady().then(() => {
    console.log('Electron app is ready');
    
    const serverPath = path.join(__dirname, 'src', 'server.exe');
    const serverPathQuoted = `"${serverPath}"`;

    // Resolve absolute paths for backend executables
    const backendPath = path.join(__dirname, 'backend', 'backend.exe');
    const printedPath = path.join(__dirname, 'printed', 'backend.exe');
    

    // Ensure the paths are correctly quoted in case of spaces
    const backendPathQuoted = `"${backendPath}"`;
    const printedPathQuoted = `"${printedPath}"`;
    

    // Start the backend servers using spawn with shell: true
    console.log('Starting backend processes');
    backendProcess = spawn(backendPathQuoted, { shell: true, windowsHide: true });
    printedProcess = spawn(printedPathQuoted, { shell: true, windowsHide: true });
    serverProcess = spawn(serverPathQuoted, { shell: true, windowsHide: true });

    backendProcess.stdout.on("data", (data) => console.log(`Backend Output: ${data}`));
    backendProcess.stderr.on("data", (data) => console.error(`Backend Error: ${data}`));
    backendProcess.on("exit", (code) => console.log(`Backend exited with code ${code}`));

    printedProcess.stdout.on("data", (data) => console.log(`Printed Backend Output: ${data}`));
    printedProcess.stderr.on("data", (data) => console.error(`Printed Backend Error: ${data}`));
    printedProcess.on("exit", (code) => console.log(`Printed Backend exited with code ${code}`));

    // Create the Electron window with proper webPreferences
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, 'src', 'tarm.png'),
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,  
        }
    });

    // Load the frontend URL or file depending on whether the app is packaged
    mainWindow.loadURL('http://localhost:3000');

    mainWindow.on('ready-to-show', ()=>{
        mainWindow.show()
    } )
    // Open dev tools for debugging in development mode
    // if (!app.isPackaged) {
    //     mainWindow.webContents.openDevTools();
    // }

    // // Add a delay before launching the window, to make sure the backend has time to start
    // setTimeout(() => {
    //     if (!mainWindow.isVisible()) {
    //         mainWindow.show();
    //     }
    // }, 5000);

    // Define the menu template
    const template = [
        {
            label: '', 

        },
        {
            label: '', 

        }
    ];

    // Build the menu from the template
    const appMenu = Menu.buildFromTemplate(template); // Fixed: Use `Menu` and `appMenu`

    // Set the application menu
    Menu.setApplicationMenu(appMenu); // Fixed: Use `Menu` and `appMenu`
});

// Handle app close and terminate backend processes
app.on('window-all-closed', () => {
    console.log('Window closed, quitting app...');
    if (backendProcess) {
        backendProcess.kill('SIGINT');
    }
    if (printedProcess) {
        printedProcess.kill('SIGINT');
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    // Forcefully kill the processes if not properly cleaned up
    if (backendProcess && !backendProcess.killed) {
        backendProcess.kill('SIGTERM');
    }
    if (printedProcess && !printedProcess.killed) {
        printedProcess.kill('SIGTERM');
    }
});