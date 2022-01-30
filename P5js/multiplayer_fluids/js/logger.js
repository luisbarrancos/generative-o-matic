function setuplogger() {
    var old = console.log;
    var logger = document.getElementById('log');
    console.log = function (message) {

        if (logger != null) {
            if (typeof message == 'object') {
                logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
            } else {
                logger.innerHTML += message + '<br />';
            }
            var objDiv = document.getElementById("log");
            objDiv.scrollTop = objDiv.scrollHeight;
        }

    }
}