import * as core from "@actions/core";
import { setFailed } from "./core";
import { Jira } from "./jira";
import { isNoEmptyArray, isNotEmptyString } from "./utils";

export class Action {

    private token: string = '';
    private url: string = '';
    private email: string = '';
    private issues: string[] = [];
    private toStatus: string = '';
    private fromStatus: string = '';
    private comment: string = '';
	private jira: Jira = null as any;

    constructor() {
        this.initializeParams();
		this.justTasting();
		this.validateParams();
		this.jira = new Jira(this.token, this.email, this.url);
    }

	justTasting() {
		// this.token = 'Basic anVsaW8uY2VzYXJAcGluZWFwcGxlLWxhYi5jb206NEZGdlNlNXJmMUtXMHZiUDd0THREMTMz';
		this.token = '4FFvSe5rf1KW0vbP7tLtD133';
		this.url = 'https://jeminc.atlassian.net';
		this.email = 'julio.cesar@pineapple-lab.com';
		this.issues = 'OM-2065,OM-2054,OM-879,OM-33333333'.split(',') as string[];
		this.toStatus = 'To Do' as string;
	}

	private initializeParams() {
		this.token = core.getInput('jira-api-token');
		this.email = core.getInput('jira-email');
		this.url = core.getInput('jira-base-url');
		this.toStatus = core.getInput('to');
		this.fromStatus = core.getInput('from');
		this.comment = core.getInput('comment');

		const issues = core.getInput('issues');
		this.issues = isNotEmptyString(issues) ? issues.split(',') : [];
	}

	private validateParams() {
		if (!isNoEmptyArray(this.issues)) {
			setFailed('Issues is required!');
		}
		if (!isNotEmptyString(this.toStatus)) {
			setFailed('To status is required!');
		}
	}

	async execute() {

		const issuesToMove = this.issues;
		let movedIssues = 0;

		const promises = issuesToMove.map( async issue => {
			const transitionId = await this.jira.getTransition(this.issues[0], this.toStatus);
			const result = await this.jira.moveIssue(issue, transitionId);
			if (result) {
				movedIssues++;
			}
		} );

		await Promise.all(promises);

		if (movedIssues !== issuesToMove.length) {
			console.warn(`${issuesToMove.length - movedIssues} issues were not moved!`);
		}

		core.setOutput('moved-issues', movedIssues);
	}

}
