# pn-server

## Getting Started ✨

## Installation

```
 npm i
```

## Environment Variables

Add a file named `.env` at the root directory which is same level as package.json
you can find SECRET in the Notion, copy paste them into .env file.
[Notion](https://www.notion.so/Backend-0a4251c3da014b07806bb4dbca32cdef)

## Running the app

```
npm run start
```

## Project Tech Stack

<table align="center" border=0>
   <tr>
      <td width="500"><b>Back-end</b></td>
   </tr>
   <tr>
      <td>
         • <b>Node Version</b>: v16<br>
         • <b>Framework</b>: Express.js <br>
         • <b>Scripting Language</b>: Typescript<br>
         • <b>Testing</b>: Jest, Supertest<br>
         • <b>Code Control</b>: Eslint, Prettier<br>
         • <b>Git Hook</b>: Husky, commitlint<br>   
         • <b>Database</b>: MongoDB<br>  
         • <b>Object Modelling Tool</b>: Mongoose<br>  
         • <b>Cloud database service</b>: MongoDB Atlas<br> 
      </td>
   </tr>
</table>

## Notion Board

We put our ticket board and other important information in the notion board.
[Notion](https://www.notion.so/Backend-0a4251c3da014b07806bb4dbca32cdef)

## Code of Conduct :clipboard:

<table align="center" border=0>
   <tr>
      <td width="500"><b>1. Creating New Branches</b></td>
   </tr>
   <tr>
      <td>

- Warning:heavy_exclamation_mark::cop:: <b>No one</b> was allowed to manipulate `main` branch <b>directly</b> in any way and for any reason. When you get a new ticket and plan to start your work, please <b>create a new branch</b> then start coding.
  You can create a pull request to make your work able to be reviewed and tested by team and get your code merged after getting enough approvals.<br>
- Branch Name Example: "feature/pn-0027-a-user-can-view-profile"
- Tutorial about branch management: [Link](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/making-changes-in-a-branch/managing-branches)
- It is better to delete your branch after your pull request is approved and your branch have been merged into `main` branch.
  </td>
   </tr>
   <tr>
      <td width="500"><b>2. Commit Message</b></td>
   </tr>
   <tr>
      <td>

# Semantic Commit Messages

See how a minor change to your commit message style can make you a better programmer.

Format: `<type>(<scope>): <subject>`

`<scope>` is optional

## Example

```
feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```

More Examples:

- `feat`: (new feature for the user, not a new feature for build script)
- `fix`: (bug fix for the user, not a fix to a build script)
- `docs`: (changes to the documentation)
- `style`: (formatting, missing semi colons, etc; no production code change)
- `refactor`: (refactoring production code, eg. renaming a variable)
- `test`: (adding missing tests, refactoring tests; no production code change)
- `chore`: (updating grunt tasks etc; no production code change)

References:

- https://www.conventionalcommits.org/
- http://karma-runner.github.io/1.0/dev/git-commit-msg.html
  </td>
   </tr>
   <tr>
      <td width="500"><b>3. Pull Request</b></td>
   </tr>
   <tr>
      <td>
- Pull Request Title Example: "Feature/pn 0042 a user can log in sign up"
  </td>
   </tr>
      <tr>
      <td width="500"><b>4. Specific Code Convention</b></td>
   </tr>
   <tr>
      <td>
- Basically we will use double double quotes `""`instead of single quotes`''` in the front end project.
- In terms of indentation, our indentation in the project is two spaces.<br> [How To Change Indentation in your VS code](https://www.kindacode.com/article/vs-code-how-to-change-indentation-2-spaces-4-spaces/)
- Please format your code before submitting your work.
</td>
   </tr>
</table>
