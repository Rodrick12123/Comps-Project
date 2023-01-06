function savePrompt() {
    var promptInput = document.getElementById("prompt").value;
    alert(promptInput)
}
//this does not work for now
let minutes = 2; 
let seconds = 30; 

let totalSeconds = minutes * 60 + seconds;

const convert = (value, inSeconds) => {
    if (value > inSeconds) {
        let x = value % inSeconds;
        tempSeconds = x;
        return (value - x) / inSeconds;
    } else {
        return 0;
    }
    };

//sets seconds
const setSeconds = (s) => {
    document.querySelector("#seconds").textContent = s + "s";
};
    
    //sets minutes
const setMinutes = (m) => {
    document.querySelector("#minutes").textContent = m + "m";
};

var x = setInterval(() => {
    //clears countdown when all seconds are counted
    if (totalSeconds <= 0) {
        clearInterval(x);
    }
    setMinutes(convert(tempSeconds, 60));
    setSeconds(tempSeconds == 60 ? 59 : tempSeconds);
    totalSeconds--;
    tempSeconds = totalSeconds;
}, 1000);

const tLimit = 60;
let timePassed = 0;
let timeLeft = tLimit;

function TimeLeft() {
    // Get the minutes of the time
    const minutes = Math.floor(timeLeft / 60);
    
    // The secounds are what remains of what can not be evenly divided 
    let seconds = timeLeft % 60;
    
    // puts a 0 before all secounds < 10
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
  
    // The output in MM:SS format
    return `${minutes}:${seconds}`;
}

let interval = null;

document.getElementById("app").innerHTML = `...`

function startTimer() {
  interval = setInterval(() => {
    
    // The amount of time passed increments by one
    timePassed = timePassed += 1;
    timeLeft = tLimit - timePassed;
    
    // The time left label is updated
    document.getElementById("timerLabel").innerHTML = TimeLeft(timeLeft);
  }, 1000);
}
