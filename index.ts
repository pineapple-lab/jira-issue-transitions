import * as core from "@actions/core";
import { Action } from "./src/action";

async function run() {
	try {
		const action = new Action();
		await action.execute();
	} catch (error: any) {
		core.setFailed(error.message);
	}
}

run();
