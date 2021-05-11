const SocketClient = require("../__mocks__/socketIO-client-helper");
const AppService = require("../app-service");
const supertest = require("supertest");
const { multiremote } = require("webdriverio");
let browser;
let request;
const roomId = "teste"

const Utils = require("../__mocks__/utils");

const port = 3001;
const appService = new AppService();
baseUrl = "https://150.162.83.94:3001/";
const wioDefaultConfig = {
  hostname: process.env.SELENIUM_GRID || "127.0.0.1",
  port: 4444,
  acceptSslCerts: true,
};

describe("Sala de conferência", () => {
  let app;
  beforeEach(async (done) => {
    await appService
      .initialize("test")
      .then(() => {
        appService.getServer().listen(port, () => {
          console.log("Serviço iniciado na porta " + port);
        });
      })
      .catch((error) => {
        console.error("Erro ao iniciar o serviço", error);
      });
    app = appService.getApp();
    request = supertest(app);
    done();
  });

  afterEach(async (done) => {
    await browser.deleteSession();
    appService.getServer().close(() => done());
  });


  it("Teste dos stats", async (done) => {
    let res;
    res = await request.get("/rooms");
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();

    browser = await multiremote({
      chromeBrowser1: {
        ...wioDefaultConfig,
        logLevel: "debug",
        capabilities: Utils.getCapabilities("chrome"),
      },
      chromeBrowser2: {
        ...wioDefaultConfig,
        logLevel: "debug",
        capabilities: Utils.getCapabilities("chrome"),
      },
      // firefoxBrowser: {
      //   ...wioDefaultConfig,
      //   logLevel: "debug",
      //   capabilities: Utils.getCapabilities("firefox"),
      // },
    });

    await Utils.loadPage(browser, `${baseUrl}`);

    res = await browser.executeAsync(async (done) => {
      const linseMeshClient = new LinseMeshClient("teste");

      linseMeshClient.start();

      linseMeshClient.on("ready", () => {
        done();
      });

      window.linseMeshClient = linseMeshClient
    });

    res = await request.get("/rooms");
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body).toEqual([{ numOfPeers: 2, roomId: "teste" }]);

    await Utils.takeScreenshot(browser.chromeBrowser1, "test.png");
    await Utils.takeScreenshot(browser.chromeBrowser2, "test2.png");

    await Utils.sleep(10000);

    res = await request.get("/rooms/teste/stats");
    console.log(res.body.roomConnections[0].connections[0].stats);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.roomConnections[0].connections[0].stats.packetsLost).toBe(0);
    expect(res.body.roomConnections[0].connections[0].stats.packetsReceived).toBeGreaterThan(450);
    expect(res.body.roomConnections[0].connections[0].stats.packetsSent).toBeGreaterThan(450);
    expect(res.body.roomConnections[0].connections[0].stats.bytesReceived).toBeGreaterThan(600000);
    expect(res.body.roomConnections[0].connections[0].stats.bytesSent).toBeGreaterThan(600000);

    done();
  }, 120000);

  it("Teste do dataChannel", async (done) => {
    let res;
    res = await request.get("/rooms");
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();

    browser = await multiremote({
      chromeBrowser1: {
        ...wioDefaultConfig,
        logLevel: "debug",
        capabilities: Utils.getCapabilities("chrome"),
      },
      chromeBrowser2: {
        ...wioDefaultConfig,
        logLevel: "debug",
        capabilities: Utils.getCapabilities("chrome"),
      },
    });

    await Utils.loadPage(browser, `${baseUrl}`);

    res = await browser.executeAsync(async (done) => {
      const linseMeshClient = new LinseMeshClient("teste");

      linseMeshClient.start();

      linseMeshClient.on("ready", () => {
        done();
      });

      window.linseMeshClient = linseMeshClient;
    });


    res = await request.get("/rooms");
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body).toEqual([{ numOfPeers: 2, roomId: "teste" }]);



    res = await Promise.all([
      browser.chromeBrowser2.executeAsync(async (done) => {
        linseMeshClient.on("message", (evt) => {
          receivedMessage.value = evt;
          done();
        })
      }),
      browser.chromeBrowser1.executeAsync(async (done) => {
        setTimeout(async()=>{
          await linseMeshClient.sendMessage("ola tudo bem");
          done();
        },2000)
      })
    ]);



    res = await Promise.all([
      browser.chromeBrowser1.executeAsync(async (done) => {
        linseMeshClient.on("message", (evt) => {
          receivedMessage.value = evt;
          done();
        });
      }),
      browser.chromeBrowser2.executeAsync(async (done) => {
        setTimeout(async()=>{
          await linseMeshClient.sendMessage("testando o segundo browser");
          done();
        },2000)
      }),
    ]);

    const message1 = await Utils.getElementById(browser.chromeBrowser2, "dataChannelReceive");
    const msg1 = await message1.getValue();

    const message2 = await Utils.getElementById(browser.chromeBrowser1,"dataChannelReceive");
    const msg2 = await message2.getValue();

    expect(msg1).toMatch('ola tudo bem');
    expect(msg2).toMatch("testando o segundo browser");

    await Utils.takeScreenshot(browser.chromeBrowser1, "test3.png");
    await Utils.takeScreenshot(browser.chromeBrowser2, "test4.png");



    done();
  }, 60000);
});
