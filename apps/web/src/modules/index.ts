import { registerModules } from "../core/module-registry";
import { garbageModule } from "./garbage";
import { youbikeModule } from "./youbike";

registerModules([garbageModule, youbikeModule]);
