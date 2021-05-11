const AppService = require("./app-service");
const appService = new AppService();

const loadConfig = function () {
  const config = require("./app.json");
  return config;
};

const start = async () => {
  const config = loadConfig();
  appService
    .initialize(config)
    .then(() => {
      appService.getServer().listen(config.expo.port, () => {
        console.log("Serviço iniciado na porta " + config.expo.port);
      });
    })
    .catch((error) => {
      console.error("Erro ao iniciar o serviço", error);
    });
};

start();
