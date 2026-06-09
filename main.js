const { app, BrowserWindow, ipcMain, Menu, Tray, powerMonitor, Notification, screen } = require('electron')
const fs = require('fs')
const path = require('path')
const axios = require('axios');
const { log } = require('console');

const isWindows = process.platform === 'win32';


let win;
let tray = null

let userInactiveTimeout;
let inactiveTimer;
let screenshotIntervals = []


// Define an array to store interval IDs.
let intervalIds = []
let notificationWindows = [];

var intervalID = 0;

const filePath = path.join(__dirname,'dist', 'rvsdesktime Setup 1.2.4.exe');
const exePath = path.join(__dirname, 'update.json');

const menuTemplate = [  
  {
    label: 'Home',
    click: () => {
      // mainWindow.loadURL('http://localhost:3007');
      win.loadFile(path.join(__dirname, 'index.html'));
    }
  },
  
  {
    label: 'About Me',
    click: () => {
      // Create a new window when "About" is clicked
      // createAboutWindow()
      win.webContents.loadFile(path.join(__dirname, 'about.html'));
    }
  },
  // {
  //      role: 'quit' 
  // },
  // {
  //   lable: 'Exit',
  //   click: () => {
  //     clearInterval(intervalID);
  //     app.quit();
  //   }
  // }
]


const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)


const createWindow = () => {
  win = new BrowserWindow({
    width: 750,
    height: 790,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
    // open dev tools
    // win.webContents.openDevTools()


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




    // Function to show a notification
    function showNotification(title, message, fix) {
      notificationWindows.forEach(w => { if (!w.isDestroyed()) w.close(); });
      notificationWindows = [];

      const displays = screen.getAllDisplays();
      displays.forEach(display => {
        const { x, y, width, height } = display.bounds;
        const w = new BrowserWindow({
          x, y, width, height,
          frame: false,
          transparent: true,
          alwaysOnTop: true,
          skipTaskbar: true,
          resizable: false,
          movable: false,
          focusable: true,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
          }
        });
        w.loadFile(path.join(__dirname, 'notification.html'), {
          query: {
            title: title || 'Hey',
            message: message || 'Take a break!'
          }
        });
        w.setAlwaysOnTop(true, 'screen-saver');
        notificationWindows.push(w);
      });

      setTimeout(() => {
        notificationWindows.forEach(w => { if (!w.isDestroyed()) w.close(); });
        notificationWindows = [];
      }, 7000);
    }



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
  })

  tray.setToolTip('Loop Reminder')

  tray.setContextMenu(menu)

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })



  app.on('window-all-closed', () => {
    // Check if intervalID is not null before attempting to clear it
    clearInterval(intervalID);
  
    // Quit the application after a delay
    // setTimeout(function () {
      app.quit();
    // }, 2000);
  });





  // ipcMain.on('open-window', () => {
  //   win.restore();
  // });


  
  ipcMain.on('save', async(event, reqdata) => {
    // Call the function in the main process
    // await saveDataToFile(data);

    const filePath = path.join(__dirname, 'data.json');
    const data = JSON.stringify({ name : reqdata.name, message : reqdata.message });


    fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(reqdata, null, 2));

    // try {
    //   await fs.promises.writeFile(filePath, data, 'utf-8');
    //   // fs.writeFileSync(filePath, data, 'utf-8');
    //   console.log('Data saved to file:', reqdata.name);
    // } catch (error) {
    //   console.error('Error saving time:', error);
    // }

    win.webContents.send('update-data', data);
    // createWindow();
    // app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
    // app.exit(0)
  });

  
  
  ipcMain.on('saveTime', async(event, data) => {
    timer(data.dataTime)
  });

  ipcMain.on('stopTimer', () => {
    clearInterval(intervalID);
    intervalID = 0;
    if (win && !win.isDestroyed()) win.webContents.send('timer-stopped');
  });



  function timer(seconds) {
    // immediately clear any, if existing, intervals
    clearInterval(intervalID);

    // create two dates instances, one for the moment in which the timer begins, one for the moment in which it should end
    const now = Date.now();
    const then = new Date(now + seconds * 1000);

    // compute the number of seconds between the two SVGElementInstanceList, and immediately call the function to highlight the amount of time
    const totalSeconds = Math.round((then - now) / 1000);
    // immediately show the timer for the number of seconds
    // showTimer(totalSeconds);

    console.log(`seconds = ${seconds}`)

    // show initial time immediately so display updates at once
    if (win && !win.isDestroyed()) {
      win.webContents.send('update-time', totalSeconds);
    }

    // set up the interval
    intervalID = setInterval(() => {
        // compute the number of seconds between the current instance and the instance represented by `then`
            const missingSeconds = Math.round((then - Date.now()) / 1000);

            console.log(missingSeconds + " seconds")
            console.log(then + " then")
            console.log(`intervalID => ${intervalID}`)


            if (win && !win.isDestroyed()) {
              win.webContents.send('update-time', missingSeconds);
            }

            // ipcRenderer.send('saveTime', { missingSeconds : missingSeconds, totalSeconds: totalSeconds , intervalID: intervalID  } );
            // ipcRenderer.send('saveInterval', { intervalIIId: intervalID  } );

            // showTimer(missingSeconds);

        // when reaching 0 clear the interval and remove the arbitrary class
        if (missingSeconds <= 0) {

            // ipcRenderer.send('notification', { loopInteval : missingSeconds   } );

            // readUserData()

            try {
              const rawData = fs.readFileSync(path.join(__dirname,'data.json'));
              userData = JSON.parse(rawData);
          
              showNotification(userData.name, userData.message)
          
            } catch (error) {
              console.error('Error reading data.json:', error);
            }

            // appTimer.classList.remove('active');

            console.log(`missingSeconds = ${missingSeconds}`)
            console.log(`intervalID => ${intervalID}`)
            
            //clearInterval(intervalID);


            if (intervalIds && intervalIds.length > 0) {
                console.log('Clearing existing intervals');
                intervalIds.forEach((intervalId) => {
                    clearInterval(intervalId);
                });
                intervalIds = []; // Clear the array
            }
            
            console.log(`totalSeconds = ${totalSeconds}`)
            timer(seconds)

        }
    }, 1000);


    
}


  
  // Save data to JSON file
  async function saveDataToFile(reqdata) {
    console.log('Save data to file')

    const filePath = path.join('data', 'data.json');
    const data = JSON.stringify({ name : reqdata.name, message : reqdata.message });

    try {
      // await fs.promises.writeFile(filePath, data, 'utf-8');
      fs.writeFileSync(filePath, data, 'utf-8');
      console.log('Data saved to file:', reqdata.name);
    } catch (error) {
      console.error('Error saving time:', error);
    }

  }
 


})



// Read the data from data.json
let userData = {};

// Function to stop all screenshot processes
async function stopAllScreenshotProcesses() {
  if (intervalIds && intervalIds.length > 0) {
    console.log('Clearing existing intervals');
    intervalIds.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    intervalIds = []; // Clear the array
  }
}

function readUserData() {

  try {
    const rawData = fs.readFileSync(path.join(__dirname,'data.json'));
    userData = JSON.parse(rawData);

    // const rawDataTimer = fs.readFileSync(path.join(__dirname, 'data' ,'time.json'));
    // userDataTimer = JSON.parse(rawDataTimer);


    // showNotification(userData.name, userData.message) 
    

  } catch (error) {
    console.error('Error reading data.json:', error);
  }


}


readUserData();


ipcMain.on('event2', (event, arg) => {
  console.log('Received event2 with argument:', arg);
});

ipcMain.on('close-notification', () => {
  notificationWindows.forEach(w => { if (!w.isDestroyed()) w.close(); });
  notificationWindows = [];
});


// // Function to show a notification
// function showNotification(title, message,fix) {
//   // const notification = new Notification({
//   //   title: title,
//   //   body: body,
//   // });
//     const notification = new Notification(
//       {
//         title: title ? title : 'Hey',
//         subtitle: 'Subtitle of the Notification',
//         body: message ? message : 'Take break !!',
//         silent: false,
//         icon: path.join(__dirname, 'assets/icon.png'),
//         hasReply: true,  
//         // timeoutType: fix ? 'never' : true , 
//         replyPlaceholder: 'Reply Here',
//         urgency: 'critical' 
//       }
//     );

//     notification.show();
// }


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



