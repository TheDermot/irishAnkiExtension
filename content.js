console.log('content script');

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log('content js recieved message: ', message);
  if (message === 'iframe') {
    console.log(message);
    var frame = document.getElementById('info'); //iframe
    console.log(frame, 'frames source');
    chrome.runtime.sendMessage({ message: 'iframeSrc', src: frame.src });
  }
  if (message.message === 'definition') {
    console.log('site text recieved', message.definition);
    var text = document.getElementById('text');
    text.value = message.word;
    var def = document.getElementById('definition');
    console.log(def);
    def.value = message.definition.trim();
    var grammar = document.getElementById('grammar');
    grammar.value = message.grammar;
    const status = document.getElementById('formStatus');
    status.textContent = 'Ready to submit';
  }
  if (message.message === 'reload') {
    console.log('reload text! new url is ', message.newLink);
    var frame = document.getElementById('info'); //iframe
    frame.src = message.newLink;
    var text = document.getElementById('text');
    console.log(text);
    text.value = message.newWord;
  }
});

//some words take a long  time to load, often found when new link is sent when word not found. May be able to speed up website if url
// is changed to a specific dictionary url
