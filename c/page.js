(function () {
  var q = new URLSearchParams(location.search), root = document.documentElement;
  // /c/ko/ 는 한국어. /c/ 는 예전 링크(l=ko)와 한국어 폰도 한국어로
  var K = root.lang === 'ko' || q.get('l') === 'ko' || (!q.get('l') && /^ko/i.test(navigator.language || ''));
  var AB = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  // 점수 등급: 앱(CH_TIER)과 같은 기준이어야 함
  var TIER = [['white', 0, '흰띠급', 'WHITE BELT'], ['yellow', 10, '노란띠급', 'YELLOW BELT'], ['green', 16, '초록띠급', 'GREEN BELT'], ['blue', 22, '파란띠급', 'BLUE BELT'], ['red', 30, '빨간띠급', 'RED BELT'], ['black', 38, '검은띠급', 'BLACK BELT']];
  function dec(code) {   // 앱(chDec)과 같은 방식
    var s = String(code || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/I/g, '1');
    if (s.length !== 7) return null;
    var c = 0, v = 0, i;
    for (i = 0; i < 6; i++) { if (AB.indexOf(s[i]) < 0) return null; c = (c * 7 + AB.indexOf(s[i]) + i) % 32; }
    if (AB[c] !== s[6]) return null;
    for (i = 0; i < 6; i++) v = v * 32 + AB.indexOf(s[i]);
    return { n: v % 1024, code: s.slice(0, 3) + '-' + s.slice(3) };
  }
  function $(id) { return document.getElementById(id); }
  function t(en, ko) { return K ? ko : en; }

  root.lang = K ? 'ko' : 'en';
  document.title = t('Taekwondo Challenge', '태권도 격파 도전장');
  $('game').textContent = t('TAEKWONDO KICK & BREAK GAME', '태권도 발차기 격파 게임');
  $('unit').textContent = t('in 30s', '장 / 30초');
  $('ask').textContent = t('What belt level are you? Find out in 30 seconds.', '넌 무슨 띠급일까? 30초면 알 수 있어!');
  $('open').textContent = t('PLAY IN THE APP', '앱에서 도전하기');
  $('ios').textContent = t('GET THE APP', '앱 받기');
  $('codeLabel').textContent = t('CODE', '코드');
  $('copy').textContent = t('Copy', '복사');
  $('hint').textContent = t('New? Install, then Friend Challenge → Enter code', '처음이면 설치 후 친구 도전장 → 받은 코드 입력');

  var name = (q.get('n') || '').trim().slice(0, 12), d = dec(q.get('k')), at = -1;
  if (d) TIER.forEach(function (x, i) { if (d.n >= x[1]) at = i; });
  TIER.forEach(function (x, i) {
    var el = document.createElement('div'), im = document.createElement('img');
    im.src = '/c/img/belt_' + x[0] + '.webp';
    im.alt = t(x[3], x[2]);
    el.appendChild(im);
    el.appendChild(document.createTextNode(x[1] + '+'));
    if (i === at) el.className = 'on';
    $('belts').appendChild(el);
  });

  if (!d) {
    // 코드 없이 들어와도(주소만 전달·잘림) 게임 소개와 앱 받기는 보이게
    var sent = !!q.get('k');
    $('head').textContent = sent ? t('Invalid challenge', '도전장이 올바르지 않아요') : t('HOW MANY CAN YOU BREAK?', '넌 몇 장 깰 수 있어?');
    if (sent) $('head').className = 'err';
    ['card', 'codeRow', 'open', 'hint'].forEach(function (id) { $(id).hidden = true; });
    return;
  }

  $('head').textContent = name ? t(name + ' challenged you!', name + '의 도전장!') : t('CHALLENGE!', '도전장 도착!');
  $('num').textContent = d.n;
  $('tierImg').src = '/c/img/belt_' + TIER[at][0] + '.webp';
  $('tierName').textContent = t(TIER[at][3] + ' LEVEL', TIER[at][2] + '!');
  $('code').textContent = d.code;
  $('open').href = 'taekwondomaster://c?k=' + encodeURIComponent(d.code) + (name ? '&n=' + encodeURIComponent(name) : '');
  $('copy').onclick = function () {
    var b = this;
    (navigator.clipboard ? navigator.clipboard.writeText(d.code) : Promise.reject())
      .then(function () { b.textContent = t('Copied ✓', '복사됨 ✓'); })
      .catch(function () {});
  };
})();
