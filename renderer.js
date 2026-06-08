document.addEventListener('DOMContentLoaded', () => {



  // Reference the DOM element where you want to display the JSON data
  const dataDisplay = document.getElementById('data-display');

  // Listen for updates from the main process
  ipcRenderer.on('update-data', (event, jsonData) => {
  // Update the DOM with the JSON data
    dataDisplay.textContent = JSON.stringify(jsonData, null, 2);

    window.jsonData = jsonData;
    
    console.log('jsonData', event);
  });
  
  ipcRenderer.on('update-time', (seconds) => {
    showTimer(seconds);
  });

  ipcRenderer.on('timer-stopped', () => {
    const appTimer = document.querySelector('.app__timer');
    if (appTimer) {
      appTimer.querySelector('h1').textContent = '00:00';
      appTimer.classList.remove('active');
    }
    document.querySelectorAll('.saveTime').forEach(b => b.classList.remove('active-timer'));
  });


  
  // Only run this code if the user is on the dashboard page
  if (window.location.href.includes('index.html')) {

    ipcRenderer.on('sendSettings', (data) => {
      const firstNameElement = document.getElementById('name');
      const message = document.getElementById('message');
      if (firstNameElement) firstNameElement.value = data.name || '';
      if (message) message.value = data.message || '';
    });


    ipcRenderer.on('timer', (event, userData) => {


      const timer = document.getElementById('timer');

      timer.innerText = `Timer: ${event} mint`;

      // Update your dashboard with the new data.
      console.log('timer running...', event);
      // userData contains the data you sent from the main process.
      // For example, you can display it on the dashboard or update your UI elements accordingly.
      // ...
    });

  }

  // Add the event listener for the screenshot button only if it exists
  const screenshotButton = document.getElementById('screenshot-button');
  if (screenshotButton) {
    screenshotButton.addEventListener('click', takeScreenshot);
  }


  const loginForm = document.getElementById('login-form');
  if(loginForm){
    document.getElementById('login-form').addEventListener('submit', (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Trigger the login attempt
      ipcRenderer.send('login-attempt', { email, password });
    });
  }

  const logout = document.getElementById('save');
  if(logout){

      logout.addEventListener('click', (event) => {
      event.preventDefault();

      logout.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
      logout.disabled = true;

      const name = document.getElementById('name').value;
      const message = document.getElementById('message').value;

      setTimeout(function() {
        // Restore the original spinner icon after a delay (simulating completion)
        logout.innerHTML = '<span class="fa fa-check"></span> Saved';
        console.log('Saved');
        // Optionally, re-enable the button
        logout.disabled = false;
      }, 2000);
      console.log('save clicked');

      // remove all data from data.json file
      ipcRenderer.send('save', { name, message });
      
    })
  }
  
  const saveTimes = document.getElementsByClassName('saveTime');

  if (saveTimes.length > 0) {
    for (const saveTime of saveTimes) {
      saveTime.addEventListener('click', (event) => {
        event.preventDefault();
        document.querySelectorAll('.saveTime').forEach(b => b.classList.remove('active-timer'));
        saveTime.classList.add('active-timer');
        const dataTime = parseInt(saveTime.getAttribute('data-time'), 10);
        ipcRenderer.send('saveTime', { dataTime });
      });
    }
  }

  const stopBtn = document.getElementById('stop-timer');
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      ipcRenderer.send('stopTimer');
    });
  }

});



async function takeScreenshot() {
  await window.screenshot.captureScreenShot()
  window.screenshot.screenShotCaptured((event, dataURL) => {
    console.log('screenshot-button', dataURL);
    document.getElementById('screenshot-image').src = dataURL;
  });
}


// Add the event listener for the screenshot button only if it exists
const testing = document.getElementById('testing');
if (testing) {
  testing.addEventListener('click', test);
}


async function test() {
  await window.checking.test()
  // window.screenshot.screenShotCaptured((event, dataURL) => {
  //   console.log('screenshot-button', dataURL);
  //   document.getElementById('screenshot-image').src = dataURL;
  // });
}


ipcRenderer.on('login-failed', (event, errorMessage) => {
  alert('Login failed. Error: Wrong email password'  );
  console.log(errorMessage);
});

// Listen for the show-console-message event from the main process
ipcRenderer.on('show-console-message', (event, message) => {
  console.log(message);
});