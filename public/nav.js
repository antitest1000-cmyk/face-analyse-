// nav.js — shared navigation: burger toggle + dropdown + close-on-outside-click
(function () {
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('dropdownMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const opening = !btn.classList.contains('is-open');
    btn.classList.toggle('is-open', opening);
    menu.classList.toggle('hidden', !opening);
  });

  // Close when clicking anywhere outside the burger or dropdown
  document.addEventListener('click', function (e) {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.classList.remove('is-open');
      menu.classList.add('hidden');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      btn.classList.remove('is-open');
      menu.classList.add('hidden');
    }
  });
})();
