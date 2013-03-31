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
    return "<style type=\"text/css\">.in_progress{background-color:gray;}.accepted{background-color:green;}.conserned{background-color:red;}.audit_info{display:inline-block;width:10px;height:10px;border-radius:5px;margin-left:2px;margin-right:5px;}</style>" +
           "<script>$(function(){ var el = $('#phabricator_audit_info').data('statuses');" +
           "var reg = /r([A-Z0-9]+)([a-z0-9]{40})/;" +
           "$.each(el, function(key, value){" +
           "var $rev_url = $('a[href*=\"/revisions/' + key.replace(reg,'$2') + '\"]');" +
           "$rev_url.before('<span class=\"audit_info ' + value['status'] + '\"></span>');" +
           "if(value['url']){$rev_url.attr('href', value['url']).attr('target', 'blank');};" +
           "})});" +
     "</script>" +
           "<div id=\"phabricator_audit_info\"style=\"display:none\"data-statuses='#{statuses}'></div>"
  end
end
