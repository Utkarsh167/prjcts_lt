"use strict";

import * as config from "@config/environment";
const authToken = require("@modules/" + config.SERVER.API_VERSION + "/shared/authToken");
import * as good from "./good";
import * as image from "./image";
import * as swagger from "./swagger";

export let plugins = [].concat(authToken, good, image, swagger);