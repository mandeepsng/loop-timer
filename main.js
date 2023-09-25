const { app, BrowserWindow, desktopCapturer, screen, ipcMain, Menu, Tray , powerMonitor , Notification, shell , autoUpdater  } = require('electron')
const fs = require('fs')
const path = require('path')
const axios = require('axios');
const { log } = require('console');
const { spawn } = require('child_process');
const common = require('./functions/common')

const isWindows = process.platform === 'win32';


let win;
let tray = null

let userInactiveTimeout;
let inactiveTimer;
let screenshotIntervals = []

const filePath = path.join(__dirname,'dist', 'rvsdesktime Setup 1.2.4.exe');
const exePath = path.join(__dirname, 'update.json');

const menuTemplate = [  
  // {
  //   label: 'Home',
  //   click: () => {
  //     // mainWindow.loadURL('http://localhost:3007');
  //     win.loadFile(path.join(__dirname, 'index.html'));
  //   }
  // },
  
  // {
  //   label: 'About',
  //   click: () => {
  //     // Create a new window when "About" is clicked
  //     // createAboutWindow()
  //     mainWindow.webContents.loadFile('about.html');
  //   }
  // },
  {
       role: 'quit' 
  }
]


const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)


const createWindow = () => {
  win = new BrowserWindow({
    width: 1800,
    height: 790,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
    // open dev tools
    win.webContents.openDevTools()


    // Check if userData is not null, and decide which page to load.
    if (userData) {
      console.log('userData exitingngngng', userData)
      win.loadFile(path.join(__dirname, 'index.html'))
      .then(() => { win.webContents.send('sendSettings', userData); })
        .then(() => { win.show(); });

      // return win;
      console.log('show-dashboard = ', userData);
      // win.webContents.send('show-dashboard', loginData);
    } else {
      win.loadFile(path.join(__dirname, 'index.html'));
    }


  // win.loadFile('index.html')



}

app.whenReady().then(() => {

console.log('isWindows = ', isWindows )
  // window start

  if (isWindows) {
    // Check for updates when the app is ready (only on Windows)
    // autoUpdater.setFeedURL(exePath);
    // autoUpdater.checkForUpdates();

    // autoUpdater.on('update-available', () => {
    //   console.log('Update available. Downloading...');
    // });

    // autoUpdater.on('update-downloaded', () => {
    //   console.log('Update downloaded. Ready to install.');
    //   // Perform any actions you want before installing the update
    //   // For example, you can notify the user to save their work and then quit the app.
    //   // After the app is restarted, the new version will be launched.
    //   autoUpdater.quitAndInstall();
    // });

    // autoUpdater.on('error', (err) => {
    //   console.error('Error checking for updates:', err);
    // });
  }

  // window end



   // Function to check for system inactivity
   function checkSystemInactivity() {
    console.log('Checking system inactivity...');
    // Perform actions for system inactivity here
  }

  // Set the event listeners for system lock and unlock
  powerMonitor.on('lock-screen', () => {
    console.log('System is locked.');
    stopAllScreenshotProcesses();
    
    // If there was a previous inactiveTimer, clear it
    if (inactiveTimer) {
      clearTimeout(inactiveTimer);
    }
  });

  powerMonitor.on('unlock-screen', () => {
    console.log('System is unlocked.');
    readUserData();
    // Set a new timer for 2 minutes (120,000 milliseconds)
    inactiveTimer = setTimeout(checkSystemInactivity, 120000);
  });




  function userInactive() {
    console.log('User has been inactive for 3 minutes.');
    // win.webContents.send('show-console-message', 'User has been inactive for 3 minutes.');
    }
    // Event listener for when the window gains focus (becomes active)
    app.on('browser-window-focus', () => {
      console.log('Window is now active.');
      // If there was a previous userInactiveTimeout, clear it
      if (userInactiveTimeout) {
        clearTimeout(userInactiveTimeout);
      }
    });
  
    // Event listener for when the window loses focus (becomes inactive)
    app.on('browser-window-blur', () => {
      console.log('Window is now inactive.');
      // Set a new userInactiveTimeout for 3 minutes
      userInactiveTimeout = setTimeout(userInactive, 1 * 60 * 1000); // 3 minutes in milliseconds
    });

// Set a custom user data folder path
// const customUserDataPath = path.join(app.getPath('downloads'), 'erp');
// app.setPath('downloads', customUserDataPath);
// Function to perform actions when the user becomes inactive



  const iconPath = path.join(__dirname, 'assets/icon.png');

  tray = new Tray(iconPath)

  tray.on('click', () =>{
    // win.isVisible()?win.hide():win.show()
    // win.focus()
    // shell.openExternal(`https://app.idevelopment.site/token/${userData.apiResponse.secret}`);
    createWindow()
    // console.log('hererer  fff')
  })

  tray.setToolTip('Loop Reminder')

  tray.setContextMenu(menu)

  createWindow()
  // checkScreenSharingPermission();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })



  app.on('window-all-closed', () => {
    console.log('close')
    // win.minimize()
    // On macOS, quit the app when all windows are closed
    // if (process.platform === 'darwin') {
      // }
        app.quit();
  });


  // Start the Python script
  // startPythonScript();



  // ipcMain.on('open-window', () => {
  //   win.restore();
  // });


  // Listen for the message from the renderer process
  ipcMain.on('logout', async() => {
    // Call the function in the main process
    // const filePath = path.join(__dirname, 'data.json');
    // await clearDataFile(filePath);
    // createWindow();
    // app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
    // app.exit(0)
  });
  
  ipcMain.on('save', async(event, data) => {
    // Call the function in the main process
   
    showNotification();

    console.log('dfsdf', data)

    // saveTimeToFile(660);
    saveDataToFile(data);

     createWindow();
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
    app.exit(0)

  });


  // Save time data to JSON file
async function saveTimeToFile(time) {
  console.log('Saving time')

  const filePath = path.join('data', 'time.json');
  const data = JSON.stringify({ time : time });

  try {
    await fs.promises.writeFile(filePath, data, 'utf-8');
    console.log('Time saved to file:', time);
  } catch (error) {
    console.error('Error saving time:', error);
  }
}

  // Save data to JSON file
  async function saveDataToFile(reqdata) {
    console.log('Save data to file')

    const filePath = path.join('data', 'data.json');
    const data = JSON.stringify({ name : reqdata.name, message : reqdata.message });

    try {
      await fs.promises.writeFile(filePath, data, 'utf-8');
      console.log('Data saved to file:', reqdata.name);
    } catch (error) {
      console.error('Error saving time:', error);
    }
  }

})


function processScreenData(stream) {
  // You can use the stream data to analyze mouse and keyboard activity
  // For example, you can use robotjs to check for mouse and keyboard events

  // For demonstration purposes, we'll log a message when the stream is active
  stream.oninactive = () => {
    console.log('Screen stream stopped. Activity tracking terminated.');
  };
}

ipcMain.on('login', async (event) => {
  console.log('login herer');
  event.sender.send('login-success', { success: false, error: 'Failed to save screenshot' });
})


// Read the data from data.json
let userData = {};


// Function to stop all screenshot processes
function stopAllScreenshotProcesses() {
  if (screenshotIntervals && screenshotIntervals.length > 0) {
    screenshotIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    screenshotIntervals = []; // Clear the array
  }
}

function readUserData() {

  try {
    const rawData = fs.readFileSync(path.join(__dirname, 'data' ,'data.json'));
    userData = JSON.parse(rawData);
    
    const reqTime = fs.readFileSync(path.join(__dirname, 'data' ,'time.json'));
    loopTime = JSON.parse(reqTime);

  } catch (error) {
    console.error('Error reading data.json:', error);
  }


}




// setInterval(readUserData, 1000);

readUserData();




ipcMain.on('event2', (event, arg) => {
  console.log('Received event2 with argument:', arg);
});

// ipcMain.on()


 // Listen for the message from the renderer process
 ipcMain.on('test', async() => {
  // Call the function in the main process
  
  // win.minimize()
  // filePath
  // autoUpdater.setFeedURL(exePath); 
  // autoUpdater.checkForUpdates(); 

  // autoUpdater.on('update-available', () => {
  //   console.log('Update available. Downloading...');
  // });

  // autoUpdater.on('update-downloaded', () => {
  //   console.log('Update downloaded. Ready to install.');
  //   // Perform any actions you want before installing the update
  //   // For example, you can notify the user to save their work and then quit the app.
  //   // After the app is restarted, the new version will be launched.
  //   autoUpdater.quitAndInstall();
  // });

  const new_chartData_test = await activityTracker.getChartData();
  var data = JSON.stringify(new_chartData_test);

  console.log('============================');
  console.log(JSON.stringify(new_chartData_test, null, 2));


  // shell.openExternal(`http://erp.test/token/${user.apiResponse.secret}`);
  
  console.log('jdsfksdj new')

  var demo = Notification.isSupported()
  console.log('test....', demo)
  // LoginNotification('Inactive', 'Since 15 mint ago!')




});


// Function to show a notification
function showNotification(title, body,fix) {
  // const notification = new Notification({
  //   title: title,
  //   body: body,
  // });
    const notification = new Notification(
      {
        title: 'Custom Notification',
        subtitle: 'Subtitle of the Notification',
        body: 'Body of Custom Notification',
        silent: false,
        icon: path.join(__dirname, 'assets/icon.png'),
        hasReply: true,  
        // timeoutType: fix ? 'never' : true , 
        replyPlaceholder: 'Reply Here',
        urgency: 'critical' 
      }
    );

    notification.show();
}


  ipcMain.on('capture-screenshot', async (event) => {
    // console.log('login herer capture-screenshot');
  const displays = screen.getAllDisplays();
  const screenshots = await Promise.all(
    displays.map(async (display) => {
      // const screenshot = await captureScreen(display.id);
      console.log('display = ', display);

      const primaryDisplay = display;
      // const primaryDisplay = screen.getPrimaryDisplay();

      // Get its size
      const { width, height } = primaryDisplay.size;

      // Set up the options for the desktopCapturer
      const options = {
        types: ['screen'],
        thumbnailSize: { width, height },
      };

      // Get the sources
      const sources = await desktopCapturer.getSources(options);
      
      // Find the primary display's source
      const primarySource = sources.find(({display_id}) => display_id == primaryDisplay.id)
      
      // Get the image
      const image = primarySource.thumbnail;
      
      const dataURL = image.toDataURL();

      // Generate a unique filename for the image
      const filename = `screenshot_${Date.now()}.png`;

      // Create the "images" folder if it doesn't exist
      // const imagesFolderPath = path.join(app.getPath('downloads'), 'images');
      const imagesFolderPath = path.join(__dirname, 'images');
      if (!fs.existsSync(imagesFolderPath)) {
        fs.mkdirSync(imagesFolderPath);
      }

      // Save the image file to the "images" folder
      const filePath = path.join(imagesFolderPath, filename);

      fs.writeFile(filePath, image.toPNG(), (error) => {
        if (error) {
          console.error('Error saving the screenshot:', error);
          // event.sender.send('screenshot-captured', { success: false, error: 'Failed to save screenshot' });
        } else {
          console.log('Screenshot saved:', filePath);
          const uploadUrl = 'https://app.idevelopment.site/api/save_screenshort';
          // const uploadUrl = 'http://erp.test/api/save_screenshort';
          uploadImage(filePath, uploadUrl);

          console.log('logged user :', userData);
          // event.sender.send('screenshot-captured', { success: true, filePath: filePath });

        }
      });



      // return true;
    })
  );

});



// Function to clear the data.json file
async function clearDataFile(filePath) {
  // Create an empty JSON object
  const emptyData = {};

  // Convert the empty object to JSON format
  const emptyJsonData = JSON.stringify(emptyData);

  // Write the empty JSON data to the file
  fs.writeFile(filePath, emptyJsonData, (err) => {
    if (err) {
      console.error('Error clearing JSON file:', err);
    } else {
      console.log('Data.json file cleared successfully.');
      closeAllWindows();
      if (process.platform === 'darwin') {
        app.quit();
      }
      
      // createWindow();
    }
  });
}



// Function to upload an json using Axios
async function updateNotification(minutes, uploadUrl) {
  try {

    const formData = new FormData();
    formData.append('idleTime', minutes);
    formData.append('id', userData.apiResponse.user.id);

    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await axios.post(uploadUrl, formData, {
      headers: headers,
    });

    console.log('Inactive notification:', response.data);

  } catch (error) {
    console.error('Error while sending inactive notification:', error.message);
  }
}


// Function to close all windows
function closeAllWindows() {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    window.close();
  });
}




app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});




if (process.platform === 'win32')
{
    app.setAppUserModelId('Loop Reminder')
}



// helper functions


const mainexe = path.join(__dirname, 'main.exe');
// function
function getIdleDurationFromExe() {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(mainexe);

    let output = '';

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      reject(new Error(data.toString()));
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(parseFloat(output));
      } else {
        reject(new Error(`Error: Non-zero exit code ${code}`));
      }
    });
  });
}