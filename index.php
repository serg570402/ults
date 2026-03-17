<?php
    require_once './php/visitorConnect.php';
    header('Content-Type: text/html; charset=utf-8');

    $sql      = "SELECT lang FROM kbrd";
    $result   = $conn->query($sql) or die($conn->error);
    $kbrdLang = '';
    while ($row = $result->fetch_assoc()) {
    $lang     = htmlspecialchars(trim($row['lang']), ENT_QUOTES, 'UTF-8');
    $kbrdLang = $kbrdLang . $lang . ',';
    }
    $kbrdLang;

    $sql      = "show tables from $dbName like 'wrds%'";
    $result   = $conn->query($sql);
    $wrdsLang = '';
    while ($row = mysqli_fetch_array($result)) {
    $wrdsLang = $wrdsLang . $row[0] . ",";
    }
    $wrdsLang;

    $sql      = "show tables from $dbName like 'phrs%'";
    $result   = $conn->query($sql);
    $phrsLang = '';
    while ($row = mysqli_fetch_array($result)) {
    $phrsLang = $phrsLang . $row[0] . ",";
    }
    $phrsLang;

    $sql      = "show tables from $dbName like 'sngs%'";
    $result   = $conn->query($sql);
    $sngsLang = '';
    // return $query->fetchAll(PDO::FETCH_COLUMN);
    while ($row = mysqli_fetch_array($result)) {
    $sngsLang = $sngsLang . $row[0] . ",";
    }
    $sngsLang;

    $sql        = "show tables from $dbName like 'hankan%'";
    $result     = $conn->query($sql);
    $hankanLang = '';
    // return $query->fetchAll(PDO::FETCH_COLUMN);
    while ($row = mysqli_fetch_array($result)) {
    $hankanLang = $hankanLang . $row[0] . ",";
    }
    $hankanLang;
    $conn->close();
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="shortcut icon" href="favicon.ico" />
    <link rel="stylesheet" href="./css/index.css" />
    <script src="./js/jquery-3.6.0.min.js"></script>
    <script type="text/javascript" src="js/index.js" defer></script>
    <title>United Languages</title>
  </head>

  <body>
    <div class="page-body">
      <div id="nav_container" class="nav-container">
        <nav class="nav-list">
          <img
            class="section-link active"
            src="./favicon.ico"
            width="30px"
            height="30px"
            title="HOME"
            id="home"
          />
          <div class="nav-item section-link" data-id="kbrd">
            <p data-id="kbrd" style="display: none">
              <?php echo $kbrdLang; ?>
            </p>
            <a>Alphabets</a>
            <fieldset class="lang-select" style="display: none">
              <select class="lang-list target-lang"></select>
            </fieldset>
          </div>
          <div class="nav-item section-link" data-id="wrds">
            <p data-id="wrds" style="display: none">
              <?php echo $wrdsLang; ?>
            </p>
            <a>Words</a>
            <fieldset class="lang-select" style="display: none">
              <select class="lang-list target-lang">
              </select>
              <select class="lang-list assist-lang"></select>
              <button class="swap" disabled>⇕</button>
              <button class="confirm-selection" disabled>CONFIRM</button>
            </fieldset>
          </div>
          <div class="nav-item section-link" data-id="phrs">
            <p data-id="phrs" style="display: none">
              <?php echo $phrsLang ?>
            </p>
            <a>Phrases</a>
            <fieldset class="lang-select" style="display: none">
              <select class="lang-list target-lang"></select>
              <select class="lang-list assist-lang"></select>
              <button class="swap" disabled>⇕</button>
              <button class="confirm-selection" disabled>CONFIRM</button>
            </fieldset>
          </div>
          <div class="nav-item section-link" data-id="sngs">
            <p data-id="sngs" style="display: none">
              <?php echo $sngsLang ?>
            </p>
            <a data-id="sngs" class="section-link">Songs</a>
            <fieldset class="lang-select" style="display: none">
              <select class="target-lang lang-list"></select>
              <select class="lang-list assist-lang"></select>
            </fieldset>
          </div>
          <div class="nav-item section-link" data-id="hankan">
            <p data-id="hankan" style="display: none">
              <?php echo $hankanLang; ?>
            </p>
            <a data-id="hankan" class="section-link">HanKan</a>
            <fieldset class="lang-select" style="display: none">
              <select class="target-lang lang-list">
                <option value="hanzi_kanji">Hanzi/Kanji</option>
                <option value="kanji_hanzi">Kanji/Hanzi</option>
              </select>
              <select class="lang-list assist-lang"></select>
              <button class="swap" disabled>⇕</button>
              <button class="confirm-selection" disabled>CONFIRM</button>
            </fieldset>
          </div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            id="mychannel"
            class="link-page222"
            title="Get the tips of how to work here"
            href="https://www.youtube.com/playlist?list=PLvy91CQZSfKA4VvV28kDeH8dPzXGp8-xt"
            target="_blank"
            >My channel <img src="./images/newTab.png"/>
          </a>
        </nav>
        <div id="welcome">
          <h2 id="greet">Welcome the United Languages</h2>
          <p class='welcome'>Put on your headphones</p>
          <p class='welcome'>Ajust your keyboard and then</p> <p>CLICK</p>
          <img src="./images/clickMe.png" alt="" id="resetAPI">
        </div>
      </div>
      <main></main>
      <section id="loadingOverlay" style="display: none"></section>
      <div class="spinner" style="display:none"></div>
      <span id="widthMesure" style="display: none; font-size: 1.2rem"></span>
    </div>
    <span class="sngl-char" style="display:none;"></span>
    <footer>
      <a style="display: none;" href="https://buymeacoffee.com/lisergeygendek" target="_blank" rel="noopener noreferrer">
        Buy meacoffee
      </a>
    </footer>
  </body>
  <script>
    $('html, body').scrollTop(0)
    const openedTabs = new Set()
    const menuItem = $('.link-page222')
    menuItem.on('click', function (evnt) {
      const url = $(this).href
      if (openedTabs.has(url)) {
        evnt.preventDefault()
        alert('This page is already open in another tab')
      } else {
        openedTabs.add(url)
      }
    })
  </script>
</html>
