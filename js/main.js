const startCallButton = document.getElementById('start-call');

startCallButton.addEventListener('click', openCallPage);

const openCallPage = () => {
  window.open(`${document.location.origin}/stream`);
};