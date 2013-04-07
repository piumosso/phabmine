# encoding: utf-8
require 'json'
require_relative '../ruby-phabricator/shortcuts.rb'


class PollsHookListener < Redmine::Hook::ViewListener
  def view_issues_show_details_bottom(context={} )
    def get_changesets_statuses(changesets, project_sid)
      # Ask Phabricator for statuses
      if changesets.empty?
  return {}
      else
        arcrc_path = ENV['PHABMINE_ARCRC_PATH'] || File.expand_path('./plugins/phabmine/.arcrc')
        data = get_commit_status project_sid, changesets, arcrc_path

        # uncomment for debug
#        data = {'b84305a4' => {'status'=> 'accepted', 'url'=> 'example.com'}}
      end
      return data.to_json
    end

    def get_phabricator_project_slug(redmine_slug)
      redmine_phabricator_project_mapping = {
          "0560ru" => "PAT",
          "fut2" => "FUT",
      }
      if redmine_phabricator_project_mapping.include? redmine_slug
        return redmine_phabricator_project_mapping[redmine_slug]
      else
        return redmine_slug.upcase
      end
    end

    issue = Issue.find(context[:issue])
    project_sid = get_phabricator_project_slug(issue.project.identifier)
    statuses = get_changesets_statuses(issue.changesets.map{|c| c.revision}, project_sid)
    context[:controller].send(:render_to_string, {
      :partial => "/phabmine/statuses",
      :locals => {:statuses => statuses}
    })
  end
end
