(function () {
  var root = document.documentElement;
  var isKo = (root.getAttribute('lang') || 'ko').indexOf('ko') === 0;

  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  // 라이트/다크 전환
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('theme', next);
    });
  });

  // 언어 전환 시 선택 기억
  document.querySelectorAll('[data-lang-switch]').forEach(function (a) {
    a.addEventListener('click', function () { store('lang', a.getAttribute('data-lang-switch')); });
  });

  // 필터 + 검색 (프로젝트 목록, 글 목록)
  document.querySelectorAll('[data-filterable]').forEach(function (scope) {
    var buttons = scope.querySelectorAll('[data-filter]');
    var items = scope.querySelectorAll('[data-item]');
    var search = scope.querySelector('[data-search]');
    var empty = scope.querySelector('[data-empty]');
    var current = 'all';

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      items.forEach(function (el) {
        var okType = current === 'all' || el.getAttribute('data-type') === current;
        var okText = !q || (el.getAttribute('data-text') || '').toLowerCase().indexOf(q) !== -1;
        var show = okType && okText;
        el.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        current = b.getAttribute('data-filter');
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);

    // 주소의 ?cat= 값으로 처음 필터 선택
    var param = new URLSearchParams(location.search).get('cat');
    if (param) {
      buttons.forEach(function (b) { if (b.getAttribute('data-filter') === param) b.click(); });
    }
  });

  // 코드 블록 복사 버튼
  document.querySelectorAll('.prose pre').forEach(function (pre) {
    var wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = isKo ? '복사' : 'Copy';
    btn.addEventListener('click', function () {
      var text = pre.innerText;
      var done = function () {
        btn.textContent = isKo ? '복사됨' : 'Copied';
        setTimeout(function () { btn.textContent = isKo ? '복사' : 'Copy'; }, 1500);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
    wrap.appendChild(btn);
  });
})();
