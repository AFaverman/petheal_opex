class VideoPopup extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.openModal.bind(this));
  }

  openModal() {
    const modal = document.querySelector(`#VideoModal-${this.dataset.blockId}`);
    if (modal) {
      modal.show();
      const video = modal.querySelector('deferred-media');
      if (video) {
        video.loadContent();
      }
    }
  }
}

customElements.define('video-popup', VideoPopup);

// Custom video control functions
function toggleVideoPlayback(button) {
  const modal = button.closest('modal-dialog');
  const video = modal.querySelector('video');
  
  if (!video) return;
  
  const playIcon = button.querySelector('.play-icon');
  const pauseIcon = button.querySelector('.pause-icon');
  
  if (video.paused) {
    video.play();
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    video.pause();
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

function toggleVideoMute(button) {
  const modal = button.closest('modal-dialog');
  const video = modal.querySelector('video');
  
  if (!video) return;
  
  const volumeOnText = button.querySelector('.volume-on-text');
  const volumeOffText = button.querySelector('.volume-off-text');
  
  if (video.muted) {
    video.muted = false;
    volumeOnText.style.display = 'inline';
    volumeOffText.style.display = 'none';
  } else {
    video.muted = true;
    volumeOnText.style.display = 'none';
    volumeOffText.style.display = 'inline';
  }
}


