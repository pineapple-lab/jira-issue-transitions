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
    private fromStatus: string[] = [];
	private avoidStatus: string[] = [];
    private title: string = '';
	private jira: Jira = null as any;

    constructor() {
        this.initializeParams();
		this.validateParams();
		this.jira = new Jira(this.token, this.email, this.url);
    }

	private initializeParams() {
		this.token = core.getInput('jira-api-token');
		this.email = core.getInput('jira-email');
		this.url = core.getInput('jira-base-url');
		this.toStatus = core.getInput('to');
		this.title = core.getInput('title');

		const fromStatus = core.getInput('from');
		this.fromStatus = isNotEmptyString(fromStatus) ? fromStatus.split(',') : [];

		const issues = core.getInput('issues');
		this.issues = isNotEmptyString(issues) ? issues.split(',') : [];

		const avoidStatus = core.getInput('avoid');
		this.avoidStatus = isNotEmptyString(avoidStatus) ? avoidStatus.split(',') : [];
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

		const issuesToMove = await this.getFinalIssues();
		let movedIssues = 0;

		const promises = issuesToMove.map( async issue => {
			const transitionId = await this.jira.getTransition(this.issues[0], this.toStatus);
			const result = await this.jira.moveIssue(issue, transitionId);
			if (result) {
				movedIssues++;
				await this.jira.addRemoteLink(issue, this.toStatus, this.title);
			}
		} );

		await Promise.all(promises);

		if (movedIssues !== issuesToMove.length) {
			console.warn(`${issuesToMove.length - movedIssues} issues were not moved!`);
		}

		core.setOutput('moved-issues', movedIssues);
	}

	async getFinalIssues(): Promise<string[]> {
		if (!isNoEmptyArray(this.fromStatus) && !isNoEmptyArray(this.avoidStatus)) {
			return this.issues;
		}
		if (isNoEmptyArray(this.fromStatus)) {
			const issues: { key: string }[] = await this.jira.findJirIssuesByStatus(this.fromStatus);
			return this.issues.filter(issue => issues.some( i => i.key === issue ));
		}
		const avoidIssues: { key: string }[] = await this.jira.findJirIssuesByStatus(this.avoidStatus);
		return this.issues.filter( (issue) => !avoidIssues.some( (avoidIssue) => issue === avoidIssue.key));
	}

}
