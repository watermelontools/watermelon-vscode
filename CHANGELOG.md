# Change Log

All notable changes to the "watermelon" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.4]
- Added github as an image source to CSP
- Added webflow to image CSP
- Will now log the extension version to the console on startup
- The get help button now shows the top committer name instead of "on Slack"
- Fixed an error where the command would break even when results were fetched
- Fixed some instances of the get help on Slack button not working
- Will select whole file if no selection is made
- Allow all of github as source for images
- Fixed case where empty PR body or empty comment would break the app
- Fixed bug that retrieved PRs from unrelated repositories
- Added Connect-src to CSP
- Added PR author image
- Improved fonts on light themes

## [1.1.3]
- Fixed some instances of the "Get help on Slack" running search
- Added command to the context menu (right click to use)
- Added tooltips to guide the user
- Added brand color when hovering links
- Improved error prompt when running without highlighting lines of code

## [1.1.1]
- Fixed some instances of broken markdown
- Fixed CSP 
- Added linking to user tags
- Added linking to issues
- Made commit authors a link to their profile
- Made PR authors a link to their profile
- Dates now are more human readable
- Font color improvements for light themes 
- Added text to explain command on error

## [1.1.0]
- Added a timeout of 4 seconds for failed executions
- Added Sentry to track errors
- Various speed improvements
- Added Slack help button

## [1.0.0]
- Fixed loading UI

## [0.0.16]
- Improved comments UI
- Added PR description
- Removed bot comments
- Sort PRs per amount of comments
- Added syntax highlighting to long form code 
- Removed "watermelon.signin" command declaration as it is not needed
- Clamp long code blocks, allow declamp with button

## [0.0.14]
- Added search button
- Improvements to README 

## [0.0.11]
- PR titles are now links to the PR on github
- Changed Markdown parser to MarkedJS
- General bugfixes

## [0.0.9]
- Added analytics to invocation through ``watermelon.start``
- Will now stop users abusing the app

## [0.0.7]
- Urgent fix: the sidebar never loaded

## [0.0.5]
- Now the user has to login, allows viewing private repos
- Removed local terminal dependency, uses only VSCode API
- Shows an error panel when there are no results
- *BETA* Adds sidebar panel
- Visual improvements
- Added helper text to explain usage
- Now fetches PR titles (instead of showing "summary")
- Several other improvements
- 
## [0.0.4]
- Basic GitHub integration works for public GitHub repositories
- We now support UNIX and Windows

## [0.0.3]

- Modified README to explain better

## [0.0.2]

- Added logo

## [0.0.1]

- Initial release
