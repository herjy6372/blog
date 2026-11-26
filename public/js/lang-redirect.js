// 루트(/blog/)로 들어오면 저장된 언어 → 브라우저 언어 순으로 골라 이동합니다.
(function () {
  var base = document.documentElement.getAttribute('data-base') || '/';
  var lang = null;
  try { lang = localStorage.getItem('lang'); } catch (e) {}
  if (lang !== 'ko' && lang !== 'en') {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'ko';
    lang = /^ko\b/i.test(nav) ? 'ko' : 'en';
  }
  location.replace(base + lang + '/');
})();
