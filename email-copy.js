document.querySelectorAll('[data-copy-email]').forEach((button) => {
  let resetTimer;
  button.addEventListener('click', async () => {
    const status = button.parentElement.querySelector('[role="status"]');
    clearTimeout(resetTimer);
    status.textContent = '';
    try {
      await navigator.clipboard.writeText(button.dataset.copyEmail);
      button.textContent = 'copied!';
      status.textContent = 'Email address copied.';
      resetTimer = setTimeout(() => {
        button.textContent = 'email';
        status.textContent = '';
      }, 2500);
    } catch {
      button.textContent = 'email';
      status.textContent = `Couldn’t copy. ${button.dataset.copyEmail}`;
    }
  });
});
