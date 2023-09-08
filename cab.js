console.log('cab');
var cab = {
  urlStart: 'https://www.teanglann.ie',

  clickify: function ($n) {
    var $ = jQuery;
    if (!$n) $n = $(document);
    if (!$n.jquery) $n = $($n);
    for (var y = 0; y < $n.toArray().length; y++) {
      var n = $n.toArray()[y];
      this.cleanTuairisc(n);
      for (var i = 0; i < n.childNodes.length; i++) {
        node = n.childNodes[i];
        if (node.nodeType == 1) {
          if (node.nodeName === 'a' || node.nodeName === 'A') {
            node.addEventListener('click', function (e) {
              e.preventDefault();
            });
          }
          nosplit = $(node).hasClass('nosplit');
          this.clickify(node);
        } else if (node.nodeType == 3 && $.trim(node.nodeValue) != '') {
          var replace = document.createElement('span');
          replace.innerHTML = this.clickifyText(node.nodeValue);
          n.replaceChild(replace, node);
        }
      }
    }
  },

  clickifyText: function (str) {
    var ret = '';
    var buffer = '';
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      if ("aábcdeéfghiíjklmnoópqrstuúvwxyzAÁBCDEÉFGHIÍJKLMNOÓPQRSTUÚVWXYZ'’-".indexOf(c) > -1) {
        buffer += c;
      } else {
        if (buffer != '') {
          ret += this.text2click(buffer);
          buffer = '';
        }
        ret += c;
      }
    }
    if (buffer != '') {
      ret += this.text2click(buffer);
      buffer = '';
    }
    return ret;
  },

  text2click: function (str) {
    var s = '<span';
    s += ' style="cursor: pointer"';
    s += " onmouseover=\"this.style.color='#993300'; this.style.textDecoration='underline'\"";
    s += " onmouseout=\"this.style.color=''; this.style.textDecoration=''\"";
    s += ' onclick="cab.lexclick(this)"';
    s += '>';
    s += str;
    s += '</span>';
    return s;
  },

  cleanTuairisc: function (n) {
    var $ = jQuery;

    //remove Tuairisc.ie <span class="s1"> etc:
    $(n)
      .children('span.s2')
      .each(function () {
        $(this).replaceWith(this.innerHTML);
      });
    $(n)
      .children('span.s1')
      .each(function () {
        $(this).replaceWith(this.innerHTML);
      });

    //merge text nodes:
    var prevNode;
    for (var i = 0; i < n.childNodes.length; i++) {
      var node = n.childNodes[i];
      if (node.nodeType == 3 && prevNode && prevNode.nodeType == 3) {
        prevNode.nodeValue += node.nodeValue;
        node.nodeValue = '';
      } else {
        prevNode = node;
      }
    }
  },

  lexclickOrigin: 0,

  lexclick: function (a) {
    var $ = jQuery;
    var str = a.innerText;
    clean = str.replace(/^\s*/, '').replace(/\s*$/, '');
    console.log('word clicked: ', clean);

    var url = cab.urlStart + '/ga/fgb/' + clean;
    if ($('body').width() > 450) {
      $('#lexclick').remove();
      var $a = $(a);
      {
        var leftOffset = $a.offset().left;
        var className = '';
      }
      if (leftOffset > $('body').width() / 2) {
        leftOffset = leftOffset - 280;
        var className = 'rightAnchored';
      }

      var css =
        'position: absolute; z-index: 100; width: 350px; height: auto; background-color: #dddddd; border: 1px solid #333333; padding: 5px; box-shadow: 0px 0px 5px #999999; border-radius: 2px; line-height: 1.5em;';
      var cssArrow =
        'position: absolute; top: -9px; left: 10px; width: 15px; height: 9px; background-image: url("' +
        cab.urlStart +
        '/cab/lexclick-callout.gif"); z-index: 101;';
      if (className == 'rightAnchored') cssArrow += ' left: auto; right: 10px;';

      $(
        "<div id='lexclick' class='" +
          className +
          "' style='" +
          css +
          "line-height: 1em; display: flex; flex-direction: column' onclick='cab.lexclickOrigin=123'><div class='arrow' style='" +
          cssArrow +
          "'></div><div>" +
          "<form id = 'word' method = 'POST' action = 'https://irish-anki.onrender.com/words'><label for ='text'>Enter Text</label><input type='text' id='text' name='text' />" +
          "<label for ='definition'>Enter Definition</label><input type='text' id='definition' name='definition' /><label for ='grammar'>Enter Grammar</label><input type='text' id='grammar' name='grammar' />" +
          "<label for='checkbox' style='display: inline'>Known Word</label><input style='display: inline' type='checkbox' id='known' name='known'><div><button type='submit'>submit</button></div><label id = 'formStatus'>Searching...</label></form></div>" +
          "<iframe name='lexclickFrame' id = 'info' style='width: auto; height: 300px; border: 1px inset #333333;' src='" +
          url +
          "' frameborder='0'></iframe><div style='font-family: sans-serif; font-size: 12px; text-align: left; margin-top: 3px;'></div>"
      )
        .appendTo('body')
        .offset({ top: $a.offset().top + $a.height() + 10, left: leftOffset });

      const word = document.getElementById('text');
      word.value = clean;
      const form = document.getElementById('word');
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        console.log('YOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
        const status = document.getElementById('formStatus');
        status.textContent = 'Submitting...';
        console.log('foooooorm', form);
        const data = new FormData(form);
        const inputs = {
          text: data.get('text'),
          definition: data.get('definition'),
          grammar: data.get('grammar'),
          known: data.get('known'),
        };
        // Create the request body
        const requestBody = new URLSearchParams();
        for (const [key, value] of Object.entries(inputs)) {
          requestBody.append(key, value);
        }
        console.log('dataaaa', requestBody.toString());
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://irish-anki.onrender.com/words', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const responseData = JSON.parse(xhr.responseText);

              if (responseData.success === true) {
                status.textContent = responseData.reason;
              } else {
                status.textContent = responseData.reason;
              }
            } else {
              console.error('Network request failed with status:', xhr.status);
            }
          }
        };
        xhr.send(requestBody.toString());
      });
      const frame = document.getElementById('info'); //iframe
      console.log(frame.src);
      // Access the iframe's content from the content script
      frame.addEventListener('load', function () {
        console.log('frame loaded');
        chrome.runtime.sendMessage('iframe');
        console.log('message sent');
      });
    } else {
      window.open(url);
    }
  },
};

//extra html for link below iframe
{
  /* <a href='" +
          url +
          "' target='_blank' style='color: #336699; text-decoration: none; position: relative; top: -3px; text-shadow: 1px 1px 0px #eeeeee;' onmouseover='this.style.color=\"#4477aa\"' onmouseout='this.style.color=\"#336699\"'><img src='" +
          cab.urlStart +
          "/cab/application.png' width='16' height='16' style='position: relative; top: 3px; margin-right: 2px; margin-left: 2px;'/> www.teanglann.ie »</a></div> */
}
