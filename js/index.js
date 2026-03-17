let section = ''
let lang1 = ''
let lang2 = ''
const ults = {}
myAudio = new Audio()
let myBuffer1, sprite
let myBuffer2
let lesson = {}
let obj = {}
const audioCtx = new AudioContext()
const bufferCache = new Map()
const lessonCache = {}
const htmlCache = {}
const blankHtmlCache = {}
const dataCache = {}

class SpriteWord {
  constructor({ buffer1, buffer2, sprite }, ctx) {
    this.ctx = ctx
    this.buffer1 = buffer1
    this.buffer2 = buffer2
    this.sprite = sprite
    this.currentSources = null
    this.currentName = null
  }

  playNonStop() {
    if (lesson.nonStop) {
      const id = lesson.nonStopKey
      const key = 'k_' + lesson.keysToPlay[id]
      if (section === 'phrs' || section === 'sngs') {
        $('p.spn').hide()
        $('p.hira').hide()
        $('p.translation').hide()
        $(`p.spn[data-id=${lesson.keysToPlay[id]}]`).show()
        $(`p.hira[data-id=${lesson.keysToPlay[id]}]`).show()
        $(`p.translation[data-id=${lesson.keysToPlay[id]}]`).show()
      }
      this.playWord(key)
      lesson.nonStopKey++
      if (lesson.nonStopKey >= lesson.keysToPlay.length) {
        lesson.nonStopKey = 0
      }
    }
    return true
  }
  playWord(wordKey) {
    if (wordKey && wordKey !== this.currentName) {
      this.offset1 = 0
      this.offset2 = 0
      this.currentName = wordKey
      this.playId = 0
      let s1, d1, s2, d2
      if (section === 'sngs' || section === 'kbrd') {
        ;[s1, d1] = this.sprite[wordKey]
        this.s1 = parseFloat(s1)
        this.d1 = parseFloat(d1)
        this.currntS1 = this.s1
        this.currntD1 = this.d1
      } else {
        ;[s1, d1, s2, d2] = this.sprite[wordKey]
        this.s1 = parseFloat(s1)
        this.d1 = parseFloat(d1)
        this.s2 = parseFloat(s2)
        this.d2 = parseFloat(d2)
        this.currntS1 = this.s1
        this.currntD1 = this.d1
        this.currntS2 = this.s2
        this.currntD2 = this.d2
      }
    }

    this.isPaused = false

    const gain1 = this.ctx.createGain()
    const gain2 = this.ctx.createGain()

    gain1.gain.value = lesson.mute1 ? 0 : 1
    gain2.gain.value = lesson.mute2 ? 0 : 1

    gain1.connect(this.ctx.destination)
    gain2.connect(this.ctx.destination)

    this.gain1 = gain1
    this.gain2 = gain2

    const myPlayId = this.playId

    if (!lesson.mute1) {
      const src1 = this.ctx.createBufferSource()
      this.stTm1 = this.ctx.currentTime
      src1.buffer = this.buffer1
      src1.connect(this.gain1)
      this.src1 = src1
      this.src1.start(this.stTm1, this.currntS1, this.currntD1)
      this.src1.onended = () => {
        if (this.isStopped) {
          this.isStopped = false
          return
        }
        this.offset1 = 0
        this.currntS1 = this.s1
        this.currntD1 = this.d1
        this.isPaused = true
        if ($('[name=loop]').prop('checked')) {
        }
        if (lesson.mute2) {
          if (myPlayId !== this.playId) return
          this.playNonStop()
        }
      }
    }
    if (!lesson.mute2) {
      const src2 = this.ctx.createBufferSource()
      this.stTm2 = this.stTm1 + this.currntD1
      if (lesson.mute1) {
        this.stTm2 = this.ctx.currentTime
      }
      src2.buffer = this.buffer2
      src2.connect(this.gain2)
      this.src2 = src2
      this.src2.start(this.stTm2, this.currntS2, this.currntD2)
      this.src2.onended = () => {
        if (this.isStopped) {
          this.isStopped = false
          return
        } else {
          this.offset2 = 0
          this.offset1 = 0
          this.currntS1 = this.s1
          this.currntD1 = this.d1
          this.currntS2 = this.s2
          this.currntD2 = this.d2
          this.isPaused = true
          if ($('[name=loop]').prop('checked')) {
          }
        }
        this.isPaused2nd = false
        this.isPaused = true
        this.isStopped = false
        if (myPlayId !== this.playId) return
        this.playNonStop()
      }
    }
  }

  stop() {
    this.currentSources = [this.src1, this.src2].filter(Boolean)
    if (this.currentSources.length > 0) {
      this.currentSources?.forEach((s) => s.stop())
      this.currentSources?.forEach((s) => s.disconnect())
      this.currentSources = null
      this.isStopped = true
    }
  }

  pause() {
    this.stop()
    const now = this.ctx.currentTime
    this.offset1 = Math.max(0, now - this.stTm1 - 1.2)
    this.currntS1 = this.currntS1 + this.offset1
    this.currntD1 = Math.max(0, this.currntD1 - this.offset1)
    this.offset2 = Math.max(0, now - this.stTm2 - 1.2)
    this.currntS2 = this.currntS2 + this.offset2
    this.currntD2 = Math.max(0, this.currntD2 - this.offset2)
    this.isPaused2nd = this.offset2 >= 0
    this.isPaused = true
  }

  reset() {
    this.offset2 = 0
    this.offset1 = 0
    this.currntS1 = this.s1
    this.currntD1 = this.d1
    this.currntS2 = this.s2
    this.currntD2 = this.d2
  }
}

function normalizeSpaces(str) {
  return str
    .replace(/[\u00A0\u202F\u2009\u2007\u3000]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function lessonName(num) {
  return `${lang1}${lang2}Lesson${num}`
}
function audioName(lang) {
  return `${lang}Audio${lesson.num}`
}
function blankHtml() {
  return `${section}BlankHtml`
}
function dataName(lang) {
  return `${lang}Data${lesson.num}`
}
function htmlName(lang) {
  return `${lang}Html${lesson.num}`
}

$('#resetAPI').on('click', function () {
  $('#welcome').hide('slow')
})

$('.section-link').on('click', 'a', function (event) {
  $('#welcome').hide('slow')
  const id = $(this).parent('div').data('id')
  if (id != section) {
    if (section != '') {
      htmlCache[section] = ''
      htmlCache[section] = $('main').html()
      lessonCache[section] = lesson
      lesson = {}
    }
    section = id
    // if (htmlCache[section]) {
    if (lessonCache[section] && Object.keys(lessonCache[section]).length > 0) {
      lesson = {}
      lesson = lessonCache[section]
      $('main').html(htmlCache[section])
      setSprite()
      lesson.nonStop = false
      restoreInps()
    } else {
      renderRawHTML().then((html) => {
        if (
          $(`div[data-id="${section}"] select`).eq(1).children('option')
            .length === 0
        ) {
          renderLangList(html)
        }
      })
    }
    $('.section-link').removeClass('active')
    $(this).parent('div').addClass('active')
    $('div.nav-item:not(.active)').children('fieldset').hide()
  } else {
  }
  $(`[data-id="${section}"]`).children('fieldset').toggle('slow')
})

$('main').on('click', '#whatHow', function (event) {
  if ($('.whatHow').css('display') === 'none') {
    $('.whatHow').show('fadeIn')
    $(this).text('What?&How?(hide)')
  } else {
    $('.whatHow').hide('fadeOut')
    $(this).text('What?&How?(show)')
  }
})

function renderRawHTML() {
  return new Promise(function (resolve, reject) {
    $.get(`../htmlPages/${section}.html`).done((html) => {
      blankHtmlCache[section] = html
      htmlCache[section] = $('main').html()
      lesson = {}
      lessonCache[section] = lesson
      $('main').html(html)
      resolve(html)
    })
  })
}

function renderLangList(html) {
  const elmnt = $(`div[data-id="${section}"]`)
    .children('fieldset')
    .children('.lang-list')
  const data = $(`p[data-id="${section}"]`).text()
  const cleanData = data.replace(/\s+/g, ' ').trim()
  let arr = cleanData.split(',')
  arr = arr.filter((item) => item !== '')
  arr = arr.filter((item) => item !== 'hankan_hanzi')
  arr = arr.filter((item) => item !== 'hankan_kanji')
  arr.sort()
  let options = arr.reduce((accum, item) => {
    item = item.split('_')
    if (item.length === 2) {
      return accum + `<option value="${item[1]}">${item[1]}</option>`
    } else {
      return accum + `<option value="${item[0]}">${item[0]}</option>`
    }
  }, '')
  if (section === 'hankan') {
    const elem =
      '<option value="target" selected disabled>Select Target</option>'
    $(elmnt).eq(0).append($(elem))
  } else {
    $(elmnt).html(
      options + '<option value="" selected disabled>Select Target</option>',
    )
  }
  $(elmnt)
    .eq(1)
    .html(
      options + '<option value="" selected disabled>Select Assistant</option>',
    )
  // $(`[data-id]`).children('fieldset').hide()
  // $(`[data-id="${section}"]`).children('fieldset').show('slow')
}

$('select.lang-list').on('change', function (event) {
  if (section === 'hankan') {
    if ($(this).hasClass('target-lang')) {
      ;[lang1, lang2] = $(this).val().split('_')
      lesson.assistLang = $(this).siblings('.assist-lang').val()
    }
    if ($(this).hasClass('assist-lang')) {
      lesson.assistLang = $(this).val()
      ;[lang1, lang2] = $(this).siblings('.target-lang').val().split('_')
    }
  } else {
    if ($(this).hasClass('target-lang')) {
      lang1 = $(this).val()
      lang2 = $(this).siblings('.assist-lang').val() || ''
    }
    if ($(this).hasClass('assist-lang')) {
      lang2 = $(this).val()
      lang1 = $(this).siblings('.target-lang').val()
    }
  }
  if (section === 'kbrd' || section === 'sngs') {
    if (htmlCache[`${section}${lang1}`]) {
      $('main').html(htmlCache[`${section}${lang1}`])
      lesson = lessonCache[`${section}${lang1}`]
    } else if (section === 'kbrd') {
      lessonCache[`${section}${lang1}`] = lesson
      $('main').html(blankHtmlCache[section])
      getData('')
    } else if (section === 'sngs') {
      const langs = []
      langs.push(lang1)
      let lessonList = ''
      $('#loadingOverlay').show()
      $('.spinner').show()

      Promise.all([...langs.map(getLessonList)])
        .then((lessonList) => {
          lessonList = lessonList[0]
          lessonTitls = setLessonList(lessonList)
          renderLessonList(lessonTitls)
          $('#loadingOverlay').hide()
          $('.spinner').hide()
        })
        .then(() => {
          lesson.lang2 = lang2
        })
    }
  } else if (lang2) {
    if (
      lang1 !== 'Select Target' &&
      lang2 !== 'Select Assistant' &&
      lang1 !== lang2
    ) {
      if (htmlCache[`${section}${lang1}${lang2}`]) {
        $('main').html(htmlCache[`${section}${lang1}${lang2}`])
        lesson = lessonCache[`${section}${lang1}${lang2}`]
      } else {
        lessonCache[`${section}${lang1}${lang2}`] = lesson
        $('main').html(blankHtmlCache[section])
        langSelctElm(section)
          .siblings('.confirm-selection')
          .prop('disabled', false)
          .addClass('active')
        langSelctElm(section).siblings('.swap').prop('disabled', false)
      }
    } else {
      langSelctElm(section)
        .siblings('.confirm-selection')
        .prop('disabled', true)
        .removeClass('active')
      langSelctElm(section).siblings('.swap').prop('disabled', true)
    }
  }
})

function langSelctElm() {
  return $(`[data-id=${section}]`).children('fieldset').children('.lang-list')
}

async function loadAudio(url) {
  if (!bufferCache.has(url)) {
    const res = await fetch(url)
    const arrayBuffer = await res.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    bufferCache.set(url, audioBuffer)
    return audioBuffer
    // return null
  } else {
    return null
  }
}

function loadText(arrObj) {
  const [url, param, lang] = [...arrObj]
  return new Promise(function (resolve, reject) {
    $.get(url, param).done((data) => {
      dataCache[section] = data
      resolve(data)
    })
  })
}

function setLessonList(lessonList) {
  function lessonsArr(lessons) {
    let tmpArr = lessons.split('//').filter((item) => item !== '')
    let arr = []
    let lessonTitles = []
    tmpArr.map((arr, indx) => {
      arr = arr.split(';;')
      lessonTitles.push(arr)
    })
    return lessonTitles
  }
  let lessonTitls = []
  let lessons = []
  lessons = lessonList.split('_')
  let lessonTitls1 = lessonsArr(lessons[0])
  let lessonTitls2 = []
  if (lessons[1] != undefined) {
    lessonTitls2 = lessonsArr(lessons[1])
  }
  if (lessons.length === 2) {
    lessonTitls2 = lessonsArr(lessons[1])
    for (let i = 0; i < lessonTitls1.length; i++) {
      tmparr1 = lessonTitls1[i]
      for (let j = 0; j < lessonTitls2.length; j++) {
        tmparr2 = lessonTitls2[j]
        if (tmparr1[0] === tmparr2[0]) {
          lessonTitls.push([tmparr1[0], tmparr1[1], tmparr2[1]])
          break
        }
      }
    }
  } else {
    lessonTitls = lessonTitls1
  }
  return (lessonTitls = lessonTitls)
}

async function getLessonList(lang) {
  const url = `php/${section}_lessons_list.php`
  const tblName = `${section}_${lang}`
  $('#loadingOverlay').show()
  $('.spinner').show()
  return new Promise(function (resolve, reject) {
    $('.spinner').hide()
    $('#loadingOverlay').hide()
    if (ults[`${section}][${lang}lessons`]) {
      resolve(ults[`${section}][${lang}lessons`])
    } else {
      $.get(url, { tblName: tblName }).done((data) => {
        ults[`${section}][${lang}lessons`] = data
        resolve(data)
      })
    }
  })
}

function renderLessonList(lessonTitls) {
  let htmlLessonsTitles = ''
  lessonTitls.map((arr, indx) => {
    if (indx % 10 === 0) {
      htmlLessonsTitles += groupHead(indx + 1)
    }
    const [num, title1, title2] = [...arr]
    htmlLessonsTitles += `<li class="lesson" data-num="${num}"><span class="nmbr">${num})</span><span class="title">${title1}</span>`
    if (title2 != undefined) {
      htmlLessonsTitles += `<span class="title">${title2}</span></li>`
    } else {
      htmlLessonsTitles += `</li>`
    }
    $(`#${section} ul.lessons`).html(htmlLessonsTitles).hide()
    $(`#${section} li.lesson`).hide()
    $(`#${section} ul.lessons`).show('slow')
    if (ults[`${section}Num]`]) {
      const num = ults[`${section}Num]`]
      $(`#${section} .lesson[data-num="${num}"]`)
        .show('slow')
        .addClass('active')
        .prevUntil('h4')
        .addBack()
        .show()
        .nextUntil('h4')
        .show()
    }
  })
}

const groupHead = (spanNum) => {
  return `<h4 class="group-head">Lessons ${spanNum}...</h4>`
}

$('body').on('click', 'h4.group-head', function () {
  if ($(this).next('li').is(':hidden')) {
    $(this).siblings('li').hide('slow')
    $(this).nextUntil('h4').show('slow')
  } else {
    $(this).siblings('li').hide('slow')
  }
})

$('.confirm-selection').on('click', function (event) {
  $(langSelctElm(section).siblings('.confirm-selection'))
    .prop('disabled', true)
    .removeClass('active')
  $(this).parent('fieldset').hide()
  const langs = []
  langs.push(lang1, lang2)
  $('#loadingOverlay').show()
  $('.spinner').show()
  $('#loadingOverlay').show()
  $('.spinner').show()

  Promise.all([...langs.map(getLessonList)]).then((data) => {
    const lessonList = data[0] + '_' + data[1]
    $('.spinner').hide()
    $('#loadingOverlay').hide()
    const lessonTitls = setLessonList(lessonList)
    renderLessonList(lessonTitls)
    $('#loadingOverlay').hide()
    $('.spinner').hide()
  })
})

$('body').on('click', 'li.lesson', function () {
  const num = $(this).data('num')
  lesson.num = num
  const lActiveNum = $('li.active').data('num')
  const bothNames = `${section}${lang1}${lang2}${lActiveNum}`
  if (num != lActiveNum) {
    if (lActiveNum) {
      htmlCache[bothNames] = $('main').html()
      lessonCache[bothNames] = structuredClone(lesson)
    }
    $('li.lesson').removeClass('active')
    $(this).addClass('active')
    const htmlLssnNam = `${section}${lang1}${lang2}${num}`
    if (htmlCache[htmlLssnNam]) {
      lesson = lessonCache[htmlLssnNam]
      lessonCache[section] = lesson
      lessonCache[`${section}${lang1}`] = lesson
      lessonCache[htmlLssnNam] = lesson
      $('main').html(htmlCache[htmlLssnNam])
      myBuffer1 = bufferCache.get(lesson.srcs[0])
      myBuffer2 = lesson.srcs[1] ? bufferCache.get(lesson.srcs[1]) : null
      sprite = new SpriteWord(
        { buffer1: myBuffer1, buffer2: myBuffer2, sprite: lesson.sprite },
        audioCtx,
      )
      restoreInps()
    } else {
      getData(num)
    }
  }
})

function kbrdComplete(data) {
  const tmpData = data.trim().split(/\s+/)
  const intrvl = parseFloat(tmpData.shift())
  tmpData.forEach((item, i) => {
    const keyChar = item.split(':')
    const key = `k_${keyChar[0]}`
    lesson.sprite[key] = [i * intrvl, intrvl]
    const tmpObj = keyChar[2]
      ? { key: key, strng: keyChar[1], kana: keyChar[2] }
      : { key: key, strng: keyChar[1] }
    lesson.keysArr.push(tmpObj)
    lesson.inptIds.push(i)
    $(`#${key}`).text(keyChar[1]).addClass('alphbt on')
    $(`#${key}`).attr('data-id', i)
  })
  lesson.hilightClass = 'active'
  lessonCache[section] = lesson
  lessonCache[`${section}${lang1}`] = lesson
  $('#kbrd-controls').show()
  $('#hiraKata').show()
  setSprite()
  lang1 === 'Japanese' ? $('#hirsKata').show() : $('#hiraKata').hide()
  const key = lesson.keysArr[0].key
  $('#char').focus()
}

function getData(num) {
  function wholeWord(word) {
    const boundary =
      "[0-9A-Za-z’'가-힣\\u3040-\\u309F\\u30A0-\\u30FF\\u31F0-\\u31FF\\u4E00-\\u9FFF]"
    return new RegExp(`(?<!${boundary})${word}(?!${boundary})`, 'g')
  }
  $('.lang-select').hide()

  const srcs = []
  const params = []
  if (section === 'kbrd') {
    const src1 = `./audio/${section}/${lang1}.mp3`
    const url1 = `./php/${section}_lesson.php`
    const param1 = [url1, { lang: lang1 }]
    srcs.push(src1)
    params.push(param1)
  } else {
    const src1 = `./audio/${section}/${lang1}/a_${num}.mp3`
    const url = `./php/${section}_lesson.php`
    const tbln1 = `${section}_${lang1}`
    const param1 = [url, { tbln: tbln1, id: num }, lang1]
    params.push(param1)
    srcs.push(src1)
  }
  lesson.lang1 = lang1
  lesson.lang2 = ''
  if (lang2) {
    if (section !== 'sngs') {
      src2 = `./audio/${section}/${lang2}/a_${num}.mp3`
      const url = `./php/${section}_lesson.php`
      srcs.push(src2)
      const tbln2 = `${section}_${lang2}`
      const param2 = [url, { tbln: tbln2, id: num }, lang2]
      params.push(param2)
    }
    lesson.lang2 = lang2
  }
  if (lesson.assistLang) {
    const url = `./php/${section}_lesson.php`
    const lang3 = lesson.assistLang
    const tbln3 = `${section}_${lang3}`
    const param3 = [url, { tbln: tbln3, id: num }, lang3]
    params.push(param3)
  }
  lesson.srcs = srcs
  $('#loadingOverlay').show()
  $('.spinner').show()
  Promise.all([...params.map(loadText), ...srcs.map(loadAudio)]).then(
    (dataArr) => {
      $('#loadingOverlay').hide()
      $('.spinner').hide()
      let data1 = ''
      let data2 = ''
      lesson.num = num
      lesson.inptIds = []
      lesson.keysArr = []
      lesson.sprite = {}
      if (section === 'kbrd') {
        ;[txt1, bufferCache1] = [...dataArr]
        data1 = txt1
        kbrdComplete(data1)
        if (lang1 === 'Japanese') {
          $('.flashCard span').eq(0).show()
        } else {
          $('.flashCard span').eq(0).hide()
        }
      } else {
        if (dataArr.length === 2) {
          ;[txt1, bufferCache1] = [...dataArr]
          data1 = txt1
          lesson.mute1 = false
          lesson.mute2 = true
        } else {
          if (lesson.assistLang) {
            ;[txt1, txt2, txt3, bufferCache1] = [...dataArr]
            lesson.assistTxt = txt3
          } else {
            ;[txt1, txt2, bufferCache1] = [...dataArr]
          }
          data1 = txt1
          data2 = txt2
          lesson.mute1 = false
          lesson.mute2 = false
        }
        if (lang1 === 'Japanese' || section === 'hankan') {
          $('.flashCard p').eq(0).show()
        } else {
          $('.flashCard p').eq(0).hide()
        }
        function normalData(data, lang) {
          data = data.split('::')
          if (lang === lang1) {
            lesson.hira = data[1] ? data[1].trim().split(/\r?\n/) : null
          }
          let strngsArr = data[0].trim().split(/\r?\n/)
          if (section === 'wrds') {
            const tmpArr = strngsArr[0].trim().split(/\s+/)
            const intrvl = parseFloat(tmpArr.shift())
            strngsArr = []
            tmpArr.forEach((strng, i) => {
              strngsArr.push(`${i * intrvl} ${i * intrvl + intrvl} ${strng}`)
            })
          }
          return strngsArr
        }
        const strngsArr1 = normalData(data1, lang1)
        const strngsArr2 = data2 ? normalData(data2, lang2) : null
        if (section === 'hankan') {
          function normalizeHankan(arr) {
            const tmpArr = arr[0].trim().split(/\s+/)
            const intrvl = parseFloat(tmpArr.shift())
            arr.length = 0
            tmpArr.forEach((item, i) => {
              const strng = `${i * intrvl} ${i * intrvl + intrvl} ${item}`
              arr.push(strng)
            })
            return arr
          }
          normalizeHankan(strngsArr1)
          normalizeHankan(strngsArr2)
        }
        strngsArr1.forEach((strng, i) => {
          const tmpArr = strng.trim().split(/\s+/)
          ;[strt, end, ...strng] = tmpArr
          strt = parseFloat(strt)
          end = parseFloat(end)
          const dur = end - strt
          const key = `k_${i}`
          lesson.sprite[key] = []
          lesson.sprite[key].push(strt, dur)
          if (strngsArr2) {
            const tmpArr = strngsArr2[i].trim().split(/\s+/)
            ;[strt, end] = tmpArr
            strt = parseFloat(strt)
            end = parseFloat(end)
            const dur = end - strt
            lesson.sprite[key].push(strt, dur)
          }
          const tmpObj = { key: key, strng: strng }
          lesson.inptIds.push(i)
          lesson.keysArr.push(tmpObj)
        })
        setSprite()
        renderHTML(lesson)
      }
    },
  )
}

function setSprite() {
  myBuffer1 = bufferCache.get(lesson.srcs[0])
  const tmpObj = {
    buffer1: myBuffer1,
    buffer2: null,
    sprite: lesson.sprite,
  }
  lesson.mute1 = false
  lesson.mute2 = true
  if (lesson.srcs[1]) {
    myBuffer2 = bufferCache.get(lesson.srcs[1])
    tmpObj.buffer2 = myBuffer2
    lesson.mute2 = false
  }
  sprite = new SpriteWord(tmpObj, audioCtx)
}

function renderHTML(lesson) {
  let rawLines = []
  const tms = []
  lesson.keysArr.forEach((entry, i) => {
    rawLines.push(entry.strng.join(' '))
  })
  if (section === 'wrds' || section === 'hankan') {
    tmpStr = []
    rawLines = []
    lesson.keysArr.forEach((elm) => {
      tmpStr.push(elm.strng)
    })
    rawLines.push(tmpStr.join(' '))
  }
  function wholeWord(word) {
    const boundary =
      "[0-9A-Za-z’'가-힣\\u3040-\\u309F\\u30A0-\\u30FF\\u31F0-\\u31FF\\u4E00-\\u9FFF]"
    return new RegExp(`(?<!${boundary})${word}(?!${boundary})`, 'g')
  }
  const strngsArr = []
  let spans = ''
  let spnsRez = ''
  let inpts = ''
  let inptsRez = ''
  let idSpn = 0
  let idInpt = 0
  rawLines.forEach((rawLine, i) => {
    const words = rawLine.match(/[\p{L}’'-]+/gu) || []
    const arrStr = rawLine.split(' ')
    spans = `<p class="spn" data-id="${i}">`
    if (lang1 === 'Japanese') {
      spans = `<p class="hira" data-id="${i}">${lesson.hira[i]}</p>` + spans
    }
    const tmparr = []
    words.forEach((wrd, j) => {
      const regex = wholeWord(wrd)
      let spn = ` <span data-id="${idSpn}">${wrd}</span>`
      const spnRez = arrStr[j].replace(regex, spn)
      spans += spnRez
      tmparr.push(j)
      idSpn += 1
    })
    spans = spans + '</p>'
    inpts = `<p class="inpt" data-id="${i}"><input type="checkbox" class="pOnOff"/>`
    const txtArr = []
    words.forEach((wrd, j) => {
      const regex = wholeWord(wrd)
      let wdth = $('#widthMesure').html(wrd).width()
      // if (lang1 === 'Japanese') {
      //   wdth = 1.2 * wdth
      // }
      let inpt = ` <input class="on" data-wrd="${wrd}" data-id="${idInpt}" style ="width:${wdth}px" type="text">`
      const inptRes = arrStr[j].replace(regex, inpt)
      inpts += inptRes
      idInpt++
    })
    inpts += '</p>'
    inptsRez += inpts
    spans += '</span>'
    spnsRez += spans
  })
  $('#inpts').html(inptsRez)
  $('#inpts').prepend('<input type="checkbox" class="divOnOff"/>')
  $('input.divOnOff').attr('checked', true)
  $('input.pOnOff').attr('checked', true)
  if (lesson.assistTxt) {
    spnsRez =
      `<p class="assist" data-id="0">${lesson.assistTxt}</p><p class="hira" data-id="0">${lesson.hira[0]}</p>` +
      spnsRez
  }
  $('#toLearn').html(spnsRez)
  restoreInps()
  $('#dashboard fieldset').fadeIn()
  $('#translate').fadeIn()
}

$('body').on('focus', '#char', function () {
  $(this).css('color', '')
  $('.alphbt').removeClass('active')
  let playElm = ''
  const indx = lesson.inptIds[0]
  lesson.time1 = lesson.keysArr[indx].strDur
  const key = lesson.keysArr[indx].key
  const char = $(`#${key}`).text()
  let char2 = ''
  if ($('#hiraKata').hasClass('cl_1')) {
    char2 = lesson.keysArr[indx].kana
  } else {
    char2 = lesson.keysArr[indx].strng
  }
  $('.flashCard span').eq(0).text(char2)
  $('.flashCard span').eq(1).text(char)
  lesson.key = key
  playElm = $(`#${key}`)
  lesson.code = key.split('_')[1]
  $(playElm).addClass(lesson.hilightClass)
  if ($('#visible').hasClass('cl_2') || $('#onOff').hasClass('cl_2')) {
    $(playElm).removeClass(lesson.hilightClass)
  }
  sprite.playWord(lesson.key)
})

$('main').on('click', 'div.flashCard span', function () {
  $(this).toggleClass('invisible')
  $('#char').focus()
})

$('body').on('keydown', '#char', function (evnt) {})

$('body').on('keypress', '#char', function (evnt) {
  if (evnt.key === 'Enter') {
    sprite.playWord(lesson.key)
  } else {
    if (evnt.which == lesson.code || evnt.keyCode == lesson.code - 32) {
      const indx = lesson.inptIds[0]
      lesson.keysArr[indx].class = 'pld'
      $(`#${lesson.key}`).addClass('pld').removeClass('on')
      $(`#${lesson.key}`).removeClass(lesson.hilight)
      lesson.inptIds.shift()
      if (lesson.inptIds.length <= 0) {
        playIdsRestore()
        $('.alphbt').removeClass('pld')
        if ($('#char').text() === 'Random') {
          shuffleIF('', 'cl_1')
        }
      }
    }
    $('#char').blur()
    $('#char').focus()
    $('#char').val('')
  }
})

$('body').on('keyup', '#char', function (evnt) {})

$('body').on('blur', '#char', function (evnt) {
  $(this).css('color', 'red')
})
$('main').on('click', '#kbrd-controls button', function () {
  $(this).toggleClass('cl_1 cl_2')
  const id = $(this).attr('id')
  const $elmClass = $(this).attr('class')
  let html = ''
  if (id === 'hilight') {
    $(this).toggleClass('hilight')
  } else {
    if ($(this).hasClass('cl_1')) {
      html = $(this).data('1')
    } else {
      html = $(this).data('2')
    }
    $(this).html(html)
  }
  controls(id, $elmClass)
})

function controls(id, elmClass) {
  switch (id) {
    case 'random':
      shuffleIF(id, elmClass)
      break
    case 'hilight':
      hilightIF('_', elmClass)
      break
    case 'visible':
      visibleIF('_', elmClass)
      break
    case 'mute1':
      muteIF('_', elmClass)
      break
    case 'onOff':
      onOff('_', elmClass)
      break
    case 'flash':
      flash('_', elmClass)
      break
    case 'hiraKata':
      hiraKata('_', elmClass)
      break
  }
  if (lesson.inptIds.length > 0) {
    $('#char').focus()
  }
}

function hilightIF(id, elmClass) {
  $(`#${section} span.alphbt`).removeClass('active')
  lesson.hilightClass = elmClass === 'cl_1' ? 'active' : ''
}

function visibleIF(id, elmClass) {
  if (elmClass === 'cl_1') {
    $('.alphbt').removeClass('invisible')
    $('div.flashCard span').removeClass('invisible')
  } else {
    $('.alphbt').addClass('invisible')
    $('div.flashCard span').addClass('invisible')
  }
  $('#char').focus()
}

function muteIF(id, elmClass) {
  if (elmClass === 'cl_2') {
    lesson.mute1 = true
  } else {
    lesson.mute1 = false
  }
}

function onOff(id, elmClass) {
  const clss = elmClass === 'cl_1' ? 'on' : 'off'
  for (key of lesson.keysArr) {
    key.class = clss
  }
  lesson.inptIds = []
  const tip = 'Click on keys with letters to learn.'
  if (clss === 'on') {
    lesson.inptIds = [...Array(lesson.keysArr.length).keys()]
    $('.alphbt').removeClass('off')
    $('.alphbt').addClass('on')
    $('#tip').text(tip).hide('slow')
  } else {
    $('.alphbt').removeClass('on')
    $('.alphbt').addClass('off')
    $('.alphbt').removeClass('active')
    $('#tip').text(tip).show('slow')
  }
  $('.alphbt').addClass(clss)
}

function hiraKata(id, elmClass) {
  let char = ''
  const charType = elmClass === 'cl_1' ? 'strng' : 'kana'
  for (key of lesson.keysArr) {
    char = key[charType]
    const id = key.key
    $(`#${section} #${id}`).text(char)
  }
}

function flash(id, elmClass) {
  elmClass === 'cl_1'
    ? $('div.flashCard').hide('slow')
    : $('div.flashCard').show('slow')
}

function shuffleIF(id, elmClass) {
  if ($('#random').hasClass('cl_1')) {
    lesson.inptIds.sort((a, b) => {
      return a - b
    })
  } else {
    lesson.inptIds = shuffleArray(lesson.inptIds)
  }
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

$('body').on('click', '.alphbt', function () {
  $('#tip').hide('slow')
  if ($(this).hasClass('pld') || $(this).hasClass('on')) {
    $(this).removeClass('pld').removeClass('on').addClass('off')
  } else {
    $(this).removeClass('off').addClass('on')
  }
  const key = $(this).attr('id') || ''
  const indx = $(this).attr('data-id')
  $('.alphbt.active').removeClass('active')
  if ($(this).hasClass('on')) {
    lesson.keysArr[indx].class = 'on'
    lesson.inptIds.push(indx)
    $('#onOff').removeClass('cl_2').addClass('cl_1')
    $('#onOff').text($('#onOff').data('1'))
  } else {
    lesson.keysArr[indx].class = 'off'
    lesson.inptIds = lesson.inptIds.filter((num) => num != indx)
  }
  let elmClass = ''
  if ($('main #random').hasClass('cl_1')) {
    elmClass = 'cl_1'
  } else {
    elmClass = 'cl_2'
  }
  shuffleIF('', elmClass)
  $('#char').focus()
})

function playIdsRestore() {
  let i = 0
  lesson.inptIds = []
  for (key of lesson.keysArr) {
    if (key.class === 'pld' || key.class === 'on') {
      key.class = 'on'
      lesson.inptIds.push(i)
    }
    i++
  }
  shuffleIF('', 'cl_1')
}

$('body').on('change', '#dashboard [type="checkbox"]', function () {
  const funcName = $(this).attr('name')
  const checked = $(this).prop('checked')
  dashboard(funcName, checked)
  const indx = lesson.inptIds[0]
})

function flashCard(funcName, checked) {
  if (checked) {
    $('.flashCard').show('slow')
    $('.cover').show()
  } else {
    $('.flashCard').hide('slow')
    $('.cover').hide()
  }
  const indx = lesson.inptIds[0]
  $('p.inpt [type=text]').eq(indx).focus()
}

function dashboard(funcName, checked) {
  switch (funcName) {
    case 'mute1':
      mute(funcName, checked)
      break
    case 'mute2':
      mute(funcName, checked)
      break
    case 'hideAll':
      hideAll(funcName, checked)
      break
    case 'flashCard':
      flashCard(funcName, checked)
      break
    case 'random':
      shuffleWrds(checked)
      break
  }
  $('p.inpt [type=text]').eq(lesson.inptIds[0]).focus()
}

function shuffleWrds(checked) {
  if (!checked) {
    lesson.inptIds.sort((a, b) => {
      return a - b
    })
  } else {
    lesson.inptIds = shuffleArray(lesson.inptIds)
  }
}

function mute(funcName, checked) {
  lesson[funcName] = checked
  const orgnTxt = funcName === 'mute1' ? 'Target' : 'Assist'
  const addTxt = checked ? ' (mute)' : ''
  const txt = orgnTxt + addTxt
  $(`label[for=${funcName}]`).text(txt)
  if (!checked) {
    sprite.offset2 = 0
    sprite.offset1 = 0
    sprite.currntS1 = sprite.s1
    sprite.currntD1 = sprite.d1
    sprite.currntS2 = sprite.s2
    sprite.currntD2 = sprite.d2
    sprite.isPaused = true
  }
}

function hideAll(funcName, checked) {
  const playIds = []
  if (lang1 === 'Japanese') {
    checked
      ? $('p.hira').css('color', 'gray')
      : $('p.hira').css('color', 'floralwhite')
  } else
    checked
      ? $('p.spn span').css('color', 'gray')
      : $('p.spn span').css('color', 'white')
}

function restoreInps() {
  const $allChecked = $('.pOnOff:checked')
  if ($allChecked.length === 0) {
    $('.divOnOff').prop('checked', false)
  } else {
    $('.divOnOff').prop('checked', true)
  }
  $allChecked.siblings('.pld').removeClass('pld').val('')
  const $allInpts = $allChecked.siblings('[type=text]')
  let indx = 0
  lesson.inptIds = []
  $inptsAll = $('p.inpt [type=text')
  $inptsAll.each((i, $inpt) => {
    if ($($inpt).attr('class') === 'on' || $($inpt).hasClass('')) {
      lesson.inptIds.push(i)
    }
  })
  lesson.keysToPlay = lesson.inptIds
  if (section === 'phrs' || section === 'sngs') {
    const $checked = $('.pOnOff:checked')
    lesson.keysToPlay = []
    $checked.each((i, elm) => {
      const id = $(elm).parent().data('id')
      lesson.keysToPlay.push(id)
    })
  }
  $allChecked.each((i, $inpt) => {
    if (
      $($inpt).siblings('.off').length < $($inpt).siblings('[type=text]').length
    ) {
      $($inpt).prop('checked', true)
      $('.divOnOff').prop('checked', true)
    }
  })
  const $allCheckBox = $('.pOnOff')
  $allCheckBox.each((i, $checkB) => {
    if (
      $($checkB).siblings('.off').length <
      $($checkB).siblings('[type=text]').length
    ) {
      $($checkB).prop('checked', true)
      $('.divOnOff').prop('checked', true)
    }
  })
  const checked = $('input[name="random"]').prop('checked')
  shuffleWrds(checked)
  indx = lesson.inptIds[0]
  const $inpt = $('p.inpt [type=text').eq(indx)
  const i = $inpt.parent('p.inpt').data('id')
  $('p.inpt').show()
  $('p.inpt').eq(i).prevAll('p.inpt').hide()
  $('p.spn').fadeOut()
  $('p.hira').fadeOut()
  $('p.spn').eq(i).fadeIn()
  $('p.hira').eq(i).fadeIn()
  lesson.keyPrev = 'k_100'
  $inpt.focus()
}

$('body').on('click', 'p.spn span', function () {
  const id = $(this).data('id')
  const $inpt = $(`input[data-id="${id}"]`)
  const prevClss = $inpt.attr('class')
  $inpt.attr('class', '')
  let clss
  if (prevClss === 'off' || prevClss === 'pld') {
    clss = 'on'
    $inpt.val('')
  } else if (prevClss === 'on' || prevClss === '') {
    clss = 'off'
    $inpt.val($inpt.data('wrd'))
  }
  //  else {
  //   clss = ''
  //   $inpt.val('')
  // }
  $inpt.addClass(clss)
  $('#confirmChanges').show('slow')
})

$('main').on('click', '#confirmChanges', function () {
  restoreInps()
  if ($('input.off').length < $('input[type="text"]').length) {
    $(this).hide('slow')
  }
})

$('body').on('change', '.pOnOff', function () {
  const $inpts = $(this).siblings('[type=text]')
  $inpts.removeClass('on pld')
  if ($(this).prop('checked')) {
    $inpts.removeClass('off').addClass('on')
    $inpts.each((i, $inpt) => {
      $($inpt).val('')
    })
    lesson.keyPrev = 'k_100'
  } else {
    $inpts.addClass('off')
    $inpts.each((i, $inpt) => {
      $($inpt).val($($inpt).data('wrd'))
    })
  }
  $('#confirmChanges').show('slow')
})

$('main').on('change', '.divOnOff', function () {
  lesson.keyPrev = 'k_100'
  const $inpts = $('p.inpt [type="text"]')
  $inpts.removeClass('off on pld')
  if ($(this).prop('checked')) {
    $('.pOnOff').prop('checked', true)
    $inpts.addClass('on')
    $inpts.each((i, $inpt) => {
      $($inpt).val('')
    })
  } else {
    $('.pOnOff').prop('checked', false)
    $inpts.addClass('off')
    $inpts.each((i, $inpt) => {
      $($inpt).val($($inpt).data('wrd'))
    })
    lesson.inptIds = []
  }
  $('#confirmChanges').show('slow')
})

$('body').on('focus', 'p.inpt [type=text]', function (event) {
  $(this).val('')
  lesson.wrd = $(this).data('wrd')
  setTimeout(() => {
    $('#flashCard').text('')
    $('div.flashCard p').eq(0).text(lesson.wrd)
  }, 500)
  lesson.key =
    section === 'wrds' || section === 'hankan'
      ? 'k_' + $(this).data('id')
      : 'k_' + $(this).parent('p.inpt').data('id')
  if (lesson.key != lesson.keyPrev) {
    if (!lesson.nonStop) {
      sprite.reset()
      sprite.playWord(lesson.key)
    }
    if (section === 'phrs' || section === 'sngs') {
      const idPrev = lesson.keyPrev.split('_')[1]
      const id = lesson.key.split('_')[1]
      $(`p.inpt[data-id=${idPrev}]`).hide('slow')
      $(`p.spn[data-id=${idPrev}]`).hide()
      $(`p.hira[data-id=${idPrev}]`).hide()
      $(`p.translation[data-id=${idPrev}]`).hide()
      $(`p.spn[data-id=${id}]`).fadeIn()
      $(`p.hira[data-id=${id}]`).fadeIn()
      $(`p.translation[data-id=${id}]`).fadeIn()
      lesson.keyPrev = lesson.key
    }
  }
})

$('body').on('keydown', 'p.inpt [type=text]', function (e) {
  if (lesson.nonStop) return
  if (e.key === 'Enter') {
    if (section === 'wrds' || section === 'hankan') {
      sprite.playWord(lesson.key)
      return
    } else if (section === 'phrs' || section === 'sngs') {
      if (sprite.isPaused) {
        sprite.playWord(lesson.key)
        return
      } else {
        sprite.pause()
        return
      }
    }
  }
})
$('body').on('keyup', 'p.inpt [type=text]', function (e) {
  $('#flashCard').text($(this).val().trim())
  if ($(this).val().trim() === lesson.wrd) {
    $(this).addClass('pld')
    lesson.inptIds.shift()
    if (lesson.inptIds.length === 0) {
      $('p.inpt').show()
      lesson.keyPrev = lesson.key
      $(this).blur()
      restoreInps()
      return
    }
    const indx = lesson.inptIds[0]
    $(this).blur()
    $('p.inpt [type=text]').eq(indx).focus()
  }
})

$('body').on('click', 'p.inpt [type=text]', function (e) {
  e.preventDefault()
  const indx = lesson.inptIds[0]
})

$('.swap').on('click', function (e) {
  const lang = lang1
  lang1 = lang2
  lang2 = lang
  getData(lesson.num)
  $('li.lesson').each((i, elm) => {
    const txt2 = $(elm).children('span').eq(1).text()
    const txt1 = $(elm).children('span').eq(2).text()
    $(elm).children('span').eq(1).text(txt1)
    $(elm).children('span').eq(2).text(txt2)
  })
})

$('main').on('change', 'input[name="loop"]', function (e) {
  lesson.nonStop = this.checked
  this.checked ? $('#breakTime').show('slow') : $('#breakTime').hide('slow')
  sprite.playId++
  sprite.stop()
  sprite.isStopped = false
  sprite.reset()
  if (!lesson.nonStop) return
  lesson.nonStopKey = 0
  const key = 'k_' + lesson.keysToPlay[0]
  sprite.playNonStop()
})

renderTranslation = (translatedLine) => {
  $('.translation').hide()
  const key = lesson.key.split('_')[1]
  if ($(`.translation[data-id=${key}]`).length === 0) {
    const elm = `<p class="translation" data-id=${key}>${translatedLine}</p>`
    $('#toLearn').append(elm)
  } else {
    $(`.translation[data-id=${key}]`).show('slow')
  }
  $(`input[data-id=${key}]`).focus()
}

$('main').on('click', '#translate', function () {
  const targetLang = lesson.lang1
  const assistLang = lesson.lang2
  const songNum = lesson.num
  const lineNum = lesson.key.split('_')[1]
  const line = lesson.keysArr[lineNum].strng.join(' ')
  console.log({ targetLang, assistLang, songNum, lineNum, line })

  $.ajax({
    url: '../php/translate.php',
    method: 'POST',
    dataType: 'json',
    data: {
      targetLang,
      assistLang,
      songNum,
      lineNum,
      line,
    },
    success: function (response) {
      console.log(response)
      if (response.status === 'found') {
        renderTranslation(response.translated_line)
      }

      if (response.status === 'generated') {
        renderTranslation(response.translated_line)
      }

      if (response.status === 'error') {
        console.error(response.message)
      }
    },
    error: function (error) {
      console.error('Server error:', error)
    },
  })
})

$('main').on('click', '.cover', function () {
  const indx = lesson.inptIds[0]
  $('p.inpt [type=text]').eq(indx).focus()
})
