import { setFailed, context } from "./core";
import { isNotEmptyString } from "./utils";
import axios from "axios";

export class Jira {

	private static transition: string = '';

	constructor(private token: string, private email: string, private url: string) {
		this.validateParams();
	}

	validateParams() {
		if (!isNotEmptyString(this.token)) {
			setFailed('Jira api token is required!');
		}
		if (!isNotEmptyString(this.url)) {
			setFailed('Jira base url is required!');
		}
		if (!isNotEmptyString(this.email)) {
			setFailed('Jira email is required!');
		}
	}

	async getTransition(issue: string, status: string) {

		if (isNotEmptyString(Jira.transition)) {
			return Jira.transition;
		}

		const path = `${this.url}/rest/api/2/issue/${issue}/transitions`;
		const result: any = await axios.get(path, { auth: { username: this.email, password: this.token } }).catch(e => ({ error: true }));

		if (result?.error === true) {
			setFailed('Error getting transition!, check to status value! It is case sensitive!');
		}

		result.data.transitions.map((t: any) => {
			if (t.to.name === status) {
				Jira.transition = t.id;
			}
		});

		if (!isNotEmptyString(Jira.transition)) {
			setFailed('Error getting transition!, check to status value! It is case sensitive!');
		}

		return Jira.transition;
	}

	async moveIssue(issue: string, transition: string) {
		const path = `${this.url}/rest/api/2/issue/${issue}/transitions`;
		const config = { auth: { username: this.email, password: this.token } };
		const body = { transition: { id: transition } };
		const result: any = await axios.post(path, body, config).catch(e => ({ error: true }));
		return result?.error !== true;
	}

	async addComment(issue: string, comment: string = 'Moved from by pineapple-bot') {
		const path = `${this.url}/rest/api/2/issue/${issue}/comment`;
		const config = { auth: { username: this.email, password: this.token } };
		const body = { body: comment };
		const result: any = await axios.post(path, body, config).catch(e => ({ error: true }));
		return result?.error !== true;
	}

	addRemoteLink() {
		const json = {
			"application": {
				"name": "Github",
				"type": "com.github.actions#jira-issue-transitions"
			},
			"globalId": "id",
			"relationship": "causes",
			"object": {
				"summary": "From action: deploy",
				"icon": {
					"url16x16": "https://raw.githubusercontent.com/pineapple-lab/jira-issue-transitions/main/src/assets/github.png",
					"title": "Github"
				},
				"title": "Environment: staging",
				"url": "https://github.com/pineapple-lab/jira-issue-transitions/actions/runs/2301907446"
			}
		};



	}

}
