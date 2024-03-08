import {detectVideo} from '../index.js'

const playPauseButton = document.getElementById('playPauseButton');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');

export function setupPause(video){
    playPauseButton.addEventListener('click', togglePlayPause);
    document.getElementById('video-container').appendChild(playPauseButton);

    function togglePlayPause() {
        if (video && video.readyState >= 2) {
            if (video.paused) {
                video.play();
                detectVideo();
            } else {
                video.pause();
            }
            updatePlayPauseButtonState(video);
        }
    }

    function updatePlayPauseButtonState(video) {
        if (video.paused) {
            playIcon.style.display = 'flex';
            pauseIcon.style.display = 'none';
        } else {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'flex';
        }
    }
}