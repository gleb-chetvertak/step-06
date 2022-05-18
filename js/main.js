const openCallPage = () => {
  window.open(`${document.location.origin}/stream`, '_blank', 'location=yes,scrollbars=yes,status=yes');
};

const startCallButton = document.getElementById('start-call');

startCallButton.addEventListener('click', openCallPage);