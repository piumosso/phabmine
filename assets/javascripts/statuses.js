$(function(){
    var $phabricator_audit_info = $('#phabricator_audit_info'),
        el = $('#phabricator_audit_info').data('statuses'),
        reg = /r([A-Z0-9]+)([a-z0-9]{40})/,
        change_url = $phabricator_audit_info.data('change-url'),
        project_sid = $phabricator_audit_info.data('project-sid'),
        show_commit_branches = $phabricator_audit_info.data('show-commits-branches'),
        show_tickets_branches = $phabricator_audit_info.data('show-tickets-branches'),
        el_length = Object.keys(el).length,
        commits_counter = 1;
    $.each(el, function(key, value){
        var commit_id = key.replace(reg,'$2'),
            $rev_url = $('a[href*=\"/revisions/' + commit_id + '\"]'),
            show_final_branches = commits_counter == el_length;
        $rev_url.before('<span class=\"audit_info ' + value['status'] + '\"></span>');
        if (show_commit_branches || show_tickets_branches){
            get_and_fill_commit_branches(project_sid, commit_id, $rev_url, show_commit_branches);
        }
        if (show_final_branches && show_tickets_branches){
            get_and_show_final_branch();
        }
        if(change_url && value['url']){
            $rev_url.attr('href', value['url']).attr('target', 'blank');
        };
        commits_counter += 1;
    })
});


function get_and_fill_commit_branches(project_sid, commit_id, $rev_url, to_fill){
    $branches_storage = $('#phabricator_audit_info')
    $.ajax({
        url: '/phabmine/'+ project_sid + '/commit/' + commit_id + '/branches/',
        async: false,
    }).then(function(data){
        data = $.parseJSON(data);
        if(to_fill){
            fill_branches($rev_url, data);
        }
        old_data = $branches_storage.data('branches') || [];
        new_branches = old_data.concat(data);
        $branches_storage.data('branches', new_branches)
    })
}


function fill_branches($rev_url, branches)
{
    $rev_url.parent().siblings('.wiki').after('<div class="branches_info"></div>');    
    var $branches_info = $rev_url.parents('.changeset').find('.branches_info');
    if(branches){
      $.each(branches, function(key, value){
          $branches_info.append('<span class="branch">' + value + '</span>')
      })
    }
}

function get_and_show_final_branch()
{
    var header_text = 'Affected branches',
        $branches_storage = $('#phabricator_audit_info')
        branches = $branches_storage.data('branches')
        unique = $.unique(branches),
        $changesets = $('#issue-changesets');
    
    $changesets.prepend('<h3 id="branches_header">' + header_text + '</h3>');
    var $branches_header = $('#branches_header');
    $branches_header.next().before('<div id="issue_branches"></div>');
    var $issue_branches = $('#issue_branches');

    $.each(unique, function(i, branch){
        $issue_branches.append('<span class="branch">' + branch + '</span>')
    })
}