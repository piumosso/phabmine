# encoding: utf-8
require_relative '../../ruby-phabricator/shortcuts.rb'


class BranchesController < ApplicationController
  unloadable
  respond_to :json, :html

  def get
    commit_id = params[:sid]
    project_sid = params[:project_sid]
    commit_sid = get_commit_sids(project_sid, [commit_id])[0]
    arcrc_path = ENV['PHABMINE_ARCRC_PATH'] || File.expand_path('./plugins/phabmine/.arcrc')  # FIXME: not DRY
    settings = get_plugin_settings
    login = settings['phabricator_login']
    auth_cookie = settings['phabricator_auth_cookie']

#    branches_info = get_commits_branches project_sid, [commit_id], arcrc_path, login, auth_cookie

    # uncomment for debug
    branches_info = {commit_sid => ['dev']}

    respond_to do |format|
      format.html { render :json => branches_info[commit_sid].to_json }
    end
  end
end
