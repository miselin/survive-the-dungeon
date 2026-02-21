import { runCombatTests } from "./combat.test.js";
import { runDiceTests } from "./dice.test.js";
import { runProcgenTests } from "./procgen.test.js";
const tests = [
    { name: "dice", run: runDiceTests },
    { name: "procgen", run: runProcgenTests },
    { name: "combat", run: runCombatTests },
];
let failures = 0;
for (const test of tests) {
    try {
        test.run();
        console.log(`PASS ${test.name}`);
    }
    catch (error) {
        failures += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`FAIL ${test.name}: ${message}`);
    }
}
if (failures > 0) {
    const maybeProcess = globalThis;
    if (maybeProcess.process) {
        maybeProcess.process.exitCode = 1;
    }
    throw new Error(`${failures} unit test suite(s) failed.`);
}
console.log(`PASS all ${tests.length} test suites`);
