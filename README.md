# Devinteractive.net

### About
THis is a copy of the repository currently powering [devinteractive.herokuapp.com](https://devinteractive.herokuapp.com)
### Notes for reviewers
Due to the personal nature of this work, a few aspects have not been dealt with properly (i.e as would have been in a commercial approach). Please see below a list of refactors and improvements this repo should undergo, consider these as caveats when evaluating the whole repo as a job
* css, Typography: The vast majority of rules related to font size and line-height should be refactored to follow a more structured approach (i.e being included via mixins). THis is currently under way
* css, Layout: Similarly, the layout of elements (grid, margins, padding) should be refactored through mixins and functions to ensure a better management of layout
* TDD: All Unit tests are working and can be run via Karma. They only relate to the main functionality within Services and Controllers - these being the most critical and bug prone parts of the app
* BDD: Protractor tests were originally written (and passed) but were then left behind, I am in the process of rewriting them
* Angular Services: These could probably do with a bit more logic taken away from the controllers. In general this app does not need a lot of logic / calculations, so that is ok in this particular case
* Automation: The Grunt tasks could probably be more granular and configured. Again, this is due to me just setting them up and then being happy with running them as all is working well
* Angular Controllers (app design): Some logic should be decoupled in certain areas and refactored to its own controller(s). This is particularly true for the Header Controller - its logic being duplicated across the different page controllers that make use of the Header menu functionality. THis should be refactored to a Menu controller and the part which need to be shared with other controllers made available through some form of Event management (subscribers)