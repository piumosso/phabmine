Phabmine
========

Phabmine is Redmine plugin that integrates wth Phabricator and allows to check issue related commits statuses from issue view.

## Installaion
1. `cd redmine/apps/dir/`
2. `git clone git@github.com:Melevir/phabmine.git`
3. [Install Phabricator Arcanist] (http://www.phabricator.com/docs/phabricator/article/Arcanist_User_Guide.html#installing-arcanist), run `arc install-certificate` and follow instructions. You must have `~/.arcrc` after this step.
4. Create a link to `.arcrc` file at `/redmine/apps/dir/phabricator/` with `ln -s /home/%username%/.arcrc` in phabricator directory.
5. Reload redmine.

## FAQ
 - __I don't want to clutter up my server with Phabricator Arcanist, PHP, etc. What shoud I do to run Phabmine?__

   The point of step 3 of installation guide is to get `.arcrc` file - this is where Phabricator Conduit's certificate stored.
   You can create the file at any computer and then just copy it to server with Redmine.
 - __Is Phabmine stable? Can I safely use it?__

   No! The plugin is under development. Production usage is strongly not recommended.
