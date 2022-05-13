# jira-issue-transitions
Github action for move jira issues. 

## **Inputs**
## `jira-api-token`

***Required*** You must create a Jira API Token for use this action:
[You can access to this link after be logged into jira solution for manage your tokens.](https://id.atlassian.com/manage-profile/security/api-tokens)

## `jira-email`

***Required*** You need to set the same email that you used for create the Jira API token before.

## `jira-base-url`

***Required*** You must to set the Jira url. Example: https://myserver.atlassian.net

## `issues`

***Required*** You must specify the issues that will be moved. It can be separated by ",". Example: `OM-123,OM-456,OM-789`

## `to`

***Required*** Status where the issue will be moved.

## `from`

***Optional*** Status where the problems should be before being moved. You can put many status separated by ",". Example: 'Pending Deployment,Tested ready for deploy'

## `avoid`

***Optional*** Status of issues that will be avoid for movement. It is not used if the "from" property has value. You can put many status separated by ",". Example: 'Done,QA Testing'

## `title`

***Optional*** Title for github external link in Jira.


## **Outputs**

## `moved-issues`

Total of finale moved issues.

## Example usage

```
- name: Move jira issues
  uses: pineapple-lab/jira-issue-transitions@v2.5
  with:
    jira-api-token: "${{secrets.JIRA_API_TOKEN}}"
    jira-email: "${{secrets.JIRA_USER_EMAIL}}"
    jira-base-url: 'https://example.atlassian.net'
    issues: 'OM-123,OM-456,OM-789'
    to: 'In Progress'
    from: 'To Do'
    title: 'Deploy to develop'
```
