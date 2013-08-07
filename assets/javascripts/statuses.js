$(function(){
    var getAndFillCommitBranches = function(projectSid, commitId, $revUrl, toFill){
        var $info = $('#phabricator_audit_info'),
            oldData, newBranches;

        return $.ajax({
            url: '/phabmine/'+ projectSid + '/commit/' + commitId + '/branches/'
        }).then(function(data){
            data = $.parseJSON(data);
            if(toFill){
                fillBranches($revUrl, data);
            }
            oldData = $info.data('branches') || [];
            newBranches = oldData.concat(data);
            $info.data('branches', newBranches);
        })
    };

    var fillBranches = function($revUrl, branches){
        var $branchesInfo;

        $revUrl
            .parent()
            .siblings('.wiki')
            .after('<div class="branches_info"></div>');

        $branchesInfo = $revUrl.parents('.changeset').find('.branches_info');

        if(branches){
            $.each(branches, function(key, value){
                $branchesInfo.append('<span class="branch">' + value + '</span>')
            })
        }
    };

    var getAndShowFinalBranch = function(instanceBranchMapping, isGitflowProject){
        var headerText = isGitflowProject? 'Summary' : 'Affected branches',
            $info = $('#phabricator_audit_info'),
            $issueBranches = $('<div id="issue_branches"></div>');

        if (!$info.data('branches')) {
            return;
        }

        var
            unique = $.unique($info.data('branches')),
            projectSid = $info.data('projectSid'),
            elderBranch,
            instanceName,
            branch_url;


        $('#issue-changesets').prepend($issueBranches);
        $issueBranches.append('<h3 id="branches_header">' + headerText + '</h3>');

        if (isGitflowProject){
            elderBranch = getGitflowElderBranch(unique);
            console.log(elderBranch);
            if (elderBranch[0] == undefined){
                showIssueBranches($issueBranches, unique);
            }
            else{
                branch_url = $info.data('baseRepositoryUrl') + elderBranch[1] + '/';
                if(projectSid in instanceBranchMapping){
                    instanceName = instanceBranchMapping[projectSid][elderBranch[0]] || '';
                }
                else{
                    instanceName = '';
                }

                if(instanceName) {
                    $issueBranches.append(
                            '<div>' +
                                'Test instance: <a target="_blank" class="elder_branch" href="http://' + instanceName + '">' + instanceName + '</a>' +
                            '</div>'
                    );
                }
                $issueBranches.append(
                        '<div>' +                        
                            'Branch: <a target="_blank" class="elder_branch_name" href="' + branch_url + '">' + elderBranch[1] + '</a>' +
                        '</div>'
                );
            }
        }
        else{
            showIssueBranches($issueBranches, unique);
        }
    };

    var showIssueBranches = function($summary_element, branches){
        $.each(branches, function(i, branch){
            $summary_element.append('<span class="branch">' + branch + '</span>')
        })
    }

    var getGitflowElderBranch = function(branches){
        var elderBranch,
            elderBranchType,
            curentElderBranch;

        $(['master', 'hotfix', 'release', 'dev', 'feature'])
            .each(function(i, branchId){
                curentElderBranch = branchesContain(branches, branchId);
                if (curentElderBranch){
                    elderBranch = curentElderBranch;
                    elderBranchType = branchId;
                    return false;
                }
            });

        return [elderBranchType, elderBranch]
    };

    var branchesContain = function(branches, branchId){
        var contain,
            branch;

        $(branches).each(
            function(i, b){
                if(b.substring(0, branchId.length) == branchId){
                    contain = true;
                    branch = b;
                }
            }
        );

        if(contain){
            return branch
        }else{
            return false;
        }
    };


    var $info = $('#phabricator_audit_info'),
        el = $info.data('statuses'),
        showCommitBranches = $info.data('showCommitsBranches'),
        showTicketsBranches = $info.data('showTicketsBranches'),
        commitId, $revUrl,
        requests_array;

    $.each(el, function(key, value){
        // filling commits revisions - no AJAX part
        commitId = key.replace(/r([A-Z0-9]+)([a-z0-9]{40})/,'$2');
        $revUrl = $('a[href*=\"/revisions/' + commitId + '\"]');

        $revUrl.before('<span class=\"audit_info ' + value['status'] + '\"></span>');
    });

    requests_array = new Array;

    $.each(el, function(key, value){
        // getting commits branches
        commitId = key.replace(/r([A-Z0-9]+)([a-z0-9]{40})/,'$2');
        $revUrl = $('a[href*=\"/revisions/' + commitId + '\"]');

        if (showCommitBranches || showTicketsBranches){
            requests_array.push(getAndFillCommitBranches(
                $info.data('project-sid'),
                commitId,
                $revUrl,
                showCommitBranches
            ));
        }

        if($info.data('change-url') && value['url']){
            $revUrl
                .attr('href', value['url'])
                .attr('target', '_blank');
        }

    });

    $.when.apply({}, requests_array).then(function(){
        if ( showTicketsBranches){
            getAndShowFinalBranch($info.data('instanceBranchMapping'), $info.data('isGitflowProject'));
        }
    });
});
