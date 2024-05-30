// script.js

import { SERVER_URL } from '../config.js';

export let imgRow = 28;
export let imgCol = 32;
export let imgRatio = imgCol / imgRow;

sendPosition(imgCol, imgRow)

export async function sendPosition(imgCol, imgRow) {
    // Prepare the data to send, including only imgCol and imgRow
    const postData = {
        imgCol: imgCol,
        imgRow: imgRow
    };

    try {
        const response = await fetch(`${SERVER_URL}/set-position`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Server response:', responseData);

        // Additional processing based on server response if necessary
    } catch (error) {
        console.error('Failed to send position:', error);
    }
}

export function setNumCol(i) {
    imgCol = i;
    imgRatio = i / imgRow;
    sendPosition(imgCol, imgRow);
}
