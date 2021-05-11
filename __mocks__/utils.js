const getCapabilities = (browserName) => {
  switch (browserName) {
    case "chrome":
      return {
        browserName: "chrome",
        acceptInsecureCerts: true,
        "goog:chromeOptions": {
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            "--headless",
          ],
        },
      };
    case "firefox":
      return {
        browserName: "firefox",
        acceptInsecureCerts: true,
        "moz:firefoxOptions": {
          args: ["-headless"],
          prefs: {
            "media.navigator.streams.fake": true,
            "media.navigator.permission.disabled": true,
          },
        },
      };
  }
};

const loadPage = async (context, url) => {
  await context.url(url);
};

const getElementById = async (context, elementId) => {
  return context.$(`#${elementId}`);
};

const typeOnElementById = async (context, elementId, text) => {
  const element = await getElementById(context, elementId);
  await element.setValue(text);
};

const clickOnElementById = async (context, elementId) => {
  const element = await getElementById(context, elementId);
  await element.click();
};

const waitForElementByCssSelector = async (
  context,
  selector,
  timeout = 10000,
  interval = 500
) => {
  await context.waitUntil(
    async () => {
      const el = await context.$(selector);
      return el.isDisplayed();
    },
    { timeout, interval }
  );
};

const clickOnElementByCssSelector = async (context, selector) => {
  const element = await context.$(selector);
  await element.click();
};

const takeScreenshot = async (context, filename) => {
  await context.saveScreenshot(filename);
};

const joinRoom = async (context, roomId, userData) => {
  await typeOnElementById(context, "roomIdField", roomId);
  await typeOnElementById(context, "clientName", userData);
  await clickOnElementById(context, "startButton");
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

module.exports = {
  getCapabilities,
  loadPage,
  getElementById,
  typeOnElementById,
  clickOnElementById,
  waitForElementByCssSelector,
  clickOnElementByCssSelector,
  takeScreenshot,
  joinRoom,
  sleep,
};
