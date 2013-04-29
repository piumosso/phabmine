$(function(){
    var getAndFillCommitBranches = function(projectSid, commitId, $revUrl, toFill){
        var $info = $('#phabricator_audit_info'),
            oldData, newBranches;

        $.ajax({
            url: '/phabmine/'+ projectSid + '/commit/' + commitId + '/branches/',
            async: false
        }).then(function(data){
                data = $.parseJSON(data);
                if(toFill){
                    fillBranches($revUrl, data);
                }
                oldData = $info.data('branches') || [];
                newBranches = oldData.concat(data);
                $info.data('branches', newBranches)
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
        var headerText = isGitflowProject? 'Instance' : 'Affected branches',
            $info = $('#phabricator_audit_info'),
            unique = $.unique($info.data('branches')),
            projectSid = $info.data('projectSid'),
            $issueBranches,
            elderBranch,
            instanceName;

       $('#issue-changesets')
            .prepend('<h3 id="branches_header">' + headerText + '</h3>');

       $('#branches_header')
            .next()
            .before('<div id="issue_branches"></div>');

        $issueBranches = $('#issue_branches');
        if (isGitflowProject){
            elderBranch = getGitflowElderBranch(unique);
            if(projectSid in instanceBranchMapping){
                instanceName = instanceBranchMapping[projectSid][elderBranch[0]] || '';
            }
            else{
                instanceName = '';
            }
            $issueBranches
                .append(
                    '<div>' +
                        '<a target="_blank" class="elder_branch" href="http://' + instanceName + '">' + instanceName + '</a>' +
                        '<span class="elder_branch_name">' + elderBranch[1] + '</span>' +
                    '</div>'
            );
        }
        else{
            $.each(unique, function(i, branch){
                $issueBranches.append('<span class="branch">' + branch + '</span>')
            })
        }
    };

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
        elLength = Object.keys(el).length,
        commitsCounter = 1,
        commitId, $revUrl, showFinalBranches;

    $.each(el, function(key, value){
        commitId = key.replace(/r([A-Z0-9]+)([a-z0-9]{40})/,'$2');
        $revUrl = $('a[href*=\"/revisions/' + commitId + '\"]');
        showFinalBranches = commitsCounter == elLength;

        $revUrl.before('<span class=\"audit_info ' + value['status'] + '\"></span>');

        if (showCommitBranches || showTicketsBranches){
            getAndFillCommitBranches(
                $info.data('project-sid'),
                commitId,
                $revUrl,
                showCommitBranches
            );
        }
        if (showFinalBranches && showTicketsBranches){
            getAndShowFinalBranch($info.data('instanceBranchMapping'), $info.data('isGitflowProject'));
        }

        if($info.data('change-url') && value['url']){
            $revUrl
                .attr('href', value['url'])
                .attr('target', '_blank');
        }

        commitsCounter += 1;
    });
});