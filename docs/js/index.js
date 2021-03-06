const client = new ApiAi.Client({ accessToken: '051337e798a548eca8fdeb83381ab656' });
const OTHER = "other",
    SELF = "self";
const startResponses = [
    "Welcome to Gauge world!! &#x1f60a;\nHow can I help you?",
    "Hello, How can I help you?",
    "Hi there, welcome to Gauge &#x1f60a;\nHow can I help you?",
    "Hey there! What can I help you with?"
];

client.textRequest("Gauge");

setTimeout(() => {
    document.getElementById('message').focus();
    let res = getMessage(convertToHtml(startResponses[Math.floor(Math.random() * startResponses.length)]), OTHER);
    document.getElementById('chatarea').innerHTML += res;
}, 1000);

document.getElementById('message').addEventListener('keypress', (event) => {
    if (event.keyCode == 13) {
        event.preventDefault();
        document.getElementById('send').click();
    }
});

const reply = () => {
    let question = document.getElementById('message').value;
    if (!question.trim()) return;
    document.getElementById('chatarea').innerHTML += getSelfMessage(question);
    scrollToLastMessage();
    document.getElementById('message').value = "";
    client.textRequest(question).then(handleResponse).catch(handleError);
}

const handleResponse = (data) => {
    const res = data['result']['fulfillment'];
    if (!res['data'] && !res['speech']) {
        setTimeout(() => {
            client.textRequest(data['result']['resolvedQuery']).then(handleSecondResponse).catch(handleError)
        }, 1000);
        return;
    }
    addMessage(getOtherMessage(res));
}

const handleSecondResponse = (data) => {
    const res = data['result']['fulfillment'];
    if (!res['data'] && !res['speech']) {
        addMessage('<p class="notification">Server is unable to respond. Please try again.</p>');
        return;
    }
    addMessage(getOtherMessage(res));
}

const handleError = (error) => {
    let message = error.message || `Request failed, make sure you are connected to the internet.`
    if (!navigator.onLine) message = `Not connected to the internet.`;
    document.getElementById('chatarea').innerHTML += `<p class="notification">${message}</p>`;;
}

const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat?"))
        document.getElementById('chatarea').innerHTML = "";
    document.getElementById('message').focus();
}

const addMessage = (message) => {
    document.getElementById('chatarea').innerHTML += message;
    scrollToLastMessage();
}

const convertToHtml = (text) => sanitize(text).split("\n").map((line) => line.trim() === "" ? "<p><br></p>" : `<p>${line}</p>`).join("");

const sanitize = (text) => text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const getOtherMessage = (res) => {
    let message = res['speech'] ? convertToHtml(res['speech']) : "";
    if (res['data']) {
        if (res['data']['code'])
            message += `<pre>${sanitize(res['data']['code'])}</pre>`;
        const keys = Object.keys(res['data']['links'])
        if (keys.length > 0) {
            if (keys.length > 1)
                message += "<ul>" + keys.map((k) => `<li><a href="${res['data']['links'][k]}" target="_blank">${k}</a></li>`).join("") + "</ul>";
            else
                message += `<a class="doc" href="${res['data']['links'][keys[0]]}" target="_blank">${keys[0]}</a>`
        }
    }
    return getMessage(message, OTHER);
}

const getSelfMessage = (message) => getMessage(convertToHtml(message), SELF)

const getMessage = (message, who) => {
    return `<li class="${who}">
    <div class="msg">
        ${message}
        <time>${getCurrentTime()}</time>
    </div>
</li>`
}

const getCurrentTime = () => {
    let now = new Date();
    return `${formatTime(now.getHours())}:${formatTime(now.getMinutes())}:${formatTime(now.getSeconds())}`;
}

const formatTime = (time) => ("0" + time).slice(-2);

const scrollToLastMessage = () => {
    let elements = document.getElementsByTagName("li");
    elements[elements.length - 1].scrollIntoView(true);
}