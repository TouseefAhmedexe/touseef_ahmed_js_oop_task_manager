import { loadSampleData } from "./services/sample-loader.js";
import { AppController } from "./ui/app-controller.js";
import { requireElement } from "./ui/dom.js";

function showFatalError(error) {
    const banner = requireElement("app-error");

    banner.textContent = `The application could not start: ${error.message}`;
    banner.hidden = false;
}

try {
    const service = loadSampleData();
    const app = new AppController(service);

    app.init();
} catch (error) {
    showFatalError(error);
    throw error;
}