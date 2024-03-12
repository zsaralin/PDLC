import {detectVideo} from '../index.js'

const playPauseButton0 = document.querySelectorAll('.play-pause-button')[0];
const playIcon0 = playPauseButton0.querySelector('.play-icon');
const pauseIcon0 = playPauseButton0.querySelector('.pause-icon');
const playPauseButton1 = document.querySelectorAll('.play-pause-button')[1];
const playIcon1 = playPauseButton1.querySelector('.play-icon');
const pauseIcon1 = playPauseButton1.querySelector('.pause-icon');

export function setupPause(video0, video1) {
    playPauseButton0.addEventListener('click', () => togglePlayPause(video0, playIcon0, pauseIcon0));
    playPauseButton1.addEventListener('click', () => togglePlayPause(video1, playIcon1, pauseIcon1));
}

function togglePlayPause(video, playIcon, pauseIcon) {
    if (video && video.readyState >= 2) {
        if (video.paused) {
            video.play();
            detectVideo(video)
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