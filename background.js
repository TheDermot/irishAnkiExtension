console.log('hello');

chrome.identity.getAuthToken({ interactive: true }, function (accessToken) {
  fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken)
    .then(response => response.json())
    .then(data => {
      var googleID = data.id;
      console.log('googleIDIDDDDDDDDD', data.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 10],
        addRules: [
          {
            id: 1,
            priority: 1,
            action: {
              type: 'modifyHeaders',
              requestHeaders: [
                {
                  header: 'googleId',
                  operation: 'set',
                  value: googleID,
                },
              ],
            },
            condition: {
              urlFilter: 'https://irish-anki.onrender.com/words',
              resourceTypes: ['main_frame', 'xmlhttprequest'],
              requestMethods: ['post'],
            },
          },
        ],
      });
    })
    .catch(function (error) {
      console.error(error);
    });
  console.log(accessToken);
});

let scriptExecuted = false;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log('background js recieved message: ', message);

  if (message.action == 'activate_injection' && !scriptExecuted) {
    console.log('received message');

    // Execute the script on the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      // Inject your scripts into the tab
      console.log('executing script', tabs[0].id);
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ['jquery-3.6.0.min.js', 'cab.js'],
        },
        () => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: function () {
              console.log('clickify');
              cab.clickify();
              const spans = document.querySelectorAll('span');
              spans.forEach(span => {
                span.addEventListener('click', e => {
                  console.log(e.target);
                  cab.lexclick(e.target);
                });
              });
              console.log('clickify done');
              // Send a message back to the content script to set the flag
              // chrome.runtime.sendMessage({ scriptExecuted: true });
            },
          });
        }
      );

      console.log('executed');
    });

    scriptExecuted = true;
    // Return true to indicate that we will be sending the response asynchronously
    return true;
  }
  if (message === 'iframe') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, 'iframe');
    });
  }
  if (message.message === 'iframeSrc') {
    console.log('iframeSrc msg received');
    var frameSrc = message.src;

    chrome.tabs.create({ url: frameSrc, active: false }, function (tab) {
      const tabId = tab.id;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: tabId => {
          var text;
          const def = document.querySelector('.fgb.trans');
          if (def !== null) {
            text = def.textContent;
            text = text.replace(/\s+/g, ' ');
            console.log(text);
            const title = document.querySelector('.fgb.title');
            if (title !== null) {
              let elementsBetween = [];
              let currentElement = title.nextElementSibling;
              while (currentElement !== def) {
                console.log(currentElement.className);
                if (
                  currentElement.className === 'fgb g' ||
                  (currentElement.className === 'fgb b clickable' && currentElement.textContent.trim() !== '1.')
                ) {
                  elementsBetween.push(currentElement.textContent);
                }
                currentElement = currentElement.nextElementSibling;
              }

              console.log(elementsBetween);
              if (elementsBetween.length > 1) {
                elementsBetween = [elementsBetween[0], '(', ...elementsBetween.slice(1)];
                elementsBetween.push(')');
              }
              var grammar = elementsBetween.join('');
              console.log(grammar);
            }
            let updateTitle = title.textContent.trim();
            updateTitle = updateTitle.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '');
            //sometimes the ifram site goes to the suggested word and doesnt cause a reload so sending word to replace text clicked
            chrome.runtime.sendMessage({ message: 'text', textContent: text, tabId: tabId, grammar: grammar, word: updateTitle });
          } else {
            console.log('defintion not found');
            // Element not found
            const suggestion = document.querySelector('.know');
            if (suggestion !== null) {
              const href = suggestion.querySelector('a').href;
              console.log(href);
              let suggestionWord = suggestion.querySelector('a').textContent.trim();
              suggestionWord = suggestionWord.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '');
              chrome.runtime.sendMessage({ message: 'reload', newLink: href, tabId: tabId, suggestionWord: suggestionWord });
            } else {
              console.log('error');
            }
          }
          //currently if it cant find the class it will not remove the tab
        },
        args: [tabId],
      });
    });
  }
  if (message.message === 'text') {
    console.log(message);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { message: 'definition', definition: message.textContent, grammar: message.grammar, word: message.word });
      chrome.tabs.remove(message.tabId);
    });
  }
  if (message.message === 'reload') {
    console.log('reload text! new url is ', message.newLink);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { message: 'reload', newLink: message.newLink, newWord: message.suggestionWord });
      chrome.tabs.remove(message.tabId);
    });
  }
});

// Add an event listener for the onUpdated event to reset the flag when the page is reloaded
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    scriptExecuted = false;
  }
});

//NOTES
//okay with copy pasting defintion
//include the grammar thing
//swag
//irish and tings and other side english stuff sawgh

// so we have it working sometimes it doesnt fill in the right stuff due to the site breaking pattern,
//current fix is copy paste into form. Consider having a way to turn off suggestion reload for  grammar forms
//and let ppl navigate iframe and copy and paste
//
