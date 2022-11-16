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
