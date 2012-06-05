
    /**
     * Hta manager
     *
     * Build a HTA for some URL
     *
     * @author SPSA
     * @version 1.0
     * @copyright Copyright 2009, SPSA
     */

    function copyToClipboard(text) {
        $.clipboardReady(function(){
            $.clipboard(text);
            flash("copied to clipboard");
        }, { debug: true } );
    }

    function copyHTA(e, name) {
        var url = 'http://' + window.location.href.split(/\/+/g)[1];
        url += '/gg5052661/projects/hta-manager/controller.php?load=1&name=' + name.replace(' ', '+');
        if (e.ctrlKey) {
            flash(url);
        } else {
            copyToClipboard(url);
        }
    }

    function deleteHTA(e, name) {
        if (confirm('Are you sure you want to delete "' + name + '"?')) {
            $.post("db.php", { op : 'delete', name : name }, function() {
                $(e).parent().fadeOut("slow");
            });
        }
    }

    function flash(msg) {

        var $flash = $("#flash").html(msg).fadeIn(400);

        setTimeout(function() {
            $flash.fadeOut(500, function() {
                $flash.html("").hide();
            });
        }, 3000);

    }

    function launchHTA(e, name) {
        window.location = 'controller.php?load=1&name=' + name.replace(' ', '+');
        /* Load using the mod_rewrite hack */
        //window.location = 'load/' + name;
    }

    function fetchHTAList() {

        $("#htaInfo").html('');
        $.getJSON("db.php?op=list", { op : 'list' }, function(data) {
            var html = [];
            $.each(data, function(item, hta) {
                html.push("<div id='" + hta.name + "' class='hover'>");
                html.push("<div class='span5'>");
                html.push(" <img style='height: 24px' src='http://tpscope/gg5052661/icons/" + ((hta.graphic === "") ? 'docs.ico' : hta.graphic) + "' onclick='javascript:launchHTA(this, \"" + hta.name + "\")'  /> ");
                html.push("<span style='font-size: small' class='label warning'>" + hta.name + "</span>");
                html.push("</div>");
                html.push(" <a href='hta://" + hta.url.replace('http://', '') + "?title=" + encodeURI(hta.name) + "&icon=http://tpscope/gg5052661/icons/" + hta.graphic + "'  class='btn success icon fullscreen'>hta://</a> ");
                html.push("<input title='" + hta.url + "' type='text' class='input-large span7' value='" + hta.url + "' />");
                html.push(" <a class='btn small danger icon remove' onclick='deleteHTA(this, \"" + hta.name + "\")' src='graphics/delete.png' alt='delete'>Delete</a>");
                html.push(" <a class='btn small info' onclick='copyHTA(this, \"" + hta.name + "\")' src='graphics/copy.png' alt='copy'>Copy</a>");
                html.push("</div>");
            });
            $(html.join('')).appendTo("#htaInfo");
        });
    }

    $(document).ready(function() {

        $('#runbutton').click(function() {
            window.location = 'controller.php?' + $("#mainForm").serialize();
        });

        $('#savebutton').click(function() {
            $.post("db.php", $("#mainForm").serialize() + '&op=save', function() {
                fetchHTAList();
                flash('saved successfully!');
            });
        });

        $('#showbutton').click(function() {
            $.post("controller.php", $("#mainForm").serialize(), function(data) {
                $('#showCode').dialog("open");
                $("#codeBox").val(data);
            });
        });

        $('#copybutton').click(function(e) {
            var url = 'http://' + window.location.href.split(/\/+/g)[1];
            url += '/gg5052661/projects/hta-manager/controller.php?' + $("#mainForm").serialize();
            copyToClipboard(url);
        });


        $('#showcode').dialog({
            autoOpen: false,
            modal: true,
            title: 'add hta',
            resizable: true,
            width: 600
        });

        $('#add').dialog({
            autoOpen: false,
            modal: true,
            title: 'add hta',
            resizable: true,
            width: 600,
            close: function(){
                $('.inputField', $('#add')).val("");
            },
            buttons:{
                "Close":function(){
                    $(this).dialog("close");
                },
                "Add":function(){
                    $.post("db.php", $("#mainForm").serialize() + '&op=save', function() {
                        $("#add").dialog("close");
                        fetchHTAList();
                        flash('saved successfully!');
                    });
                }
            }
        });

        $('#addhta').click(function() {
            $('#add').dialog("open");
        });

        //fetchHTAList();

        $("input[type=text]").focus(function () {
            $(this).addClass("focus");
        }).blur(function() {
            $(this).removeClass("focus");
        });

    });
