/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {hasKeys} from 'commerce/utils';

const PRODUCT_KEYS = ['title', 'image', 'price'];
const SIDEBAR_URL = browser.extension.getURL('/sidebar.html');

/**
 * Open the sidebar when the page action is clicked.
 */
browser.pageAction.onClicked.addListener(() => {
  browser.sidebarAction.open();
});

/**
 * Prep initial sidebar on location change for a given tab.
 */
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.status === 'loading') {
    browser.sidebarAction.setPanel({
      panel: SIDEBAR_URL,
      tabId,
    });
  }
});

browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message) => {
    if (message.type === 'product-data') {
      // If this page contains a product, prep the sidebar and show the
      // page action icon for opening the sidebar.
      const isProductPage = hasKeys(message.data, PRODUCT_KEYS);
      if (isProductPage) {
        browser.sidebarAction.setPanel({
          panel: getPanelURL(message.data),
          tabId: port.sender.tab.id,
        });
        browser.pageAction.show(port.sender.tab.id);
      }
    }
  });
  port.postMessage({
    type: 'background-ready',
  });
});

/**
 * Generate the sidebar panel URL for a specific product.
 */
function getPanelURL(productData) {
  const url = new URL(SIDEBAR_URL);
  for (const key of PRODUCT_KEYS) {
    url.searchParams.set(key, productData[key]);
  }
  return url.href;
}
