// helper function to print strings to html document as a log
export function log(...txt) {
    console.log(...txt); // eslint-disable-line no-console
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.innerHTML += `<br>`;
        overlay.innerHTML += txt.map(message => stylizeMessage(message)).join('<br>');
    }
}

function stylizeMessage(message) {
    return message.replace(/\d+/g, match => `<span style="color: #4CAF50;">${match}</span>`);
}
