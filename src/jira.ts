import { setFailed, context } from "./core";
import { isNotEmptyString, isValidNumber } from "./utils";
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

	async addRemoteLink( issue: string, to: string, title = 'Github actions', from: string = '') {
		const icon = context?.payload?.sender?.avatar_url || `https://raw.githubusercontent.com/pineapple-lab/jira-issue-transitions/main/src/assets/github.png`;
		const path = `${this.url}/rest/api/2/issue/${issue}/remotelink`;
		const config = { auth: { username: this.email, password: this.token } };
		const body = {
			"application": { "name": "Github", "type": "com.github.actions#jira-issue-transitions" },
			"globalId": context.runId + '', "relationship": "deploy", "object": {
				"summary": `Moved to '${to}'${ from ? ' to ' + from : '' }, ${ new Date().toUTCString() }`,
				"icon": { "url16x16": icon, "title": "Github" }, "title": title || 'Github actions',
				"url": `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${context.runId}`
			}
		};
		const result: any = await axios.post(path, body, config).catch(e => ({ error: true }));
		return result?.error !== true;
	}

	findJirIssuesByStatus(status: string[], avoidStatuses: string[] = []) {
		return this.findIssuesByStatusUntilTotal(status, avoidStatuses);
	}

	private async findIssuesByStatusUntilTotal(status: string[], avoidStatuses: string[] = [], result: any[] = [], total: number = null as any): Promise<any[]> {

		if (isValidNumber(total) && total <= result.length) {
			return result;
		}

		const response = await this.findIssuesByStatusLogic(status, avoidStatuses, result?.length || 0);
		if (response.data.total <= response.data.issues.length) {
			return response.data.issues;
		}

		result = result.concat(response.data.issues);
		total = response.data.total;
		return this.findIssuesByStatusUntilTotal(status, avoidStatuses, result, total);
	}

	private findIssuesByStatusLogic(status: string[], avoidStatuses: string[] = [], startAt: number = 0) {

		let jql = status.map(s => `status = "${s}"`).join(' OR ');

		if (avoidStatuses.length > 0) {
			const preJql = status.length > 0 ? `(${jql}) AND ` : '';
			jql = `${preJql}${avoidStatuses.map(s => `status != "${s}"`).join(' AND')}`;
		}

		const path = `${this.url}/rest/api/3/search?startAt=${startAt}&fields=none&maxResults=1000&jql=${jql}`;
		const config = { auth: { username: this.email, password: this.token } };
		return axios.get(encodeURI(path), config);
	}

}
