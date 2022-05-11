
import * as core from "@actions/core";
import * as github from "@actions/github";

export function setFailed(message: string) {
	core.setFailed(message);
	throw new Error(message);
}

export const context = github.context;
