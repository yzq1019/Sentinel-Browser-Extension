document.querySelectorAll('.score-bar-container').forEach(bar => {
  const max = parseInt(bar.dataset.max, 10);
  const name = bar.dataset.name;
  let value = 0;
  const barBg = bar.querySelector('.score-bar-bg');
  const barFg = bar.querySelector('.score-bar-fg');
  const ticksContainer = bar.querySelector('.score-ticks');
  const hidden = bar.querySelector('input[type=hidden]');
  
  ticksContainer.innerHTML = '';
  for (let i = 0; i < max; i++) {
    const tick = document.createElement('div');
    tick.className = 'score-tick';
    tick.style.left = (i / (max - 1) * 100) + '%';
    tick.title = (i + 1);
    ticksContainer.appendChild(tick);
    tick.addEventListener('click', e => {
      value = i + 1;
      updateBar();
      e.stopPropagation();
    });

    const label = document.createElement('div');
    label.className = 'score-label';
    label.textContent = i + 1;
    label.style.left = (i / (max - 1) * 100) + '%';
    ticksContainer.appendChild(label);
  }
  // 点击横线也能选分
  barBg.addEventListener('click', e => {
    const rect = barBg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    value = Math.round(percent * (max - 1)) + 1;
    updateBar();
  });
  function updateBar() {
    if (value === 0) {
      barFg.style.width = '0%';
      hidden.value = 0;
      const ticks = bar.querySelectorAll('.score-tick');
      const labels = bar.querySelectorAll('.score-label');
      ticks.forEach(tick => tick.classList.remove('selected'));
      labels.forEach(label => label.classList.remove('selected'));
    } else {
      barFg.style.width = ((value - 1) / (max - 1) * 100) + '%';
      hidden.value = value;
      const ticks = bar.querySelectorAll('.score-tick');
      const labels = bar.querySelectorAll('.score-label');
      ticks.forEach((tick, idx) => {
        tick.classList.toggle('selected', idx < value);
      });
      labels.forEach((label, idx) => {
        label.classList.toggle('selected', idx + 1 === value);
      });
    }
  }
  updateBar();
});

document.querySelector('.restore-defaults').addEventListener('click', () => {
  console.log('Restore Defaults button clicked'); // Log when button is clicked
  // Reset all score bars to 0
  document.querySelectorAll('.score-bar-container').forEach(bar => {
    console.log('Resetting bar:', bar.dataset.name);
    const hiddenInput = bar.querySelector('input[type=hidden]');
    hiddenInput.value = 0; // Set hidden input value to 0

    // Call updateBar to update the UI based on the new value (0)
    // Find the updateBar function scope - it's within the forEach loop for score bars
    // To call it from here, we need access to the function defined inside the other forEach loop.
    // A cleaner approach is to trigger the update logic directly by calling the part of updateBar we need.
    // Let's refine the update logic simulation for value 0, targeting labels/ticks correctly.

    const max = parseInt(bar.dataset.max, 10);
    const barFg = bar.querySelector('.score-bar-fg');
    const ticks = bar.querySelectorAll('.score-tick');
    const labels = bar.querySelectorAll('.score-label');

    // Simulate updateBar logic for value 0
    barFg.style.width = '0%'; // For value 0, width is 0%

    ticks.forEach(tick => tick.classList.remove('selected'));
    labels.forEach(label => label.classList.remove('selected'));

    console.log('Bar reset complete for:', bar.dataset.name, ', value set to 0');
  });

  // Clear text, email, and comment fields
  console.log('Clearing text fields');
  document.getElementById('username').value = '';
  document.getElementById('email').value = '';
  document.getElementById('comment').value = '';
  console.log('Text fields cleared');
}); 