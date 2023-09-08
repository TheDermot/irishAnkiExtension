chrome.runtime.sendMessage({ action: 'activate_injection' });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getActiveTabId') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      sendResponse({ tabId: tabs[0].id });
    });
    return true;
  }
});
