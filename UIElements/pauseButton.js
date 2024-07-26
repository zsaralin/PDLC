import { detectVideo } from '../index.js';

let initialized = false;
let playPauseButton0, playIcon0, pauseIcon0, playPauseButton1, playIcon1, pauseIcon1;

function initializeButtons() {
    if (!initialized) {
        const playPauseButtons = document.querySelectorAll('.play-pause-button');
        playPauseButton0 = playPauseButtons[0];
        playIcon0 = playPauseButton0.querySelector('.play-icon');
        pauseIcon0 = playPauseButton0.querySelector('.pause-icon');
        playPauseButton1 = playPauseButtons[1];
        playIcon1 = playPauseButton1.querySelector('.play-icon');
        pauseIcon1 = playPauseButton1.querySelector('.pause-icon');
        initialized = true;
    }
}

export function setupPause(video0, video1) {
    if (!initialized) {
        initializeButtons();
    }

    if (video0) {
        playPauseButton0.addEventListener('click', () => togglePlayPause(video0, playIcon0, pauseIcon0));
    }
    if (video1) {
        playPauseButton1.addEventListener('click', () => togglePlayPause(video1, playIcon1, pauseIcon1));
    }
}

function togglePlayPause(video, playIcon, pauseIcon) {
    if (video && video.readyState >= 2) {
        if (video.paused) {
            video.play();
            detectVideo(video);
        } else {
            video.pause();
        }
        updatePlayPauseButtonState(video, playIcon, pauseIcon);
    }
}

function updatePlayPauseButtonState(video, playIcon, pauseIcon) {
    if (video.paused) {
        playIcon.style.display = 'flex';
        pauseIcon.style.display = 'none';
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'flex';
    }
}
