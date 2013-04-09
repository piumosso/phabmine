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

    def get_phabricator_project_slug(redmine_phabricator_project_mapping, redmine_slug)
      if redmine_phabricator_project_mapping.include? redmine_slug
        return redmine_phabricator_project_mapping[redmine_slug]
      else
        return redmine_slug.upcase
      end
    end

    def get_plugin_settings
      settings_info = [
        {'name'=> 'roles_to_hide_phabricator_url', 'default'=> '[]'},
        {'name'=> 'redmine_phabricator_project_mapping', 'default'=> '{}'},
      ]
      settings = {}
      settings_info.each{|param_info|
        raw_param_value = Setting.plugin_phabmine[param_info['name']]
        if raw_param_value.nil? or raw_param_value.empty?
          param_value = JSON.parse param_info['default']
        else
          param_value = JSON.parse raw_param_value
        end
        settings[param_info['name']] = param_value
      }
      settings.default = ''
      return settings
    end

    settings = get_plugin_settings
    roles_to_hide_phabricator_url = settings['roles_to_hide_phabricator_url']
    redmine_phabricator_project_mapping = settings['redmine_phabricator_project_mapping']

    issue = Issue.find(context[:issue])
    user_roles = User.current.roles_for_project(context[:project]).map{|e| e.id}
    show_phabricator_url = (user_roles & roles_to_hide_phabricator_url).empty?
    project_sid = get_phabricator_project_slug(redmine_phabricator_project_mapping, issue.project.identifier)
    commits_data = get_changesets_statuses(issue.changesets.map{|c| c.revision}, project_sid)
    context[:controller].send(:render_to_string, {
      :partial => "/phabmine/statuses",
      :locals => {
        :statuses => commits_data,
        :show_phabricator_url => show_phabricator_url,
      }
    })
  end
end
