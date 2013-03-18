require 'redmine'

require_dependency 'phabricator_audits_hook_listener.rb'

Redmine::Plugin.register :redmine_phabricator_audits do
  name 'Redmine Phabricator Audits plugin'
  author 'Ilya Lebedev'
  description 'Phabricator and Redmine integration'
  version '0.0.1'
  url 'https://github.com/futurecolors/phabmine'
  author_url 'https://github.com/melevir'
end
