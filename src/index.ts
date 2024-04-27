const fs = require("fs");
import { Scraper } from "./scraper";

const scraper = new Scraper();
const gameNames = ["Horizon Forbidden West", "Fallout 76", "Cyberpunk 2077", "Manor Lords", "Helldivers 2", "Dragons Dogma 2", "Elden Ring"];
scraper.main(gameNames);